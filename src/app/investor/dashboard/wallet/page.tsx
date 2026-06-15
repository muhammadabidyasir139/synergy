"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./page.module.css";

type Action = "deposit" | "withdraw";

interface TxItem {
  id: string;
  type: string;
  description: string;
  amount: number;
  status: string;
  createdAt: string;
}

function getInvestorId() {
  if (typeof window === "undefined") return "";
  try { return JSON.parse(sessionStorage.getItem("synergy_investor_session") ?? "{}").investorProfileId ?? ""; }
  catch { return ""; }
}

const formatRp = (n: number) => "Rp " + Math.abs(n).toLocaleString("id-ID");

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [lockedBalance, setLockedBalance] = useState(0);
  const [kycStatus, setKycStatus] = useState("PENDING");
  const [txHistory, setTxHistory] = useState<TxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [action, setAction] = useState<Action>("deposit");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadWallet = useCallback(async () => {
    const id = getInvestorId();
    if (!id) return;
    try {
      const res = await fetch("/api/investor/wallet", { headers: { "x-investor-id": id } });
      const d = await res.json();
      setBalance(d.balance ?? 0);
      setLockedBalance(d.lockedBalance ?? 0);
      setKycStatus(d.kycStatus ?? "PENDING");
      setTxHistory(d.transactions ?? []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadWallet(); }, [loadWallet]);

  const amountNum = parseInt(amount.replace(/\D/g, "")) || 0;
  const available = balance - lockedBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (amountNum < 10000) { setError("Minimal Rp 10.000"); return; }
    if (action === "withdraw" && amountNum > available) { setError("Saldo tersedia tidak mencukupi."); return; }
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError("");
    const id = getInvestorId();
    try {
      const endpoint = action === "deposit" ? "/api/investor/wallet/deposit" : "/api/investor/wallet/withdraw";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-investor-id": id },
        body: JSON.stringify(
          action === "deposit"
            ? { amount: amountNum, paymentMethod: "Bank Transfer" }
            : { amount: amountNum, bankAccount: "Rekening Terdaftar" }
        ),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Transaksi gagal."); setStep("form"); return; }
      setBalance(data.newBalance);
      await loadWallet();
      setStep("success");
    } catch {
      setError("Tidak dapat terhubung ke server.");
      setStep("form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => { setAmount(""); setStep("form"); setError(""); };

  if (isLoading) return <div style={{ padding: "2rem" }}>Memuat data wallet...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.walletCard}>
        <div className={styles.walletCardBg}></div>
        <div className={styles.walletTop}>
          <div>
            <p className={styles.walletLabel}>Saldo Tersedia</p>
            <p className={styles.walletBalance}>{formatRp(available)}</p>
          </div>
          <div className={styles.walletIcon}>💳</div>
        </div>
        <div className={styles.walletFooter}>
          <div><p className={styles.footerLabel}>Total Saldo</p><p className={styles.footerVal}>{formatRp(balance)}</p></div>
          <div><p className={styles.footerLabel}>Saldo Terkunci</p><p className={styles.footerVal} style={{ color: "#fbbf24" }}>{formatRp(lockedBalance)}</p></div>
          <div><p className={styles.footerLabel}>Status KYC</p><p className={styles.footerVal} style={{ color: "#34d399" }}>{kycStatus === "APPROVED" ? "✅ Terverifikasi" : kycStatus}</p></div>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.formCard}>
          {step === "form" && (
            <>
              <div className={styles.actionTabs}>
                <button className={`${styles.actionTab} ${action === "deposit" ? styles.actionTabActive : ""}`} onClick={() => setAction("deposit")}>📥 Deposit</button>
                <button className={`${styles.actionTab} ${action === "withdraw" ? styles.actionTabActive : ""}`} onClick={() => setAction("withdraw")}>📤 Withdraw</button>
              </div>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>{action === "deposit" ? "Jumlah Deposit (Rp)" : "Jumlah Penarikan (Rp)"}</label>
                  <div className={styles.amountInput}>
                    <span className={styles.prefix}>Rp</span>
                    <input type="text" className={styles.input} placeholder="10,000,000"
                      value={amountNum ? amountNum.toLocaleString("id-ID") : ""}
                      onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} required />
                  </div>
                  {action === "withdraw" && <p className={styles.hint}>Saldo tersedia: <strong>{formatRp(available)}</strong></p>}
                  {action === "deposit" && <p className={styles.hint}>Minimal deposit: Rp 10.000 • Transfer via Bank / E-Wallet</p>}
                </div>
                {action === "deposit" && (
                  <div className={styles.payMethods}>
                    <p className={styles.payLabel}>Pilih Metode Pembayaran</p>
                    <div className={styles.payBtns}>
                      {["BCA", "Mandiri", "GoPay", "OVO"].map((m) => <div key={m} className={styles.payBtn}>{m}</div>)}
                    </div>
                  </div>
                )}
                {action === "withdraw" && (
                  <div className={styles.field}>
                    <label className={styles.label}>Rekening Tujuan</label>
                    <input type="text" className={styles.inputField} defaultValue="BCA 1234-5678-9012 (Rekening Terdaftar)" readOnly />
                  </div>
                )}
                {error && <p style={{ color: "red", fontSize: "0.875rem" }}>{error}</p>}
                <button type="submit" className={styles.submitBtn}>{action === "deposit" ? "Lanjutkan Deposit →" : "Lanjutkan Penarikan →"}</button>
              </form>
            </>
          )}

          {step === "confirm" && (
            <div className={styles.confirmBox}>
              <h3 className={styles.confirmTitle}>Konfirmasi {action === "deposit" ? "Deposit" : "Penarikan"}</h3>
              <div className={styles.confirmDetail}>
                <div className={styles.confirmRow}><span>Jenis</span><span>{action === "deposit" ? "Deposit" : "Penarikan"}</span></div>
                <div className={styles.confirmRow}><span>Nominal</span><strong>{formatRp(amountNum)}</strong></div>
                <div className={styles.confirmRow}><span>Saldo Setelah</span><span>{formatRp(action === "deposit" ? balance + amountNum : balance - amountNum)}</span></div>
              </div>
              {error && <p style={{ color: "red", fontSize: "0.875rem" }}>{error}</p>}
              <div className={styles.confirmActions}>
                <button className={styles.cancelBtn} onClick={resetForm}>Batal</button>
                <button className={styles.submitBtn} disabled={isSubmitting} onClick={handleConfirm}>
                  {isSubmitting ? "Memproses..." : "✅ Konfirmasi"}
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className={styles.successBox}>
              <span className={styles.successIcon}>🎉</span>
              <h3>{action === "deposit" ? "Deposit Berhasil!" : "Penarikan Berhasil!"}</h3>
              <p>{formatRp(amountNum)} {action === "deposit" ? "telah ditambahkan ke wallet Anda." : "sedang diproses ke rekening Anda."}</p>
              <button className={styles.submitBtn} onClick={resetForm}>Kembali ke Wallet</button>
            </div>
          )}
        </div>

        <div className={styles.historyCard}>
          <h3 className={styles.historyTitle}>Riwayat Saldo Terkini</h3>
          <div className={styles.historyList}>
            {txHistory.slice(0, 5).map((tx) => {
              const isIn = tx.type === "DEPOSIT" || tx.type === "PROFIT_SHARING";
              return (
                <div key={tx.id} className={styles.historyItem}>
                  <div className={`${styles.historyIcon} ${isIn ? styles.iconIn : styles.iconOut}`}>{isIn ? "📥" : "📤"}</div>
                  <div className={styles.historyInfo}>
                    <p className={styles.historyType}>{tx.description}</p>
                    <p className={styles.historyDate}>{new Date(tx.createdAt).toLocaleDateString("id-ID")}</p>
                  </div>
                  <span className={`${styles.historyAmount} ${isIn ? styles.amountIn : styles.amountOut}`}>
                    {isIn ? "+" : "-"} {formatRp(tx.amount)}
                  </span>
                </div>
              );
            })}
            {txHistory.length === 0 && <p style={{ padding: "1rem", color: "var(--text-muted)" }}>Belum ada transaksi.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

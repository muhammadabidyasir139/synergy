"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import styles from "./page.module.css";
import { CreditCard, ArrowDownTray, ArrowUpTray, CheckCircle, ArrowRight, Sparkles } from "@/components/icons";

type Action = "deposit" | "withdraw";

interface TxItem {
  id: string;
  type: string;
  description: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface DepositResult {
  invoiceNumber: string;
  paymentUrl: string | null;
  virtualAccountNumber: string | null;
  expiredAt: string | null;
}

function getInvestorId() {
  if (typeof window === "undefined") return "";
  try { return JSON.parse(sessionStorage.getItem("synergy_investor_session") ?? "{}").investorProfileId ?? ""; }
  catch { return ""; }
}

const formatRp = (n: number) => "Rp " + Math.abs(n).toLocaleString("id-ID");

const VA_BANKS = ["BCA", "MANDIRI", "BNI", "BRI"];

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [lockedBalance, setLockedBalance] = useState(0);
  const [kycStatus, setKycStatus] = useState("PENDING");
  const [txHistory, setTxHistory] = useState<TxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [action, setAction] = useState<Action>("deposit");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BCA");
  const [bankCode, setBankCode] = useState("BCA");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [depositResult, setDepositResult] = useState<DepositResult | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Poll for balance updates while a deposit payment is awaiting confirmation.
  useEffect(() => {
    if (step === "success" && action === "deposit" && depositResult) {
      pollRef.current = setInterval(loadWallet, 5000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [step, action, depositResult, loadWallet]);

  const amountNum = parseInt(amount.replace(/\D/g, "")) || 0;
  const available = balance - lockedBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (amountNum < 10000) { setError("Minimal Rp 10.000"); return; }
    if (action === "withdraw" && amountNum > available) { setError("Saldo tersedia tidak mencukupi."); return; }
    if (action === "withdraw" && (!accountNumber || !accountName)) { setError("Lengkapi detail rekening tujuan."); return; }
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
            ? { amount: amountNum, paymentMethod }
            : { amount: amountNum, bankCode, accountNumber, accountName }
        ),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Transaksi gagal."); setStep("form"); return; }

      if (action === "deposit") {
        setDepositResult({
          invoiceNumber: data.invoiceNumber,
          paymentUrl: data.paymentUrl ?? null,
          virtualAccountNumber: data.virtualAccountNumber ?? null,
          expiredAt: data.expiredAt ?? null,
        });
      } else {
        setBalance(data.newBalance);
      }
      await loadWallet();
      setStep("success");
    } catch {
      setError("Tidak dapat terhubung ke server.");
      setStep("form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount(""); setStep("form"); setError(""); setDepositResult(null);
    setAccountNumber(""); setAccountName("");
  };

  const copyVaNumber = () => {
    if (depositResult?.virtualAccountNumber) {
      navigator.clipboard?.writeText(depositResult.virtualAccountNumber);
    }
  };

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
          <div className={styles.walletIcon}><CreditCard /></div>
        </div>
        <div className={styles.walletFooter}>
          <div><p className={styles.footerLabel}>Total Saldo</p><p className={styles.footerVal}>{formatRp(balance)}</p></div>
          <div><p className={styles.footerLabel}>Saldo Terkunci</p><p className={styles.footerVal} style={{ color: "#fbbf24" }}>{formatRp(lockedBalance)}</p></div>
          <div><p className={styles.footerLabel}>Status KYC</p><p className={styles.footerVal} style={{ color: "#34d399" }}>{kycStatus === "APPROVED" ? <><CheckCircle style={{ verticalAlign: "-0.125em" }} /> Terverifikasi</> : kycStatus}</p></div>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.formCard}>
          {step === "form" && (
            <>
              <div className={styles.actionTabs}>
                <button className={`${styles.actionTab} ${action === "deposit" ? styles.actionTabActive : ""}`} onClick={() => setAction("deposit")}><ArrowDownTray style={{ verticalAlign: "-0.125em" }} /> Deposit</button>
                <button className={`${styles.actionTab} ${action === "withdraw" ? styles.actionTabActive : ""}`} onClick={() => setAction("withdraw")}><ArrowUpTray style={{ verticalAlign: "-0.125em" }} /> Withdraw</button>
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
                  {action === "deposit" && <p className={styles.hint}>Minimal deposit: Rp 10.000 • Virtual Account via DOKU</p>}
                </div>
                {action === "deposit" && (
                  <div className={styles.payMethods}>
                    <p className={styles.payLabel}>Pilih Bank Virtual Account</p>
                    <div className={styles.payBtns}>
                      {VA_BANKS.map((m) => (
                        <div
                          key={m}
                          className={`${styles.payBtn} ${paymentMethod === m ? styles.payBtnActive : ""}`}
                          onClick={() => setPaymentMethod(m)}
                        >
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {action === "withdraw" && (
                  <>
                    <div className={styles.field}>
                      <label className={styles.label}>Bank Tujuan</label>
                      <div className={styles.payBtns}>
                        {VA_BANKS.map((m) => (
                          <div
                            key={m}
                            className={`${styles.payBtn} ${bankCode === m ? styles.payBtnActive : ""}`}
                            onClick={() => setBankCode(m)}
                          >
                            {m}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Nomor Rekening</label>
                      <input type="text" className={styles.inputField} placeholder="1234567890"
                        value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))} required />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Nama Pemilik Rekening</label>
                      <input type="text" className={styles.inputField} placeholder="Sesuai buku rekening"
                        value={accountName} onChange={(e) => setAccountName(e.target.value)} required />
                    </div>
                  </>
                )}
                {error && <p style={{ color: "red", fontSize: "0.875rem" }}>{error}</p>}
                <button type="submit" className={styles.submitBtn}>{action === "deposit" ? <>Lanjutkan Deposit <ArrowRight style={{ verticalAlign: "-0.125em" }} /></> : <>Lanjutkan Penarikan <ArrowRight style={{ verticalAlign: "-0.125em" }} /></>}</button>
              </form>
            </>
          )}

          {step === "confirm" && (
            <div className={styles.confirmBox}>
              <h3 className={styles.confirmTitle}>Konfirmasi {action === "deposit" ? "Deposit" : "Penarikan"}</h3>
              <div className={styles.confirmDetail}>
                <div className={styles.confirmRow}><span>Jenis</span><span>{action === "deposit" ? `Deposit VA ${paymentMethod}` : `Penarikan ke ${bankCode}`}</span></div>
                <div className={styles.confirmRow}><span>Nominal</span><strong>{formatRp(amountNum)}</strong></div>
                {action === "withdraw" && <div className={styles.confirmRow}><span>Rekening</span><span>{accountNumber} a.n. {accountName}</span></div>}
                <div className={styles.confirmRow}><span>Saldo Setelah</span><span>{formatRp(action === "deposit" ? balance + amountNum : balance - amountNum)}</span></div>
              </div>
              {error && <p style={{ color: "red", fontSize: "0.875rem" }}>{error}</p>}
              <div className={styles.confirmActions}>
                <button className={styles.cancelBtn} onClick={resetForm}>Batal</button>
                <button className={styles.submitBtn} disabled={isSubmitting} onClick={handleConfirm}>
                  {isSubmitting ? "Memproses..." : <><CheckCircle style={{ verticalAlign: "-0.125em" }} /> Konfirmasi</>}
                </button>
              </div>
            </div>
          )}

          {step === "success" && action === "deposit" && depositResult && (
            <div className={styles.successBox}>
              <span className={styles.successIcon}><CreditCard /></span>
              <h3>Selesaikan Pembayaran</h3>
              <p>Selesaikan pembayaran untuk menambah saldo wallet Anda. Saldo akan diperbarui otomatis setelah pembayaran dikonfirmasi DOKU.</p>
              {depositResult.virtualAccountNumber && (
                <div className={styles.vaBox}>
                  <span className={styles.hint}>Nomor Virtual Account {paymentMethod}</span>
                  <span className={styles.vaNumber}>{depositResult.virtualAccountNumber}</span>
                  <button className={styles.cancelBtn} onClick={copyVaNumber}>Salin Nomor</button>
                </div>
              )}
              {depositResult.paymentUrl && (
                <a href={depositResult.paymentUrl} target="_blank" rel="noopener noreferrer" className={styles.submitBtn} style={{ textDecoration: "none", textAlign: "center" }}>
                  Lanjutkan Pembayaran <ArrowRight style={{ verticalAlign: "-0.125em" }} />
                </a>
              )}
              <button className={styles.submitBtn} onClick={resetForm}>Kembali ke Wallet</button>
            </div>
          )}

          {step === "success" && action === "withdraw" && (
            <div className={styles.successBox}>
              <span className={styles.successIcon}><Sparkles /></span>
              <h3>Penarikan Diproses</h3>
              <p>{formatRp(amountNum)} sedang diproses ke rekening Anda melalui DOKU.</p>
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
                  <div className={`${styles.historyIcon} ${isIn ? styles.iconIn : styles.iconOut}`}>{isIn ? <ArrowDownTray /> : <ArrowUpTray />}</div>
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

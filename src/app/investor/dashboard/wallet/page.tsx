"use client";

import { useState } from "react";
import styles from "./page.module.css";

type Action = "deposit" | "withdraw";

export default function WalletPage() {
  const [balance, setBalance] = useState(250000000);
  const [lockedBalance] = useState(125000000);
  const [action, setAction] = useState<Action>("deposit");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [txHistory, setTxHistory] = useState([
    { id: "TXN-082", type: "Deposit", amount: 100000000, date: "10 Jan 2026", status: "Selesai" },
    { id: "TXN-071", type: "Deposit", amount: 200000000, date: "20 Des 2025", status: "Selesai" },
    { id: "TXN-065", type: "Penarikan", amount: -25000000, date: "10 Nov 2025", status: "Selesai" },
  ]);

  const amountNum = parseInt(amount.replace(/\D/g, "")) || 0;
  const formatRp = (n: number) => "Rp " + Math.abs(n).toLocaleString("id-ID");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountNum < 10000) return alert("Minimal Rp 10.000");
    if (action === "withdraw" && amountNum > balance - lockedBalance) {
      return alert("Saldo tersedia tidak mencukupi. Saldo terkunci tidak dapat ditarik.");
    }
    setStep("confirm");
  };

  const handleConfirm = () => {
    if (action === "deposit") {
      setBalance((b) => b + amountNum);
    } else {
      setBalance((b) => b - amountNum);
    }
    setTxHistory((prev) => [
      {
        id: "TXN-" + Math.floor(Math.random() * 900 + 100),
        type: action === "deposit" ? "Deposit" : "Penarikan",
        amount: action === "deposit" ? amountNum : -amountNum,
        date: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
        status: "Selesai",
      },
      ...prev,
    ]);
    setStep("success");
  };

  const resetForm = () => {
    setAmount("");
    setStep("form");
  };

  const available = balance - lockedBalance;

  return (
    <div className={styles.page}>
      {/* Wallet Card */}
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
          <div>
            <p className={styles.footerLabel}>Total Saldo</p>
            <p className={styles.footerVal}>{formatRp(balance)}</p>
          </div>
          <div>
            <p className={styles.footerLabel}>Saldo Terkunci</p>
            <p className={styles.footerVal} style={{ color: "#fbbf24" }}>{formatRp(lockedBalance)}</p>
          </div>
          <div>
            <p className={styles.footerLabel}>Status KYC</p>
            <p className={styles.footerVal} style={{ color: "#34d399" }}>✅ Terverifikasi</p>
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Action Form */}
        <div className={styles.formCard}>
          {step === "form" && (
            <>
              <div className={styles.actionTabs}>
                <button
                  className={`${styles.actionTab} ${action === "deposit" ? styles.actionTabActive : ""}`}
                  onClick={() => setAction("deposit")}
                >
                  📥 Deposit
                </button>
                <button
                  className={`${styles.actionTab} ${action === "withdraw" ? styles.actionTabActive : ""}`}
                  onClick={() => setAction("withdraw")}
                >
                  📤 Withdraw
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    {action === "deposit" ? "Jumlah Deposit (Rp)" : "Jumlah Penarikan (Rp)"}
                  </label>
                  <div className={styles.amountInput}>
                    <span className={styles.prefix}>Rp</span>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="10,000,000"
                      value={amountNum ? amountNum.toLocaleString("id-ID") : ""}
                      onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                      required
                    />
                  </div>
                  {action === "withdraw" && (
                    <p className={styles.hint}>Saldo tersedia untuk ditarik: <strong>{formatRp(available)}</strong></p>
                  )}
                  {action === "deposit" && (
                    <p className={styles.hint}>Minimal deposit: Rp 10.000 • Transfer via Bank / E-Wallet</p>
                  )}
                </div>

                {action === "deposit" && (
                  <div className={styles.payMethods}>
                    <p className={styles.payLabel}>Pilih Metode Pembayaran</p>
                    <div className={styles.payBtns}>
                      {["BCA", "Mandiri", "GoPay", "OVO"].map((m) => (
                        <div key={m} className={styles.payBtn}>{m}</div>
                      ))}
                    </div>
                  </div>
                )}

                {action === "withdraw" && (
                  <div className={styles.field}>
                    <label className={styles.label}>Rekening Tujuan</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      placeholder="BCA 1234-5678-9012 (a.n. Rahmat Wijaya)"
                      defaultValue="BCA 1234-5678-9012 (a.n. Rahmat Wijaya)"
                      readOnly
                    />
                  </div>
                )}

                <button type="submit" className={styles.submitBtn}>
                  {action === "deposit" ? "Lanjutkan Deposit →" : "Lanjutkan Penarikan →"}
                </button>
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
              <div className={styles.confirmActions}>
                <button className={styles.cancelBtn} onClick={resetForm}>Batal</button>
                <button className={styles.submitBtn} onClick={handleConfirm}>✅ Konfirmasi</button>
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

        {/* Recent Transactions */}
        <div className={styles.historyCard}>
          <h3 className={styles.historyTitle}>Riwayat Saldo Terkini</h3>
          <div className={styles.historyList}>
            {txHistory.slice(0, 5).map((tx) => (
              <div key={tx.id} className={styles.historyItem}>
                <div className={`${styles.historyIcon} ${tx.amount > 0 ? styles.iconIn : styles.iconOut}`}>
                  {tx.amount > 0 ? "📥" : "📤"}
                </div>
                <div className={styles.historyInfo}>
                  <p className={styles.historyType}>{tx.type}</p>
                  <p className={styles.historyDate}>{tx.date}</p>
                </div>
                <span className={`${styles.historyAmount} ${tx.amount > 0 ? styles.amountIn : styles.amountOut}`}>
                  {tx.amount > 0 ? "+" : "-"} {formatRp(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import styles from "../page.module.css";

interface WalletHistory {
  id: string;
  tanggal: string;
  tipe: "Deposit" | "Withdraw" | "Dana Akad" | "Bagi Hasil";
  jumlah: number;
  status: "Selesai" | "Pending";
  ket: string;
}

export default function Wallet() {
  const [saldo] = useState(47260000);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletSaldo, setWalletSaldo] = useState(saldo);

  const [history, setHistory] = useState<WalletHistory[]>([
    { id: "WLT-052", tanggal: "7 Jun 2026", tipe: "Dana Akad", jumlah: 75000000, status: "Pending", ket: "Dana investasi AKD-051 (menunggu TTD)" },
    { id: "WLT-048", tanggal: "5 Jun 2026", tipe: "Bagi Hasil", jumlah: -8040000, status: "Selesai", ket: "Bagi hasil Apr 2026 ke 2 investor" },
    { id: "WLT-044", tanggal: "15 Mei 2026", tipe: "Withdraw", jumlah: -20000000, status: "Selesai", ket: "Penarikan ke rekening BSI" },
    { id: "WLT-040", tanggal: "1 Mei 2026", tipe: "Dana Akad", jumlah: 50000000, status: "Selesai", ket: "Dana investasi putaran 2 – AKD-042" },
    { id: "WLT-036", tanggal: "15 Mar 2026", tipe: "Dana Akad", jumlah: 50000000, status: "Selesai", ket: "Dana investasi awal – AKD-038" },
  ]);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(withdrawAmount.replace(/\D/g, ""));
    if (!amount || amount <= 0 || amount > walletSaldo) return;
    setIsProcessing(true);
    setTimeout(() => {
      setWalletSaldo((prev) => prev - amount);
      const newEntry: WalletHistory = {
        id: `WLT-${Date.now()}`,
        tanggal: new Date().toLocaleDateString("id-ID"),
        tipe: "Withdraw",
        jumlah: -amount,
        status: "Selesai",
        ket: "Penarikan dana ke rekening BSI",
      };
      setHistory((prev) => [newEntry, ...prev]);
      setIsProcessing(false);
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
    }, 2000);
  };

  const quickAmounts = [5000000, 10000000, 20000000, 50000000];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Wallet & Withdraw Dana</h1>
          <p className={styles.subtitle}>
            Kelola saldo wallet UMKM Anda. Penarikan dana akan ditransfer ke rekening bank terdaftar (BSI).
          </p>
        </div>
      </header>

      {/* Wallet Card */}
      <div style={{
        padding: "2rem 2.5rem",
        borderRadius: 24,
        background: "linear-gradient(135deg, #10b981, #059669)",
        color: "#ffffff",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 12px 30px rgba(16,185,129,0.25)",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", right: 60, bottom: -60, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        <div style={{ position: "relative" }}>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, fontWeight: 600, marginBottom: "0.5rem" }}>Saldo Wallet Tersedia</p>
          <p style={{ fontSize: "3rem", fontWeight: 800, letterSpacing: "-1px" }}>
            Rp {walletSaldo.toLocaleString("id-ID")}
          </p>
          <div style={{ display: "flex", gap: "2rem", marginTop: "1.5rem" }}>
            <div>
              <p style={{ fontSize: "0.75rem", opacity: 0.75 }}>Rekening Terdaftar</p>
              <p style={{ fontWeight: 700 }}>BSI – 1234-5678-9012</p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", opacity: 0.75 }}>Status KYC</p>
              <p style={{ fontWeight: 700 }}>✅ Terverifikasi</p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", opacity: 0.75 }}>Blockchain</p>
              <p style={{ fontWeight: 700 }}>⛓️ Sinkron</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1.75rem" }}>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              style={{ background: "#fff", color: "#059669", border: "none", padding: "0.8rem 2rem", borderRadius: 12, fontWeight: 800, cursor: "pointer", fontSize: "0.95rem" }}
            >
              💸 Withdraw Dana
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
        <div className={`${styles.metricCard} glass`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Total Dana Diterima</span>
            <span className={styles.metricIcon}>💵</span>
          </div>
          <div className={styles.metricValue} style={{ color: "#10b981" }}>Rp 175 Jt</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendPositive}>3 akad aktif</span>
          </div>
        </div>
        <div className={`${styles.metricCard} glass`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Total Bagi Hasil Dibayar</span>
            <span className={styles.metricIcon}>🤝</span>
          </div>
          <div className={styles.metricValue} style={{ color: "#ef4444" }}>Rp 16.08 Jt</div>
          <div className={styles.metricFooter}>
            <span style={{ color: "#ef4444", fontWeight: 700 }}>4 invoice lunas</span>
          </div>
        </div>
        <div className={`${styles.metricCard} glass`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Total Withdraw</span>
            <span className={styles.metricIcon}>🏦</span>
          </div>
          <div className={styles.metricValue} style={{ color: "var(--text-color)" }}>Rp 20 Jt</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendText}>ke rekening BSI</span>
          </div>
        </div>
      </div>

      {/* History */}
      <div className={`${styles.tableSection} glass`}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
          <h3 style={{ fontWeight: 800, color: "var(--text-color)" }}>Riwayat Saldo Wallet</h3>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tanggal</th>
                <th>Tipe</th>
                <th>Keterangan</th>
                <th style={{ textAlign: "right" }}>Jumlah</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td style={{ fontFamily: "monospace", color: "var(--text-muted)", fontSize: "0.8rem" }}>{h.id}</td>
                  <td style={{ fontSize: "0.85rem" }}>{h.tanggal}</td>
                  <td>
                    <span className={`${styles.badge} ${
                      h.tipe === "Dana Akad" ? styles.badgeGreen :
                      h.tipe === "Bagi Hasil" ? styles.badgeYellow :
                      h.tipe === "Withdraw" ? styles.badgeBlue :
                      styles.badgePurple
                    }`}>{h.tipe}</span>
                  </td>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{h.ket}</td>
                  <td style={{ textAlign: "right", fontWeight: 800, fontFamily: "monospace", color: h.jumlah > 0 ? "#10b981" : "#ef4444" }}>
                    {h.jumlah > 0 ? "+" : ""}Rp {Math.abs(h.jumlah).toLocaleString("id-ID")}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${h.status === "Selesai" ? styles.badgeGreen : styles.badgeYellow}`}>
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdraw Modal */}
      {isWithdrawOpen && (
        <div className={styles.modalOverlay} onClick={() => !isProcessing && setIsWithdrawOpen(false)}>
          <div className={`${styles.modal} glass`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>💸 Withdraw Dana</h2>
              <button className={styles.closeBtn} onClick={() => !isProcessing && setIsWithdrawOpen(false)}>×</button>
            </div>
            <form onSubmit={handleWithdraw}>
              <div className={styles.modalBody}>
                <div style={{ padding: "1rem 1.25rem", background: "rgba(16,185,129,0.08)", borderRadius: 12, marginBottom: "0.5rem" }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Saldo Tersedia</p>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981" }}>Rp {walletSaldo.toLocaleString("id-ID")}</p>
                </div>

                <div className={styles.inputGroup}>
                  <label>Jumlah Withdraw (Rp)</label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="Masukkan nominal..."
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min={100000}
                    max={walletSaldo}
                    required
                  />
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawAmount(amt.toString())}
                      className={`${styles.btnSm} ${styles.btnSmBlue}`}
                      style={{ border: "none", cursor: "pointer" }}
                    >
                      Rp {(amt / 1000000).toFixed(0)} Jt
                    </button>
                  ))}
                </div>

                <div className={styles.inputGroup}>
                  <label>Tujuan Rekening</label>
                  <input className={styles.input} value="BSI – 1234-5678-9012 (a.n. Ahmad Syarif)" disabled />
                </div>

                <div style={{ padding: "0.75rem 1rem", background: "rgba(245,158,11,0.08)", borderRadius: 10, border: "1px solid rgba(245,158,11,0.2)", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  ⚠️ Withdrawal akan diproses dalam 1x24 jam kerja. Pastikan nomor rekening BSI Anda sudah benar sebelum konfirmasi.
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setIsWithdrawOpen(false)} disabled={isProcessing}>
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !withdrawAmount || parseInt(withdrawAmount) > walletSaldo}
                  className={styles.btnPrimary}
                  style={{ padding: "0.8rem 1.5rem", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}
                >
                  {isProcessing ? "⏳ Memproses..." : "💸 Konfirmasi Withdraw"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "../page.module.css";
import { CheckCircle, Chain, TrendingDown, Banknote, Handshake, Landmark, AlertTriangle, Refresh } from "@/components/icons";

interface WalletHistory {
  id: string;
  tanggal: string;
  tipe: "Deposit" | "Withdraw" | "Dana Akad" | "Bagi Hasil";
  jumlah: number;
  status: "Selesai" | "Pending";
  ket: string;
}

interface WalletData {
  balance: number;
  lockedBalance: number;
  kycStatus: string;
  stats: {
    danaDiterima: number;
    akadAktif: number;
    bagiHasilDibayar: number;
    profitSharingLunasCount: number;
    totalWithdraw: number;
  };
  history: WalletHistory[];
}

const BANKS = ["BSI", "BCA", "MANDIRI", "BNI", "BRI"];

const formatJt = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1000000000) return `Rp ${(n / 1000000000).toFixed(2)} M`;
  return `Rp ${(n / 1000000).toFixed(abs % 1000000 === 0 ? 0 : 2)} Jt`;
};

export default function Wallet() {
  const [data, setData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankCode, setBankCode] = useState("BSI");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState("");

  const loadWallet = useCallback(async () => {
    try {
      const res = await fetch("/api/umkm/wallet");
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Gagal memuat data wallet");
      setData(d);
      setLoadError("");
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Gagal memuat data wallet");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadWallet(); }, [loadWallet]);

  const walletSaldo = data?.balance ?? 0;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const amount = parseInt(withdrawAmount.replace(/\D/g, ""));
    if (!amount || amount < 100000) { setFormError("Minimal withdraw Rp 100.000."); return; }
    if (amount > walletSaldo) { setFormError("Saldo tidak mencukupi."); return; }
    if (!accountNumber || !accountName) { setFormError("Lengkapi detail rekening tujuan."); return; }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/umkm/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, bankCode, accountNumber, accountName }),
      });
      const result = await res.json();
      if (!res.ok) { setFormError(result.error ?? "Penarikan gagal."); return; }

      await loadWallet();
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
      setAccountNumber("");
      setAccountName("");
    } catch {
      setFormError("Tidak dapat terhubung ke server.");
    } finally {
      setIsProcessing(false);
    }
  };

  const quickAmounts = [5000000, 10000000, 20000000, 50000000];

  if (isLoading) return <div style={{ padding: "2rem" }}>Memuat data wallet...</div>;
  if (loadError) return <div style={{ padding: "2rem", color: "#ef4444" }}>{loadError}</div>;
  if (!data) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Wallet & Withdraw Dana</h1>
          <p className={styles.subtitle}>
            Kelola saldo wallet UMKM Anda. Penarikan dana akan ditransfer ke rekening bank tujuan.
          </p>
        </div>
      </header>

      {/* Wallet Card */}
      <div style={{
        padding: "2rem 2.5rem",
        borderRadius: 24,
        background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)",
        color: "#ffffff",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 12px 30px rgba(29,78,216,0.25)",
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
              <p style={{ fontSize: "0.75rem", opacity: 0.75 }}>Saldo Terkunci</p>
              <p style={{ fontWeight: 700 }}>Rp {data.lockedBalance.toLocaleString("id-ID")}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", opacity: 0.75 }}>Status KYC</p>
              <p style={{ fontWeight: 700 }}>
                {data.kycStatus === "APPROVED"
                  ? <><CheckCircle style={{ verticalAlign: "-0.125em" }} /> Terverifikasi</>
                  : data.kycStatus}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", opacity: 0.75 }}>Keamanan</p>
              <p style={{ fontWeight: 700 }}><Chain style={{ verticalAlign: "-0.125em" }} /> Sinkron</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1.75rem" }}>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              style={{ background: "#fff", color: "#0ea5e9", border: "none", padding: "0.8rem 2rem", borderRadius: 12, fontWeight: 800, cursor: "pointer", fontSize: "0.95rem" }}
            >
              <TrendingDown style={{ verticalAlign: "-0.125em" }} /> Withdraw Dana
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
        <div className={`${styles.metricCard} glass`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Total Dana Diterima</span>
            <span className={styles.metricIcon}><Banknote /></span>
          </div>
          <div className={styles.metricValue} style={{ color: "#1d4ed8" }}>{formatJt(data.stats.danaDiterima)}</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendPositive}>{data.stats.akadAktif} akad aktif</span>
          </div>
        </div>
        <div className={`${styles.metricCard} glass`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Total Bagi Hasil Dibayar</span>
            <span className={styles.metricIcon}><Handshake /></span>
          </div>
          <div className={styles.metricValue} style={{ color: "#ef4444" }}>{formatJt(data.stats.bagiHasilDibayar)}</div>
          <div className={styles.metricFooter}>
            <span style={{ color: "#ef4444", fontWeight: 700 }}>{data.stats.profitSharingLunasCount} invoice lunas</span>
          </div>
        </div>
        <div className={`${styles.metricCard} glass`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Total Withdraw</span>
            <span className={styles.metricIcon}><Landmark /></span>
          </div>
          <div className={styles.metricValue} style={{ color: "var(--text-color)" }}>{formatJt(data.stats.totalWithdraw)}</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendText}>ke rekening bank</span>
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
              {data.history.map((h) => (
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
                  <td style={{ textAlign: "right", fontWeight: 800, fontFamily: "monospace", color: h.jumlah > 0 ? "#1d4ed8" : "#ef4444" }}>
                    {h.jumlah > 0 ? "+" : ""}Rp {Math.abs(h.jumlah).toLocaleString("id-ID")}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${h.status === "Selesai" ? styles.badgeGreen : styles.badgeYellow}`}>
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.history.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Belum ada riwayat transaksi.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdraw Modal */}
      {isWithdrawOpen && (
        <div className={styles.modalOverlay} onClick={() => !isProcessing && setIsWithdrawOpen(false)}>
          <div className={`${styles.modal} glass`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2><TrendingDown style={{ verticalAlign: "-0.125em" }} /> Withdraw Dana</h2>
              <button className={styles.closeBtn} onClick={() => !isProcessing && setIsWithdrawOpen(false)}>×</button>
            </div>
            <form onSubmit={handleWithdraw}>
              <div className={styles.modalBody}>
                <div style={{ padding: "1rem 1.25rem", background: "rgba(29,78,216,0.08)", borderRadius: 12, marginBottom: "0.5rem" }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Saldo Tersedia</p>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1d4ed8" }}>Rp {walletSaldo.toLocaleString("id-ID")}</p>
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
                  <label>Bank Tujuan</label>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {BANKS.map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setBankCode(b)}
                        className={`${styles.btnSm} ${bankCode === b ? styles.btnSmBlue : ""}`}
                        style={{ border: "1px solid var(--border-color)", cursor: "pointer" }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Nomor Rekening</label>
                  <input
                    className={styles.input}
                    placeholder="1234567890"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Nama Pemilik Rekening</label>
                  <input
                    className={styles.input}
                    placeholder="Sesuai buku rekening"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                  />
                </div>

                {formError && <p style={{ color: "#ef4444", fontSize: "0.85rem", fontWeight: 600 }}>{formError}</p>}

                <div style={{ padding: "0.75rem 1rem", background: "rgba(245,158,11,0.08)", borderRadius: 10, border: "1px solid rgba(245,158,11,0.2)", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  <AlertTriangle style={{ verticalAlign: "-0.125em" }} /> Withdrawal akan diproses melalui DOKU. Pastikan detail rekening Anda sudah benar sebelum konfirmasi.
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
                  {isProcessing ? (
                    <><Refresh style={{ verticalAlign: "-0.125em" }} /> Memproses...</>
                  ) : (
                    <><TrendingDown style={{ verticalAlign: "-0.125em" }} /> Konfirmasi Withdraw</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

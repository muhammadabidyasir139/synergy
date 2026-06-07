"use client";

import { useState } from "react";
import styles from "../page.module.css";

interface BagiHasil {
  id: string;
  akad: string;
  investor: string;
  periode: string;
  omzet: string;
  bagianInvestor: string;
  bagianUMKM: string;
  jatuhTempo: string;
  status: "Paid" | "Pending" | "Overdue";
}

export default function BagiHasil() {
  const [isConfirming, setIsConfirming] = useState<string | null>(null);

  const [bagiHasilList, setBagiHasilList] = useState<BagiHasil[]>([
    {
      id: "BH-021",
      akad: "AKD-042",
      investor: "Rahmat Wijaya",
      periode: "Mei 2026",
      omzet: "Rp 27.100.000",
      bagianInvestor: "Rp 8.130.000",
      bagianUMKM: "Rp 18.970.000",
      jatuhTempo: "10 Jun 2026",
      status: "Pending",
    },
    {
      id: "BH-018",
      akad: "AKD-038",
      investor: "Ahmad Fauzi",
      periode: "Mei 2026",
      omzet: "Rp 27.100.000",
      bagianInvestor: "Rp 750.000",
      bagianUMKM: "Rp 26.350.000",
      jatuhTempo: "15 Jun 2026",
      status: "Pending",
    },
    {
      id: "BH-015",
      akad: "AKD-042",
      investor: "Rahmat Wijaya",
      periode: "Apr 2026",
      omzet: "Rp 24.300.000",
      bagianInvestor: "Rp 7.290.000",
      bagianUMKM: "Rp 17.010.000",
      jatuhTempo: "10 Mei 2026",
      status: "Paid",
    },
    {
      id: "BH-012",
      akad: "AKD-038",
      investor: "Ahmad Fauzi",
      periode: "Apr 2026",
      omzet: "Rp 24.300.000",
      bagianInvestor: "Rp 750.000",
      bagianUMKM: "Rp 23.550.000",
      jatuhTempo: "15 Mei 2026",
      status: "Paid",
    },
  ]);

  const handleConfirm = (id: string) => {
    setIsConfirming(id);
    setTimeout(() => {
      setBagiHasilList((prev) =>
        prev.map((bh) => bh.id === id ? { ...bh, status: "Paid" } : bh)
      );
      setIsConfirming(null);
    }, 1800);
  };

  const totalPending = bagiHasilList
    .filter((bh) => bh.status === "Pending")
    .reduce((sum, bh) => sum + parseInt(bh.bagianInvestor.replace(/\D/g, "")), 0);

  const totalPaid = bagiHasilList
    .filter((bh) => bh.status === "Paid")
    .reduce((sum, bh) => sum + parseInt(bh.bagianInvestor.replace(/\D/g, "")), 0);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Bagi Hasil & Konfirmasi Pembayaran</h1>
          <p className={styles.subtitle}>
            Kelola dan konfirmasi pembayaran bagi hasil kepada investor sesuai perhitungan smart contract.
          </p>
        </div>
      </header>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
        <div className={`${styles.metricCard} glass`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Menunggu Pembayaran</span>
            <span className={styles.metricIcon}>⏳</span>
          </div>
          <div className={styles.metricValue} style={{ color: "#f59e0b" }}>
            Rp {totalPending.toLocaleString("id-ID")}
          </div>
          <div className={styles.metricFooter}>
            <span style={{ color: "#f59e0b", fontWeight: 700 }}>{bagiHasilList.filter((b) => b.status === "Pending").length} invoice</span>
            <span className={styles.trendText}>belum dikonfirmasi</span>
          </div>
        </div>
        <div className={`${styles.metricCard} glass`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Total Sudah Dibayar</span>
            <span className={styles.metricIcon}>✅</span>
          </div>
          <div className={styles.metricValue} style={{ color: "#10b981" }}>
            Rp {totalPaid.toLocaleString("id-ID")}
          </div>
          <div className={styles.metricFooter}>
            <span className={styles.trendPositive}>{bagiHasilList.filter((b) => b.status === "Paid").length} invoice</span>
            <span className={styles.trendText}>on time</span>
          </div>
        </div>
        <div className={`${styles.metricCard} glass`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Jatuh Tempo Terdekat</span>
            <span className={styles.metricIcon}>📅</span>
          </div>
          <div className={styles.metricValue} style={{ fontSize: "1.25rem" }}>10 Jun 2026</div>
          <div className={styles.metricFooter}>
            <span style={{ color: "#f59e0b", fontWeight: 700 }}>3 hari lagi</span>
            <span className={styles.trendText}>BH-021 / Rahmat W.</span>
          </div>
        </div>
      </div>

      {/* Bagi Hasil Table */}
      <div className={`${styles.tableSection} glass`}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
          <h3 style={{ fontWeight: 800, color: "var(--text-color)" }}>Riwayat Bagi Hasil</h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Pembayaran diproses melalui smart contract yang telah dideploy ke blockchain.
          </p>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Akad</th>
                <th>Investor</th>
                <th>Periode</th>
                <th>Omzet Basis</th>
                <th>Bagian Investor</th>
                <th>Bagian UMKM</th>
                <th>Jatuh Tempo</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {bagiHasilList.map((bh) => (
                <tr key={bh.id}>
                  <td style={{ fontFamily: "monospace", color: "var(--text-muted)" }}>{bh.id}</td>
                  <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{bh.akad}</td>
                  <td style={{ fontWeight: 600 }}>{bh.investor}</td>
                  <td>{bh.periode}</td>
                  <td>{bh.omzet}</td>
                  <td style={{ fontWeight: 700, color: "#ef4444" }}>{bh.bagianInvestor}</td>
                  <td style={{ fontWeight: 700, color: "#10b981" }}>{bh.bagianUMKM}</td>
                  <td style={{ fontSize: "0.85rem", color: bh.status === "Pending" ? "#f59e0b" : "var(--text-muted)" }}>
                    {bh.jatuhTempo}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${
                      bh.status === "Paid" ? styles.badgeGreen :
                      bh.status === "Pending" ? styles.badgeYellow :
                      styles.badgeRed
                    }`}>{bh.status}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {bh.status === "Pending" ? (
                      <button
                        onClick={() => handleConfirm(bh.id)}
                        disabled={isConfirming === bh.id}
                        className={`${styles.btnSm} ${styles.btnSmGreen}`}
                        style={{ border: "none", cursor: "pointer" }}
                      >
                        {isConfirming === bh.id ? "⏳ Memproses..." : "✅ Konfirmasi Bayar"}
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Lunas ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Smart Contract Info */}
      <div className={`${styles.sectionCard} glass`} style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.15)" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <span style={{ fontSize: "2rem" }}>⛓️</span>
          <div>
            <h4 style={{ fontWeight: 800, color: "var(--text-color)", marginBottom: "0.5rem" }}>Cara Kerja Pembayaran Smart Contract</h4>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
              Setelah Anda mengklik <strong>&quot;Konfirmasi Bayar&quot;</strong>, smart contract secara otomatis menghitung dan mentransfer bagian bagi hasil
              ke wallet investor berdasarkan nisbah yang telah disepakati. Transaksi tercatat di blockchain sebagai bukti pembayaran yang
              <strong> immutable</strong> dan transparan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

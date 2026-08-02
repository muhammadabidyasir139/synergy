"use client";

import { useState, useEffect } from "react";
import styles from "../page.module.css";
import { Refresh, CheckCircle, Calendar, Chain, Check } from "@/components/icons";

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
  const [bagiHasilList, setBagiHasilList] = useState<BagiHasil[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/umkm/bagi-hasil")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted = data.map((d: any): BagiHasil => ({
            id: d.id,
            akad: d.akad?.id || "N/A",
            investor: d.investment?.investorProfile?.fullName || "Investor",
            periode: new Date(d.periodStart).toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
            omzet: `Rp ${Number(d.grossRevenue).toLocaleString("id-ID")}`,
            bagianInvestor: `Rp ${Number(d.investorShare).toLocaleString("id-ID")}`,
            bagianUMKM: `Rp ${Number(d.umkmShare).toLocaleString("id-ID")}`,
            jatuhTempo: new Date(d.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
            status: d.status === "PAID" ? "Paid" : d.status === "OVERDUE" ? "Overdue" : "Pending"
          }));
          setBagiHasilList(formatted);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = async (id: string) => {
    setIsConfirming(id);
    try {
      const res = await fetch("/api/umkm/bagi-hasil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "PAID" })
      });
      
      if (res.ok) {
        setBagiHasilList((prev) =>
          prev.map((bh) => bh.id === id ? { ...bh, status: "Paid" } : bh)
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsConfirming(null);
    }
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
            <span className={styles.metricIcon}><Refresh /></span>
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
            <span className={styles.metricIcon}><CheckCircle /></span>
          </div>
          <div className={styles.metricValue} style={{ color: "#1d4ed8" }}>
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
            <span className={styles.metricIcon}><Calendar /></span>
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
                  <td style={{ fontWeight: 700, color: "#1d4ed8" }}>{bh.bagianUMKM}</td>
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
                        {isConfirming === bh.id ? (
                          <><Refresh style={{ verticalAlign: "-0.125em" }} /> Memproses...</>
                        ) : (
                          <><CheckCircle style={{ verticalAlign: "-0.125em" }} /> Konfirmasi Bayar</>
                        )}
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Lunas <Check style={{ verticalAlign: "-0.125em" }} /></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Smart Contract Info */}
      <div className={`${styles.sectionCard} glass`} style={{ background: "rgba(29,78,216,0.04)", border: "1px solid rgba(29,78,216,0.15)" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <span style={{ fontSize: "2rem" }}><Chain /></span>
          <div>
            <h4 style={{ fontWeight: 800, color: "var(--text-color)", marginBottom: "0.5rem" }}>Cara Kerja Pembayaran Bagi Hasil</h4>
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

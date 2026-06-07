"use client";

import { useState } from "react";
import styles from "../page.module.css";

interface Transaksi {
  id: string;
  tanggal: string;
  tipe: "Dana Masuk" | "Bagi Hasil" | "Withdraw" | "Fee Platform";
  keterangan: string;
  jumlah: number;
  status: "Selesai" | "Pending" | "Gagal";
  akad?: string;
}

export default function RiwayatTransaksi() {
  const [periodeFilter, setPeriodeFilter] = useState("all");
  const [tipeFilter, setTipeFilter] = useState("all");
  const [isExporting, setIsExporting] = useState<"pdf" | "excel" | null>(null);

  const transaksiAll: Transaksi[] = [
    { id: "TRX-088", tanggal: "7 Jun 2026", tipe: "Bagi Hasil", keterangan: "Bagi hasil Apr 2026 – AKD-038 / Ahmad Fauzi", jumlah: -750000, status: "Selesai", akad: "AKD-038" },
    { id: "TRX-085", tanggal: "5 Jun 2026", tipe: "Bagi Hasil", keterangan: "Bagi hasil Apr 2026 – AKD-042 / Rahmat Wijaya", jumlah: -7290000, status: "Selesai", akad: "AKD-042" },
    { id: "TRX-079", tanggal: "1 Jun 2026", tipe: "Dana Masuk", keterangan: "Investasi baru – AKD-051 / Siti Rahayu (Musyarakah)", jumlah: 75000000, status: "Pending", akad: "AKD-051" },
    { id: "TRX-072", tanggal: "15 Mei 2026", tipe: "Withdraw", keterangan: "Penarikan dana ke rekening BSI", jumlah: -20000000, status: "Selesai" },
    { id: "TRX-065", tanggal: "1 Mei 2026", tipe: "Dana Masuk", keterangan: "Investasi putaran 2 – AKD-042 / Rahmat Wijaya", jumlah: 50000000, status: "Selesai", akad: "AKD-042" },
    { id: "TRX-058", tanggal: "10 Apr 2026", tipe: "Fee Platform", keterangan: "Fee layanan platform Synergy (0.5%)", jumlah: -500000, status: "Selesai" },
    { id: "TRX-051", tanggal: "1 Apr 2026", tipe: "Dana Masuk", keterangan: "Investasi awal – AKD-042 / Rahmat Wijaya", jumlah: 50000000, status: "Selesai", akad: "AKD-042" },
    { id: "TRX-044", tanggal: "15 Mar 2026", tipe: "Dana Masuk", keterangan: "Investasi awal – AKD-038 / Ahmad Fauzi", jumlah: 50000000, status: "Selesai", akad: "AKD-038" },
  ];

  const filtered = transaksiAll.filter((t) => {
    if (tipeFilter !== "all" && t.tipe !== tipeFilter) return false;
    return true;
  });

  const totalMasuk = filtered.filter((t) => t.jumlah > 0).reduce((s, t) => s + t.jumlah, 0);
  const totalKeluar = filtered.filter((t) => t.jumlah < 0).reduce((s, t) => s + Math.abs(t.jumlah), 0);

  const handleExport = (format: "pdf" | "excel") => {
    setIsExporting(format);
    setTimeout(() => {
      setIsExporting(null);
      alert(`Laporan ${format.toUpperCase()} berhasil diunduh! (Simulasi)`);
    }, 1500);
  };

  const colorByTipe = (tipe: string) => {
    if (tipe === "Dana Masuk") return "#10b981";
    if (tipe === "Bagi Hasil" || tipe === "Withdraw" || tipe === "Fee Platform") return "#ef4444";
    return "var(--text-color)";
  };

  const badgeByTipe = (tipe: string) => {
    if (tipe === "Dana Masuk") return styles.badgeGreen;
    if (tipe === "Bagi Hasil") return styles.badgeYellow;
    if (tipe === "Withdraw") return styles.badgeBlue;
    return styles.badgePurple;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Riwayat Transaksi</h1>
          <p className={styles.subtitle}>
            Semua histori dana masuk, bagi hasil, penarikan, dan fee platform. Dapat dieksport ke PDF atau Excel.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => handleExport("pdf")}
            disabled={!!isExporting}
            style={{ background: "#ef4444", color: "#fff", border: "none", padding: "0.65rem 1.25rem", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: "0.875rem" }}
          >
            {isExporting === "pdf" ? "Mengunduh..." : "📄 Export PDF"}
          </button>
          <button
            onClick={() => handleExport("excel")}
            disabled={!!isExporting}
            className={styles.btnPrimary}
            style={{ padding: "0.65rem 1.25rem", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: "0.875rem" }}
          >
            {isExporting === "excel" ? "Mengunduh..." : "📊 Export Excel"}
          </button>
        </div>
      </header>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
        <div className={`${styles.metricCard} glass`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Total Dana Masuk</span>
            <span className={styles.metricIcon}>💵</span>
          </div>
          <div className={styles.metricValue} style={{ color: "#10b981" }}>
            Rp {(totalMasuk / 1000000).toFixed(1)} Jt
          </div>
        </div>
        <div className={`${styles.metricCard} glass`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Total Dana Keluar</span>
            <span className={styles.metricIcon}>💸</span>
          </div>
          <div className={styles.metricValue} style={{ color: "#ef4444" }}>
            Rp {(totalKeluar / 1000000).toFixed(1)} Jt
          </div>
        </div>
        <div className={`${styles.metricCard} glass`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Saldo Bersih</span>
            <span className={styles.metricIcon}>⚖️</span>
          </div>
          <div className={styles.metricValue} style={{ color: (totalMasuk - totalKeluar) > 0 ? "#10b981" : "#ef4444" }}>
            Rp {((totalMasuk - totalKeluar) / 1000000).toFixed(1)} Jt
          </div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <select
          className={styles.select}
          style={{ width: "auto" }}
          value={tipeFilter}
          onChange={(e) => setTipeFilter(e.target.value)}
        >
          <option value="all">Semua Tipe</option>
          <option value="Dana Masuk">Dana Masuk</option>
          <option value="Bagi Hasil">Bagi Hasil</option>
          <option value="Withdraw">Withdraw</option>
          <option value="Fee Platform">Fee Platform</option>
        </select>
        <select
          className={styles.select}
          style={{ width: "auto" }}
          value={periodeFilter}
          onChange={(e) => setPeriodeFilter(e.target.value)}
        >
          <option value="all">Semua Periode</option>
          <option value="jun">Juni 2026</option>
          <option value="mei">Mei 2026</option>
          <option value="apr">April 2026</option>
          <option value="mar">Maret 2026</option>
        </select>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          {filtered.length} transaksi ditemukan
        </span>
      </div>

      {/* Transaction Table */}
      <div className={`${styles.tableSection} glass`}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Tanggal</th>
                <th>Tipe</th>
                <th>Keterangan</th>
                <th>Akad</th>
                <th style={{ textAlign: "right" }}>Jumlah</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontFamily: "monospace", color: "var(--text-muted)", fontSize: "0.8rem" }}>{t.id}</td>
                  <td style={{ fontSize: "0.85rem" }}>{t.tanggal}</td>
                  <td><span className={`${styles.badge} ${badgeByTipe(t.tipe)}`}>{t.tipe}</span></td>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: 260 }}>{t.keterangan}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--text-muted)" }}>{t.akad || "-"}</td>
                  <td style={{ textAlign: "right", fontWeight: 800, color: colorByTipe(t.tipe), fontFamily: "monospace" }}>
                    {t.jumlah > 0 ? "+" : ""}Rp {Math.abs(t.jumlah).toLocaleString("id-ID")}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${
                      t.status === "Selesai" ? styles.badgeGreen :
                      t.status === "Pending" ? styles.badgeYellow :
                      styles.badgeRed
                    }`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

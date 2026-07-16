"use client";

import { useState, type ReactNode } from "react";
import styles from "./page.module.css";
import { Store, Users, Wallet, BarChart, CheckCircle, AlertOctagon, TrendingUp, Refresh, FileText } from "@/components/icons";

const reportTypes = [
  "Laporan Transaksi Harian",
  "Laporan UMKM Terdaftar",
  "Laporan Investor Aktif",
  "Laporan Pendanaan Terkumpul",
  "Laporan Fraud & Risiko",
];

interface KPI {
  label: string;
  value: string;
  icon: ReactNode;
}

const kpiData: KPI[] = [
  { label: "Total UMKM", value: "1,248", icon: <Store /> },
  { label: "Total Investor", value: "3,562", icon: <Users /> },
  { label: "Dana Terhimpun", value: "Rp 12.4M", icon: <Wallet /> },
  { label: "Transaksi Bulan Ini", value: "8,921", icon: <BarChart /> },
  { label: "Tingkat Keberhasilan", value: "94.2%", icon: <CheckCircle /> },
  { label: "Fraud Terdeteksi", value: "12", icon: <AlertOctagon /> },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState(reportTypes[0]);
  const [dateFrom, setDateFrom] = useState("2026-05-01");
  const [dateTo, setDateTo] = useState("2026-05-30");
  const [exporting, setExporting] = useState(false);

  const handleExport = (format: string) => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert(`${selectedReport} berhasil di-export sebagai ${format}!`);
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}><TrendingUp style={{ verticalAlign: "-0.125em" }} /> Reporting & Export</h1>
      <p className={styles.subtitle}>Ringkasan performa platform dan export laporan</p>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {kpiData.map((kpi, i) => (
          <div key={i} className={styles.kpiCard}>
            <span className={styles.kpiIcon}>{kpi.icon}</span>
            <span className={styles.kpiValue}>{kpi.value}</span>
            <span className={styles.kpiLabel}>{kpi.label}</span>
          </div>
        ))}
      </div>

      {/* Export Controls */}
      <div className={styles.exportPanel}>
        <h2 className={styles.sectionTitle}>Export Laporan</h2>
        <div className={styles.formRow}>
          <label className={styles.label}>Tipe Laporan</label>
          <select
            className={styles.select}
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
          >
            {reportTypes.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className={styles.formRow}>
          <label className={styles.label}>Dari</label>
          <input type="date" className={styles.input} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <label className={styles.label}>Sampai</label>
          <input type="date" className={styles.input} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className={styles.btnRow}>
          <button className={styles.btnPdf} onClick={() => handleExport("PDF")} disabled={exporting}>
            {exporting ? <><Refresh style={{ verticalAlign: "-0.125em" }} /> Exporting...</> : <><FileText style={{ verticalAlign: "-0.125em" }} /> Export PDF</>}
          </button>
          <button className={styles.btnExcel} onClick={() => handleExport("Excel")} disabled={exporting}>
            {exporting ? <><Refresh style={{ verticalAlign: "-0.125em" }} /> Exporting...</> : <><BarChart style={{ verticalAlign: "-0.125em" }} /> Export Excel</>}
          </button>
        </div>
      </div>
    </div>
  );
}

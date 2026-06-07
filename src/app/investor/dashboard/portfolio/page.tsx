"use client";

import { useState } from "react";
import styles from "./page.module.css";

type FilterStatus = "Semua" | "Ongoing" | "Completed" | "Failed";

const investments = [
  { id: "INV-021", umkm: "Toko Sembako Berkah", akad: "Musyarakah", amount: 50000000, profitReceived: 4200000, roi: 8.4, status: "Ongoing" as const, startDate: "01 Jan 2026", endDate: "31 Des 2026", city: "Jakarta", risk: "Low" },
  { id: "INV-019", umkm: "Kopi Nusantara Mandiri", akad: "Murabahah", amount: 75000000, profitReceived: 6750000, roi: 9.0, status: "Ongoing" as const, startDate: "15 Jun 2025", endDate: "14 Des 2025", city: "Bandung", risk: "Low" },
  { id: "INV-015", umkm: "Peternakan Ayam Makmur", akad: "Musyarakah", amount: 30000000, profitReceived: 3630000, roi: 12.1, status: "Completed" as const, startDate: "01 Mar 2025", endDate: "28 Feb 2026", city: "Malang", risk: "Medium" },
  { id: "INV-010", umkm: "Warung Nasi Padang Minang", akad: "Murabahah", amount: 20000000, profitReceived: 0, roi: 0, status: "Failed" as const, startDate: "01 Sep 2024", endDate: "28 Feb 2025", city: "Surabaya", risk: "High" },
];

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function PortfolioPage() {
  const [filter, setFilter] = useState<FilterStatus>("Semua");

  const filtered = filter === "Semua" ? investments : investments.filter((i) => i.status === filter);

  const totalInvested = investments.reduce((a, b) => a + b.amount, 0);
  const totalProfit = investments.reduce((a, b) => a + b.profitReceived, 0);
  const ongoing = investments.filter((i) => i.status === "Ongoing").length;
  const completed = investments.filter((i) => i.status === "Completed").length;

  return (
    <div className={styles.page}>
      {/* Summary Metrics */}
      <div className={styles.metrics}>
        <div className={styles.metricCard}>
          <span className={styles.metricIcon}>📊</span>
          <div>
            <p className={styles.metricVal}>{formatRp(totalInvested)}</p>
            <p className={styles.metricLabel}>Total Diinvestasikan</p>
          </div>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricIcon}>💵</span>
          <div>
            <p className={styles.metricVal} style={{ color: "#10b981" }}>{formatRp(totalProfit)}</p>
            <p className={styles.metricLabel}>Total Profit Diterima</p>
          </div>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricIcon}>🔄</span>
          <div>
            <p className={styles.metricVal}>{ongoing}</p>
            <p className={styles.metricLabel}>Investasi Aktif</p>
          </div>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricIcon}>✅</span>
          <div>
            <p className={styles.metricVal}>{completed}</p>
            <p className={styles.metricLabel}>Investasi Selesai</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        {(["Semua", "Ongoing", "Completed", "Failed"] as FilterStatus[]).map((f) => (
          <button
            key={f}
            className={`${styles.tab} ${filter === f ? styles.tabActive : ""}`}
            onClick={() => setFilter(f)}
          >
            {f} {f !== "Semua" && `(${investments.filter((i) => i.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Investment Cards */}
      <div className={styles.cardList}>
        {filtered.map((inv) => (
          <div key={inv.id} className={styles.invCard}>
            <div className={styles.cardTop}>
              <div>
                <div className={styles.idRow}>
                  <span className={styles.invId}>{inv.id}</span>
                  <span className={`${styles.statusBadge} ${
                    inv.status === "Ongoing" ? styles.statusOngoing :
                    inv.status === "Completed" ? styles.statusCompleted : styles.statusFailed
                  }`}>{inv.status}</span>
                </div>
                <h3 className={styles.umkmName}>{inv.umkm}</h3>
                <p className={styles.umkmMeta}>{inv.city} • {inv.akad} • Risk: {inv.risk}</p>
              </div>
            </div>

            <div className={styles.cardGrid}>
              <div className={styles.cardItem}>
                <span className={styles.itemLabel}>Nominal Investasi</span>
                <span className={styles.itemVal}>{formatRp(inv.amount)}</span>
              </div>
              <div className={styles.cardItem}>
                <span className={styles.itemLabel}>Profit Diterima</span>
                <span className={`${styles.itemVal} ${inv.profitReceived > 0 ? styles.green : styles.red}`}>
                  {inv.profitReceived > 0 ? formatRp(inv.profitReceived) : "–"}
                </span>
              </div>
              <div className={styles.cardItem}>
                <span className={styles.itemLabel}>ROI</span>
                <span className={`${styles.itemVal} ${inv.roi > 0 ? styles.green : styles.red}`}>
                  {inv.roi > 0 ? `+${inv.roi}%` : "–"}
                </span>
              </div>
              <div className={styles.cardItem}>
                <span className={styles.itemLabel}>Periode</span>
                <span className={styles.itemVal}>{inv.startDate} – {inv.endDate}</span>
              </div>
            </div>

            {inv.status === "Ongoing" && (
              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>Progress Profit</span>
                  <span className={styles.progressPct}>{Math.round((inv.profitReceived / (inv.amount * inv.roi / 100)) * 100)}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${Math.min(100, Math.round((inv.profitReceived / (inv.amount * inv.roi / 100)) * 100))}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

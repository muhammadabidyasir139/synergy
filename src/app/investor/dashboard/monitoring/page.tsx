"use client";

import { useState } from "react";
import styles from "./page.module.css";

const umkmList = [
  { id: "INV-021", umkm: "Toko Sembako Berkah", city: "Jakarta" },
  { id: "INV-019", umkm: "Kopi Nusantara Mandiri", city: "Bandung" },
];

const revenueData: Record<string, { month: string; revenue: number }[]> = {
  "INV-021": [
    { month: "Jan", revenue: 18.5 }, { month: "Feb", revenue: 21.2 }, { month: "Mar", revenue: 20.1 },
    { month: "Apr", revenue: 24.3 }, { month: "Mei", revenue: 27.0 }, { month: "Jun", revenue: 25.4 },
  ],
  "INV-019": [
    { month: "Jan", revenue: 12.1 }, { month: "Feb", revenue: 13.8 }, { month: "Mar", revenue: 11.5 },
    { month: "Apr", revenue: 15.2 }, { month: "Mei", revenue: 14.1 }, { month: "Jun", revenue: 16.8 },
  ],
};

const updates: Record<string, { date: string; title: string; body: string; type: "good" | "neutral" | "warn" }[]> = {
  "INV-021": [
    { date: "05 Jun 2026", title: "Omzet Meningkat 12%", body: "Bulan Mei mencatat omzet tertinggi Rp 27 Jt, didukung promosi Eid dan pelanggan tetap.", type: "good" },
    { date: "04 Mei 2026", title: "Laporan Penggunaan Dana Q1", body: "Dana digunakan untuk restocking barang pokok. Stok tersedia untuk 3 bulan ke depan.", type: "neutral" },
  ],
  "INV-019": [
    { date: "01 Jun 2026", title: "Penurunan Omzet 7.6%", body: "Terjadi penurunan karena renovasi gerai. Operasional kembali normal mulai pekan ketiga Mei.", type: "warn" },
    { date: "15 Apr 2026", title: "Ekspansi Menu Baru", body: "Menu es kopi premium diluncurkan, respons pasar sangat positif. Target omzet Jun dinaikkan 20%.", type: "good" },
  ],
};

export default function MonitoringPage() {
  const [selected, setSelected] = useState("INV-021");
  const data = revenueData[selected];
  const maxRev = Math.max(...data.map((d) => d.revenue));
  const upd = updates[selected];
  const selectedUmkm = umkmList.find((u) => u.id === selected)!;
  const lastRevenue = data[data.length - 1].revenue;
  const prevRevenue = data[data.length - 2].revenue;
  const trend = ((lastRevenue - prevRevenue) / prevRevenue) * 100;

  return (
    <div className={styles.page}>
      {/* UMKM Selector */}
      <div className={styles.selectorRow}>
        <span className={styles.selectorLabel}>Pilih UMKM yang Dipantau:</span>
        <div className={styles.selectorBtns}>
          {umkmList.map((u) => (
            <button
              key={u.id}
              className={`${styles.selectorBtn} ${selected === u.id ? styles.selectorBtnActive : ""}`}
              onClick={() => setSelected(u.id)}
            >
              🏢 {u.umkm}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Omzet Terkini (Jun)</span>
          <span className={styles.statVal}>Rp {lastRevenue} Jt</span>
          <span className={trend > 0 ? styles.trendUp : styles.trendDown}>
            {trend > 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}% vs bulan lalu
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Progress Target</span>
          <span className={styles.statVal}>84%</span>
          <span className={styles.trendUp}>On Track</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Update Terakhir</span>
          <span className={styles.statVal}>{upd[0].date}</span>
          <span className={styles.trendNeutral}>Laporan Bulanan</span>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3>Grafik Omzet – {selectedUmkm.umkm} (Juta Rp)</h3>
          <span className={styles.cityTag}>{selectedUmkm.city}</span>
        </div>
        <div className={styles.chart}>
          <div className={styles.chartY}>
            <span>{Math.ceil(maxRev + 2)}</span>
            <span>{Math.ceil((maxRev + 2) / 2)}</span>
            <span>0</span>
          </div>
          {data.map((d) => {
            const h = (d.revenue / (maxRev + 2)) * 100;
            return (
              <div key={d.month} className={styles.barGroup}>
                <div className={styles.bar} style={{ height: `${h}%` }}>
                  <div className={styles.tooltip}>Rp {d.revenue} Jt</div>
                </div>
                <span className={styles.barLabel}>{d.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Business Updates */}
      <div className={styles.updatesCard}>
        <h3 className={styles.updatesTitle}>Update Terbaru dari UMKM</h3>
        <div className={styles.updatesList}>
          {upd.map((u, i) => (
            <div key={i} className={`${styles.updateItem} ${u.type === "good" ? styles.updateGood : u.type === "warn" ? styles.updateWarn : styles.updateNeutral}`}>
              <span className={styles.updateIcon}>
                {u.type === "good" ? "📈" : u.type === "warn" ? "⚠️" : "📋"}
              </span>
              <div>
                <p className={styles.updateTitle}>{u.title}</p>
                <p className={styles.updateDate}>{u.date}</p>
                <p className={styles.updateBody}>{u.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

interface MonitoringData {
  investmentId: string;
  umkmProfileId: string;
  businessName: string;
  city: string;
  targetProgress: number;
  revenueChart: { month: string; revenue: number }[];
  updates: { date: string; title: string; body: string; revenue: number }[];
}

function getInvestorId() {
  if (typeof window === "undefined") return "";
  try { return JSON.parse(sessionStorage.getItem("synergy_investor_session") ?? "{}").investorProfileId ?? ""; }
  catch { return ""; }
}

export default function MonitoringPage() {
  const [data, setData] = useState<MonitoringData[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = getInvestorId();
    if (!id) return;
    fetch("/api/investor/monitoring", { headers: { "x-investor-id": id } })
      .then((r) => r.json())
      .then((d: MonitoringData[]) => {
        setData(d);
        if (d.length > 0) setSelected(d[0].investmentId);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const current = data.find((d) => d.investmentId === selected);

  if (isLoading) return <div style={{ padding: "2rem" }}>Memuat data monitoring...</div>;

  if (data.length === 0) return (
    <div style={{ padding: "2rem" }}>
      <p>Anda belum memiliki investasi aktif untuk dipantau.</p>
    </div>
  );

  if (!current) return null;

  const chartData = current.revenueChart;
  const maxRev = Math.max(...chartData.map((d) => d.revenue), 1);
  const lastRev = chartData[chartData.length - 1]?.revenue ?? 0;
  const prevRev = chartData[chartData.length - 2]?.revenue ?? lastRev;
  const trend = prevRev > 0 ? ((lastRev - prevRev) / prevRev) * 100 : 0;

  return (
    <div className={styles.page}>
      <div className={styles.selectorRow}>
        <span className={styles.selectorLabel}>Pilih UMKM yang Dipantau:</span>
        <div className={styles.selectorBtns}>
          {data.map((u) => (
            <button key={u.investmentId}
              className={`${styles.selectorBtn} ${selected === u.investmentId ? styles.selectorBtnActive : ""}`}
              onClick={() => setSelected(u.investmentId)}>
              🏢 {u.businessName}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Omzet Terkini</span>
          <span className={styles.statVal}>Rp {lastRev.toFixed(1)} Jt</span>
          <span className={trend > 0 ? styles.trendUp : styles.trendDown}>
            {trend > 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}% vs bulan lalu
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Progress Target</span>
          <span className={styles.statVal}>{current.targetProgress}%</span>
          <span className={current.targetProgress >= 80 ? styles.trendUp : styles.trendNeutral}>
            {current.targetProgress >= 80 ? "On Track" : "Dalam Proses"}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Update Terakhir</span>
          <span className={styles.statVal}>{current.updates[0]?.date ?? "–"}</span>
          <span className={styles.trendNeutral}>Laporan Bulanan</span>
        </div>
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3>Grafik Omzet – {current.businessName} (Juta Rp)</h3>
          <span className={styles.cityTag}>{current.city}</span>
        </div>
        <div className={styles.chart}>
          <div className={styles.chartY}>
            <span>{Math.ceil(maxRev + 2)}</span>
            <span>{Math.ceil((maxRev + 2) / 2)}</span>
            <span>0</span>
          </div>
          {chartData.map((d) => {
            const h = (d.revenue / (maxRev + 2)) * 100;
            return (
              <div key={d.month} className={styles.barGroup}>
                <div className={styles.bar} style={{ height: `${h}%` }}>
                  <div className={styles.tooltip}>Rp {d.revenue.toFixed(1)} Jt</div>
                </div>
                <span className={styles.barLabel}>{d.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.updatesCard}>
        <h3 className={styles.updatesTitle}>Update Terbaru dari UMKM</h3>
        <div className={styles.updatesList}>
          {current.updates.map((u, i) => {
            const isGood = u.revenue > (prevRev ?? 0);
            const type = u.title.toLowerCase().includes("turun") ? "warn" : isGood ? "good" : "neutral";
            return (
              <div key={i} className={`${styles.updateItem} ${type === "good" ? styles.updateGood : type === "warn" ? styles.updateWarn : styles.updateNeutral}`}>
                <span className={styles.updateIcon}>{type === "good" ? "📈" : type === "warn" ? "⚠️" : "📋"}</span>
                <div>
                  <p className={styles.updateTitle}>{u.title}</p>
                  <p className={styles.updateDate}>{u.date}</p>
                  <p className={styles.updateBody}>{u.body}</p>
                </div>
              </div>
            );
          })}
          {current.updates.length === 0 && <p style={{ padding: "1rem", color: "var(--text-muted)" }}>Belum ada update.</p>}
        </div>
      </div>
    </div>
  );
}

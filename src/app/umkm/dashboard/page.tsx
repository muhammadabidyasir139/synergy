"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function UMKMDashboardHome() {
  const [notifications, setNotifications] = useState([
    { id: "N1", type: "success", msg: "Akad Musyarakah #AKD-042 telah ditandatangani oleh investor.", time: "5 menit lalu" },
    { id: "N2", type: "warning", msg: "Periode bagi hasil bulan Juni jatuh tempo dalam 3 hari.", time: "2 jam lalu" },
    { id: "N3", type: "info", msg: "Skor kredit AI Anda diperbarui: 78/100 (Low Risk).", time: "Kemarin" },
  ]);

  const dismissNotif = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const chartData = [
    { month: "Jan", omzet: 18.5 },
    { month: "Feb", omzet: 21.0 },
    { month: "Mar", omzet: 19.8 },
    { month: "Apr", omzet: 24.3 },
    { month: "Mei", omzet: 27.1 },
    { month: "Jun", omzet: 25.6 },
  ];

  const maxOmzet = Math.max(...chartData.map((d) => d.omzet));

  return (
    <div className={styles.dashboardGrid}>

      {/* Welcome Banner */}
      <section className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <h1>Assalamu&apos;alaikum, Toko Berkah Jaya 🏢</h1>
          <p>
            Platform pembiayaan syariah Anda berjalan optimal. Skor AI: <strong>78/100 (Low Risk)</strong> • Akad Aktif: <strong>2 Kontrak</strong> • Dana Diterima: <strong>Rp 150 Juta</strong>
          </p>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Skor Kredit AI</span>
            <span className={styles.metricIcon}>🤖</span>
          </div>
          <div className={styles.metricValue}>78 / 100</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendPositive}>Low Risk</span>
            <span className={styles.trendText}>XGBoost Score</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Dana Diterima</span>
            <span className={styles.metricIcon}>💵</span>
          </div>
          <div className={styles.metricValue}>Rp 150 Jt</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendPositive}>+Rp 50 Jt</span>
            <span className={styles.trendText}>dari investor baru</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Akad Aktif</span>
            <span className={styles.metricIcon}>⛓️</span>
          </div>
          <div className={styles.metricValue}>2</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendPositive}>100%</span>
            <span className={styles.trendText}>Terverifikasi blockchain</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Omzet Bulan Ini</span>
            <span className={styles.metricIcon}>📈</span>
          </div>
          <div className={styles.metricValue}>Rp 25.6 Jt</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendNegative}>-5.9%</span>
            <span className={styles.trendText}>vs bulan lalu</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Bagi Hasil Dibayar</span>
            <span className={styles.metricIcon}>🤝</span>
          </div>
          <div className={styles.metricValue}>Rp 8.4 Jt</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendPositive}>On Time</span>
            <span className={styles.trendText}>Semua lunas</span>
          </div>
        </div>
      </section>

      {/* Chart + Notifications */}
      <section className={styles.dashboardRow}>

        {/* Omzet Chart */}
        <div className={`${styles.sectionCard} glass`}>
          <div className={styles.sectionHeader}>
            <h3>Grafik Omzet Usaha (Juta Rp)</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "#10b981", display: "inline-block" }}></span>
              <span>Omzet Bulanan</span>
            </div>
          </div>

          <div className={styles.chartContainer}>
            <div className={styles.chartLabelY}>
              <span>30</span>
              <span>20</span>
              <span>10</span>
              <span>0</span>
            </div>
            {chartData.map((d) => {
              const h = (d.omzet / 30) * 100;
              return (
                <div key={d.month} className={styles.chartBarWrapper}>
                  <div className={styles.chartBar} style={{ height: `${h}%` }}>
                    <div className={styles.chartTooltip}>Rp {d.omzet} Jt</div>
                  </div>
                  <span className={styles.chartLabelX}>{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        <div className={`${styles.sectionCard} glass`}>
          <div className={styles.sectionHeader}>
            <h3>Notifikasi Terkini</h3>
            <span className={styles.badge} style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
              {notifications.length} Baru
            </span>
          </div>

          <div className={styles.alertList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState} style={{ padding: "2rem" }}>
                <span style={{ fontSize: "2rem" }}>✅</span>
                <p style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}>Tidak ada notifikasi baru.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`${styles.alertItem} ${
                    n.type === "success" ? styles.alertGreen : n.type === "warning" ? styles.alertYellow : ""
                  }`}
                >
                  <div className={styles.alertIconBox}>
                    {n.type === "success" ? "✅" : n.type === "warning" ? "⚠️" : "ℹ️"}
                  </div>
                  <div className={styles.alertContent}>
                    <p className={styles.alertMsg} style={{ fontSize: "0.8rem" }}>{n.msg}</p>
                    <div className={styles.alertMeta}>
                      <span>{n.time}</span>
                      <button
                        onClick={() => dismissNotif(n.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#10b981", fontWeight: 700, fontSize: "0.7rem" }}
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </section>

      {/* Quick Status Table */}
      <section className={`${styles.sectionCard} glass`}>
        <div className={styles.sectionHeader}>
          <div>
            <h3>Status Akad & Pendanaan Aktif</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Pantau semua kontrak dan pendanaan yang sedang berjalan.
            </p>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#10b981", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", padding: "0.4rem 0.8rem", borderRadius: "30px", fontWeight: 700 }}>
            🟢 Blockchain Sync
          </span>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID Akad</th>
                <th>Jenis Akad</th>
                <th>Investor</th>
                <th>Dana</th>
                <th>Bagi Hasil</th>
                <th>Jatuh Tempo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontFamily: "monospace", fontWeight: 700 }}>AKD-042</td>
                <td>Musyarakah</td>
                <td>Rahmat Wijaya</td>
                <td>Rp 100 Jt</td>
                <td>70:30</td>
                <td>30 Des 2026</td>
                <td><span className={`${styles.badge} ${styles.badgeGreen}`}>Aktif</span></td>
              </tr>
              <tr>
                <td style={{ fontFamily: "monospace", fontWeight: 700 }}>AKD-038</td>
                <td>Murabahah</td>
                <td>Ahmad Fauzi</td>
                <td>Rp 50 Jt</td>
                <td>Fixed Margin</td>
                <td>15 Sep 2026</td>
                <td><span className={`${styles.badge} ${styles.badgeYellow}`}>Menunggu Bayar</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

interface Investment {
  id: string;
  umkm: string;
  akad: string;
  amount: string;
  roi: string;
  status: "Ongoing" | "Completed" | "Failed";
  dueDate: string;
}

export default function InvestorDashboardHome() {
  const [notifications, setNotifications] = useState([
    { id: "N1", type: "profit", msg: "Bagi hasil AKD-042 sebesar Rp 3.200.000 telah masuk ke wallet Anda.", time: "1 jam lalu" },
    { id: "N2", type: "warning", msg: "UMKM Kopi Nusantara mengalami penurunan omzet 15%. Pantau sekarang.", time: "3 jam lalu" },
    { id: "N3", type: "info", msg: "Akad baru dari Toko Sembako Berkah siap ditandatangani.", time: "Kemarin" },
  ]);

  const dismissNotif = (id: string) => setNotifications((p) => p.filter((n) => n.id !== id));

  const investments: Investment[] = [
    { id: "INV-021", umkm: "Toko Sembako Berkah", akad: "Musyarakah", amount: "Rp 50 Jt", roi: "+8.4%", status: "Ongoing", dueDate: "30 Des 2026" },
    { id: "INV-019", umkm: "Kopi Nusantara Mandiri", akad: "Murabahah", amount: "Rp 75 Jt", roi: "+6.2%", status: "Ongoing", dueDate: "15 Sep 2026" },
    { id: "INV-015", umkm: "Peternakan Ayam Makmur", akad: "Musyarakah", amount: "Rp 30 Jt", roi: "+12.1%", status: "Completed", dueDate: "01 Mar 2026" },
  ];

  const chartData = [
    { month: "Jan", profit: 4.2 },
    { month: "Feb", profit: 5.8 },
    { month: "Mar", profit: 5.1 },
    { month: "Apr", profit: 7.3 },
    { month: "Mei", profit: 8.9 },
    { month: "Jun", profit: 8.1 },
  ];

  const maxProfit = Math.max(...chartData.map((d) => d.profit));

  return (
    <div className={styles.grid}>
      {/* Welcome Banner */}
      <section className={styles.welcomeBanner}>
        <div className={styles.bannerContent}>
          <h1>Selamat Datang, Rahmat Wijaya 💰</h1>
          <p>
            Portofolio investasi syariah Anda aktif dan berkembang. Total investasi:{" "}
            <strong>Rp 155 Juta</strong> • Total keuntungan:{" "}
            <strong>Rp 22.4 Juta</strong> • UMKM didanai: <strong>3 UMKM</strong>
          </p>
        </div>
        <Link href="/investor/dashboard/explore" className={styles.exploreCta}>
          Explore UMKM Baru →
        </Link>
      </section>

      {/* Metrics */}
      <section className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Total Diinvestasikan</span>
            <span className={styles.metricIcon}>📊</span>
          </div>
          <div className={styles.metricValue}>Rp 155 Jt</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendUp}>+Rp 75 Jt</span>
            <span className={styles.trendText}>tahun ini</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Total Profit Sharing</span>
            <span className={styles.metricIcon}>💵</span>
          </div>
          <div className={styles.metricValue}>Rp 22.4 Jt</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendUp}>+8.2%</span>
            <span className={styles.trendText}>dari bulan lalu</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>UMKM Didanai</span>
            <span className={styles.metricIcon}>🏢</span>
          </div>
          <div className={styles.metricValue}>3</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendUp}>2 Aktif</span>
            <span className={styles.trendText}>1 Selesai</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Akad Blockchain</span>
            <span className={styles.metricIcon}>⛓️</span>
          </div>
          <div className={styles.metricValue}>3</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendUp}>100%</span>
            <span className={styles.trendText}>Terverifikasi</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Saldo Wallet</span>
            <span className={styles.metricIcon}>💳</span>
          </div>
          <div className={styles.metricValue}>Rp 250 Jt</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendUp}>Siap Investasi</span>
            <span className={styles.trendText}>tersedia</span>
          </div>
        </div>
      </section>

      {/* Chart + Notifications */}
      <section className={styles.midRow}>
        {/* Profit Chart */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Grafik Profit Sharing (Juta Rp)</h3>
            <div className={styles.legendDot}>
              <span className={styles.dotBlue}></span>
              <span>Keuntungan Bulanan</span>
            </div>
          </div>
          <div className={styles.chart}>
            <div className={styles.chartY}>
              <span>10</span>
              <span>7</span>
              <span>4</span>
              <span>0</span>
            </div>
            {chartData.map((d) => {
              const h = (d.profit / (maxProfit + 2)) * 100;
              return (
                <div key={d.month} className={styles.barGroup}>
                  <div className={styles.bar} style={{ height: `${h}%` }}>
                    <div className={styles.tooltip}>Rp {d.profit} Jt</div>
                  </div>
                  <span className={styles.barLabel}>{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Notifikasi Penting</h3>
            <span className={styles.badge}>{notifications.length} Baru</span>
          </div>
          <div className={styles.notifList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <span>✅</span>
                <p>Semua notifikasi sudah dibaca.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`${styles.notifItem} ${n.type === "warning" ? styles.notifWarn : n.type === "profit" ? styles.notifProfit : styles.notifInfo}`}
                >
                  <span className={styles.notifIcon}>
                    {n.type === "profit" ? "💰" : n.type === "warning" ? "⚠️" : "ℹ️"}
                  </span>
                  <div className={styles.notifContent}>
                    <p className={styles.notifMsg}>{n.msg}</p>
                    <div className={styles.notifMeta}>
                      <span>{n.time}</span>
                      <button
                        onClick={() => dismissNotif(n.id)}
                        className={styles.dismissBtn}
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

      {/* Investment Table */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3>Investasi Aktif & Riwayat</h3>
            <p className={styles.cardSubtitle}>Status semua investasi Anda dalam satu tampilan.</p>
          </div>
          <Link href="/investor/dashboard/portfolio" className={styles.viewAllBtn}>
            Lihat Semua →
          </Link>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>UMKM</th>
                <th>Jenis Akad</th>
                <th>Nominal</th>
                <th>ROI</th>
                <th>Jatuh Tempo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((inv) => (
                <tr key={inv.id}>
                  <td className={styles.mono}>{inv.id}</td>
                  <td className={styles.bold}>{inv.umkm}</td>
                  <td>{inv.akad}</td>
                  <td>{inv.amount}</td>
                  <td className={styles.roiCell}>{inv.roi}</td>
                  <td>{inv.dueDate}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                      inv.status === "Ongoing" ? styles.statusOngoing :
                      inv.status === "Completed" ? styles.statusCompleted :
                      styles.statusFailed
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import {
  BarChart,
  Banknote,
  Building,
  Chain,
  CreditCard,
  CheckCircle,
  Wallet,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
} from "@/components/icons";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
}
interface Investment {
  id: string;
  umkm: string;
  akad: string;
  amount: number;
  roi: number;
  status: string;
  dueDate: string | null;
}
interface ChartPoint {
  month: string;
  profit: number;
}

interface DashboardData {
  profile: { fullName: string; totalInvested: number; totalProfit: number };
  wallet: { balance: number; lockedBalance: number };
  metrics: { umkmCount: number; akadBlockchain: number };
  investments: Investment[];
  chartData: ChartPoint[];
  notifications: Notification[];
}

function getInvestorId(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = sessionStorage.getItem("synergy_investor_session");
    if (!raw) return "";
    return JSON.parse(raw).investorProfileId ?? "";
  } catch {
    return "";
  }
}

const formatRp = (n: number) => "Rp " + (n / 1_000_000).toFixed(1) + " Jt";

export default function InvestorDashboardHome() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = getInvestorId();
    if (!id) return;
    fetch("/api/investor/dashboard", { headers: { "x-investor-id": id } })
      .then((r) => r.json())
      .then((d: DashboardData) => {
        setData(d);
        setNotifications(d.notifications ?? []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const dismissNotif = async (id: string) => {
    const investorId = getInvestorId();
    setNotifications((p) => p.filter((n) => n.id !== id));
    await fetch(`/api/investor/notifications/${id}/read`, {
      method: "PATCH",
      headers: { "x-investor-id": investorId },
    });
  };

  const maxProfit = data
    ? Math.max(...data.chartData.map((d) => d.profit), 1)
    : 1;

  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "4rem" }}
      >
        <span>Memuat data dashboard...</span>
      </div>
    );
  }

  if (!data)
    return (
      <div style={{ padding: "2rem" }}>Gagal memuat data. Silakan refresh.</div>
    );

  const { profile, wallet, metrics } = data;

  return (
    <div className={styles.grid}>
      {/* Welcome Banner */}
      <section className={styles.welcomeBanner}>
        <div className={styles.bannerContent}>
          <h1>
            Selamat Datang, {profile.fullName}{" "}
            <Wallet style={{ verticalAlign: "-0.125em" }} />
          </h1>
          <p>
            Portfolio investasi syariah Anda aktif dan berkembang. Total
            investasi: <strong>{formatRp(profile.totalInvested)}</strong> •
            Total keuntungan: <strong>{formatRp(profile.totalProfit)}</strong> •
            UMKM didanai: <strong>{metrics.umkmCount} UMKM</strong>
          </p>
        </div>
        <Link href="/investor/dashboard/explore" className={styles.exploreCta}>
          Explore UMKM Baru{" "}
          <ArrowRight style={{ verticalAlign: "-0.125em" }} />
        </Link>
      </section>

      {/* Metrics */}
      <section className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Total Diinvestasikan</span>
            <span className={styles.metricIcon}>
              <BarChart />
            </span>
          </div>
          <div className={styles.metricValue}>
            {formatRp(profile.totalInvested)}
          </div>
          <div className={styles.metricFooter}>
            <span className={styles.trendUp}>Aktif</span>
            <span className={styles.trendText}>portofolio</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Total Profit Sharing</span>
            <span className={styles.metricIcon}>
              <Banknote />
            </span>
          </div>
          <div className={styles.metricValue}>
            {formatRp(profile.totalProfit)}
          </div>
          <div className={styles.metricFooter}>
            <span className={styles.trendUp}>Diterima</span>
            <span className={styles.trendText}>sampai saat ini</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>UMKM Didanai</span>
            <span className={styles.metricIcon}>
              <Building />
            </span>
          </div>
          <div className={styles.metricValue}>{metrics.umkmCount}</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendUp}>{metrics.umkmCount} Aktif</span>
            <span className={styles.trendText}>investasi</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Akad Tersahkan</span>
            <span className={styles.metricIcon}>
              <Chain />
            </span>
          </div>
          <div className={styles.metricValue}>{metrics.akadBlockchain}</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendUp}>Terverifikasi</span>
            <span className={styles.trendText}>on-chain</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Saldo Wallet</span>
            <span className={styles.metricIcon}>
              <CreditCard />
            </span>
          </div>
          <div className={styles.metricValue}>{formatRp(wallet.balance)}</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendUp}>Tersedia</span>
            <span className={styles.trendText}>siap investasi</span>
          </div>
        </div>
      </section>

      {/* Chart + Notifications */}
      <section className={styles.midRow}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Grafik Profit Sharing (Juta Rp)</h3>
            <div className={styles.legendDot}>
              <span className={styles.dotBlue}></span>
              <span>Keuntungan Bulanan</span>
            </div>
          </div>
          {data.chartData.length === 0 ? (
            <p style={{ padding: "1rem", color: "var(--text-muted)" }}>
              Belum ada data profit sharing.
            </p>
          ) : (
            <div className={styles.chart}>
              <div className={styles.chartY}>
                <span>{Math.ceil(maxProfit / 1_000_000 + 2)}</span>
                <span>{Math.ceil(maxProfit / 1_000_000 / 2)}</span>
                <span>0</span>
              </div>
              {data.chartData.map((d) => {
                const h = (d.profit / (maxProfit + 1_000_000)) * 100;
                return (
                  <div key={d.month} className={styles.barGroup}>
                    <div className={styles.bar} style={{ height: `${h}%` }}>
                      <div className={styles.tooltip}>
                        Rp {(d.profit / 1_000_000).toFixed(1)} Jt
                      </div>
                    </div>
                    <span className={styles.barLabel}>{d.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Notifikasi Penting</h3>
            <span className={styles.badge}>{notifications.length} Baru</span>
          </div>
          <div className={styles.notifList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <span>
                  <CheckCircle />
                </span>
                <p>Semua notifikasi sudah dibaca.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const type =
                  n.type === "PROFIT_SHARING"
                    ? "profit"
                    : n.type === "RISK_ALERT"
                      ? "warning"
                      : "info";
                return (
                  <div
                    key={n.id}
                    className={`${styles.notifItem} ${type === "warning" ? styles.notifWarn : type === "profit" ? styles.notifProfit : styles.notifInfo}`}
                  >
                    <span className={styles.notifIcon}>
                      {type === "profit" ? (
                        <Wallet />
                      ) : type === "warning" ? (
                        <AlertTriangle />
                      ) : (
                        <Lightbulb />
                      )}
                    </span>
                    <div className={styles.notifContent}>
                      <p className={styles.notifMsg}>{n.message}</p>
                      <div className={styles.notifMeta}>
                        <span>
                          {new Date(n.createdAt).toLocaleDateString("id-ID")}
                        </span>
                        <button
                          onClick={() => dismissNotif(n.id)}
                          className={styles.dismissBtn}
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Investment Table */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3>Investasi Aktif & Riwayat</h3>
            <p className={styles.cardSubtitle}>
              Status semua investasi Anda dalam satu tampilan.
            </p>
          </div>
          <Link
            href="/investor/dashboard/portfolio"
            className={styles.viewAllBtn}
          >
            Lihat Semua <ArrowRight style={{ verticalAlign: "-0.125em" }} />
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
              {data.investments.map((inv) => (
                <tr key={inv.id}>
                  <td className={styles.mono}>
                    {inv.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className={styles.bold}>{inv.umkm}</td>
                  <td>{inv.akad}</td>
                  <td>{formatRp(inv.amount)}</td>
                  <td className={styles.roiCell}>+{inv.roi}%</td>
                  <td>
                    {inv.dueDate
                      ? new Date(inv.dueDate).toLocaleDateString("id-ID")
                      : "–"}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${inv.status === "ONGOING" ? styles.statusOngoing : inv.status === "COMPLETED" ? styles.statusCompleted : styles.statusFailed}`}
                    >
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

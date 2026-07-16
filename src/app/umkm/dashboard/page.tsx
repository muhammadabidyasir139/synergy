"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { Building, Bot, Banknote, Chain, TrendingUp, Handshake, CheckCircle, AlertTriangle, Lightbulb, Dot } from "@/components/icons";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
}

interface ChartPoint {
  month: string;
  omzet: number;
}

interface AkadRow {
  id: string;
  akadType: string;
  investorName: string;
  principalAmount: number;
  nisbahUmkm: number;
  nisbahInvestor: number;
  endDate: string | null;
  status: string;
}

interface DashboardData {
  profile: { businessName: string; ownerName: string };
  metrics: {
    creditScore: number | null;
    riskLevel: string | null;
    danaDiterima: number;
    akadAktif: number;
    akadTotal: number;
    blockchainVerifiedPct: number;
    omzetBulanIni: number;
    omzetChangePct: number;
    bagiHasilDibayar: number;
  };
  chartData: ChartPoint[];
  notifications: Notification[];
  akads: AkadRow[];
}

const formatRp = (n: number) => "Rp " + (n / 1_000_000).toFixed(1) + " Jt";

const riskLabel: Record<string, string> = {
  LOW: "Low Risk",
  MEDIUM: "Medium Risk",
  HIGH: "High Risk",
};

const akadStatusBadge: Record<string, string> = {
  ACTIVE: "badgeGreen",
  COMPLETED: "badgeBlue",
  PENDING: "badgeYellow",
  CANCELLED: "badgeRed",
};

const akadStatusLabel: Record<string, string> = {
  ACTIVE: "Aktif",
  COMPLETED: "Selesai",
  PENDING: "Menunggu Bayar",
  CANCELLED: "Dibatalkan",
};

export default function UMKMDashboardHome() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/umkm/dashboard")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? "Gagal memuat data");
        return r.json();
      })
      .then((d: DashboardData) => {
        setData(d);
        setNotifications(d.notifications ?? []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const dismissNotif = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/umkm/notifications/${id}/read`, { method: "PATCH" });
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <span>Memuat data dashboard...</span>
      </div>
    );
  }

  if (!data) {
    return <div style={{ padding: "2rem" }}>Gagal memuat data. Silakan refresh.</div>;
  }

  const { profile, metrics } = data;
  const maxOmzet = Math.max(...data.chartData.map((d) => d.omzet), 1);

  return (
    <div className={styles.dashboardGrid}>

      {/* Welcome Banner */}
      <section className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <h1>Assalamu&apos;alaikum, {profile.businessName} <Building style={{ verticalAlign: "-0.125em" }} /></h1>
          <p>
            Platform pembiayaan syariah Anda berjalan optimal. Skor AI:{" "}
            <strong>
              {metrics.creditScore !== null
                ? `${metrics.creditScore}/100 (${riskLabel[metrics.riskLevel ?? ""] ?? metrics.riskLevel})`
                : "Belum tersedia"}
            </strong>{" "}
            • Akad Aktif: <strong>{metrics.akadAktif} Kontrak</strong> • Dana Diterima:{" "}
            <strong>{formatRp(metrics.danaDiterima)}</strong>
          </p>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Skor Kredit AI</span>
            <span className={styles.metricIcon}><Bot /></span>
          </div>
          <div className={styles.metricValue}>
            {metrics.creditScore !== null ? `${metrics.creditScore} / 100` : "– / 100"}
          </div>
          <div className={styles.metricFooter}>
            <span className={styles.trendPositive}>
              {metrics.riskLevel ? riskLabel[metrics.riskLevel] ?? metrics.riskLevel : "Belum dinilai"}
            </span>
            <span className={styles.trendText}>XGBoost Score</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Dana Diterima</span>
            <span className={styles.metricIcon}><Banknote /></span>
          </div>
          <div className={styles.metricValue}>{formatRp(metrics.danaDiterima)}</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendPositive}>{metrics.akadTotal}</span>
            <span className={styles.trendText}>total akad tercatat</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Akad Aktif</span>
            <span className={styles.metricIcon}><Chain /></span>
          </div>
          <div className={styles.metricValue}>{metrics.akadAktif}</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendPositive}>{metrics.blockchainVerifiedPct}%</span>
            <span className={styles.trendText}>Terverifikasi blockchain</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Omzet Bulan Ini</span>
            <span className={styles.metricIcon}><TrendingUp /></span>
          </div>
          <div className={styles.metricValue}>{formatRp(metrics.omzetBulanIni)}</div>
          <div className={styles.metricFooter}>
            <span className={metrics.omzetChangePct >= 0 ? styles.trendPositive : styles.trendNegative}>
              {metrics.omzetChangePct >= 0 ? "+" : ""}
              {metrics.omzetChangePct}%
            </span>
            <span className={styles.trendText}>vs bulan lalu</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Bagi Hasil Dibayar</span>
            <span className={styles.metricIcon}><Handshake /></span>
          </div>
          <div className={styles.metricValue}>{formatRp(metrics.bagiHasilDibayar)}</div>
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
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "#1d4ed8", display: "inline-block" }}></span>
              <span>Omzet Bulanan</span>
            </div>
          </div>

          {data.chartData.length === 0 ? (
            <div className={styles.emptyState} style={{ padding: "2rem" }}>
              <p style={{ color: "var(--text-muted)" }}>Belum ada data omzet. Tambahkan di halaman Data Usaha.</p>
            </div>
          ) : (
            <div className={styles.chartContainer}>
              <div className={styles.chartLabelY}>
                <span>{Math.ceil(maxOmzet / 1_000_000)}</span>
                <span>{Math.ceil(maxOmzet / 1_000_000 / 2)}</span>
                <span>0</span>
              </div>
              {data.chartData.map((d) => {
                const h = (d.omzet / (maxOmzet || 1)) * 100;
                return (
                  <div key={d.month} className={styles.chartBarWrapper}>
                    <div className={styles.chartBar} style={{ height: `${h}%` }}>
                      <div className={styles.chartTooltip}>Rp {(d.omzet / 1_000_000).toFixed(1)} Jt</div>
                    </div>
                    <span className={styles.chartLabelX}>{d.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className={`${styles.sectionCard} glass`}>
          <div className={styles.sectionHeader}>
            <h3>Notifikasi Terkini</h3>
            <span className={styles.badge} style={{ background: "rgba(29,78,216,0.1)", color: "#1d4ed8", border: "1px solid rgba(29,78,216,0.2)" }}>
              {notifications.length} Baru
            </span>
          </div>

          <div className={styles.alertList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState} style={{ padding: "2rem" }}>
                <span style={{ fontSize: "2rem" }}><CheckCircle /></span>
                <p style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}>Tidak ada notifikasi baru.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const isWarning = n.type === "RISK_ALERT" || n.type === "FRAUD_ALERT";
                const isSuccess = n.type === "PROFIT_SHARING" || n.type === "INVESTMENT" || n.type === "AKAD";
                return (
                  <div
                    key={n.id}
                    className={`${styles.alertItem} ${
                      isSuccess ? styles.alertGreen : isWarning ? styles.alertYellow : ""
                    }`}
                  >
                    <div className={styles.alertIconBox}>
                      {isSuccess ? <CheckCircle /> : isWarning ? <AlertTriangle /> : <Lightbulb />}
                    </div>
                    <div className={styles.alertContent}>
                      <p className={styles.alertMsg} style={{ fontSize: "0.8rem" }}>{n.message}</p>
                      <div className={styles.alertMeta}>
                        <span>{new Date(n.createdAt).toLocaleDateString("id-ID")}</span>
                        <button
                          onClick={() => dismissNotif(n.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#1d4ed8", fontWeight: 700, fontSize: "0.7rem" }}
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

      {/* Quick Status Table */}
      <section className={`${styles.sectionCard} glass`}>
        <div className={styles.sectionHeader}>
          <div>
            <h3>Status Akad & Pendanaan Aktif</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Pantau semua kontrak dan pendanaan yang sedang berjalan.
            </p>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#1d4ed8", background: "rgba(29,78,216,0.08)", border: "1px solid rgba(29,78,216,0.2)", padding: "0.4rem 0.8rem", borderRadius: "30px", fontWeight: 700 }}>
            <Dot color="#22c55e" style={{ verticalAlign: "-0.125em" }} /> Blockchain Sync
          </span>
        </div>
        <div className={styles.tableWrapper}>
          {data.akads.length === 0 ? (
            <div className={styles.emptyState} style={{ padding: "2rem" }}>
              <p style={{ color: "var(--text-muted)" }}>Belum ada akad. Ajukan pendanaan untuk memulai.</p>
            </div>
          ) : (
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
                {data.akads.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontFamily: "monospace", fontWeight: 700 }}>
                      {a.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td>{a.akadType === "MUSYARAKAH" ? "Musyarakah" : "Murabahah"}</td>
                    <td>{a.investorName}</td>
                    <td>{formatRp(a.principalAmount)}</td>
                    <td>
                      {a.akadType === "MUSYARAKAH"
                        ? `${a.nisbahInvestor}:${a.nisbahUmkm}`
                        : "Fixed Margin"}
                    </td>
                    <td>{a.endDate ? new Date(a.endDate).toLocaleDateString("id-ID") : "–"}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[akadStatusBadge[a.status] ?? "badgeYellow"]}`}>
                        {akadStatusLabel[a.status] ?? a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

    </div>
  );
}

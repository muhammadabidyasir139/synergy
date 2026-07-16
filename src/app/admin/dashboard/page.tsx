"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import { Building, Wallet, Chain, BarChart, TrendingDown, Shield, AlertOctagon, AlertTriangle, CreditCard, Refresh, Dot } from "@/components/icons";

interface StatsData {
  totalUmkm: number;
  totalInvestor: number;
  totalTransactions: number;
  pendingKyc: number;
  activeAkads: number;
  fraudAlerts: number;
  totalFundingTarget: number;
  totalFundingCollected: number;
  recentUsers: {
    id: string;
    name: string | null;
    role: string;
    status: string;
    kycStatus: string;
    createdAt: string;
  }[];
  recentFraud: {
    id: string;
    alertType: string;
    severity: string;
    status: string;
    userName: string | null;
    createdAt: string;
  }[];
}

export default function AdminDashboardHome() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/admin/stats");
    const data: StatsData = await res.json();
    setStats(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleKycAction = async (userId: string, action: "approve" | "reject") => {
    await fetch(`/api/admin/kyc/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    await fetchStats();
  };

  const handleResolveFraud = async (alertId: string) => {
    await fetch(`/api/admin/fraud/${alertId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "confirm", actionTaken: "Resolved from dashboard" }),
    });
    await fetchStats();
  };

  const fmtRupiah = (n: number) => {
    if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)} M`;
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(2)} Jt`;
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  if (loading || !stats) {
    return (
      <div className={styles.dashboardGrid}>
        <section className={styles.welcomeBanner}>
          <div className={styles.welcomeContent}>
            <h1>Memuat dashboard...</h1>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.dashboardGrid}>

      {/* 1. Welcome Banner */}
      <section className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <h1>Assalamu&apos;alaikum, Super Admin Taufan</h1>
          <p>
            Platform pembiayaan syariah cerdas berjalan lancar. Smart Contract aktif dan AI
            XGBoost memproses data credit scoring secara optimal.
          </p>
        </div>
      </section>

      {/* 2. Key Metrics */}
      <section className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Total UMKM Terdaftar</span>
            <span className={styles.metricIcon}><Building /></span>
          </div>
          <div className={styles.metricValue}>{stats.totalUmkm.toLocaleString("id-ID")}</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendText}>{stats.pendingKyc} menunggu KYC</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Total Investor Aktif</span>
            <span className={styles.metricIcon}><Wallet /></span>
          </div>
          <div className={styles.metricValue}>{stats.totalInvestor.toLocaleString("id-ID")}</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendText}>Total terdaftar</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Smart Contract Akad Aktif</span>
            <span className={styles.metricIcon}><Chain /></span>
          </div>
          <div className={styles.metricValue}>{stats.activeAkads.toLocaleString("id-ID")}</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendText}>Terintegrasi Ledger</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Dana Terhimpun</span>
            <span className={styles.metricIcon}><BarChart /></span>
          </div>
          <div className={styles.metricValue}>{fmtRupiah(stats.totalFundingTarget)}</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendText}>Target kampanye</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Dana Tersalurkan</span>
            <span className={styles.metricIcon}><TrendingDown /></span>
          </div>
          <div className={styles.metricValue}>{fmtRupiah(stats.totalFundingCollected)}</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendText}>Total terkumpul</span>
          </div>
        </div>
      </section>

      {/* 3. Fraud Alerts Panel */}
      <section className={styles.dashboardRow}>
        <div className={`${styles.sectionCard} glass`}>
          <div className={styles.sectionHeader}>
            <h3>Deteksi Fraud AI</h3>
            <span
              className={styles.badge}
              style={{
                background: "rgba(239,68,68,0.1)",
                color: "#ef4444",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              {stats.recentFraud.length} Peringatan
            </span>
          </div>
          <div className={styles.alertList}>
            {stats.recentFraud.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}><Shield /></span>
                <span>Sistem aman dari ancaman kecurangan.</span>
              </div>
            ) : (
              stats.recentFraud.map((alert) => (
                <div
                  key={alert.id}
                  className={`${styles.alertItem} ${
                    alert.severity === "HIGH" || alert.severity === "CRITICAL"
                      ? styles.alertRed
                      : styles.alertOrange
                  }`}
                >
                  <div className={styles.alertIconBox}>
                    {alert.severity === "HIGH" || alert.severity === "CRITICAL" ? <AlertOctagon /> : <AlertTriangle />}
                  </div>
                  <div className={styles.alertContent}>
                    <h4 className={styles.alertMsg}>{alert.userName ?? "Unknown"}</h4>
                    <p style={{ fontSize: "0.75rem", opacity: 0.9, marginBottom: "0.5rem" }}>
                      {alert.alertType}
                    </p>
                    <div className={styles.alertMeta}>
                      <span className={styles.alertTime}>{fmtDate(alert.createdAt)}</span>
                      <button
                        onClick={() => handleResolveFraud(alert.id)}
                        className={styles.alertActionLink}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0 }}
                      >
                        Konfirmasi Fraud
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`${styles.sectionCard} glass`}>
          <div className={styles.sectionHeader}>
            <h3>Statistik Singkat</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "0.5rem 0" }}>
            {[
              { label: "Total Transaksi", value: stats.totalTransactions.toLocaleString("id-ID"), icon: <CreditCard /> },
              { label: "Fraud Aktif", value: stats.fraudAlerts.toLocaleString("id-ID"), icon: <AlertOctagon /> },
              { label: "KYC Menunggu", value: stats.pendingKyc.toLocaleString("id-ID"), icon: <Refresh /> },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>{item.icon}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{item.label}</span>
                </span>
                <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Recent User Registrations Table */}
      <section className={`${styles.sectionCard} glass`}>
        <div className={styles.sectionHeader}>
          <div>
            <h3>Registrasi User Terkini</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              5 pendaftar terbaru yang membutuhkan verifikasi KYC.
            </p>
          </div>
          <span
            className={styles.blockchainIndicator}
            style={{ color: "#10b981", background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)" }}
          >
<Dot color="#22c55e" style={{ verticalAlign: "-0.125em" }} /> Node Blockchain sinkron
          </span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nama Pengguna</th>
                <th>Role</th>
                <th>Tanggal Daftar</th>
                <th>Status KYC</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name ?? "-"}</td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                      <span>{user.role === "UMKM" ? <Building /> : <Wallet />}</span>
                      <span>{user.role}</span>
                    </span>
                  </td>
                  <td>{fmtDate(user.createdAt)}</td>
                  <td>
                    <span
                      className={`${styles.badgeKYC} ${
                        user.kycStatus === "APPROVED"
                          ? styles.badgeApproved
                          : user.kycStatus === "PENDING"
                          ? styles.badgePending
                          : styles.alertRed
                      }`}
                    >
                      {user.kycStatus}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {user.kycStatus === "PENDING" ? (
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => handleKycAction(user.id, "approve")}
                          style={{
                            padding: "0.35rem 0.75rem",
                            borderRadius: "6px",
                            background: "#10b981",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => handleKycAction(user.id, "reject")}
                          style={{
                            padding: "0.35rem 0.75rem",
                            borderRadius: "6px",
                            background: "#ef4444",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>
                        Selesai
                      </span>
                    )}
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

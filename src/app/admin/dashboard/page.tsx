"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface UserRegistration {
  id: string;
  name: string;
  role: "UMKM" | "Investor";
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  blockchainHash?: string;
}

interface FraudAlert {
  id: string;
  user: string;
  type: string;
  severity: "High" | "Medium";
  time: string;
  status: "Active" | "Resolved";
}

export default function AdminDashboardHome() {
  // Mock recent user registrations with interactive verification state
  const [users, setUsers] = useState<UserRegistration[]>([
    { id: "USR-089", name: "Toko Sembako Berkah", role: "UMKM", date: "30 Mei 2026", status: "Pending" },
    { id: "USR-088", name: "Rahmat Wijaya", role: "Investor", date: "29 Mei 2026", status: "Approved", blockchainHash: "0x8fa4...b29c" },
    { id: "USR-087", name: "Kopi Nusantara Mandiri", role: "UMKM", date: "29 Mei 2026", status: "Approved", blockchainHash: "0x3db5...19ea" },
    { id: "USR-086", name: "Aisyah Putri", role: "Investor", date: "28 Mei 2026", status: "Pending" },
    { id: "USR-085", name: "Peternakan Ayam Makmur", role: "UMKM", date: "27 Mei 2026", status: "Rejected" },
  ]);

  // Mock fraud alerts with interactive resolving state
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([
    { id: "FRD-102", user: "Toko Sembako Berkah", type: "Moral Hazard (Laporan Omzet Anomali)", severity: "High", time: "10 Menit yang lalu", status: "Active" },
    { id: "FRD-101", user: "Rahmat Wijaya", type: "IP Address Ganda (Gagal Login Berulang)", severity: "Medium", time: "2 Jam yang lalu", status: "Active" },
  ]);

  const handleApproveUser = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        // Mock a blockchain transaction hash deployment
        const randomHash = "0x" + Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join("") + "...blockchain";
        return { ...u, status: "Approved", blockchainHash: randomHash };
      }
      return u;
    }));
  };

  const handleRejectUser = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, status: "Rejected", blockchainHash: undefined };
      }
      return u;
    }));
  };

  const handleResolveFraud = (id: string) => {
    setFraudAlerts(prev => prev.filter(f => f.id !== id));
    alert("Alert kecurangan berhasil diatasi dan status transaksi dibersihkan!");
  };

  // Funding Growth Chart Data (Dana Terhimpun vs Tersalurkan)
  const chartData = [
    { month: "Jan", terhimpun: 8.2, tersalurkan: 6.5 },
    { month: "Feb", terhimpun: 9.8, tersalurkan: 8.1 },
    { month: "Mar", terhimpun: 11.4, tersalurkan: 9.5 },
    { month: "Apr", terhimpun: 13.1, tersalurkan: 11.0 },
    { month: "Mei", terhimpun: 14.8, tersalurkan: 12.4 }
  ];

  return (
    <div className={styles.dashboardGrid}>
      
      {/* 1. Welcome Banner */}
      <section className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <h1>Assalamu&apos;alaikum, Super Admin Taufan</h1>
          <p>
            Platform pembiayaan syariah cerdas berjalan lancar. Smart Contract aktif dan AI XGBoost memproses data credit scoring secara optimal.
          </p>
        </div>
      </section>

      {/* 2. Metrics Statistics Grid (5 Key Metrics matching PRD) */}
      <section className={styles.metricsGrid}>
        
        {/* Metric 1 */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Total UMKM Terdaftar</span>
            <span className={styles.metricIcon}>🏢</span>
          </div>
          <div className={styles.metricValue}>142</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendPositive}>+12.4%</span>
            <span className={styles.trendText}>dari bulan lalu</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Total Investor Aktif</span>
            <span className={styles.metricIcon}>💰</span>
          </div>
          <div className={styles.metricValue}>589</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendPositive}>+8.1%</span>
            <span className={styles.trendText}>dari bulan lalu</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Smart Contract Akad Aktif</span>
            <span className={styles.metricIcon}>⛓️</span>
          </div>
          <div className={styles.metricValue}>342</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendPositive}>100%</span>
            <span className={styles.trendText}>Akad Terintegrasi Ledger</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Dana Terhimpun</span>
            <span className={styles.metricIcon}>📊</span>
          </div>
          <div className={styles.metricValue}>Rp 14.82 M</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendPositive}>+15.4%</span>
            <span className={styles.trendText}>Growth kuartal ini</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Dana Tersalurkan</span>
            <span className={styles.metricIcon}>💸</span>
          </div>
          <div className={styles.metricValue}>Rp 12.45 M</div>
          <div className={styles.metricFooter}>
            <span className={styles.trendPositive}>+18.2%</span>
            <span className={styles.trendText}>Tingkat penyerapan tinggi</span>
          </div>
        </div>

      </section>

      {/* 3. Mid Section (Growth Graph & Fraud Alerts) */}
      <section className={styles.dashboardRow}>
        
        {/* Growth Bar Chart */}
        <div className={`${styles.sectionCard} glass`}>
          <div className={styles.sectionHeader}>
            <h3>Pertumbuhan Dana (Miliar Rp)</h3>
            <div className={styles.systemStatus}>
              <span className={styles.statusDot}></span>
              <span>Diperbarui Real-time</span>
            </div>
          </div>
          
          <div className={styles.chartContainer}>
            <div className={styles.chartLabelY}>
              <span>15.0</span>
              <span>10.0</span>
              <span>5.0</span>
              <span>0.0</span>
            </div>

            {chartData.map((data) => {
              // Calculate heights in percentage relative to max of 15
              const hTerhimpun = (data.terhimpun / 15) * 100;
              const hTersalurkan = (data.tersalurkan / 15) * 100;
              
              return (
                <div key={data.month} className={styles.chartBarWrapper}>
                  <div style={{ display: "flex", gap: "6px", width: "100%", height: "100%", alignItems: "flex-end", justifyContent: "center" }}>
                    {/* Terhimpun bar */}
                    <div 
                      className={styles.chartBar} 
                      style={{ 
                        height: `${hTerhimpun}%`, 
                        background: "linear-gradient(to top, var(--secondary), var(--primary))" 
                      }}
                    >
                      <div className={styles.chartTooltip}>
                        Dana Masuk: Rp {data.terhimpun} M
                      </div>
                    </div>
                    {/* Tersalurkan bar */}
                    <div 
                      className={styles.chartBar} 
                      style={{ 
                        height: `${hTersalurkan}%`, 
                        background: "linear-gradient(to top, #7c3aed, #a855f7)" 
                      }}
                    >
                      <div className={styles.chartTooltip}>
                        Disalurkan: Rp {data.tersalurkan} M
                      </div>
                    </div>
                  </div>
                  <span className={styles.chartLabelX}>{data.month}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", fontSize: "0.75rem", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--primary)", display: "inline-block" }}></span>
              <span style={{ color: "var(--text-muted)", fontWeight: "600" }}>Dana Terhimpun</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#a855f7", display: "inline-block" }}></span>
              <span style={{ color: "var(--text-muted)", fontWeight: "600" }}>Dana Tersalurkan</span>
            </div>
          </div>
        </div>

        {/* Real-time Fraud Alerts Panel */}
        <div className={`${styles.sectionCard} glass`}>
          <div className={styles.sectionHeader}>
            <h3>Deteksi Fraud AI</h3>
            <span className={styles.badge} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              {fraudAlerts.length} Peringatan
            </span>
          </div>

          <div className={styles.alertList}>
            {fraudAlerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}>🛡️</span>
                <span>Sistem aman dari ancaman kecurangan.</span>
              </div>
            ) : (
              fraudAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`${styles.alertItem} ${alert.severity === "High" ? styles.alertRed : styles.alertOrange}`}
                >
                  <div className={styles.alertIconBox}>
                    {alert.severity === "High" ? "🚨" : "⚠️"}
                  </div>
                  <div className={styles.alertContent}>
                    <h4 className={styles.alertMsg}>{alert.user}</h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-color)", marginBottom: "0.5rem", opacity: 0.9 }}>{alert.type}</p>
                    <div className={styles.alertMeta}>
                      <span className={styles.alertTime}>{alert.time}</span>
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

      </section>

      {/* 4. Bottom Section (Recent KYC and User Registrations) */}
      <section className={`${styles.sectionCard} glass`}>
        <div className={styles.sectionHeader}>
          <div>
            <h3>Verifikasi User & KYC Terkini</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Tinjau dokumen legalitas user baru sebelum deployment smart contract.
            </p>
          </div>
          <span className={styles.blockchainIndicator} style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.08)", borderColor: "rgba(16, 185, 129, 0.2)" }}>
            🟢 Node Blockchain sinkron
          </span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Nama Pengguna</th>
                <th>Role</th>
                <th>Tanggal Daftar</th>
                <th>Status KYC</th>
                <th>Blockchain Ledger Hash</th>
                <th style={{ textAlign: "right" }}>Aksi Validasi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: "700" }}>{user.id}</td>
                  <td>{user.name}</td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                      <span>{user.role === "UMKM" ? "🏢" : "💰"}</span>
                      <span>{user.role}</span>
                    </span>
                  </td>
                  <td>{user.date}</td>
                  <td>
                    <span className={`${styles.badgeKYC} ${
                      user.status === "Approved" ? styles.badgeApproved : 
                      user.status === "Pending" ? styles.badgePending : 
                      styles.alertRed
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    {user.blockchainHash ? (
                      <span className={styles.blockchainHash}>{user.blockchainHash}</span>
                    ) : user.status === "Rejected" ? (
                      <span style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: "600" }}>Blocked</span>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.75rem" }}>Menunggu validasi</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {user.status === "Pending" ? (
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button 
                          onClick={() => handleApproveUser(user.id)}
                          style={{
                            padding: "0.35rem 0.75rem",
                            borderRadius: "6px",
                            background: "#10b981",
                            color: "#ffffff",
                            fontWeight: "700",
                            fontSize: "0.75rem"
                          }}
                        >
                          Setujui
                        </button>
                        <button 
                          onClick={() => handleRejectUser(user.id)}
                          style={{
                            padding: "0.35rem 0.75rem",
                            borderRadius: "6px",
                            background: "#ef4444",
                            color: "#ffffff",
                            fontWeight: "700",
                            fontSize: "0.75rem"
                          }}
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600" }}>
                        Tindakan Selesai
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

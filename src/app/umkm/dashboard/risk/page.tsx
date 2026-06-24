"use client";

import { useState } from "react";
import styles from "../page.module.css";

interface RiskAlert {
  id: string;
  tipe: string;
  deskripsi: string;
  severity: "High" | "Medium" | "Low";
  tanggal: string;
  status: "Active" | "Resolved";
  rekomendasi: string;
}

export default function RiskWarning() {
  const [alerts, setAlerts] = useState<RiskAlert[]>([
    {
      id: "RWN-007",
      tipe: "Anomali Laporan Omzet",
      deskripsi: "Omzet bulan Juni turun 5.9% dari bulan sebelumnya. Sistem mendeteksi pola penurunan yang perlu diperhatikan.",
      severity: "Medium",
      tanggal: "7 Jun 2026, 06:45 WIB",
      status: "Active",
      rekomendasi: "Update laporan omzet dengan keterangan penyebab penurunan. Tingkatkan strategi penjualan di minggu berikutnya.",
    },
    {
      id: "RWN-006",
      tipe: "Jatuh Tempo Bagi Hasil Mendekati",
      deskripsi: "Pembayaran bagi hasil AKD-042 jatuh tempo dalam 3 hari (10 Jun 2026). Pastikan saldo wallet mencukupi.",
      severity: "Medium",
      tanggal: "7 Jun 2026, 09:00 WIB",
      status: "Active",
      rekomendasi: "Segera konfirmasi pembayaran bagi hasil sebelum jatuh tempo untuk menghindari penalti keterlambatan.",
    },
    {
      id: "RWN-004",
      tipe: "Data Usaha Tidak Diperbarui",
      deskripsi: "Laporan omzet minggu pertama Juni belum diinput. AI membutuhkan data terbaru untuk scoring akurat.",
      severity: "Low",
      tanggal: "5 Jun 2026, 12:00 WIB",
      status: "Resolved",
      rekomendasi: "Selalu update data usaha minimal sekali seminggu agar skor AI tetap akurat.",
    },
  ]);

  const handleResolve = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "Resolved" } : a));
  };

  const active = alerts.filter((a) => a.status === "Active");
  const resolved = alerts.filter((a) => a.status === "Resolved");

  const severityColor = (s: string) => s === "High" ? "#ef4444" : s === "Medium" ? "#f59e0b" : "#10b981";
  const severityBg = (s: string) => s === "High" ? "rgba(239,68,68,0.1)" : s === "Medium" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Risk & Warning System</h1>
          <p className={styles.subtitle}>
            Peringatan otomatis dari sistem AI risk management. Segera tindak lanjuti alert aktif untuk menjaga performa usaha.
          </p>
        </div>
      </header>

      {/* Risk Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
        {[
          { label: "Alert Aktif", count: active.length, color: active.length > 0 ? "#f59e0b" : "#10b981", icon: active.length > 0 ? "⚠️" : "✅" },
          { label: "Alert High Severity", count: active.filter((a) => a.severity === "High").length, color: "#ef4444", icon: "🚨" },
          { label: "Alert Resolved", count: resolved.length, color: "#10b981", icon: "🔒" },
        ].map((stat) => (
          <div key={stat.label} className={`${styles.metricCard} glass`}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>{stat.label}</span>
              <span style={{ fontSize: "1.5rem" }}>{stat.icon}</span>
            </div>
            <div className={styles.metricValue} style={{ color: stat.color, fontSize: "2.5rem" }}>{stat.count}</div>
          </div>
        ))}
      </div>

      {/* Skor Risiko Saat Ini */}
      <div className={`${styles.sectionCard} glass`}>
        <div className={styles.sectionHeader}>
          <h3>📊 Profil Risiko Usaha Saat Ini</h3>
          <span className={`${styles.badge} ${styles.badgeGreen}`}>Low Risk</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          {[
            { label: "Risiko Kredit", level: "Low", score: 22, color: "#10b981" },
            { label: "Risiko Operasional", level: "Medium", score: 48, color: "#f59e0b" },
            { label: "Risiko Pasar", level: "Low", score: 30, color: "#10b981" },
            { label: "Risiko Keterlambatan", level: "Low", score: 15, color: "#10b981" },
          ].map((r) => (
            <div key={r.label} style={{ padding: "1rem", border: "1px solid var(--border-color)", borderRadius: 12, background: "rgba(0,0,0,0.01)" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "0.5rem" }}>{r.label}</p>
              <div className={styles.progressBar}>
                <div style={{ height: "100%", width: `${r.score}%`, background: r.color, borderRadius: 10, transition: "width 0.6s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4rem" }}>
                <span style={{ fontSize: "0.75rem", color: r.color, fontWeight: 700 }}>{r.level}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{r.score}/100</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Alerts */}
      {active.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 800, color: "var(--text-color)", marginBottom: "1rem" }}>🔴 Alert Aktif ({active.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {active.map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: "1.5rem",
                  borderRadius: 16,
                  border: `1px solid ${severityColor(alert.severity)}33`,
                  background: severityBg(alert.severity),
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontFamily: "monospace", color: "var(--text-muted)", fontSize: "0.75rem" }}>{alert.id}</span>
                      <span style={{
                        background: `${severityColor(alert.severity)}22`,
                        color: severityColor(alert.severity),
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "0.2rem 0.5rem",
                        borderRadius: 20,
                        textTransform: "uppercase",
                      }}>
                        {alert.severity}
                      </span>
                    </div>
                    <h4 style={{ fontWeight: 800, color: "var(--text-color)", fontSize: "1rem" }}>{alert.tipe}</h4>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.4rem", lineHeight: 1.5 }}>{alert.deskripsi}</p>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap", marginLeft: "1rem" }}>{alert.tanggal}</span>
                </div>
                <div style={{ padding: "0.75rem 1rem", background: "rgba(255,255,255,0.5)", borderRadius: 10, borderLeft: `3px solid ${severityColor(alert.severity)}` }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-color)", marginBottom: "0.2rem" }}>💡 Rekomendasi AI:</p>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{alert.rekomendasi}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className={`${styles.btnSm} ${styles.btnSmGreen}`}
                    style={{ border: "none", cursor: "pointer" }}
                  >
                    ✅ Tandai Sudah Ditindaklanjuti
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Alerts */}
      {resolved.length > 0 && (
        <div className={`${styles.tableSection} glass`}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
            <h3 style={{ fontWeight: 800, color: "var(--text-color)" }}>✅ Alert Sudah Diselesaikan ({resolved.length})</h3>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipe Alert</th>
                  <th>Severity</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {resolved.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontFamily: "monospace", color: "var(--text-muted)" }}>{a.id}</td>
                    <td style={{ fontWeight: 600 }}>{a.tipe}</td>
                    <td>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: severityColor(a.severity) }}>{a.severity}</span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{a.tanggal}</td>
                    <td><span className={`${styles.badge} ${styles.badgeGreen}`}>Resolved</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

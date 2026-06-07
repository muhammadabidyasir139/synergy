"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface RiskAlert {
  id: string;
  umkm: string;
  type: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  detectedAt: string;
  status: "Active" | "Resolved";
  recommendation: string;
}

export default function RiskAlertPage() {
  const [alerts, setAlerts] = useState<RiskAlert[]>([
    {
      id: "ALT-008",
      umkm: "Kopi Nusantara Mandiri",
      type: "Penurunan Performa",
      severity: "High",
      description: "Omzet UMKM turun 18% selama 2 bulan berturut-turut, melebihi threshold peringatan 15%.",
      detectedAt: "02 Jun 2026 • 09:14 WIB",
      status: "Active",
      recommendation: "Pertimbangkan untuk menghubungi UMKM atau meninjau keputusan investasi Anda.",
    },
    {
      id: "ALT-007",
      umkm: "Kopi Nusantara Mandiri",
      type: "Keterlambatan Bagi Hasil",
      severity: "Medium",
      description: "Pembayaran bagi hasil periode Mei 2026 melewati jatuh tempo 3 hari.",
      detectedAt: "01 Jun 2026 • 14:30 WIB",
      status: "Active",
      recommendation: "Pantau status pembayaran di halaman Profit Sharing.",
    },
    {
      id: "ALT-005",
      umkm: "Toko Sembako Berkah",
      type: "Laporan Omzet Anomali",
      severity: "Low",
      description: "Terdapat lonjakan omzet 40% dalam satu minggu — terindikasi promosi musiman, bukan fraud.",
      detectedAt: "15 Mei 2026 • 11:00 WIB",
      status: "Resolved",
      recommendation: "Lonjakan telah dikonfirmasi sebagai dampak promosi Eid. Tidak ada tindakan diperlukan.",
    },
  ]);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "Resolved" } : a));
    if (expandedId === id) setExpandedId(null);
  };

  const severityStyle = (s: string) =>
    s === "Critical" ? styles.sevCritical : s === "High" ? styles.sevHigh : s === "Medium" ? styles.sevMedium : styles.sevLow;

  const activeCount = alerts.filter((a) => a.status === "Active").length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Risk & Alert Monitor</h2>
          <p className={styles.subtitle}>Sistem AI mendeteksi risiko secara real-time dari data performa UMKM yang Anda danai.</p>
        </div>
        <div className={styles.countBadge}>
          <span className={styles.countDot}></span>
          <span>{activeCount} Alert Aktif</span>
        </div>
      </div>

      {/* Risk Level Legend */}
      <div className={styles.legendRow}>
        {["Critical", "High", "Medium", "Low"].map((s) => (
          <div key={s} className={styles.legendItem}>
            <span className={`${styles.legendDot} ${severityStyle(s)}`}></span>
            <span>{s}</span>
          </div>
        ))}
      </div>

      {/* Alert Cards */}
      <div className={styles.alertList}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`${styles.alertCard} ${alert.status === "Resolved" ? styles.alertResolved : ""}`}
          >
            <div className={styles.alertTop} onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}>
              <div className={`${styles.severityBar} ${severityStyle(alert.severity)}`}></div>
              <div className={styles.alertMain}>
                <div className={styles.alertMeta}>
                  <span className={`${styles.severityBadge} ${severityStyle(alert.severity)}`}>{alert.severity}</span>
                  <span className={styles.alertId}>{alert.id}</span>
                  <span className={styles.alertUmkm}>• {alert.umkm}</span>
                </div>
                <p className={styles.alertType}>{alert.type}</p>
                <p className={styles.alertDesc}>{alert.description}</p>
                <p className={styles.alertTime}>{alert.detectedAt}</p>
              </div>
              <div className={styles.alertActions}>
                {alert.status === "Active" ? (
                  <span className={styles.statusActive}>⚡ Aktif</span>
                ) : (
                  <span className={styles.statusResolved}>✅ Selesai</span>
                )}
                <span className={styles.expandArrow}>{expandedId === alert.id ? "▲" : "▼"}</span>
              </div>
            </div>

            {expandedId === alert.id && (
              <div className={styles.alertExpanded}>
                <div className={styles.recBox}>
                  <span className={styles.recIcon}>💡</span>
                  <div>
                    <p className={styles.recTitle}>Rekomendasi AI</p>
                    <p className={styles.recText}>{alert.recommendation}</p>
                  </div>
                </div>
                {alert.status === "Active" && (
                  <button className={styles.ackBtn} onClick={() => handleAcknowledge(alert.id)}>
                    ✅ Tandai Sebagai Selesai
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {alerts.filter((a) => a.status === "Active").length === 0 && (
        <div className={styles.allClear}>
          <span>🛡️</span>
          <h3>Semua Risiko Teratasi</h3>
          <p>Tidak ada alert aktif. Investasi Anda dalam kondisi aman.</p>
        </div>
      )}
    </div>
  );
}

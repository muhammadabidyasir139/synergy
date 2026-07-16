"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { Zap, CheckCircle, Lightbulb, Shield } from "@/components/icons";

interface RiskAlert {
  id: string;
  umkm: string;
  alertType: string;
  severity: string;
  description: string;
  status: "Active" | "Resolved";
  detectedAt: string;
  recommendation: string;
}

function getInvestorId() {
  if (typeof window === "undefined") return "";
  try { return JSON.parse(sessionStorage.getItem("synergy_investor_session") ?? "{}").investorProfileId ?? ""; }
  catch { return ""; }
}

export default function RiskAlertPage() {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const id = getInvestorId();
    if (!id) return;
    fetch("/api/investor/risk-alerts", { headers: { "x-investor-id": id } })
      .then((r) => r.json())
      .then((d: RiskAlert[]) => setAlerts(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleAcknowledge = async (id: string) => {
    const investorId = getInvestorId();
    try {
      const res = await fetch(`/api/investor/risk-alerts/${id}/resolve`, {
        method: "PATCH",
        headers: { "x-investor-id": investorId },
      });
      if (res.ok) {
        setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "Resolved" } : a));
        if (expandedId === id) setExpandedId(null);
      }
    } catch (e) { console.error(e); }
  };

  const severityStyle = (s: string) =>
    s === "CRITICAL" || s === "Critical" ? styles.sevCritical
    : s === "HIGH" || s === "High" ? styles.sevHigh
    : s === "MEDIUM" || s === "Medium" ? styles.sevMedium
    : styles.sevLow;

  const activeCount = alerts.filter((a) => a.status === "Active").length;

  if (isLoading) return <div style={{ padding: "2rem" }}>Memuat risk alerts...</div>;

  return (
    <div className={styles.page}>
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

      <div className={styles.legendRow}>
        {["Critical", "High", "Medium", "Low"].map((s) => (
          <div key={s} className={styles.legendItem}>
            <span className={`${styles.legendDot} ${severityStyle(s)}`}></span>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <div className={styles.alertList}>
        {alerts.map((alert) => (
          <div key={alert.id} className={`${styles.alertCard} ${alert.status === "Resolved" ? styles.alertResolved : ""}`}>
            <div className={styles.alertTop} onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}>
              <div className={`${styles.severityBar} ${severityStyle(alert.severity)}`}></div>
              <div className={styles.alertMain}>
                <div className={styles.alertMeta}>
                  <span className={`${styles.severityBadge} ${severityStyle(alert.severity)}`}>{alert.severity}</span>
                  <span className={styles.alertId}>{alert.id.slice(0, 8).toUpperCase()}</span>
                  <span className={styles.alertUmkm}>• {alert.umkm}</span>
                </div>
                <p className={styles.alertType}>{alert.alertType}</p>
                <p className={styles.alertDesc}>{alert.description}</p>
                <p className={styles.alertTime}>{new Date(alert.detectedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB</p>
              </div>
              <div className={styles.alertActions}>
                {alert.status === "Active" ? <span className={styles.statusActive}><Zap style={{ verticalAlign: "-0.125em" }} /> Aktif</span> : <span className={styles.statusResolved}><CheckCircle style={{ verticalAlign: "-0.125em" }} /> Selesai</span>}
                <span className={styles.expandArrow}>{expandedId === alert.id ? "▲" : "▼"}</span>
              </div>
            </div>

            {expandedId === alert.id && (
              <div className={styles.alertExpanded}>
                <div className={styles.recBox}>
                  <span className={styles.recIcon}>
                    <Lightbulb />
                  </span>
                  <div>
                    <p className={styles.recTitle}>Rekomendasi AI</p>
                    <p className={styles.recText}>{alert.recommendation || "Pantau kondisi UMKM secara berkala."}</p>
                  </div>
                </div>
                {alert.status === "Active" && (
                  <button className={styles.ackBtn} onClick={() => handleAcknowledge(alert.id)}><CheckCircle style={{ verticalAlign: "-0.125em" }} /> Tandai Sebagai Selesai</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {activeCount === 0 && alerts.length > 0 && (
        <div className={styles.allClear}><span><Shield /></span><h3>Semua Risiko Teratasi</h3><p>Tidak ada alert aktif. Investasi Anda dalam kondisi aman.</p></div>
      )}
      {alerts.length === 0 && (
        <div className={styles.allClear}><span><Shield /></span><h3>Tidak Ada Alert</h3><p>Investasi Anda dalam kondisi aman.</p></div>
      )}
    </div>
  );
}

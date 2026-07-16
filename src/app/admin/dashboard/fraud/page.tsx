"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import { AlertTriangle } from "@/components/icons";

interface FraudAlert {
  id: string;
  alertType: string;
  severity: string;
  description: string;
  status: string;
  userName: string | null;
  transactionId: string | null;
  reviewedAt: string | null;
  actionTaken: string | null;
  createdAt: string;
}

export default function FraudAlertsPage() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/fraud");
    const data = await res.json();
    setAlerts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleAction = async (id: string, action: "confirm" | "ignore") => {
    const actionTaken =
      action === "confirm"
        ? prompt("Tindakan yang diambil (opsional):")
        : undefined;

    const res = await fetch(`/api/admin/fraud/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, actionTaken }),
    });

    if (res.ok) {
      const newStatus = action === "confirm" ? "CONFIRMED" : "IGNORED";
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: newStatus, reviewedAt: new Date().toISOString(), actionTaken: actionTaken ?? null }
            : a
        )
      );
    }
  };

  const severityColor = (s: string) => {
    if (s === "HIGH" || s === "CRITICAL") return "#ef4444";
    if (s === "MEDIUM") return "#f59e0b";
    return "#10b981";
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}><AlertTriangle style={{ verticalAlign: "-0.125em" }} /> Fraud Alerts</h1>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", opacity: 0.6 }}>Memuat data...</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Pengguna</th>
              <th>Tipe Alert</th>
              <th>Deskripsi</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "2rem", opacity: 0.6 }}>
                  Tidak ada fraud alert.
                </td>
              </tr>
            ) : (
              alerts.map((alert) => (
                <tr
                  key={alert.id}
                  className={alert.status !== "DETECTED" ? styles.rowDone : ""}
                >
                  <td className={styles.mono}>{alert.id.slice(0, 8)}...</td>
                  <td>{alert.userName ?? "-"}</td>
                  <td>{alert.alertType}</td>
                  <td style={{ maxWidth: "20rem", fontSize: "0.85rem" }}>{alert.description}</td>
                  <td style={{ color: severityColor(alert.severity), fontWeight: 600 }}>
                    {alert.severity}
                  </td>
                  <td>{alert.status}</td>
                  <td style={{ fontSize: "0.8rem" }}>{fmtDate(alert.createdAt)}</td>
                  <td>
                    {alert.status === "DETECTED" && (
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          className={styles.confirmBtn}
                          onClick={() => handleAction(alert.id, "confirm")}
                        >
                          Confirm
                        </button>
                        <button
                          className={styles.ignoreBtn}
                          onClick={() => handleAction(alert.id, "ignore")}
                        >
                          Ignore
                        </button>
                      </div>
                    )}
                    {alert.actionTaken && (
                      <p style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "0.2rem" }}>
                        {alert.actionTaken}
                      </p>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

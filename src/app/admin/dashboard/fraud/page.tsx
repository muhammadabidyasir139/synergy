"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface Alert {
  id: string;
  description: string;
  risk: "Low" | "Medium" | "High";
  status: "Pending" | "Confirmed" | "Ignored";
}

const mockAlerts: Alert[] = [
  { id: "AL-101", description: "Unusual transfer pattern detected", risk: "High", status: "Pending" },
  { id: "AL-102", description: "Multiple login attempts from new IP", risk: "Medium", status: "Pending" },
  { id: "AL-103", description: "Sudden large withdrawal", risk: "High", status: "Pending" }
];

export default function FraudAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const handleAction = (id: string, newStatus: "Confirmed" | "Ignored") => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>⚠️ Fraud Alerts</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Risk</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map(alert => (
            <tr key={alert.id} className={alert.status !== "Pending" ? styles.rowDone : ""}>
              <td className={styles.mono}>{alert.id}</td>
              <td>{alert.description}</td>
              <td style={{ color: alert.risk === "High" ? "red" : alert.risk === "Medium" ? "orange" : "green" }}>{alert.risk}</td>
              <td>{alert.status}</td>
              <td>
                {alert.status === "Pending" && (
                  <>
                    <button className={styles.confirmBtn} onClick={() => handleAction(alert.id, "Confirmed")}>Confirm</button>
                    <button className={styles.ignoreBtn} onClick={() => handleAction(alert.id, "Ignored")}>Ignore</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

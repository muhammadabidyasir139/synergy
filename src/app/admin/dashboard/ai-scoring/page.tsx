"use client";

import styles from "./page.module.css";
import { useEffect, useState } from "react";

// Simulated AI scoring data
const mockScores = [
  { id: 1, name: "UMKM Alpha", score: 85, risk: "low" },
  { id: 2, name: "UMKM Beta", score: 62, risk: "medium" },
  { id: 3, name: "UMKM Gamma", score: 48, risk: "high" },
];

export default function AIScoringPage() {
  const [scores] = useState(mockScores);

  // Simulate fetching AI scores (placeholder for real API)
  useEffect(() => {
    // In real implementation, fetch from /api/ai-scoring
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "var(--primary)"; // greenish
      case "medium":
        return "orange";
      case "high":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Penilaian Usaha Dashboard</h1>
      <p className={styles.subtitle}>Analisis kelayakan UMKM secara otomatis</p>
      <div className={styles.grid}>
        {scores.map((s) => (
          <div key={s.id} className={styles.card}>
            <h2 className={styles.cardTitle}>{s.name}</h2>
            <div className={styles.gaugeWrapper}>
              <svg viewBox="0 0 36 36" className={styles.gauge}>
                <path
                  className={styles.gaugeBackground}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                />
                <path
                  className={styles.gaugeProgress}
                  stroke={getRiskColor(s.risk)}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                  strokeDasharray={`${s.score}, 100`}
                />
                <text x="18" y="20.35" className={styles.gaugeText} textAnchor="middle">
                  {s.score}%
                </text>
              </svg>
            </div>
            <p className={styles.riskLabel}>Risk: <span style={{ color: getRiskColor(s.risk) }}>{s.risk.toUpperCase()}</span></p>
            <button className={styles.approveBtn} disabled={s.risk === "high"}>Approve</button>
          </div>
        ))}
      </div>
    </section>
  );
}

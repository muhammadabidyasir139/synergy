"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { TrendingUp, Calendar, BarChart, Link, Refresh, Lightbulb } from "@/components/icons";

export default function CreditScoring() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("7 Jun 2026, 06:45 WIB");

  const score = 78;
  const maxScore = 100;
  const risk = "Low Risk";

  const scoreFactors = [
    { label: "Konsistensi Omzet", value: 85, weight: "25%", status: "good" },
    { label: "Rasio Laba/Omzet", value: 72, weight: "20%", status: "good" },
    { label: "Histori Pembayaran", value: 90, weight: "20%", status: "good" },
    { label: "Usia Usaha", value: 70, weight: "15%", status: "medium" },
    { label: "Kelengkapan Dokumen", value: 100, weight: "10%", status: "good" },
    { label: "Pertumbuhan Bulanan", value: 60, weight: "10%", status: "medium" },
  ];

  const recommendations = [
    { icon: <TrendingUp />, text: "Tingkatkan konsistensi pelaporan omzet harian untuk meningkatkan skor AI." },
    { icon: <Calendar />, text: "Pastikan pembayaran bagi hasil selalu tepat waktu agar histori tetap baik." },
    { icon: <BarChart />, text: "Pertumbuhan omzet bulan-ke-bulan masih di bawah rata-rata. Target +10% per bulan." },
    { icon: <Link />, text: "Integrasikan data dari platform e-commerce untuk data yang lebih akurat." },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB");
    }, 2500);
  };

  const scoreColor = score >= 75 ? "#1d4ed8" : score >= 50 ? "#f59e0b" : "#ef4444";
  const riskBadge = score >= 75 ? styles.badgeGreen : score >= 50 ? styles.badgeYellow : styles.badgeRed;

  // SVG circle ring calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (score / maxScore) * circumference;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Credit Scoring AI (XGBoost)</h1>
          <p className={styles.subtitle}>
            Hasil analisis model AI XGBoost terhadap data usaha Anda. Skor diperbarui secara berkala.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={styles.btnPrimary}
          style={{ padding: "0.65rem 1.25rem", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: "0.9rem" }}
        >
          {isRefreshing ? (
            <><Refresh style={{ verticalAlign: "-0.125em" }} /> Memproses AI...</>
          ) : (
            <><Refresh style={{ verticalAlign: "-0.125em" }} /> Trigger Scoring Ulang</>
          )}
        </button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "1.5rem" }}>

        {/* Score Summary Card */}
        <div className={`${styles.sectionCard} glass`} style={{ alignItems: "center", justifyContent: "center", minWidth: 280 }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-color)", marginBottom: "1.5rem", textAlign: "center" }}>
            Skor Kredit Anda
          </h3>

          {/* SVG Donut Ring */}
          <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto" }}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--border-color)" strokeWidth="12" />
              <circle
                cx="80" cy="80" r={radius}
                fill="none"
                stroke={scoreColor}
                strokeWidth="12"
                strokeDasharray={`${strokeDash} ${circumference}`}
                strokeDashoffset={circumference / 4}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-color)", lineHeight: 1 }}>{isRefreshing ? "..." : score}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>/ 100</span>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
            <span className={`${styles.badge} ${riskBadge}`} style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }}>
              {risk}
            </span>
          </div>

          <div style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
            <p>Model: <strong style={{ color: "var(--text-color)" }}>XGBoost v3.1</strong></p>
            <p style={{ marginTop: "0.25rem" }}>Diperbarui: {lastUpdated}</p>
          </div>
        </div>

        {/* Score Factors */}
        <div className={`${styles.sectionCard} glass`}>
          <div className={styles.sectionHeader}>
            <h3>Faktor Penilaian Kredit</h3>
            <span className={`${styles.badge} ${styles.badgeBlue}`}>6 Parameter</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {scoreFactors.map((factor, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-color)" }}>{factor.label}</span>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Bobot: {factor.weight}</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 800, color: factor.status === "good" ? "#1d4ed8" : "#f59e0b" }}>
                      {factor.value}/100
                    </span>
                  </div>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${factor.value}%`,
                      background: factor.status === "good"
                        ? "linear-gradient(90deg, #1d4ed8, #0ea5e9)"
                        : "linear-gradient(90deg, #f59e0b, #d97706)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className={`${styles.sectionCard} glass`}>
        <div className={styles.sectionHeader}>
          <h3><Lightbulb style={{ verticalAlign: "-0.125em" }} /> Rekomendasi Peningkatan Usaha</h3>
          <span className={`${styles.badge} ${styles.badgeYellow}`}>AI Insights</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {recommendations.map((rec, i) => (
            <div key={i} style={{
              display: "flex", gap: "0.75rem", padding: "1rem",
              background: "rgba(29,78,216,0.04)",
              borderRadius: 12,
              border: "1px solid rgba(29,78,216,0.1)"
            }}>
              <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{rec.icon}</span>
              <p style={{ fontSize: "0.875rem", color: "var(--text-color)", lineHeight: 1.5 }}>{rec.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scoring History */}
      <div className={`${styles.sectionCard} glass`}>
        <div className={styles.sectionHeader}>
          <h3>Riwayat Perubahan Skor</h3>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tanggal Scoring</th>
                <th>Skor</th>
                <th>Kategori Risiko</th>
                <th>Perubahan</th>
                <th>Trigger</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: "7 Jun 2026", score: 78, risk: "Low Risk", change: "+3", trigger: "Input data harian" },
                { date: "1 Jun 2026", score: 75, risk: "Low Risk", change: "+5", trigger: "Refresh manual" },
                { date: "15 Mei 2026", score: 70, risk: "Medium Risk", change: "-2", trigger: "Input data harian" },
                { date: "1 Mei 2026", score: 72, risk: "Medium Risk", change: "+7", trigger: "Integrasi API" },
              ].map((row, i) => (
                <tr key={i}>
                  <td>{row.date}</td>
                  <td style={{ fontWeight: 800, color: "var(--text-color)" }}>{row.score}/100</td>
                  <td>
                    <span className={`${styles.badge} ${row.risk === "Low Risk" ? styles.badgeGreen : styles.badgeYellow}`}>
                      {row.risk}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: row.change.startsWith("+") ? "#1d4ed8" : "#ef4444" }}>{row.change}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{row.trigger}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "../page.module.css";
import { TrendingUp, Calendar, BarChart, Link, Refresh, Lightbulb } from "@/components/icons";

const maxScore = 100;

interface Analisis {
  id: number;
  id_umkm: string;
  id_akad_variable: number;
  current_ratio: number | null;
  net_profit_margin: number | null;
  operating_expense_ratio: number | null;
  cashflow_stability_risk: number | null;
  asset_turnover_ratio: number | null;
  revenue_growth: number | null;
  skor_kelayakan: number;
  akad: string;
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));
const pct = (v: number | null | undefined) => (v == null ? 0 : v);

// Ubah rasio nyata → bar 0-100 (searah "makin tinggi makin baik"), plus bobot ROC dari engine.
function buildFactors(a: Analisis) {
  const cr = pct(a.current_ratio);
  const npm = pct(a.net_profit_margin);
  const oer = pct(a.operating_expense_ratio);
  const cfsr = pct(a.cashflow_stability_risk);
  const atr = pct(a.asset_turnover_ratio);
  const rg = pct(a.revenue_growth);
  return [
    { label: "Margin Laba Bersih (NPM)", raw: `${(npm * 100).toFixed(1)}%`, bar: clamp((npm / 0.3) * 100), weight: "40.8%" },
    { label: "Perputaran Aset (ATO)", raw: atr.toFixed(2) + "×", bar: clamp((atr / 3) * 100), weight: "24.2%" },
    { label: "Stabilitas Arus Kas", raw: cfsr.toFixed(3), bar: clamp((1 - Math.min(cfsr, 1)) * 100), weight: "15.8%" },
    { label: "Current Ratio (Likuiditas)", raw: cr.toFixed(2), bar: clamp((cr / 3) * 100), weight: "10.3%" },
    { label: "Pertumbuhan Pendapatan", raw: `${(rg * 100).toFixed(1)}%`, bar: clamp(((rg + 0.1) / 0.5) * 100), weight: "6.1%" },
    { label: "Rasio Beban Operasional", raw: `${(oer * 100).toFixed(1)}%`, bar: clamp((1 - Math.min(oer, 1)) * 100), weight: "2.8%" },
  ];
}

const recommendations = [
  { icon: <TrendingUp />, text: "Tingkatkan konsistensi pelaporan omzet harian untuk meningkatkan skor AI." },
  { icon: <Calendar />, text: "Pastikan pembayaran bagi hasil selalu tepat waktu agar histori tetap baik." },
  { icon: <BarChart />, text: "Pertumbuhan omzet bulan-ke-bulan masih di bawah rata-rata. Target +10% per bulan." },
  { icon: <Link />, text: "Lengkapi Data Usaha & pendapatan bulanan agar analisis AI makin akurat." },
];

export default function CreditScoring() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Analisis[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/umkm/credit-scoring", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat data");
      setHistory(json.data || []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/umkm/credit-scoring", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal trigger scoring");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal trigger scoring");
    } finally {
      setIsRefreshing(false);
    }
  };

  const latest = history[0];
  const score = latest ? Math.round(latest.skor_kelayakan) : 0;
  const risk = score >= 75 ? "Low Risk" : score >= 50 ? "Medium Risk" : "High Risk";
  const scoreFactors = latest ? buildFactors(latest) : [];

  const scoreColor = score >= 75 ? "#1d4ed8" : score >= 50 ? "#f59e0b" : "#ef4444";
  const riskBadge = score >= 75 ? styles.badgeGreen : score >= 50 ? styles.badgeYellow : styles.badgeRed;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (score / maxScore) * circumference;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Penilaian Kelayakan Usaha</h1>
          <p className={styles.subtitle}>
            Hasil analisis model penilaian otomatis terhadap data usaha Anda. Skor dihitung dari data keuangan riil.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={styles.btnPrimary}
          style={{ padding: "0.65rem 1.25rem", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: "0.9rem" }}
        >
          {isRefreshing ? (
            <><Refresh style={{ verticalAlign: "-0.125em" }} /> Memproses...</>
          ) : (
            <><Refresh style={{ verticalAlign: "-0.125em" }} /> Trigger Scoring Ulang</>
          )}
        </button>
      </header>

      {error && (
        <div style={{ padding: "0.85rem 1rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, color: "#ef4444", fontSize: "0.85rem", fontWeight: 600 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className={`${styles.sectionCard} glass`} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
          Memuat hasil analisis AI...
        </div>
      ) : !latest ? (
        <div className={`${styles.sectionCard} glass`} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
          Belum ada hasil scoring. Klik <strong>Trigger Scoring Ulang</strong> untuk menjalankan analisis AI pertama kali.
        </div>
      ) : (
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "1.5rem" }}>

        {/* Score Summary Card */}
        <div className={`${styles.sectionCard} glass`} style={{ alignItems: "center", justifyContent: "center", minWidth: 280 }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-color)", marginBottom: "1.5rem", textAlign: "center" }}>
            Skor Kelayakan Anda
          </h3>

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

          <div style={{ textAlign: "center", marginTop: "1.25rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            <span className={`${styles.badge} ${riskBadge}`} style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }}>
              {risk}
            </span>
            <span className={`${styles.badge} ${styles.badgeBlue}`} style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }}>
              Akad: {latest.akad}
            </span>
          </div>

          <div style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
            <p>Model: <strong style={{ color: "var(--text-color)" }}>Otomatis</strong></p>
            <p style={{ marginTop: "0.25rem" }}>Analisis #{latest.id}</p>
          </div>
        </div>

        {/* Score Factors */}
        <div className={`${styles.sectionCard} glass`}>
          <div className={styles.sectionHeader}>
            <h3>Faktor Penilaian Kredit</h3>
            <span className={`${styles.badge} ${styles.badgeBlue}`}>6 Parameter</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {scoreFactors.map((factor, i) => {
              const good = factor.bar >= 60;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-color)" }}>{factor.label}</span>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Bobot: {factor.weight}</span>
                      <span style={{ fontSize: "0.8rem", fontWeight: 800, color: good ? "#1d4ed8" : "#f59e0b" }}>
                        {factor.raw}
                      </span>
                    </div>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${factor.bar}%`,
                        background: good
                          ? "linear-gradient(90deg, #1d4ed8, #0ea5e9)"
                          : "linear-gradient(90deg, #f59e0b, #d97706)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* Recommendations */}
      <div className={`${styles.sectionCard} glass`}>
        <div className={styles.sectionHeader}>
          <h3><Lightbulb style={{ verticalAlign: "-0.125em" }} /> Rekomendasi Peningkatan Usaha</h3>
          <span className={`${styles.badge} ${styles.badgeYellow}`}>Rekomendasi</span>
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
          <h3>Riwayat Analisis Skor</h3>
          <span className={`${styles.badge} ${styles.badgeBlue}`}>{history.length} Analisis</span>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID Analisis</th>
                <th>Skor</th>
                <th>Kategori Risiko</th>
                <th>Rekomendasi Akad</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: "1rem" }}>Belum ada riwayat.</td></tr>
              ) : history.map((row) => {
                const s = Math.round(row.skor_kelayakan);
                const r = s >= 75 ? "Low Risk" : s >= 50 ? "Medium Risk" : "High Risk";
                return (
                  <tr key={row.id}>
                    <td>#{row.id}</td>
                    <td style={{ fontWeight: 800, color: "var(--text-color)" }}>{s}/100</td>
                    <td>
                      <span className={`${styles.badge} ${s >= 75 ? styles.badgeGreen : s >= 50 ? styles.badgeYellow : styles.badgeRed}`}>
                        {r}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{row.akad}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

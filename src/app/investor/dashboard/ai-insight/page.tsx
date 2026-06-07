"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

interface RecommendedUMKM {
  id: string;
  name: string;
  category: string;
  label: "Recommended" | "High Risk" | "Stable Growth";
  aiScore: number;
  estimatedProfit: string;
  roi: string;
  reason: string;
  risk: "Low" | "Medium" | "High";
}

const recommendations: RecommendedUMKM[] = [
  {
    id: "UMK-005", name: "Peternakan Sapi Makmur", category: "Agrikultur", label: "Recommended",
    aiScore: 91, estimatedProfit: "Rp 14-18 Jt / tahun", roi: "11-14%",
    reason: "Konsistensi omzet tinggi, rendah volatilitas, histori pembayaran 100% on-time.",
    risk: "Low",
  },
  {
    id: "UMK-001", name: "Toko Sembako Berkah", category: "Perdagangan", label: "Stable Growth",
    aiScore: 84, estimatedProfit: "Rp 8-12 Jt / tahun", roi: "8-10%",
    reason: "Pertumbuhan stabil 12% YoY, margin tinggi di sektor kebutuhan primer.",
    risk: "Low",
  },
  {
    id: "UMK-002", name: "Kopi Nusantara Mandiri", category: "F&B", label: "Stable Growth",
    aiScore: 79, estimatedProfit: "Rp 7-10 Jt / tahun", roi: "7-9%",
    reason: "Tren kopi premium meningkat, UMKM sudah 3 tahun beroperasi dengan rekam jejak baik.",
    risk: "Low",
  },
  {
    id: "UMK-006", name: "Konveksi Mandiri Jaya", category: "Fashion", label: "High Risk",
    aiScore: 44, estimatedProfit: "Rp 13-19 Jt / tahun", roi: "13-16%",
    reason: "Return tinggi namun volatilitas musiman tinggi. Tidak cocok untuk investor konservatif.",
    risk: "High",
  },
];

export default function AIInsightPage() {
  const [activeProfile, setActiveProfile] = useState<"conservative" | "balanced" | "aggressive">("balanced");

  const profileDescription = {
    conservative: "Return stabil 6-9%, risiko rendah, cocok untuk investasi jangka panjang.",
    balanced: "Return 8-12%, mix risiko low-medium, portofolio terdiversifikasi.",
    aggressive: "Return 12-18%, risiko tinggi, potensi keuntungan maksimal.",
  };

  const filtered = activeProfile === "conservative"
    ? recommendations.filter((r) => r.risk === "Low")
    : activeProfile === "aggressive"
    ? recommendations
    : recommendations.filter((r) => r.risk !== "High");

  const labelStyle = (label: string) =>
    label === "Recommended" ? styles.labelRec : label === "High Risk" ? styles.labelHigh : styles.labelStable;

  return (
    <div className={styles.page}>
      {/* AI Header */}
      <div className={styles.aiHeader}>
        <div className={styles.aiIconBox}>🤖</div>
        <div>
          <h2 className={styles.aiTitle}>AI Smart Recommendation</h2>
          <p className={styles.aiDesc}>
            Rekomendasi UMKM dipersonalisasi berdasarkan profil risiko Anda, dihasilkan oleh model XGBoost yang dilatih dengan 50.000+ data transaksi syariah.
          </p>
        </div>
      </div>

      {/* Investor Profile Selector */}
      <div className={styles.profileSection}>
        <h3 className={styles.sectionTitle}>Profil Risiko Anda</h3>
        <div className={styles.profileBtns}>
          {(["conservative", "balanced", "aggressive"] as const).map((p) => (
            <button
              key={p}
              className={`${styles.profileBtn} ${activeProfile === p ? styles.profileBtnActive : ""}`}
              onClick={() => setActiveProfile(p)}
            >
              <span>{p === "conservative" ? "🛡️" : p === "balanced" ? "⚖️" : "🚀"}</span>
              <span className={styles.profileLabel}>
                {p === "conservative" ? "Konservatif" : p === "balanced" ? "Balanced" : "Agresif"}
              </span>
            </button>
          ))}
        </div>
        <p className={styles.profileDesc}>{profileDescription[activeProfile]}</p>
      </div>

      {/* AI Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📊</span>
          <div>
            <p className={styles.statVal}>50.000+</p>
            <p className={styles.statLabel}>Data Training XGBoost</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🎯</span>
          <div>
            <p className={styles.statVal}>94.2%</p>
            <p className={styles.statLabel}>Akurasi Prediksi Model</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🔄</span>
          <div>
            <p className={styles.statVal}>Real-time</p>
            <p className={styles.statLabel}>Update Scoring Harian</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className={styles.sectionTitle}>
          Rekomendasi untuk Anda ({filtered.length} UMKM)
        </h3>
        <div className={styles.recList}>
          {filtered.map((umkm) => (
            <div key={umkm.id} className={styles.recCard}>
              <div className={styles.recTop}>
                <div className={styles.recInfo}>
                  <div className={styles.recNameRow}>
                    <h4 className={styles.recName}>{umkm.name}</h4>
                    <span className={`${styles.recLabel} ${labelStyle(umkm.label)}`}>{umkm.label}</span>
                  </div>
                  <p className={styles.recCategory}>{umkm.category}</p>
                </div>
                <div className={styles.recScore}>
                  <span className={styles.scoreNum}>{umkm.aiScore}</span>
                  <span className={styles.scoreMax}>/100</span>
                </div>
              </div>

              <div className={styles.scoreBar}>
                <div
                  className={`${styles.scoreFill} ${umkm.aiScore >= 75 ? styles.fillGreen : umkm.aiScore >= 55 ? styles.fillYellow : styles.fillRed}`}
                  style={{ width: `${umkm.aiScore}%` }}
                ></div>
              </div>

              <p className={styles.recReason}>💡 {umkm.reason}</p>

              <div className={styles.recMetrics}>
                <div className={styles.recMetric}>
                  <span className={styles.mLabel}>Est. Profit</span>
                  <span className={styles.mVal}>{umkm.estimatedProfit}</span>
                </div>
                <div className={styles.recMetric}>
                  <span className={styles.mLabel}>ROI</span>
                  <span className={styles.mValGreen}>{umkm.roi}</span>
                </div>
                <div className={styles.recMetric}>
                  <span className={styles.mLabel}>Risk Level</span>
                  <span className={`${styles.mVal} ${umkm.risk === "Low" ? styles.colorGreen : umkm.risk === "Medium" ? styles.colorYellow : styles.colorRed}`}>
                    {umkm.risk}
                  </span>
                </div>
              </div>

              <Link href="/investor/dashboard/investasi" className={styles.investBtn}>
                Investasi Sekarang
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

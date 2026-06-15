"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

interface RecommendedUMKM {
  id: string;
  name: string;
  category: string;
  label: string;
  aiScore: number;
  estimatedProfit: string;
  roi: string;
  reason: string;
  risk: string;
}

type Profile = "conservative" | "balanced" | "aggressive";

function getInvestorId() {
  if (typeof window === "undefined") return "";
  try {
    return (
      JSON.parse(sessionStorage.getItem("synergy_investor_session") ?? "{}")
        .investorProfileId ?? ""
    );
  } catch {
    return "";
  }
}

export default function AIInsightPage() {
  const [recommendations, setRecommendations] = useState<RecommendedUMKM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState<Profile>("balanced");

  const loadRecommendations = (profile: Profile) => {
    setIsLoading(true);
    fetch(`/api/investor/ai-insight?profile=${profile}`)
      .then((r) => r.json())
      .then((d: RecommendedUMKM[]) => setRecommendations(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadRecommendations(activeProfile);
  }, [activeProfile]);

  const profileDescription = {
    conservative:
      "Return stabil 6-9%, risiko rendah, cocok untuk investasi jangka panjang.",
    balanced:
      "Return 8-12%, mix risiko low-medium, portofolio terdiversifikasi.",
    aggressive: "Return 12-18%, risiko tinggi, potensi keuntungan maksimal.",
  };

  const labelStyle = (label: string) =>
    label === "Recommended"
      ? styles.labelRec
      : label === "High Risk"
        ? styles.labelHigh
        : styles.labelStable;

  return (
    <div className={styles.page}>
      <div className={styles.aiHeader}>
        <div className={styles.aiIconBox}>🤖</div>
        <div>
          <h2 className={styles.aiTitle}>AI Scoring</h2>
          <p className={styles.aiDesc}>
            Hasil scoring UMKM dipersonalisasi berdasarkan profil risiko Anda,
            dihasilkan oleh model XGBoost yang dilatih dengan 50.000+ data
            transaksi syariah.
          </p>
        </div>
      </div>

      <div className={styles.profileSection}>
        <h3 className={styles.sectionTitle}>Profil Risiko Anda</h3>
        <div className={styles.profileBtns}>
          {(["conservative", "balanced", "aggressive"] as Profile[]).map(
            (p) => (
              <button
                key={p}
                className={`${styles.profileBtn} ${activeProfile === p ? styles.profileBtnActive : ""}`}
                onClick={() => setActiveProfile(p)}
              >
                <span>
                  {p === "conservative" ? "🛡️" : p === "balanced" ? "⚖️" : "🚀"}
                </span>
                <span className={styles.profileLabel}>
                  {p === "conservative"
                    ? "Konservatif"
                    : p === "balanced"
                      ? "Balanced"
                      : "Agresif"}
                </span>
              </button>
            ),
          )}
        </div>
        <p className={styles.profileDesc}>
          {profileDescription[activeProfile]}
        </p>
      </div>

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

      <div>
        <h3 className={styles.sectionTitle}>
          Rekomendasi untuk Anda{" "}
          {!isLoading && `(${recommendations.length} UMKM)`}
        </h3>
        {isLoading ? (
          <p style={{ padding: "1rem", color: "var(--text-muted)" }}>
            Memuat rekomendasi AI...
          </p>
        ) : (
          <div className={styles.recList}>
            {recommendations.map((umkm) => (
              <div key={umkm.id} className={styles.recCard}>
                <div className={styles.recTop}>
                  <div className={styles.recInfo}>
                    <div className={styles.recNameRow}>
                      <h4 className={styles.recName}>{umkm.name}</h4>
                      <span
                        className={`${styles.recLabel} ${labelStyle(umkm.label)}`}
                      >
                        {umkm.label}
                      </span>
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
                  />
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
                    <span
                      className={`${styles.mVal} ${umkm.risk === "LOW" ? styles.colorGreen : umkm.risk === "MEDIUM" ? styles.colorYellow : styles.colorRed}`}
                    >
                      {umkm.risk}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/investor/dashboard/investasi?campaignId=${umkm.id}`}
                  className={styles.investBtn}
                >
                  Investasi Sekarang
                </Link>
              </div>
            ))}
            {recommendations.length === 0 && (
              <p style={{ padding: "1rem", color: "var(--text-muted)" }}>
                Tidak ada rekomendasi untuk profil ini.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface AIInsight {
  id: string;
  type: "positive" | "negative" | "warning";
  text: string;
}

interface UmkmApplication {
  id: string;
  name: string;
  category: string;
  targetFunding: string;
  tenor: string;
  nisbah: string;
  score: number; // 0-100 XGBoost Score
  riskCategory: "Low Risk" | "Medium Risk" | "High Risk";
  insights: AIInsight[];
}

export default function UmkmApprovalPage() {
  const [applications, setApplications] = useState<UmkmApplication[]>([
    {
      id: "UMKM-001",
      name: "Toko Sembako Berkah",
      category: "Perdagangan",
      targetFunding: "Rp 50.000.000",
      tenor: "12 Bulan",
      nisbah: "60:40 (Investor:UMKM)",
      score: 88,
      riskCategory: "Low Risk",
      insights: [
        { id: "i1", type: "positive", text: "Pertumbuhan arus kas konsisten positif selama 6 bulan terakhir." },
        { id: "i2", type: "positive", text: "Rasio hutang rendah (Debt-to-Equity Ratio sehat)." },
        { id: "i3", type: "warning", text: "Persaingan tinggi di sektor perdagangan sembako lokal." },
      ],
    },
    {
      id: "UMKM-002",
      name: "Konveksi Baju Nusantara",
      category: "Manufaktur & Pakaian",
      targetFunding: "Rp 150.000.000",
      tenor: "24 Bulan",
      nisbah: "70:30 (Investor:UMKM)",
      score: 65,
      riskCategory: "Medium Risk",
      insights: [
        { id: "i4", type: "positive", text: "Memiliki kontrak rutin dengan instansi pemerintah lokal." },
        { id: "i5", type: "negative", text: "Pengeluaran operasional meningkat drastis bulan lalu." },
      ],
    },
    {
      id: "UMKM-003",
      name: "Warung Makan Sedap Malam",
      category: "Kuliner",
      targetFunding: "Rp 25.000.000",
      tenor: "6 Bulan",
      nisbah: "50:50 (Investor:UMKM)",
      score: 42,
      riskCategory: "High Risk",
      insights: [
        { id: "i6", type: "negative", text: "Omzet tidak stabil dan berfluktuasi tajam." },
        { id: "i7", type: "negative", text: "Catatan laporan keuangan tidak lengkap di bulan ke-2 dan 3." },
      ],
    },
  ]);

  const [selectedUmkm, setSelectedUmkm] = useState<UmkmApplication | null>(applications[0] || null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleApprove = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
    setToastMessage("🚀 UMKM berhasil disetujui dan diorbitkan ke Marketplace Investor!");
    setShowToast(true);
    
    // Auto hide toast and select next
    setTimeout(() => {
      setShowToast(false);
      const remaining = applications.filter((app) => app.id !== id);
      setSelectedUmkm(remaining.length > 0 ? remaining[0] : null);
    }, 3000);
  };

  const handleReject = (id: string) => {
    const reason = prompt("Masukkan alasan penolakan pendanaan UMKM ini:");
    if (reason !== null) {
      setApplications((prev) => prev.filter((app) => app.id !== id));
      setToastMessage("❌ Pengajuan UMKM ditolak.");
      setShowToast(true);
      
      setTimeout(() => {
        setShowToast(false);
        const remaining = applications.filter((app) => app.id !== id);
        setSelectedUmkm(remaining.length > 0 ? remaining[0] : null);
      }, 3000);
    }
  };

  const handleRetrainScoring = () => {
    if (selectedUmkm) {
      setToastMessage("🔄 Memicu ulang model XGBoost AI untuk recalculation...");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
  };

  // Helper for SVG Gauge Math
  const getGaugeProps = (score: number) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    let color = "#ef4444"; // Red for High Risk
    if (score >= 80) color = "#10b981"; // Green for Low Risk
    else if (score >= 60) color = "#f59e0b"; // Orange for Medium Risk
    
    return { circumference, strokeDashoffset, color };
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Review & Approval Kelayakan UMKM</h1>
          <p>Validasi hasil prediksi XGBoost AI sebelum mempublikasikan kampanye pendanaan ke Marketplace Investor.</p>
        </div>
      </header>

      {/* Toast Notification */}
      <div className={`${styles.toast} ${showToast ? styles.toastVisible : ""}`}>
        {toastMessage}
      </div>

      <div className={styles.splitLayout}>
        {/* LEFT PANE: List of UMKM Applications */}
        <aside className={`${styles.listPane} glass`}>
          <div className={styles.paneHeader}>
            <h3>Daftar Pengajuan ({applications.length})</h3>
          </div>
          <div className={styles.appList}>
            {applications.length === 0 ? (
              <div className={styles.emptyList}>
                <span className={styles.emptyIcon}>✨</span>
                <p>Semua permohonan telah selesai di-review.</p>
              </div>
            ) : (
              applications.map((app) => (
                <button
                  key={app.id}
                  className={`${styles.appItem} ${selectedUmkm?.id === app.id ? styles.appItemActive : ""}`}
                  onClick={() => setSelectedUmkm(app)}
                >
                  <div className={styles.appItemTop}>
                    <h4>{app.name}</h4>
                    <span className={styles.scorePill} style={{
                      backgroundColor: app.score >= 80 ? 'rgba(16, 185, 129, 0.1)' : app.score >= 60 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: app.score >= 80 ? '#10b981' : app.score >= 60 ? '#f59e0b' : '#ef4444'
                    }}>
                      Skor: {app.score}
                    </span>
                  </div>
                  <div className={styles.appItemBottom}>
                    <span className={styles.appCategory}>{app.category}</span>
                    <span className={styles.appTarget}>{app.targetFunding}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* RIGHT PANE: Detailed AI Scoring Analysis */}
        <main className={`${styles.detailPane} glass`}>
          {!selectedUmkm ? (
            <div className={styles.emptyDetail}>
              <span className={styles.emptyIconLg}>📊</span>
              <h3>Pilih UMKM untuk dianalisis</h3>
              <p>Pilih pengajuan dari daftar di sebelah kiri untuk melihat detail skor kelayakan dari model XGBoost AI.</p>
            </div>
          ) : (
            <div className={styles.detailContent}>
              <div className={styles.detailHeader}>
                <div>
                  <h2>{selectedUmkm.name}</h2>
                  <p className={styles.umkmId}>ID Registrasi: {selectedUmkm.id} | Kategori: {selectedUmkm.category}</p>
                </div>
                <div className={styles.actionGroupTop}>
                  <button onClick={handleRetrainScoring} className={styles.btnSecondary} title="Jalankan ulang prediksi AI dengan data terbaru">
                    <span className={styles.iconSync}>🔄</span> Trigger AI Ulang
                  </button>
                </div>
              </div>

              {/* AI Scoring Visualization Section */}
              <div className={styles.aiScoringSection}>
                <div className={styles.gaugeContainer}>
                  {(() => {
                    const { circumference, strokeDashoffset, color } = getGaugeProps(selectedUmkm.score);
                    return (
                      <div className={styles.gaugeWrapper}>
                        <svg className={styles.gaugeSvg} width="160" height="160" viewBox="0 0 160 160">
                          {/* Background Circle */}
                          <circle
                            cx="80" cy="80" r="60"
                            fill="none"
                            stroke="rgba(148, 163, 184, 0.2)"
                            strokeWidth="12"
                          />
                          {/* Progress Circle */}
                          <circle
                            cx="80" cy="80" r="60"
                            fill="none"
                            stroke={color}
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 80 80)"
                            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                          />
                        </svg>
                        <div className={styles.gaugeText}>
                          <span className={styles.gaugeValue} style={{ color }}>{selectedUmkm.score}</span>
                          <span className={styles.gaugeLabel}>/100</span>
                        </div>
                      </div>
                    );
                  })()}
                  <div className={styles.riskBadgeWrapper}>
                    <span className={styles.riskLabel}>Kategori Risiko AI:</span>
                    <span className={styles.riskBadge} style={{
                      backgroundColor: selectedUmkm.score >= 80 ? '#10b981' : selectedUmkm.score >= 60 ? '#f59e0b' : '#ef4444'
                    }}>
                      {selectedUmkm.riskCategory}
                    </span>
                  </div>
                </div>

                <div className={styles.insightsContainer}>
                  <h3>XGBoost AI Insights</h3>
                  <ul className={styles.insightsList}>
                    {selectedUmkm.insights.map((insight) => (
                      <li key={insight.id} className={styles.insightItem}>
                        <span className={`${styles.insightIcon} ${
                          insight.type === 'positive' ? styles.iconPos :
                          insight.type === 'warning' ? styles.iconWarn : styles.iconNeg
                        }`}>
                          {insight.type === 'positive' ? '✅' : insight.type === 'warning' ? '⚠️' : '🚨'}
                        </span>
                        <span className={styles.insightText}>{insight.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Financial Metrics Section */}
              <div className={styles.financialSection}>
                <h3>Detail Permohonan Pendanaan</h3>
                <div className={styles.metricsGrid}>
                  <div className={styles.metricBox}>
                    <span className={styles.metricLabel}>Target Pendanaan</span>
                    <span className={styles.metricVal}>{selectedUmkm.targetFunding}</span>
                  </div>
                  <div className={styles.metricBox}>
                    <span className={styles.metricLabel}>Tenor Investasi</span>
                    <span className={styles.metricVal}>{selectedUmkm.tenor}</span>
                  </div>
                  <div className={styles.metricBox}>
                    <span className={styles.metricLabel}>Nisbah Bagi Hasil</span>
                    <span className={styles.metricVal}>{selectedUmkm.nisbah}</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className={styles.detailFooter}>
                <button 
                  onClick={() => handleReject(selectedUmkm.id)}
                  className={`${styles.btnAction} ${styles.btnReject}`}
                >
                  Tolak Pendanaan
                </button>
                <button 
                  onClick={() => handleApprove(selectedUmkm.id)}
                  className={`${styles.btnAction} ${styles.btnApprove}`}
                  disabled={selectedUmkm.score < 50}
                  title={selectedUmkm.score < 50 ? "Skor terlalu rendah untuk disetujui" : ""}
                >
                  🚀 Setujui & Orbitkan ke Marketplace
                </button>
              </div>

              {selectedUmkm.score < 50 && (
                <div className={styles.systemWarning}>
                  <span style={{color: '#ef4444', fontWeight: 'bold'}}>⚠️ Peringatan Sistem:</span> Skor AI di bawah ambang batas aman (50). Sistem menonaktifkan persetujuan otomatis.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

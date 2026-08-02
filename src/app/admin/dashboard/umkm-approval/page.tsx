"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import { Sparkles, BarChart, Refresh, CheckCircle, AlertTriangle, AlertOctagon, Rocket } from "@/components/icons";

interface AIInsight {
  type: "positive" | "negative" | "warning";
  text: string;
}

interface UmkmApplication {
  id: string;
  name: string;
  category: string;
  targetFunding: number;
  tenor: number;
  akadType: string;
  status: string;
  purpose: string;
  score: number | null;
  riskLevel: string | null;
  insights: AIInsight[] | null;
}

export default function UmkmApprovalPage() {
  const [applications, setApplications] = useState<UmkmApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUmkm, setSelectedUmkm] = useState<UmkmApplication | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toast = useCallback((msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/umkm-approval?status=PENDING");
    const data: UmkmApplication[] = await res.json();
    setApplications(data);
    setSelectedUmkm(data[0] ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApprove = async (id: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/umkm-approval/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (res.ok) {
        const remaining = applications.filter((a) => a.id !== id);
        setApplications(remaining);
        setSelectedUmkm(remaining[0] ?? null);
        toast("UMKM berhasil disetujui dan diorbitkan ke Marketplace Investor!");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Masukkan alasan penolakan pendanaan UMKM ini:");
    if (reason === null) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/umkm-approval/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason }),
      });
      if (res.ok) {
        const remaining = applications.filter((a) => a.id !== id);
        setApplications(remaining);
        setSelectedUmkm(remaining[0] ?? null);
        toast("Pengajuan UMKM ditolak.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetrainScoring = () => {
    if (selectedUmkm) {
      toast("Menghitung ulang penilaian usaha...");
    }
  };

  const getGaugeProps = (score: number) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    let color = "#ef4444";
    if (score >= 80) color = "#10b981";
    else if (score >= 60) color = "#f59e0b";
    return { circumference, strokeDashoffset, color };
  };

  const fmtRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  const getRiskLabel = (score: number | null) => {
    if (score === null) return "Belum Dinilai";
    if (score >= 80) return "Low Risk";
    if (score >= 60) return "Medium Risk";
    return "High Risk";
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "4rem", opacity: 0.6 }}>Memuat data...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Review & Approval Kelayakan UMKM</h1>
          <p>
            Validasi hasil penilaian sebelum mempublikasikan kampanye pendanaan ke
            Marketplace Investor.
          </p>
        </div>
      </header>

      <div className={`${styles.toast} ${showToast ? styles.toastVisible : ""}`}>
        {toastMessage}
      </div>

      <div className={styles.splitLayout}>
        <aside className={`${styles.listPane} glass`}>
          <div className={styles.paneHeader}>
            <h3>Daftar Pengajuan ({applications.length})</h3>
          </div>
          <div className={styles.appList}>
            {applications.length === 0 ? (
              <div className={styles.emptyList}>
                <span className={styles.emptyIcon}><Sparkles /></span>
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
                    {app.score !== null && (
                      <span
                        className={styles.scorePill}
                        style={{
                          backgroundColor:
                            app.score >= 80
                              ? "rgba(16,185,129,0.1)"
                              : app.score >= 60
                              ? "rgba(245,158,11,0.1)"
                              : "rgba(239,68,68,0.1)",
                          color:
                            app.score >= 80 ? "#10b981" : app.score >= 60 ? "#f59e0b" : "#ef4444",
                        }}
                      >
                        Skor: {app.score.toFixed(0)}
                      </span>
                    )}
                  </div>
                  <div className={styles.appItemBottom}>
                    <span className={styles.appCategory}>{app.category}</span>
                    <span className={styles.appTarget}>{fmtRupiah(app.targetFunding)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className={`${styles.detailPane} glass`}>
          {!selectedUmkm ? (
            <div className={styles.emptyDetail}>
              <span className={styles.emptyIconLg}><BarChart /></span>
              <h3>Pilih UMKM untuk dianalisis</h3>
              <p>
                Pilih pengajuan dari daftar di sebelah kiri untuk melihat detail skor kelayakan
                dari sistem penilaian.
              </p>
            </div>
          ) : (
            <div className={styles.detailContent}>
              <div className={styles.detailHeader}>
                <div>
                  <h2>{selectedUmkm.name}</h2>
                  <p className={styles.umkmId}>
                    ID: {selectedUmkm.id.slice(0, 10)}... | Kategori: {selectedUmkm.category}
                  </p>
                </div>
                <div className={styles.actionGroupTop}>
                  <button
                    onClick={handleRetrainScoring}
                    className={styles.btnSecondary}
                    title="Jalankan ulang prediksi AI dengan data terbaru"
                  >
                    <span className={styles.iconSync}><Refresh /></span> Trigger AI Ulang
                  </button>
                </div>
              </div>

              <div className={styles.aiScoringSection}>
                <div className={styles.gaugeContainer}>
                  {selectedUmkm.score !== null ? (
                    (() => {
                      const { circumference, strokeDashoffset, color } = getGaugeProps(
                        selectedUmkm.score
                      );
                      return (
                        <div className={styles.gaugeWrapper}>
                          <svg className={styles.gaugeSvg} width="160" height="160" viewBox="0 0 160 160">
                            <circle
                              cx="80" cy="80" r="60"
                              fill="none"
                              stroke="rgba(148,163,184,0.2)"
                              strokeWidth="12"
                            />
                            <circle
                              cx="80" cy="80" r="60"
                              fill="none"
                              stroke={color}
                              strokeWidth="12"
                              strokeLinecap="round"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              transform="rotate(-90 80 80)"
                              style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                            />
                          </svg>
                          <div className={styles.gaugeText}>
                            <span className={styles.gaugeValue} style={{ color }}>
                              {selectedUmkm.score.toFixed(0)}
                            </span>
                            <span className={styles.gaugeLabel}>/100</span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className={styles.gaugeWrapper} style={{ opacity: 0.5 }}>
                      <p>Belum ada skor AI</p>
                    </div>
                  )}
                  <div className={styles.riskBadgeWrapper}>
                    <span className={styles.riskLabel}>Kategori Risiko:</span>
                    <span
                      className={styles.riskBadge}
                      style={{
                        backgroundColor:
                          selectedUmkm.score === null
                            ? "#6b7280"
                            : selectedUmkm.score >= 80
                            ? "#10b981"
                            : selectedUmkm.score >= 60
                            ? "#f59e0b"
                            : "#ef4444",
                      }}
                    >
                      {getRiskLabel(selectedUmkm.score)}
                    </span>
                  </div>
                </div>

                <div className={styles.insightsContainer}>
                  <h3>Faktor Penilaian</h3>
                  {selectedUmkm.insights && selectedUmkm.insights.length > 0 ? (
                    <ul className={styles.insightsList}>
                      {selectedUmkm.insights.map((insight, idx) => (
                        <li key={idx} className={styles.insightItem}>
                          <span
                            className={`${styles.insightIcon} ${
                              insight.type === "positive"
                                ? styles.iconPos
                                : insight.type === "warning"
                                ? styles.iconWarn
                                : styles.iconNeg
                            }`}
                          >
                            {insight.type === "positive" ? <CheckCircle /> : insight.type === "warning" ? <AlertTriangle /> : <AlertOctagon />}
                          </span>
                          <span className={styles.insightText}>{insight.text}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ opacity: 0.6 }}>Belum ada penilaian untuk pengajuan ini.</p>
                  )}
                </div>
              </div>

              <div className={styles.financialSection}>
                <h3>Detail Permohonan Pendanaan</h3>
                <div className={styles.metricsGrid}>
                  <div className={styles.metricBox}>
                    <span className={styles.metricLabel}>Target Pendanaan</span>
                    <span className={styles.metricVal}>{fmtRupiah(selectedUmkm.targetFunding)}</span>
                  </div>
                  <div className={styles.metricBox}>
                    <span className={styles.metricLabel}>Tenor Investasi</span>
                    <span className={styles.metricVal}>{selectedUmkm.tenor} Bulan</span>
                  </div>
                  <div className={styles.metricBox}>
                    <span className={styles.metricLabel}>Tipe Akad</span>
                    <span className={styles.metricVal}>{selectedUmkm.akadType}</span>
                  </div>
                  <div className={styles.metricBox}>
                    <span className={styles.metricLabel}>Tujuan Dana</span>
                    <span className={styles.metricVal} style={{ fontSize: "0.85rem" }}>
                      {selectedUmkm.purpose}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.detailFooter}>
                <button
                  onClick={() => handleReject(selectedUmkm.id)}
                  className={`${styles.btnAction} ${styles.btnReject}`}
                  disabled={submitting}
                >
                  Tolak Pendanaan
                </button>
                <button
                  onClick={() => handleApprove(selectedUmkm.id)}
                  className={`${styles.btnAction} ${styles.btnApprove}`}
                  disabled={submitting || (selectedUmkm.score !== null && selectedUmkm.score < 50)}
                  title={
                    selectedUmkm.score !== null && selectedUmkm.score < 50
                      ? "Skor terlalu rendah untuk disetujui"
                      : ""
                  }
                >
                  {submitting ? (
                    <>
                      <Refresh style={{ verticalAlign: "-0.125em" }} /> Memproses...
                    </>
                  ) : (
                    <>
                      <Rocket style={{ verticalAlign: "-0.125em" }} /> Setujui & Orbitkan ke Marketplace
                    </>
                  )}
                </button>
              </div>

              {selectedUmkm.score !== null && selectedUmkm.score < 50 && (
                <div className={styles.systemWarning}>
                  <span style={{ color: "#ef4444", fontWeight: "bold" }}><AlertTriangle style={{ verticalAlign: "-0.125em" }} /> Peringatan Sistem:</span>{" "}
                  Skor AI di bawah ambang batas aman (50). Sistem menonaktifkan persetujuan otomatis.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

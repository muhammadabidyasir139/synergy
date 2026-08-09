"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { ArrowLeft, Building, Lightbulb, TrendingUp, MessageCircle } from "@/components/icons";

interface CampaignDetail {
  id: string;
  name: string;
  category: string;
  description: string | null;
  city: string;
  province: string;
  establishedDate: string | null;
  employeeCount: number | null;
  monthlyRevenue: number | null;
  website: string | null;
  media: { type: string; url: string; caption: string | null }[];
  story: string;
  risk: string;
  aiScore: number;
  creditScoring: {
    skorKelayakan: number;
    akad: string;
    analisisId: number;
    currentRatio: number | null;
    netProfitMargin: number | null;
    operatingExpenseRatio: number | null;
    cashflowStabilityRisk: number | null;
    assetTurnoverRatio: number | null;
    revenueGrowth: number | null;
  } | null;
  keyFactors: string[];
  recommendedActions: string[];
  targetAmount: number;
  collectedAmount: number;
  collectedPct: number;
  estimatedRoi: number;
  akadType: string;
  durationMonths: number;
  investorCount: number;
  financialReports: {
    date: string;
    monthlyRevenue: number | null;
    monthlyExpense: number | null;
    dailyRevenue: number | null;
    dailyExpense: number | null;
  }[];
  financeProfile: {
    asetLancar: number;
    asetTidakLancar: number;
    totalHutangKas: number;
    totalPendapatan: number;
    totalBeban: number;
    labaBersih: number;
    rataRataArusKas: number;
  } | null;
  omzetHistory: { tanggal: string; omzet: number }[];
}

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<CampaignDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [chatError, setChatError] = useState("");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const openLightbox = (url: string) => {
    setLightboxUrl(url);
    setZoom(1);
  };
  const closeLightbox = () => {
    setLightboxUrl(null);
    setZoom(1);
  };

  // Tutup lightbox dengan tombol Escape.
  useEffect(() => {
    if (!lightboxUrl) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxUrl]);

  // Membuka (atau membuat) room negosiasi, lalu meminta widget chat menampilkannya.
  const startNegotiation = async () => {
    if (!data || isStartingChat) return;
    setIsStartingChat(true);
    setChatError("");
    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: data.id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Gagal membuka ruang negosiasi.");
      }
      const room = await res.json();
      window.dispatchEvent(
        new CustomEvent("synergy:open-chat", { detail: { roomId: room.id } })
      );
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Gagal membuka ruang negosiasi.");
    } finally {
      setIsStartingChat(false);
    }
  };

  useEffect(() => {
    fetch(`/api/investor/campaigns/${id}`)
      .then((r) => r.json())
      .then((d) => setData(d.error ? null : d))
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const riskColor = (r: string) =>
    r === "LOW" ? styles.riskLow : r === "MEDIUM" ? styles.riskMedium : styles.riskHigh;

  if (isLoading) return <div style={{ padding: "2rem" }}>Memuat detail UMKM...</div>;

  if (!data) {
    return (
      <div className={styles.notFound}>
        <p>UMKM tidak ditemukan.</p>
        <Link href="/investor/dashboard/explore" className={styles.backLink}>
          <ArrowLeft style={{ verticalAlign: "-0.125em" }} /> Kembali ke Marketplace
        </Link>
      </div>
    );
  }

  const gallery = data.media.filter((m) => m.type === "GALLERY");
  const cover = gallery[0];
  const logo = data.media.find((m) => m.type === "LOGO");
  const omzetChartData = data.omzetHistory.slice(-6);
  const maxOmzet = Math.max(...omzetChartData.map((r) => r.omzet), 1);

  const FINANCE_FIELDS: { key: keyof NonNullable<CampaignDetail["financeProfile"]>; label: string }[] = [
    { key: "asetLancar", label: "Aset Lancar" },
    { key: "asetTidakLancar", label: "Aset Tidak Lancar" },
    { key: "totalHutangKas", label: "Total Hutang Kas" },
    { key: "totalPendapatan", label: "Total Pendapatan" },
    { key: "totalBeban", label: "Total Beban" },
    { key: "labaBersih", label: "Laba Bersih" },
    { key: "rataRataArusKas", label: "Rata-rata Arus Kas" },
  ];

  return (
    <div className={styles.page}>
      <Link href="/investor/dashboard/explore" className={styles.backLink}>
        <ArrowLeft style={{ verticalAlign: "-0.125em" }} /> Kembali ke Marketplace
      </Link>

      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover.url} alt={`Kegiatan usaha ${data.name}`} className={styles.cover} />
      )}

      <div className={styles.headerCard}>
        <div className={styles.headerLeft}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.url} alt={`Logo ${data.name}`} className={styles.logo} />
          ) : (
            <div className={styles.logoPlaceholder}><Building /></div>
          )}
          <div>
            <h2 className={styles.name}>{data.name}</h2>
            <p className={styles.meta}>{data.category} • {data.city}{data.province ? `, ${data.province}` : ""}</p>
          </div>
        </div>
        <span className={`${styles.riskBadge} ${riskColor(data.risk)}`}>{data.risk} Risk</span>
      </div>

      <div className={styles.grid}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Tentang Usaha</h3>
            <p className={styles.description}>{data.description ?? data.story}</p>
            <div className={styles.factGrid}>
              <div className={styles.factItem}>
                <span className={styles.factLabel}>Berdiri Sejak</span>
                <span className={styles.factVal}>
                  {data.establishedDate ? new Date(data.establishedDate).getFullYear() : "-"}
                </span>
              </div>
              <div className={styles.factItem}>
                <span className={styles.factLabel}>Jumlah Karyawan</span>
                <span className={styles.factVal}>{data.employeeCount ?? "-"}</span>
              </div>
              <div className={styles.factItem}>
                <span className={styles.factLabel}>Omzet Bulanan</span>
                <span className={styles.factVal}>
                  {data.monthlyRevenue ? formatRp(data.monthlyRevenue) : "-"}
                </span>
              </div>
              <div className={styles.factItem}>
                <span className={styles.factLabel}>Website</span>
                <span className={styles.factVal}>{data.website ?? "-"}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Galeri Kegiatan Usaha</h3>
            {gallery.length === 0 ? (
              <p className={styles.emptyNote}>UMKM belum mengunggah foto kegiatan.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: "0.75rem",
                }}
              >
                {gallery.map((m, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => openLightbox(m.url)}
                    style={{
                      padding: 0,
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.35rem",
                      textAlign: "left",
                    }}
                    title={m.caption ?? "Foto kegiatan usaha"}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.url}
                      alt={m.caption ?? `Foto kegiatan ${data.name} #${i + 1}`}
                      style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 10, display: "block" }}
                    />
                    {m.caption && (
                      <span style={{ fontSize: "0.75rem", opacity: 0.7, lineHeight: 1.3 }}>{m.caption}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Laporan Keuangan</h3>
            {data.financialReports.length === 0 ? (
              <p className={styles.emptyNote}>Belum ada laporan keuangan yang tercatat.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Periode</th>
                      <th>Omzet Bulanan</th>
                      <th>Beban Bulanan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.financialReports.map((r, i) => (
                      <tr key={i}>
                        <td>{new Date(r.date).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}</td>
                        <td>{r.monthlyRevenue ? formatRp(r.monthlyRevenue) : "-"}</td>
                        <td>{r.monthlyExpense ? formatRp(r.monthlyExpense) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Profil Keuangan</h3>
            {data.financeProfile ? (
              <div className={styles.factGrid}>
                {FINANCE_FIELDS.map(({ key, label }) => (
                  <div className={styles.factItem} key={key}>
                    <span className={styles.factLabel}>{label}</span>
                    <span className={styles.factVal}>{formatRp(data.financeProfile![key])}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyNote}>UMKM belum melengkapi profil keuangan.</p>
            )}
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <TrendingUp style={{ verticalAlign: "-0.125em" }} /> Pertumbuhan Omzet
            </h3>
            {omzetChartData.length === 0 ? (
              <p className={styles.emptyNote}>Belum ada laporan omzet dari Monitoring Usaha.</p>
            ) : (
              <div className={styles.chartContainer}>
                <div className={styles.chartLabelY}>
                  <span>{(maxOmzet / 1_000_000).toFixed(0)} Jt</span>
                  <span>{((maxOmzet * 0.66) / 1_000_000).toFixed(0)} Jt</span>
                  <span>{((maxOmzet * 0.33) / 1_000_000).toFixed(0)} Jt</span>
                  <span>0</span>
                </div>
                {omzetChartData.map((r, i) => {
                  const h = (r.omzet / maxOmzet) * 100;
                  const label = new Date(r.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
                  return (
                    <div key={i} className={styles.chartBarWrapper}>
                      <div className={styles.chartBar} style={{ height: `${h}%` }}>
                        <div className={styles.chartTooltip}>Rp {(r.omzet / 1_000_000).toFixed(1)} Jt</div>
                      </div>
                      <span className={styles.chartLabelX}>{label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Faktor Penilaian</h3>
            <div className={styles.aiScoreRow}>
              <span>Skor Kelayakan Usaha</span>
              <strong>{data.aiScore}/100</strong>
            </div>
            <div className={styles.scoreBar}>
              <div
                className={`${styles.scoreBarFill} ${data.aiScore >= 75 ? styles.fillGreen : data.aiScore >= 55 ? styles.fillYellow : styles.fillRed}`}
                style={{ width: `${data.aiScore}%` }}
              />
            </div>
            {data.creditScoring ? (
              <>
                <div className={styles.aiScoreRow} style={{ marginTop: "0.75rem" }}>
                  <span>Rekomendasi Akad</span>
                  <strong>{data.creditScoring.akad}</strong>
                </div>
                <div className={styles.insightList}>
                  {[
                    { label: "Margin Laba Bersih", val: data.creditScoring.netProfitMargin, fmt: (v: number) => `${(v * 100).toFixed(1)}%` },
                    { label: "Perputaran Aset", val: data.creditScoring.assetTurnoverRatio, fmt: (v: number) => `${v.toFixed(2)}×` },
                    { label: "Current Ratio", val: data.creditScoring.currentRatio, fmt: (v: number) => v.toFixed(2) },
                    { label: "Stabilitas Arus Kas", val: data.creditScoring.cashflowStabilityRisk, fmt: (v: number) => v.toFixed(3) },
                    { label: "Rasio Beban Operasional", val: data.creditScoring.operatingExpenseRatio, fmt: (v: number) => `${(v * 100).toFixed(1)}%` },
                    { label: "Pertumbuhan Pendapatan", val: data.creditScoring.revenueGrowth, fmt: (v: number) => `${(v * 100).toFixed(1)}%` },
                  ].map((r, i) => (
                    <div key={i} className={styles.aiScoreRow} style={{ fontSize: "0.85rem" }}>
                      <span>{r.label}</span>
                      <strong>{r.val == null ? "—" : r.fmt(r.val)}</strong>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "0.72rem", opacity: 0.55, marginTop: "0.5rem" }}>
                  Dihitung otomatis · Analisis #{data.creditScoring.analisisId}
                </p>
              </>
            ) : (
              <p style={{ fontSize: "0.8rem", opacity: 0.6, marginTop: "0.5rem" }}>
                Belum ada hasil analisis AI untuk UMKM ini.
              </p>
            )}
            {data.keyFactors.length > 0 && (
              <div className={styles.insightList}>
                {data.keyFactors.map((f, i) => (
                  <div key={i} className={styles.insightItem}>
                    <TrendingUp style={{ verticalAlign: "-0.125em", flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
            )}
            {data.recommendedActions.length > 0 && (
              <div className={styles.insightList}>
                {data.recommendedActions.map((a, i) => (
                  <div key={i} className={styles.insightItem}>
                    <Lightbulb style={{ verticalAlign: "-0.125em", flexShrink: 0 }} /> {a}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Detail Pendanaan</h3>
            <div className={styles.factGrid}>
              <div className={styles.factItem}>
                <span className={styles.factLabel}>Target Dana</span>
                <span className={styles.factVal}>{formatRp(data.targetAmount)}</span>
              </div>
              <div className={styles.factItem}>
                <span className={styles.factLabel}>Est. ROI</span>
                <span className={styles.factVal}>{data.estimatedRoi}%</span>
              </div>
              <div className={styles.factItem}>
                <span className={styles.factLabel}>Jenis Akad</span>
                <span className={styles.factVal}>{data.akadType}</span>
              </div>
              <div className={styles.factItem}>
                <span className={styles.factLabel}>Durasi</span>
                <span className={styles.factVal}>{data.durationMonths} Bulan</span>
              </div>
            </div>
            <div>
              <div className={styles.aiScoreRow}>
                <span>Progress Funding</span>
                <strong>{data.collectedPct}%</strong>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${data.collectedPct}%` }} />
              </div>
              <p className={styles.emptyNote} style={{ marginTop: "0.4rem" }}>
                {formatRp(data.collectedAmount)} terkumpul dari {formatRp(data.targetAmount)} • {data.investorCount} Investor
              </p>
            </div>
            <Link href={`/investor/dashboard/investasi?campaignId=${data.id}`} className={styles.investBtn}>
              Investasi Sekarang
            </Link>
            <button
              type="button"
              className={styles.negotiateBtn}
              onClick={startNegotiation}
              disabled={isStartingChat}
            >
              <MessageCircle size={16} />
              {isStartingChat ? "Membuka…" : "Negosiasi Akad"}
            </button>
            {chatError && <p className={styles.emptyNote}>{chatError}</p>}
          </div>
        </div>
      </div>

      {lightboxUrl && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={closeLightbox}
            aria-label="Tutup"
          >
            ×
          </button>
          <div
            className={styles.lightboxStage}
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => {
              setZoom((z) => Math.min(4, Math.max(1, +(z - e.deltaY * 0.002).toFixed(2))));
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxUrl}
              alt="Foto kegiatan usaha"
              className={`${styles.lightboxImg} ${zoom > 1 ? styles.zoomed : ""}`}
              style={{ transform: `scale(${zoom})` }}
              onClick={() => setZoom((z) => (z > 1 ? 1 : 2))}
              draggable={false}
            />
          </div>
          <span className={styles.lightboxHint}>Klik foto untuk zoom · scroll untuk perbesar · Esc untuk tutup</span>
        </div>
      )}
    </div>
  );
}

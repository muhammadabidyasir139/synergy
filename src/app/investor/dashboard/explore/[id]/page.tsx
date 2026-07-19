"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { ArrowLeft, Building, Lightbulb, TrendingUp } from "@/components/icons";

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

  const cover = data.media.find((m) => m.type === "GALLERY");
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
            <h3 className={styles.cardTitle}>XGBoost AI Insights</h3>
            <div className={styles.aiScoreRow}>
              <span>Skor Kelayakan AI</span>
              <strong>{data.aiScore}/100</strong>
            </div>
            <div className={styles.scoreBar}>
              <div
                className={`${styles.scoreBarFill} ${data.aiScore >= 75 ? styles.fillGreen : data.aiScore >= 55 ? styles.fillYellow : styles.fillRed}`}
                style={{ width: `${data.aiScore}%` }}
              />
            </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

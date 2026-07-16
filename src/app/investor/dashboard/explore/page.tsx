"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { Search, Building, ArrowRight, FileText } from "@/components/icons";

interface Campaign {
  id: string;
  name: string;
  category: string;
  city: string;
  logoUrl: string | null;
  coverPhotoUrl: string | null;
  risk: string;
  aiScore: number;
  targetAmount: number;
  collectedPct: number;
  estimatedRoi: number;
  akadType: string;
  durationMonths: number;
  investorCount: number;
}

export default function ExplorePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [filterRisk, setFilterRisk] = useState("Semua");
  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => {
    fetch("/api/investor/campaigns")
      .then((r) => r.json())
      .then((d: Campaign[]) => setCampaigns(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const categories = ["Semua", ...Array.from(new Set(campaigns.map((c) => c.category)))];
  const risks = ["Semua", "LOW", "MEDIUM", "HIGH"];

  const filtered = campaigns
    .filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === "Semua" || c.category === filterCategory;
      const matchRisk = filterRisk === "Semua" || c.risk === filterRisk;
      return matchSearch && matchCat && matchRisk;
    })
    .sort((a, b) => {
      if (sortBy === "popular") return b.investorCount - a.investorCount;
      if (sortBy === "roi") return b.estimatedRoi - a.estimatedRoi;
      if (sortBy === "score") return b.aiScore - a.aiScore;
      return 0;
    });

  const riskColor = (r: string) =>
    r === "LOW" ? styles.riskLow : r === "MEDIUM" ? styles.riskMedium : styles.riskHigh;

  const formatRp = (n: number) =>
    n >= 1_000_000 ? "Rp " + (n / 1_000_000).toFixed(0) + " Jt" : "Rp " + n.toLocaleString("id-ID");

  if (isLoading) return <div style={{ padding: "2rem" }}>Memuat kampanye UMKM...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}><Search /></span>
          <input
            type="text"
            placeholder="Cari UMKM atau kota..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <select className={styles.select} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className={styles.select} value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}>
            {risks.map((r) => <option key={r}>{r}</option>)}
          </select>
          <select className={styles.select} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="popular">Terpopuler</option>
            <option value="roi">Return Tertinggi</option>
            <option value="score">Skor AI Tertinggi</option>
          </select>
        </div>
      </div>

      <p className={styles.resultCount}>{filtered.length} UMKM ditemukan</p>

      <div className={styles.cardGrid}>
        {filtered.map((c) => (
          <div key={c.id} className={styles.umkmCard}>
            {c.coverPhotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.coverPhotoUrl} alt={`Kegiatan usaha ${c.name}`} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10, marginBottom: "0.75rem" }} />
            )}
            <div className={styles.umkmCardHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                {c.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.logoUrl} alt={`Logo ${c.name}`} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Building /></div>
                )}
                <div>
                  <h3 className={styles.umkmName}>{c.name}</h3>
                  <p className={styles.umkmMeta}>{c.category} • {c.city}</p>
                </div>
              </div>
              <span className={`${styles.riskBadge} ${riskColor(c.risk)}`}>{c.risk} Risk</span>
            </div>

            <div className={styles.aiScoreRow}>
              <span className={styles.aiLabel}>Skor AI XGBoost</span>
              <span className={styles.aiScore}>{c.aiScore}/100</span>
            </div>
            <div className={styles.scoreBar}>
              <div
                className={`${styles.scoreBarFill} ${c.aiScore >= 75 ? styles.fillGreen : c.aiScore >= 55 ? styles.fillYellow : styles.fillRed}`}
                style={{ width: `${c.aiScore}%` }}
              />
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Target Dana</span><span className={styles.infoVal}>{formatRp(c.targetAmount)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Est. ROI</span><span className={styles.infoValGreen}>{c.estimatedRoi}%</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Jenis Akad</span><span className={styles.infoVal}>{c.akadType}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Durasi</span><span className={styles.infoVal}>{c.durationMonths} Bulan</span></div>
            </div>

            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>Progress Funding</span>
                <span className={styles.progressPct}>{c.collectedPct}%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${c.collectedPct}%` }} />
              </div>
              <span className={styles.investorCount}>{c.investorCount} Investor bergabung</span>
            </div>

            <Link href={`/investor/dashboard/explore/${c.id}`} className={styles.investBtn}>
              <FileText style={{ verticalAlign: "-0.125em" }} /> Lihat Detail & Investasi <ArrowRight style={{ verticalAlign: "-0.125em" }} />
            </Link>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.noResult}><span><Search /></span><p>Tidak ada UMKM yang sesuai filter.</p></div>
      )}
    </div>
  );
}

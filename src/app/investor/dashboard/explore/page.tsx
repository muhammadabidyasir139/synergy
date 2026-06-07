"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

interface UMKM {
  id: string;
  name: string;
  category: string;
  city: string;
  risk: "Low" | "Medium" | "High";
  aiScore: number;
  targetAmount: string;
  collected: number;
  estimatedRoi: string;
  akad: string;
  duration: string;
  investorCount: number;
}

const MOCK_UMKM: UMKM[] = [
  { id: "UMK-001", name: "Toko Sembako Berkah", category: "Perdagangan", city: "Jakarta", risk: "Low", aiScore: 84, targetAmount: "Rp 150 Jt", collected: 72, estimatedRoi: "8-10%", akad: "Musyarakah", duration: "12 Bulan", investorCount: 8 },
  { id: "UMK-002", name: "Kopi Nusantara Mandiri", category: "F&B", city: "Bandung", risk: "Low", aiScore: 79, targetAmount: "Rp 100 Jt", collected: 45, estimatedRoi: "7-9%", akad: "Murabahah", duration: "6 Bulan", investorCount: 5 },
  { id: "UMK-003", name: "Batik Cahaya Jawa", category: "Fashion", city: "Yogyakarta", risk: "Medium", aiScore: 63, targetAmount: "Rp 80 Jt", collected: 60, estimatedRoi: "9-12%", akad: "Musyarakah", duration: "9 Bulan", investorCount: 12 },
  { id: "UMK-004", name: "Warung Makan Sederhana", category: "F&B", city: "Surabaya", risk: "Medium", aiScore: 58, targetAmount: "Rp 50 Jt", collected: 30, estimatedRoi: "6-8%", akad: "Murabahah", duration: "6 Bulan", investorCount: 3 },
  { id: "UMK-005", name: "Peternakan Sapi Makmur", category: "Agrikultur", city: "Malang", risk: "Low", aiScore: 91, targetAmount: "Rp 200 Jt", collected: 85, estimatedRoi: "11-14%", akad: "Musyarakah", duration: "18 Bulan", investorCount: 20 },
  { id: "UMK-006", name: "Konveksi Mandiri Jaya", category: "Fashion", city: "Semarang", risk: "High", aiScore: 44, targetAmount: "Rp 60 Jt", collected: 15, estimatedRoi: "13-16%", akad: "Musyarakah", duration: "12 Bulan", investorCount: 2 },
];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [filterRisk, setFilterRisk] = useState("Semua");
  const [sortBy, setSortBy] = useState("popular");

  const categories = ["Semua", "Perdagangan", "F&B", "Fashion", "Agrikultur"];
  const risks = ["Semua", "Low", "Medium", "High"];

  const filtered = MOCK_UMKM
    .filter((u) => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.city.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === "Semua" || u.category === filterCategory;
      const matchRisk = filterRisk === "Semua" || u.risk === filterRisk;
      return matchSearch && matchCat && matchRisk;
    })
    .sort((a, b) => {
      if (sortBy === "popular") return b.investorCount - a.investorCount;
      if (sortBy === "roi") return parseFloat(b.estimatedRoi) - parseFloat(a.estimatedRoi);
      if (sortBy === "score") return b.aiScore - a.aiScore;
      return 0;
    });

  const riskColor = (r: string) =>
    r === "Low" ? styles.riskLow : r === "Medium" ? styles.riskMedium : styles.riskHigh;

  return (
    <div className={styles.page}>
      {/* Filters Bar */}
      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
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

      {/* UMKM Cards Grid */}
      <div className={styles.cardGrid}>
        {filtered.map((umkm) => (
          <div key={umkm.id} className={styles.umkmCard}>
            <div className={styles.umkmCardHeader}>
              <div>
                <h3 className={styles.umkmName}>{umkm.name}</h3>
                <p className={styles.umkmMeta}>{umkm.category} • {umkm.city}</p>
              </div>
              <span className={`${styles.riskBadge} ${riskColor(umkm.risk)}`}>{umkm.risk} Risk</span>
            </div>

            <div className={styles.aiScoreRow}>
              <span className={styles.aiLabel}>Skor AI XGBoost</span>
              <span className={styles.aiScore}>{umkm.aiScore}/100</span>
            </div>
            <div className={styles.scoreBar}>
              <div
                className={`${styles.scoreBarFill} ${umkm.aiScore >= 75 ? styles.fillGreen : umkm.aiScore >= 55 ? styles.fillYellow : styles.fillRed}`}
                style={{ width: `${umkm.aiScore}%` }}
              ></div>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Target Dana</span>
                <span className={styles.infoVal}>{umkm.targetAmount}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Est. ROI</span>
                <span className={styles.infoValGreen}>{umkm.estimatedRoi}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Jenis Akad</span>
                <span className={styles.infoVal}>{umkm.akad}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Durasi</span>
                <span className={styles.infoVal}>{umkm.duration}</span>
              </div>
            </div>

            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>Progress Funding</span>
                <span className={styles.progressPct}>{umkm.collected}%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${umkm.collected}%` }}></div>
              </div>
              <span className={styles.investorCount}>{umkm.investorCount} Investor bergabung</span>
            </div>

            <Link href="/investor/dashboard/investasi" className={styles.investBtn}>
              Investasi Sekarang →
            </Link>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.noResult}>
          <span>🔍</span>
          <p>Tidak ada UMKM yang sesuai filter.</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { BarChart, Banknote, Refresh, CheckCircle } from "@/components/icons";

type FilterStatus = "Semua" | "ONGOING" | "COMPLETED" | "FAILED";

interface InvestmentItem {
  id: string;
  umkm: string;
  city: string;
  akad: string;
  amount: number;
  profitReceived: number;
  roi: number;
  status: "ONGOING" | "COMPLETED" | "FAILED";
  startDate: string;
  endDate: string | null;
  risk: string;
}

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

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function PortfolioPage() {
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("Semua");

  useEffect(() => {
    const id = getInvestorId();
    if (!id) return;
    fetch("/api/investor/investments", { headers: { "x-investor-id": id } })
      .then((r) => r.json())
      .then((d: InvestmentItem[]) => setInvestments(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered =
    filter === "Semua"
      ? investments
      : investments.filter((i) => i.status === filter);
  const totalInvested = investments.reduce((a, b) => a + b.amount, 0);
  const totalProfit = investments.reduce((a, b) => a + b.profitReceived, 0);
  const ongoing = investments.filter((i) => i.status === "ONGOING").length;
  const completed = investments.filter((i) => i.status === "COMPLETED").length;

  if (isLoading)
    return <div style={{ padding: "2rem" }}>Memuat portfolio investasi...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.metrics}>
        <div className={styles.metricCard}>
          <span className={styles.metricIcon}>
            <BarChart />
          </span>
          <div>
            <p className={styles.metricVal}>{formatRp(totalInvested)}</p>
            <p className={styles.metricLabel}>Total Diinvestasikan</p>
          </div>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricIcon}>
            <Banknote />
          </span>
          <div>
            <p className={styles.metricVal} style={{ color: "#10b981" }}>
              {formatRp(totalProfit)}
            </p>
            <p className={styles.metricLabel}>Total Profit Diterima</p>
          </div>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricIcon}>
            <Refresh />
          </span>
          <div>
            <p className={styles.metricVal}>{ongoing}</p>
            <p className={styles.metricLabel}>Investasi Aktif</p>
          </div>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricIcon}>
            <CheckCircle />
          </span>
          <div>
            <p className={styles.metricVal}>{completed}</p>
            <p className={styles.metricLabel}>Investasi Selesai</p>
          </div>
        </div>
      </div>

      <div className={styles.filterTabs}>
        {(["Semua", "ONGOING", "COMPLETED", "FAILED"] as FilterStatus[]).map(
          (f) => (
            <button
              key={f}
              className={`${styles.tab} ${filter === f ? styles.tabActive : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}{" "}
              {f !== "Semua" &&
                `(${investments.filter((i) => i.status === f).length})`}
            </button>
          ),
        )}
      </div>

      <div className={styles.cardList}>
        {filtered.map((inv) => (
          <div key={inv.id} className={styles.invCard}>
            <div className={styles.cardTop}>
              <div>
                <div className={styles.idRow}>
                  <span className={styles.invId}>
                    {inv.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span
                    className={`${styles.statusBadge} ${inv.status === "ONGOING" ? styles.statusOngoing : inv.status === "COMPLETED" ? styles.statusCompleted : styles.statusFailed}`}
                  >
                    {inv.status}
                  </span>
                </div>
                <h3 className={styles.umkmName}>{inv.umkm}</h3>
                <p className={styles.umkmMeta}>
                  {inv.city} • {inv.akad} • Risk: {inv.risk}
                </p>
              </div>
            </div>

            <div className={styles.cardGrid}>
              <div className={styles.cardItem}>
                <span className={styles.itemLabel}>Nominal Investasi</span>
                <span className={styles.itemVal}>{formatRp(inv.amount)}</span>
              </div>
              <div className={styles.cardItem}>
                <span className={styles.itemLabel}>Profit Diterima</span>
                <span
                  className={`${styles.itemVal} ${inv.profitReceived > 0 ? styles.green : styles.red}`}
                >
                  {inv.profitReceived > 0 ? formatRp(inv.profitReceived) : "–"}
                </span>
              </div>
              <div className={styles.cardItem}>
                <span className={styles.itemLabel}>ROI</span>
                <span
                  className={`${styles.itemVal} ${inv.roi > 0 ? styles.green : styles.red}`}
                >
                  {inv.roi > 0 ? `+${inv.roi}%` : "–"}
                </span>
              </div>
              <div className={styles.cardItem}>
                <span className={styles.itemLabel}>Periode</span>
                <span className={styles.itemVal}>
                  {new Date(inv.startDate).toLocaleDateString("id-ID")} –{" "}
                  {inv.endDate
                    ? new Date(inv.endDate).toLocaleDateString("id-ID")
                    : "–"}
                </span>
              </div>
            </div>

            {inv.status === "ONGOING" && inv.roi > 0 && (
              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>Progress Profit</span>
                  <span className={styles.progressPct}>
                    {Math.round(
                      (inv.profitReceived / ((inv.amount * inv.roi) / 100)) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${Math.min(100, Math.round((inv.profitReceived / ((inv.amount * inv.roi) / 100)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={{ padding: "1rem", color: "var(--text-muted)" }}>
            Tidak ada investasi ditemukan.
          </p>
        )}
      </div>
    </div>
  );
}

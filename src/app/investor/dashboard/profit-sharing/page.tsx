"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { Banknote, Calendar, ArrowDownTray, Refresh } from "@/components/icons";

type FilterStatus = "Semua" | "PAID" | "PENDING" | "OVERDUE";

interface ProfitRecord {
  id: string;
  akadId: string;
  umkm: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  grossRevenue: number;
  investorShare: number;
  umkmShare: number;
  platformFee: number;
  status: "PAID" | "PENDING" | "OVERDUE";
  paidAt: string | null;
}

function getInvestorId() {
  if (typeof window === "undefined") return "";
  try { return JSON.parse(sessionStorage.getItem("synergy_investor_session") ?? "{}").investorProfileId ?? ""; }
  catch { return ""; }
}

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");
const formatPeriod = (start: string) => new Date(start).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

export default function ProfitSharingPage() {
  const [records, setRecords] = useState<ProfitRecord[]>([]);
  const [totalReceived, setTotalReceived] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [nextPaymentDate, setNextPaymentDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("Semua");
  const [exportMsg, setExportMsg] = useState("");

  useEffect(() => {
    const id = getInvestorId();
    if (!id) return;
    fetch("/api/investor/profit-sharing", { headers: { "x-investor-id": id } })
      .then((r) => r.json())
      .then((d) => {
        setRecords(d.records ?? []);
        setTotalReceived(d.totalReceived ?? 0);
        setTotalPending(d.totalPending ?? 0);
        setNextPaymentDate(d.nextPaymentDate ?? null);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = filter === "Semua" ? records : records.filter((p) => p.status === filter);
  const statusStyle = (s: string) =>
    s === "PAID" ? styles.statusPaid : s === "PENDING" ? styles.statusPending : styles.statusOverdue;

  if (isLoading) return <div style={{ padding: "2rem" }}>Memuat data bagi hasil...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <span className={styles.sumIcon}><Banknote /></span>
          <div><p className={styles.sumVal} style={{ color: "#10b981" }}>{formatRp(totalReceived)}</p><p className={styles.sumLabel}>Total Diterima</p></div>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.sumIcon}><Refresh /></span>
          <div><p className={styles.sumVal} style={{ color: "#f59e0b" }}>{formatRp(totalPending)}</p><p className={styles.sumLabel}>Menunggu Pembayaran</p></div>
        </div>
        {nextPaymentDate && (
          <div className={styles.summaryCard}>
            <span className={styles.sumIcon}><Calendar /></span>
            <div><p className={styles.sumVal}>{new Date(nextPaymentDate).toLocaleDateString("id-ID")}</p><p className={styles.sumLabel}>Jadwal Pembayaran Berikutnya</p></div>
          </div>
        )}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterTabs}>
          {(["Semua", "PAID", "PENDING", "OVERDUE"] as FilterStatus[]).map((f) => (
            <button key={f} className={`${styles.tab} ${filter === f ? styles.tabActive : ""}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <button className={styles.exportBtn} onClick={() => { setExportMsg("Laporan diekspor sebagai PDF."); setTimeout(() => setExportMsg(""), 3000); }}>
          <ArrowDownTray style={{ verticalAlign: "-0.125em" }} /> Export PDF
        </button>
      </div>

      {exportMsg && <div className={styles.exportMsg}>{exportMsg}</div>}

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>ID</th><th>UMKM</th><th>Periode</th><th>Jatuh Tempo</th><th>Gross Revenue</th><th>Bagian Anda</th><th>Platform Fee</th><th>Status</th><th>Dibayar</th></tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className={styles.mono}>{p.id.slice(0, 8).toUpperCase()}</td>
                  <td className={styles.bold}>{p.umkm}</td>
                  <td>{formatPeriod(p.periodStart)}</td>
                  <td>{new Date(p.dueDate).toLocaleDateString("id-ID")}</td>
                  <td>{formatRp(p.grossRevenue)}</td>
                  <td className={styles.profitCell}>{formatRp(p.investorShare)}</td>
                  <td className={styles.feeCell}>- {formatRp(p.platformFee)}</td>
                  <td><span className={`${styles.statusBadge} ${statusStyle(p.status)}`}>{p.status}</span></td>
                  <td>{p.paidAt ? new Date(p.paidAt).toLocaleDateString("id-ID") : <span className={styles.dash}>–</span>}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: "center", padding: "1rem" }}>Tidak ada data.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import styles from "./page.module.css";

type FilterStatus = "Semua" | "Paid" | "Pending" | "Overdue";

const profitData = [
  { id: "PS-018", akad: "AKD-042", umkm: "Toko Sembako Berkah", period: "Mei 2026", dueDate: "30 Mei 2026", grossRevenue: 27000000, investorShare: 4050000, umkmShare: 6750000, platformFee: 675000, status: "Paid" as const, paidAt: "28 Mei 2026" },
  { id: "PS-017", akad: "AKD-042", umkm: "Toko Sembako Berkah", period: "Apr 2026", dueDate: "30 Apr 2026", grossRevenue: 24300000, investorShare: 3645000, umkmShare: 6075000, platformFee: 607500, status: "Paid" as const, paidAt: "29 Apr 2026" },
  { id: "PS-016", akad: "AKD-038", umkm: "Kopi Nusantara Mandiri", period: "Jun 2026", dueDate: "30 Jun 2026", grossRevenue: 16800000, investorShare: 3528000, umkmShare: 8232000, platformFee: 420000, status: "Pending" as const, paidAt: undefined },
  { id: "PS-015", akad: "AKD-038", umkm: "Kopi Nusantara Mandiri", period: "Mei 2026", dueDate: "31 Mei 2026", grossRevenue: 14100000, investorShare: 2961000, umkmShare: 6909000, platformFee: 352500, status: "Overdue" as const, paidAt: undefined },
];

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function ProfitSharingPage() {
  const [filter, setFilter] = useState<FilterStatus>("Semua");
  const [exportMsg, setExportMsg] = useState("");

  const filtered = filter === "Semua" ? profitData : profitData.filter((p) => p.status === filter);
  const totalReceived = profitData.filter((p) => p.status === "Paid").reduce((a, b) => a + b.investorShare, 0);
  const totalPending = profitData.filter((p) => p.status !== "Paid").reduce((a, b) => a + b.investorShare, 0);

  const handleExport = () => {
    setExportMsg("Laporan bagi hasil berhasil diekspor sebagai PDF.");
    setTimeout(() => setExportMsg(""), 3000);
  };

  const statusStyle = (s: string) =>
    s === "Paid" ? styles.statusPaid : s === "Pending" ? styles.statusPending : styles.statusOverdue;

  const nextPayment = profitData.find((p) => p.status === "Pending");

  return (
    <div className={styles.page}>
      {/* Summary Cards */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <span className={styles.sumIcon}>💵</span>
          <div>
            <p className={styles.sumVal} style={{ color: "#10b981" }}>{formatRp(totalReceived)}</p>
            <p className={styles.sumLabel}>Total Diterima</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.sumIcon}>⏳</span>
          <div>
            <p className={styles.sumVal} style={{ color: "#f59e0b" }}>{formatRp(totalPending)}</p>
            <p className={styles.sumLabel}>Menunggu Pembayaran</p>
          </div>
        </div>
        {nextPayment && (
          <div className={styles.summaryCard}>
            <span className={styles.sumIcon}>📅</span>
            <div>
              <p className={styles.sumVal}>{nextPayment.dueDate}</p>
              <p className={styles.sumLabel}>Jadwal Pembayaran Berikutnya</p>
            </div>
          </div>
        )}
      </div>

      {/* Filter + Export */}
      <div className={styles.toolbar}>
        <div className={styles.filterTabs}>
          {(["Semua", "Paid", "Pending", "Overdue"] as FilterStatus[]).map((f) => (
            <button
              key={f}
              className={`${styles.tab} ${filter === f ? styles.tabActive : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button className={styles.exportBtn} onClick={handleExport}>
          📥 Export PDF
        </button>
      </div>

      {exportMsg && <div className={styles.exportMsg}>{exportMsg}</div>}

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>UMKM</th>
                <th>Periode</th>
                <th>Jatuh Tempo</th>
                <th>Gross Revenue</th>
                <th>Bagian Anda</th>
                <th>Platform Fee</th>
                <th>Status</th>
                <th>Dibayar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className={styles.mono}>{p.id}</td>
                  <td className={styles.bold}>{p.umkm}</td>
                  <td>{p.period}</td>
                  <td>{p.dueDate}</td>
                  <td>{formatRp(p.grossRevenue)}</td>
                  <td className={styles.profitCell}>{formatRp(p.investorShare)}</td>
                  <td className={styles.feeCell}>- {formatRp(p.platformFee)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${statusStyle(p.status)}`}>{p.status}</span>
                  </td>
                  <td>{p.paidAt ?? <span className={styles.dash}>–</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

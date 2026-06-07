"use client";

import { useState } from "react";
import styles from "./page.module.css";

type TxType = "Semua" | "INVESTMENT" | "PROFIT_SHARING" | "DEPOSIT" | "WITHDRAWAL";

const transactions = [
  { id: "TXN-091", type: "PROFIT_SHARING" as const, description: "Bagi Hasil – Toko Sembako Berkah (Mei)", amount: 4050000, status: "COMPLETED", date: "28 Mei 2026", ref: "PS-018" },
  { id: "TXN-088", type: "PROFIT_SHARING" as const, description: "Bagi Hasil – Toko Sembako Berkah (Apr)", amount: 3645000, status: "COMPLETED", date: "29 Apr 2026", ref: "PS-017" },
  { id: "TXN-085", type: "INVESTMENT" as const, description: "Investasi – Kopi Nusantara Mandiri", amount: -75000000, status: "COMPLETED", date: "15 Jan 2026", ref: "INV-019" },
  { id: "TXN-082", type: "DEPOSIT" as const, description: "Deposit Saldo Wallet via Bank Transfer", amount: 100000000, status: "COMPLETED", date: "10 Jan 2026", ref: "DEP-041" },
  { id: "TXN-078", type: "INVESTMENT" as const, description: "Investasi – Toko Sembako Berkah", amount: -50000000, status: "COMPLETED", date: "01 Jan 2026", ref: "INV-021" },
  { id: "TXN-071", type: "DEPOSIT" as const, description: "Deposit Saldo Wallet via Bank Transfer", amount: 200000000, status: "COMPLETED", date: "20 Des 2025", ref: "DEP-038" },
  { id: "TXN-065", type: "WITHDRAWAL" as const, description: "Penarikan Dana ke Rekening BCA", amount: -25000000, status: "COMPLETED", date: "10 Nov 2025", ref: "WD-019" },
];

const formatRp = (n: number) => {
  const abs = Math.abs(n);
  return (n < 0 ? "- " : "+ ") + "Rp " + abs.toLocaleString("id-ID");
};

const typeLabel = {
  INVESTMENT: "Investasi",
  PROFIT_SHARING: "Bagi Hasil",
  DEPOSIT: "Deposit",
  WITHDRAWAL: "Penarikan",
};

const typeIcon = {
  INVESTMENT: "📤",
  PROFIT_SHARING: "💵",
  DEPOSIT: "📥",
  WITHDRAWAL: "📤",
};

export default function RiwayatPage() {
  const [filter, setFilter] = useState<TxType>("Semua");
  const [exportMsg, setExportMsg] = useState("");

  const filtered = filter === "Semua" ? transactions : transactions.filter((t) => t.type === filter);

  const handleExport = () => {
    setExportMsg("Riwayat transaksi diekspor sebagai PDF.");
    setTimeout(() => setExportMsg(""), 3000);
  };

  return (
    <div className={styles.page}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.filterTabs}>
          {(["Semua", "INVESTMENT", "PROFIT_SHARING", "DEPOSIT", "WITHDRAWAL"] as TxType[]).map((f) => (
            <button
              key={f}
              className={`${styles.tab} ${filter === f ? styles.tabActive : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "Semua" ? "Semua" : typeLabel[f]}
            </button>
          ))}
        </div>
        <button className={styles.exportBtn} onClick={handleExport}>
          📥 Export
        </button>
      </div>

      {exportMsg && <div className={styles.exportMsg}>{exportMsg}</div>}

      {/* Transaction List */}
      <div className={styles.txList}>
        {filtered.map((tx) => (
          <div key={tx.id} className={styles.txItem}>
            <div className={`${styles.txIconBox} ${tx.amount > 0 ? styles.iconIn : styles.iconOut}`}>
              {typeIcon[tx.type]}
            </div>
            <div className={styles.txInfo}>
              <p className={styles.txDesc}>{tx.description}</p>
              <div className={styles.txMeta}>
                <span className={styles.txDate}>{tx.date}</span>
                <span className={styles.txRef}>• Ref: {tx.ref}</span>
                <span className={styles.txId}>• {tx.id}</span>
              </div>
            </div>
            <div className={styles.txRight}>
              <span className={`${styles.txAmount} ${tx.amount > 0 ? styles.amountIn : styles.amountOut}`}>
                {formatRp(tx.amount)}
              </span>
              <span className={styles.txStatus}>✅ {tx.status}</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.emptyState}>
          <span>📋</span>
          <p>Tidak ada transaksi ditemukan.</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

type TxType = "Semua" | "INVESTMENT" | "PROFIT_SHARING" | "DEPOSIT" | "WITHDRAWAL";

interface TxItem {
  id: string;
  type: TxType;
  description: string;
  amount: number;
  status: string;
  createdAt: string;
  reference: string;
}

function getInvestorId() {
  if (typeof window === "undefined") return "";
  try { return JSON.parse(sessionStorage.getItem("synergy_investor_session") ?? "{}").investorProfileId ?? ""; }
  catch { return ""; }
}

const formatRp = (n: number) => {
  const abs = Math.abs(n);
  return (n < 0 ? "- " : "+ ") + "Rp " + abs.toLocaleString("id-ID");
};

const typeLabel: Record<string, string> = { INVESTMENT: "Investasi", PROFIT_SHARING: "Bagi Hasil", DEPOSIT: "Deposit", WITHDRAWAL: "Penarikan" };
const typeIcon: Record<string, string> = { INVESTMENT: "📤", PROFIT_SHARING: "💵", DEPOSIT: "📥", WITHDRAWAL: "📤" };

export default function RiwayatPage() {
  const [transactions, setTransactions] = useState<TxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<TxType>("Semua");
  const [exportMsg, setExportMsg] = useState("");

  useEffect(() => {
    const id = getInvestorId();
    if (!id) return;
    fetch("/api/investor/transactions", { headers: { "x-investor-id": id } })
      .then((r) => r.json())
      .then((d: TxItem[]) => setTransactions(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = filter === "Semua" ? transactions : transactions.filter((t) => t.type === filter);

  const getAmountSign = (tx: TxItem) => {
    if (tx.type === "DEPOSIT" || tx.type === "PROFIT_SHARING") return tx.amount;
    return -tx.amount;
  };

  if (isLoading) return <div style={{ padding: "2rem" }}>Memuat riwayat transaksi...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.filterTabs}>
          {(["Semua", "INVESTMENT", "PROFIT_SHARING", "DEPOSIT", "WITHDRAWAL"] as TxType[]).map((f) => (
            <button key={f} className={`${styles.tab} ${filter === f ? styles.tabActive : ""}`} onClick={() => setFilter(f)}>
              {f === "Semua" ? "Semua" : typeLabel[f]}
            </button>
          ))}
        </div>
        <button className={styles.exportBtn} onClick={() => { setExportMsg("Riwayat diekspor sebagai PDF."); setTimeout(() => setExportMsg(""), 3000); }}>
          📥 Export
        </button>
      </div>

      {exportMsg && <div className={styles.exportMsg}>{exportMsg}</div>}

      <div className={styles.txList}>
        {filtered.map((tx) => {
          const signed = getAmountSign(tx);
          return (
            <div key={tx.id} className={styles.txItem}>
              <div className={`${styles.txIconBox} ${signed > 0 ? styles.iconIn : styles.iconOut}`}>
                {typeIcon[tx.type] ?? "💳"}
              </div>
              <div className={styles.txInfo}>
                <p className={styles.txDesc}>{tx.description}</p>
                <div className={styles.txMeta}>
                  <span className={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString("id-ID")}</span>
                  {tx.reference && <span className={styles.txRef}>• Ref: {tx.reference}</span>}
                  <span className={styles.txId}>• {tx.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>
              <div className={styles.txRight}>
                <span className={`${styles.txAmount} ${signed > 0 ? styles.amountIn : styles.amountOut}`}>
                  {formatRp(signed)}
                </span>
                <span className={styles.txStatus}>✅ {tx.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className={styles.emptyState}><span>📋</span><p>Tidak ada transaksi ditemukan.</p></div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import styles from "./page.module.css";
import {
  ArrowUpTray,
  ArrowDownTray,
  Banknote,
  CreditCard,
  CheckCircle,
  Clipboard,
} from "@/components/icons";

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
const typeIcon: Record<string, ReactNode> = { INVESTMENT: <ArrowUpTray />, PROFIT_SHARING: <Banknote />, DEPOSIT: <ArrowDownTray />, WITHDRAWAL: <ArrowUpTray /> };

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

  const handleExport = () => {
    if (filtered.length === 0) {
      setExportMsg("Tidak ada data untuk diekspor.");
      setTimeout(() => setExportMsg(""), 3000);
      return;
    }
    const headers = ["ID", "Tipe", "Deskripsi", "Jumlah", "Status", "Tanggal", "Referensi"];
    const csvRows = [headers.join(",")];
    for (const tx of filtered) {
      const signed = getAmountSign(tx);
      const row = [
        tx.id,
        typeLabel[tx.type] ?? tx.type,
        `"${tx.description}"`,
        signed,
        tx.status,
        new Date(tx.createdAt).toISOString().split("T")[0],
        tx.reference ?? ""
      ];
      csvRows.push(row.join(","));
    }
    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Riwayat_Transaksi_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportMsg("Laporan diekspor sebagai Excel (CSV).");
    setTimeout(() => setExportMsg(""), 3000);
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
        <button className={styles.exportBtn} onClick={handleExport}>
          <ArrowDownTray style={{ verticalAlign: "-0.125em" }} /> Export Excel
        </button>
      </div>

      {exportMsg && <div className={styles.exportMsg}>{exportMsg}</div>}

      <div className={styles.txList}>
        {filtered.map((tx) => {
          const signed = getAmountSign(tx);
          return (
            <div key={tx.id} className={styles.txItem}>
              <div className={`${styles.txIconBox} ${signed > 0 ? styles.iconIn : styles.iconOut}`}>
                {typeIcon[tx.type] ?? <CreditCard />}
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
                <span className={styles.txStatus}>
                  <CheckCircle style={{ verticalAlign: "-0.125em" }} />{" "}
                  {tx.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className={styles.emptyState}><span><Clipboard /></span><p>Tidak ada transaksi ditemukan.</p></div>
      )}
    </div>
  );
}

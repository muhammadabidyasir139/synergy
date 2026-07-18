"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./page.module.css";
import { Package, Flag } from "@/components/icons";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  isFlagged: boolean;
  flagReason: string | null;
  description: string | null;
  reference: string | null;
  userName: string | null;
  userRole: string;
  createdAt: string;
  processedAt: string | null;
}

const STATUS_FILTERS = ["All", "COMPLETED", "PENDING", "PROCESSING", "FAILED", "FLAGGED", "BLOCKED"];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchTx = useCallback(async (status: string) => {
    setLoading(true);
    const url = status === "All" ? "/api/admin/transactions" : `/api/admin/transactions?status=${status}`;
    const res = await fetch(url);
    const data = await res.json();
    setTransactions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTx(filter);
  }, [filter, fetchTx]);

  const handleFlag = async (tx: Transaction) => {
    const action = tx.isFlagged ? "unflag" : "flag";
    const reason = action === "flag" ? prompt("Masukkan alasan flag:") : undefined;
    if (action === "flag" && !reason) return;

    const res = await fetch(`/api/admin/transactions/${tx.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    if (res.ok) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === tx.id
            ? { ...t, isFlagged: action === "flag", status: action === "flag" ? "FLAGGED" : "COMPLETED" }
            : t
        )
      );
    }
  };

  const handleBlock = async (id: string) => {
    const res = await fetch(`/api/admin/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "block" }),
    });
    if (res.ok) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "BLOCKED", isFlagged: true } : t))
      );
    }
  };

  const fmtRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  const fmtDate = (d: string) => new Date(d).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}><Package style={{ verticalAlign: "-0.125em" }} /> Manajemen Transaksi</h1>

      <div className={styles.filterBar}>
        <label htmlFor="statusFilter" className={styles.filterLabel}>
          Filter Status
        </label>
        <select
          id="statusFilter"
          className={styles.filterSelect}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f} value={f}>
              {f === "All" ? "Semua Status" : f}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", opacity: 0.6 }}>Memuat data...</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Pengguna</th>
              <th>Tipe</th>
              <th>Jumlah</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem", opacity: 0.6 }}>
                  Tidak ada data transaksi.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className={
                    tx.status === "FAILED" || tx.status === "BLOCKED" ? styles.rowFailed : ""
                  }
                >
                  <td className={styles.mono}>{tx.id.slice(0, 8)}...</td>
                  <td>{tx.userName ?? "-"}</td>
                  <td>{tx.type}</td>
                  <td>{fmtRupiah(tx.amount)}</td>
                  <td>
                    <span
                      style={{
                        color:
                          tx.status === "COMPLETED"
                            ? "#10b981"
                            : tx.status === "FAILED" || tx.status === "BLOCKED"
                            ? "#ef4444"
                            : tx.status === "FLAGGED"
                            ? "#f59e0b"
                            : undefined,
                        fontWeight: 500,
                      }}
                    >
                      {tx.status}
                      {tx.isFlagged && (
                        <>
                          {" "}
                          <Flag style={{ verticalAlign: "-0.125em" }} />
                        </>
                      )}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8rem" }}>{fmtDate(tx.createdAt)}</td>
                  <td>
                    {tx.status !== "BLOCKED" && (
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          className={styles.filterBtn}
                          style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem" }}
                          onClick={() => handleFlag(tx)}
                        >
                          {tx.isFlagged ? "Unflag" : "Flag"}
                        </button>
                        {tx.isFlagged && (
                          <button
                            className={styles.filterBtn}
                            style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", color: "#ef4444" }}
                            onClick={() => handleBlock(tx.id)}
                          >
                            Block
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

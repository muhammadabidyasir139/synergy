"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

interface Transaction {
  txHash: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  status: "Success" | "Pending" | "Failed";
}

const mockTransactions: Transaction[] = [
  { txHash: "0xabc123...", type: "DeployContract", from: "0xadmin", to: "0xcontract", amount: "0 RP", status: "Success" },
  { txHash: "0xdef456...", type: "Transfer", from: "0xuser1", to: "0xuser2", amount: "5000 RP", status: "Pending" },
  { txHash: "0xghi789...", type: "Transfer", from: "0xuser3", to: "0xuser4", amount: "1200 RP", status: "Failed" },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [filter, setFilter] = useState<string>("All");

  // Simulate live incoming transactions
  useEffect(() => {
    const interval = setInterval(() => {
      const newTx: Transaction = {
        txHash: `0x${Math.random().toString(16).substr(2, 8)}...`,
        type: Math.random() > 0.5 ? "Transfer" : "DeployContract",
        from: `0x${Math.random().toString(16).substr(2, 6)}`,
        to: `0x${Math.random().toString(16).substr(2, 6)}`,
        amount: `${Math.floor(Math.random() * 10000)} RP`,
        status: Math.random() > 0.7 ? "Failed" : Math.random() > 0.4 ? "Pending" : "Success",
      };
      setTransactions(prev => [newTx, ...prev].slice(0, 20));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filtered = transactions.filter(t => filter === "All" || t.status === filter);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📦 Transaksi Terbaru</h1>
      <div className={styles.filterBar}>
        {['All','Success','Pending','Failed'].map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter===f?styles.active:''}`}
            onClick={() => setFilter(f)}
          >{f}</button>
        ))}
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Tx Hash</th>
            <th>Type</th>
            <th>From → To</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((tx, i) => (
            <tr key={i} className={tx.status === "Failed" ? styles.rowFailed : ""}>
              <td className={styles.mono}>{tx.txHash}</td>
              <td>{tx.type}</td>
              <td>{tx.from} → {tx.to}</td>
              <td>{tx.amount}</td>
              <td>{tx.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

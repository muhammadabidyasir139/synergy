"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

interface BlockInfo {
  height: number;
  hash: string;
  timestamp: string;
  gasUsed: string;
}

interface TransactionInfo {
  txHash: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  status: "Success" | "Pending";
}

export default function BlockchainExplorerPage() {
  const [blocks, setBlocks] = useState<BlockInfo[]>([]);
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [nodeStatus] = useState<boolean>(true);

  // Simulate live block generation every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newBlock: BlockInfo = {
        height: blocks.length ? blocks[0].height + 1 : 1024,
        hash: `0x${Math.random().toString(16).substr(2, 8)}...`,
        timestamp: new Date().toLocaleTimeString(),
        gasUsed: `${(Math.random() * 5 + 1).toFixed(2)} Mgas`
      };
      setBlocks((prev) => [newBlock, ...prev].slice(0, 10));
    }, 5000);
    return () => clearInterval(interval);
  }, [blocks]);

  // Simulate incoming transactions every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newTx: TransactionInfo = {
        txHash: `0x${Math.random().toString(16).substr(2, 10)}...`,
        type: Math.random() > 0.5 ? "DeployContract" : "Transfer",
        from: `0x${Math.random().toString(16).substr(2, 6)}`,
        to: `0x${Math.random().toString(16).substr(2, 6)}`,
        amount: `${(Math.random() * 1000).toFixed(0)} RP`,
        status: Math.random() > 0.2 ? "Success" : "Pending"
      };
      setTransactions((prev) => [newTx, ...prev].slice(0, 15));
    }, 3000);
    return () => clearInterval(interval);
  }, [transactions]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Blockchain Ledger Explorer</h1>
        <p className={styles.subtitle}>Monitor status node, latest blocks, dan transaksi dalam ekosistem Synergy.</p>
        <div className={styles.nodeStatus}>
          <span className={styles.statusDot} style={{ background: nodeStatus ? "#10b981" : "#ef4444" }}></span>
          Node {nodeStatus ? "Online" : "Offline"}
        </div>
      </header>

      <section className={styles.sectionBlock}>
        <h2 className={styles.sectionTitle}>🧱 Blok Terbaru</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th># Height</th>
              <th>Hash</th>
              <th>Timestamp</th>
              <th>Gas Used</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((b) => (
              <tr key={b.height}>
                <td>{b.height}</td>
                <td className={styles.mono}>{b.hash}</td>
                <td>{b.timestamp}</td>
                <td>{b.gasUsed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.sectionTx}>
        <h2 className={styles.sectionTitle}>📦 Transaksi Terbaru</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>TxHash</th>
              <th>Type</th>
              <th>From → To</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.txHash} className={tx.status === "Pending" ? styles.rowPending : ""}>
                <td className={styles.mono}>{tx.txHash}</td>
                <td>{tx.type}</td>
                <td>{tx.from} → {tx.to}</td>
                <td>{tx.amount}</td>
                <td>
                  <span className={`${styles.statusBadge} ${tx.status === "Success" ? styles.success : styles.pending}`}> {tx.status} </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

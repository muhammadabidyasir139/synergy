"use client";
import React, { useState } from 'react';
import styles from './page.module.css';
import { Search } from '@/components/icons';

interface ScoreEntry {
  umkmName: string;
  score: number;
  risk: 'Low' | 'Medium' | 'High';
}

const dummyData: ScoreEntry[] = [
  { umkmName: 'Toko A', score: 85, risk: 'Low' },
  { umkmName: 'Usaha B', score: 62, risk: 'Medium' },
  { umkmName: 'Koperasi C', score: 48, risk: 'High' },
];

export default function AIMonitorPage() {
  const [scores, setScores] = useState<ScoreEntry[]>(dummyData);

  const handleRescore = (index: number) => {
    // Simulate re-scoring by randomizing score
    // eslint-disable-next-line react-hooks/purity
    const newScore = Math.max(0, Math.min(100, Math.round(Math.random() * 100)));
    const newRisk: ScoreEntry['risk'] = newScore >= 80 ? 'Low' : newScore >= 60 ? 'Medium' : 'High';
    const updated = [...scores];
    updated[index] = { ...updated[index], score: newScore, risk: newRisk };
    setScores(updated);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}><Search style={{ verticalAlign: "-0.125em" }} /> Monitoring Penilaian Usaha</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>UMKM</th>
            <th>Skor Penilaian (0‑100)</th>
            <th>Risiko</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((row, i) => (
            <tr key={i} className={styles.row}>
              <td>{row.umkmName}</td>
              <td>{row.score}</td>
              <td>{row.risk}</td>
              <td>
                <button className={styles.button} onClick={() => handleRescore(i)}>
                  Re‑Score
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

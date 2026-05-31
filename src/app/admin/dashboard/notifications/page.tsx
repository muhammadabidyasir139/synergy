"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface Broadcast {
  id: number;
  message: string;
  target: string;
  sentAt: string;
}

const targetOptions = ["Semua Pengguna", "Investor", "UMKM", "Admin"];

const mockHistory: Broadcast[] = [
  { id: 1, message: "Sistem maintenance 31 Mei 2026 pukul 02:00–04:00 WIB.", target: "Semua Pengguna", sentAt: "2026-05-29 10:00" },
  { id: 2, message: "Fitur baru: AI Scoring sudah aktif!", target: "Investor", sentAt: "2026-05-28 14:30" },
  { id: 3, message: "Harap lengkapi dokumen KYC sebelum 15 Juni.", target: "UMKM", sentAt: "2026-05-27 09:15" },
];

export default function NotificationsPage() {
  const [history, setHistory] = useState<Broadcast[]>(mockHistory);
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState(targetOptions[0]);
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    setSending(true);
    setTimeout(() => {
      const newBroadcast: Broadcast = {
        id: history.length + 1,
        message,
        target,
        sentAt: new Date().toLocaleString("sv-SE").replace("T", " "),
      };
      setHistory((prev) => [newBroadcast, ...prev]);
      setMessage("");
      setSending(false);
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📢 Broadcast Notifikasi</h1>
      <p className={styles.subtitle}>Kirim pesan ke seluruh pengguna platform</p>

      {/* Compose */}
      <div className={styles.composePanel}>
        <h2 className={styles.sectionTitle}>Buat Pesan Baru</h2>
        <div className={styles.formRow}>
          <label className={styles.label}>Target</label>
          <select className={styles.select} value={target} onChange={(e) => setTarget(e.target.value)}>
            {targetOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <textarea
          className={styles.textarea}
          rows={4}
          placeholder="Tulis pesan broadcast..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className={styles.sendBtn} onClick={handleSend} disabled={sending || !message.trim()}>
          {sending ? "⏳ Mengirim..." : "🚀 Kirim Broadcast"}
        </button>
      </div>

      {/* History */}
      <div className={styles.historyPanel}>
        <h2 className={styles.sectionTitle}>Riwayat Broadcast</h2>
        {history.map((b) => (
          <div key={b.id} className={styles.historyCard}>
            <div className={styles.historyHeader}>
              <span className={styles.historyTarget}>{b.target}</span>
              <span className={styles.historyTime}>{b.sentAt}</span>
            </div>
            <p className={styles.historyMessage}>{b.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

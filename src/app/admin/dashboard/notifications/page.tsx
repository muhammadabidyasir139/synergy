"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import { Megaphone, Refresh, Rocket, CheckCircle } from "@/components/icons";

interface Broadcast {
  id: string;
  title: string;
  message: string;
  target: string;
  sentBy: string;
  createdAt: string;
}

const TARGET_OPTIONS = [
  { label: "Semua Pengguna", value: "ALL" },
  { label: "Investor", value: "INVESTOR" },
  { label: "UMKM", value: "UMKM" },
  { label: "Admin", value: "ADMIN" },
];

export default function NotificationsPage() {
  const [history, setHistory] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("ALL");
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState<number | null>(null);

  const fetchHistory = useCallback(async () => {
    const res = await fetch("/api/admin/notifications");
    const data = await res.json();
    setHistory(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setSentCount(null);

    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title || "Notifikasi Admin", message, target }),
    });

    if (res.ok) {
      const data = await res.json();
      setSentCount(data.sentTo);
      setTitle("");
      setMessage("");
      await fetchHistory();
    }
    setSending(false);
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}><Megaphone style={{ verticalAlign: "-0.125em" }} /> Broadcast Notifikasi</h1>
      <p className={styles.subtitle}>Kirim pesan ke seluruh pengguna platform</p>

      <div className={styles.composePanel}>
        <h2 className={styles.sectionTitle}>Buat Pesan Baru</h2>

        <div className={styles.formRow}>
          <label className={styles.label}>Judul</label>
          <input
            className={styles.select}
            type="text"
            placeholder="Judul notifikasi..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Target</label>
          <select
            className={styles.select}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          >
            {TARGET_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
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

        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={sending || !message.trim()}
        >
          {sending ? (
            <>
              <Refresh style={{ verticalAlign: "-0.125em" }} /> Mengirim...
            </>
          ) : (
            <>
              <Rocket style={{ verticalAlign: "-0.125em" }} /> Kirim Broadcast
            </>
          )}
        </button>

        {sentCount !== null && (
          <p style={{ marginTop: "0.75rem", color: "#10b981", fontWeight: 500 }}>
            <CheckCircle style={{ verticalAlign: "-0.125em" }} /> Berhasil dikirim ke {sentCount} pengguna.
          </p>
        )}
      </div>

      <div className={styles.historyPanel}>
        <h2 className={styles.sectionTitle}>Riwayat Broadcast</h2>
        {loading ? (
          <p style={{ opacity: 0.6 }}>Memuat riwayat...</p>
        ) : history.length === 0 ? (
          <p style={{ opacity: 0.6 }}>Belum ada riwayat broadcast.</p>
        ) : (
          history.map((b) => (
            <div key={b.id} className={styles.historyCard}>
              <div className={styles.historyHeader}>
                <span className={styles.historyTarget}>{b.target}</span>
                <span className={styles.historyTime}>{fmtDate(b.createdAt)}</span>
              </div>
              <strong style={{ fontSize: "0.9rem" }}>{b.title}</strong>
              <p className={styles.historyMessage}>{b.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import styles from "../page.module.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface DataEntry {
  id: string;
  tanggal: string;
  omzet: string;
  pengeluaran: string;
  laba: string;
  sumber: "Manual" | "API";
}

export default function DataUsaha() {
  const [activeTab, setActiveTab] = useState<"input" | "history" | "api">("input");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({ tanggal: "", omzet: "", pengeluaran: "", keterangan: "" });

  const [history, setHistory] = useState<DataEntry[]>([
    { id: "DE-021", tanggal: "5 Jun 2026", omzet: "Rp 1.250.000", pengeluaran: "Rp 780.000", laba: "Rp 470.000", sumber: "Manual" },
    { id: "DE-020", tanggal: "4 Jun 2026", omzet: "Rp 980.000", pengeluaran: "Rp 620.000", laba: "Rp 360.000", sumber: "API" },
    { id: "DE-019", tanggal: "3 Jun 2026", omzet: "Rp 1.540.000", pengeluaran: "Rp 890.000", laba: "Rp 650.000", sumber: "Manual" },
    { id: "DE-018", tanggal: "2 Jun 2026", omzet: "Rp 870.000", pengeluaran: "Rp 510.000", laba: "Rp 360.000", sumber: "API" },
  ]);

  const [apiConnected, setApiConnected] = useState({ tokopedia: false, shopee: false, pos: true });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    MySwal.fire({
      title: "Konfirmasi Simpan",
      text: "Apakah Anda yakin data usaha yang dimasukkan sudah benar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsSaving(true);
        setTimeout(() => {
          const omzetNum = parseInt(form.omzet.replace(/\D/g, "")) || 0;
          const pengeluaranNum = parseInt(form.pengeluaran.replace(/\D/g, "")) || 0;
          const laba = omzetNum - pengeluaranNum;
          const newEntry: DataEntry = {
            id: `DE-${Date.now()}`,
            tanggal: form.tanggal || new Date().toLocaleDateString("id-ID"),
            omzet: `Rp ${omzetNum.toLocaleString("id-ID")}`,
            pengeluaran: `Rp ${pengeluaranNum.toLocaleString("id-ID")}`,
            laba: `Rp ${laba.toLocaleString("id-ID")}`,
            sumber: "Manual",
          };
          setHistory((prev) => [newEntry, ...prev]);
          setForm({ tanggal: "", omzet: "", pengeluaran: "", keterangan: "" });
          setIsSaving(false);
          setSaved(true);

          MySwal.fire({
            title: "Berhasil!",
            text: "Data usaha berhasil disimpan & dikirim ke AI XGBoost.",
            icon: "success",
            confirmButtonColor: "#10b981",
          });

          setTimeout(() => setSaved(false), 3000);
        }, 1000);
      }
    });
  };

  const toggleAPI = (platform: "tokopedia" | "shopee" | "pos") => {
    setApiConnected((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Input Data Usaha</h1>
          <p className={styles.subtitle}>
            Input omzet dan pengeluaran harian, atau hubungkan API e-commerce / POS untuk sinkronisasi otomatis.
          </p>
        </div>
        {saved && (
          <span style={{ color: "#10b981", fontWeight: 700, fontSize: "0.9rem" }}>✅ Data tersimpan & dikirim ke AI!</span>
        )}
      </header>

      <div className={styles.tabContainer}>
        <button className={`${styles.tabBtn} ${activeTab === "input" ? styles.tabActive : ""}`} onClick={() => setActiveTab("input")}>
          ✏️ Input Manual
        </button>
        <button className={`${styles.tabBtn} ${activeTab === "history" ? styles.tabActive : ""}`} onClick={() => setActiveTab("history")}>
          📋 Riwayat Data
        </button>
        <button className={`${styles.tabBtn} ${activeTab === "api" ? styles.tabActive : ""}`} onClick={() => setActiveTab("api")}>
          🔗 Integrasi API
        </button>
      </div>

      {/* Input Manual Tab */}
      {activeTab === "input" && (
        <form onSubmit={handleSubmit} className={`${styles.sectionCard} glass`}>
          <div className={styles.sectionHeader}>
            <h3>Input Data Harian</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Data akan diproses AI XGBoost secara real-time</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div className={styles.inputGroup}>
              <label>Tanggal</label>
              <input
                type="date"
                className={styles.input}
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Omzet (Rp)</label>
              <input
                type="number"
                className={styles.input}
                placeholder="1500000"
                value={form.omzet}
                onChange={(e) => setForm({ ...form, omzet: e.target.value })}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Total Pengeluaran (Rp)</label>
              <input
                type="number"
                className={styles.input}
                placeholder="900000"
                value={form.pengeluaran}
                onChange={(e) => setForm({ ...form, pengeluaran: e.target.value })}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Estimasi Laba Bersih</label>
              <input
                className={styles.input}
                value={
                  form.omzet && form.pengeluaran
                    ? `Rp ${(parseInt(form.omzet) - parseInt(form.pengeluaran)).toLocaleString("id-ID")}`
                    : "Otomatis dihitung"
                }
                disabled
                style={{ color: "#10b981", fontWeight: 700 }}
              />
            </div>
            <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
              <label>Keterangan (opsional)</label>
              <textarea
                className={styles.textarea}
                rows={2}
                placeholder="Contoh: Penjualan meningkat karena promo akhir bulan..."
                value={form.keterangan}
                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <button
              type="submit"
              disabled={isSaving}
              className={styles.btnPrimary}
              style={{ padding: "0.8rem 2rem", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.95rem" }}
            >
              {isSaving ? "Menyimpan ke Database AI..." : "💾 Simpan & Kirim ke AI"}
            </button>
          </div>
        </form>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className={`${styles.tableSection} glass`}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
            <h3 style={{ fontWeight: 800, color: "var(--text-color)" }}>Riwayat Data Usaha</h3>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tanggal</th>
                  <th>Omzet</th>
                  <th>Pengeluaran</th>
                  <th>Laba Bersih</th>
                  <th>Sumber</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ fontFamily: "monospace", color: "var(--text-muted)" }}>{entry.id}</td>
                    <td>{entry.tanggal}</td>
                    <td style={{ fontWeight: 700, color: "var(--text-color)" }}>{entry.omzet}</td>
                    <td style={{ color: "#ef4444" }}>{entry.pengeluaran}</td>
                    <td style={{ fontWeight: 700, color: "#10b981" }}>{entry.laba}</td>
                    <td>
                      <span className={`${styles.badge} ${entry.sumber === "API" ? styles.badgeBlue : styles.badgePurple}`}>
                        {entry.sumber}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* API Integration Tab */}
      {activeTab === "api" && (
        <div className={styles.cardGrid}>
          {[
            { key: "tokopedia" as const, name: "Tokopedia Seller", icon: "🛒", desc: "Sinkronisasi otomatis data penjualan dari toko Tokopedia Anda." },
            { key: "shopee" as const, name: "Shopee API", icon: "🛍️", desc: "Tarik data transaksi real-time dari Shopee Seller Center." },
            { key: "pos" as const, name: "POS Kasir Digital", icon: "🖥️", desc: "Integrasi dengan sistem kasir POS yang sudah Anda gunakan." },
          ].map((platform) => (
            <div key={platform.key} className={`${styles.infoCard} glass`}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "2rem" }}>{platform.icon}</span>
                <div>
                  <h4 style={{ fontWeight: 800, color: "var(--text-color)", fontSize: "1rem" }}>{platform.name}</h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{platform.desc}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className={`${styles.badge} ${apiConnected[platform.key] ? styles.badgeGreen : styles.badgeYellow}`}>
                  {apiConnected[platform.key] ? "🟢 Terhubung" : "⚪ Belum Terhubung"}
                </span>
                <button
                  onClick={() => toggleAPI(platform.key)}
                  className={apiConnected[platform.key] ? `${styles.btnSm} ${styles.btnSmRed}` : `${styles.btnSm} ${styles.btnSmGreen}`}
                  style={{ border: "none", cursor: "pointer" }}
                >
                  {apiConnected[platform.key] ? "Putus Koneksi" : "Hubungkan"}
                </button>
              </div>
              {apiConnected[platform.key] && (
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "0.5rem", background: "rgba(16,185,129,0.05)", borderRadius: 8, borderLeft: "3px solid #10b981" }}>
                  ✅ Sinkronisasi terakhir: 7 Jun 2026, 08:30 WIB
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

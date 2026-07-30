"use client";

import { useState, useEffect } from "react";
import { createDataUsaha, getDataUsaha, bulkCreateDataUsaha } from "../../actions/dataUsaha";
import styles from "../page.module.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { CheckCircle, Pencil, Clipboard, Link, Save, ShoppingCart, ShoppingBag, Monitor, Dot } from "@/components/icons";

const MySwal = withReactContent(Swal);

function getUmkmId(): string {
  if (typeof window === "undefined") return "";
  try {
    return JSON.parse(sessionStorage.getItem("synergy_umkm_session") ?? "{}").umkmProfileId ?? "";
  } catch {
    return "";
  }
}

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
  const [isImporting, setIsImporting] = useState(false);

  const [form, setForm] = useState({ tanggal: "", omzet: "", pengeluaran: "", keterangan: "" });

  const [history, setHistory] = useState<DataEntry[]>([]);

  useEffect(() => {
    getDataUsaha(getUmkmId()).then(setHistory).catch(console.error);
  }, []);

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
      confirmButtonColor: "#1d4ed8",
      cancelButtonColor: "#ef4444",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsSaving(true);
        const omzetNum = parseInt(form.omzet.replace(/\D/g, "")) || 0;
        const pengeluaranNum = parseInt(form.pengeluaran.replace(/\D/g, "")) || 0;
        
        const umkmId = getUmkmId();
        createDataUsaha(umkmId, {
          tanggal: form.tanggal || new Date().toISOString().split("T")[0],
          omzet: omzetNum,
          pengeluaran: pengeluaranNum,
          keterangan: form.keterangan
        }).then(() => {
          setForm({ tanggal: "", omzet: "", pengeluaran: "", keterangan: "" });
          setIsSaving(false);
          setSaved(true);
          getDataUsaha(umkmId).then(setHistory);

          MySwal.fire({
            title: "Berhasil!",
            text: "Data usaha berhasil disimpan & dikirim ke AI XGBoost.",
            icon: "success",
            confirmButtonColor: "#1d4ed8",
          });

          setTimeout(() => setSaved(false), 3000);
        }).catch((err) => {
          setIsSaving(false);
          MySwal.fire({
            title: "Gagal",
            text: err.message || "Gagal menyimpan data usaha.",
            icon: "error"
          });
        });
      }
    });
  };

  const toggleAPI = (platform: "tokopedia" | "shopee" | "pos") => {
    setApiConnected((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  const downloadTemplate = async () => {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.aoa_to_sheet([
      ["Tanggal (YYYY-MM-DD)", "Omzet", "Pengeluaran", "Keterangan"],
      ["2026-06-30", 7000000, 4500000, "Contoh: rekap Juni"],
      ["2026-07-31", 8200000, 5000000, "Contoh: rekap Juli"],
    ]);
    ws["!cols"] = [{ wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 30 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Usaha");
    XLSX.writeFile(wb, "template-data-usaha.xlsx");
  };

  const toISODate = (v: unknown): string => {
    if (v instanceof Date) {
      return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, "0")}-${String(v.getDate()).padStart(2, "0")}`;
    }
    const s = String(v ?? "").trim();
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
      const [y, m, d] = s.split("-").map(Number);
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
    // dukung DD/MM/YYYY
    const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) return toISODate(parsed);
    return "";
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const umkmId = getUmkmId();
    if (!umkmId) {
      MySwal.fire({ title: "Sesi tidak ditemukan", text: "Silakan login ulang.", icon: "error" });
      return;
    }
    setIsImporting(true);
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

      const findKey = (obj: Record<string, unknown>, needle: string) =>
        Object.keys(obj).find((k) => k.toLowerCase().includes(needle));

      const rows = raw
        .map((r) => {
          const kT = findKey(r, "tanggal");
          const kO = findKey(r, "omzet");
          const kP = findKey(r, "pengeluaran");
          const kK = findKey(r, "keterangan");
          const tanggal = toISODate(kT ? r[kT] : "");
          const omzet = parseInt(String(kO ? r[kO] : "").replace(/\D/g, "")) || 0;
          const pengeluaran = parseInt(String(kP ? r[kP] : "").replace(/\D/g, "")) || 0;
          const keterangan = kK ? String(r[kK] ?? "") : "";
          return { tanggal, omzet, pengeluaran, keterangan };
        })
        .filter((r) => r.tanggal && r.omzet > 0);

      if (rows.length === 0) {
        MySwal.fire({ title: "Tidak ada data valid", text: "Pastikan kolom Tanggal & Omzet terisi sesuai template.", icon: "warning" });
        return;
      }

      const res = await bulkCreateDataUsaha(umkmId, rows);
      getDataUsaha(umkmId).then(setHistory);
      MySwal.fire({
        title: `Import selesai: ${res.inserted} baris masuk`,
        html: res.errors.length
          ? `<div style="text-align:left;font-size:0.85rem">${res.errors.slice(0, 8).join("<br>")}${res.errors.length > 8 ? "<br>…" : ""}</div>`
          : "Semua baris berhasil disimpan & diakumulasi ke pendapatan bulanan untuk AI XGBoost.",
        icon: res.errors.length ? "warning" : "success",
        confirmButtonColor: "#1d4ed8",
      });
    } catch (err) {
      MySwal.fire({ title: "Gagal impor", text: err instanceof Error ? err.message : "File tidak terbaca.", icon: "error" });
    } finally {
      setIsImporting(false);
    }
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
          <span style={{ color: "#1d4ed8", fontWeight: 700, fontSize: "0.9rem" }}><CheckCircle style={{ verticalAlign: "-0.125em" }} /> Data tersimpan & dikirim ke AI!</span>
        )}
      </header>

      <div className={styles.tabContainer}>
        <button className={`${styles.tabBtn} ${activeTab === "input" ? styles.tabActive : ""}`} onClick={() => setActiveTab("input")}>
          <Pencil style={{ verticalAlign: "-0.125em" }} /> Input Manual
        </button>
        <button className={`${styles.tabBtn} ${activeTab === "history" ? styles.tabActive : ""}`} onClick={() => setActiveTab("history")}>
          <Clipboard style={{ verticalAlign: "-0.125em" }} /> Riwayat Data
        </button>
        <button className={`${styles.tabBtn} ${activeTab === "api" ? styles.tabActive : ""}`} onClick={() => setActiveTab("api")}>
          <Link style={{ verticalAlign: "-0.125em" }} /> Integrasi API
        </button>
      </div>

      {/* Import Excel */}
      {activeTab === "input" && (
        <div className={`${styles.sectionCard} glass`} style={{ marginBottom: "1.25rem" }}>
          <div className={styles.sectionHeader}>
            <h3>Import dari Excel</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Isi banyak bulan sekaligus (min. 2 bulan untuk scoring AI)</span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem", lineHeight: 1.5 }}>
            Unduh template, isi kolom <strong>Tanggal (YYYY-MM-DD)</strong>, <strong>Omzet</strong>, <strong>Pengeluaran</strong>, dan <strong>Keterangan</strong>, lalu unggah kembali. Omzet akan otomatis diakumulasi per bulan untuk analisis AI XGBoost.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={downloadTemplate}
              className={styles.btnSecondary}
              style={{ padding: "0.6rem 1.15rem", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: "0.9rem" }}
            >
              <Save style={{ verticalAlign: "-0.125em" }} /> Unduh Template Excel
            </button>
            <label
              className={styles.btnPrimary}
              style={{ padding: "0.6rem 1.15rem", borderRadius: 10, cursor: isImporting ? "wait" : "pointer", fontWeight: 700, fontSize: "0.9rem", opacity: isImporting ? 0.7 : 1 }}
            >
              <Clipboard style={{ verticalAlign: "-0.125em" }} /> {isImporting ? "Mengimpor..." : "Upload File Excel"}
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImportFile}
                disabled={isImporting}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>
      )}

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
                style={{ color: "#1d4ed8", fontWeight: 700 }}
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
              {isSaving ? "Menyimpan ke Database AI..." : (
                <><Save style={{ verticalAlign: "-0.125em" }} /> Simpan & Kirim ke AI</>
              )}
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
                    <td style={{ fontWeight: 700, color: "#1d4ed8" }}>{entry.laba}</td>
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
            { key: "tokopedia" as const, name: "Tokopedia Seller", icon: <ShoppingCart />, desc: "Sinkronisasi otomatis data penjualan dari toko Tokopedia Anda." },
            { key: "shopee" as const, name: "Shopee API", icon: <ShoppingBag />, desc: "Tarik data transaksi real-time dari Shopee Seller Center." },
            { key: "pos" as const, name: "POS Kasir Digital", icon: <Monitor />, desc: "Integrasi dengan sistem kasir POS yang sudah Anda gunakan." },
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
                  {apiConnected[platform.key] ? (
                    <><Dot color="#22c55e" style={{ verticalAlign: "-0.125em" }} /> Terhubung</>
                  ) : (
                    <><Dot color="#9ca3af" style={{ verticalAlign: "-0.125em" }} /> Belum Terhubung</>
                  )}
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
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "0.5rem", background: "rgba(29,78,216,0.05)", borderRadius: 8, borderLeft: "3px solid #1d4ed8" }}>
                  <CheckCircle style={{ verticalAlign: "-0.125em" }} /> Sinkronisasi terakhir: 7 Jun 2026, 08:30 WIB
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

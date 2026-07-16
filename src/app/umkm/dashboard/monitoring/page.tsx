"use client";

import { useState, useEffect } from "react";
import styles from "../page.module.css";
import { CheckCircle, Pencil, ArrowUpTray, TrendingUp } from "@/components/icons";

interface OmzetReport {
  id: string;
  tanggal: string;
  omzet: number;
  penggunaan: string;
  catatan: string;
}

export default function MonitoringUsaha() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ tanggal: "", omzet: "", penggunaan: "", catatan: "" });
  const [reports, setReports] = useState<OmzetReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/umkm/monitoring")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted = data.map((d: any) => ({
            id: d.id,
            tanggal: new Date(d.tanggal).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric"
            }),
            omzet: Number(d.omzet),
            penggunaan: d.penggunaan,
            catatan: d.catatan || ""
          }));
          setReports(formatted);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const chartData = reports.slice(0, 5).reverse();
  const maxOmzet = Math.max(...chartData.map((r) => r.omzet), 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/umkm/monitoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal: form.tanggal || new Date().toISOString(),
          omzet: Number(form.omzet) || 0,
          penggunaan: form.penggunaan,
          catatan: form.catatan
        })
      });

      if (res.ok) {
        const d = await res.json();
        const newReport: OmzetReport = {
          id: d.id,
          tanggal: new Date(d.tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
          }),
          omzet: Number(d.omzet),
          penggunaan: d.penggunaan,
          catatan: d.catatan || ""
        };
        setReports((prev) => [newReport, ...prev]);
        setForm({ tanggal: "", omzet: "", penggunaan: "", catatan: "" });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Monitoring Usaha</h1>
          <p className={styles.subtitle}>
            Update omzet berkala dan laporan penggunaan dana untuk investor dan sistem risk management AI.
          </p>
        </div>
        {saved && <span style={{ color: "#1d4ed8", fontWeight: 700, fontSize: "0.9rem" }}><CheckCircle style={{ verticalAlign: "-0.125em" }} /> Laporan terkirim & investor dinotifikasi!</span>}
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className={`${styles.sectionCard} glass`}>
          <div className={styles.sectionHeader}>
            <h3><Pencil style={{ verticalAlign: "-0.125em" }} /> Input Update Omzet</h3>
            <span className={`${styles.badge} ${styles.badgeGreen}`}>Akad AKD-042 & AKD-038</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className={styles.inputGroup}>
              <label>Periode Laporan</label>
              <input type="date" className={styles.input} value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Total Omzet Periode Ini (Rp)</label>
              <input type="number" className={styles.input} placeholder="25000000" value={form.omzet} onChange={(e) => setForm({ ...form, omzet: e.target.value })} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Penggunaan Dana (dari Modal Akad)</label>
              <input className={styles.input} placeholder="Contoh: Operasional rutin & restock barang" value={form.penggunaan} onChange={(e) => setForm({ ...form, penggunaan: e.target.value })} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Catatan / Kendala</label>
              <textarea
                className={styles.textarea}
                rows={3}
                placeholder="Catatan kondisi usaha, kendala, atau pencapaian terbaru..."
                value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.btnPrimary}
              style={{ padding: "0.8rem 1.75rem", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: "0.9rem" }}
            >
              {isSubmitting ? "Mengirim laporan..." : (<><ArrowUpTray style={{ verticalAlign: "-0.125em" }} /> Kirim Laporan ke Investor</>)}
            </button>
          </div>
        </form>

        {/* Progress Chart */}
        <div className={`${styles.sectionCard} glass`}>
          <div className={styles.sectionHeader}>
            <h3><TrendingUp style={{ verticalAlign: "-0.125em" }} /> Grafik Progres Omzet</h3>
            <span className={`${styles.badge} ${styles.badgeGreen}`}>3 Bulan Terakhir</span>
          </div>

          <div className={styles.chartContainer} style={{ height: 200 }}>
            <div className={styles.chartLabelY}>
              <span>{(maxOmzet / 1000000).toFixed(0)} Jt</span>
              <span>{(maxOmzet * 0.66 / 1000000).toFixed(0)} Jt</span>
              <span>{(maxOmzet * 0.33 / 1000000).toFixed(0)} Jt</span>
              <span>0</span>
            </div>
            {chartData.map((r, i) => {
              const h = (r.omzet / maxOmzet) * 100;
              const label = r.tanggal.split(" ").slice(1).join(" ");
              return (
                <div key={i} className={styles.chartBarWrapper}>
                  <div className={styles.chartBar} style={{ height: `${h}%` }}>
                    <div className={styles.chartTooltip}>Rp {(r.omzet / 1000000).toFixed(1)} Jt</div>
                  </div>
                  <span className={styles.chartLabelX} style={{ fontSize: "0.65rem" }}>{label}</span>
                </div>
              );
            })}
          </div>

          {/* Target vs Aktual */}
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Progres Target Dana Akad</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1d4ed8" }}>75%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: "75%" }} />
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
              Dana terkumpul: Rp 75 Jt dari target Rp 100 Jt
            </p>
          </div>
        </div>
      </div>

      {/* Report History */}
      <div className={`${styles.tableSection} glass`}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontWeight: 800, color: "var(--text-color)" }}>Riwayat Laporan Monitoring</h3>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Terlihat oleh investor aktif Anda</span>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID Laporan</th>
                <th>Periode</th>
                <th>Omzet</th>
                <th>Penggunaan Dana</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: "monospace", color: "var(--text-muted)" }}>{r.id}</td>
                  <td style={{ fontWeight: 600 }}>{r.tanggal}</td>
                  <td style={{ fontWeight: 800, color: "#1d4ed8" }}>Rp {r.omzet.toLocaleString("id-ID")}</td>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{r.penggunaan}</td>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{r.catatan || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

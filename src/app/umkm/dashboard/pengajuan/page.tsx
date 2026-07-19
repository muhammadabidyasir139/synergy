"use client";

import { useState, useEffect } from "react";
import { createPengajuan, getPengajuans, isFinanceProfileComplete } from "../../actions/pengajuan";
import styles from "../page.module.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { CheckCircle, Pencil, Clipboard, BarChart, Rocket, Check, Refresh, XCircle } from "@/components/icons";

const MySwal = withReactContent(Swal);

interface Pengajuan {
  id: string;
  jenis: string;
  jumlah: string;
  durasi: string;
  deskripsi: string;
  status: "Pending" | "Approved" | "Rejected";
  tanggal: string;
}

export default function PengajuanPendanaan() {
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    jumlah: "",
    jenis: "Musyarakah",
    durasi: "12",
    tujuan: "",
    deskripsi: "",
  });

  const nisbah = form.jenis === "Musyarakah" ? "70:30 (UMKM:Investor)" : "Fixed margin 1.5%/bulan";
  const estimasiReturn = form.jenis === "Musyarakah" ? "15-25% p.a." : "18% p.a. (fixed)";

  const [pengajuanList, setPengajuanList] = useState<Pengajuan[]>([]);
  const [financeComplete, setFinanceComplete] = useState<boolean | null>(null);

  useEffect(() => {
    getPengajuans().then((data) => setPengajuanList(data as Pengajuan[])).catch(console.error);
    isFinanceProfileComplete().then(setFinanceComplete).catch(() => setFinanceComplete(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!financeComplete) {
      MySwal.fire({
        title: "Profil Keuangan Belum Lengkap",
        text: "Lengkapi dulu Profil Keuangan (aset lancar, laba bersih, dll.) di halaman Profil & Setup Usaha sebelum mengajukan pendanaan.",
        icon: "warning",
        confirmButtonColor: "#1d4ed8",
      });
      return;
    }

    MySwal.fire({
      title: "Konfirmasi Pengajuan",
      text: `Apakah Anda yakin ingin mengajukan pendanaan sebesar Rp ${parseInt(form.jumlah || "0").toLocaleString("id-ID")} dengan akad ${form.jenis}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Ajukan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#1d4ed8",
      cancelButtonColor: "#ef4444",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsSubmitting(true);
        createPengajuan({
          jumlah: parseInt(form.jumlah || "0"),
          jenis: form.jenis as "Musyarakah" | "Murabahah",
          durasi: parseInt(form.durasi || "12"),
          tujuan: form.tujuan + " - " + form.deskripsi
        }).then(() => {
          setIsSubmitting(false);
          setSubmitted(true);
          setForm({ jumlah: "", jenis: "Musyarakah", durasi: "12", tujuan: "", deskripsi: "" });
          getPengajuans().then((data) => setPengajuanList(data as Pengajuan[]));

          MySwal.fire({
            title: "Berhasil!",
            text: "Pengajuan pendanaan berhasil dikirim ke Admin untuk di-review.",
            icon: "success",
            confirmButtonColor: "#1d4ed8",
          }).then(() => {
            setSubmitted(false);
            setActiveTab("history");
          });
        }).catch((err) => {
          setIsSubmitting(false);
          MySwal.fire({
            title: "Gagal",
            text: err.message || "Gagal mengirim pengajuan.",
            icon: "error"
          });
        });
      }
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Pengajuan Pendanaan</h1>
          <p className={styles.subtitle}>
            Ajukan kebutuhan modal usaha dengan akad syariah. Skor kredit AI Anda saat ini: <strong style={{ color: "#1d4ed8" }}>78/100 (Low Risk)</strong>
          </p>
        </div>
        {submitted && (
          <span style={{ color: "#1d4ed8", fontWeight: 700, fontSize: "0.9rem" }}>
            <CheckCircle style={{ verticalAlign: "-0.125em" }} /> Pengajuan berhasil dikirim ke Admin!
          </span>
        )}
      </header>

      <div className={styles.tabContainer}>
        <button className={`${styles.tabBtn} ${activeTab === "form" ? styles.tabActive : ""}`} onClick={() => setActiveTab("form")}>
          <Pencil style={{ verticalAlign: "-0.125em" }} /> Form Pengajuan Baru
        </button>
        <button className={`${styles.tabBtn} ${activeTab === "history" ? styles.tabActive : ""}`} onClick={() => setActiveTab("history")}>
          <Clipboard style={{ verticalAlign: "-0.125em" }} /> Riwayat Pengajuan
          {pengajuanList.filter((p) => p.status === "Pending").length > 0 && (
            <span style={{ background: "#f59e0b", color: "#fff", fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: 20, marginLeft: "0.25rem" }}>
              {pengajuanList.filter((p) => p.status === "Pending").length}
            </span>
          )}
        </button>
      </div>

      {financeComplete === false && (
        <div style={{ padding: "1rem 1.25rem", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", marginBottom: "1.25rem", color: "#b91c1c", fontWeight: 600, fontSize: "0.9rem" }}>
          Profil Keuangan Anda belum lengkap. Lengkapi data keuangan (aset lancar, total hutang, laba bersih, dll.) di halaman{" "}
          <a href="/umkm/dashboard/profile" style={{ color: "#b91c1c", textDecoration: "underline" }}>Profil & Setup Usaha</a>{" "}
          sebelum mengajukan pendanaan.
        </div>
      )}

      {activeTab === "form" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1.5rem" }}>
          <form onSubmit={handleSubmit} className={`${styles.sectionCard} glass`}>
            <div className={styles.sectionHeader}>
              <h3>Detail Pengajuan Pendanaan Syariah</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <div className={styles.inputGroup}>
                <label>Jumlah Dana Dibutuhkan (Rp)</label>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="50000000"
                  value={form.jumlah}
                  onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Jenis Akad Syariah</label>
                <select className={styles.select} value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })}>
                  <option value="Musyarakah">Musyarakah (Bagi Hasil)</option>
                  <option value="Murabahah">Murabahah (Jual Beli)</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Durasi Pendanaan</label>
                <select className={styles.select} value={form.durasi} onChange={(e) => setForm({ ...form, durasi: e.target.value })}>
                  <option value="3">3 Bulan</option>
                  <option value="6">6 Bulan</option>
                  <option value="12">12 Bulan</option>
                  <option value="24">24 Bulan</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Tujuan Penggunaan Dana</label>
                <select className={styles.select} value={form.tujuan} onChange={(e) => setForm({ ...form, tujuan: e.target.value })} required>
                  <option value="">-- Pilih Tujuan --</option>
                  <option>Pengembangan Stok / Modal Kerja</option>
                  <option>Pembelian Peralatan & Aset</option>
                  <option>Renovasi & Ekspansi Lokasi</option>
                  <option>Pemasaran & Digitalisasi</option>
                  <option>Lainnya</option>
                </select>
              </div>
              <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                <label>Deskripsi Penggunaan Dana (Detail)</label>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  placeholder="Jelaskan secara detail rencana penggunaan dana yang diajukan..."
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Simulasi */}
            <div style={{ marginTop: "1.5rem", padding: "1.25rem", background: "rgba(29,78,216,0.06)", borderRadius: 12, border: "1px solid rgba(29,78,216,0.15)" }}>
              <h4 style={{ fontWeight: 800, color: "var(--text-color)", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                <BarChart style={{ verticalAlign: "-0.125em" }} /> Simulasi Akad
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", fontSize: "0.85rem" }}>
                <div>
                  <p style={{ color: "var(--text-muted)", fontWeight: 600 }}>Jenis Akad</p>
                  <p style={{ fontWeight: 700, color: "var(--text-color)" }}>{form.jenis}</p>
                </div>
                <div>
                  <p style={{ color: "var(--text-muted)", fontWeight: 600 }}>Nisbah / Margin</p>
                  <p style={{ fontWeight: 700, color: "#1d4ed8" }}>{nisbah}</p>
                </div>
                <div>
                  <p style={{ color: "var(--text-muted)", fontWeight: 600 }}>Est. Return Investor</p>
                  <p style={{ fontWeight: 700, color: "#1d4ed8" }}>{estimasiReturn}</p>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button
                type="submit"
                disabled={isSubmitting || financeComplete === false}
                className={styles.btnPrimary}
                style={{ padding: "0.85rem 2rem", border: "none", borderRadius: 10, cursor: financeComplete === false ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.95rem", opacity: financeComplete === false ? 0.6 : 1 }}
              >
                {isSubmitting ? "Mengirim ke Admin..." : (
                  <><Rocket style={{ verticalAlign: "-0.125em" }} /> Submit Pengajuan</>
                )}
              </button>
            </div>
          </form>

          {/* Info Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: 240 }}>
            <div className={`${styles.sectionCard} glass`} style={{ padding: "1.25rem" }}>
              <h4 style={{ fontWeight: 800, color: "var(--text-color)", marginBottom: "0.75rem", fontSize: "0.9rem" }}><CheckCircle style={{ verticalAlign: "-0.125em" }} /> Syarat Kelayakan</h4>
              {["Skor kredit ≥ 60", "Akun sudah KYC", "Tidak ada akad menunggak"].map((s, i) => (
                <p key={i} style={{ fontSize: "0.8rem", color: "#1d4ed8", fontWeight: 600, marginBottom: "0.35rem" }}><Check style={{ verticalAlign: "-0.125em" }} /> {s}</p>
              ))}
              <p style={{ fontSize: "0.8rem", color: financeComplete === false ? "#ef4444" : "#1d4ed8", fontWeight: 600, marginBottom: "0.35rem" }}>
                {financeComplete === false ? <XCircle style={{ verticalAlign: "-0.125em" }} /> : <Check style={{ verticalAlign: "-0.125em" }} />} Profil keuangan lengkap
              </p>
            </div>
            <div className={`${styles.sectionCard} glass`} style={{ padding: "1.25rem" }}>
              <h4 style={{ fontWeight: 800, color: "var(--text-color)", marginBottom: "0.75rem", fontSize: "0.9rem" }}><Refresh style={{ verticalAlign: "-0.125em" }} /> Proses Review</h4>
              {["Pengajuan diterima", "Review AI scoring", "Validasi Admin", "Tayang di Marketplace"].map((s, i) => (
                <p key={i} style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "0.35rem" }}>
                  <span style={{ color: "var(--primary)", marginRight: "0.35rem" }}>{i + 1}.</span>{s}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className={`${styles.tableSection} glass`}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
            <h3 style={{ fontWeight: 800, color: "var(--text-color)" }}>Riwayat Pengajuan</h3>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Jenis Akad</th>
                  <th>Jumlah</th>
                  <th>Durasi</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pengajuanList.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{p.id}</td>
                    <td>{p.jenis}</td>
                    <td style={{ fontWeight: 700 }}>{p.jumlah}</td>
                    <td>{p.durasi}</td>
                    <td style={{ color: "var(--text-muted)" }}>{p.tanggal}</td>
                    <td>
                      <span className={`${styles.badge} ${
                        p.status === "Approved" ? styles.badgeGreen :
                        p.status === "Pending" ? styles.badgeYellow :
                        styles.badgeRed
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

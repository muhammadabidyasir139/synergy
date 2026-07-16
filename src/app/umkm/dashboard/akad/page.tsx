"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { Refresh, Chain, CheckCircle, AlertTriangle, Pencil } from "@/components/icons";

interface Akad {
  id: string;
  investor: string;
  jenis: string;
  dana: string;
  nisbah: string;
  mulai: string;
  selesai: string;
  status: "Menunggu TTD" | "Aktif" | "Selesai";
  hash?: string;
}

export default function ManajemenAkad() {
  const [akadList, setAkadList] = useState<Akad[]>([
    {
      id: "AKD-042",
      investor: "Rahmat Wijaya",
      jenis: "Musyarakah",
      dana: "Rp 100.000.000",
      nisbah: "70:30",
      mulai: "1 Jan 2026",
      selesai: "31 Des 2026",
      status: "Aktif",
      hash: "0x8fa4b29c3d1e5a7f...blockchain",
    },
    {
      id: "AKD-038",
      investor: "Ahmad Fauzi",
      jenis: "Murabahah",
      dana: "Rp 50.000.000",
      nisbah: "Fixed 1.5%/bln",
      mulai: "15 Mar 2026",
      selesai: "15 Sep 2026",
      status: "Aktif",
      hash: "0x3db519ea7f2c9b4a...blockchain",
    },
    {
      id: "AKD-051",
      investor: "Siti Rahayu",
      jenis: "Musyarakah",
      dana: "Rp 75.000.000",
      nisbah: "65:35",
      mulai: "7 Jun 2026",
      selesai: "7 Jun 2027",
      status: "Menunggu TTD",
    },
  ]);

  const [selectedAkad, setSelectedAkad] = useState<Akad | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  const handleSign = (akad: Akad) => {
    setIsSigning(true);
    setTimeout(() => {
      const hash = "0x" + Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join("") + "...blockchain";
      setAkadList((prev) =>
        prev.map((a) => a.id === akad.id ? { ...a, status: "Aktif", hash } : a)
      );
      setIsSigning(false);
      setSelectedAkad(null);
    }, 2000);
  };

  const pending = akadList.filter((a) => a.status === "Menunggu TTD");
  const aktif = akadList.filter((a) => a.status === "Aktif");
  const selesai = akadList.filter((a) => a.status === "Selesai");

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Manajemen Akad Syariah</h1>
          <p className={styles.subtitle}>
            Tanda tangani dan pantau semua kontrak akad syariah yang tersimpan di blockchain immutable.
          </p>
        </div>
      </header>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
        {[
          { label: "Menunggu TTD", count: pending.length, color: "#f59e0b", icon: <Refresh /> },
          { label: "Akad Aktif", count: aktif.length, color: "#1d4ed8", icon: <Chain /> },
          { label: "Akad Selesai", count: selesai.length, color: "var(--text-muted)", icon: <CheckCircle /> },
        ].map((stat) => (
          <div key={stat.label} className={`${styles.metricCard} glass`}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>{stat.label}</span>
              <span style={{ fontSize: "1.5rem" }}>{stat.icon}</span>
            </div>
            <div className={styles.metricValue} style={{ color: stat.color, fontSize: "2.5rem" }}>{stat.count}</div>
          </div>
        ))}
      </div>

      {/* Pending Signature Banner */}
      {pending.length > 0 && (
        <div style={{
          padding: "1.25rem 1.5rem",
          background: "rgba(245,158,11,0.1)",
          borderRadius: 16,
          border: "1px solid rgba(245,158,11,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}>
          <div>
            <p style={{ fontWeight: 800, color: "var(--text-color)", marginBottom: "0.25rem" }}>
              <AlertTriangle style={{ verticalAlign: "-0.125em" }} /> {pending.length} Akad Menunggu Tanda Tangan Digital Anda
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Investor telah mengkonfirmasi investasi. Tanda tangan Anda diperlukan untuk mendeploy smart contract.
            </p>
          </div>
          <button
            onClick={() => setSelectedAkad(pending[0])}
            style={{ background: "#f59e0b", color: "#fff", border: "none", padding: "0.65rem 1.25rem", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", flexShrink: 0 }}
          >
            Tanda Tangan Sekarang
          </button>
        </div>
      )}

      {/* Akad Table */}
      <div className={`${styles.tableSection} glass`}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
          <h3 style={{ fontWeight: 800, color: "var(--text-color)" }}>Semua Kontrak Akad</h3>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID Akad</th>
                <th>Investor</th>
                <th>Jenis</th>
                <th>Dana</th>
                <th>Nisbah</th>
                <th>Periode</th>
                <th>Blockchain Hash</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {akadList.map((akad) => (
                <tr key={akad.id}>
                  <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{akad.id}</td>
                  <td style={{ fontWeight: 600 }}>{akad.investor}</td>
                  <td>
                    <span className={`${styles.badge} ${akad.jenis === "Musyarakah" ? styles.badgeGreen : styles.badgeBlue}`}>
                      {akad.jenis}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{akad.dana}</td>
                  <td style={{ color: "#1d4ed8", fontWeight: 700 }}>{akad.nisbah}</td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{akad.mulai} – {akad.selesai}</td>
                  <td>
                    {akad.hash ? (
                      <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-muted)" }}>{akad.hash}</span>
                    ) : (
                      <span style={{ color: "#f59e0b", fontSize: "0.75rem", fontWeight: 600 }}>Belum di-deploy</span>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${
                      akad.status === "Aktif" ? styles.badgeGreen :
                      akad.status === "Menunggu TTD" ? styles.badgeYellow :
                      styles.badgeBlue
                    }`}>{akad.status}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {akad.status === "Menunggu TTD" ? (
                      <button
                        onClick={() => setSelectedAkad(akad)}
                        className={`${styles.btnSm} ${styles.btnSmGreen}`}
                        style={{ border: "none", cursor: "pointer" }}
                      >
                        <Pencil style={{ verticalAlign: "-0.125em" }} /> Tanda Tangan
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedAkad(akad)}
                        className={`${styles.btnSm} ${styles.btnSmBlue}`}
                        style={{ border: "none", cursor: "pointer" }}
                      >
                        Detail
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signing Modal */}
      {selectedAkad && (
        <div className={styles.modalOverlay} onClick={() => !isSigning && setSelectedAkad(null)}>
          <div className={`${styles.modal} glass`} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className={styles.modalHeader}>
              <h2>{selectedAkad.status === "Menunggu TTD" ? "Tanda Tangan Digital Akad" : `Detail Akad ${selectedAkad.id}`}</h2>
              <button className={styles.closeBtn} onClick={() => !isSigning && setSelectedAkad(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              {[
                ["ID Akad", selectedAkad.id],
                ["Investor", selectedAkad.investor],
                ["Jenis Akad", selectedAkad.jenis],
                ["Jumlah Dana", selectedAkad.dana],
                ["Nisbah Bagi Hasil", selectedAkad.nisbah],
                ["Periode", `${selectedAkad.mulai} – ${selectedAkad.selesai}`],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid var(--border-color)" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-color)" }}>{val}</span>
                </div>
              ))}

              {selectedAkad.hash && (
                <div style={{ padding: "0.75rem 1rem", background: "rgba(29,78,216,0.08)", borderRadius: 10, marginTop: "0.5rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>Blockchain Hash</p>
                  <p style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#1d4ed8" }}>{selectedAkad.hash}</p>
                </div>
              )}

              {selectedAkad.status === "Menunggu TTD" && (
                <div style={{ padding: "1rem", background: "rgba(245,158,11,0.08)", borderRadius: 10, border: "1px solid rgba(245,158,11,0.2)", fontSize: "0.85rem", color: "var(--text-color)", lineHeight: 1.6 }}>
                  <AlertTriangle style={{ verticalAlign: "-0.125em" }} /> Dengan menandatangani akad ini, Anda menyetujui seluruh syarat dan ketentuan yang tercantum.
                  Smart contract akan di-deploy otomatis ke blockchain dan bersifat <strong>immutable</strong>.
                </div>
              )}
            </div>
            {selectedAkad.status === "Menunggu TTD" && (
              <div className={styles.modalFooter}>
                <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setSelectedAkad(null)} disabled={isSigning}>
                  Batal
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={() => handleSign(selectedAkad)}
                  disabled={isSigning}
                  style={{ padding: "0.8rem 1.5rem", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}
                >
                  {isSigning ? (
                    <><Refresh style={{ verticalAlign: "-0.125em" }} /> Deploy Smart Contract...</>
                  ) : (
                    <><Pencil style={{ verticalAlign: "-0.125em" }} /> Tanda Tangan & Deploy Blockchain</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

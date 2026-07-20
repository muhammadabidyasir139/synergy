"use client";

import { useEffect, useState } from "react";
import styles from "../page.module.css";
import { Refresh, Chain, CheckCircle, AlertTriangle, Pencil } from "@/components/icons";

interface Akad {
  id: string;
  investor: string;
  akadType: string;
  amount: number;
  nisbahInvestor: number;
  nisbahUmkm: number;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  blockchainHash?: string | null;
  contractAddress?: string | null;
  blockchainStatus?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  umkmSigned: boolean;
  investorSigned: boolean;
}

function formatDate(d?: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function statusLabel(a: Akad) {
  if (!a.umkmSigned) return "Menunggu TTD";
  if (a.status === "ACTIVE") return "Aktif";
  if (a.status === "COMPLETED") return "Selesai";
  if (a.status === "CANCELLED") return "Dibatalkan";
  return "Menunggu Blockchain";
}

function statusBadgeClass(styles: Record<string, string>, a: Akad) {
  const label = statusLabel(a);
  if (label === "Aktif") return styles.badgeGreen;
  if (label === "Menunggu TTD") return styles.badgeYellow;
  if (label === "Dibatalkan") return styles.badgeRed ?? styles.badgeYellow;
  return styles.badgeBlue;
}

export default function ManajemenAkad() {
  const [akadList, setAkadList] = useState<Akad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAkad, setSelectedAkad] = useState<Akad | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    fetch("/api/umkm/akads")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? "Gagal memuat akad");
        return r.json();
      })
      .then((d: Akad[]) => setAkadList(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSign = async (akad: Akad) => {
    setIsSigning(true);
    try {
      const res = await fetch(`/api/umkm/akads/${akad.id}/sign`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Gagal menandatangani akad.");
        return;
      }
      setAkadList((prev) =>
        prev.map((a) =>
          a.id === akad.id
            ? { ...a, umkmSigned: true, status: data.status, blockchainHash: data.blockchainHash, contractAddress: data.contractAddress }
            : a
        )
      );
      setSelectedAkad(null);
    } catch {
      alert("Tidak dapat terhubung ke server.");
    } finally {
      setIsSigning(false);
    }
  };

  const pending = akadList.filter((a) => !a.umkmSigned && a.status !== "CANCELLED");
  const aktif = akadList.filter((a) => a.umkmSigned && a.status === "ACTIVE");
  const selesai = akadList.filter((a) => a.status === "COMPLETED");

  if (isLoading) return <div style={{ padding: "2rem" }}>Memuat akad digital...</div>;

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
                  <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{akad.id.slice(0, 8).toUpperCase()}</td>
                  <td style={{ fontWeight: 600 }}>{akad.investor}</td>
                  <td>
                    <span className={`${styles.badge} ${akad.akadType === "MUSYARAKAH" ? styles.badgeGreen : styles.badgeBlue}`}>
                      {akad.akadType.charAt(0) + akad.akadType.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>Rp {akad.amount.toLocaleString("id-ID")}</td>
                  <td style={{ color: "#1d4ed8", fontWeight: 700 }}>{akad.nisbahInvestor}:{akad.nisbahUmkm}</td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{formatDate(akad.startDate)} – {formatDate(akad.endDate)}</td>
                  <td>
                    {akad.blockchainHash ? (
                      <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {akad.blockchainHash.slice(0, 14)}...
                      </span>
                    ) : (
                      <span style={{ color: "#f59e0b", fontSize: "0.75rem", fontWeight: 600 }}>Belum di-deploy</span>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${statusBadgeClass(styles, akad)}`}>{statusLabel(akad)}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {!akad.umkmSigned ? (
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
              {akadList.length === 0 && (
                <tr><td colSpan={9} style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)" }}>Belum ada akad.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signing / Detail Modal */}
      {selectedAkad && (
        <div className={styles.modalOverlay} onClick={() => !isSigning && setSelectedAkad(null)}>
          <div className={`${styles.modal} glass`} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className={styles.modalHeader}>
              <h2>{!selectedAkad.umkmSigned ? "Tanda Tangan Digital Akad" : `Detail Akad ${selectedAkad.id.slice(0, 8).toUpperCase()}`}</h2>
              <button className={styles.closeBtn} onClick={() => !isSigning && setSelectedAkad(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              {[
                ["ID Akad", selectedAkad.id.slice(0, 8).toUpperCase()],
                ["Investor", selectedAkad.investor],
                ["Jenis Akad", selectedAkad.akadType.charAt(0) + selectedAkad.akadType.slice(1).toLowerCase()],
                ["Jumlah Dana", `Rp ${selectedAkad.amount.toLocaleString("id-ID")}`],
                ["Nisbah Bagi Hasil", `${selectedAkad.nisbahInvestor}:${selectedAkad.nisbahUmkm} (Investor:UMKM)`],
                ["Periode", `${formatDate(selectedAkad.startDate)} – ${formatDate(selectedAkad.endDate)}`],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid var(--border-color)" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-color)" }}>{val}</span>
                </div>
              ))}

              {selectedAkad.blockchainHash && (
                <div style={{ padding: "0.75rem 1rem", background: "rgba(29,78,216,0.08)", borderRadius: 10, marginTop: "0.5rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>Blockchain Hash</p>
                  <p style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#1d4ed8" }}>{selectedAkad.blockchainHash}</p>
                </div>
              )}

              {!selectedAkad.umkmSigned && (
                <div style={{ padding: "1rem", background: "rgba(245,158,11,0.08)", borderRadius: 10, border: "1px solid rgba(245,158,11,0.2)", fontSize: "0.85rem", color: "var(--text-color)", lineHeight: 1.6 }}>
                  <AlertTriangle style={{ verticalAlign: "-0.125em" }} /> Dengan menandatangani akad ini, Anda menyetujui seluruh syarat dan ketentuan yang tercantum.
                  Smart contract akan di-deploy otomatis ke blockchain dan bersifat <strong>immutable</strong>.
                </div>
              )}
            </div>
            {!selectedAkad.umkmSigned && (
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

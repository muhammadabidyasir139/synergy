"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { Chain, Pencil, CheckCircle, Refresh, FileText } from "@/components/icons";

interface AkadItem {
  id: string;
  umkm: string;
  akadType: string;
  amount: number;
  nisbahInvestor: number;
  nisbahUmkm: number;
  status: string;
  blockchainHash?: string | null;
  contractAddress?: string | null;
  blockchainStatus?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  umkmSigned: boolean;
  investorSigned: boolean;
}

function getInvestorId() {
  if (typeof window === "undefined") return "";
  try { return JSON.parse(sessionStorage.getItem("synergy_investor_session") ?? "{}").investorProfileId ?? ""; }
  catch { return ""; }
}

export default function AkadPage() {
  const [akads, setAkads] = useState<AkadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAkad, setSelectedAkad] = useState<AkadItem | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    const id = getInvestorId();
    if (!id) return;
    fetch("/api/investor/akads", { headers: { "x-investor-id": id } })
      .then((r) => r.json())
      .then((d: AkadItem[]) => setAkads(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSign = async (akadId: string) => {
    setIsSigning(true);
    const investorId = getInvestorId();
    try {
      const res = await fetch(`/api/investor/akads/${akadId}/sign`, {
        method: "PATCH",
        headers: { "x-investor-id": investorId },
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Gagal menandatangani akad."); return; }

      setAkads((prev) =>
        prev.map((a) =>
          a.id === akadId
            ? { ...a, investorSigned: true, status: "ACTIVE", blockchainHash: data.blockchainHash, contractAddress: data.contractAddress }
            : a
        )
      );
      if (selectedAkad?.id === akadId) {
        setSelectedAkad((prev) => prev ? { ...prev, investorSigned: true, status: "ACTIVE", blockchainHash: data.blockchainHash, contractAddress: data.contractAddress } : prev);
      }
    } catch {
      alert("Tidak dapat terhubung ke server.");
    } finally {
      setIsSigning(false);
    }
  };

  const statusStyle = (s: string) =>
    s === "ACTIVE" ? styles.statusActive : s === "PENDING" ? styles.statusPending : styles.statusDone;

  const statusLabel = (s: string) =>
    s === "ACTIVE" ? "Active" : s === "PENDING" ? "Pending Signature" : "Completed";

  if (isLoading) return <div style={{ padding: "2rem" }}>Memuat akad digital...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.headerNote}>
        <span className={styles.noteIcon}><Chain /></span>
        <p>Semua akad ditandatangani secara digital dan disimpan permanen di blockchain (immutable). Hash transaksi menjadi bukti hukum yang tidak dapat diubah.</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.listPanel}>
          <h3 className={styles.panelTitle}>Daftar Akad ({akads.length})</h3>
          <div className={styles.akadList}>
            {akads.map((a) => (
              <div key={a.id} className={`${styles.akadCard} ${selectedAkad?.id === a.id ? styles.akadCardSelected : ""}`} onClick={() => setSelectedAkad(a)}>
                <div className={styles.akadTop}>
                  <div>
                    <p className={styles.akadId}>{a.id.slice(0, 8).toUpperCase()}</p>
                    <p className={styles.akadUmkm}>{a.umkm}</p>
                  </div>
                  <span className={`${styles.statusBadge} ${statusStyle(a.status)}`}>{statusLabel(a.status)}</span>
                </div>
                <div className={styles.akadMeta}>
                  <span>{a.akadType}</span><span>•</span>
                  <span>Rp {(a.amount / 1_000_000).toFixed(0)} Jt</span>
                </div>
                {a.status === "PENDING" && !a.investorSigned && (
                  <button className={styles.signBtn} disabled={isSigning} onClick={(e) => { e.stopPropagation(); handleSign(a.id); }}>
                    <Pencil style={{ verticalAlign: "-0.125em" }} /> Tanda Tangan Digital
                  </button>
                )}
              </div>
            ))}
            {akads.length === 0 && <p style={{ padding: "1rem", color: "var(--text-muted)" }}>Belum ada akad.</p>}
          </div>
        </div>

        <div className={styles.detailPanel}>
          {selectedAkad ? (
            <>
              <h3 className={styles.panelTitle}>Detail Akad {selectedAkad.id.slice(0, 8).toUpperCase()}</h3>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}><span className={styles.dLabel}>UMKM</span><span className={styles.dVal}>{selectedAkad.umkm}</span></div>
                <div className={styles.detailItem}><span className={styles.dLabel}>Jenis Akad</span><span className={styles.dVal}>{selectedAkad.akadType}</span></div>
                <div className={styles.detailItem}><span className={styles.dLabel}>Nominal</span><span className={styles.dVal}>Rp {selectedAkad.amount.toLocaleString("id-ID")}</span></div>
                <div className={styles.detailItem}><span className={styles.dLabel}>Nisbah</span><span className={styles.dVal}>{selectedAkad.nisbahInvestor}:{selectedAkad.nisbahUmkm} (Investor:UMKM)</span></div>
                {selectedAkad.startDate && <div className={styles.detailItem}><span className={styles.dLabel}>Mulai</span><span className={styles.dVal}>{new Date(selectedAkad.startDate).toLocaleDateString("id-ID")}</span></div>}
                {selectedAkad.endDate && <div className={styles.detailItem}><span className={styles.dLabel}>Berakhir</span><span className={styles.dVal}>{new Date(selectedAkad.endDate).toLocaleDateString("id-ID")}</span></div>}
              </div>

              <div className={styles.sigSection}>
                <h4 className={styles.sigTitle}>Status Tanda Tangan</h4>
                <div className={styles.sigRow}>
                  <div className={`${styles.sigItem} ${selectedAkad.umkmSigned ? styles.sigDone : styles.sigPending}`}>
                    <span>{selectedAkad.umkmSigned ? <CheckCircle /> : <Refresh />}</span>
                    <span>UMKM ({selectedAkad.umkm})</span>
                  </div>
                  <div className={`${styles.sigItem} ${selectedAkad.investorSigned ? styles.sigDone : styles.sigPending}`}>
                    <span>{selectedAkad.investorSigned ? <CheckCircle /> : <Refresh />}</span>
                    <span>Investor (Anda)</span>
                  </div>
                </div>
              </div>

              {selectedAkad.blockchainHash && (
                <div className={styles.blockchainBox}>
                  <div className={styles.bcHeader}>
                    <span className={styles.bcIcon}><Chain /></span>
                    <span className={styles.bcTitle}>Blockchain Record</span>
                    <span className={styles.bcStatus}><CheckCircle style={{ verticalAlign: "-0.125em" }} /> Confirmed</span>
                  </div>
                  <div className={styles.bcField}><span className={styles.bcLabel}>Transaction Hash</span><span className={styles.bcVal}>{selectedAkad.blockchainHash}</span></div>
                  <div className={styles.bcField}><span className={styles.bcLabel}>Smart Contract Address</span><span className={styles.bcVal}>{selectedAkad.contractAddress}</span></div>
                </div>
              )}

              {selectedAkad.status === "PENDING" && !selectedAkad.investorSigned && (
                <button className={styles.signBtnLarge} disabled={isSigning} onClick={() => handleSign(selectedAkad.id)}>
                  {isSigning ? "Memproses..." : <><Pencil style={{ verticalAlign: "-0.125em" }} /> Tanda Tangan Digital Sekarang</>}
                </button>
              )}
            </>
          ) : (
            <div className={styles.emptyDetail}>
              <span><FileText /></span>
              <p>Pilih akad dari daftar untuk melihat detail dan blockchain record.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

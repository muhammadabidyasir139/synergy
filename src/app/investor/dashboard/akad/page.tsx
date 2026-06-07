"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface AkadItem {
  id: string;
  umkm: string;
  type: string;
  amount: string;
  nisbah: string;
  status: "Pending Signature" | "Active" | "Completed";
  blockchainHash?: string;
  contractAddress?: string;
  startDate?: string;
  endDate?: string;
  umkmSigned: boolean;
  investorSigned: boolean;
}

export default function AkadPage() {
  const [akads, setAkads] = useState<AkadItem[]>([
    {
      id: "AKD-042",
      umkm: "Toko Sembako Berkah",
      type: "Musyarakah",
      amount: "Rp 50.000.000",
      nisbah: "40:60 (Investor:UMKM)",
      status: "Active",
      blockchainHash: "0x8fa4b2c1d3e5...29cf",
      contractAddress: "0x742d35Cc6634C0532925a3b844Bc454e",
      startDate: "01 Jan 2026",
      endDate: "31 Des 2026",
      umkmSigned: true,
      investorSigned: true,
    },
    {
      id: "AKD-038",
      umkm: "Kopi Nusantara Mandiri",
      type: "Murabahah",
      amount: "Rp 75.000.000",
      nisbah: "Fixed Margin 9%",
      status: "Pending Signature",
      umkmSigned: true,
      investorSigned: false,
    },
  ]);

  const [selectedAkad, setSelectedAkad] = useState<AkadItem | null>(null);

  const handleSign = (id: string) => {
    setAkads((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const hash = "0x" + Math.random().toString(16).slice(2, 12) + "...blockchain";
          const addr = "0x" + Math.random().toString(16).slice(2, 42);
          return {
            ...a,
            investorSigned: true,
            status: "Active",
            blockchainHash: hash,
            contractAddress: addr,
            startDate: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
          };
        }
        return a;
      })
    );
    if (selectedAkad?.id === id) setSelectedAkad(null);
  };

  const statusStyle = (s: string) =>
    s === "Active" ? styles.statusActive : s === "Pending Signature" ? styles.statusPending : styles.statusDone;

  return (
    <div className={styles.page}>
      <div className={styles.headerNote}>
        <span className={styles.noteIcon}>⛓️</span>
        <p>Semua akad ditandatangani secara digital dan disimpan permanen di blockchain (immutable). Hash transaksi menjadi bukti hukum yang tidak dapat diubah.</p>
      </div>

      <div className={styles.layout}>
        {/* Akad List */}
        <div className={styles.listPanel}>
          <h3 className={styles.panelTitle}>Daftar Akad ({akads.length})</h3>
          <div className={styles.akadList}>
            {akads.map((a) => (
              <div
                key={a.id}
                className={`${styles.akadCard} ${selectedAkad?.id === a.id ? styles.akadCardSelected : ""}`}
                onClick={() => setSelectedAkad(a)}
              >
                <div className={styles.akadTop}>
                  <div>
                    <p className={styles.akadId}>{a.id}</p>
                    <p className={styles.akadUmkm}>{a.umkm}</p>
                  </div>
                  <span className={`${styles.statusBadge} ${statusStyle(a.status)}`}>{a.status}</span>
                </div>
                <div className={styles.akadMeta}>
                  <span>{a.type}</span>
                  <span>•</span>
                  <span>{a.amount}</span>
                </div>

                {a.status === "Pending Signature" && (
                  <button className={styles.signBtn} onClick={(e) => { e.stopPropagation(); handleSign(a.id); }}>
                    ✍️ Tanda Tangan Digital
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className={styles.detailPanel}>
          {selectedAkad ? (
            <>
              <h3 className={styles.panelTitle}>Detail Akad {selectedAkad.id}</h3>

              <div className={styles.detailGrid}>
                <div className={styles.detailItem}><span className={styles.dLabel}>UMKM</span><span className={styles.dVal}>{selectedAkad.umkm}</span></div>
                <div className={styles.detailItem}><span className={styles.dLabel}>Jenis Akad</span><span className={styles.dVal}>{selectedAkad.type}</span></div>
                <div className={styles.detailItem}><span className={styles.dLabel}>Nominal</span><span className={styles.dVal}>{selectedAkad.amount}</span></div>
                <div className={styles.detailItem}><span className={styles.dLabel}>Nisbah</span><span className={styles.dVal}>{selectedAkad.nisbah}</span></div>
                {selectedAkad.startDate && (
                  <div className={styles.detailItem}><span className={styles.dLabel}>Mulai</span><span className={styles.dVal}>{selectedAkad.startDate}</span></div>
                )}
                {selectedAkad.endDate && (
                  <div className={styles.detailItem}><span className={styles.dLabel}>Berakhir</span><span className={styles.dVal}>{selectedAkad.endDate}</span></div>
                )}
              </div>

              {/* Signatures */}
              <div className={styles.sigSection}>
                <h4 className={styles.sigTitle}>Status Tanda Tangan</h4>
                <div className={styles.sigRow}>
                  <div className={`${styles.sigItem} ${selectedAkad.umkmSigned ? styles.sigDone : styles.sigPending}`}>
                    <span>{selectedAkad.umkmSigned ? "✅" : "⏳"}</span>
                    <span>UMKM ({selectedAkad.umkm})</span>
                  </div>
                  <div className={`${styles.sigItem} ${selectedAkad.investorSigned ? styles.sigDone : styles.sigPending}`}>
                    <span>{selectedAkad.investorSigned ? "✅" : "⏳"}</span>
                    <span>Investor (Anda)</span>
                  </div>
                </div>
              </div>

              {/* Blockchain Info */}
              {selectedAkad.blockchainHash && (
                <div className={styles.blockchainBox}>
                  <div className={styles.bcHeader}>
                    <span className={styles.bcIcon}>⛓️</span>
                    <span className={styles.bcTitle}>Blockchain Record</span>
                    <span className={styles.bcStatus}>✅ Confirmed</span>
                  </div>
                  <div className={styles.bcField}>
                    <span className={styles.bcLabel}>Transaction Hash</span>
                    <span className={styles.bcVal}>{selectedAkad.blockchainHash}</span>
                  </div>
                  <div className={styles.bcField}>
                    <span className={styles.bcLabel}>Smart Contract Address</span>
                    <span className={styles.bcVal}>{selectedAkad.contractAddress}</span>
                  </div>
                </div>
              )}

              {selectedAkad.status === "Pending Signature" && (
                <button className={styles.signBtnLarge} onClick={() => handleSign(selectedAkad.id)}>
                  ✍️ Tanda Tangan Digital Sekarang
                </button>
              )}
            </>
          ) : (
            <div className={styles.emptyDetail}>
              <span>📄</span>
              <p>Pilih akad dari daftar untuk melihat detail dan blockchain record.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

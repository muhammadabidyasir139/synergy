"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface AkadCampaign {
  id: string;
  umkmName: string;
  targetFunding: string;
  fundedPercentage: number;
  akadType: "Mudharabah" | "Musyarakah";
  nisbah: string;
  investorCount: number;
  status: "Waiting Approval" | "Deploying" | "Deployed";
}

export default function AkadApprovalPage() {
  const [campaigns, setCampaigns] = useState<AkadCampaign[]>([
    {
      id: "CMP-771",
      umkmName: "Toko Sembako Maju Jaya",
      targetFunding: "Rp 150.000.000",
      fundedPercentage: 100,
      akadType: "Mudharabah",
      nisbah: "60:40",
      investorCount: 32,
      status: "Waiting Approval"
    },
    {
      id: "CMP-772",
      umkmName: "Peternakan Ayam Bahagia",
      targetFunding: "Rp 75.000.000",
      fundedPercentage: 100,
      akadType: "Musyarakah",
      nisbah: "50:50",
      investorCount: 15,
      status: "Waiting Approval"
    }
  ]);

  const [toast, setToast] = useState<{show: boolean, msg: string}>({show: false, msg: ""});

  const handleDeploy = (id: string) => {
    // 1. Set status to deploying (triggers loading bar animation)
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: "Deploying" } : c));
    
    // 2. Simulate smart contract deployment delay (3 seconds)
    setTimeout(() => {
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: "Deployed" } : c));
      
      setToast({show: true, msg: `✅ Smart Contract untuk ${id} berhasil di-deploy ke Blockchain Ledger!`});
      setTimeout(() => setToast({show: false, msg: ""}), 4000);
      
      // 3. Remove from list after a short delay so admin sees the success state briefly
      setTimeout(() => {
        setCampaigns(prev => prev.filter(c => c.id !== id));
      }, 1500);
      
    }, 3000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Approval Akad & Smart Contract</h1>
        <p className={styles.subtitle}>
          Sahkan pendanaan kampanye UMKM yang telah memenuhi target 100% dan deploy perjanjian bagi hasil ke dalam Immutable Blockchain Ledger.
        </p>
      </header>

      <div className={`${styles.toast} ${toast.show ? styles.toastVisible : ""}`}>
        {toast.msg}
      </div>

      <div className={styles.cardGrid}>
        {campaigns.length === 0 ? (
          <div className={`${styles.emptyState} glass`}>
            <span className={styles.emptyIcon}>🎉</span>
            <h3>Semua Akad Telah Disahkan</h3>
            <p>Tidak ada kampanye UMKM yang menunggu persetujuan smart contract saat ini.</p>
          </div>
        ) : (
          campaigns.map((camp) => (
            <div key={camp.id} className={`${styles.campaignCard} glass ${camp.status === "Deployed" ? styles.cardSuccess : ""}`}>
              
              <div className={styles.cardHeader}>
                <div className={styles.headerTitleGroup}>
                  <h3>{camp.umkmName}</h3>
                  <span className={styles.campaignId}>{camp.id}</span>
                </div>
                <div className={styles.badgeWrapper}>
                  <span className={styles.statusBadge}>Fully Funded 100%</span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tipe Akad</span>
                  <span className={styles.detailValHighlight}>{camp.akadType}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Total Pendanaan</span>
                  <span className={styles.detailVal}>{camp.targetFunding}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Porsi Nisbah (Inv:UMKM)</span>
                  <span className={styles.detailVal}>{camp.nisbah}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Total Investor Tergabung</span>
                  <span className={styles.detailVal}>{camp.investorCount} Entitas</span>
                </div>
              </div>

              {/* Action & Deployment Area */}
              <div className={styles.cardFooter}>
                {camp.status === "Waiting Approval" && (
                  <button 
                    className={styles.deployBtn}
                    onClick={() => handleDeploy(camp.id)}
                  >
                    <span className={styles.btnIcon}>✍️</span> Sahkan & Deploy Contract
                  </button>
                )}

                {camp.status === "Deploying" && (
                  <div className={styles.deployingState}>
                    <p className={styles.deployingText}>Mengenkripsi dan menandatangani digital...</p>
                    <div className={styles.progressBarWrapper}>
                      <div className={styles.progressBarFill}></div>
                    </div>
                  </div>
                )}

                {camp.status === "Deployed" && (
                  <div className={styles.deployedState}>
                    <span className={styles.successIcon}>✓</span>
                    <p className={styles.successText}>Akad Ter-deploy di Ledger</p>
                  </div>
                )}
              </div>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import { Sparkles, Pencil, Check } from "@/components/icons";

interface AkadItem {
  id: string;
  campaignId: string;
  umkmName: string;
  targetAmount: number;
  collectedAmount: number;
  fundedPercentage: number;
  akadType: string;
  nisbahUmkm: number;
  nisbahInvestor: number;
  investorCount: number;
  principalAmount: number;
  durationMonths: number;
  status: string;
  blockchainStatus: string | null;
  createdAt: string;
  uiStatus: "Waiting Approval" | "Deploying" | "Deployed";
}

export default function AkadApprovalPage() {
  const [akads, setAkads] = useState<AkadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({ show: false, msg: "", type: "success" });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };

  const fetchAkads = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/akad-approval");
    const data = await res.json();
    setAkads(data.map((a: AkadItem) => ({ ...a, uiStatus: "Waiting Approval" as const })));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAkads();
  }, [fetchAkads]);

  const handleDeploy = async (akad: AkadItem) => {
    setAkads((prev) =>
      prev.map((a) => (a.id === akad.id ? { ...a, uiStatus: "Deploying" } : a))
    );

    const res = await fetch(`/api/admin/akad-approval/${akad.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });

    if (res.ok) {
      setAkads((prev) =>
        prev.map((a) => (a.id === akad.id ? { ...a, uiStatus: "Deployed" } : a))
      );
      showToast(`Smart Contract untuk ${akad.umkmName} berhasil di-deploy ke Blockchain Ledger!`, "success");
      setTimeout(() => {
        setAkads((prev) => prev.filter((a) => a.id !== akad.id));
      }, 1500);
    } else {
      setAkads((prev) =>
        prev.map((a) => (a.id === akad.id ? { ...a, uiStatus: "Waiting Approval" } : a))
      );
      const body = await res.json().catch(() => ({}));
      showToast(body.error ? `Gagal deploy: ${body.error}` : "Gagal deploy akad. Coba lagi.", "error");
    }
  };

  const fmtRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "4rem", opacity: 0.6 }}>Memuat data...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Approval Akad & Smart Contract</h1>
        <p className={styles.subtitle}>
          Sahkan pendanaan kampanye UMKM yang telah memenuhi target 100% dan deploy perjanjian bagi
          hasil ke dalam Immutable Blockchain Ledger.
        </p>
      </header>

      <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : ""} ${toast.show ? styles.toastVisible : ""}`}>
        {toast.msg}
      </div>

      <div className={styles.cardGrid}>
        {akads.length === 0 ? (
          <div className={`${styles.emptyState} glass`}>
            <span className={styles.emptyIcon}><Sparkles /></span>
            <h3>Semua Akad Telah Disahkan</h3>
            <p>
              Tidak ada kampanye UMKM yang menunggu persetujuan smart contract saat ini.
            </p>
          </div>
        ) : (
          akads.map((akad) => (
            <div
              key={akad.id}
              className={`${styles.campaignCard} glass ${
                akad.uiStatus === "Deployed" ? styles.cardSuccess : ""
              }`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.headerTitleGroup}>
                  <h3>{akad.umkmName}</h3>
                  <span className={styles.campaignId}>{akad.campaignId.slice(0, 8)}...</span>
                </div>
                <div className={styles.badgeWrapper}>
                  <span className={styles.statusBadge}>
                    Terfunding {akad.fundedPercentage}%
                  </span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tipe Akad</span>
                  <span className={styles.detailValHighlight}>{akad.akadType}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Total Pendanaan</span>
                  <span className={styles.detailVal}>{fmtRupiah(akad.principalAmount)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Porsi Nisbah (Inv:UMKM)</span>
                  <span className={styles.detailVal}>
                    {akad.nisbahInvestor}:{akad.nisbahUmkm}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Total Investor Tergabung</span>
                  <span className={styles.detailVal}>{akad.investorCount} Entitas</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tenor</span>
                  <span className={styles.detailVal}>{akad.durationMonths} Bulan</span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                {akad.uiStatus === "Waiting Approval" && (
                  <button className={styles.deployBtn} onClick={() => handleDeploy(akad)}>
                    <span className={styles.btnIcon}><Pencil /></span> Sahkan & Deploy Contract
                  </button>
                )}

                {akad.uiStatus === "Deploying" && (
                  <div className={styles.deployingState}>
                    <p className={styles.deployingText}>
                      Mengenkripsi dan menandatangani digital...
                    </p>
                    <div className={styles.progressBarWrapper}>
                      <div className={styles.progressBarFill}></div>
                    </div>
                  </div>
                )}

                {akad.uiStatus === "Deployed" && (
                  <div className={styles.deployedState}>
                    <span className={styles.successIcon}><Check /></span>
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

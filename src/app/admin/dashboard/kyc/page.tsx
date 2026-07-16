"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import { Refresh, Users, Sparkles, FileText } from "@/components/icons";

interface KycUser {
  id: string;
  name: string;
  role: "UMKM" | "INVESTOR";
  status: string;
  kycStatus: string;
  registrationDate: string;
  lastLoginAt: string | null;
  documents: { id: string; type: string; url: string; status: string }[];
}

interface ActiveUser {
  id: string;
  name: string;
  role: "UMKM" | "INVESTOR";
  status: string;
  kycStatus: string;
  lastLoginAt: string | null;
  createdAt: string;
}

interface AuditEntry {
  id: string;
  time: string;
  action: string;
  detail: string;
}

type Tab = "pending" | "active";

export default function KYCManagement() {
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [pendingUsers, setPendingUsers] = useState<KycUser[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);

  const [docLightbox, setDocLightbox] = useState<KycUser | null>(null);
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: "reject" | "suspend" | "ban";
    userId: string;
    userName: string;
  }>({ isOpen: false, type: "reject", userId: "", userName: "" });
  const [actionReason, setActionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const logAction = useCallback((action: string, detail: string) => {
    setAuditLogs((prev) => [
      {
        id: `LOG-${Date.now()}`,
        time: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB",
        action,
        detail,
      },
      ...prev,
    ]);
  }, []);

  const fetchPending = useCallback(async () => {
    const res = await fetch("/api/admin/kyc?status=PENDING");
    const data = await res.json();
    setPendingUsers(data);
  }, []);

  const fetchActive = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    const data: ActiveUser[] = await res.json();
    setActiveUsers(data.filter((u) => u.kycStatus === "APPROVED"));
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchPending(), fetchActive()]);
      setLoading(false);
    })();
  }, [fetchPending, fetchActive]);

  const handleApprove = async (user: KycUser) => {
    setSubmitting(true);
    try {
      await fetch(`/api/admin/kyc/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      setPendingUsers((prev) => prev.filter((u) => u.id !== user.id));
      await fetchActive();
      logAction("Approve KYC", `Menyetujui KYC untuk ${user.name}.`);
      setDocLightbox(null);
    } finally {
      setSubmitting(false);
    }
  };

  const openRejectModal = (user: KycUser) => {
    setActionModal({ isOpen: true, type: "reject", userId: user.id, userName: user.name });
    setActionReason("");
    setDocLightbox(null);
  };

  const openActionModal = (user: ActiveUser, type: "suspend" | "ban") => {
    setActionModal({ isOpen: true, type, userId: user.id, userName: user.name });
    setActionReason("");
  };

  const handleReactivate = async (user: ActiveUser) => {
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reactivate" }),
    });
    setActiveUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: "ACTIVE" } : u))
    );
    logAction("Reactivate", `Mengaktifkan kembali akun ${user.name}.`);
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionReason.trim()) return;
    setSubmitting(true);

    try {
      if (actionModal.type === "reject") {
        await fetch(`/api/admin/kyc/${actionModal.userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reject", reason: actionReason }),
        });
        setPendingUsers((prev) => prev.filter((u) => u.id !== actionModal.userId));
        logAction("Reject KYC", `Menolak KYC ${actionModal.userName}. Alasan: ${actionReason}`);
      } else {
        const action = actionModal.type === "suspend" ? "suspend" : "ban";
        await fetch(`/api/admin/users/${actionModal.userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, reason: actionReason }),
        });
        const newStatus = action === "suspend" ? "SUSPENDED" : "BANNED";
        setActiveUsers((prev) =>
          prev.map((u) => (u.id === actionModal.userId ? { ...u, status: newStatus } : u))
        );
        logAction(
          action === "suspend" ? "Suspend" : "Ban",
          `${action === "suspend" ? "Menangguhkan" : "Memblokir"} ${actionModal.userName}. Alasan: ${actionReason}`
        );
      }
      setActionModal({ ...actionModal, isOpen: false });
    } finally {
      setSubmitting(false);
    }
  };

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB" : "-";

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
        <div>
          <h1 className={styles.title}>Verifikasi KYC & Manajemen User</h1>
          <p className={styles.subtitle}>
            Tinjau kelayakan pengguna dan kelola status akun sesuai regulasi keamanan.
          </p>
        </div>
      </header>

      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === "pending" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          <span className={styles.tabIcon}><Refresh /></span>
          Menunggu KYC
          {pendingUsers.length > 0 && <span className={styles.badge}>{pendingUsers.length}</span>}
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "active" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("active")}
        >
          <span className={styles.tabIcon}><Users /></span>
          Pengguna Aktif
        </button>
      </div>

      <div className={styles.contentArea}>
        {activeTab === "pending" && (
          <div className={styles.listSection}>
            {pendingUsers.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><Sparkles /></div>
                <h3>Semua Pendaftar Telah Ditinjau</h3>
                <p>Tidak ada pengguna yang menunggu verifikasi saat ini.</p>
              </div>
            ) : (
              <div className={styles.cardGrid}>
                {pendingUsers.map((user) => (
                  <div key={user.id} className={`${styles.userCard} glass`}>
                    <div className={styles.cardHeader}>
                      <div>
                        <h3 className={styles.userName}>{user.name}</h3>
                        <div className={styles.userMeta}>
                          <span className={styles.userRoleBadge}>{user.role}</span>
                          <span className={styles.userId}>{user.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.dateInfo}>
                        <span className={styles.label}>Tanggal Daftar:</span>
                        <span>{fmtDate(user.registrationDate)}</span>
                      </div>
                      <div className={styles.docList}>
                        <span className={styles.label}>Dokumen Terlampir:</span>
                        <div className={styles.docTags}>
                          {user.documents.map((doc) => (
                            <span key={doc.id} className={styles.docTag}>
                              <FileText style={{ verticalAlign: "-0.125em" }} /> {doc.type}
                            </span>
                          ))}
                          {user.documents.length === 0 && (
                            <span className={styles.docTag}>Belum ada dokumen</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() => setDocLightbox(user)}
                      >
                        Review Dokumen Lengkap
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "active" && (
          <div className={`${styles.tableSection} glass`}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID User</th>
                    <th>Nama Pengguna</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Terakhir Aktif</th>
                    <th style={{ textAlign: "right" }}>Aksi Kontrol</th>
                  </tr>
                </thead>
                <tbody>
                  {activeUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "2rem", opacity: 0.6 }}>
                        Belum ada pengguna aktif.
                      </td>
                    </tr>
                  ) : (
                    activeUsers.map((user) => (
                      <tr
                        key={user.id}
                        className={user.status !== "ACTIVE" ? styles.rowMuted : ""}
                      >
                        <td className={styles.tdId}>{user.id.slice(0, 8)}...</td>
                        <td className={styles.tdName}>{user.name}</td>
                        <td>
                          <span className={styles.userRoleBadge}>{user.role}</span>
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              user.status === "ACTIVE"
                                ? styles.statusActive
                                : user.status === "SUSPENDED"
                                ? styles.statusWarn
                                : styles.statusDanger
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className={styles.tdTime}>{fmtDate(user.lastLoginAt)}</td>
                        <td style={{ textAlign: "right" }}>
                          {user.status === "ACTIVE" ? (
                            <div className={styles.actionButtonGroup}>
                              <button
                                onClick={() => openActionModal(user, "suspend")}
                                className={`${styles.btnSm} ${styles.btnWarn}`}
                              >
                                Suspend
                              </button>
                              <button
                                onClick={() => openActionModal(user, "ban")}
                                className={`${styles.btnSm} ${styles.btnDanger}`}
                              >
                                Ban
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleReactivate(user)}
                              className={`${styles.btnSm} ${styles.btnSuccess}`}
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* AUDIT LOG */}
      <div className={`${styles.auditSection} glass`}>
        <div className={styles.auditHeader}>
          <h3><FileText style={{ verticalAlign: "-0.125em" }} /> Live Audit Trail</h3>
          <span className={styles.pulseDot}></span>
        </div>
        <div className={styles.auditList}>
          {auditLogs.length === 0 ? (
            <div className={styles.auditItem} style={{ opacity: 0.5 }}>
              Belum ada aktivitas dalam sesi ini.
            </div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className={styles.auditItem}>
                <div className={styles.auditTime}>{log.time}</div>
                <div className={styles.auditContent}>
                  <span className={styles.auditAction}>[{log.action}]</span> {log.detail}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DOCUMENT LIGHTBOX */}
      {docLightbox && (
        <div className={styles.modalOverlay} onClick={() => setDocLightbox(null)}>
          <div className={`${styles.lightboxModal} glass`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Review Dokumen KYC: {docLightbox.name}</h2>
              <button className={styles.closeBtn} onClick={() => setDocLightbox(null)}>×</button>
            </div>
            <div className={styles.lightboxBody}>
              <div className={styles.docPreviewArea}>
                {docLightbox.documents.length === 0 ? (
                  <p style={{ opacity: 0.6 }}>Tidak ada dokumen yang diunggah.</p>
                ) : (
                  docLightbox.documents.map((doc) => (
                    <div key={doc.id} className={styles.docBox}>
                      <div className={styles.docBoxHeader}>{doc.type}</div>
                      <div className={styles.docMockup}>
                        <span className={styles.docMockupText}>{doc.url}</span>
                        <div className={styles.docMockupWatermark}>DOCUMENT PREVIEW</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.btnDangerOutline}`}
                onClick={() => openRejectModal(docLightbox)}
                disabled={submitting}
              >
                Tolak & Minta Revisi
              </button>
              <button
                className={`${styles.btn} ${styles.btnSuccess}`}
                onClick={() => handleApprove(docLightbox)}
                disabled={submitting}
              >
                {submitting ? "Memproses..." : "Setujui & Aktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION MODAL */}
      {actionModal.isOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setActionModal({ ...actionModal, isOpen: false })}
        >
          <div
            className={`${styles.actionModal} glass`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>
                {actionModal.type === "reject" && "Tolak Verifikasi KYC"}
                {actionModal.type === "suspend" && "Tangguhkan Akun (Suspend)"}
                {actionModal.type === "ban" && "Blokir Permanen (Ban)"}
              </h2>
              <button
                className={styles.closeBtn}
                onClick={() => setActionModal({ ...actionModal, isOpen: false })}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleActionSubmit}>
              <div className={styles.modalBody}>
                <p className={styles.modalWarning}>
                  Anda akan{" "}
                  {actionModal.type === "reject"
                    ? "menolak"
                    : actionModal.type === "suspend"
                    ? "menangguhkan"
                    : "memblokir"}{" "}
                  akun <strong>{actionModal.userName}</strong>. Tindakan ini memerlukan catatan
                  audit wajib.
                </p>
                <div className={styles.inputGroup}>
                  <label htmlFor="reason">Alasan Tindakan (Wajib)</label>
                  <textarea
                    id="reason"
                    rows={4}
                    placeholder="Masukkan alasan spesifik..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    required
                    className={styles.textarea}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnGhost}`}
                  onClick={() => setActionModal({ ...actionModal, isOpen: false })}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnDanger}`}
                  disabled={!actionReason.trim() || submitting}
                >
                  {submitting ? "Memproses..." : "Konfirmasi Tindakan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

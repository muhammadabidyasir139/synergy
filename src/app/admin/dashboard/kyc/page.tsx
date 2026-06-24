"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface PendingUser {
  id: string;
  name: string;
  role: "UMKM" | "Investor";
  registrationDate: string;
  documents: { type: string; label: string; previewText: string }[];
}

interface ActiveUser {
  id: string;
  name: string;
  role: "UMKM" | "Investor";
  status: "Active" | "Suspended" | "Banned";
  lastActive: string;
}

interface AuditLog {
  id: string;
  time: string;
  action: string;
  detail: string;
}

type Tab = "pending" | "active";

export default function KYCManagement() {
  const [activeTab, setActiveTab] = useState<Tab>("pending");

  // Mock Data
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([
    {
      id: "USR-092",
      name: "Toko Sembako Maju Jaya",
      role: "UMKM",
      registrationDate: "30 Mei 2026, 09:12 WIB",
      documents: [
        { type: "ktp", label: "KTP Direktur Utama", previewText: "KTP_3201...pdf" },
        { type: "nib", label: "Nomor Induk Berusaha (NIB)", previewText: "NIB_8123...pdf" },
      ],
    },
    {
      id: "USR-093",
      name: "Ahmad Fauzi",
      role: "Investor",
      registrationDate: "30 Mei 2026, 11:45 WIB",
      documents: [
        { type: "ktp", label: "KTP Investor", previewText: "KTP_AhmadF.jpg" },
        { type: "npwp", label: "NPWP", previewText: "NPWP_AhmadF.pdf" },
      ],
    },
  ]);

  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([
    { id: "USR-010", name: "PT Ternak Sejahtera", role: "UMKM", status: "Active", lastActive: "10 mnt lalu" },
    { id: "USR-015", name: "Budi Santoso", role: "Investor", status: "Active", lastActive: "1 jam lalu" },
    { id: "USR-022", name: "Warung Kopi Senja", role: "UMKM", status: "Suspended", lastActive: "2 hari lalu" },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: "LOG-001", time: "30 Mei 2026, 08:30 WIB", action: "Sistem", detail: "Inisialisasi modul manajemen user selesai." },
  ]);

  // Modal States
  const [docLightbox, setDocLightbox] = useState<PendingUser | null>(null);
  
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: "reject" | "suspend" | "ban";
    userId: string;
    userName: string;
  }>({ isOpen: false, type: "reject", userId: "", userName: "" });
  
  const [actionReason, setActionReason] = useState("");

  const logAction = (action: string, detail: string) => {
    const newLog: AuditLog = {
      // eslint-disable-next-line react-hooks/purity
      id: `LOG-${Date.now()}`,
      time: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB",
      action,
      detail,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Actions for Pending Users (KYC)
  const handleApprove = (user: PendingUser) => {
    // Remove from pending
    setPendingUsers((prev) => prev.filter((u) => u.id !== user.id));
    // Add to active
    setActiveUsers((prev) => [
      { id: user.id, name: user.name, role: user.role, status: "Active", lastActive: "Baru saja" },
      ...prev,
    ]);
    logAction("Approve KYC", `Admin menyetujui dokumen KYC untuk ${user.name} (${user.id}).`);
    setDocLightbox(null); // Close lightbox if open
  };

  const openRejectModal = (user: PendingUser) => {
    setActionModal({ isOpen: true, type: "reject", userId: user.id, userName: user.name });
    setActionReason("");
    setDocLightbox(null);
  };

  // Actions for Active Users (Suspend/Ban)
  const openActionModal = (user: ActiveUser, type: "suspend" | "ban") => {
    setActionModal({ isOpen: true, type, userId: user.id, userName: user.name });
    setActionReason("");
  };

  const handleReactivate = (user: ActiveUser) => {
    setActiveUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: "Active" } : u))
    );
    logAction("Reactivate", `Admin mengaktifkan kembali akun ${user.name} (${user.id}).`);
  };

  // Modal Submit
  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionReason.trim()) return;

    if (actionModal.type === "reject") {
      setPendingUsers((prev) => prev.filter((u) => u.id !== actionModal.userId));
      logAction("Reject KYC", `Menolak KYC ${actionModal.userName} (${actionModal.userId}). Alasan: ${actionReason}`);
    } else if (actionModal.type === "suspend") {
      setActiveUsers((prev) =>
        prev.map((u) => (u.id === actionModal.userId ? { ...u, status: "Suspended" } : u))
      );
      logAction("Suspend", `Menangguhkan ${actionModal.userName} (${actionModal.userId}). Alasan: ${actionReason}`);
    } else if (actionModal.type === "ban") {
      setActiveUsers((prev) =>
        prev.map((u) => (u.id === actionModal.userId ? { ...u, status: "Banned" } : u))
      );
      logAction("Ban", `Blokir permanen ${actionModal.userName} (${actionModal.userId}). Alasan: ${actionReason}`);
    }

    setActionModal({ ...actionModal, isOpen: false });
  };

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

      {/* Tab Switcher */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === "pending" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          <span className={styles.tabIcon}>⏳</span>
          Menunggu KYC
          {pendingUsers.length > 0 && <span className={styles.badge}>{pendingUsers.length}</span>}
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "active" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("active")}
        >
          <span className={styles.tabIcon}>👥</span>
          Pengguna Aktif
        </button>
      </div>

      <div className={styles.contentArea}>
        {/* PENDING USERS TAB */}
        {activeTab === "pending" && (
          <div className={styles.listSection}>
            {pendingUsers.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>✨</div>
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
                          <span className={styles.userId}>{user.id}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.dateInfo}>
                        <span className={styles.label}>Tanggal Daftar:</span>
                        <span>{user.registrationDate}</span>
                      </div>
                      <div className={styles.docList}>
                        <span className={styles.label}>Dokumen Terlampir:</span>
                        <div className={styles.docTags}>
                          {user.documents.map((doc, idx) => (
                            <span key={idx} className={styles.docTag}>
                              📄 {doc.type.toUpperCase()}
                            </span>
                          ))}
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

        {/* ACTIVE USERS TAB */}
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
                  {activeUsers.map((user) => (
                    <tr key={user.id} className={user.status !== "Active" ? styles.rowMuted : ""}>
                      <td className={styles.tdId}>{user.id}</td>
                      <td className={styles.tdName}>{user.name}</td>
                      <td>
                        <span className={styles.userRoleBadge}>{user.role}</span>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            user.status === "Active"
                              ? styles.statusActive
                              : user.status === "Suspended"
                              ? styles.statusWarn
                              : styles.statusDanger
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className={styles.tdTime}>{user.lastActive}</td>
                      <td style={{ textAlign: "right" }}>
                        {user.status === "Active" ? (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* AUDIT LOG FEED */}
      <div className={`${styles.auditSection} glass`}>
        <div className={styles.auditHeader}>
          <h3>📜 Live Audit Trail</h3>
          <span className={styles.pulseDot}></span>
        </div>
        <div className={styles.auditList}>
          {auditLogs.map((log) => (
            <div key={log.id} className={styles.auditItem}>
              <div className={styles.auditTime}>{log.time}</div>
              <div className={styles.auditContent}>
                <span className={styles.auditAction}>[{log.action}]</span> {log.detail}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DOCUMENT LIGHTBOX MODAL */}
      {docLightbox && (
        <div className={styles.modalOverlay} onClick={() => setDocLightbox(null)}>
          <div className={`${styles.lightboxModal} glass`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Review Dokumen KYC: {docLightbox.name}</h2>
              <button className={styles.closeBtn} onClick={() => setDocLightbox(null)}>×</button>
            </div>
            
            <div className={styles.lightboxBody}>
              <div className={styles.docPreviewArea}>
                {docLightbox.documents.map((doc, idx) => (
                  <div key={idx} className={styles.docBox}>
                    <div className={styles.docBoxHeader}>{doc.label}</div>
                    <div className={styles.docMockup}>
                      <span className={styles.docMockupText}>{doc.previewText}</span>
                      <div className={styles.docMockupWatermark}>SIMULATED DOCUMENT PREVIEW</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={`${styles.btn} ${styles.btnDangerOutline}`} onClick={() => openRejectModal(docLightbox)}>
                Tolak & Minta Revisi
              </button>
              <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={() => handleApprove(docLightbox)}>
                Setujui & Aktifkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION MODAL (Reject/Suspend/Ban) */}
      {actionModal.isOpen && (
        <div className={styles.modalOverlay} onClick={() => setActionModal({ ...actionModal, isOpen: false })}>
          <div className={`${styles.actionModal} glass`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {actionModal.type === "reject" && "Tolak Verifikasi KYC"}
                {actionModal.type === "suspend" && "Tangguhkan Akun (Suspend)"}
                {actionModal.type === "ban" && "Blokir Permanen (Ban)"}
              </h2>
              <button className={styles.closeBtn} onClick={() => setActionModal({ ...actionModal, isOpen: false })}>×</button>
            </div>
            
            <form onSubmit={handleActionSubmit}>
              <div className={styles.modalBody}>
                <p className={styles.modalWarning}>
                  Anda akan {actionModal.type === "reject" ? "menolak" : actionModal.type === "suspend" ? "menangguhkan" : "memblokir"} akun <strong>{actionModal.userName}</strong>.
                  Tindakan ini memerlukan catatan audit wajib.
                </p>
                <div className={styles.inputGroup}>
                  <label htmlFor="reason">Alasan Tindakan (Wajib)</label>
                  <textarea
                    id="reason"
                    rows={4}
                    placeholder="Masukkan alasan spesifik berdasarkan bukti pelanggaran/ketidaksesuaian..."
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
                  disabled={!actionReason.trim()}
                >
                  Konfirmasi Tindakan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

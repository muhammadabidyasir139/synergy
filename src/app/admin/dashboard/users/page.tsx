"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "../kyc/page.module.css";
import { Users, Shield, User, Refresh, Plus, Pencil } from "@/components/icons";

interface UserItem {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  role: "ADMIN" | "INVESTOR" | "UMKM";
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  kycStatus: "APPROVED" | "PENDING" | "REJECTED";
  lastLoginAt: string | null;
  createdAt: string;
}

type RoleFilter = "ALL" | "ADMIN" | "INVESTOR" | "UMKM";

export default function AccountManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalUser, setEditModalUser] = useState<UserItem | null>(null);
  const [deleteModalUser, setDeleteModalUser] = useState<UserItem | null>(null);
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: "suspend" | "ban";
    userId: string;
    userName: string;
  }>({ isOpen: false, type: "suspend", userId: "", userName: "" });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "UMKM" as "ADMIN" | "INVESTOR" | "UMKM",
    status: "ACTIVE" as "ACTIVE" | "SUSPENDED" | "BANNED",
    kycStatus: "APPROVED" as "APPROVED" | "PENDING" | "REJECTED",
  });
  const [actionReason, setActionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Gagal memuat pengguna", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal membuat akun.");
        return;
      }
      setCreateModalOpen(false);
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "UMKM",
        status: "ACTIVE",
        kycStatus: "APPROVED",
      });
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalUser) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/admin/users/${editModalUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password || undefined,
          status: formData.status,
          kycStatus: formData.kycStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal mengupdate akun.");
        return;
      }
      setEditModalUser(null);
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteModalUser) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/admin/users/${deleteModalUser.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal menghapus akun.");
        return;
      }
      setDeleteModalUser(null);
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReactivate = async (user: UserItem) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reactivate" }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: "ACTIVE" } : u))
        );
      }
    } catch (err) {
      console.error("Gagal mengaktifkan pengguna", err);
    }
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionReason.trim()) return;
    setSubmitting(true);
    try {
      const action = actionModal.type;
      const res = await fetch(`/api/admin/users/${actionModal.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: actionReason }),
      });
      if (res.ok) {
        const newStatus = action === "suspend" ? "SUSPENDED" : "BANNED";
        setUsers((prev) =>
          prev.map((u) => (u.id === actionModal.userId ? { ...u, status: newStatus } : u))
        );
      }
      setActionModal({ ...actionModal, isOpen: false });
    } catch (err) {
      console.error("Gagal memproses aksi akun", err);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (user: UserItem) => {
    setEditModalUser(user);
    setFormData({
      name: user.name,
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      password: "",
      role: user.role,
      status: user.status,
      kycStatus: user.kycStatus,
    });
    setErrorMsg("");
  };

  const filteredUsers = users.filter((user) => {
    const matchRole = roleFilter === "ALL" || user.role === roleFilter;
    const search = searchTerm.toLowerCase();
    const matchSearch =
      user.name.toLowerCase().includes(search) ||
      (user.email && user.email.toLowerCase().includes(search)) ||
      (user.phoneNumber && user.phoneNumber.toLowerCase().includes(search)) ||
      user.id.toLowerCase().includes(search);
    return matchRole && matchSearch;
  });

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB" : "-";

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const investorCount = users.filter((u) => u.role === "INVESTOR").length;
  const umkmCount = users.filter((u) => u.role === "UMKM").length;

  return (
    <div className={styles.container}>
      <header className={styles.header} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className={styles.title}>Manajemen Akun & CRUD User</h1>
          <p className={styles.subtitle}>
            Kelola, tambah, sunting, dan hapus akun pengguna di seluruh 3 role (Admin, Investor, dan UMKM).
          </p>
        </div>
        <button
          onClick={() => {
            setCreateModalOpen(true);
            setFormData({
              name: "",
              email: "",
              phoneNumber: "",
              password: "",
              role: "UMKM",
              status: "ACTIVE",
              kycStatus: "APPROVED",
            });
            setErrorMsg("");
          }}
          className={`${styles.btn} ${styles.btnPrimary}`}
          style={{ width: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Plus /> Tambah Akun Baru
        </button>
      </header>

      {/* Summary Cards */}
      <div className={styles.cardGrid} style={{ marginBottom: "1rem" }}>
        <div className={`${styles.userCard} glass`} onClick={() => setRoleFilter("ALL")} style={{ cursor: "pointer" }}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.userName}>Total Pengguna</h3>
              <p className={styles.userId}>{users.length} Akun Terdaftar</p>
            </div>
            <span className={styles.userRoleBadge}><Users /></span>
          </div>
        </div>
        <div className={`${styles.userCard} glass`} onClick={() => setRoleFilter("ADMIN")} style={{ cursor: "pointer" }}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.userName}>Role Admin</h3>
              <p className={styles.userId}>{adminCount} Pengelola Portal</p>
            </div>
            <span className={styles.userRoleBadge} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}><Shield /></span>
          </div>
        </div>
        <div className={`${styles.userCard} glass`} onClick={() => setRoleFilter("INVESTOR")} style={{ cursor: "pointer" }}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.userName}>Role Investor</h3>
              <p className={styles.userId}>{investorCount} Pemodal Terdaftar</p>
            </div>
            <span className={styles.userRoleBadge} style={{ background: "rgba(14, 165, 233, 0.1)", color: "#0ea5e9" }}><User /></span>
          </div>
        </div>
        <div className={`${styles.userCard} glass`} onClick={() => setRoleFilter("UMKM")} style={{ cursor: "pointer" }}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.userName}>Role UMKM</h3>
              <p className={styles.userId}>{umkmCount} Mitra Usaha</p>
            </div>
            <span className={styles.userRoleBadge} style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}><Refresh /></span>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className={styles.tabContainer} style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(["ALL", "ADMIN", "INVESTOR", "UMKM"] as RoleFilter[]).map((role) => (
            <button
              key={role}
              className={`${styles.tabBtn} ${roleFilter === role ? styles.tabActive : ""}`}
              onClick={() => setRoleFilter(role)}
            >
              {role === "ALL" ? "Semua Role" : `Role ${role}`}
            </button>
          ))}
        </div>
        <div>
          <input
            type="text"
            placeholder="Cari nama, email, hp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.textarea}
            style={{ width: "260px", padding: "0.45rem 0.85rem", fontSize: "0.85rem", height: "38px" }}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className={styles.contentArea}>
        <div className={`${styles.tableSection} glass`}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID Akun</th>
                  <th>Nama / Profil</th>
                  <th>Role</th>
                  <th>Kontak</th>
                  <th>Status Akun</th>
                  <th>Status KYC</th>
                  <th>Terakhir Aktif</th>
                  <th style={{ textAlign: "right" }}>Aksi CRUD</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "3rem", opacity: 0.6 }}>
                      Memuat data pengguna...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "3rem", opacity: 0.6 }}>
                      Tidak ada pengguna yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className={user.status !== "ACTIVE" ? styles.rowMuted : ""}>
                      <td className={styles.tdId}>{user.id.slice(0, 8)}...</td>
                      <td className={styles.tdName}>{user.name}</td>
                      <td>
                        <span
                          className={styles.userRoleBadge}
                          style={
                            user.role === "ADMIN"
                              ? { background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }
                              : user.role === "INVESTOR"
                              ? { background: "rgba(14, 165, 233, 0.15)", color: "#0ea5e9" }
                              : { background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }
                          }
                        >
                          {user.role}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {user.email || user.phoneNumber || "-"}
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
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            user.kycStatus === "APPROVED"
                              ? styles.statusActive
                              : user.kycStatus === "PENDING"
                              ? styles.statusWarn
                              : styles.statusDanger
                          }`}
                        >
                          {user.kycStatus}
                        </span>
                      </td>
                      <td className={styles.tdTime}>{fmtDate(user.lastLoginAt)}</td>
                      <td style={{ textAlign: "right" }}>
                        <div className={styles.actionButtonGroup}>
                          <button
                            onClick={() => openEditModal(user)}
                            className={`${styles.btnSm} ${styles.btnGhost}`}
                            title="Edit User"
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem" }}
                          >
                            <Pencil style={{ width: "12px", height: "12px" }} /> Edit
                          </button>

                          {user.role !== "ADMIN" && (
                            <button
                              onClick={() => {
                                setDeleteModalUser(user);
                                setErrorMsg("");
                              }}
                              className={`${styles.btnSm} ${styles.btnDanger}`}
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {createModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setCreateModalOpen(false)}>
          <div className={`${styles.actionModal} glass`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Tambah Akun Pengguna Baru</h2>
              <button className={styles.closeBtn} onClick={() => setCreateModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className={styles.modalBody}>
                {errorMsg && <div className={styles.modalWarning} style={{ background: "rgba(239, 68, 68, 0.1)", borderColor: "#ef4444", color: "#ef4444" }}>{errorMsg}</div>}
                
                <div className={styles.inputGroup}>
                  <label htmlFor="role">Role Akun</label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className={styles.textarea}
                    style={{ height: "42px" }}
                  >
                    <option value="UMKM">UMKM (Mitra Usaha)</option>
                    <option value="INVESTOR">INVESTOR (Pemodal)</option>
                    <option value="ADMIN">ADMIN (Pengelola)</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="name">Nama Lengkap / Nama Usaha</label>
                  <input
                    type="text"
                    id="name"
                    required
                    placeholder="Masukkan nama..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={styles.textarea}
                    style={{ height: "42px" }}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="contoh@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={styles.textarea}
                    style={{ height: "42px" }}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="phoneNumber">Nomor HP</label>
                  <input
                    type="text"
                    id="phoneNumber"
                    placeholder="08123456789"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className={styles.textarea}
                    style={{ height: "42px" }}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="password">Kata Sandi</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Masukkan kata sandi..."
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={styles.textarea}
                    style={{ height: "42px" }}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnGhost}`}
                  onClick={() => setCreateModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : "Buat Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editModalUser && (
        <div className={styles.modalOverlay} onClick={() => setEditModalUser(null)}>
          <div className={`${styles.actionModal} glass`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Sunting Akun: {editModalUser.name}</h2>
              <button className={styles.closeBtn} onClick={() => setEditModalUser(null)}>×</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className={styles.modalBody} style={{ overflowY: "auto", maxHeight: "60vh" }}>
                {errorMsg && <div className={styles.modalWarning} style={{ background: "rgba(239, 68, 68, 0.1)", borderColor: "#ef4444", color: "#ef4444" }}>{errorMsg}</div>}
                
                <div className={styles.inputGroup}>
                  <label>Role Akun</label>
                  <input
                    type="text"
                    disabled
                    value={editModalUser.role}
                    className={styles.textarea}
                    style={{ height: "42px", opacity: 0.6 }}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="editName">Nama / Profil Usaha</label>
                  <input
                    type="text"
                    id="editName"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={styles.textarea}
                    style={{ height: "42px" }}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="editEmail">Email</label>
                  <input
                    type="email"
                    id="editEmail"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={styles.textarea}
                    style={{ height: "42px" }}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="editPhone">Nomor HP</label>
                  <input
                    type="text"
                    id="editPhone"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className={styles.textarea}
                    style={{ height: "42px" }}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="editPassword">Reset Kata Sandi Baru (Opsional)</label>
                  <input
                    type="password"
                    id="editPassword"
                    placeholder="Kosongkan jika tidak ingin mengubah password..."
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={styles.textarea}
                    style={{ height: "42px" }}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="editStatus">Status Akun</label>
                  <select
                    id="editStatus"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className={styles.textarea}
                    style={{ height: "42px" }}
                  >
                    <option value="ACTIVE">ACTIVE (Aktif)</option>
                    <option value="SUSPENDED">SUSPENDED (Ditangguhkan)</option>
                    <option value="BANNED">BANNED (Diblokir)</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="editKyc">Status Verifikasi KYC</label>
                  <select
                    id="editKyc"
                    value={formData.kycStatus}
                    onChange={(e) => setFormData({ ...formData, kycStatus: e.target.value as any })}
                    className={styles.textarea}
                    style={{ height: "42px" }}
                  >
                    <option value="APPROVED">APPROVED (Disetujui)</option>
                    <option value="PENDING">PENDING (Menunggu)</option>
                    <option value="REJECTED">REJECTED (Ditolak)</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnGhost}`}
                  onClick={() => setEditModalUser(null)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalUser && (
        <div className={styles.modalOverlay} onClick={() => setDeleteModalUser(null)}>
          <div className={`${styles.actionModal} glass`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Konfirmasi Hapus Akun</h2>
              <button className={styles.closeBtn} onClick={() => setDeleteModalUser(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              {errorMsg && <div className={styles.modalWarning} style={{ background: "rgba(239, 68, 68, 0.1)", borderColor: "#ef4444", color: "#ef4444" }}>{errorMsg}</div>}
              <p className={styles.modalWarning}>
                Apakah Anda yakin ingin menghapus akun <strong>{deleteModalUser.name}</strong> ({deleteModalUser.role}) secara permanen? Data yang dihapus tidak dapat dikembalikan.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGhost}`}
                onClick={() => setDeleteModalUser(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={handleDeleteSubmit}
                disabled={submitting}
              >
                {submitting ? "Menghapus..." : "Ya, Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../page.module.css";
import { CheckCircle, XCircle, Refresh, Building, X, Pencil, ArrowUpTray, FileText } from "@/components/icons";

interface KycDoc {
  id: string;
  documentType: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedAt: string | null;
  createdAt: string;
}

interface MediaItem {
  id: string;
  url: string;
  caption: string | null;
  createdAt: string;
}

interface FinanceData {
  asetLancar: number | null;
  totalHutangKas: number | null;
  labaBersih: number | null;
  totalPendapatan: number | null;
  totalBeban: number | null;
  rataRataArusKas: number | null;
  asetTidakLancar: number | null;
  isComplete: boolean;
}

const FINANCE_FIELDS: { key: keyof Omit<FinanceData, "isComplete">; label: string }[] = [
  { key: "asetLancar", label: "Aset Lancar (Rp)" },
  { key: "asetTidakLancar", label: "Aset Tidak Lancar (Rp)" },
  { key: "totalHutangKas", label: "Total Hutang Kas (Rp)" },
  { key: "totalPendapatan", label: "Total Pendapatan (Rp)" },
  { key: "totalBeban", label: "Total Beban (Rp)" },
  { key: "labaBersih", label: "Laba Bersih (Rp)" },
  { key: "rataRataArusKas", label: "Rata-rata Arus Kas (Rp)" },
];

interface ProfileData {
  businessName: string;
  businessCategory: string;
  businessDescription: string;
  ownerName: string;
  location: string;
  city: string;
  province: string;
  establishedDate: string;
  employeeCount: number | string;
  website: string;
  email: string;
  phoneNumber: string;
  kycStatus: string;
  accountStatus: string;
  kycDocuments: KycDoc[];
  logo: MediaItem | null;
  gallery: MediaItem[];
}

function getUmkmId(): string {
  if (typeof window === "undefined") return "";
  try {
    return JSON.parse(sessionStorage.getItem("synergy_umkm_session") ?? "{}").umkmProfileId ?? "";
  } catch {
    return "";
  }
}

const statusBadge = (status: string) => {
  if (status === "APPROVED") return { label: "Approved", cls: styles.badgeGreen, icon: <CheckCircle /> };
  if (status === "REJECTED") return { label: "Ditolak", cls: styles.badgeRed, icon: <XCircle /> };
  return { label: "Menunggu Review", cls: styles.badgeYellow, icon: <Refresh /> };
};

const KYC_ALLOWED_TYPES = "image/png,image/jpeg,image/jpg,image/webp,application/pdf";

export default function ProfilUsaha() {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const kycInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState({ done: 0, total: 0 });
  const [uploadingKyc, setUploadingKyc] = useState(false);

  const [finance, setFinance] = useState<FinanceData | null>(null);
  const [financeForm, setFinanceForm] = useState<Record<string, string>>({});
  const [isFinanceLoading, setIsFinanceLoading] = useState(true);
  const [isFinanceEditing, setIsFinanceEditing] = useState(false);
  const [isFinanceSaving, setIsFinanceSaving] = useState(false);
  const [financeSaved, setFinanceSaved] = useState(false);
  const [financeError, setFinanceError] = useState("");

  const loadFinance = () => {
    const id = getUmkmId();
    Promise.resolve()
      .then(() => {
        if (!id) return null;
        return fetch("/api/umkm/profile/finance", { headers: { "x-umkm-id": id } })
          .then(async (r) => (r.ok ? ((await r.json()) as FinanceData) : null));
      })
      .then((d: FinanceData | null) => {
        if (d) {
          setFinance(d);
          const next: Record<string, string> = {};
          FINANCE_FIELDS.forEach(({ key }) => { next[key] = d[key] !== null ? String(d[key]) : ""; });
          setFinanceForm(next);
        }
      })
      .catch(console.error)
      .finally(() => setIsFinanceLoading(false));
  };

  useEffect(() => { loadFinance(); }, []);

  const handleFinanceSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFinanceSaving(true);
    setFinanceError("");
    try {
      const id = getUmkmId();
      const res = await fetch("/api/umkm/profile/finance", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-umkm-id": id },
        body: JSON.stringify(financeForm),
      });
      if (!res.ok) {
        const data = await res.json();
        setFinanceError(data.error ?? "Gagal menyimpan profil keuangan.");
        return;
      }
      setFinanceSaved(true);
      setIsFinanceEditing(false);
      loadFinance();
      setTimeout(() => setFinanceSaved(false), 3000);
    } catch {
      setFinanceError("Tidak dapat terhubung ke server.");
    } finally {
      setIsFinanceSaving(false);
    }
  };

  const loadProfile = () => {
    const id = getUmkmId();
    Promise.resolve()
      .then(() => {
        if (!id) return null;
        return fetch("/api/umkm/profile", { headers: { "x-umkm-id": id } })
          .then(async (r) => (r.ok ? ((await r.json()) as ProfileData) : null));
      })
      .then((d: ProfileData | null) => { if (d) setProfile(d); else setError("Gagal memuat profil."); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadProfile(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    setError("");
    try {
      const id = getUmkmId();
      const res = await fetch("/api/umkm/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-umkm-id": id },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Gagal menyimpan perubahan.");
        return;
      }
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setError("");
    try {
      const id = getUmkmId();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "LOGO");
      const res = await fetch("/api/umkm/profile/media", { method: "POST", headers: { "x-umkm-id": id }, body: formData });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Gagal mengunggah logo.");
        return;
      }
      loadProfile();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploadingGallery(true);
    setGalleryUploadProgress({ done: 0, total: files.length });
    setError("");
    try {
      const id = getUmkmId();
      const failures: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "GALLERY");
        try {
          const res = await fetch("/api/umkm/profile/media", { method: "POST", headers: { "x-umkm-id": id }, body: formData });
          if (!res.ok) {
            const data = await res.json();
            failures.push(`${file.name}: ${data.error ?? "gagal diunggah"}`);
          }
        } catch {
          failures.push(`${file.name}: tidak dapat terhubung ke server`);
        }
        setGalleryUploadProgress((p) => ({ ...p, done: p.done + 1 }));
      }
      if (failures.length > 0) setError(`Sebagian foto gagal diunggah: ${failures.join("; ")}`);
      loadProfile();
    } finally {
      setUploadingGallery(false);
      setGalleryUploadProgress({ done: 0, total: 0 });
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const handleDeleteGalleryPhoto = async (mediaId: string) => {
    const id = getUmkmId();
    setProfile((p) => p ? { ...p, gallery: p.gallery.filter((g) => g.id !== mediaId) } : p);
    await fetch(`/api/umkm/profile/media/${mediaId}`, { method: "DELETE", headers: { "x-umkm-id": id } });
  };

  const handleKycUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingKyc(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", "E-KTP");
      const res = await fetch("/api/umkm/profile/kyc", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Gagal mengunggah dokumen.");
        return;
      }
      loadProfile();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setUploadingKyc(false);
      if (kycInputRef.current) kycInputRef.current.value = "";
    }
  };

  if (isLoading) return <div style={{ padding: "2rem" }}>Memuat profil usaha...</div>;
  if (!profile) return <div style={{ padding: "2rem" }}>Sesi tidak ditemukan. Silakan masuk kembali.</div>;

  const kyc = statusBadge(profile.kycStatus === "APPROVED" ? "APPROVED" : profile.kycStatus === "REJECTED" ? "REJECTED" : "PENDING");

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Profil & Setup Usaha</h1>
          <p className={styles.subtitle}>
            Kelola informasi usaha, dokumen KYC, dan data kontak resmi Anda.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {saved && (
            <span style={{ color: "#1d4ed8", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <CheckCircle style={{ verticalAlign: "-0.125em" }} /> Tersimpan!
            </span>
          )}
          {!isEditing ? (
            <button className={styles.btnPrimary} style={{ padding: "0.65rem 1.25rem", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem" }} onClick={() => setIsEditing(true)}>
              <Pencil style={{ verticalAlign: "-0.125em" }} /> Edit Profil
            </button>
          ) : (
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => { setIsEditing(false); loadProfile(); }}>
              Batal
            </button>
          )}
        </div>
      </header>

      {error && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

        {/* Logo & Gallery */}
        <div className={`${styles.sectionCard} glass`} style={{ gridColumn: "1 / -1" }}>
          <div className={styles.sectionHeader}>
            <h3>Logo & Foto Kegiatan Usaha</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Ditampilkan kepada investor di halaman eksplorasi</span>
          </div>

          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginTop: "1rem" }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: "0.85rem", display: "block", marginBottom: "0.5rem" }}>Logo Usaha</label>
              <div
                onClick={() => logoInputRef.current?.click()}
                style={{
                  width: 120, height: 120, borderRadius: 12, border: "2px dashed var(--border-color)",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  overflow: "hidden", background: "rgba(0,0,0,0.02)", position: "relative",
                }}
              >
                {uploadingLogo ? (
                  <span style={{ fontSize: "0.75rem" }}>Mengunggah...</span>
                ) : profile.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.logo.url} alt="Logo usaha" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "1.75rem" }}><Building /></span>
                )}
              </div>
              <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleLogoUpload} style={{ display: "none" }} />
              <button type="button" className={`${styles.btn} ${styles.btnGhost}`} style={{ marginTop: "0.5rem", padding: "0.4rem 0.8rem", fontSize: "0.8rem" }} onClick={() => logoInputRef.current?.click()}>
                {profile.logo ? "Ganti Logo" : "Unggah Logo"}
              </button>
            </div>

            <div style={{ flex: 1, minWidth: 260 }}>
              <label style={{ fontWeight: 700, fontSize: "0.85rem", display: "block", marginBottom: "0.5rem" }}>Foto Kegiatan Usaha</label>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {profile.gallery.map((g) => (
                  <div key={g.id} style={{ position: "relative", width: 100, height: 100, borderRadius: 10, overflow: "hidden" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.url} alt="Foto usaha" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryPhoto(g.id)}
                      title="Hapus foto"
                      style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: 6, width: 22, height: 22, cursor: "pointer", fontSize: "0.75rem", lineHeight: 1 }}
                    >
                      <X />
                    </button>
                  </div>
                ))}
                <div
                  onClick={() => !uploadingGallery && galleryInputRef.current?.click()}
                  style={{
                    width: 100, height: 100, borderRadius: 10, border: "2px dashed var(--border-color)",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: uploadingGallery ? "default" : "pointer",
                    background: "rgba(0,0,0,0.02)",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", textAlign: "center" }}>
                    {uploadingGallery ? `${galleryUploadProgress.done}/${galleryUploadProgress.total}...` : "+ Tambah"}
                  </span>
                </div>
              </div>
              <input ref={galleryInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" multiple onChange={handleGalleryUpload} style={{ display: "none" }} />
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>PNG, JPG, atau WEBP maks. 5 MB per foto. Dapat memilih beberapa foto sekaligus.</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className={`${styles.sectionCard} glass`} style={{ gridColumn: "1 / -1" }}>
          <div className={styles.sectionHeader}>
            <h3>Informasi Usaha</h3>
            <span className={`${styles.badge} ${kyc.cls}`}>{kyc.icon} {kyc.label}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div className={styles.inputGroup}>
              <label>Nama Usaha</label>
              <input
                className={styles.input}
                value={profile.businessName}
                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Kategori Usaha</label>
              <input
                className={styles.input}
                value={profile.businessCategory}
                onChange={(e) => setProfile({ ...profile, businessCategory: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Kota</label>
              <input
                className={styles.input}
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Provinsi</label>
              <input
                className={styles.input}
                value={profile.province}
                onChange={(e) => setProfile({ ...profile, province: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Jumlah Karyawan</label>
              <input
                className={styles.input}
                type="number"
                value={profile.employeeCount}
                onChange={(e) => setProfile({ ...profile, employeeCount: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Nama Pemilik / Direktur</label>
              <input
                className={styles.input}
                value={profile.ownerName}
                onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
              <label>Deskripsi Usaha</label>
              <textarea
                className={styles.textarea}
                rows={3}
                value={profile.businessDescription}
                onChange={(e) => setProfile({ ...profile, businessDescription: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className={styles.sectionHeader} style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
            <h3>Kontak</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input className={styles.input} type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} disabled={!isEditing} />
            </div>
            <div className={styles.inputGroup}>
              <label>Nomor HP</label>
              <input className={styles.input} value={profile.phoneNumber} onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })} disabled={!isEditing} />
            </div>
          </div>

          {isEditing && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button type="submit" className={styles.btnPrimary} disabled={isSaving} style={{ padding: "0.8rem 2rem", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.95rem" }}>
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          )}
        </form>

        {/* Financial Profile */}
        <form onSubmit={handleFinanceSave} className={`${styles.sectionCard} glass`} style={{ gridColumn: "1 / -1" }}>
          <div className={styles.sectionHeader}>
            <h3>Profil Keuangan</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {finance && (
                <span className={`${styles.badge} ${finance.isComplete ? styles.badgeGreen : styles.badgeYellow}`}>
                  {finance.isComplete ? <CheckCircle /> : <Refresh />} {finance.isComplete ? "Lengkap" : "Belum Lengkap"}
                </span>
              )}
              {financeSaved && (
                <span style={{ color: "#1d4ed8", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <CheckCircle style={{ verticalAlign: "-0.125em" }} /> Tersimpan!
                </span>
              )}
              {!isFinanceEditing ? (
                <button type="button" className={styles.btnPrimary} style={{ padding: "0.5rem 1rem", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" }} onClick={() => setIsFinanceEditing(true)}>
                  <Pencil style={{ verticalAlign: "-0.125em" }} /> {finance?.isComplete ? "Edit" : "Lengkapi"}
                </button>
              ) : (
                <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => { setIsFinanceEditing(false); setFinanceError(""); loadFinance(); }}>
                  Batal
                </button>
              )}
            </div>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 1rem" }}>
            Data ini digunakan untuk penilaian kelayakan (credit scoring) dan wajib diisi sebelum Anda dapat mengajukan pendanaan.
          </p>

          {financeError && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{financeError}</p>}

          {isFinanceLoading ? (
            <p style={{ color: "var(--text-muted)" }}>Memuat data keuangan...</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {FINANCE_FIELDS.map(({ key, label }) => (
                <div className={styles.inputGroup} key={key}>
                  <label>{label}</label>
                  <input
                    className={styles.input}
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0"
                    value={financeForm[key] ?? ""}
                    onChange={(e) => setFinanceForm({ ...financeForm, [key]: e.target.value })}
                    disabled={!isFinanceEditing}
                    required
                  />
                </div>
              ))}
            </div>
          )}

          {isFinanceEditing && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button type="submit" className={styles.btnPrimary} disabled={isFinanceSaving} style={{ padding: "0.8rem 2rem", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.95rem" }}>
                {isFinanceSaving ? "Menyimpan..." : "Simpan Profil Keuangan"}
              </button>
            </div>
          )}
        </form>

        {/* Document Status */}
        <div className={`${styles.sectionCard} glass`} style={{ gridColumn: "1 / -1" }}>
          <div className={styles.sectionHeader}>
            <h3>Status Dokumen KYC</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Dokumen diverifikasi oleh Admin Synergy</span>
              <input ref={kycInputRef} type="file" accept={KYC_ALLOWED_TYPES} onChange={handleKycUpload} style={{ display: "none" }} />
              <button
                type="button"
                className={styles.btnPrimary}
                disabled={uploadingKyc}
                style={{ padding: "0.5rem 1rem", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" }}
                onClick={() => kycInputRef.current?.click()}
              >
                {uploadingKyc ? "Mengunggah..." : (<><ArrowUpTray style={{ verticalAlign: "-0.125em" }} /> Unggah E-KTP</>)}
              </button>
            </div>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.5rem 0 0" }}>
            PNG, JPG, WEBP, atau PDF maks. 5 MB. Mengunggah ulang akan mengganti dokumen sebelumnya dan mengembalikan status ke &ldquo;Menunggu Review&rdquo;.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nama Dokumen</th>
                  <th>Status</th>
                  <th>Tanggal Verifikasi</th>
                </tr>
              </thead>
              <tbody>
                {profile.kycDocuments.length === 0 && (
                  <tr><td colSpan={3} style={{ color: "var(--text-muted)" }}>Belum ada dokumen diunggah.</td></tr>
                )}
                {profile.kycDocuments.map((doc) => {
                  const b = statusBadge(doc.status);
                  return (
                    <tr key={doc.id}>
                      <td><FileText style={{ verticalAlign: "-0.125em" }} /> {doc.documentType}</td>
                      <td><span className={`${styles.badge} ${b.cls}`}>{b.icon} {b.label}</span></td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        {doc.reviewedAt ? new Date(doc.reviewedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

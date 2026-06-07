"use client";

import { useState } from "react";
import styles from "../page.module.css";

export default function ProfilUsaha() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    namaUsaha: "Toko Berkah Jaya",
    kategori: "Perdagangan",
    lokasi: "Jakarta Timur, DKI Jakarta",
    tahunBerdiri: "2019",
    jumlahKaryawan: "5",
    deskripsi: "Toko kelontong modern yang melayani kebutuhan sembako dan kebutuhan rumah tangga masyarakat sekitar.",
    namaOwner: "Ahmad Syarif",
    email: "tokoberkahjaya@email.com",
    noHP: "081234567890",
    noRekening: "1234-5678-9012",
    bank: "BSI",
    nib: "1234567890123",
    npwp: "12.345.678.9-012.000",
    statusKYC: "Terverifikasi",
    statusAkun: "Aktif",
  });

  const [docStatus] = useState([
    { name: "KTP Direktur Utama", status: "Approved", date: "12 Apr 2026" },
    { name: "Nomor Induk Berusaha (NIB)", status: "Approved", date: "12 Apr 2026" },
    { name: "NPWP Usaha", status: "Approved", date: "12 Apr 2026" },
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3000);
    }, 1200);
  };

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
            <span style={{ color: "#10b981", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              ✅ Tersimpan!
            </span>
          )}
          {!isEditing ? (
            <button className={styles.btnPrimary} style={{ padding: "0.65rem 1.25rem", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem" }} onClick={() => setIsEditing(true)}>
              ✏️ Edit Profil
            </button>
          ) : (
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setIsEditing(false)}>
              Batal
            </button>
          )}
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

        {/* Profile Form */}
        <form onSubmit={handleSave} className={`${styles.sectionCard} glass`} style={{ gridColumn: "1 / -1" }}>
          <div className={styles.sectionHeader}>
            <h3>Informasi Usaha</h3>
            <span className={`${styles.badge} ${styles.badgeGreen}`}>✅ {profile.statusKYC}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div className={styles.inputGroup}>
              <label>Nama Usaha</label>
              <input
                className={styles.input}
                value={profile.namaUsaha}
                onChange={(e) => setProfile({ ...profile, namaUsaha: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Kategori Usaha</label>
              <select
                className={styles.select}
                value={profile.kategori}
                onChange={(e) => setProfile({ ...profile, kategori: e.target.value })}
                disabled={!isEditing}
              >
                <option>Perdagangan</option>
                <option>Kuliner / F&B</option>
                <option>Jasa</option>
                <option>Manufaktur</option>
                <option>Pertanian</option>
                <option>Peternakan</option>
                <option>Teknologi</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Lokasi Usaha</label>
              <input
                className={styles.input}
                value={profile.lokasi}
                onChange={(e) => setProfile({ ...profile, lokasi: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Tahun Berdiri</label>
              <input
                className={styles.input}
                value={profile.tahunBerdiri}
                onChange={(e) => setProfile({ ...profile, tahunBerdiri: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Jumlah Karyawan</label>
              <input
                className={styles.input}
                type="number"
                value={profile.jumlahKaryawan}
                onChange={(e) => setProfile({ ...profile, jumlahKaryawan: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Nama Pemilik / Direktur</label>
              <input
                className={styles.input}
                value={profile.namaOwner}
                onChange={(e) => setProfile({ ...profile, namaOwner: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
              <label>Deskripsi Usaha</label>
              <textarea
                className={styles.textarea}
                rows={3}
                value={profile.deskripsi}
                onChange={(e) => setProfile({ ...profile, deskripsi: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className={styles.sectionHeader} style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
            <h3>Kontak & Rekening</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input className={styles.input} type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} disabled={!isEditing} />
            </div>
            <div className={styles.inputGroup}>
              <label>Nomor HP</label>
              <input className={styles.input} value={profile.noHP} onChange={(e) => setProfile({ ...profile, noHP: e.target.value })} disabled={!isEditing} />
            </div>
            <div className={styles.inputGroup}>
              <label>Bank</label>
              <select className={styles.select} value={profile.bank} onChange={(e) => setProfile({ ...profile, bank: e.target.value })} disabled={!isEditing}>
                <option>BSI</option>
                <option>BRI Syariah</option>
                <option>BNI Syariah</option>
                <option>Mandiri Syariah</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>No. Rekening</label>
              <input className={styles.input} value={profile.noRekening} onChange={(e) => setProfile({ ...profile, noRekening: e.target.value })} disabled={!isEditing} />
            </div>
            <div className={styles.inputGroup}>
              <label>NIB (Nomor Induk Berusaha)</label>
              <input className={styles.input} value={profile.nib} disabled />
            </div>
            <div className={styles.inputGroup}>
              <label>NPWP</label>
              <input className={styles.input} value={profile.npwp} disabled />
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

        {/* Document Status */}
        <div className={`${styles.sectionCard} glass`} style={{ gridColumn: "1 / -1" }}>
          <div className={styles.sectionHeader}>
            <h3>Status Dokumen KYC</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Dokumen diverifikasi oleh Admin Synergy</span>
          </div>
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
                {docStatus.map((doc, i) => (
                  <tr key={i}>
                    <td>📄 {doc.name}</td>
                    <td><span className={`${styles.badge} ${styles.badgeGreen}`}>✅ {doc.status}</span></td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{doc.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

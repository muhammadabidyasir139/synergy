"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type Role = "INVESTOR" | "UMKM";
type Step = 1 | 2 | 3;

interface AccountData {
  role: Role;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

interface InvestorProfileData {
  fullName: string;
  dateOfBirth: string;
  address: string;
  city: string;
  province: string;
  investmentGoal: string;
  riskTolerance: "LOW" | "MEDIUM" | "HIGH";
}

interface UmkmProfileData {
  ownerName: string;
  businessName: string;
  businessCategory: string;
  businessDescription: string;
  location: string;
  city: string;
  province: string;
  establishedDate: string;
  employeeCount: string;
  monthlyRevenue: string;
  website: string;
  socialMedia: { platform: string; handle: string }[];
}

const BUSINESS_CATEGORIES = [
  "Kuliner & Makanan", "Fashion & Pakaian", "Pertanian & Perkebunan",
  "Perikanan & Kelautan", "Kerajinan Tangan", "Teknologi & Digital",
  "Perdagangan Umum", "Jasa & Layanan", "Kesehatan & Kecantikan",
  "Pendidikan", "Transportasi & Logistik", "Lainnya",
];

const PROVINCES = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau",
  "Jambi", "Bengkulu", "Sumatera Selatan", "Kepulauan Bangka Belitung",
  "Lampung", "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah",
  "DI Yogyakarta", "Jawa Timur", "Bali", "Nusa Tenggara Barat",
  "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah",
  "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
  "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat",
  "Sulawesi Selatan", "Sulawesi Tenggara", "Maluku", "Maluku Utara",
  "Papua Barat", "Papua",
];

export default function RegisterPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycPreview, setKycPreview] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [account, setAccount] = useState<AccountData>({
    role: "INVESTOR",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [investorProfile, setInvestorProfile] = useState<InvestorProfileData>({
    fullName: "", dateOfBirth: "", address: "", city: "", province: "",
    investmentGoal: "", riskTolerance: "MEDIUM",
  });

  const [umkmProfile, setUmkmProfile] = useState<UmkmProfileData>({
    ownerName: "", businessName: "", businessCategory: "", businessDescription: "",
    location: "", city: "", province: "", establishedDate: "", employeeCount: "",
    monthlyRevenue: "", website: "", socialMedia: [],
  });

  function validateStep1(): string {
    if (!account.email) return "Email wajib diisi.";
    if (!account.phoneNumber) return "Nomor HP wajib diisi.";
    if (account.password.length < 8) return "Kata sandi minimal 8 karakter.";
    if (account.password !== account.confirmPassword) return "Konfirmasi kata sandi tidak cocok.";
    return "";
  }

  function validateStep2(): string {
    if (account.role === "INVESTOR") {
      if (!investorProfile.fullName) return "Nama lengkap wajib diisi.";
      if (!investorProfile.dateOfBirth) return "Tanggal lahir wajib diisi.";
      if (!investorProfile.city) return "Kota wajib diisi.";
      if (!investorProfile.province) return "Provinsi wajib dipilih.";
    } else {
      if (!umkmProfile.ownerName) return "Nama pemilik wajib diisi.";
      if (!umkmProfile.businessName) return "Nama usaha wajib diisi.";
      if (!umkmProfile.businessCategory) return "Kategori usaha wajib dipilih.";
      if (!umkmProfile.city) return "Kota wajib diisi.";
      if (!umkmProfile.province) return "Provinsi wajib dipilih.";
    }
    return "";
  }

  function handleStep1() {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError(""); setStep(2);
  }

  function handleStep2() {
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError(""); setStep(3);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Ukuran file maksimal 5 MB."); return; }
    setKycFile(file);
    setKycPreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleSubmit() {
    if (!kycFile) { setError("Upload foto E-KTP / identitas Anda."); return; }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("role", account.role);
      formData.append("email", account.email);
      formData.append("phoneNumber", account.phoneNumber);
      formData.append("password", account.password);
      formData.append("profile", JSON.stringify(account.role === "INVESTOR" ? investorProfile : umkmProfile));
      formData.append("kycFile", kycFile);

      const res = await fetch("/api/auth/register", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "Terjadi kesalahan, coba lagi."); return; }
      router.push("/auth/login?registered=1");
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      {/* LEFT PANEL */}
      <div className={styles.leftPanel}>
        <div className={styles.logoGroup}>
          <div className={styles.logoIcon}>S</div>
          <span className={styles.logoText}>Synergy</span>
        </div>
        
        <div className={styles.leftContent}>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>🛡️</span>
            ENTERPRISE IDENTITY LAYER
          </div>
          <h1 className={styles.leftTitle}>
            Protokol<br />
            Kepercayaan<br />
            untuk <span className={styles.highlight}>Profil<br />Kredit.</span>
          </h1>
          <p className={styles.leftDescription}>
            Amankan reputasi finansial Anda di buku besar terdistribusi. Platform kami memanfaatkan teknologi blockchain untuk menyediakan verifikasi identitas yang tidak dapat diubah dan menjaga privasi.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={styles.rightPanel}>
        <header className={styles.rightHeader}>
          <nav className={styles.navLinks}>
            <Link href="#">Platform</Link>
            <Link href="#">Keamanan</Link>
            <Link href="#">Status Jaringan</Link>
          </nav>
          <Link href="/auth/login" className={styles.loginBtn}>Masuk</Link>
        </header>

        <main className={styles.mainForm}>
          <div className={styles.formContainer}>
            
            {/* STEP 1 */}
            {step === 1 && (
              <>
                <div className={styles.cardHeader}>
                  <h1>Buat Identitas</h1>
                  <p>Mulai perjalanan Anda di jaringan blockchain.</p>
                </div>

                <div className={styles.roleSelector}>
                  <button type="button"
                    className={`${styles.roleTab} ${account.role === "INVESTOR" ? styles.activeTab : ""}`}
                    onClick={() => setAccount(a => ({ ...a, role: "INVESTOR" }))}>
                    Investor
                  </button>
                  <button type="button"
                    className={`${styles.roleTab} ${account.role === "UMKM" ? styles.activeTab : ""}`}
                    onClick={() => setAccount(a => ({ ...a, role: "UMKM" }))}>
                    UMKM
                  </button>
                </div>

                {error && <div className={styles.errorAlert}>{error}</div>}

                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label>Email Kerja / Pribadi</label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>✉</span>
                      <input type="email" placeholder="nama@email.com"
                        value={account.email}
                        onChange={e => setAccount(a => ({ ...a, email: e.target.value }))}
                        className={`${styles.input} ${styles.inputWithIcon}`} />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Nomor HP</label>
                    <div className={styles.phoneRow}>
                      <div className={styles.phonePrefix}>
                        <span>+62</span>
                        <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>▼</span>
                      </div>
                      <div className={styles.inputWrapper} style={{ flex: 1 }}>
                        <span className={styles.inputIcon}>📞</span>
                        <input type="tel" placeholder="812 3456 7890"
                          value={account.phoneNumber}
                          onChange={e => setAccount(a => ({ ...a, phoneNumber: e.target.value.replace(/\D/g, "") }))}
                          className={`${styles.input} ${styles.inputWithIcon}`} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Kata Sandi</label>
                    <div className={styles.passwordWrapper}>
                      <span className={styles.inputIcon}>🔒</span>
                      <input type={showPassword ? "text" : "password"} placeholder="Min. 8 karakter"
                        value={account.password}
                        onChange={e => setAccount(a => ({ ...a, password: e.target.value }))}
                        className={`${styles.input} ${styles.inputWithIcon}`} />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(p => !p)}>
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Konfirmasi Kata Sandi</label>
                    <div className={styles.passwordWrapper}>
                      <span className={styles.inputIcon}>🔒</span>
                      <input type={showConfirmPassword ? "text" : "password"} placeholder="Ulangi kata sandi"
                        value={account.confirmPassword}
                        onChange={e => setAccount(a => ({ ...a, confirmPassword: e.target.value }))}
                        className={`${styles.input} ${styles.inputWithIcon}`} />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPassword(p => !p)}>
                        {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>

                  <button type="button" onClick={handleStep1} className={styles.submitBtn}>
                    Lanjutkan
                  </button>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <div className={styles.cardHeader}>
                  <h1>Lengkapi Profil</h1>
                  <p>{account.role === "INVESTOR" ? "Detail profil investasi Anda" : "Detail informasi usaha Anda"}</p>
                </div>

                {error && <div className={styles.errorAlert}>{error}</div>}

                <div className={styles.form}>
                  {account.role === "INVESTOR" ? (
                    <>
                      <div className={styles.inputGroup}>
                        <label>Nama Lengkap <span className={styles.required}>*</span></label>
                        <input type="text" placeholder="Sesuai KTP" value={investorProfile.fullName} onChange={e => setInvestorProfile(p => ({ ...p, fullName: e.target.value }))} className={styles.input} />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Tanggal Lahir <span className={styles.required}>*</span></label>
                        <input type="date" value={investorProfile.dateOfBirth} onChange={e => setInvestorProfile(p => ({ ...p, dateOfBirth: e.target.value }))} className={styles.input} />
                      </div>
                      <div className={styles.row2}>
                        <div className={styles.inputGroup}>
                          <label>Kota <span className={styles.required}>*</span></label>
                          <input type="text" placeholder="Yogyakarta" value={investorProfile.city} onChange={e => setInvestorProfile(p => ({ ...p, city: e.target.value }))} className={styles.input} />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Provinsi <span className={styles.required}>*</span></label>
                          <select value={investorProfile.province} onChange={e => setInvestorProfile(p => ({ ...p, province: e.target.value }))} className={styles.select}>
                            <option value="">Pilih</option>
                            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.row2}>
                        <div className={styles.inputGroup}>
                          <label>Nama Pemilik <span className={styles.required}>*</span></label>
                          <input type="text" placeholder="Sesuai KTP" value={umkmProfile.ownerName} onChange={e => setUmkmProfile(p => ({ ...p, ownerName: e.target.value }))} className={styles.input} />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Nama Usaha <span className={styles.required}>*</span></label>
                          <input type="text" placeholder="Nama brand / toko" value={umkmProfile.businessName} onChange={e => setUmkmProfile(p => ({ ...p, businessName: e.target.value }))} className={styles.input} />
                        </div>
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Kategori Usaha <span className={styles.required}>*</span></label>
                        <select value={umkmProfile.businessCategory} onChange={e => setUmkmProfile(p => ({ ...p, businessCategory: e.target.value }))} className={styles.select}>
                          <option value="">Pilih Kategori</option>
                          {BUSINESS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className={styles.row2}>
                        <div className={styles.inputGroup}>
                          <label>Kota <span className={styles.required}>*</span></label>
                          <input type="text" placeholder="Yogyakarta" value={umkmProfile.city} onChange={e => setUmkmProfile(p => ({ ...p, city: e.target.value }))} className={styles.input} />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Provinsi <span className={styles.required}>*</span></label>
                          <select value={umkmProfile.province} onChange={e => setUmkmProfile(p => ({ ...p, province: e.target.value }))} className={styles.select}>
                            <option value="">Pilih</option>
                            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  <div className={styles.navRow}>
                    <button type="button" onClick={() => { setError(""); setStep(1); }} className={styles.backBtn}>Kembali</button>
                    <button type="button" onClick={handleStep2} className={styles.submitBtn}>Lanjutkan</button>
                  </div>
                </div>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <div className={styles.cardHeader}>
                  <h1>Verifikasi E-KYC</h1>
                  <p>Selesaikan proses identitas dengan E-KTP</p>
                </div>

                {error && <div className={styles.errorAlert}>{error}</div>}

                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label>
                      <span>Verifikasi E-KYC (E-KTP)</span>
                      <span className={styles.badgeWajib}>WAJIB</span>
                    </label>
                    <div className={`${styles.uploadZone} ${kycFile ? styles.uploadZoneFilled : ""}`} onClick={() => fileRef.current?.click()}>
                      {kycPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={kycPreview} alt="Preview KTP" className={styles.kycPreview} />
                      ) : (
                        <>
                          <div className={styles.uploadIconWrap}>📷</div>
                          <span className={styles.uploadText}>Klik untuk unggah atau seret & lepas</span>
                          <span className={styles.uploadSub}>E-KTP / Kartu Identitas Nasional (PNG, JPG maks 5MB)</span>
                        </>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} className={styles.hiddenInput} />
                    {kycFile && (
                      <div className={styles.fileInfo}>
                        <span className={styles.validBadge}>✓ VALID</span>
                        <span>{kycFile.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.encryptionNotice}>
                    <span>🔒</span> Dokumen Anda dienkripsi secara lokal sebelum transmisi.
                  </div>

                  <div className={styles.navRow}>
                    <button type="button" onClick={() => { setError(""); setStep(2); }} className={styles.backBtn}>Kembali</button>
                    <button type="button" onClick={handleSubmit} disabled={loading} className={styles.submitBtn}>
                      {loading ? <span className={styles.spinner} /> : "Daftar Identitas"}
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

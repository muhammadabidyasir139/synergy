"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import ThemeToggle from "@/components/ThemeToggle";
import { Shield, Mail, Phone, Lock, Eye, EyeOff, Camera } from "@/components/icons";

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
  district: string;
  postalCode: string;
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
  district: string;
  postalCode: string;
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

interface Region {
  code: string;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycPreview, setKycPreview] = useState<string>("");
  const [isRegistered, setIsRegistered] = useState(false);
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
    district: "", postalCode: "",
    investmentGoal: "", riskTolerance: "MEDIUM",
  });

  const [umkmProfile, setUmkmProfile] = useState<UmkmProfileData>({
    ownerName: "", businessName: "", businessCategory: "", businessDescription: "",
    location: "", city: "", province: "", district: "", postalCode: "",
    establishedDate: "", employeeCount: "",
    monthlyRevenue: "", website: "", socialMedia: [],
  });

  const [businessCategoryOther, setBusinessCategoryOther] = useState("");

  const [provinces, setProvinces] = useState<Region[]>([]);
  const [investorProvinceCode, setInvestorProvinceCode] = useState("");
  const [investorRegencies, setInvestorRegencies] = useState<Region[]>([]);
  const [investorRegenciesLoading, setInvestorRegenciesLoading] = useState(false);
  const [investorRegencyCode, setInvestorRegencyCode] = useState("");
  const [investorDistricts, setInvestorDistricts] = useState<Region[]>([]);
  const [investorDistrictsLoading, setInvestorDistrictsLoading] = useState(false);
  const [umkmProvinceCode, setUmkmProvinceCode] = useState("");
  const [umkmRegencies, setUmkmRegencies] = useState<Region[]>([]);
  const [umkmRegenciesLoading, setUmkmRegenciesLoading] = useState(false);
  const [umkmRegencyCode, setUmkmRegencyCode] = useState("");
  const [umkmDistricts, setUmkmDistricts] = useState<Region[]>([]);
  const [umkmDistrictsLoading, setUmkmDistrictsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/wilayah/provinces")
      .then(res => res.json())
      .then(data => setProvinces(data.data || []))
      .catch(() => setProvinces([]));
  }, []);

  async function loadRegencies(provinceCode: string, setRegencies: (r: Region[]) => void, setLoading: (l: boolean) => void) {
    setRegencies([]);
    if (!provinceCode) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/wilayah/regencies/${provinceCode}`);
      const data = await res.json();
      setRegencies(data.data || []);
    } catch {
      setRegencies([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadDistricts(regencyCode: string, setDistricts: (r: Region[]) => void, setLoading: (l: boolean) => void) {
    setDistricts([]);
    if (!regencyCode) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/wilayah/districts/${regencyCode}`);
      const data = await res.json();
      setDistricts(data.data || []);
    } catch {
      setDistricts([]);
    } finally {
      setLoading(false);
    }
  }

  function validateStep1(): string {
    // Email validation
    if (!account.email.trim()) return "Email wajib diisi.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(account.email.trim())) return "Format email tidak valid. Contoh: nama@email.com";

    // Phone validation
    if (!account.phoneNumber.trim()) return "Nomor HP wajib diisi.";
    if (account.phoneNumber.length < 9) return "Nomor HP minimal 9 digit.";
    if (account.phoneNumber.length > 15) return "Nomor HP maksimal 15 digit.";
    if (!/^\d+$/.test(account.phoneNumber)) return "Nomor HP hanya boleh berisi angka.";

    // Password validation
    if (!account.password) return "Kata sandi wajib diisi.";
    if (account.password.length < 8) return "Kata sandi minimal 8 karakter.";
    if (!/[A-Z]/.test(account.password)) return "Kata sandi harus mengandung minimal 1 huruf besar.";
    if (!/[a-z]/.test(account.password)) return "Kata sandi harus mengandung minimal 1 huruf kecil.";
    if (!/[0-9]/.test(account.password)) return "Kata sandi harus mengandung minimal 1 angka.";

    // Confirm password
    if (!account.confirmPassword) return "Konfirmasi kata sandi wajib diisi.";
    if (account.password !== account.confirmPassword) return "Konfirmasi kata sandi tidak cocok.";
    return "";
  }

  function validateStep2(): string {
    if (account.role === "INVESTOR") {
      if (!investorProfile.fullName.trim()) return "Nama lengkap wajib diisi.";
      if (/\d/.test(investorProfile.fullName)) return "Nama lengkap tidak boleh mengandung angka.";
      if (investorProfile.fullName.trim().length < 3) return "Nama lengkap minimal 3 karakter.";
      if (!investorProfile.dateOfBirth) return "Tanggal lahir wajib diisi.";
      // Age validation: must be at least 17 years old
      const birthDate = new Date(investorProfile.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 17) return "Usia minimal 17 tahun untuk mendaftar.";
      if (age > 120) return "Tanggal lahir tidak valid.";
      if (!investorProfile.province) return "Provinsi wajib dipilih.";
      if (!investorProfile.city) return "Kota/Kabupaten wajib dipilih.";
      if (!investorProfile.district) return "Kecamatan wajib dipilih.";
      if (!investorProfile.postalCode) return "Kode pos wajib diisi.";
      if (!/^\d{5}$/.test(investorProfile.postalCode)) return "Kode pos harus 5 digit angka.";
    } else {
      if (!umkmProfile.ownerName.trim()) return "Nama pemilik usaha wajib diisi.";
      if (/\d/.test(umkmProfile.ownerName)) return "Nama pemilik tidak boleh mengandung angka.";
      if (umkmProfile.ownerName.trim().length < 3) return "Nama pemilik minimal 3 karakter.";
      if (!umkmProfile.businessName.trim()) return "Nama usaha wajib diisi.";
      if (umkmProfile.businessName.trim().length < 2) return "Nama usaha minimal 2 karakter.";
      if (!umkmProfile.businessCategory) return "Kategori usaha wajib dipilih.";
      if (umkmProfile.businessCategory === "Lainnya" && !businessCategoryOther.trim()) return "Sebutkan kategori usaha Anda.";
      if (!umkmProfile.province) return "Provinsi wajib dipilih.";
      if (!umkmProfile.city) return "Kota/Kabupaten wajib dipilih.";
      if (!umkmProfile.district) return "Kecamatan wajib dipilih.";
      if (!umkmProfile.postalCode) return "Kode pos wajib diisi.";
      if (!/^\d{5}$/.test(umkmProfile.postalCode)) return "Kode pos harus 5 digit angka.";
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
      const umkmProfileToSend = umkmProfile.businessCategory === "Lainnya"
        ? { ...umkmProfile, businessCategory: businessCategoryOther.trim() }
        : umkmProfile;
      formData.append("profile", JSON.stringify(account.role === "INVESTOR" ? investorProfile : umkmProfileToSend));
      formData.append("kycFile", kycFile);

      const res = await fetch("/api/auth/register", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "Terjadi kesalahan, coba lagi."); return; }
      setIsRegistered(true);
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  if (isRegistered) {
    const ownerName = account.role === "INVESTOR" ? investorProfile.fullName : umkmProfile.ownerName;
    const displayName = ownerName || "Alexander Budi Santoso";

    return (
      <div className={styles.container}>
        {/* LEFT PANEL SUCCESS */}
        <div className={styles.leftPanel}>
          <Link href="/" className={styles.logoGroup}>
            <Image
              src="/source/Logo-Synergy.png"
              alt="Synergy Logo"
              width={44}
              height={44}
              style={{ objectFit: "contain" }}
              priority
            />
            <span className={styles.logoText}>SYNERGY</span>
            <span className={styles.navBadge}>PKM KC</span>
          </Link>
          
          <div className={styles.leftContent}>
            <div className={styles.successBadge}>
              <span className={styles.successDot}>●</span> VERIFIKASI BERHASIL
            </div>
            <h1 className={styles.leftTitle}>
              Identitas Digital<br />
              <span className={styles.highlight}>Telah Terbit.</span>
            </h1>
            <p className={styles.leftDescription}>
              Sertifikat Digital Anda telah diterbitkan secara permanen di ledger blockchain. Identitas Anda kini terenkripsi dan dapat diverifikasi secara global.
            </p>

            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <div>
                  <h4 className={styles.featureTitle}>Immutable Ledger</h4>
                  <p className={styles.featureSub}>Data tidak dapat diubah atau dimanipulasi.</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div>
                  <h4 className={styles.featureTitle}>Publicly Verifiable</h4>
                  <p className={styles.featureSub}>Validasi instan melalui QR Code standar industri.</p>
                </div>
              </div>
            </div>

            <div className={styles.successActions}>
              <button
                type="button"
                className={styles.primaryActionBtn}
                onClick={() => router.push("/auth/login?registered=1")}
              >
                Lanjutkan ke Profil →
              </button>
              <button
                type="button"
                className={styles.secondaryActionBtn}
                onClick={() => alert("Sertifikat digital berhasil diunduh!")}
              >
                ⤓ Unduh Sertifikat
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL SUCCESS */}
        <div className={styles.rightPanel}>
          <header className={styles.rightHeader}>
            <div className={styles.headerActions}>
              <ThemeToggle />
            </div>
          </header>

          <main className={styles.mainSuccess}>
            <div className={styles.certCard}>
              <div className={styles.certHeader}>
                <div className={styles.certLogoRow}>
                  <div className={styles.certLogoIcon}>⇄</div>
                  <div>
                    <div className={styles.certTitle}>SYNERGY</div>
                    <div className={styles.certSubtitle}>BLOCKCHAIN NETWORK</div>
                  </div>
                </div>
                <div className={styles.certStatusBadge}>
                  ACTIVE & VERIFIED
                </div>
              </div>

              <div className={styles.certBody}>
                <div className={styles.certFieldGroup}>
                  <div className={styles.certLabel}>NAMA PEMILIK IDENTITAS</div>
                  <div className={styles.certValueName}>{displayName}</div>
                </div>

                <div className={styles.certFieldGroup}>
                  <div className={styles.certLabel}>ID IDENTITAS BLOCKCHAIN</div>
                  <div className={styles.certHashBox}>
                    0x71C7656ECTab85b090def87518746185F5d0976F
                  </div>
                </div>

                <div className={styles.certFooterRow}>
                  <div>
                    <div className={styles.certLabel}>TANGGAL TERBIT</div>
                    <div className={styles.certValueDate}>
                      {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <div className={styles.certQrCodeBox}>
                    <svg viewBox="0 0 100 100" width="56" height="56" fill="currentColor">
                      <path d="M0 0h35v35H0zM5 5v25h25V5zm5 5h15v15H10zm55-10h35v35H65zM70 5v25h25V5zm5 5h15v15H75zM0 65h35v35H0zM5 70v25h25V70zm5 5h15v15H10zm45-10h10v10H55zm15 0h10v10H70zm15 0h10v10H85zm-30 15h10v10H55zm30 0h10v10H85zm-15 15h10v10H70zm15 0h10v10H85z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.verificationFootnote}>
              <span className={styles.blueDot}>⚙</span> Data ini telah diverifikasi oleh protokol <strong>Synergy Core</strong>.
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* LEFT PANEL */}
      <div className={styles.leftPanel}>
        <Link href="/" className={styles.logoGroup}>
          <Image
            src="/source/Logo-Synergy.png"
            alt="Synergy Logo"
            width={44}
            height={44}
            style={{ objectFit: "contain" }}
            priority
          />
          <span className={styles.logoText}>SYNERGY</span>
          <span className={styles.navBadge}>PKM KC</span>
        </Link>
        
        <div className={styles.leftContent}>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}><Shield /></span>
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
          <div className={styles.headerActions}>
            <ThemeToggle />
            <Link href="/auth/login" className={styles.loginBtn}>Masuk</Link>
          </div>
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
                      <span className={styles.inputIcon}><Mail /></span>
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
                        <span className={styles.inputIcon}><Phone /></span>
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
                      <span className={styles.inputIcon}><Lock /></span>
                      <input type={showPassword ? "text" : "password"} placeholder="Min. 8 karakter"
                        value={account.password}
                        onChange={e => setAccount(a => ({ ...a, password: e.target.value }))}
                        className={`${styles.input} ${styles.inputWithIcon}`} />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(p => !p)}>
                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Konfirmasi Kata Sandi</label>
                    <div className={styles.passwordWrapper}>
                      <span className={styles.inputIcon}><Lock /></span>
                      <input type={showConfirmPassword ? "text" : "password"} placeholder="Ulangi kata sandi"
                        value={account.confirmPassword}
                        onChange={e => setAccount(a => ({ ...a, confirmPassword: e.target.value }))}
                        className={`${styles.input} ${styles.inputWithIcon}`} />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPassword(p => !p)}>
                        {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>

                  <button type="button" onClick={handleStep1} className={styles.submitBtn}>
                    Lanjutkan
                  </button>

                  <Link href="/" className={styles.backHomeFullBtn}>
                    ← Kembali ke Beranda
                  </Link>
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
                          <label>Provinsi <span className={styles.required}>*</span></label>
                          <select value={investorProvinceCode} onChange={e => {
                            const code = e.target.value;
                            const prov = provinces.find(p => p.code === code);
                            setInvestorProvinceCode(code);
                            setInvestorRegencyCode("");
                            setInvestorDistricts([]);
                            setInvestorProfile(p => ({ ...p, province: prov?.name || "", city: "", district: "" }));
                            loadRegencies(code, setInvestorRegencies, setInvestorRegenciesLoading);
                          }} className={styles.select}>
                            <option value="">Pilih Provinsi</option>
                            {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                          </select>
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Kota <span className={styles.required}>*</span></label>
                          <select value={investorRegencyCode} onChange={e => {
                            const code = e.target.value;
                            const reg = investorRegencies.find(r => r.code === code);
                            setInvestorRegencyCode(code);
                            setInvestorProfile(p => ({ ...p, city: reg?.name || "", district: "" }));
                            loadDistricts(code, setInvestorDistricts, setInvestorDistrictsLoading);
                          }} className={styles.select} disabled={!investorProvinceCode || investorRegenciesLoading}>
                            <option value="">{investorRegenciesLoading ? "Memuat..." : "Pilih Kota/Kabupaten"}</option>
                            {investorRegencies.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className={styles.row2}>
                        <div className={styles.inputGroup}>
                          <label>Kecamatan <span className={styles.required}>*</span></label>
                          <select value={investorProfile.district} onChange={e => setInvestorProfile(p => ({ ...p, district: e.target.value }))} className={styles.select} disabled={!investorRegencyCode || investorDistrictsLoading}>
                            <option value="">{investorDistrictsLoading ? "Memuat..." : "Pilih Kecamatan"}</option>
                            {investorDistricts.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
                          </select>
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Kode Pos <span className={styles.required}>*</span></label>
                          <input type="text" inputMode="numeric" placeholder="12345" maxLength={5}
                            value={investorProfile.postalCode}
                            onChange={e => setInvestorProfile(p => ({ ...p, postalCode: e.target.value.replace(/\D/g, "").slice(0, 5) }))}
                            className={styles.input} />
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
                        {umkmProfile.businessCategory === "Lainnya" && (
                          <input type="text" placeholder="Sebutkan kategori usaha Anda" value={businessCategoryOther}
                            onChange={e => setBusinessCategoryOther(e.target.value)}
                            className={styles.input} style={{ marginTop: "0.5rem" }} />
                        )}
                      </div>
                      <div className={styles.row2}>
                        <div className={styles.inputGroup}>
                          <label>Provinsi <span className={styles.required}>*</span></label>
                          <select value={umkmProvinceCode} onChange={e => {
                            const code = e.target.value;
                            const prov = provinces.find(p => p.code === code);
                            setUmkmProvinceCode(code);
                            setUmkmRegencyCode("");
                            setUmkmDistricts([]);
                            setUmkmProfile(p => ({ ...p, province: prov?.name || "", city: "", district: "" }));
                            loadRegencies(code, setUmkmRegencies, setUmkmRegenciesLoading);
                          }} className={styles.select}>
                            <option value="">Pilih Provinsi</option>
                            {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                          </select>
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Kota <span className={styles.required}>*</span></label>
                          <select value={umkmRegencyCode} onChange={e => {
                            const code = e.target.value;
                            const reg = umkmRegencies.find(r => r.code === code);
                            setUmkmRegencyCode(code);
                            setUmkmProfile(p => ({ ...p, city: reg?.name || "", district: "" }));
                            loadDistricts(code, setUmkmDistricts, setUmkmDistrictsLoading);
                          }} className={styles.select} disabled={!umkmProvinceCode || umkmRegenciesLoading}>
                            <option value="">{umkmRegenciesLoading ? "Memuat..." : "Pilih Kota/Kabupaten"}</option>
                            {umkmRegencies.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className={styles.row2}>
                        <div className={styles.inputGroup}>
                          <label>Kecamatan <span className={styles.required}>*</span></label>
                          <select value={umkmProfile.district} onChange={e => setUmkmProfile(p => ({ ...p, district: e.target.value }))} className={styles.select} disabled={!umkmRegencyCode || umkmDistrictsLoading}>
                            <option value="">{umkmDistrictsLoading ? "Memuat..." : "Pilih Kecamatan"}</option>
                            {umkmDistricts.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
                          </select>
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Kode Pos <span className={styles.required}>*</span></label>
                          <input type="text" inputMode="numeric" placeholder="12345" maxLength={5}
                            value={umkmProfile.postalCode}
                            onChange={e => setUmkmProfile(p => ({ ...p, postalCode: e.target.value.replace(/\D/g, "").slice(0, 5) }))}
                            className={styles.input} />
                        </div>
                      </div>
                    </>
                  )}

                  <div className={styles.navRow}>
                    <button type="button" onClick={() => { setError(""); setStep(1); }} className={styles.backBtn}>Kembali</button>
                    <button type="button" onClick={handleStep2} className={styles.submitBtn}>Lanjutkan</button>
                  </div>

                  <Link href="/" className={styles.backHomeFullBtn}>
                    ← Kembali ke Beranda
                  </Link>
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
                          <div className={styles.uploadIconWrap}><Camera /></div>
                          <span className={styles.uploadText}>Klik untuk unggah atau seret & lepas</span>
                          <span className={styles.uploadSub}>E-KTP / Kartu Identitas Nasional (PNG, JPG maks 5MB)</span>
                        </>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} className={styles.hiddenInput} />
                    {kycFile && (
                      <div className={styles.fileInfo}>
                        <span>{kycFile.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.encryptionNotice}>
                    <span><Lock /></span> Dokumen Anda dienkripsi secara lokal sebelum transmisi.
                  </div>

                  <div className={styles.navRow}>
                    <button type="button" onClick={() => { setError(""); setStep(2); }} className={styles.backBtn}>Kembali</button>
                    <button type="button" onClick={handleSubmit} disabled={loading} className={styles.submitBtn}>
                      {loading ? <span className={styles.spinner} /> : "Daftar Identitas"}
                    </button>
                  </div>

                  <Link href="/" className={styles.backHomeFullBtn}>
                    ← Kembali ke Beranda
                  </Link>
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

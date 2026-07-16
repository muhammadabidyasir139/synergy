"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
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
      if (!investorProfile.province) return "Provinsi wajib dipilih.";
      if (!investorProfile.city) return "Kota wajib diisi.";
      if (!investorProfile.district) return "Kecamatan wajib dipilih.";
      if (!/^\d{5}$/.test(investorProfile.postalCode)) return "Kode pos harus 5 digit angka.";
    } else {
      if (!umkmProfile.ownerName) return "Nama pemilik wajib diisi.";
      if (!umkmProfile.businessName) return "Nama usaha wajib diisi.";
      if (!umkmProfile.businessCategory) return "Kategori usaha wajib dipilih.";
      if (umkmProfile.businessCategory === "Lainnya" && !businessCategoryOther.trim()) return "Sebutkan kategori usaha Anda.";
      if (!umkmProfile.province) return "Provinsi wajib dipilih.";
      if (!umkmProfile.city) return "Kota wajib diisi.";
      if (!umkmProfile.district) return "Kecamatan wajib dipilih.";
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
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import ThemeToggle from "@/components/ThemeToggle";

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
  socialMedia: string;
}

const BUSINESS_CATEGORIES = [
  "Kuliner & Makanan",
  "Fashion & Pakaian",
  "Pertanian & Perkebunan",
  "Perikanan & Kelautan",
  "Kerajinan Tangan",
  "Teknologi & Digital",
  "Perdagangan Umum",
  "Jasa & Layanan",
  "Kesehatan & Kecantikan",
  "Pendidikan",
  "Transportasi & Logistik",
  "Lainnya",
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
  const [agreed, setAgreed] = useState(false);

  const [account, setAccount] = useState<AccountData>({
    role: "INVESTOR",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [investorProfile, setInvestorProfile] = useState<InvestorProfileData>({
    fullName: "",
    dateOfBirth: "",
    address: "",
    city: "",
    province: "",
    investmentGoal: "",
    riskTolerance: "MEDIUM",
  });

  const [umkmProfile, setUmkmProfile] = useState<UmkmProfileData>({
    ownerName: "",
    businessName: "",
    businessCategory: "",
    businessDescription: "",
    location: "",
    city: "",
    province: "",
    establishedDate: "",
    employeeCount: "",
    monthlyRevenue: "",
    website: "",
    socialMedia: "",
  });

  // ── Step 1 validation ──
  function validateStep1(): string {
    if (!account.phoneNumber) return "Nomor HP wajib diisi.";
    if (!account.email) return "Email wajib diisi.";
    if (account.password.length < 8) return "Kata sandi minimal 8 karakter.";
    if (account.password !== account.confirmPassword) return "Konfirmasi kata sandi tidak cocok.";
    return "";
  }

  // ── Step 2 validation ──
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
    setError("");
    setStep(2);
  }

  function handleStep2() {
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError("");
    setStep(3);
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
    if (!agreed) { setError("Anda harus menyetujui syarat & ketentuan."); return; }

    setLoading(true);
    setError("");

    try {
      // In a real app, upload file to storage and get URL
      // For now, use a placeholder URL
      const kycDocumentUrl = `kyc/${Date.now()}_${kycFile.name}`;

      const payload = {
        role: account.role,
        email: account.email,
        phoneNumber: account.phoneNumber,
        password: account.password,
        profile: account.role === "INVESTOR" ? investorProfile : umkmProfile,
        kycDocumentUrl,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan, coba lagi.");
        return;
      }

      // Redirect to login after success
      router.push("/auth/login?registered=1");
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  const phoneDisplay = account.phoneNumber
    ? `+62 ${account.phoneNumber.replace(/^0/, "")}`
    : "";

  return (
    <div className={styles.container}>
      <div className={styles.orbContainer}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
      </div>

      <header className={styles.header}>
        <div className={styles.logoGroup}>
          <Link href="/" className={styles.logo}>SYNERGY</Link>
          <span className={styles.badge}>PKM KC</span>
        </div>
        <ThemeToggle />
      </header>

      <main className={styles.main}>
        <div className={`${styles.card} glass`}>

          {/* ── Progress steps ── */}
          <div className={styles.stepBar}>
            {[
              { n: 1, label: "Akun" },
              { n: 2, label: "Profil" },
              { n: 3, label: "KYC" },
            ].map(({ n, label }) => (
              <div key={n} className={styles.stepItem}>
                <div className={`${styles.stepDot} ${step >= n ? styles.stepActive : ""} ${step > n ? styles.stepDone : ""}`}>
                  {step > n ? "✓" : n}
                </div>
                <span className={`${styles.stepLabel} ${step >= n ? styles.stepLabelActive : ""}`}>{label}</span>
                {n < 3 && <div className={`${styles.stepLine} ${step > n ? styles.stepLineFilled : ""}`} />}
              </div>
            ))}
          </div>

          {/* ── Step 1: Akun ── */}
          {step === 1 && (
            <>
              <div className={styles.cardHeader}>
                <h1>Buat Identitas</h1>
                <p>Mulai perjalanan Anda di jaringan blockchain syariah</p>
              </div>

              {/* Role selector */}
              <div className={styles.roleSelector}>
                <button
                  type="button"
                  className={`${styles.roleTab} ${account.role === "INVESTOR" ? styles.activeTab : ""}`}
                  onClick={() => setAccount(a => ({ ...a, role: "INVESTOR" }))}
                >
                  <span className={styles.roleIcon}>💰</span>
                  <span>Investor</span>
                </button>
                <button
                  type="button"
                  className={`${styles.roleTab} ${account.role === "UMKM" ? styles.activeTab : ""}`}
                  onClick={() => setAccount(a => ({ ...a, role: "UMKM" }))}
                >
                  <span className={styles.roleIcon}>🏢</span>
                  <span>UMKM</span>
                </button>
              </div>

              {error && <div className={styles.errorAlert}>{error}</div>}

              <div className={styles.form}>
                <div className={styles.inputGroup}>
                  <label>Email Kerja / Pribadi</label>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={account.email}
                    onChange={e => setAccount(a => ({ ...a, email: e.target.value }))}
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Nomor HP</label>
                  <div className={styles.phoneRow}>
                    <span className={styles.phonePrefix}>+62</span>
                    <input
                      type="tel"
                      placeholder="812 3456 7890"
                      value={account.phoneNumber}
                      onChange={e => setAccount(a => ({ ...a, phoneNumber: e.target.value.replace(/\D/g, "") }))}
                      className={`${styles.input} ${styles.phoneInput}`}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Kata Sandi</label>
                  <input
                    type="password"
                    placeholder="Min. 8 karakter"
                    value={account.password}
                    onChange={e => setAccount(a => ({ ...a, password: e.target.value }))}
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Konfirmasi Kata Sandi</label>
                  <input
                    type="password"
                    placeholder="Ulangi kata sandi"
                    value={account.confirmPassword}
                    onChange={e => setAccount(a => ({ ...a, confirmPassword: e.target.value }))}
                    className={styles.input}
                  />
                </div>

                <button type="button" onClick={handleStep1} className={styles.submitBtn}>
                  Lanjutkan →
                </button>
              </div>
            </>
          )}

          {/* ── Step 2: Profil ── */}
          {step === 2 && (
            <>
              <div className={styles.cardHeader}>
                <h1>{account.role === "INVESTOR" ? "Data Investor" : "Data Usaha"}</h1>
                <p>{account.role === "INVESTOR" ? "Lengkapi profil investasi Anda" : "Informasi usaha Anda"}</p>
              </div>

              {error && <div className={styles.errorAlert}>{error}</div>}

              <div className={styles.form}>
                {account.role === "INVESTOR" ? (
                  <>
                    <div className={styles.inputGroup}>
                      <label>Nama Lengkap <span className={styles.required}>*</span></label>
                      <input type="text" placeholder="Sesuai KTP"
                        value={investorProfile.fullName}
                        onChange={e => setInvestorProfile(p => ({ ...p, fullName: e.target.value }))}
                        className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Tanggal Lahir <span className={styles.required}>*</span></label>
                      <input type="date"
                        value={investorProfile.dateOfBirth}
                        onChange={e => setInvestorProfile(p => ({ ...p, dateOfBirth: e.target.value }))}
                        className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Alamat</label>
                      <input type="text" placeholder="Jl. contoh No. 1"
                        value={investorProfile.address}
                        onChange={e => setInvestorProfile(p => ({ ...p, address: e.target.value }))}
                        className={styles.input} />
                    </div>
                    <div className={styles.row2}>
                      <div className={styles.inputGroup}>
                        <label>Kota <span className={styles.required}>*</span></label>
                        <input type="text" placeholder="Yogyakarta"
                          value={investorProfile.city}
                          onChange={e => setInvestorProfile(p => ({ ...p, city: e.target.value }))}
                          className={styles.input} />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Provinsi <span className={styles.required}>*</span></label>
                        <select value={investorProfile.province}
                          onChange={e => setInvestorProfile(p => ({ ...p, province: e.target.value }))}
                          className={styles.select}>
                          <option value="">Pilih Provinsi</option>
                          {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Tujuan Investasi</label>
                      <input type="text" placeholder="Contoh: Dana pendidikan anak"
                        value={investorProfile.investmentGoal}
                        onChange={e => setInvestorProfile(p => ({ ...p, investmentGoal: e.target.value }))}
                        className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Toleransi Risiko</label>
                      <div className={styles.riskGroup}>
                        {(["LOW", "MEDIUM", "HIGH"] as const).map(r => (
                          <button key={r} type="button"
                            className={`${styles.riskBtn} ${investorProfile.riskTolerance === r ? styles.riskActive : ""}`}
                            onClick={() => setInvestorProfile(p => ({ ...p, riskTolerance: r }))}>
                            <span className={styles.riskIcon}>{r === "LOW" ? "🛡️" : r === "MEDIUM" ? "⚖️" : "🚀"}</span>
                            <span>{r === "LOW" ? "Rendah" : r === "MEDIUM" ? "Sedang" : "Tinggi"}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.row2}>
                      <div className={styles.inputGroup}>
                        <label>Nama Pemilik <span className={styles.required}>*</span></label>
                        <input type="text" placeholder="Nama sesuai KTP"
                          value={umkmProfile.ownerName}
                          onChange={e => setUmkmProfile(p => ({ ...p, ownerName: e.target.value }))}
                          className={styles.input} />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Nama Usaha <span className={styles.required}>*</span></label>
                        <input type="text" placeholder="Nama brand / toko"
                          value={umkmProfile.businessName}
                          onChange={e => setUmkmProfile(p => ({ ...p, businessName: e.target.value }))}
                          className={styles.input} />
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Kategori Usaha <span className={styles.required}>*</span></label>
                      <select value={umkmProfile.businessCategory}
                        onChange={e => setUmkmProfile(p => ({ ...p, businessCategory: e.target.value }))}
                        className={styles.select}>
                        <option value="">Pilih Kategori</option>
                        {BUSINESS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Deskripsi Usaha</label>
                      <textarea rows={3} placeholder="Ceritakan usaha Anda secara singkat..."
                        value={umkmProfile.businessDescription}
                        onChange={e => setUmkmProfile(p => ({ ...p, businessDescription: e.target.value }))}
                        className={`${styles.input} ${styles.textarea}`} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Alamat Usaha</label>
                      <input type="text" placeholder="Jl. contoh No. 1"
                        value={umkmProfile.location}
                        onChange={e => setUmkmProfile(p => ({ ...p, location: e.target.value }))}
                        className={styles.input} />
                    </div>
                    <div className={styles.row2}>
                      <div className={styles.inputGroup}>
                        <label>Kota <span className={styles.required}>*</span></label>
                        <input type="text" placeholder="Yogyakarta"
                          value={umkmProfile.city}
                          onChange={e => setUmkmProfile(p => ({ ...p, city: e.target.value }))}
                          className={styles.input} />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Provinsi <span className={styles.required}>*</span></label>
                        <select value={umkmProfile.province}
                          onChange={e => setUmkmProfile(p => ({ ...p, province: e.target.value }))}
                          className={styles.select}>
                          <option value="">Pilih Provinsi</option>
                          {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className={styles.row2}>
                      <div className={styles.inputGroup}>
                        <label>Tanggal Berdiri</label>
                        <input type="date"
                          value={umkmProfile.establishedDate}
                          onChange={e => setUmkmProfile(p => ({ ...p, establishedDate: e.target.value }))}
                          className={styles.input} />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Jumlah Karyawan</label>
                        <input type="number" min="0" placeholder="5"
                          value={umkmProfile.employeeCount}
                          onChange={e => setUmkmProfile(p => ({ ...p, employeeCount: e.target.value }))}
                          className={styles.input} />
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Omzet Bulanan (Rp)</label>
                      <input type="number" min="0" placeholder="5000000"
                        value={umkmProfile.monthlyRevenue}
                        onChange={e => setUmkmProfile(p => ({ ...p, monthlyRevenue: e.target.value }))}
                        className={styles.input} />
                    </div>
                    <div className={styles.row2}>
                      <div className={styles.inputGroup}>
                        <label>Website</label>
                        <input type="url" placeholder="https://usaha.com"
                          value={umkmProfile.website}
                          onChange={e => setUmkmProfile(p => ({ ...p, website: e.target.value }))}
                          className={styles.input} />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Media Sosial</label>
                        <input type="text" placeholder="@namaakun"
                          value={umkmProfile.socialMedia}
                          onChange={e => setUmkmProfile(p => ({ ...p, socialMedia: e.target.value }))}
                          className={styles.input} />
                      </div>
                    </div>
                  </>
                )}

                <div className={styles.navRow}>
                  <button type="button" onClick={() => { setError(""); setStep(1); }} className={styles.backBtn}>
                    ← Kembali
                  </button>
                  <button type="button" onClick={handleStep2} className={styles.submitBtn}>
                    Lanjutkan →
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Step 3: KYC ── */}
          {step === 3 && (
            <>
              <div className={styles.cardHeader}>
                <h1>Verifikasi E-KYC</h1>
                <p>Upload foto E-KTP untuk memverifikasi identitas Anda</p>
              </div>

              {error && <div className={styles.errorAlert}>{error}</div>}

              <div className={styles.form}>
                {/* Review summary */}
                <div className={styles.summaryBox}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Peran</span>
                    <span className={styles.summaryValue}>{account.role}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Email</span>
                    <span className={styles.summaryValue}>{account.email}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Nomor HP</span>
                    <span className={styles.summaryValue}>{phoneDisplay || account.phoneNumber}</span>
                  </div>
                  {account.role === "INVESTOR" && (
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>Nama</span>
                      <span className={styles.summaryValue}>{investorProfile.fullName}</span>
                    </div>
                  )}
                  {account.role === "UMKM" && (
                    <>
                      <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Pemilik</span>
                        <span className={styles.summaryValue}>{umkmProfile.ownerName}</span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Usaha</span>
                        <span className={styles.summaryValue}>{umkmProfile.businessName}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* KYC Upload */}
                <div className={styles.inputGroup}>
                  <label>
                    Foto E-KTP / Identitas Nasional
                    <span className={styles.required}> *</span>
                    <span className={styles.fileHint}> (PNG, JPG — maks. 5 MB)</span>
                  </label>
                  <div
                    className={`${styles.uploadZone} ${kycFile ? styles.uploadZoneFilled : ""}`}
                    onClick={() => fileRef.current?.click()}
                  >
                    {kycPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={kycPreview} alt="Preview KTP" className={styles.kycPreview} />
                    ) : (
                      <div className={styles.uploadPlaceholder}>
                        <span className={styles.uploadIcon}>📄</span>
                        <span className={styles.uploadText}>Klik atau seret file ke sini</span>
                        <span className={styles.uploadSub}>E-KTP / Foto Identitas Nasional</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    className={styles.hiddenInput}
                  />
                  {kycFile && (
                    <div className={styles.fileInfo}>
                      <span className={styles.validBadge}>✓ VALID</span>
                      <span>{kycFile.name}</span>
                    </div>
                  )}
                </div>

                {/* Agreement */}
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>
                    Saya menyetujui{" "}
                    <a href="#" className={styles.linkInline}>Syarat & Ketentuan</a>{" "}
                    dan{" "}
                    <a href="#" className={styles.linkInline}>Kebijakan Privasi</a>{" "}
                    SYNERGY. Dokumen identitas digunakan hanya untuk keperluan KYC sesuai regulasi OJK.
                  </span>
                </label>

                <div className={styles.navRow}>
                  <button type="button" onClick={() => { setError(""); setStep(2); }} className={styles.backBtn}>
                    ← Kembali
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className={styles.submitBtn}
                  >
                    {loading ? <span className={styles.spinner} /> : "Daftar Sekarang"}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className={styles.cardFooter}>
            <p>
              Sudah punya akun?{" "}
              <Link href="/auth/login" className={styles.footerLink}>Masuk</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

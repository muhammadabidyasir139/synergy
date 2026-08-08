"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import ThemeToggle from "@/components/ThemeToggle";
import { Wallet, Building, Lock } from "@/components/icons";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [role, setRole] = useState<"investor" | "umkm">("investor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (params.get("registered") === "1") {
      setSuccess("Pendaftaran berhasil! Silakan masuk ke akun Anda.");
    }
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side validation
    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Format email tidak valid. Contoh: nama@email.com");
      return;
    }
    if (!password) {
      setError("Kata sandi wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email.trim(), password, role: role.toUpperCase() }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        setError("Respon server tidak valid (bukan JSON). Silakan periksa server.");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Email atau kata sandi salah. Silakan coba lagi.");
        return;
      }

      const userRole = (data.role as string).toLowerCase();

      if (userRole === "investor") {
        sessionStorage.setItem("synergy_investor_session", JSON.stringify(data.session));
      } else if (userRole === "umkm") {
        sessionStorage.setItem("synergy_umkm_session", JSON.stringify(data.session));
      }

      router.push(userRole === "umkm" ? "/umkm/dashboard" : "/investor/dashboard");
    } catch {
      setError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Background orbs */}
      <div className={styles.orbContainer}>
        <div className={`${styles.orb} ${styles.orb1}`}></div>
        <div className={`${styles.orb} ${styles.orb2}`}></div>
      </div>

      {/* Header element */}
      <header className={styles.header}>
        <Link href="/" className={styles.logoGroup}>
          <Image
            src="/source/Logo-Synergy.png"
            alt="Synergy Logo"
            width={40}
            height={40}
            style={{ objectFit: "contain" }}
            priority
          />
          <span className={styles.logoText}>SYNERGY</span>
          <span className={styles.badge}>PKM KC</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main card */}
      <main className={styles.main}>
        <div className={`${styles.card} glass`}>
          <div className={styles.cardHeader}>
            <h1>Selamat Datang Kembali</h1>
            <p>Pintu gerbang investasi syariah cerdas berbasis AI & Blockchain</p>
          </div>

          {/* Role selector */}
          <div className={styles.roleSelector}>
            <button
              type="button"
              className={`${styles.roleTab} ${role === "investor" ? styles.activeTab : ""}`}
              onClick={() => setRole("investor")}
            >
              <span className={styles.roleIcon}><Wallet /></span>
              <span>Investor</span>
            </button>
            <button
              type="button"
              className={`${styles.roleTab} ${role === "umkm" ? styles.activeTab : ""}`}
              onClick={() => setRole("umkm")}
            >
              <span className={styles.roleIcon}><Building /></span>
              <span>UMKM</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {success && <div className={styles.successAlert}>{success}</div>}
            {error && <div className={styles.errorAlert}>{error}</div>}

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Kata Sandi</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.passwordInput}
                />
                <button
                  type="button"
                  className={styles.togglePasswordBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? (
                <span className={styles.spinner}></span>
              ) : (
                `Masuk sebagai ${role === "investor" ? "Investor" : "UMKM"}`
              )}
            </button>

            <Link href="/" className={styles.backHomeFullBtn}>
              ← Kembali ke Beranda
            </Link>
          </form>

          <div className={styles.cardFooter}>
            <p>
              Belum memiliki akun?{" "}
              <Link href="/auth/register" className={styles.footerLink}>
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function GeneralLogin() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

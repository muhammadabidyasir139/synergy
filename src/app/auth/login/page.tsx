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

            <div className={styles.divider}>
              <span>atau</span>
            </div>

            <button
              type="button"
              className={styles.googleBtn}
              onClick={() => alert("Fitur Masuk dengan Google akan terhubung setelah mengonfigurasi Client ID Google OAuth.")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Masuk dengan Google</span>
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

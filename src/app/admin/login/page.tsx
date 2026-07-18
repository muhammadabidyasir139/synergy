"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import ThemeToggle from "@/components/ThemeToggle";
import { User, Lock, Eye, EyeOff } from "@/components/icons";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Clear session on load to ensure logged out
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("synergy_admin_session");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login gagal");
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("synergy_admin_session", "true");
      }

      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal. Silakan coba lagi.");
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
        <div className={styles.logoGroup}>
          <Link href="/" className={styles.logo}>
            SYNERGY
          </Link>
          <span className={styles.badge}>PKM KC</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main card */}
      <main className={styles.main}>
        <div className={`${styles.card} glass`}>
          <div className={styles.cardHeader}>
            <div className={styles.lockIconWrap}>
              <Lock size={22} />
            </div>
            <h1>Portal Admin</h1>
            <p>Akses khusus untuk administrator Synergy</p>
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
            {error && <div className={styles.errorAlert}>{error}</div>}

            <div className={styles.inputGroup}>
              <label htmlFor="username">Username Admin</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}><User size={18} /></span>
                <input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  className={styles.input}
                />
              </div>
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
                  disabled={loading}
                  className={styles.passwordInput}
                />
                <button
                  type="button"
                  className={styles.togglePasswordBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  tabIndex={-1}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? <span className={styles.spinner}></span> : "Masuk sebagai Admin"}
            </button>
          </form>

          <div className={styles.cardFooter}>
            <Link href="/auth/login" className={styles.footerLink}>
              Kembali ke Login Umum
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

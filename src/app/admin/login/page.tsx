"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [securityKey, setSecurityKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  // Clear session on load to ensure logged out
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("synergy_admin_session");
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShake(false);
    setLoading(true);

    // Default Credentials
    const DEFAULT_ADMIN = "admin";
    const DEFAULT_PASS = "synergy2026!";
    const DEFAULT_KEY = "999999";

    setTimeout(() => {
      if (
        username.trim() === DEFAULT_ADMIN &&
        password === DEFAULT_PASS &&
        securityKey.trim() === DEFAULT_KEY
      ) {
        // Success
        setSuccess(true);
        setLoading(false);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("synergy_admin_session", "true");
        }
        
        // Dynamic wait for green success animation to finish
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 800);
      } else {
        // Fail
        setLoading(false);
        setShake(true);
        if (username.trim() !== DEFAULT_ADMIN || password !== DEFAULT_PASS) {
          setError("Username atau Password Admin salah!");
        } else {
          setError("Security Key (MFA) salah! Hubungi Super Admin.");
        }
      }
    }, 1200);
  };

  return (
    <div className={`${styles.container} ${success ? styles.bgSuccess : ""}`}>
      {/* High-tech matrix/particle animated line backgrounds */}
      <div className={styles.particleBg}>
        <div className={styles.glowLine}></div>
        <div className={styles.gridBg}></div>
      </div>

      <main className={styles.main}>
        <div className={`${styles.card} glass ${shake ? styles.shake : ""} ${success ? styles.successCard : ""}`}>
          <div className={styles.brandHeader}>
            <div className={styles.shieldGlow}>
              <svg className={styles.shieldIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
            </div>
            <h1>SYNERGY ADMIN</h1>
            <span className={styles.securityBadge}>Secure Admin Portal</span>
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
            {error && (
              <div className={styles.errorAlert}>
                <svg className={styles.alertIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="username">Username Admin</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>👤</span>
                <input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading || success}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🔑</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || success}
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.eyeBtn}
                  tabIndex={-1}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelWithHint}>
                <label htmlFor="securityKey">Security Key (MFA)</label>
                <span className={styles.hintText}>Demo: 999999</span>
              </div>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🛡️</span>
                <input
                  id="securityKey"
                  type="text"
                  placeholder="6 Digit PIN"
                  maxLength={6}
                  value={securityKey}
                  onChange={(e) => setSecurityKey(e.target.value.replace(/\D/g, ""))}
                  required
                  disabled={loading || success}
                  className={styles.input}
                />
              </div>
            </div>

            <button type="submit" disabled={loading || success} className={styles.submitBtn}>
              {loading ? (
                <div className={styles.loadingWrapper}>
                  <span className={styles.spinner}></span>
                  <span>Mengautentikasi...</span>
                </div>
              ) : success ? (
                <span>Akses Diberikan!</span>
              ) : (
                <span>Masuk Ke Dashboard Admin</span>
              )}
            </button>
          </form>

          <div className={styles.cardFooter}>
            <Link href="/" className={styles.backLink}>
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import ThemeToggle from "@/components/ThemeToggle";

export default function GeneralLogin() {
  const router = useRouter();
  const [role, setRole] = useState<"investor" | "umkm">("investor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulated user login
    setTimeout(() => {
      if (!email || !password) {
        setError("Email dan kata sandi wajib diisi!");
        setLoading(false);
        return;
      }
      
      // Simulating a successful login
      alert(`Login berhasil sebagai ${role === "investor" ? "Investor" : "UMKM"}!`);
      setLoading(false);
      // For demo, just redirect to home
      router.push("/");
    }, 1000);
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
              <span className={styles.roleIcon}>💰</span>
              <span>Investor</span>
            </button>
            <button
              type="button"
              className={`${styles.roleTab} ${role === "umkm" ? styles.activeTab : ""}`}
              onClick={() => setRole("umkm")}
            >
              <span className={styles.roleIcon}>🏢</span>
              <span>UMKM</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
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
              <div className={styles.labelRow}>
                <label htmlFor="password">Kata Sandi</label>
                <a href="#forgot" className={styles.forgotLink}>Lupa kata sandi?</a>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? (
                <span className={styles.spinner}></span>
              ) : (
                `Masuk sebagai ${role === "investor" ? "Investor" : "UMKM"}`
              )}
            </button>
          </form>

          <div className={styles.cardFooter}>
            <p>
              Belum memiliki akun?{" "}
              <Link href="/auth/register" className={styles.footerLink}>
                Daftar Sekarang
              </Link>
            </p>
          </div>

          {/* Elegant and subtle link to Admin portal */}
          <div className={styles.adminPortalLink}>
            <Link href="/admin/login" className={styles.adminBtn}>
              <span className={styles.adminIcon}>🔐</span>
              <span>Portal Admin</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

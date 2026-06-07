"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type Step = "phone" | "otp";

export default function InvestorLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (phone.length < 10) {
      setError("Nomor HP tidak valid. Minimal 10 digit.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
    }, 1200);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length < 6) {
      setError("Masukkan 6 digit kode OTP.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("synergy_investor_session", "true");
      }
      router.replace("/investor/dashboard");
    }, 1200);
  };

  const handleResendOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    setError("OTP baru telah dikirim ke " + phone);
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgMesh}></div>

      <div className={styles.card}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>💰</div>
          <h1 className={styles.logoTitle}>SYNERGY</h1>
          <p className={styles.logoSub}>INVESTOR PORTAL</p>
        </div>

        {step === "phone" ? (
          <>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Masuk sebagai Investor</h2>
              <p className={styles.cardDesc}>
                Masukkan nomor HP terdaftar. Kami akan mengirimkan kode OTP untuk verifikasi.
              </p>
            </div>

            <form onSubmit={handlePhoneSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Nomor HP</label>
                <div className={styles.inputGroup}>
                  <span className={styles.inputPrefix}>+62</span>
                  <input
                    type="tel"
                    className={styles.input}
                    placeholder="812-xxxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    maxLength={13}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {error && <p className={styles.errorMsg}>{error}</p>}

              <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? (
                  <span className={styles.btnSpinner}></span>
                ) : (
                  "Kirim OTP Verifikasi"
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Verifikasi OTP</h2>
              <p className={styles.cardDesc}>
                Kode OTP telah dikirim ke{" "}
                <strong>+62 {phone}</strong>. Masukkan 6 digit kode di bawah.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className={styles.form}>
              <div className={styles.otpGroup}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={styles.otpInput}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {error && <p className={styles.errorMsg}>{error}</p>}

              <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? (
                  <span className={styles.btnSpinner}></span>
                ) : (
                  "Verifikasi & Masuk"
                )}
              </button>

              <div className={styles.resendRow}>
                <span className={styles.resendText}>Tidak menerima kode?</span>
                <button type="button" className={styles.resendBtn} onClick={handleResendOtp}>
                  Kirim Ulang OTP
                </button>
              </div>

              <button
                type="button"
                className={styles.backBtn}
                onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}
              >
                ← Ganti Nomor HP
              </button>
            </form>
          </>
        )}

        <div className={styles.securityNote}>
          <span className={styles.lockIcon}>🔒</span>
          <span>Transaksi diamankan oleh Smart Contract & enkripsi 256-bit</span>
        </div>
      </div>
    </div>
  );
}

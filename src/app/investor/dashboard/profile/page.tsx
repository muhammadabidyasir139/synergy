"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { User, Lock, CheckCircle, Pencil, Shield } from "@/components/icons";

interface ProfileData {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  province: string;
  district: string;
  postalCode: string;
  investmentGoal: string;
  riskTolerance: "LOW" | "MEDIUM" | "HIGH";
}

interface PinStatus {
  hasPin: boolean;
  locked: boolean;
  lockedUntil: string | null;
}

function getInvestorId() {
  if (typeof window === "undefined") return "";
  try { return JSON.parse(sessionStorage.getItem("synergy_investor_session") ?? "{}").investorProfileId ?? ""; }
  catch { return ""; }
}

export default function InvestorProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [pinStatus, setPinStatus] = useState<PinStatus | null>(null);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSaved, setPinSaved] = useState(false);
  const [isPinSaving, setIsPinSaving] = useState(false);

  const loadProfile = () => {
    const id = getInvestorId();
    fetch("/api/investor/profile", { headers: { "x-investor-id": id } })
      .then(async (r) => (r.ok ? ((await r.json()) as ProfileData) : null))
      .then((d) => { if (d) setProfile(d); else setError("Gagal memuat profil."); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  const loadPinStatus = () => {
    const id = getInvestorId();
    fetch("/api/investor/profile/pin", { headers: { "x-investor-id": id } })
      .then(async (r) => (r.ok ? ((await r.json()) as PinStatus) : null))
      .then((d) => { if (d) setPinStatus(d); })
      .catch(console.error);
  };

  useEffect(() => { loadProfile(); loadPinStatus(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    setError("");
    try {
      const id = getInvestorId();
      const res = await fetch("/api/investor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-investor-id": id },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Gagal menyimpan perubahan.");
        return;
      }
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePinSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");

    if (!/^\d{6}$/.test(newPin)) { setPinError("PIN baru harus 6 digit angka."); return; }
    if (newPin !== confirmPin) { setPinError("Konfirmasi PIN baru tidak cocok."); return; }
    if (pinStatus?.hasPin && !/^\d{6}$/.test(currentPin)) { setPinError("Masukkan PIN Anda saat ini."); return; }

    setIsPinSaving(true);
    try {
      const id = getInvestorId();
      const res = await fetch("/api/investor/profile/pin", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-investor-id": id },
        body: JSON.stringify({ currentPin: pinStatus?.hasPin ? currentPin : undefined, newPin }),
      });
      const data = await res.json();
      if (!res.ok) { setPinError(data.error ?? "Gagal menyimpan PIN."); return; }
      setPinSaved(true);
      setCurrentPin(""); setNewPin(""); setConfirmPin("");
      loadPinStatus();
      setTimeout(() => setPinSaved(false), 3000);
    } catch {
      setPinError("Tidak dapat terhubung ke server.");
    } finally {
      setIsPinSaving(false);
    }
  };

  if (isLoading) return <div style={{ padding: "2rem" }}>Memuat profil...</div>;
  if (!profile) return <div style={{ padding: "2rem" }}>Sesi tidak ditemukan. Silakan masuk kembali.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}><User style={{ verticalAlign: "-0.125em" }} /> Informasi Profil</h3>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {saved && <span className={styles.savedTag}><CheckCircle style={{ verticalAlign: "-0.125em" }} /> Tersimpan!</span>}
            {!isEditing ? (
              <button type="button" className={styles.primaryBtn} onClick={() => setIsEditing(true)}>
                <Pencil style={{ verticalAlign: "-0.125em" }} /> Edit Profil
              </button>
            ) : (
              <button type="button" className={styles.secondaryBtn} onClick={() => { setIsEditing(false); setError(""); loadProfile(); }}>Batal</button>
            )}
          </div>
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <form onSubmit={handleSave} className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label}>Nama Lengkap</label>
            <input className={styles.input} value={profile.fullName} disabled={!isEditing}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} value={profile.email} disabled />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Nomor HP</label>
            <input className={styles.input} value={profile.phoneNumber} disabled />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Tanggal Lahir</label>
            <input type="date" className={styles.input} value={profile.dateOfBirth} disabled={!isEditing}
              onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Kota</label>
            <input className={styles.input} value={profile.city} disabled={!isEditing}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Provinsi</label>
            <input className={styles.input} value={profile.province} disabled={!isEditing}
              onChange={(e) => setProfile({ ...profile, province: e.target.value })} />
          </div>
          <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
            <label className={styles.label}>Alamat</label>
            <input className={styles.input} value={profile.address} disabled={!isEditing}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Toleransi Risiko</label>
            <select className={styles.select} value={profile.riskTolerance} disabled={!isEditing}
              onChange={(e) => setProfile({ ...profile, riskTolerance: e.target.value as ProfileData["riskTolerance"] })}>
              <option value="LOW">Rendah</option>
              <option value="MEDIUM">Sedang</option>
              <option value="HIGH">Tinggi</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Tujuan Investasi</label>
            <input className={styles.input} value={profile.investmentGoal} disabled={!isEditing}
              onChange={(e) => setProfile({ ...profile, investmentGoal: e.target.value })} />
          </div>

          {isEditing && (
            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className={styles.primaryBtn} disabled={isSaving}>
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          )}
        </form>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}><Shield style={{ verticalAlign: "-0.125em" }} /> Keamanan Transaksi (PIN)</h3>
          {pinSaved && <span className={styles.savedTag}><CheckCircle style={{ verticalAlign: "-0.125em" }} /> Tersimpan!</span>}
        </div>

        <p className={styles.helpText}>
          PIN transaksi 6 digit ini wajib dimasukkan setiap kali Anda mengonfirmasi investasi dan men-deploy smart contract ke blockchain.
        </p>

        {pinStatus?.locked && (
          <p className={styles.errorText}>
            PIN Anda sedang terkunci sementara karena terlalu banyak percobaan gagal
            {pinStatus.lockedUntil ? ` hingga ${new Date(pinStatus.lockedUntil).toLocaleTimeString("id-ID")}` : ""}.
          </p>
        )}

        <form onSubmit={handlePinSave} className={styles.grid}>
          {pinStatus?.hasPin && (
            <div className={styles.field}>
              <label className={styles.label}><Lock style={{ verticalAlign: "-0.125em" }} /> PIN Saat Ini</label>
              <input type="password" inputMode="numeric" maxLength={6} className={styles.pinInput}
                placeholder="••••••" value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 6))} />
            </div>
          )}
          <div className={styles.field}>
            <label className={styles.label}>{pinStatus?.hasPin ? "PIN Baru" : "Buat PIN"}</label>
            <input type="password" inputMode="numeric" maxLength={6} className={styles.pinInput}
              placeholder="••••••" value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Konfirmasi PIN Baru</label>
            <input type="password" inputMode="numeric" maxLength={6} className={styles.pinInput}
              placeholder="••••••" value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))} />
          </div>

          {pinError && <p className={styles.errorText} style={{ gridColumn: "1 / -1" }}>{pinError}</p>}

          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className={styles.primaryBtn} disabled={isPinSaving}>
              {isPinSaving ? "Menyimpan..." : pinStatus?.hasPin ? "Ganti PIN" : "Simpan PIN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

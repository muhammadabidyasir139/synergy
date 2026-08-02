"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { Handshake, Clipboard, ArrowRight, ArrowLeft, Wallet, CheckCircle, Sparkles, Lock, Building } from "@/components/icons";

interface Campaign {
  id: string;
  name: string;
  estimatedRoi: number;
  durationMonths: number;
  akadType: string;
  nisbahInvestor?: number;
  logoUrl?: string | null;
  category?: string;
  city?: string;
}

function getInvestorId() {
  if (typeof window === "undefined") return "";
  try { return JSON.parse(sessionStorage.getItem("synergy_investor_session") ?? "{}").investorProfileId ?? ""; }
  catch { return ""; }
}

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function InvestasiPage() {
  const searchParams = useSearchParams();
  const preselect = searchParams.get("campaignId");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [akadType, setAkadType] = useState<"MUSYARAKAH" | "MURABAHAH">("MUSYARAKAH");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"form" | "simulation" | "confirm" | "success">("form");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ investmentId: string; txHash: string } | null>(null);
  const [error, setError] = useState("");
  const [pin, setPin] = useState("");
  const [hasPin, setHasPin] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/investor/campaigns")
      .then((r) => r.json())
      .then((d: Campaign[]) => {
        setCampaigns(d);
        setSelectedId(preselect ?? (d[0]?.id ?? ""));
        if (d[0]) setAkadType(d[0].akadType as "MUSYARAKAH" | "MURABAHAH");
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));

    const investorId = getInvestorId();
    fetch("/api/investor/profile/pin", { headers: { "x-investor-id": investorId } })
      .then((r) => r.json())
      .then((d: { hasPin?: boolean }) => setHasPin(!!d.hasPin))
      .catch(() => setHasPin(false));
  }, [preselect]);

  const selected = campaigns.find((c) => c.id === selectedId);
  const amountNum = parseInt(amount.replace(/\D/g, "")) || 0;
  const roiRate = (selected?.estimatedRoi ?? 0) / 100;
  const estProfit = Math.round(amountNum * roiRate);
  const platformFee = Math.round(amountNum * 0.025);
  const netProfit = estProfit - platformFee;

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountNum < 1000000) { alert("Minimal investasi Rp 1.000.000"); return; }
    setStep("simulation");
  };

  const handleFinalConfirm = async () => {
    if (!selected) return;
    if (!/^\d{6}$/.test(pin)) { setError("Masukkan PIN transaksi 6 digit."); return; }
    setIsSubmitting(true);
    setError("");
    try {
      const investorId = getInvestorId();
      const res = await fetch("/api/investor/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-investor-id": investorId },
        body: JSON.stringify({ campaignId: selected.id, akadType, amount: amountNum, pin }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal membuat investasi."); setPin(""); return; }
      setResult({ investmentId: data.investmentId, txHash: data.txHash });
      setPin("");
      setStep("success");
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div style={{ padding: "2rem" }}>Memuat data kampanye...</div>;

  return (
    <div className={styles.page}>
      {step !== "success" ? (
        <>
          <div className={styles.steps}>
            {["Pilih & Input", "Simulasi Profit", "Konfirmasi"].map((s, i) => {
              const idx = i + 1;
              const active = step === "form" ? 1 : step === "simulation" ? 2 : 3;
              return (
                <div key={s} className={styles.stepItem}>
                  <div className={`${styles.stepCircle} ${active >= idx ? styles.stepActive : ""}`}>{idx}</div>
                  <span className={`${styles.stepLabel} ${active >= idx ? styles.stepLabelActive : ""}`}>{s}</span>
                  {i < 2 && <div className={`${styles.stepLine} ${active > idx ? styles.stepLineActive : ""}`} />}
                </div>
              );
            })}
          </div>

          {step === "form" && (
            <form onSubmit={handleSimulate} className={styles.formCard}>
              <h3 className={styles.formTitle}>{preselect ? "Detail & Input Investasi" : "Pilih UMKM & Input Investasi"}</h3>

              {preselect ? (
                selected && (
                  <div className={styles.field}>
                    <label className={styles.label}>UMKM Tujuan Investasi</label>
                    <div className={styles.selectedUmkmCard}>
                      {selected.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selected.logoUrl} alt={selected.name} className={styles.selectedUmkmLogo} />
                      ) : (
                        <div className={styles.selectedUmkmLogoPlaceholder}><Building /></div>
                      )}
                      <div className={styles.selectedUmkmInfo}>
                        <p className={styles.selectedUmkmName}>{selected.name}</p>
                        <p className={styles.selectedUmkmMeta}>
                          {[selected.category, selected.city].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                      <Link href="/investor/dashboard/explore" className={styles.selectedUmkmChange}>Ganti</Link>
                    </div>
                  </div>
                )
              ) : (
                <div className={styles.field}>
                  <label className={styles.label}>Pilih UMKM</label>
                  <select className={styles.select} value={selectedId} onChange={(e) => {
                    setSelectedId(e.target.value);
                    const c = campaigns.find((x) => x.id === e.target.value);
                    if (c) setAkadType(c.akadType as "MUSYARAKAH" | "MURABAHAH");
                  }}>
                    {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name} — ROI {c.estimatedRoi}%</option>)}
                  </select>
                </div>
              )}

              {selected && (
                <div className={styles.umkmInfoBox}>
                  <div className={styles.infoRow}><span>Estimasi ROI</span><span className={styles.infoVal}>{selected.estimatedRoi}%</span></div>
                  <div className={styles.infoRow}><span>Durasi</span><span className={styles.infoVal}>{selected.durationMonths} Bulan</span></div>
                  <div className={styles.infoRow}><span>Nisbah Investor:UMKM</span><span className={styles.infoVal}>40:60</span></div>
                </div>
              )}

              <div className={styles.field}>
                <label className={styles.label}>Jenis Akad</label>
                <div className={styles.akadBtns}>
                  {(["MUSYARAKAH", "MURABAHAH"] as const).map((a) => (
                    <button key={a} type="button" className={`${styles.akadBtn} ${akadType === a ? styles.akadBtnActive : ""}`} onClick={() => setAkadType(a)}>
                      <span className={styles.akadIcon}>{a === "MUSYARAKAH" ? <Handshake /> : <Clipboard />}</span>
                      <div>
                        <p className={styles.akadName}>{a}</p>
                        <p className={styles.akadDesc}>{a === "MUSYARAKAH" ? "Bagi hasil proporsional" : "Margin tetap syariah"}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Jumlah Investasi (Rp)</label>
                <div className={styles.amountInput}>
                  <span className={styles.amountPrefix}>Rp</span>
                  <input type="text" className={styles.input} placeholder="10,000,000"
                    value={amountNum ? amountNum.toLocaleString("id-ID") : ""}
                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} required />
                </div>
                <p className={styles.fieldHint}>Minimal investasi: Rp 1.000.000</p>
              </div>

              <button type="submit" className={styles.primaryBtn}>Lihat Simulasi Profit <ArrowRight style={{ verticalAlign: "-0.125em" }} /></button>
            </form>
          )}

          {step === "simulation" && selected && (
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>Simulasi Profit Sharing</h3>
              <div className={styles.simBox}>
                <div className={styles.simHeader}><span><Wallet /></span><div><p className={styles.simUmkm}>{selected.name}</p><p className={styles.simSub}>{akadType} • {selected.durationMonths} Bulan</p></div></div>
                <div className={styles.simGrid}>
                  <div className={styles.simItem}><span className={styles.simLabel}>Total Investasi</span><span className={styles.simVal}>{formatRp(amountNum)}</span></div>
                  <div className={styles.simItem}><span className={styles.simLabel}>Est. Gross Profit</span><span className={styles.simValGreen}>{formatRp(estProfit)}</span></div>
                  <div className={styles.simItem}><span className={styles.simLabel}>Platform Fee (2.5%)</span><span className={styles.simValRed}>- {formatRp(platformFee)}</span></div>
                  <div className={styles.simItem}><span className={styles.simLabel}>Net Profit Anda</span><span className={styles.simValBig}>{formatRp(netProfit)}</span></div>
                </div>
                <div className={styles.shariahNote}><CheckCircle style={{ verticalAlign: "-0.125em" }} /> Akad <strong>{akadType}</strong> sesuai prinsip syariah, bebas riba.</div>
              </div>
              <div className={styles.simActions}>
                <button className={styles.secondaryBtn} onClick={() => setStep("form")}><ArrowLeft style={{ verticalAlign: "-0.125em" }} /> Ubah</button>
                <button className={styles.primaryBtn} onClick={() => setStep("confirm")}>Konfirmasi Investasi <ArrowRight style={{ verticalAlign: "-0.125em" }} /></button>
              </div>
            </div>
          )}

          {step === "confirm" && selected && (
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>Konfirmasi Final</h3>
              <p className={styles.confirmDesc}>
                Dengan mengklik tombol di bawah, Anda menyetujui investasi senilai <strong>{formatRp(amountNum)}</strong> ke{" "}
                <strong>{selected.name}</strong> menggunakan akad <strong>{akadType}</strong>. Smart contract akan di-deploy di blockchain.
              </p>
              <div className={styles.confirmDetail}>
                <div className={styles.infoRow}><span>UMKM</span><span className={styles.infoVal}>{selected.name}</span></div>
                <div className={styles.infoRow}><span>Akad</span><span className={styles.infoVal}>{akadType}</span></div>
                <div className={styles.infoRow}><span>Nominal</span><span className={styles.infoVal}>{formatRp(amountNum)}</span></div>
                <div className={styles.infoRow}><span>Durasi</span><span className={styles.infoVal}>{selected.durationMonths} Bulan</span></div>
                <div className={styles.infoRow}><span>Est. ROI</span><span className={styles.infoVal}>{selected.estimatedRoi}%</span></div>
              </div>
              {hasPin === false && (
                <div className={styles.pinWarningBox}>
                  <Lock style={{ verticalAlign: "-0.125em" }} /> Anda belum mengatur PIN transaksi. Atur PIN terlebih dahulu di{" "}
                  <Link href="/investor/dashboard/profile" className={styles.pinWarningLink}>Profil &amp; Keamanan</Link> sebelum melanjutkan investasi.
                </div>
              )}

              {hasPin && (
                <div className={styles.field}>
                  <label className={styles.label}><Lock style={{ verticalAlign: "-0.125em" }} /> Masukkan PIN Transaksi</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    className={styles.pinInput}
                    placeholder="••••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                  <p className={styles.fieldHint}>PIN 6 digit yang Anda atur di menu Profil &amp; Keamanan.</p>
                </div>
              )}

              {error && <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>}
              <div className={styles.simActions}>
                <button className={styles.secondaryBtn} onClick={() => setStep("simulation")}><ArrowLeft style={{ verticalAlign: "-0.125em" }} /> Kembali</button>
                <button className={styles.primaryBtn} onClick={handleFinalConfirm} disabled={isSubmitting || !hasPin || pin.length !== 6}>
                  {isSubmitting ? "Memproses..." : <><CheckCircle style={{ verticalAlign: "-0.125em" }} /> Konfirmasi & Bayar</>}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={styles.successCard}>
          <div className={styles.successIcon}><Sparkles /></div>
          <h2 className={styles.successTitle}>Investasi Berhasil!</h2>
          <p className={styles.successDesc}>
            Investasi <strong>{formatRp(amountNum)}</strong> ke <strong>{selected?.name}</strong> telah dikonfirmasi.
            Smart contract sedang di-deploy di blockchain.
          </p>
          <div className={styles.txHash}>
            <span className={styles.txLabel}>Transaction Hash:</span>
            <span className={styles.txVal}>{result?.txHash}</span>
          </div>
          <button className={styles.primaryBtn} onClick={() => { setStep("form"); setAmount(""); setResult(null); }}>
            Investasi Lagi
          </button>
        </div>
      )}
    </div>
  );
}

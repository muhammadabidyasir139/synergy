"use client";

import { useState } from "react";
import styles from "./page.module.css";

type AkadType = "Musyarakah" | "Murabahah";

export default function InvestasiPage() {
  const [selectedUmkm, setSelectedUmkm] = useState("UMK-001");
  const [akadType, setAkadType] = useState<AkadType>("Musyarakah");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"form" | "simulation" | "confirm" | "success">("form");

  const umkmList = [
    { id: "UMK-001", name: "Toko Sembako Berkah", roi: "8-10%", duration: "12 Bulan", nisbah: "40:60" },
    { id: "UMK-002", name: "Kopi Nusantara Mandiri", roi: "7-9%", duration: "6 Bulan", nisbah: "35:65" },
    { id: "UMK-005", name: "Peternakan Sapi Makmur", roi: "11-14%", duration: "18 Bulan", nisbah: "45:55" },
  ];

  const selectedData = umkmList.find((u) => u.id === selectedUmkm)!;
  const amountNum = parseInt(amount.replace(/\D/g, "")) || 0;
  const minRoi = parseFloat(selectedData.roi.split("-")[0]) / 100;
  const maxRoi = parseFloat(selectedData.roi.split("-")[1]) / 100;
  const estProfitMin = Math.round(amountNum * minRoi);
  const estProfitMax = Math.round(amountNum * maxRoi);
  const platformFee = Math.round(amountNum * 0.025);
  const netMin = estProfitMin - platformFee;
  const netMax = estProfitMax - platformFee;

  const formatRp = (n: number) =>
    "Rp " + n.toLocaleString("id-ID");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setAmount(raw);
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountNum < 1000000) return alert("Minimal investasi Rp 1.000.000");
    setStep("simulation");
  };

  const handleConfirm = () => setStep("confirm");
  const handleFinalConfirm = () => setStep("success");

  return (
    <div className={styles.page}>
      {step !== "success" ? (
        <>
          {/* Progress Steps */}
          <div className={styles.steps}>
            {["Pilih & Input", "Simulasi Profit", "Konfirmasi"].map((s, i) => {
              const idx = i + 1;
              const active = step === "form" ? 1 : step === "simulation" ? 2 : 3;
              return (
                <div key={s} className={styles.stepItem}>
                  <div className={`${styles.stepCircle} ${active >= idx ? styles.stepActive : ""}`}>{idx}</div>
                  <span className={`${styles.stepLabel} ${active >= idx ? styles.stepLabelActive : ""}`}>{s}</span>
                  {i < 2 && <div className={`${styles.stepLine} ${active > idx ? styles.stepLineActive : ""}`}></div>}
                </div>
              );
            })}
          </div>

          {/* Form Step */}
          {step === "form" && (
            <form onSubmit={handleSimulate} className={styles.formCard}>
              <h3 className={styles.formTitle}>Pilih UMKM & Input Investasi</h3>

              <div className={styles.field}>
                <label className={styles.label}>Pilih UMKM</label>
                <select className={styles.select} value={selectedUmkm} onChange={(e) => setSelectedUmkm(e.target.value)}>
                  {umkmList.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} — ROI {u.roi}</option>
                  ))}
                </select>
              </div>

              <div className={styles.umkmInfoBox}>
                <div className={styles.infoRow}><span>Estimasi ROI</span><span className={styles.infoVal}>{selectedData.roi}</span></div>
                <div className={styles.infoRow}><span>Durasi</span><span className={styles.infoVal}>{selectedData.duration}</span></div>
                <div className={styles.infoRow}><span>Nisbah Bagi Hasil (Investor:UMKM)</span><span className={styles.infoVal}>{selectedData.nisbah}</span></div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Jenis Akad</label>
                <div className={styles.akadBtns}>
                  {(["Musyarakah", "Murabahah"] as AkadType[]).map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={`${styles.akadBtn} ${akadType === a ? styles.akadBtnActive : ""}`}
                      onClick={() => setAkadType(a)}
                    >
                      <span className={styles.akadIcon}>{a === "Musyarakah" ? "🤝" : "📋"}</span>
                      <div>
                        <p className={styles.akadName}>{a}</p>
                        <p className={styles.akadDesc}>
                          {a === "Musyarakah" ? "Bagi hasil proporsional" : "Margin tetap syariah"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Jumlah Investasi (Rp)</label>
                <div className={styles.amountInput}>
                  <span className={styles.amountPrefix}>Rp</span>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="10,000,000"
                    value={amount ? parseInt(amount).toLocaleString("id-ID") : ""}
                    onChange={handleAmountChange}
                    required
                  />
                </div>
                <p className={styles.fieldHint}>Minimal investasi: Rp 1.000.000</p>
              </div>

              <button type="submit" className={styles.primaryBtn}>
                Lihat Simulasi Profit →
              </button>
            </form>
          )}

          {/* Simulation Step */}
          {step === "simulation" && (
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>Simulasi Profit Sharing</h3>

              <div className={styles.simBox}>
                <div className={styles.simHeader}>
                  <span>💰</span>
                  <div>
                    <p className={styles.simUmkm}>{selectedData.name}</p>
                    <p className={styles.simSub}>{akadType} • {selectedData.duration}</p>
                  </div>
                </div>

                <div className={styles.simGrid}>
                  <div className={styles.simItem}>
                    <span className={styles.simLabel}>Total Investasi</span>
                    <span className={styles.simVal}>{formatRp(amountNum)}</span>
                  </div>
                  <div className={styles.simItem}>
                    <span className={styles.simLabel}>Est. Gross Profit</span>
                    <span className={styles.simValGreen}>{formatRp(estProfitMin)} – {formatRp(estProfitMax)}</span>
                  </div>
                  <div className={styles.simItem}>
                    <span className={styles.simLabel}>Platform Fee (2.5%)</span>
                    <span className={styles.simValRed}>- {formatRp(platformFee)}</span>
                  </div>
                  <div className={styles.simItem}>
                    <span className={styles.simLabel}>Net Profit Anda</span>
                    <span className={styles.simValBig}>{formatRp(netMin)} – {formatRp(netMax)}</span>
                  </div>
                </div>

                <div className={styles.shariahNote}>
                  ✅ Akad <strong>{akadType}</strong> sesuai prinsip syariah, bebas riba, diawasi Dewan Pengawas Syariah.
                </div>
              </div>

              <div className={styles.simActions}>
                <button className={styles.secondaryBtn} onClick={() => setStep("form")}>← Ubah</button>
                <button className={styles.primaryBtn} onClick={handleConfirm}>Konfirmasi Investasi →</button>
              </div>
            </div>
          )}

          {/* Confirm Step */}
          {step === "confirm" && (
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>Konfirmasi Final</h3>
              <p className={styles.confirmDesc}>
                Dengan mengklik tombol di bawah, Anda menyetujui investasi senilai <strong>{formatRp(amountNum)}</strong> ke{" "}
                <strong>{selectedData.name}</strong> menggunakan akad <strong>{akadType}</strong>. Smart contract akan di-deploy di blockchain.
              </p>

              <div className={styles.confirmDetail}>
                <div className={styles.infoRow}><span>UMKM</span><span className={styles.infoVal}>{selectedData.name}</span></div>
                <div className={styles.infoRow}><span>Akad</span><span className={styles.infoVal}>{akadType}</span></div>
                <div className={styles.infoRow}><span>Nominal</span><span className={styles.infoVal}>{formatRp(amountNum)}</span></div>
                <div className={styles.infoRow}><span>Durasi</span><span className={styles.infoVal}>{selectedData.duration}</span></div>
                <div className={styles.infoRow}><span>Est. ROI</span><span className={styles.infoVal}>{selectedData.roi}</span></div>
              </div>

              <div className={styles.simActions}>
                <button className={styles.secondaryBtn} onClick={() => setStep("simulation")}>← Kembali</button>
                <button className={styles.primaryBtn} onClick={handleFinalConfirm}>✅ Konfirmasi & Deploy Smart Contract</button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Success State */
        <div className={styles.successCard}>
          <div className={styles.successIcon}>🎉</div>
          <h2 className={styles.successTitle}>Investasi Berhasil!</h2>
          <p className={styles.successDesc}>
            Investasi <strong>{formatRp(amountNum)}</strong> ke <strong>{selectedData.name}</strong> telah dikonfirmasi.
            Smart contract sedang di-deploy di blockchain.
          </p>
          <div className={styles.txHash}>
            <span className={styles.txLabel}>Transaction Hash:</span>
            <span className={styles.txVal}>0x{Math.random().toString(16).slice(2, 10)}...blockchain</span>
          </div>
          <button className={styles.primaryBtn} onClick={() => setStep("form")}>
            Investasi Lagi
          </button>
        </div>
      )}
    </div>
  );
}

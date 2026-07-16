import styles from "../page.module.css";
import { db } from "@/lib/db";
import { Dot, CheckCircle, Flame, Megaphone, Zap, BookOpen } from "@/components/icons";

export default async function Campaign() {
  // Mengambil profile UMKM (menggunakan data pertama sebagai contoh sementara)
  const profile = await db.umkmProfile.findFirst();
  
  const campaignsData = profile ? await db.campaign.findMany({
    where: { umkmProfileId: profile.id },
    orderBy: { createdAt: "desc" }
  }) : [];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Campaign & Listing Marketplace</h1>
          <p className={styles.subtitle}>
            Halaman publik usaha Anda yang tampil di marketplace investor. Pantau progres funding Anda di sini.
          </p>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {campaignsData.map((c) => {
          const target = Number(c.targetAmount);
          const terkumpul = Number(c.collectedAmount);
          const progress = target > 0 ? Math.min((terkumpul / target) * 100, 100) : 0;
          
          let sisaWaktu = "0 hari";
          if (c.endDate) {
            const diffTime = Math.abs(c.endDate.getTime() - new Date().getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            sisaWaktu = c.endDate > new Date() ? `${diffDays} hari` : "Selesai";
          }

          return (
            <div key={c.id} className={`${styles.sectionCard} glass`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontFamily: "monospace", color: "var(--text-muted)", fontSize: "0.8rem" }}>{c.id}</span>
                    <span className={`${styles.badge} ${c.akadType === "MUSYARAKAH" ? styles.badgeGreen : styles.badgeBlue}`}>
                      {c.akadType === "MUSYARAKAH" ? "Musyarakah" : "Murabahah"}
                    </span>
                    <span className={`${styles.badge} ${c.status === "ACTIVE" ? styles.badgeYellow : styles.badgeGreen}`}>
                      {c.status === "ACTIVE" ? (
                        <><Dot color="#eab308" style={{ verticalAlign: "-0.125em" }} /> Open Funding</>
                      ) : (
                        <><CheckCircle style={{ verticalAlign: "-0.125em" }} /> Fully Funded</>
                      )}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-color)" }}>{c.title}</h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.5rem", lineHeight: 1.5 }}>{c.story}</p>
                </div>
              </div>

              {/* Progress */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Progress Dana Terkumpul</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#1d4ed8" }}>{progress.toFixed(0)}%</span>
                </div>
                <div className={styles.progressBar} style={{ height: 12 }}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  <span>Terkumpul: <strong style={{ color: "#1d4ed8" }}>Rp {terkumpul.toLocaleString("id-ID")}</strong></span>
                  <span>Target: <strong style={{ color: "var(--text-color)" }}>Rp {target.toLocaleString("id-ID")}</strong></span>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", padding: "1.25rem", background: "rgba(29,78,216,0.04)", borderRadius: 12, border: "1px solid rgba(29,78,216,0.1)" }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-color)" }}>{c.investorCount}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Investor</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-color)" }}>{c.estimatedRoi}%</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Nisbah/Margin</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: c.status === "ACTIVE" ? "#f59e0b" : "#1d4ed8" }}>{sisaWaktu}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Sisa Waktu</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1d4ed8" }}>
                    {progress >= 100 ? <CheckCircle /> : progress >= 75 ? <Flame /> : <Megaphone />}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Status</p>
                </div>
              </div>

              {c.status === "ACTIVE" && (
                <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "rgba(245,158,11,0.08)", borderRadius: 10, border: "1px solid rgba(245,158,11,0.15)", fontSize: "0.8rem", color: "var(--text-color)" }}>
                  <Zap style={{ verticalAlign: "-0.125em" }} /> Campaign ini <strong>aktif di marketplace investor</strong>. Investor dapat melihat dan berinvestasi ke usaha Anda.
                </div>
              )}
            </div>
          );
        })}
        {campaignsData.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            Belum ada campaign yang dibuat.
          </div>
        )}
      </div>

      {/* Story Bisnis */}
      <div className={`${styles.sectionCard} glass`}>
        <div className={styles.sectionHeader}>
          <h3><BookOpen style={{ verticalAlign: "-0.125em" }} /> Story Bisnis (Tampil di Marketplace)</h3>
          <span className={`${styles.badge} ${styles.badgeGreen}`}>Public</span>
        </div>
        <div style={{ fontSize: "0.95rem", color: "var(--text-color)", lineHeight: 1.75 }}>
          {profile?.businessDescription ? (
             <p>{profile.businessDescription}</p>
          ) : (
            <>
              <p>
                <strong>{profile?.businessName || "Toko Anda"}</strong> berdiri sejak 2019 di Jakarta Timur sebagai toko kelontong yang melayani kebutuhan sehari-hari masyarakat sekitar.
                Dengan pengalaman lebih dari 5 tahun, kami telah membangun kepercayaan lebih dari 500 pelanggan tetap.
              </p>
              <p style={{ marginTop: "0.75rem" }}>
                Melalui platform Synergy, kami bertekad untuk berkembang lebih jauh dengan modal syariah yang transparan dan berkah,
                membuktikan bahwa UMKM lokal pun bisa bertumbuh bersama ekosistem investasi berbasis teknologi.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

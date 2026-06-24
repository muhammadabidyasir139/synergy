"use client";

import styles from "../page.module.css";

export default function Campaign() {
  const campaigns = [
    {
      id: "CMP-042",
      judul: "Pengembangan Toko Berkah Jaya – Ekspansi Stok & Renovasi",
      akad: "Musyarakah",
      target: 100000000,
      terkumpul: 75000000,
      investors: 8,
      sisa: "25 hari",
      status: "Open",
      nisbah: "70:30",
      deskripsi: "Dana digunakan untuk penambahan stok barang dagangan premium dan renovasi area display toko agar lebih modern dan nyaman.",
    },
    {
      id: "CMP-038",
      judul: "Pembelian Peralatan Dagang Baru",
      akad: "Murabahah",
      target: 50000000,
      terkumpul: 50000000,
      investors: 5,
      sisa: "0 hari",
      status: "Fully Funded",
      nisbah: "Fixed 1.5%/bln",
      deskripsi: "Pembelian timbangan digital, rak display, dan mesin kasir modern untuk meningkatkan efisiensi operasional.",
    },
  ];

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
        {campaigns.map((c) => {
          const progress = Math.min((c.terkumpul / c.target) * 100, 100);
          return (
            <div key={c.id} className={`${styles.sectionCard} glass`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontFamily: "monospace", color: "var(--text-muted)", fontSize: "0.8rem" }}>{c.id}</span>
                    <span className={`${styles.badge} ${c.akad === "Musyarakah" ? styles.badgeGreen : styles.badgeBlue}`}>{c.akad}</span>
                    <span className={`${styles.badge} ${c.status === "Open" ? styles.badgeYellow : styles.badgeGreen}`}>
                      {c.status === "Open" ? "🟡 Open Funding" : "✅ Fully Funded"}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-color)" }}>{c.judul}</h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.5rem", lineHeight: 1.5 }}>{c.deskripsi}</p>
                </div>
              </div>

              {/* Progress */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Progress Dana Terkumpul</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#10b981" }}>{progress.toFixed(0)}%</span>
                </div>
                <div className={styles.progressBar} style={{ height: 12 }}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  <span>Terkumpul: <strong style={{ color: "#10b981" }}>Rp {c.terkumpul.toLocaleString("id-ID")}</strong></span>
                  <span>Target: <strong style={{ color: "var(--text-color)" }}>Rp {c.target.toLocaleString("id-ID")}</strong></span>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", padding: "1.25rem", background: "rgba(16,185,129,0.04)", borderRadius: 12, border: "1px solid rgba(16,185,129,0.1)" }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-color)" }}>{c.investors}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Investor</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-color)" }}>{c.nisbah}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Nisbah/Margin</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: c.status === "Open" ? "#f59e0b" : "#10b981" }}>{c.sisa}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Sisa Waktu</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981" }}>
                    {progress >= 100 ? "✅" : progress >= 75 ? "🔥" : "📣"}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Status</p>
                </div>
              </div>

              {c.status === "Open" && (
                <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "rgba(245,158,11,0.08)", borderRadius: 10, border: "1px solid rgba(245,158,11,0.15)", fontSize: "0.8rem", color: "var(--text-color)" }}>
                  ⚡ Campaign ini <strong>aktif di marketplace investor</strong>. Investor dapat melihat dan berinvestasi ke usaha Anda.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Story Bisnis */}
      <div className={`${styles.sectionCard} glass`}>
        <div className={styles.sectionHeader}>
          <h3>📖 Story Bisnis (Tampil di Marketplace)</h3>
          <span className={`${styles.badge} ${styles.badgeGreen}`}>Public</span>
        </div>
        <div style={{ fontSize: "0.95rem", color: "var(--text-color)", lineHeight: 1.75 }}>
          <p>
            <strong>Toko Berkah Jaya</strong> berdiri sejak 2019 di Jakarta Timur sebagai toko kelontong yang melayani kebutuhan sehari-hari masyarakat sekitar.
            Dengan pengalaman lebih dari 5 tahun, kami telah membangun kepercayaan lebih dari 500 pelanggan tetap.
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            Melalui platform Synergy, kami bertekad untuk berkembang lebih jauh dengan modal syariah yang transparan dan berkah,
            membuktikan bahwa UMKM lokal pun bisa bertumbuh bersama ekosistem investasi berbasis teknologi.
          </p>
        </div>
      </div>
    </div>
  );
}

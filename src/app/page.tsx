import Navbar from "@/components/Navbar";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      
      <main className={styles.main}>
        {/* Floating animated background orbs */}
        <div className={styles.orbContainer}>
          <div className={`${styles.orb} ${styles.orb1}`}></div>
          <div className={`${styles.orb} ${styles.orb2}`}></div>
          <div className={`${styles.orb} ${styles.orb3}`}></div>
        </div>

        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>Inovasi PKM KC 2026</div>
            <h1 className={styles.title}>
              Pembiayaan Syariah Cerdas <br />
              berbasis <span className={styles.gradientText}>AI & Blockchain</span>
            </h1>
            <p className={styles.subtitle}>
              SYNERGY mengintegrasikan teknologi <strong>XGBoost</strong> untuk kelayakan UMKM dan <strong>Smart Contract</strong> untuk keamanan transaksi dengan Akad Musyarakah & Mudharabah. Solusi Financing Gap yang adil dan transparan.
            </p>
            
            <div className={styles.ctaGroup}>
              <Link href="/auth/register?role=investor" className={styles.btnPrimary}>
                Mulai Pendanaan
              </Link>
              <Link href="/auth/register?role=umkm" className={styles.btnSecondary}>
                Ajukan Modal UMKM
              </Link>
              <Link href="/admin/login" className={styles.btnSecondary}>
                Portal Admin
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="fitur" className={styles.features}>
          <div className={styles.featureHeader}>
            <h2>Keunggulan SYNERGY</h2>
            <p>Ekosistem pembiayaan yang lebih adil, transparan, aman, dan berkelanjutan.</p>
          </div>

          <div className={styles.grid}>
            {/* Feature 1 */}
            <div className={`${styles.card} glass`}>
              <div className={styles.iconWrapper}>🤖</div>
              <h3>AI Feasibility Scoring</h3>
              <p>
                Menggunakan algoritma <strong>Extreme Gradient Boosting (XGBoost)</strong> berbasis Python. Menganalisis data transaksi, listrik, dan arus kas untuk skor kelayakan yang cepat, objektif, dan akurat.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`${styles.card} glass`}>
              <div className={styles.iconWrapper}>⛓️</div>
              <h3>Smart Contract Blockchain</h3>
              <p>
                Transaksi dicatat menggunakan bahasa <strong>Golang</strong> ke dalam jaringan <em>Blockchain</em>. Data tersimpan di <em>Ledger</em> masing-masing pengguna, sehingga 100% transparan dan anti-manipulasi.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`${styles.card} glass`}>
              <div className={styles.iconWrapper}>⚖️</div>
              <h3>Akad Syariah Digital</h3>
              <p>
                Terintegrasi dengan sistem <strong>Musyarakah & Mudharabah</strong> yang didigitalisasikan, memastikan seluruh proses investasi selaras dengan prinsip-prinsip ekonomi Islam.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.brand}>SYNERGY PKM KC</div>
          <p>© 2026 Tim Synergy. Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </>
  );
}

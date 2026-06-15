import Link from "next/link";
import styles from "./HeroSection.module.css";

function NeuronSvg({ className }: { className?: string }) {
  return (
    <svg className={className} width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="18" fill="rgba(47,134,255,.07)" />
      <circle cx="60" cy="60" r="7" fill="#2f86ff" opacity=".85" />
      <line x1="60" y1="60" x2="18" y2="18" stroke="#2f86ff" strokeWidth="1.5" opacity=".45" />
      <line x1="60" y1="60" x2="102" y2="18" stroke="#2f86ff" strokeWidth="1.5" opacity=".45" />
      <line x1="60" y1="60" x2="18" y2="102" stroke="#2f86ff" strokeWidth="1.5" opacity=".45" />
      <line x1="60" y1="60" x2="102" y2="102" stroke="#2f86ff" strokeWidth="1.5" opacity=".45" />
      <line x1="60" y1="60" x2="60"  y2="8"   stroke="#2f86ff" strokeWidth="1.2" opacity=".35" />
      <line x1="60" y1="60" x2="8"   y2="60"  stroke="#2f86ff" strokeWidth="1.2" opacity=".35" />
      <circle cx="18"  cy="18"  r="4.5" fill="#2f86ff" opacity=".5" />
      <circle cx="102" cy="18"  r="4.5" fill="#2f86ff" opacity=".5" />
      <circle cx="18"  cy="102" r="4.5" fill="#2f86ff" opacity=".5" />
      <circle cx="102" cy="102" r="4.5" fill="#2f86ff" opacity=".5" />
      <circle cx="60"  cy="8"   r="3"   fill="#2f86ff" opacity=".38" />
      <circle cx="8"   cy="60"  r="3"   fill="#2f86ff" opacity=".38" />
    </svg>
  );
}

function BarChartSvg({ className }: { className?: string }) {
  return (
    <svg className={className} width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="16" y1="80" x2="80" y2="80" stroke="#2f86ff" strokeWidth="1.2" opacity=".4" />
      <line x1="16" y1="16" x2="16" y2="80" stroke="#2f86ff" strokeWidth="1.2" opacity=".4" />
      <line x1="16" y1="58" x2="80" y2="58" stroke="#2f86ff" strokeWidth="0.7" opacity=".2" strokeDasharray="4 4" />
      <line x1="16" y1="38" x2="80" y2="38" stroke="#2f86ff" strokeWidth="0.7" opacity=".2" strokeDasharray="4 4" />
      <rect x="24" y="52" width="12" height="28" rx="2" fill="#2f86ff" opacity=".45" />
      <rect x="42" y="38" width="12" height="42" rx="2" fill="#2f86ff" opacity=".7" />
      <rect x="60" y="24" width="12" height="56" rx="2" fill="#2f86ff" opacity=".55" />
      <polyline points="30,54 48,40 66,28" stroke="#2f86ff" strokeWidth="1.8" fill="none" opacity=".7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="54" r="2.5" fill="#2f86ff" opacity=".8" />
      <circle cx="48" cy="40" r="2.5" fill="#2f86ff" opacity=".8" />
      <circle cx="66" cy="28" r="2.5" fill="#2f86ff" opacity=".8" />
    </svg>
  );
}

export default function HeroSection() {
  return (
    <section className={styles.hero}>

      {/* ── Tunnel perspective grids ── */}
      <div className={styles.tunnelWrap}>
        <div className={styles.floorGlow} />
        <div className={styles.floorCore} />
        <div className={styles.ceilGlow} />
        <div className={styles.ceilCore} />
      </div>

      {/* ── Central horizon bloom ── */}
      <div className={styles.bloom} />
      <div className={styles.bloomDot} />

      {/* ── Corner floating nodes ── */}
      <div className={`${styles.node} ${styles.nodeTL}`}>
        <NeuronSvg className={styles.nodeSvg} />
      </div>
      <div className={`${styles.node} ${styles.nodeTR}`}>
        <BarChartSvg className={`${styles.nodeSvg} ${styles.nodeSvg2}`} />
      </div>
      <div className={`${styles.node} ${styles.nodeBL}`}>
        <NeuronSvg className={`${styles.nodeSvg} ${styles.nodeSvg3}`} />
      </div>
      <div className={`${styles.node} ${styles.nodeBR}`}>
        <BarChartSvg className={`${styles.nodeSvg} ${styles.nodeSvg4}`} />
      </div>

      {/* ── Soft vignette ── */}
      <div className={styles.vignette} />

      {/* ── Hero text ── */}
      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <span className={styles.badgeText}>INOVASI PKM-KC 2026</span>
        </div>

        <h1 className={styles.title}>
          Pembiayaan UMKM<br />
          <span className={styles.titleAccent}>Lebih Cerdas &amp; Adil</span><br />
          dengan AI &amp; Blockchain
        </h1>

        <p className={styles.subtitle}>
          Ekosistem syariah berbasis <strong>Hyperledger Fabric</strong> dan{" "}
          <strong>XGBoost AI</strong> yang menjembatani investor dengan UMKM
          secara transparan, inklusif, dan sesuai prinsip Islam.
        </p>

        <div className={styles.ctaGroup}>
          <Link href="/auth/register" className={styles.btnPrimary}>
            Mulai Sekarang
          </Link>
          <Link href="#fitur" className={styles.btnSecondary}>
            Pelajari Fitur
          </Link>
        </div>
      </div>

    </section>
  );
}

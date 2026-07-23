import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ParticleField from "@/components/ParticleField";
import TeamLightbox from "@/components/TeamLightbox";
import NewsCarousel from "@/components/NewsCarousel";
import CursorAura from "@/components/CursorAura";
import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ScrollReveal";
import { AlertTriangle, Lightbulb } from "@/components/icons";

const teamMembers = [
  {
    name: "Muhammad Abid Yasir",
    role: "Project Leader & Blockchain Developer",
    dept: "Teknologi Informasi",
    photo: "/source/Abid.JPG",
    ig: "https://www.instagram.com/a_biedz/",
  },
  {
    name: "Muhammad Akmal Taufansyah",
    role: "Fullstack Developer & Public Relations",
    dept: "Teknologi Informasi",
    photo: "/source/Akmal.JPG",
    ig: "https://www.instagram.com/akmaalsyh/",
  },
  {
    name: "Husna Kamila Syahida",
    role: "AI Engineer & Administrative",
    dept: "Teknologi Informasi",
    photo: "/source/husna.jpeg",
    ig: "https://www.instagram.com/husnkmla/",
  },
  {
    name: "Nandyra Dwi Azzahra",
    role: "Finance & Product Sharia Developer",
    dept: "Ekonomi Syariah",
    photo: "/source/nandira.JPG",
    ig: "https://www.instagram.com/zha.azzhr_/",
  },
  {
    name: "Muhammad Dafa Fachrul Annas Pambudi",
    role: "Strategic Economist & Creative Media",
    dept: "Ilmu Ekonomi",
    photo: "/source/dafa.JPG",
    ig: "https://www.instagram.com/dafafachrul/",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <ParticleField />
      <CursorAura />

      <main className={styles.main}>
        {/* Animated background orbs */}
        <div className={styles.orbContainer}>
          <div className={`${styles.orb} ${styles.orb1}`}></div>
          <div className={`${styles.orb} ${styles.orb2}`}></div>
          <div className={`${styles.orb} ${styles.orb3}`}></div>
        </div>

        <HeroSection />

        {/* ── Problem & Solution Section ── */}
        <section id="teknologi" className={styles.problem}>
          <ScrollReveal>
            <div className={styles.problemInner}>
              <span className={styles.sectionLabel}>Masalah &amp; Solusi</span>
              <h2 className={styles.sectionTitle}>
                Mengapa Indonesia Butuh SYNERGY?
              </h2>
              <p className={styles.sectionSubtitle}>
                Sektor UMKM adalah pilar penting mencapai target pertumbuhan
                ekonomi nasional sebesar 8%, namun tiga hambatan kritis
                menghambat inklusivitas keuangan.
              </p>

              <div className={styles.statsGrid}>
                <div className={`${styles.statCard} glass`}>
                  <div className={styles.statNumber}>Rp2.400 T</div>
                  <div className={styles.statLabel}>Financing Gap</div>
                  <p className={styles.statDesc}>
                    Angka kesenjangan modal yang masif bagi pelaku UMKM di
                    Indonesia akibat kendala administratif dan agunan formal
                    (unbankable).
                  </p>
                </div>
                <div className={`${styles.statCard} glass`}>
                  <div className={styles.statNumber}><AlertTriangle style={{ verticalAlign: "-0.125em" }} /> Risiko</div>
                  <div className={styles.statLabel}>Sentralisasi Data</div>
                  <p className={styles.statDesc}>
                    Sistem perbankan konvensional rawan terhadap kegagalan
                    sistem tunggal dan ancaman kebocoran data terpusat.
                  </p>
                </div>
                <div className={`${styles.statCard} glass`}>
                  <div className={styles.statNumber}>0%</div>
                  <div className={styles.statLabel}>Sistem Kredit Inklusif</div>
                  <p className={styles.statDesc}>
                    Belum adanya sistem penilaian risiko otomatis yang
                    transparan dan inklusif bagi pelaku usaha tanpa riwayat
                    kredit bank.
                  </p>
                </div>
              </div>

              <div className={`${styles.solutionBox} glass`}>
                <div className={styles.solutionIcon}><Lightbulb /></div>
                <div>
                  <h3>Solusi SYNERGY</h3>
                  <p>
                    SYNERGY hadir sebagai solusi inovatif: memangkas kesenjangan
                    tersebut melalui ekosistem pembiayaan syariah berbasis{" "}
                    <strong>Blockchain</strong> yang aman, serta skoring
                    kelayakan UMKM yang akurat menggunakan{" "}
                    <strong>AI (XGBoost)</strong> demi mewujudkan pemerataan
                    ekonomi digital yang transparan.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ── Features Section ── */}
        <section id="fitur" className={styles.features}>
          <div className={styles.featuresInner}>
            <ScrollReveal>
              <span className={styles.sectionLabel}>Keunggulan Platform</span>
              <h2 className={styles.sectionTitle}>Teknologi Inti SYNERGY</h2>
              <p className={styles.sectionSubtitle}>
                Ekosistem pembiayaan yang lebih adil, transparan, aman, dan
                berkelanjutan.
              </p>
            </ScrollReveal>

            <div className={styles.featureGrid}>
              {/* AI Scoring */}
              <ScrollReveal duration={1.5} delay={0}>
                <div className={`${styles.featureCard} glass`}>
                  <div className={styles.featureIconWrap}>
                    <svg
                      viewBox="0 0 48 48"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      width="44"
                      height="44"
                    >
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="#00D2FF"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M24 10 C24 10 34 17 34 24 C34 31 24 38 24 38 C24 38 14 31 14 24 C14 17 24 10 24 10Z"
                        stroke="#00D2FF"
                        strokeWidth="1.4"
                        fill="none"
                        opacity="0.5"
                      />
                      <circle cx="24" cy="24" r="3.5" fill="#00D2FF" />
                      <line
                        x1="24"
                        y1="12"
                        x2="24"
                        y2="17"
                        stroke="#00D2FF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <line
                        x1="24"
                        y1="31"
                        x2="24"
                        y2="36"
                        stroke="#00D2FF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <line
                        x1="12"
                        y1="24"
                        x2="17"
                        y2="24"
                        stroke="#00D2FF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <line
                        x1="31"
                        y1="24"
                        x2="36"
                        y2="24"
                        stroke="#00D2FF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <line
                        x1="15.5"
                        y1="15.5"
                        x2="19"
                        y2="19"
                        stroke="#00D2FF"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        opacity="0.7"
                      />
                      <line
                        x1="29"
                        y1="29"
                        x2="32.5"
                        y2="32.5"
                        stroke="#00D2FF"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        opacity="0.7"
                      />
                    </svg>
                  </div>
                  <h3>AI Feasibility Scoring</h3>
                  <p>
                    Menggunakan algoritma{" "}
                    <strong>Extreme Gradient Boosting (XGBoost)</strong>{" "}
                    berbasis Python. Menganalisis data transaksi, listrik, dan
                    arus kas untuk skor kelayakan yang cepat, objektif, dan
                    akurat.
                  </p>
                </div>
              </ScrollReveal>

              {/* Smart Contract */}
              <ScrollReveal duration={1.5} delay={0.2}>
                <div className={`${styles.featureCard} glass`}>
                  <div className={styles.featureIconWrap}>
                    <svg
                      viewBox="0 0 48 48"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      width="44"
                      height="44"
                    >
                      <rect
                        x="9"
                        y="19"
                        width="12"
                        height="10"
                        rx="3"
                        stroke="#00D2FF"
                        strokeWidth="1.8"
                      />
                      <rect
                        x="27"
                        y="19"
                        width="12"
                        height="10"
                        rx="3"
                        stroke="#00D2FF"
                        strokeWidth="1.8"
                      />
                      <rect
                        x="18"
                        y="7"
                        width="12"
                        height="10"
                        rx="3"
                        stroke="#00D2FF"
                        strokeWidth="1.8"
                      />
                      <rect
                        x="18"
                        y="31"
                        width="12"
                        height="10"
                        rx="3"
                        stroke="#00D2FF"
                        strokeWidth="1.8"
                      />
                      <line
                        x1="24"
                        y1="17"
                        x2="21"
                        y2="19"
                        stroke="#00D2FF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <line
                        x1="24"
                        y1="17"
                        x2="27"
                        y2="19"
                        stroke="#00D2FF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <line
                        x1="21"
                        y1="29"
                        x2="24"
                        y2="31"
                        stroke="#00D2FF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <line
                        x1="27"
                        y1="29"
                        x2="24"
                        y2="31"
                        stroke="#00D2FF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <line
                        x1="21"
                        y1="24"
                        x2="9"
                        y2="24"
                        stroke="#00D2FF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <line
                        x1="27"
                        y1="24"
                        x2="39"
                        y2="24"
                        stroke="#00D2FF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="9"
                        cy="24"
                        r="2"
                        fill="#00D2FF"
                        opacity="0.6"
                      />
                      <circle
                        cx="39"
                        cy="24"
                        r="2"
                        fill="#00D2FF"
                        opacity="0.6"
                      />
                    </svg>
                  </div>
                  <h3>Smart Contract Blockchain</h3>
                  <p>
                    Transaksi dicatat menggunakan bahasa <strong>Golang</strong>{" "}
                    ke dalam jaringan <em>Blockchain</em>. Data tersimpan di{" "}
                    <em>Ledger</em> masing-masing pengguna, sehingga 100%
                    transparan dan anti-manipulasi.
                  </p>
                </div>
              </ScrollReveal>

              {/* Akad Syariah */}
              <ScrollReveal duration={1.5} delay={0.4}>
                <div className={`${styles.featureCard} glass`} id="akad">
                  <div className={styles.featureIconWrap}>
                    <svg
                      viewBox="0 0 48 48"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      width="44"
                      height="44"
                    >
                      <path
                        d="M24 6 L38 14 L38 28 C38 36 24 42 24 42 C24 42 10 36 10 28 L10 14 Z"
                        stroke="#00D2FF"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18 24 L22 28 L30 20"
                        stroke="#00D2FF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="10"
                        stroke="#00D2FF"
                        strokeWidth="0.8"
                        opacity="0.3"
                      />
                    </svg>
                  </div>
                  <h3>Akad Syariah Digital</h3>
                  <p>
                    Terintegrasi dengan sistem{" "}
                    <strong>Musyarakah &amp; Mudharabah</strong> yang
                    didigitalisasikan, memastikan seluruh proses investasi
                    selaras dengan prinsip-prinsip ekonomi Islam.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── News Section ── */}
        <ScrollReveal>
          <NewsCarousel />
        </ScrollReveal>

        {/* ── Tentang Kami & Penggagas (gabungan, sebelum footer) ── */}
        <section id="tentang" className={styles.team}>
          <ScrollReveal>
            <div className={styles.teamInner} id="tim">
              <span className={styles.sectionLabel}>PKM Karsa Cipta 2026</span>
              <h2 className={styles.sectionTitle}>Tentang Kami</h2>
              <p className={styles.sectionSubtitle}>
                SYNERGY lahir dari kompetisi{" "}
                <strong>PKM (Pekan Kreativitas Mahasiswa)</strong> skema{" "}
                <strong>Karsa Cipta</strong> — memadukan{" "}
                <strong>Blockchain</strong>, <strong>Kecerdasan Buatan</strong>,
                dan <strong>ekonomi syariah</strong> melalui akad{" "}
                <em>Musyarakah</em> dan <em>Mudharabah</em> untuk pembiayaan UMKM.
                Kami hadir sebagai solusi bagi UMKM <em>unbankable</em> agar dapat
                memperoleh pembiayaan yang adil, transparan, dan berbasis
                teknologi mutakhir.
              </p>
              <div
                className={styles.tagGroup}
                style={{ justifyContent: "center" }}
              >
                <span className={styles.tag}>PKM-KC 2026</span>
                <span className={styles.tag}>Blockchain</span>
                <span className={styles.tag}>AI / XGBoost</span>
                <span className={styles.tag}>Ekonomi Syariah</span>
              </div>

              <div style={{ marginTop: "4rem" }}>
                <TeamLightbox
                  advisor={{
                    name: "Prof. Ir. Slamet Riyadi, S.T., M.Sc., Ph.D.",
                    title: "Dosen Pendamping PKM-KC 2026",
                    role: "Dosen Pendamping",
                    dept: "Teknik Elektro & Informatika",
                    photo: "/source/Prof Slamet.png",
                    ig: "https://www.instagram.com/theslam.id/",
                  }}
                  members={teamMembers}
                />
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <ScrollReveal>
          <div className={styles.footerInner}>
            <div className={styles.footerTop}>
              {/* Brand */}
              <div className={styles.footerBrand}>
                {/* Part of */}
                <div className={styles.footerPartOf}>
                  <span className={styles.partOfLabel}>Part of:</span>
                  <Image
                    src="/source/logo umy.png"
                    alt="Universitas Muhammadiyah Yogyakarta"
                    width={80}
                    height={80}
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <p>
                  Ekosistem pembiayaan syariah berbasis AI &amp; Blockchain
                  untuk UMKM Indonesia yang inklusif dan transparan.
                </p>
                <div className={styles.socialLinks}>
                  <a
                    href="https://www.instagram.com/pkmkc.synergy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      width="18"
                      height="18"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle
                        cx="17.5"
                        cy="6.5"
                        r="0.8"
                        fill="currentColor"
                        strokeWidth="0"
                      />
                    </svg>
                    @pkmkc.synergy
                  </a>
                  <a
                    href="https://www.tiktok.com/@pkmkc.synergy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="18"
                      height="18"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.49a8.18 8.18 0 0 0 4.78 1.53V6.57a4.85 4.85 0 0 1-1.01.12z" />
                    </svg>
                    @pkmkc.synergy
                  </a>
                </div>
              </div>

              {/* Nav links */}
              <div className={styles.footerLinks}>
                <h4>Platform</h4>
                <Link href="#fitur">Fitur</Link>
                <Link href="#teknologi">Teknologi</Link>
                <Link href="#akad">Akad Syariah</Link>
                <Link href="/auth/login">Masuk</Link>
                <Link href="/auth/register">Daftar</Link>
              </div>

              <div className={styles.footerLinks}>
                <h4>Tentang</h4>
                <Link href="#tentang">Tentang Kami</Link>
                <Link href="#tim">Tim</Link>
                <a
                  href="https://www.instagram.com/pkmkc.synergy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
                <a
                  href="https://www.tiktok.com/@pkmkc.synergy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  TikTok
                </a>
              </div>
            </div>

            {/* Supported by */}
            <div className={styles.footerLogos}>
              <span className={styles.supportedBy}>Supported by:</span>
              <div className={styles.partnerLogos}>
                <Image
                  src="/source/Primary_Horizontal Logo.png"
                  alt="Synergy PKM KC"
                  width={130}
                  height={40}
                  style={{ objectFit: "contain" }}
                />
                <Image
                  src="/source/logo simbelmawa.png"
                  alt="Simbelmawa"
                  width={80}
                  height={52}
                  style={{ objectFit: "contain" }}
                />
                <Image
                  src="/source/Logo-Tut-Wuri-Handayani-PNG-Warna.png"
                  alt="Tut Wuri Handayani"
                  width={52}
                  height={52}
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>

            <div className={styles.footerBottom}>
              <p>
                © 2026 Tim SYNERGY PKM-KC — Universitas Muhammadiyah Yogyakarta.
                Hak Cipta Dilindungi.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </footer>
    </>
  );
}

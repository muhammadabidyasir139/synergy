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

        {/* ── Masalah & Solusi Section ── */}
        <section id="masalah" className={styles.problem}>
          <ScrollReveal>
            <div className={styles.problemInner}>
              <span className={styles.sectionLabel}>Latar Belakang</span>
              <h2 className={styles.sectionTitle}>Masalah &amp; Solusi</h2>
              <p className={styles.sectionSubtitle}>
                Sektor UMKM adalah pilar utama ekonomi nasional, namun tantangan aksesibilitas modal masih menjadi hambatan terbesar.
              </p>

              <div className={styles.statsGrid}>
                <div className={`${styles.statCard} glass`}>
                  <div className={styles.statNumber}>Rp2.400 T</div>
                  <div className={styles.statLabel}>Financing Gap</div>
                  <p className={styles.statDesc}>
                    Kesenjangan pendanaan yang dihadapi pelaku UMKM di Indonesia akibat belum memenuhi standar agunan formal bank.
                  </p>
                </div>
                <div className={`${styles.statCard} glass`}>
                  <div className={styles.statNumber}><AlertTriangle style={{ verticalAlign: "-0.125em" }} /> Risiko</div>
                  <div className={styles.statLabel}>Sentralisasi Data</div>
                  <p className={styles.statDesc}>
                    Sistem perbankan terpusat memiliki risiko kegagalan sistem tunggal serta ancaman manipulasi data.
                  </p>
                </div>
                <div className={`${styles.statCard} glass`}>
                  <div className={styles.statNumber}>0%</div>
                  <div className={styles.statLabel}>Sistem Inklusif</div>
                  <p className={styles.statDesc}>
                    Keterbatasan instrumen penilaian risiko otomatis bagi UMKM tanpa riwayat kredit perbankan resmi.
                  </p>
                </div>
              </div>

              <div className={`${styles.solutionBox} glass`}>
                <div className={styles.solutionIcon}><Lightbulb /></div>
                <div>
                  <h3>Solusi SYNERGY</h3>
                  <p>
                    SYNERGY hadir memangkas kesenjangan tersebut melalui ekosistem pembiayaan syariah berbasis <strong>Blockchain</strong> yang transparan serta skoring kelayakan presisi tinggi dengan <strong>AI (XGBoost)</strong>.
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
              <span className={styles.sectionLabel}>Platform SYNERGY</span>
              <h2 className={styles.sectionTitle}>Keunggulan & Fitur Utama</h2>
              <p className={styles.sectionSubtitle}>
                Solusi terlengkap yang menggabungkan kecerdasan buatan, keamanan blockchain, dan skema syariah murni untuk pemberdayaan UMKM Indonesia.
              </p>
            </ScrollReveal>

            <div className={styles.featureGrid}>
              <div className={`${styles.featureCard} glass`}>
                <div className={styles.featureIconWrap}>
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
                    <circle cx="24" cy="24" r="20" stroke="#00D2FF" strokeWidth="1.8" />
                    <circle cx="24" cy="24" r="5" fill="#00D2FF" />
                  </svg>
                </div>
                <h3>Penilaian Kelayakan Otomatis</h3>
                <p>
                  Proses evaluasi UMKM cepat dan inklusif berdasarkan analitik data usaha tanpa syarat agunan formal perbankan konvensional.
                </p>
              </div>

              <div className={`${styles.featureCard} glass`}>
                <div className={styles.featureIconWrap}>
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
                    <rect x="10" y="14" width="28" height="20" rx="3" stroke="#00D2FF" strokeWidth="1.8" />
                  </svg>
                </div>
                <h3>Pencatatan Transparan & Immutable</h3>
                <p>
                  Setiap pendanaan dan distribusi hasil tersimpan secara permanen pada ledger terdistribusi yang aman dari kecurangan.
                </p>
              </div>

              <div className={`${styles.featureCard} glass`}>
                <div className={styles.featureIconWrap}>
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
                    <path d="M24 6 L38 14 L38 28 C38 36 24 42 24 42 Z" stroke="#00D2FF" strokeWidth="1.8" />
                  </svg>
                </div>
                <h3>Bagi Hasil Bebas Riba</h3>
                <p>
                  Sistem investasi yang adil dan transparan dengan bagi hasil berbasis nisbah realisasi keuntungan usaha.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Teknologi Section ── */}
        <section id="teknologi" className={styles.teknologi}>
          <div className={styles.featuresInner}>
            <ScrollReveal>
              <span className={styles.sectionLabel}>Arsitektur Sistem</span>
              <h2 className={styles.sectionTitle}>Teknologi Inti SYNERGY</h2>
              <p className={styles.sectionSubtitle}>
                Perpaduan Machine Learning dan Blockchain untuk keamanan serta objektivitas keputusan keuangan.
              </p>
            </ScrollReveal>

            <div className={styles.featureGrid}>
              {/* AI Scoring */}
              <ScrollReveal duration={1.2} delay={0}>
                <div className={`${styles.featureCard} glass`}>
                  <div className={styles.featureIconWrap}>
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
                      <circle cx="24" cy="24" r="20" stroke="#00D2FF" strokeWidth="1.8" />
                      <path d="M24 10 C24 10 34 17 34 24 C34 31 24 38 24 38 C24 38 14 31 14 24 C14 17 24 10 24 10Z" stroke="#00D2FF" strokeWidth="1.4" fill="none" opacity="0.5" />
                      <circle cx="24" cy="24" r="3.5" fill="#00D2FF" />
                      <line x1="24" y1="12" x2="24" y2="17" stroke="#00D2FF" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="24" y1="31" x2="24" y2="36" stroke="#00D2FF" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="12" y1="24" x2="17" y2="24" stroke="#00D2FF" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="31" y1="24" x2="36" y2="24" stroke="#00D2FF" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3>AI Feasibility Scoring</h3>
                  <p>
                    Algoritma <strong>Extreme Gradient Boosting (XGBoost)</strong> berbasis Python yang mengevaluasi data operasional, arus kas, dan variabel bisnis secara objektif.
                  </p>
                </div>
              </ScrollReveal>

              {/* Smart Contract */}
              <ScrollReveal duration={1.2} delay={0.2}>
                <div className={`${styles.featureCard} glass`}>
                  <div className={styles.featureIconWrap}>
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
                      <rect x="9" y="19" width="12" height="10" rx="3" stroke="#00D2FF" strokeWidth="1.8" />
                      <rect x="27" y="19" width="12" height="10" rx="3" stroke="#00D2FF" strokeWidth="1.8" />
                      <rect x="18" y="7" width="12" height="10" rx="3" stroke="#00D2FF" strokeWidth="1.8" />
                      <rect x="18" y="31" width="12" height="10" rx="3" stroke="#00D2FF" strokeWidth="1.8" />
                    </svg>
                  </div>
                  <h3>Smart Contract Blockchain</h3>
                  <p>
                    Kontrak pintar berbasis <strong>Golang / Hyperledger Fabric</strong>. Menyimpan persetujuan dan riwayat transaksi secara aman, transparan, dan anti-tamper.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── Akad Syariah Section ── */}
        <section id="akad" className={styles.akad}>
          <ScrollReveal>
            <div className={styles.problemInner}>
              <span className={styles.sectionLabel}>Prinsip Ekonomi Islam</span>
              <h2 className={styles.sectionTitle}>Skema Akad Syariah Digital</h2>
              <p className={styles.sectionSubtitle}>
                SYNERGY menjamin seluruh aktivitas pembiayaan bebas dari Riba, Gharar, dan Masyir dengan kesepakatan rasio nisbah yang transparan.
              </p>

              <div className={styles.featureGrid}>
                <div className={`${styles.featureCard} glass`}>
                  <div className={styles.featureIconWrap}>
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
                      <path d="M24 6 L38 14 L38 28 C38 36 24 42 24 42 C24 42 10 36 10 28 L10 14 Z" stroke="#00D2FF" strokeWidth="1.8" strokeLinejoin="round" />
                      <path d="M18 24 L22 28 L30 20" stroke="#00D2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3>Akad Musyarakah (Kemitraan Modal)</h3>
                  <p>
                    Kerja sama investasi di mana investor dan UMKM bersama-sama menyertakan modal. Keuntungan dan risiko dibagikan proporsional sesuai rasio nisbah kesepakatan awal yang terkunci di Smart Contract.
                  </p>
                </div>

                <div className={`${styles.featureCard} glass`}>
                  <div className={styles.featureIconWrap}>
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
                      <rect x="10" y="14" width="28" height="24" rx="4" stroke="#00D2FF" strokeWidth="1.8" />
                      <path d="M16 24h16M16 30h10" stroke="#00D2FF" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3>Akad Mudharabah (Bagi Hasil Usaha)</h3>
                  <p>
                    Investor (Shahibul Maal) menyediakan 100% modal usaha, sementara UMKM (Mudharib) mengelola proyek secara penuh. Pembagian hasil usaha dilakukan secara berkala dan otomatis berbasis realisasi keuntungan.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
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
                <Link href="#masalah">Solusi</Link>
                <Link href="#fitur">Fitur</Link>
                <Link href="#teknologi">Teknologi</Link>
                <Link href="#akad">Akad</Link>
                <Link href="#berita">Berita</Link>
                <Link href="/auth/login">Masuk</Link>
                <Link href="/auth/register">Daftar</Link>
              </div>

              <div className={styles.footerLinks}>
                <h4>Tentang</h4>
                <Link href="#tentang">About Us</Link>
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

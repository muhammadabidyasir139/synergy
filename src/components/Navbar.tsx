import Link from "next/link";
import Image from "next/image";
import styles from "./Navbar.module.css";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className={`${styles.navbar} glass`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoGroup}>
          <Image
            src="/source/Logo-Synergy.png"
            alt="Synergy Logo"
            width={40}
            height={40}
            style={{ objectFit: "contain" }}
            priority
          />
          <span className={styles.logoText}>SYNERGY</span>
          <span className={styles.navBadge}>PKM KC</span>
        </Link>

        <div className={styles.navLinks}>
          <Link href="#fitur" className={styles.link}>
            Fitur
          </Link>
          <Link href="#teknologi" className={styles.link}>
            Teknologi
          </Link>
          <Link href="#akad" className={styles.link}>
            Akad
          </Link>
        </div>

        <div className={styles.actions}>
          <ThemeToggle />
          <Link href="/auth/login" className={styles.btnLogin}>
            Masuk
          </Link>
          <Link href="/auth/register" className={styles.btnRegister}>
            Daftar
          </Link>
        </div>
      </div>
    </nav>
  );
}

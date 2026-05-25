import Link from "next/link";
import styles from "./Navbar.module.css";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className={`${styles.navbar} glass`}>
      <div className={styles.container}>
        <div className={styles.logoGroup}>
          <Link href="/" className={styles.logo}>
            SYNERGY
          </Link>
          <span className={styles.badge}>PKM KC</span>
        </div>
        
        <div className={styles.navLinks}>
          <Link href="#fitur" className={styles.link}>Fitur</Link>
          <Link href="#tentang" className={styles.link}>Tentang AI & Blockchain</Link>
          <Link href="#akad" className={styles.link}>Akad Syariah</Link>
        </div>

        <div className={styles.actions}>
          <ThemeToggle />
          <Link href="/auth/login" className={styles.btnLogin}>Masuk</Link>
          <Link href="/auth/register" className={styles.btnRegister}>Daftar Sekarang</Link>
        </div>
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./HeroSection.module.css";

const LINES = [
  { text: "Pembiayaan UMKM", accent: false },
  { text: "Lebih Cerdas & Adil", accent: true },
  { text: "dengan AI & Blockchain", accent: false },
];

const FULL_TEXT = LINES.map((l) => l.text).join("\n");
const TYPE_SPEED = 40;

export default function HeroSection() {
  const [charCount, setCharCount] = useState(0);
  const [doneTyping, setDoneTyping] = useState(false);

  useEffect(() => {
    const start = setTimeout(() => {
      let i = 0;
      const tick = setInterval(() => {
        i++;
        setCharCount(i);
        if (i >= FULL_TEXT.length) {
          clearInterval(tick);
          setTimeout(() => setDoneTyping(true), 300);
        }
      }, TYPE_SPEED);
      return () => clearInterval(tick);
    }, 350);

    return () => clearTimeout(start);
  }, []);

  const typedLines = FULL_TEXT.slice(0, charCount).split("\n");

  return (
    <section className={styles.hero}>
      <div className={styles.orb1} aria-hidden />
      <div className={styles.orb2} aria-hidden />

      {/* Decorative floating nodes that complement the canvas particle field */}
      <div className={styles.fnode1} aria-hidden />
      <div className={styles.fnode2} aria-hidden />
      <div className={styles.fnode3} aria-hidden />
      <div className={styles.fnode4} aria-hidden />
      <div className={styles.fnode5} aria-hidden />
      <svg className={styles.fnodeLines} aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none">
        <line className={styles.fline1} x1="18" y1="28" x2="82" y2="72" />
        <line className={styles.fline2} x1="75" y1="20" x2="25" y2="80" />
        <line className={styles.fline3} x1="12" y1="65" x2="88" y2="35" />
      </svg>

      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <span className={styles.badgeText}>INOVASI PKM-KC 2026</span>
        </div>

        <h1 className={styles.title}>
          {LINES.map((line, lineIdx) => {
            if (lineIdx >= typedLines.length) return null;

            const typed = typedLines[lineIdx];
            const isCurrent = lineIdx === typedLines.length - 1;
            const showBr = lineIdx < LINES.length - 1 && !isCurrent;

            return (
              <span key={lineIdx}>
                {line.accent ? (
                  <span className={styles.titleAccent}>{typed}</span>
                ) : (
                  typed
                )}
                {isCurrent && !doneTyping && (
                  <span className={styles.cursor} aria-hidden>|</span>
                )}
                {showBr && <br />}
              </span>
            );
          })}
        </h1>

        <p className={`${styles.subtitle} ${doneTyping ? styles.reveal : ""}`}>
          Ekosistem syariah berbasis <strong>Hyperledger Fabric</strong> dan{" "}
          <strong>XGBoost AI</strong> yang menjembatani investor dengan UMKM
          secara transparan, inklusif, dan sesuai prinsip Islam.
        </p>

        <div className={`${styles.ctaGroup} ${doneTyping ? styles.reveal : ""}`}>
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

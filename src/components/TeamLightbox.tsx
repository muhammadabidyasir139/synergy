"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./TeamLightbox.module.css";

export type TeamMember = {
  name: string;
  role: string;
  dept: string;
  photo: string;
};

type AdvisorMember = TeamMember & {
  title?: string;
};

type Props = {
  advisor: AdvisorMember;
  members: TeamMember[];
};

export default function TeamLightbox({ advisor, members }: Props) {
  const [active, setActive] = useState<(TeamMember & { title?: string }) | null>(null);

  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [active]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* ── Dosen Pendamping ── */}
      <div className={styles.advisorSection}>
        <p className={styles.advisorLabel}>Dosen Pendamping</p>
        <div
          className={`${styles.advisorCard} glass`}
          onClick={() => setActive(advisor)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === "Enter" && setActive(advisor)}
        >
          <div className={styles.advisorPhotoWrap}>
            <Image
              src={advisor.photo}
              alt={advisor.name}
              width={160}
              height={200}
              className={styles.advisorPhoto}
            />
          </div>
          <div>
            <h3 className={styles.advisorName}>{advisor.name}</h3>
            <p className={styles.advisorTitle}>{advisor.title ?? advisor.role}</p>
            <p className={styles.clickHint}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              Klik untuk detail
            </p>
          </div>
        </div>
      </div>

      {/* ── Tim Mahasiswa ── */}
      <div className={styles.teamGrid}>
        {members.map((m, i) => (
          <div
            key={i}
            className={`${styles.teamCard} glass`}
            onClick={() => setActive(m)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && setActive(m)}
          >
            <div className={styles.photoWrap}>
              <Image
                src={m.photo}
                alt={m.name}
                width={240}
                height={280}
                className={styles.photo}
              />
              <div className={styles.photoOverlay}>
                <span className={styles.viewLabel}>Lihat Detail</span>
              </div>
            </div>
            <div className={styles.cardInfo}>
              <h3 className={styles.memberName}>{m.name}</h3>
              <p className={styles.memberRole}>{m.role}</p>
              <span className={styles.memberDept}>{m.dept}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Lightbox modal ── */}
      {active && (
        <div className={styles.overlay} onClick={() => setActive(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setActive(null)} aria-label="Tutup">
              ×
            </button>
            <div className={styles.modalPhotoWrap}>
              <Image
                src={active.photo}
                alt={active.name}
                width={480}
                height={320}
                className={styles.modalPhoto}
              />
            </div>
            <div className={styles.modalInfo}>
              <h2 className={styles.modalName}>{active.name}</h2>
              <p className={styles.modalRole}>{active.title ?? active.role}</p>
              <span className={styles.modalDept}>{active.dept}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

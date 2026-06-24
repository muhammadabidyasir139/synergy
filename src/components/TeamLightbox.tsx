"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import Image from "next/image";
import styles from "./TeamLightbox.module.css";

export type TeamMember = {
  name: string;
  role: string;
  dept: string;
  photo: string;
  ig?: string;
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
  const [advisorVisible, setAdvisorVisible] = useState(false);
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  
  const advisorRef = useRef<HTMLDivElement>(null);
  const teamRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [active]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const observerOpts = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    
    const advisorObs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setAdvisorVisible(true);
        advisorObs.disconnect();
      }
    }, observerOpts);
    
    if (advisorRef.current) advisorObs.observe(advisorRef.current);

    const teamObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute("data-index"));
          setVisibleIndices(prev => prev.includes(index) ? prev : [...prev, index]);
          teamObs.unobserve(entry.target);
        }
      });
    }, observerOpts);

    teamRefs.current.forEach(ref => {
      if (ref) teamObs.observe(ref);
    });

    return () => {
      advisorObs.disconnect();
      teamObs.disconnect();
    };
  }, []);

  return (
    <>
      {/* ── Dosen Pendamping ── */}
      <div 
        className={styles.advisorSection} 
        ref={advisorRef}
        style={{
          opacity: advisorVisible ? 1 : 0,
          transform: advisorVisible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 0.6s ease-out, transform 0.6s ease-out"
        }}
      >
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
          <div className={styles.advisorInfo}>
            <h3 className={styles.advisorName}>{advisor.name}</h3>
            <p className={styles.advisorTitle}>{advisor.title ?? advisor.role}</p>
            <div className={styles.advisorActions}>
              {advisor.ig && (
                <a href={advisor.ig} target="_blank" rel="noopener noreferrer" className={styles.igLink} onClick={e => e.stopPropagation()}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tim Mahasiswa ── */}
      <div className={styles.teamGrid}>
        {members.map((m, i) => (
          <Fragment key={i}>
          <div
            ref={el => { teamRefs.current[i] = el; }}
            data-index={i}
            className={`${styles.teamCard} glass`}
            onClick={() => setActive(m)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && setActive(m)}
            style={{
              opacity: visibleIndices.includes(i) ? 1 : 0,
              transform: visibleIndices.includes(i) ? "translateY(0)" : "translateY(40px)",
              transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
              transitionDelay: visibleIndices.includes(i) ? `${i * 0.15}s` : "0s"
            }}
          >
            <div className={styles.photoWrap}>
              <Image
                src={m.photo}
                alt={m.name}
                width={280}
                height={360}
                className={styles.photo}
              />
              <div className={styles.cardInfo}>
                <h3 className={styles.memberName}>{m.name}</h3>
                <p className={styles.memberRole}>{m.role}</p>
                <span className={styles.memberDept}>{m.dept}</span>
              </div>
              <div className={styles.photoOverlay}>
                <span className={styles.viewLabel}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  Detail
                </span>
                {m.ig && (
                  <a href={m.ig} target="_blank" rel="noopener noreferrer" className={styles.igIcon} onClick={e => e.stopPropagation()}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                )}
              </div>
            </div>
          </div>
          {i === 1 && <div className={styles.break}></div>}
          </Fragment>
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

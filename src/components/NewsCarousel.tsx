"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import styles from "./NewsCarousel.module.css";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  category: string | null;
  publishedAt: string | null;
  authorName: string;
}

const CARDS_PER_VIEW = 3;
const AUTO_INTERVAL = 5000;

const CATEGORY_COLOR: Record<string, string> = {
  Prestasi: "#f59e0b",
  Teknologi: "#2f86ff",
  Edukasi: "#19c37d",
  Berita: "#8b5cf6",
  Kegiatan: "#ec4899",
};

const CATEGORY_GRADIENT: Record<string, string> = {
  Prestasi: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  Teknologi: "linear-gradient(135deg, #2f86ff 0%, #1546c8 100%)",
  Edukasi: "linear-gradient(135deg, #19c37d 0%, #0d9e65 100%)",
  Berita: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
  Kegiatan: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
  default: "linear-gradient(135deg, #2f86ff 0%, #1546c8 100%)",
};

const CATEGORY_ICON: Record<string, React.ReactElement> = {
  Prestasi: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 6l4.5 9.1L39 16.6l-7.5 7.3 1.8 10.3L24 29.1l-9.3 4.9 1.8-10.3L9 16.6l10.5-1.5z" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinejoin="round" fill="rgba(255,255,255,0.18)" />
      <path d="M16 36v6M32 36v6M12 42h24" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Teknologi: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="14" width="32" height="22" rx="3" stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
      <path d="M18 36l-3 6M30 36l3 6M14 42h20" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="25" r="5" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" />
      <circle cx="24" cy="25" r="2" fill="rgba(255,255,255,0.6)" />
      <path d="M24 20v-3M24 33v-5M19 25h-3M36 25h-9" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  Edukasi: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 10h24a2 2 0 0 1 2 2v26a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z" stroke="rgba(255,255,255,0.9)" strokeWidth="2" fill="rgba(255,255,255,0.1)" />
      <path d="M16 18h16M16 24h16M16 30h10" stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 14v24" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  Berita: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="10" width="26" height="30" rx="2" stroke="rgba(255,255,255,0.9)" strokeWidth="2" fill="rgba(255,255,255,0.1)" />
      <rect x="34" y="14" width="6" height="22" rx="1" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
      <path d="M14 18h14M14 24h14M14 30h8" stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Kegiatan: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="12" width="32" height="28" rx="3" stroke="rgba(255,255,255,0.9)" strokeWidth="2" fill="rgba(255,255,255,0.1)" />
      <path d="M8 20h32" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
      <path d="M17 8v8M31 8v8" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" />
      <rect x="14" y="26" width="6" height="6" rx="1" fill="rgba(255,255,255,0.55)" />
      <rect x="28" y="26" width="6" height="6" rx="1" fill="rgba(255,255,255,0.55)" />
    </svg>
  ),
};

function formatDate(s: string | null) {
  if (!s) return "";
  return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function NewsCarousel() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [slide, setSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/news?limit=12")
      .then((r) => r.json())
      .then((d) => setNews(d.news ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalSlides = Math.max(0, Math.ceil(news.length / CARDS_PER_VIEW));

  const goTo = useCallback(
    (idx: number) => setSlide(((idx % totalSlides) + totalSlides) % totalSlides),
    [totalSlides],
  );

  useEffect(() => {
    if (totalSlides <= 1) return;
    timerRef.current = setInterval(() => goTo(slide + 1), AUTO_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slide, totalSlides, goTo]);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.topRow}>
            <div>
              <span className={styles.sectionLabel}>Berita & Update</span>
              <h2 className={styles.sectionTitle}>Terkini dari SYNERGY</h2>
            </div>
          </div>
          <div className={styles.skeleton}>
            {[0, 1, 2].map((i) => <div key={i} className={styles.skeletonCard} />)}
          </div>
        </div>
      </section>
    );
  }

  if (news.length === 0) return null;

  const visibleCards = news.slice(slide * CARDS_PER_VIEW, slide * CARDS_PER_VIEW + CARDS_PER_VIEW);

  return (
    <section id="berita" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <div>
            <span className={styles.sectionLabel}>Berita & Update</span>
            <h2 className={styles.sectionTitle}>Terkini dari SYNERGY</h2>
          </div>
          {totalSlides > 1 && (
            <div className={styles.navBtns}>
              <button
                className={styles.navBtn}
                onClick={() => goTo(slide - 1)}
                aria-label="Sebelumnya"
              >
                ‹
              </button>
              <button
                className={styles.navBtn}
                onClick={() => goTo(slide + 1)}
                aria-label="Berikutnya"
              >
                ›
              </button>
            </div>
          )}
        </div>

        <div className={styles.cardsGrid}>
          {visibleCards.map((item) => {
            const gradient = CATEGORY_GRADIENT[item.category ?? ""] ?? CATEGORY_GRADIENT.default;
            const icon = CATEGORY_ICON[item.category ?? ""] ?? CATEGORY_ICON.Teknologi;
            return (
            <article key={item.id} className={`${styles.card} glass`}>
              <div
                className={styles.cardImageWrap}
                style={item.coverImage ? undefined : { background: gradient }}
              >
                {item.coverImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.coverImage} alt={item.title} className={styles.cardImage} />
                ) : (
                  <div className={styles.cardPlaceholder}>
                    <div className={styles.placeholderDecor1} />
                    <div className={styles.placeholderDecor2} />
                    <div className={styles.placeholderIcon}>{icon}</div>
                    {item.category && (
                      <span className={styles.placeholderLabel}>{item.category}</span>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardTop}>
                  {item.category && (
                    <span
                      className={styles.catBadge}
                      style={{ background: (CATEGORY_COLOR[item.category] ?? "#64748b") + "1a", color: CATEGORY_COLOR[item.category] ?? "#64748b" }}
                    >
                      {item.category}
                    </span>
                  )}
                  <span className={styles.date}>{formatDate(item.publishedAt)}</span>
                </div>

                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardExcerpt}>{item.excerpt}</p>

                <div className={styles.cardFooter}>
                  <span className={styles.author}>{item.authorName}</span>
                </div>
              </div>
            </article>
            );
          })}
        </div>

        {totalSlides > 1 && (
          <div className={styles.dots}>
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === slide ? styles.dotActive : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

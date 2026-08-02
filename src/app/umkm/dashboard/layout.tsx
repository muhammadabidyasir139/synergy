"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import ThemeToggle from "@/components/ThemeToggle";
import ChatWidget from "@/components/ChatWidget";
import { Menu, Chain, ArrowLeft, ArrowRight } from "@/components/icons";

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface UmkmSession {
  userId: string;
  fullName: string;
  umkmProfileId?: string;
}

export default function UMKMLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);
  const [session, setSession] = useState<UmkmSession | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("synergy_umkm_session");
      let parsed: UmkmSession | null = null;
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch {
        parsed = null;
      }

      if (parsed?.umkmProfileId) {
        setSession(parsed);
        setIsAuthenticated(true);
        setIsChecking(false);
      } else {
        router.replace("/auth/login");
      }
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("synergy_umkm_session");
    }
    router.replace("/auth/login");
  };

  const sidebarItems: SidebarItem[] = [
    {
      name: "Dashboard Utama",
      path: "/umkm/dashboard",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      ),
    },
    {
      name: "Profil Usaha",
      path: "/umkm/dashboard/profile",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      name: "Data Usaha",
      path: "/umkm/dashboard/data-usaha",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      name: "Penilaian Usaha",
      path: "/umkm/dashboard/credit-scoring",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      name: "Pengajuan Pendanaan",
      path: "/umkm/dashboard/pengajuan",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      name: "Campaign & Listing",
      path: "/umkm/dashboard/campaign",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
    {
      name: "Manajemen Akad",
      path: "/umkm/dashboard/akad",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      name: "Monitoring Usaha",
      path: "/umkm/dashboard/monitoring",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      name: "Bagi Hasil",
      path: "/umkm/dashboard/bagi-hasil",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      ),
    },
    {
      name: "Risk & Warning",
      path: "/umkm/dashboard/risk",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      name: "Riwayat Transaksi",
      path: "/umkm/dashboard/riwayat",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
        </svg>
      ),
    },
    {
      name: "Wallet & Withdraw",
      path: "/umkm/dashboard/wallet",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
  ];

  const getPageTitle = () => {
    const item = sidebarItems.find((s) => pathname === s.path);
    return item ? item.name : "Dashboard UMKM";
  };

  if (isChecking) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Memverifikasi Sesi UMKM...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className={styles.layoutContainer}>
      {isSidebarOpen && (
        <div className={styles.sidebarBackdrop} onClick={() => setIsSidebarOpen(false)} />
      )}
      <aside className={`${styles.sidebar} glass ${isSidebarOpen ? "" : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoGroup}>
            <img src="/source/Logo-Synergy.png" alt="Synergy" className={styles.shieldGlowMini} />
            <div>
              <span className={styles.sidebarLogo}>SYNERGY</span>
              <span className={styles.sidebarSub}>UMKM PORTAL</span>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={styles.toggleCollapseBtn}
            title={isSidebarOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
          >
            {isSidebarOpen ? <ArrowLeft /> : <ArrowRight />}
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {sidebarItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navText}>{item.name}</span>
              </Link>
            );
          })}

          <button onClick={handleLogout} className={styles.logoutBtn}>
            <span className={styles.navIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span className={styles.navText}>Keluar Sesi</span>
          </button>
        </nav>

        {isSidebarOpen && (
          <div className={`${styles.userCard} glass`}>
            <div className={styles.avatarGroup}>
              <div className={styles.avatar}>
                {(session?.fullName ?? "UK").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className={styles.userName}>{session?.fullName ?? "UMKM"}</p>
                <p className={styles.userRole}>UMKM Terverifikasi</p>
              </div>
            </div>
            <div className={styles.systemStatus}>
              <span className={styles.statusDot}></span>
              <span>Layanan Aktif</span>
            </div>
          </div>
        )}
      </aside>

      <div className={styles.contentArea}>
        <header className={`${styles.contentHeader} glass`}>
          <div className={styles.headerLeft}>
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className={styles.hamburgerBtn}>
                <Menu />
              </button>
            )}
            <h2 className={styles.headerTitle}>{getPageTitle()}</h2>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.blockchainIndicator}>
              <span className={styles.indicatorIcon}><Chain /></span>
              <span className={styles.indicatorText}>Transaksi Aman</span>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className={styles.contentBody}>{children}</main>
      </div>
      <ChatWidget />
    </div>
  );
}

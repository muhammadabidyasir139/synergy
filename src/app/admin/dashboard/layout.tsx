"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import ThemeToggle from "@/components/ThemeToggle";
import { Menu, Chain } from "@/components/icons";

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const timeout = window.setTimeout(() => {
      const session = sessionStorage.getItem("synergy_admin_session");
      const isValidSession = session === "true";

      setIsAuthenticated(isValidSession);
      setIsChecking(false);

      if (!isValidSession) {
        router.replace("/admin/login");
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("synergy_admin_session");
    }
    router.replace("/admin/login");
  };

  // 12 Sidebar Navigation Items matching the PRD
  const sidebarItems: SidebarItem[] = [
    {
      name: "Dashboard Utama",
      path: "/admin/dashboard",
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
      name: "Verifikasi KYC",
      path: "/admin/dashboard/kyc",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 11l-3 3-1.5-1.5" />
        </svg>
      ),
    },
    {
      name: "Kelayakan UMKM",
      path: "/admin/dashboard/umkm-approval",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      name: "Scoring AI (XGBoost)",
      path: "/admin/dashboard/ai-scoring",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      name: "Monitoring AI",
      path: "/admin/dashboard/ai-monitor",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M2 12h20" />
        </svg>
      ),
    },
{
      name: "Blockchain Ledger",

      path: "/admin/dashboard/blockchain",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
    {
      name: "Approval Akad",
      path: "/admin/dashboard/akad-approval",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      name: "Monitor Transaksi",
      path: "/admin/dashboard/transactions",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      name: "Fraud Alerts",
      path: "/admin/dashboard/fraud",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      name: "Reporting & Export",
      path: "/admin/dashboard/reports",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.2 15c.7-1.3 1-2.8 1-4.4C22.2 5.8 17.7 1.3 12 1.3S1.8 5.8 1.8 11.2c0 1.6.3 3 1 4.4l-2 6 6-2c1.3.7 2.8 1 4.4 1 5.7 0 10.2-4.5 10.2-10.2c0-1.6-.3-3-1-4.4l2-6-6 2" />
          <path d="M12 8v4l3 3" />
        </svg>
      ),
    },
    {
      name: "Config Nisbah & AI",
      path: "/admin/dashboard/configuration",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      name: "Broadcast Notifikasi",
      path: "/admin/dashboard/notifications",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      name: "Manajemen Berita",
      path: "/admin/dashboard/berita",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
          <path d="M18 14h-8" />
          <path d="M15 18h-5" />
          <path d="M10 6h8v4h-8V6Z" />
        </svg>
      ),
    },
  ];

  if (isChecking) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Memverifikasi Sesi Admin...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className={styles.layoutContainer}>
      {/* Dynamic persistent sidebar */}
      <aside className={`${styles.sidebar} glass ${isSidebarOpen ? "" : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoGroup}>
            <img src="/source/Logo-Synergy.png" alt="Synergy" className={styles.shieldGlowMini} />
            <div>
              <span className={styles.sidebarLogo}>SYNERGY</span>
              <span className={styles.sidebarSub}>ADMIN PANEL</span>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className={styles.toggleCollapseBtn}
            title={isSidebarOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
          >
            {isSidebarOpen ? "◀" : "▶"}
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

        {/* User Card at bottom of Sidebar */}
        {isSidebarOpen && (
          <div className={`${styles.userCard} glass`}>
            <div className={styles.avatarGroup}>
              <div className={styles.avatar}>SA</div>
              <div>
                <p className={styles.userName}>Super Admin</p>
              </div>
            </div>
            <div className={styles.systemStatus}>
              <span className={styles.statusDot}></span>
              <span>Blockchain & AI: Live</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className={styles.contentArea}>
        <header className={`${styles.contentHeader} glass`}>
          <div className={styles.headerLeft}>
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className={styles.hamburgerBtn}
              >
                <Menu />
              </button>
            )}
            <h2 className={styles.headerTitle}>
              {pathname === "/admin/dashboard" ? "Kontrol Statistik Utama" : "Sistem Kontrol Synergy"}
            </h2>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.blockchainIndicator}>
              <span className={styles.indicatorIcon}><Chain /></span>
              <span className={styles.indicatorText}>Secured Smart Contract</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Page Inner Content */}
        <main className={styles.contentBody}>{children}</main>
      </div>
    </div>
  );
}

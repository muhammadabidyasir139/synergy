"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./layout.module.css";
import ThemeToggle from "@/components/ThemeToggle";

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = sessionStorage.getItem("synergy_investor_session");
      if (session === "true") {
        setIsAuthenticated(true);
        setIsChecking(false);
      } else {
        router.replace("/investor/login");
      }
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("synergy_investor_session");
    }
    router.replace("/investor/login");
  };

  const sidebarItems: SidebarItem[] = [
    {
      name: "Dashboard Portofolio",
      path: "/investor/dashboard",
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
      name: "Explore Marketplace",
      path: "/investor/dashboard/explore",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      name: "Insight AI",
      path: "/investor/dashboard/ai-insight",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      name: "Proses Investasi",
      path: "/investor/dashboard/investasi",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      name: "Akad Digital",
      path: "/investor/dashboard/akad",
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
      name: "Portofolio Saya",
      path: "/investor/dashboard/portfolio",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
    {
      name: "Monitoring UMKM",
      path: "/investor/dashboard/monitoring",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      name: "Profit Sharing",
      path: "/investor/dashboard/profit-sharing",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
          <line x1="12" y1="6" x2="12" y2="8" />
          <line x1="12" y1="16" x2="12" y2="18" />
        </svg>
      ),
    },
    {
      name: "Risk & Alert",
      path: "/investor/dashboard/risk-alert",
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
      path: "/investor/dashboard/riwayat",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
        </svg>
      ),
    },
    {
      name: "Wallet & Deposit",
      path: "/investor/dashboard/wallet",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <circle cx="17" cy="15" r="1" fill="currentColor" />
        </svg>
      ),
    },
  ];

  const getPageTitle = () => {
    const item = sidebarItems.find((s) => pathname === s.path);
    return item ? item.name : "Investor Portal";
  };

  if (isChecking) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Memverifikasi Sesi Investor...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className={styles.layoutContainer}>
      <aside className={`${styles.sidebar} ${isSidebarOpen ? "" : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoGroup}>
            <span className={styles.logoGlow}>💰</span>
            <div>
              <span className={styles.sidebarLogo}>SYNERGY</span>
              <span className={styles.sidebarSub}>INVESTOR PORTAL</span>
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

        {isSidebarOpen && (
          <div className={styles.userCard}>
            <div className={styles.avatarGroup}>
              <div className={styles.avatar}>RW</div>
              <div>
                <p className={styles.userName}>Rahmat Wijaya</p>
                <p className={styles.userRole}>Investor Terverifikasi</p>
              </div>
            </div>
            <div className={styles.walletBalance}>
              <span className={styles.balanceLabel}>Saldo Wallet</span>
              <span className={styles.balanceValue}>Rp 250.000.000</span>
            </div>
          </div>
        )}
      </aside>

      <div className={styles.contentArea}>
        <header className={styles.contentHeader}>
          <div className={styles.headerLeft}>
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className={styles.hamburgerBtn}>
                ☰
              </button>
            )}
            <h2 className={styles.headerTitle}>{getPageTitle()}</h2>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.networkIndicator}>
              <span className={styles.statusDot}></span>
              <span>Smart Contract Aktif</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className={styles.contentBody}>{children}</main>
      </div>
    </div>
  );
}

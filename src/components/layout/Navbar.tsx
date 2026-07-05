"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Navbar.module.css";

const HERO_PAGES = ["/"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const hasHero = HERO_PAGES.includes(pathname);

  useEffect(() => {
    setMobileMenuOpen(false);
    // Reset scrolled when navigating to a new page
    setScrolled(window.scrollY > 20);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    // Check immediately on mount in case page was loaded mid-scroll
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => setIsLoggedIn(!!data.user))
      .catch(() => setIsLoggedIn(false));
  }, [pathname]);

  const isSolid = scrolled || !hasHero;

  return (
    <header className={`${styles.header} ${isSolid ? styles.scrolled : ""}`}>
      <div className={`container ${styles.headerInner}`}>
        <div className={styles.logoContainer}>
          <Link href="/">
            <Image
              src="/nsib-logo-nobg-white-text.webp"
              alt="NSIB Logo"
              width={220}
              height={65}
              priority
              style={{ objectFit: 'contain' }}
            />
          </Link>
        </div>

        <button 
          className={`${styles.mobileMenuBtn} ${mobileMenuOpen ? styles.active : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
        </button>

        <nav className={`${styles.navLinks} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
          <div className={styles.navItem}>
            <Link href="/">Home</Link>
          </div>

          <div className={styles.navItem}>
            <Link href="/about">About <span className={styles.chevron}>▼</span></Link>
            <div className={styles.dropdown}>
              <Link href="/team" className={styles.dropdownLink}>Management Team</Link>
              <Link href="/history" className={styles.dropdownLink}>The Bureau</Link>
            </div>
          </div>

          <div className={styles.navItem}>
            <Link href="/directorates">Directorate <span className={styles.chevron}>▼</span></Link>
            <div className={styles.dropdown}>
              <Link href="/directorates" className={styles.dropdownLink}>All Directorates</Link>
              <Link href="/page-service" className={styles.dropdownLink}>NSIB Services</Link>
            </div>
          </div>

          <div className={styles.navItem}>
            <Link href="/operations-centre">Operations Centre <span className={styles.chevron}>▼</span></Link>
            <div className={styles.dropdown}>
              <Link href="/flight-track" className={styles.dropdownLink}>Flight Tracking</Link>
              <Link href="/vessel-tracking" className={styles.dropdownLink}>Ship & Vessel Tracking</Link>
              <Link href="/help-desk" className={styles.dropdownLink}>Operational Help Desk</Link>
              <Link href="/open-ticket" className={styles.dropdownLink}>Request a Status Update</Link>
              <Link href="/learning-portal" className={styles.dropdownLink}>Sign up to OLC</Link>
              <Link href="/reporting-guidelines" className={styles.dropdownLink}>Accident Reporting Guidelines</Link>
            </div>
          </div>

          <div className={styles.navItem}>
            <Link href="/publications">News & Pubs <span className={styles.chevron}>▼</span></Link>
            <div className={styles.dropdown}>
              <Link href="/news" className={styles.dropdownLink}>News & Updates</Link>
              <Link href="/legislations" className={styles.dropdownLink}>Legislations</Link>
              <Link href="/mou" className={styles.dropdownLink}>MOU</Link>
              <Link href="/rail-reports" className={styles.dropdownLink}>Rail Accident Reports</Link>
              <Link href="/marine-reports" className={styles.dropdownLink}>Marine Accident Reports</Link>
              <Link href="/air-reports" className={styles.dropdownLink}>Aircraft Accident Reports</Link>
              <Link href="/other-reports" className={styles.dropdownLink}>Other Accident Reports</Link>
              <Link href="/investigation-forms-and-checklists" className={styles.dropdownLink}>Forms and Checklists</Link>
              <Link href="/investigation-manuals" className={styles.dropdownLink}>Investigation Manuals</Link>
              <Link href="/foi" className={styles.dropdownLink}>FOI</Link>
            </div>
          </div>

          <div className={styles.navItem}>
            <Link href="/event">Events</Link>
          </div>

          <div className={styles.navItem}>
            <Link href="/learning-portal">Learning Portal</Link>
          </div>

          <div className={styles.navItem}>
            <Link href="/contact-us">Contact <span className={styles.chevron}>▼</span></Link>
            <div className={styles.dropdown}>
              <Link href="/comment-on-regulations" className={styles.dropdownLink}>Comments On Regulations</Link>
              <Link href="/reporting" className={styles.dropdownLink}>Report an Accident</Link>
              <Link href="/vacancies" className={styles.dropdownLink}>Vacancies</Link>
              <Link href="/contact-us" className={styles.dropdownLink}>Contact Us</Link>
            </div>
          </div>

          <Link href="/reporting" className={`btn btn-secondary ${styles.reportBtn}`}>Report Accident</Link>

          {isLoggedIn ? (
            <Link href="/dashboard" className={styles.loginBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              Dashboard
            </Link>
          ) : (
            <a href="https://webmail.nsib.gov.ng/" target="_blank" rel="noopener noreferrer" className={styles.loginBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
              </svg>
              Staff Email
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}

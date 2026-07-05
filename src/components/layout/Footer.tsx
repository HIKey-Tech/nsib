'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Map Background generated dynamically */}
      <div className={styles.mapBackground}>
        <Image 
          src="/images/nigeria-map-footer.png"
          alt="Map of Nigeria"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          style={{ objectFit: 'cover', objectPosition: 'right center' }}
        />
      </div>

      <div className={styles.footerContent}>
        <div className={`container ${styles.footerGrid}`}>
          {/* Brand Column */}
          <div className={styles.brandCol}>
            <div className={styles.logoContainer}>
              <Image 
                src="/nsib-logo-nobg-white-text.webp"
                alt="NSIB Logo"
                width={220}
                height={65}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <p className={styles.brandDesc}>
              Advancing Safety in Nigeria's Transportation Sector. Committed to thoroughly investigating transport accidents to prevent future occurrences.
            </p>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div className={styles.contactText}>
                  <span className={styles.contactLabel}>Head Office</span>
                  <span className={styles.contactValue}>Nnamdi Azikiwe International Airport,<br/>Abuja, Nigeria</span>
                </div>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <div className={styles.contactText}>
                  <span className={styles.contactLabel}>Email Us</span>
                  <span className={styles.contactValue}>info@nsib.gov.ng</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Links Column */}
          <div className={styles.linkCol}>
            <h4>Quick Links</h4>
            <ul className={styles.linkList}>
              <li><Link href="/about">About NSIB</Link></li>
              <li><Link href="/services">Our Services</Link></li>
              <li><Link href="/events">Upcoming Events</Link></li>
              <li><Link href="/publications">News & Publications</Link></li>
              <li><Link href="/learning-portal">Learning Portal</Link></li>
              <li><Link href="/vacancies">Careers</Link></li>
              <li><Link href="/contact-us">Contact Us</Link></li>
              <li><a href="https://webmail.nsib.gov.ng/" target="_blank" rel="noopener noreferrer">Staff Email</a></li>
            </ul>
          </div>

          {/* Operations Column */}
          <div className={styles.linkCol}>
            <h4>Operations</h4>
            <ul className={styles.linkList}>
              <li><Link href="/reporting">Report an Accident</Link></li>
              <li><Link href="/investigations">Ongoing Investigations</Link></li>
              <li><Link href="/operations-centre">Operations Centre</Link></li>
              <li><Link href="/flight-track">Flight Tracker</Link></li>
              <li><Link href="/vessel-tracking">Vessel Tracker</Link></li>
            </ul>
          </div>

          {/* Newsletter & Social Column */}
          <div className={styles.newsletterCol}>
            <h4>Newsletter</h4>
            <p className={styles.newsletterText}>Subscribe to get the latest investigation reports and safety updates.</p>
            <form className={styles.subscribeForm} onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Email address" className={styles.subscribeInput} required />
              <button type="submit" className={styles.subscribeBtn}>
                Subscribe
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </form>
            
            <div className={styles.socialLinks}>
              <a href="https://facebook.com/nsibofficial" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://x.com/nsibofficial" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="X (Twitter)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="https://instagram.com/nsibofficial" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://linkedin.com/company/nsibofficial" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <div className={`container ${styles.bottomBarContent}`}>
            <p className={styles.copyright}>© {new Date().getFullYear()} Nigerian Safety Investigation Bureau (NSIB). All rights reserved.</p>
            <div className={styles.legalLinks}>
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <a href="https://icao.int" target="_blank" rel="noopener noreferrer">ICAO Guidelines</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

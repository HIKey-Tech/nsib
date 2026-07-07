import type { Metadata } from 'next';
import SocialFeed from '@/components/ui/SocialFeed';
import SocialFeedSection from '@/components/ui/SocialFeedSection';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Social Media | NSIB',
  description: 'Follow the Nigerian Safety Investigation Bureau on social media for the latest updates.',
};

export default function SocialPage() {
  return (
    <main>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <h1 className={styles.heroTitle}>Stay Connected</h1>
          <p className={styles.heroSubtitle}>
            Follow NSIB on social media for real-time updates on investigations, safety advisories, and events.
          </p>
        </div>
      </section>

      {/* Curated posts uploaded via the staff portal */}
      <SocialFeed showFilter />

      {/* Official channels */}
      <SocialFeedSection />

      {/* Follow buttons for all 4 platforms */}
      <section className={styles.followSection}>
        <div className={`container ${styles.followInner}`}>
          <h2 className={styles.followTitle}>All Our Channels</h2>
          <div className={styles.followGrid}>
            <Link href="https://facebook.com/nsibofficial" target="_blank" rel="noopener noreferrer" className={`${styles.followBtn} ${styles.facebook}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
              Facebook
            </Link>
            <Link href="https://x.com/nsibofficial" target="_blank" rel="noopener noreferrer" className={`${styles.followBtn} ${styles.xTwitter}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
              </svg>
              X (Twitter)
            </Link>
            <Link href="https://instagram.com/nsibofficial" target="_blank" rel="noopener noreferrer" className={`${styles.followBtn} ${styles.instagram}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
              Instagram
            </Link>
            <Link href="https://linkedin.com/company/nsibofficial" target="_blank" rel="noopener noreferrer" className={`${styles.followBtn} ${styles.linkedin}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
              </svg>
              LinkedIn
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

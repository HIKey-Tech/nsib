"use client";

import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import ScrollReveal from "@/components/ui/ScrollReveal";
import CalendarEventsSection from "@/components/ui/CalendarEventsSection";
import SocialFeedSection from "@/components/ui/SocialFeedSection";
import { teamMembers } from "@/app/team/data";

interface Report {
  id: string;
  title: string;
  type: string;
  sector: "aviation" | "maritime" | "railway";
  description?: string;
  report_status?: string;
  occurrence?: string;
  file_url: string;
  cover_image_url?: string | null;
  published_at: string;
  status: string;
}

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  published_at: string;
  author_name: string;
  image_url?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date?: string;
  location: string;
  category: string;
}

const NSIB_LOGO = "/images/nsib-logo.png";

const TYPE_LABEL: Record<string, string> = {
  preliminary: "Preliminary",
  final: "Published",
  interim: "Ongoing",
  safety_bulletin: "Bulletin",
};

const SECTOR_LABEL: Record<string, string> = {
  aviation: "Aviation",
  maritime: "Maritime",
  railway: "Railway",
};

const ic = (path: ReactNode) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);

const DOWNLOAD_RESOURCES = [
  { title: "Investigation Manuals", desc: "Official NSIB investigation procedures and guidelines", href: "/investigation-manuals", icon: ic(<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>), count: "Manuals" },
  { title: "Forms & Checklists", desc: "Standardised investigation forms and safety checklists", href: "/investigation-forms-and-checklists", icon: ic(<><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>), count: "Forms" },
  { title: "Accident Reports", desc: "Published final and preliminary investigation reports", href: "/publications", icon: ic(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /></>), count: "Reports" },
  { title: "Legislations", desc: "Acts, regulations and legal frameworks governing NSIB", href: "/legislations", icon: ic(<><path d="M12 3v18" /><path d="m3 7 9-4 9 4" /><path d="M5 7v6a7 7 0 0 0 14 0V7" /></>), count: "Legislations" },
  { title: "MoU Documents", desc: "Memoranda of understanding with partner agencies", href: "/mou", icon: ic(<><path d="M11 17a4 4 0 0 1-8 0V9a4 4 0 0 1 8 0" /><path d="M13 7a4 4 0 0 1 8 0v8a4 4 0 0 1-8 0" /></>), count: "Agreements" },
  { title: "Reporting Guidelines", desc: "How to report accidents and safety occurrences", href: "/reporting-guidelines", icon: ic(<><path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></>), count: "Guidelines" },
];

const PARTNERS = [
  { src: "/images/partners/nema.webp", alt: "National Emergency Management Agency" },
  { src: "/images/partners/nigerian-navy.jpg", alt: "Nigerian Navy" },
  { src: "/images/partners/imo.webp", alt: "International Maritime Organization" },
  { src: "/images/partners/faan.webp", alt: "Federal Airports Authority of Nigeria" },
  { src: "/images/partners/ncaa.webp", alt: "Nigerian Civil Aviation Authority" },
  { src: "/images/partners/nama.webp", alt: "Nigerian Airspace Management Agency" },
  { src: "/images/partners/nigerian-airforce.webp", alt: "Nigerian Air Force" },
  { src: "/images/partners/federal_ministry_of_aviation.webp", alt: "Federal Ministry of Aviation" },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
}


const CATEGORY_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  announcement: { bg: "rgba(27,42,107,0.1)", text: "#1B2A6B", label: "Announcement" },
  press_release: { bg: "rgba(226,48,48,0.1)", text: "#E23030", label: "Press Release" },
  safety: { bg: "rgba(245,158,11,0.1)", text: "#B45309", label: "Safety Alert" },
  general: { bg: "rgba(100,116,139,0.1)", text: "#475569", label: "General" },
  aviation: { bg: "rgba(27,42,107,0.08)", text: "#1B2A6B", label: "Aviation" },
  maritime: { bg: "rgba(0,119,182,0.1)", text: "#0077B6", label: "Maritime" },
  railway: { bg: "rgba(106,5,114,0.08)", text: "#6A0572", label: "Railway" },
};


function PartnersSlideshow() {
  return (
    <section className={styles.partnersSection}>
      <div className="container">
        <h2 className={styles.partnersTitle}>Key Partners &amp; Collaborations</h2>
      </div>
      <div className={styles.partnersMarqueeWrapper}>
        <div className={styles.partnersMarquee}>
          {[...PARTNERS, ...PARTNERS].map((p, i) => (
            <div className={styles.partnerLogo} key={i}>
              <Image src={p.src} alt={p.alt} width={150} height={90} style={{ objectFit: "contain" }} unoptimized />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ManagementSlideshow() {
  return (
    <section className={styles.managementSection}>
      <div className="container">
        <ScrollReveal direction="up" delay={0.1}>
          <div className={styles.sectionHeaderCentered}>
            <span className={styles.sectionLabel}>
              <span className={styles.sectionLabelRule} aria-hidden="true" />
              Leadership
              <span className={styles.sectionLabelRule} aria-hidden="true" />
            </span>
            <h2>Our Management <em>Team</em></h2>
            <p className={styles.sectionSubtitle}>
              Meet the management team of NSIB, appointed under the visionary leadership of <strong>President Bola Ahmed Tinubu</strong> through the Minister of Aviation, <strong>Festus Keyamo SAN</strong>, dedicated to advancing safety in aviation, maritime, and road transport.
            </p>
          </div>
        </ScrollReveal>

        <div className={styles.mgmtMarqueeWrapper}>
          <div className={styles.mgmtMarquee}>
            {[...teamMembers, ...teamMembers].map((member, i) => (
              <Link href={`/team/${member.slug}`} key={i} className={styles.mgmtCard}>
                <div className={styles.mgmtImageWrap}>
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className={styles.mgmtImage}
                    sizes="320px"
                  />
                  <div className={styles.mgmtImageOverlay} />
                  <div className={styles.mgmtHoverInfo}>
                    <p className={styles.mgmtHoverBio}>{member.bio[0].slice(0, 120)}…</p>
                    <span className={styles.mgmtHoverLink}>View Profile →</span>
                  </div>
                </div>
                <div className={styles.mgmtInfo}>
                  <h4>{member.name}</h4>
                  <span className={styles.mgmtTitle}>{member.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.mgmtViewAll}>
          <Link href="/team" className={styles.textLink}>
            View Full Team <span className={styles.arrow}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

const HERO_IMAGES = [
  { src: "/images/nsib_building.jpg", alt: "NSIB Headquarters" },
  { src: "/images/trainstation.avif", alt: "Train Station" },
  { src: "/images/new_maritime.jpg", alt: "Maritime Operations" },
  { src: "/images/air.jpg", alt: "Aviation" },
];

export default function Home() {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setHeroIndex(i => (i + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const [dynamicReports, setDynamicReports] = useState<Report[]>([]);
  const [dynamicNews, setDynamicNews] = useState<NewsItem[]>([]);
  const [dynamicEvents, setDynamicEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("/api/reports?limit=6")
      .then(r => r.json())
      .then(data => { if (data.reports?.length) setDynamicReports(data.reports); })
      .catch(() => { });
  }, []);

  useEffect(() => {
    fetch("/api/news?limit=4")
      .then(r => r.json())
      .then(data => { if (data.news?.length) setDynamicNews(data.news); })
      .catch(() => { });
  }, []);

  useEffect(() => {
    fetch("/api/events?upcoming=true&limit=3")
      .then(r => r.json())
      .then(data => { if (data.events?.length) setDynamicEvents(data.events); })
      .catch(() => { });
  }, []);

  // Real data only — no mock fallbacks. Sections show an empty state until content is published.
  const displayReports = dynamicReports.slice(0, 3).map(r => ({
    type: SECTOR_LABEL[r.sector] || r.sector,
    title: r.occurrence || r.title,
    date: formatDate(r.published_at),
    status: r.report_status || TYPE_LABEL[r.type] || r.type,
    image: r.cover_image_url || NSIB_LOGO,
    hasCover: !!r.cover_image_url,
    sector: r.sector,
    href: r.file_url,
    isDynamic: true,
  }));

  const displayNews = dynamicNews.slice(0, 4).map(n => ({
    title: n.title,
    date: formatDate(n.published_at),
    category: n.category,
    id: n.id,
    image: n.image_url || null,
  }));

  const displayEvents = dynamicEvents;

  return (
    <main className={styles.main}>
      {/* ── 1. HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          {HERO_IMAGES.map((img, i) => (
            <Image
              key={img.src}
              src={img.src}
              alt={img.alt}
              fill
              priority={i === 0}
              className={`${styles.heroImage}${i === heroIndex ? ` ${styles.heroImageActive}` : ""}`}
              sizes="100vw"
            />
          ))}
          <div className={styles.heroGrid} aria-hidden="true" />
          <div className={styles.heroVignette} aria-hidden="true" />
          <div className={styles.heroScan} aria-hidden="true" />
          <div className={styles.gradientOverlay} />
        </div>

        <div className="container">
          <div className={styles.heroLayout}>
            <div className={styles.heroLeft}>
              <div className={styles.heroBadge}>
                <span className={styles.pulseIndicator}></span>
                <span className={styles.badgeText}>Official · 09°04&prime;N 7°29&prime;E</span>
                <span className={styles.badgeDivider} />
                <span className={styles.badgeMuted}>Abuja, NG</span>
              </div>

              <h1 className={styles.heroTitle}>
                <span className={styles.titleLine}>Advancing safety</span>
                <span className={styles.titleLine}>across Nigeria&rsquo;s</span>
                <span className={styles.titleAccent}>
                  <em>transportation</em> sector.
                </span>
              </h1>

              <p className={styles.heroSubtitle}>
                Independent investigations into aviation, maritime &amp; railway occurrences — uncovering what happened, preventing what comes next.
              </p>

              <div className={styles.heroActions}>
                <Link href="/operations-centre" className={styles.heroBtnPrimary}>
                  <span>Enter Operations Centre</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </Link>
                <Link href="/publications" className={styles.heroBtnSecondary}>
                  Our Latest Findings
                </Link>
              </div>
            </div>

            <aside className={styles.heroRight} aria-label="Sector status">
              <div className={styles.statusCard}>
                <div className={styles.statusHeader}>
                  <span className={styles.statusLabel}>
                    <span className={styles.statusLed} />
                    Live Sector Watch
                  </span>
                  <span className={styles.statusMeta}>NSIB · Ops</span>
                </div>

                <ul className={styles.statusList}>
                  <li className={styles.statusRow}>
                    <span className={styles.statusIconBox}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l5 5-3.2 3.2-2.4-.8L2 16l3 3c.6.6 1.4.9 2.2.9h.1c.8-.1 1.5-.4 2.1-.9l.6-.6 3.2-3.2 5 5 1.2-.7c.4-.2.7-.6.6-1.1z" /></svg>
                    </span>
                    <div className={styles.statusBody}>
                      <strong>Aviation</strong>
                      <span>Civil airspace · active monitoring</span>
                    </div>
                    <span className={`${styles.statusDot} ${styles.statusDotGreen}`} aria-label="active" />
                  </li>
                  <li className={styles.statusRow}>
                    <span className={styles.statusIconBox}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21h20" /><path d="M12 9V5a2 2 0 0 1 2-2h2" /><path d="M20 21v-4a2 2 0 0 0-2-2h-3.5L12 9l-2.5 6H6a2 2 0 0 0-2 2v4" /></svg>
                    </span>
                    <div className={styles.statusBody}>
                      <strong>Maritime</strong>
                      <span>Territorial waters · investigations open</span>
                    </div>
                    <span className={`${styles.statusDot} ${styles.statusDotAmber}`} aria-label="ongoing" />
                  </li>
                  <li className={styles.statusRow}>
                    <span className={styles.statusIconBox}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="16" rx="2" /><path d="M4 11h16" /><path d="M12 3v8" /><path d="m8 19-2 3" /><path d="m18 22-2-3" /><path d="M8 15h.01" /><path d="M16 15h.01" /></svg>
                    </span>
                    <div className={styles.statusBody}>
                      <strong>Railway</strong>
                      <span>National rail network · safety review</span>
                    </div>
                    <span className={`${styles.statusDot} ${styles.statusDotGreen}`} aria-label="active" />
                  </li>
                </ul>

                <div className={styles.statusFooter}>
                  <div className={styles.statusMetric}>
                    <strong>3</strong>
                    <span>Sectors</span>
                  </div>
                  <div className={styles.statusMetric}>
                    <strong>2022</strong>
                    <span>Established</span>
                  </div>
                  <div className={styles.statusMetric}>
                    <strong>Abuja</strong>
                    <span>Headquarters</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className={styles.heroTicker} aria-hidden="true">
            <div className={styles.heroTickerTrack}>
              {[...Array(2)].flatMap((_, k) => [
                "Independent",
                "Objective",
                "Fact-finding · not fault-finding",
                "Aviation",
                "Maritime",
                "Railway",
                "Federal Republic of Nigeria",
              ].map((w, i) => (
                <span className={styles.heroTickerItem} key={`${k}-${i}`}>
                  <span className={styles.heroTickerDot} />
                  {w}
                </span>
              )))}
            </div>
          </div>
        </div>

        <a href="#quick-access" className={styles.heroScrollHint} aria-label="Scroll to next section">
          <span>Scroll</span>
          <span className={styles.heroScrollLine} />
        </a>
      </section>

      {/* ── 2. QUICK ACCESS ── */}
      <section id="quick-access" className={styles.quickAccessSection}>
        <div className="container">
          <ScrollReveal direction="up" delay={0.1} distance={30}>
            <div className={styles.quickAccess}>
              {[
                {
                  title: "Online Operations Centre",
                  desc: "Access the NSIB digital operations hub",
                  href: "/operations-centre",
                  icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
                },
                {
                  title: "Live Flight Tracker",
                  desc: "Monitor real-time aviation data",
                  href: "/flight-track",
                  icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l5 5-3.2 3.2-2.4-.8L2 16l3 3c.6.6 1.4.9 2.2.9h.1c.8-.1 1.5-.4 2.1-.9l.6-.6 3.2-3.2 5 5 1.2-.7c.4-.2.7-.6.6-1.1z" /></svg>,
                },
                {
                  title: "Ship / Vessel Tracker",
                  desc: "Maritime operations monitoring",
                  href: "/vessel-tracking",
                  icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21h20" /><path d="M12 9V5a2 2 0 0 1 2-2h2" /><path d="M20 21v-4a2 2 0 0 0-2-2h-3.5L12 9l-2.5 6H6a2 2 0 0 0-2 2v4" /></svg>,
                },
                {
                  title: "NSIB Directorates",
                  desc: "Explore our departments and units",
                  href: "/directorates",
                  icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
                },
                {
                  title: "Reports & Publications",
                  desc: "Access public safety archives",
                  href: "/publications",
                  icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>,
                },
              ].map((item, i) => (
                <Link href={item.href} className={styles.accessItem} key={i}>
                  <div className={styles.iconBox}>{item.icon}</div>
                  <div className={styles.itemText}>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                  <div className={styles.itemArrow}>→</div>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 3. BUREAU UNITS ── */}
      <section className={styles.bureauSection}>
        <div className="container">
          <ScrollReveal direction="up" delay={0.1}>
            <div className={styles.sectionHeaderCentered}>
              <span className={styles.sectionLabel}>
                <span className={styles.sectionLabelRule} aria-hidden="true" />
                About NSIB
                <span className={styles.sectionLabelRule} aria-hidden="true" />
              </span>
              <h2>Nigerian Safety Investigation Bureau <em>Units</em></h2>
            </div>
          </ScrollReveal>

          <div className={styles.bureauGrid}>
            {[
              { title: "The Bureau", href: "/about", image: "/images/nsib_building.jpg", desc: "Learn about our mandate, history and independence as Nigeria's foremost safety investigation authority." },
              { title: "Organisation", href: "/directorates", image: "/images/operations_control_ng.png", desc: "Explore the organizational structure, directorates and departments of the NSIB." },
              { title: "Management Team", href: "/team", image: "/images/team/dg_nsib.jpg", desc: "Meet the Director General and the management team leading the Bureau." },
            ].map((unit, i) => (
              <ScrollReveal direction="up" delay={0.1 + i * 0.15} distance={30} key={unit.title}>
                <Link href={unit.href} className={styles.bureauCard}>
                  <div className={styles.bureauImageWrap}>
                    <Image src={unit.image} alt={unit.title} fill className={styles.bureauImage} sizes="(max-width: 768px) 100vw, 33vw" unoptimized />
                    <div className={styles.bureauOverlay} />
                  </div>
                  <div className={styles.bureauLabel}>
                    <h3>{unit.title}</h3>
                    <p className={styles.bureauDesc}>{unit.desc}</p>
                    <span className={styles.bureauArrow}>Explore →</span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. OUR MANDATE ── */}
      <section className={styles.mandateSection}>
        <div className={`container ${styles.mandateGrid}`}>
          <ScrollReveal direction="left" delay={0.1} className={styles.mandateText}>
            <span className={styles.sectionLabel}>Who We Are</span>
            <h2>Fact-Finding, <br />Not <em>Fault-Finding</em></h2>
            <p>
              The Nigerian Safety Investigation Bureau (NSIB) is an independent agency of the Federal Government of Nigeria, legally mandated to investigate transportation accidents and serious incidents.
            </p>
            <p>
              Our objective is not to apportion blame or liability, but to determine the circumstances and causes behind transportation accidents, with the sole purpose of making robust safety recommendations that prevent a recurrence.
            </p>
            <div style={{ marginTop: "2.5rem" }}>
              <Link href="/about" className={styles.textLink}>
                Discover our methodology <span className={styles.arrow}>→</span>
              </Link>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.3} distance={40} className={styles.mandateImageGroup}>
            <div className={styles.imageMain}>
              <Image src="/images/operations_control_ng.png" alt="Operations Control Room" fill sizes="(max-width: 768px) 100vw, 50vw" className={styles.mandateImg} />
            </div>
            <div className={styles.imageOverlay}>
              <div className={styles.statBox}>
                <span className={styles.statNumber}>2022</span>
                <span className={styles.statText}>Established by the <br />NSIB Act</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 5. VISION & MISSION ── */}
      <section className={styles.visionSection}>
        <div className="container">
          <div className={styles.visionGrid}>
            <ScrollReveal direction="left" delay={0.1} distance={40} className={styles.visionCard}>
              <div className={styles.visionIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <span className={styles.visionTag}>Our Vision</span>
              <h3>A World-Class Safety Investigation Agency</h3>
              <p>
                To be a world-class safety investigation agency committed to preventing transportation accidents and incidents in Nigeria through independent, objective, and thorough investigations that produce robust safety recommendations.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.25} distance={40} className={`${styles.visionCard} ${styles.missionCard}`}>
              <div className={styles.visionIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
              </div>
              <span className={styles.visionTag}>Our Mission</span>
              <h3>Safety Through Independence &amp; Integrity</h3>
              <p>
                To conduct independent, objective, and thorough investigations into transportation accidents and serious incidents in Nigeria, producing safety recommendations that address systemic deficiencies and prevent future occurrences across aviation, maritime, and railway sectors.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 6. FROM THE OFFICE OF THE DG ── */}
      <section className={styles.dgSection}>
        <div className={`container ${styles.dgGrid}`}>
          <ScrollReveal direction="left" delay={0.2} distance={40} className={styles.dgLeft}>
            <div className={styles.dgImageWrapper}>
              <div className={styles.dgImagePlaceholder}>
                <Image src="/images/team/dg_nsib.jpg" alt="Director General" fill priority sizes="(max-width: 768px) 100vw, 33vw" className={styles.dgImage} />
              </div>
              <div className={styles.dgNamePlate}>
                <h4>Capt. Alex Badeh Jr.</h4>
                <span>Director General / CEO</span>
              </div>
            </div>

            {/* YouTube Video */}
            <div className={styles.dgVideoWrap}>
              <div className={styles.dgVideoLabel}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.52V8.48L15.5 12l-5.75 3.52z" /></svg>
                Assumption of Office
              </div>
              <div className={styles.dgVideoFrame}>
                <iframe
                  src="https://www.youtube.com/embed/4IZTZ63748Q"
                  title="Capt. Alex Badeh Jr. Assumption of Office as NSIB Director General"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: "none", width: "100%", height: "100%", borderRadius: "12px" }}
                />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.4} className={styles.dgContent}>
            <span className={styles.sectionLabel}>Leadership</span>
            <h2>From The Office Of The <em>Director General</em></h2>
            <p className={styles.dgBodyText}>
              We will harness the power of data, technology, and human ingenuity to build a future where every journey is undertaken with peace of mind, every mile traversed with the assurance of a safe return.
            </p>
            <p className={styles.dgBodyText}>
              Capt. Badeh&apos;s administration&apos;s key pillars are steadfast commitment to excellence, inter-agency and inter-sector collaboration, utmost transparency and accountability, and promotion of safety awareness, sensitisation and education.
            </p>
            <p className={styles.dgBodyText}>
              &ldquo;Under my watch, the NSIB will become a partner, educator, and advocate for transport safety. We will engage every stakeholder, from pilots in the cockpit to mechanics in the workshop, from policymakers in the Federal Capital Territory to passengers at the bus stations. Together, we will transform Nigeria into a land where every journey is safe, every landing is a celebration.&rdquo;
            </p>
            <blockquote className={styles.dgQuote}>
              &ldquo;Let Us Make Safety Not Just A Slogan, But A Way Of Life…&rdquo;
            </blockquote>
            <p className={styles.dgAttribution}>— Capt. Alex Badeh Jr., Director General</p>
            <Link href="/about/leadership" className="btn btn-outline" style={{ marginTop: "2rem", display: "inline-block" }}>
              Read Full Profile
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 7. CORE SECTORS ── */}
      <section className={styles.sectorsSection}>
        <div className="container">
          <div className={styles.sectionHeaderCentered}>
            <span className={styles.sectionLabel}>
              <span className={styles.sectionLabelRule} aria-hidden="true" />
              Our Focus Areas
              <span className={styles.sectionLabelRule} aria-hidden="true" />
            </span>
            <h2>Multimodal Safety <em>Investigations</em></h2>
            <p className={styles.sectionLead}>Three modes of transport. One mandate — independent, evidence-led inquiry that prevents the next incident.</p>
          </div>
          <div className={styles.sectorsGrid}>
            {[
              { id: "aviation", num: "01", tag: "Air", standard: "ICAO Annex 13", title: "Aviation Safety", desc: "Investigating civil aviation occurrences within Nigerian airspace or involving Nigerian registered aircraft globally.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l5 5-3.2 3.2-2.4-.8L2 16l3 3c.6.6 1.4.9 2.2.9h.1c.8-.1 1.5-.4 2.1-.9l.6-.6 3.2-3.2 5 5 1.2-.7c.4-.2.7-.6.6-1.1z" /></svg>, image: "/images/air.jpg" },
              { id: "maritime", num: "02", tag: "Sea", standard: "IMO Casualty Code", title: "Maritime Safety", desc: "Conducting impartial investigations into marine casualties and incidents on Nigerian territorial waters.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21h20" /><path d="M12 9V5a2 2 0 0 1 2-2h2" /><path d="M20 21v-4a2 2 0 0 0-2-2h-3.5L12 9l-2.5 6H6a2 2 0 0 0-2 2v4" /></svg>, image: "/images/maritime.jpg" },
              { id: "rail", num: "03", tag: "Rail", standard: "Rail Safety Standards", title: "Railway Safety", desc: "Analyzing railway accidents and serious incidents to improve the safety of the national rail network.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="16" rx="2" /><path d="M4 11h16" /><path d="M12 3v8" /><path d="m8 19-2 3" /><path d="m18 22-2-3" /><path d="M8 15h.01" /><path d="M16 15h.01" /></svg>, image: "/images/train.jpg" },
            ].map((sector, index) => (
              <ScrollReveal direction="up" delay={0.1 + index * 0.15} distance={40} key={sector.id} className={styles.sectorCard}>
                <span className={styles.sectorTopBar} aria-hidden="true" />
                <div className={styles.sectorImageContainer}>
                  <Image src={sector.image} alt={sector.title} fill className={styles.sectorImg} sizes="(max-width: 768px) 100vw, 33vw" unoptimized />
                  <span className={styles.sectorImageOverlay} aria-hidden="true" />
                  <span className={styles.sectorTag}>
                    <span className={styles.sectorTagIcon} aria-hidden="true">{sector.icon}</span>
                    {sector.tag}
                  </span>
                  <span className={styles.sectorNum} aria-hidden="true">{sector.num}</span>
                </div>
                <div className={styles.sectorCardBody}>
                  <div className={styles.sectorMeta}>
                    <span className={styles.sectorMetaLabel}>Mandate</span>
                    <span className={styles.sectorMetaValue}>{sector.standard}</span>
                  </div>
                  <h3>{sector.title}</h3>
                  <p>{sector.desc}</p>
                  <Link href={`/${sector.id}-reports`} className={styles.sectorLink}>
                    <span>View Reports</span>
                    <span className={styles.arrow}>→</span>
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. RECENT INVESTIGATIONS ── */}
      <section className={styles.investigationsSection}>
        <div className="container">
          <div className={styles.sectionHeaderCentered}>
            <span className={styles.sectionLabel}>
              <span className={styles.sectionLabelRule} aria-hidden="true" />
              Transparency &amp; Reporting
              <span className={styles.sectionLabelRule} aria-hidden="true" />
            </span>
            <h2>Recent <em>Investigations</em></h2>
          </div>
          <div className={styles.cardsGrid}>
            {displayReports.length === 0 && (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#94a3b8", padding: "2.5rem 0" }}>
                Published investigation reports will appear here.
              </p>
            )}
            {displayReports.slice(0, 3).map((item, index) => (
              <ScrollReveal direction="up" delay={0.2 + index * 0.15} distance={40} key={index} className={styles.investigationCard}>
                <div className={styles.invImageWrapper}>
                  <Image src={item.image} alt={item.title} fill className={styles.invImage} style={item.hasCover ? undefined : { objectFit: "contain", padding: "2rem" }} sizes="(max-width: 768px) 100vw, 33vw" unoptimized />
                </div>
                <div className={styles.invCardBody}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardType}>{item.type}</span>
                    <span className={`${styles.cardStatus} ${styles[(item.status?.toLowerCase().replace(/\s/g, "") || "preliminary")]}`}>{item.status}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardDate}>{item.date}</span>
                    {"isDynamic" in item && item.isDynamic ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className={styles.cardAction}>Read Document <span className={styles.arrow}>→</span></a>
                    ) : (
                      <Link href={`/${item.sector}-reports`} className={styles.cardAction}>Read Document <span className={styles.arrow}>→</span></Link>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal direction="up" delay={0.6} className={styles.centerAction}>
            <Link href="/publications" className="btn btn-outline">Browse Database</Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 9. MANAGEMENT TEAM SLIDESHOW ── */}
      <ManagementSlideshow />

      {/* ── 9.5. LEARNING PORTAL ── */}
      <section className={styles.learningSection}>
        <div className="container">
          <div className={styles.learningGrid}>
            <ScrollReveal direction="left" delay={0.1} distance={40} className={styles.learningContent}>
              <span className={styles.sectionLabel}>Education &amp; Training</span>
              <h2>NSIB Learning <em>Portal</em></h2>
              <p>
                Enhance your knowledge of transportation safety with our newly launched learning platform. Access specialised courses, certification programs, and safety resources curated by industry experts to promote a culture of safety across aviation, maritime, and railway sectors.
              </p>
              <div style={{ marginTop: "1.5rem" }}>
                <Link href="/learning-portal" className="btn btn-primary" style={{ padding: "1rem 2rem", fontSize: "1.05rem" }}>
                  Access Learning Portal
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.3} distance={40} className={styles.learningImageWrapper}>
              <Image
                src="/images/operations_control.png"
                alt="NSIB safety training and operations"
                fill
                className={styles.learningImage}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 10. NEWS + DOWNLOAD RESOURCES ── */}
      <section className={styles.newsResourcesSection}>
        <div className="container">
          <div className={styles.newsResourcesGrid}>
            {/* News Panel */}
            <div className={styles.newsPanel}>
              <ScrollReveal direction="left" delay={0.1}>
                <div className={styles.newsPanelHeader}>
                  <div>
                    <span className={styles.sectionLabel}>Latest Updates</span>
                    <h2>News &amp; <em>Publications</em></h2>
                  </div>
                  <Link href="/news" className={styles.viewAllLink}>View All →</Link>
                </div>
              </ScrollReveal>

              {/* Featured article */}
              {displayNews[0] && (
                <ScrollReveal direction="up" delay={0.2}>
                  <Link href={displayNews[0].id ? `/news/${displayNews[0].id}` : "/news"} className={styles.featuredNews}>
                    <div className={styles.featuredNewsBg}>
                      {displayNews[0].image ? (
                        <Image src={displayNews[0].image} alt={displayNews[0].title} fill style={{ objectFit: "cover" }} unoptimized />
                      ) : (
                        <div className={styles.featuredNewsPlaceholder} />
                      )}
                      <div className={styles.featuredNewsGradient} />
                    </div>
                    <div className={styles.featuredNewsContent}>
                      {(() => {
                        const badge = CATEGORY_BADGE[displayNews[0].category] || CATEGORY_BADGE.general;
                        return (
                          <span className={styles.newsBadge} style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)" }}>
                            {badge.label}
                          </span>
                        );
                      })()}
                      <h3 className={styles.featuredNewsTitle}>{displayNews[0].title}</h3>
                      <span className={styles.featuredNewsDate}>{displayNews[0].date}</span>
                    </div>
                  </Link>
                </ScrollReveal>
              )}

              {displayNews.length === 0 && (
                <p style={{ color: "#94a3b8", padding: "2rem 0" }}>
                  Latest news and publications will appear here once posted.
                </p>
              )}

              {/* Remaining news items */}
              <div className={styles.newsList}>
                {displayNews.slice(1).map((news, i) => {
                  const badge = CATEGORY_BADGE[news.category] || CATEGORY_BADGE.general;
                  return (
                    <ScrollReveal direction="up" delay={0.25 + i * 0.1} key={i} className={styles.newsItem}>
                      <Link href={news.id ? `/news/${news.id}` : "/news"} className={styles.newsItemInner}>
                        <div className={styles.newsItemLeft}>
                          <span className={styles.newsBadge} style={{ background: badge.bg, color: badge.text }}>
                            {badge.label}
                          </span>
                          <h4>{news.title}</h4>
                          <span className={styles.newsDate}>{news.date}</span>
                        </div>
                        <div className={styles.newsItemArrow}>→</div>
                      </Link>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>

            {/* Download Resources Panel */}
            <ScrollReveal direction="right" delay={0.2} className={styles.resourcesPanel}>
              <div className={styles.resourcesHeader}>
                <span className={styles.sectionLabel}>Resources</span>
                <h2>Download <em>Centre</em></h2>
                <p>Access official NSIB documents, reports, and guidelines</p>
              </div>
              <div className={styles.resourcesList}>
                {DOWNLOAD_RESOURCES.map((res, i) => (
                  <Link href={res.href} key={i} className={styles.resourceItem}>
                    <div className={styles.resourceIcon}>{res.icon}</div>
                    <div className={styles.resourceInfo}>
                      <strong>{res.title}</strong>
                      <span>{res.desc}</span>
                    </div>
                    <div className={styles.resourceMeta}>
                      <span className={styles.resourceCount}>{res.count}</span>
                      <span className={styles.resourceArrow}>↗</span>
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 11. UPCOMING EVENTS ── */}
      <CalendarEventsSection events={displayEvents} />

      {/* ── 12. SOCIAL FEED ── */}
      <SocialFeedSection compact />

      {/* ── 13. PARTNERS ── */}
      <PartnersSlideshow />

      {/* ── 14. CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBackgroundPattern} />
        <div className={`container ${styles.ctaContainer}`}>
          <ScrollReveal direction="up" delay={0.1} distance={40} className={styles.ctaContent}>
            <h2>Report An Accident or Incident</h2>
            <p>Safety is a collective responsibility. If you witness or are involved in an aviation, maritime, or rail accident, please report it to us immediately.</p>
            <div className={styles.ctaButtons}>
              <Link href="/report-accident" className="btn btn-secondary" style={{ padding: "1.25rem 2.5rem", fontSize: "1.1rem" }}>
                Secure Reporting Portal
              </Link>
              <Link href="/contact-us" className={styles.textLinkWhite}>
                Emergency Contacts →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}

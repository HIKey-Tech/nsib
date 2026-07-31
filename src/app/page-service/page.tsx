"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import styles from "./page.module.css";

const services = [
  {
    num: "01",
    title: "Accident Investigation",
    desc: "Independent, impartial investigations into civil aviation, maritime, and railway accidents occurring within Nigerian jurisdiction. Our findings are published openly — never to assign blame, always to prevent recurrence.",
    tags: ["Aviation", "Maritime", "Railway"],
    href: "/reporting",
    cta: "File a Report",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        <path d="M11 8v3"/><path d="M11 14h.01"/>
      </svg>
    ),
  },
  {
    num: "02",
    title: "Safety Recommendations",
    desc: "Following each investigation, targeted safety recommendations are issued to operators, regulators, and government bodies. All recommendations are tracked publicly and reviewed for implementation compliance.",
    tags: ["Policy", "Oversight"],
    href: "/reporting-guidelines",
    cta: "View Guidelines",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <path d="M14 2v6h6"/><path d="M9 15l2 2 4-4"/>
      </svg>
    ),
  },
  {
    num: "03",
    title: "Training & Capacity Building",
    desc: "Professional training for investigators, transport sector staff, and industry stakeholders through our Online Learning Centre — developing Nigeria's domestic safety investigation competency from within.",
    tags: ["Education", "Certification"],
    href: "/department",
    cta: "Explore Training",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  {
    num: "04",
    title: "Data & Publications",
    desc: "Publicly accessible archive of accident reports, safety studies, and statistical analyses — giving researchers, regulators, and operators the data needed for evidence-based safety decisions.",
    tags: ["Reports", "Research", "Open Data"],
    href: "/publications",
    cta: "Browse Archive",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
      </svg>
    ),
  },
  {
    num: "05",
    title: "Policy Advisory",
    desc: "Strategic advice to regulators and transport ministries on safety standards, regulatory frameworks, and implementation strategies — translating investigation outcomes into lasting institutional reform.",
    tags: ["Government", "Regulation"],
    href: "/legislations",
    cta: "Read Legislation",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 22h18"/><path d="M6 18V7l6-4 6 4v11"/>
        <path d="M10 22V12h4v10"/>
      </svg>
    ),
  },
];

const stats = [
  { value: "200+", label: "Investigations Completed" },
  { value: "15+", label: "Years of Operation" },
  { value: "3", label: "Transport Sectors Covered" },
  { value: "100%", label: "Publicly Published Reports" },
];

export default function ServicesPage() {
  return (
    <main className={styles.page}>

      {/* Antigravity Hero Section */}
      <section className="page-hero" style={{
        backgroundColor: 'var(--nsib-navy)',
        color: 'white',
        padding: '10rem 2rem 8rem',
        position: 'relative',
        transformStyle: 'preserve-3d',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(226, 48, 48, 0.15) 0%, transparent 50%)',
          zIndex: 0
        }} />
        
        {/* Floating background elements */}
        <div className="floating-element" style={{ position: 'absolute', top: '10%', right: '10%', width: '150px', height: '150px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', transform: 'rotateZ(15deg)', zIndex: 1 }} />
        <div className="floating-element-slow" style={{ position: 'absolute', bottom: '-10%', left: '5%', width: '250px', height: '250px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(226,48,48,0.2) 0%, rgba(226,48,48,0) 100%)', backdropFilter: 'blur(20px)', zIndex: 1 }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <ScrollReveal direction="up" delay={0.05} distance={24}>
            <div style={{ maxWidth: "800px" }}>
              <Link href="/directorates" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                marginBottom: "2rem",
                textDecoration: "none",
                transition: "color 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "white"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
              >
                <span>←</span>
                <span>Back to Directorates</span>
              </Link>
              <br />
              <div style={{
                display: 'inline-flex',
                padding: '0.5rem 1rem',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '30px',
                backdropFilter: 'blur(10px)',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'white',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Core Operations
              </div>
              <h1 style={{ 
                color: 'white', 
                fontSize: 'clamp(2rem, 5vw, 4.5rem)', 
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: '1.5rem',
                textShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                NSIB Services
              </h1>
              <p style={{ 
                fontSize: '1.25rem', 
                color: 'rgba(255, 255, 255, 0.8)', 
                maxWidth: '600px', 
                lineHeight: 1.6,
                textShadow: '0 5px 15px rgba(0,0,0,0.2)',
                marginBottom: '2rem'
              }}>
                The Nigerian Safety Investigation Bureau is mandated to investigate transportation accidents and serious incidents — not to apportion blame, but to prevent them from happening again.
              </p>
              
              <Link href="/about" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: 600, borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '0.25rem' }}>
                About the Bureau
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
          </ScrollReveal>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float {
              0% { transform: translateY(0px) rotateZ(15deg); }
              50% { transform: translateY(-20px) rotateZ(10deg); }
              100% { transform: translateY(0px) rotateZ(15deg); }
          }
          @keyframes floatSlow {
              0% { transform: translateY(0px) rotateZ(0deg) scale(1); }
              50% { transform: translateY(-15px) rotateZ(5deg) scale(1.05); }
              100% { transform: translateY(0px) rotateZ(0deg) scale(1); }
          }
          .floating-element { animation: float 8s ease-in-out infinite; }
          .floating-element-slow { animation: floatSlow 12s ease-in-out infinite; }
        `}} />
      </section>

      {/* ── Stats Bar ────────────────────────── */}
      <section className={styles.statsBar}>
        <div className={`container ${styles.statsGrid}`}>
          {stats.map((s, i) => (
            <ScrollReveal key={i} direction="up" delay={0.05 + i * 0.08} distance={16}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Services Grid ────────────────────── */}
      <section className={styles.servicesSection}>
        <div className="container">
          <ScrollReveal direction="up" delay={0.05} distance={16}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>What We Do</span>
              <h2 className={styles.sectionTitle}>Five Core Services</h2>
            </div>
          </ScrollReveal>

          <div className={styles.servicesGrid}>
            {services.map((s, i) => (
              <ScrollReveal key={s.num} direction="up" delay={0.05 + i * 0.1} distance={28}>
                <div className={styles.serviceCard}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardIconWrap}>{s.icon}</div>
                    <span className={styles.cardNum}>{s.num}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{s.title}</h3>
                  <p className={styles.cardDesc}>{s.desc}</p>
                  <div className={styles.cardBottom}>
                    <div className={styles.tagRow}>
                      {s.tags.map((t) => (
                        <span key={t} className={styles.tag}>{t}</span>
                      ))}
                    </div>
                    <Link href={s.href} className={styles.cardCta}>
                      {s.cta}
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}

            {/* Wide mandate card */}
            <ScrollReveal direction="up" delay={0.55} distance={28}>
              <div className={`${styles.serviceCard} ${styles.mandateCard}`}>
                <span className={styles.mandateEyebrow}>Our Mandate</span>
                <blockquote className={styles.mandateQuote}>
                  "Safety is not the absence of accidents — it is the presence of defences. NSIB exists to build those defences."
                </blockquote>
                <Link href="/about" className={styles.mandateLink}>
                  Read Our Full Mandate →
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Process Section ──────────────────── */}
      <section className={styles.processSection}>
        <div className="container">
          <ScrollReveal direction="up" delay={0.05} distance={20}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>How It Works</span>
              <h2 className={styles.sectionTitle}>The Investigation Process</h2>
            </div>
          </ScrollReveal>

          <div className={styles.processTrack}>
            {[
              { n: "01", title: "Notification", desc: "An accident or serious incident is reported to NSIB by operators, regulators, emergency services, or the public." },
              { n: "02", title: "Deployment", desc: "An independent team of accredited investigators is immediately mobilised and deployed to the scene." },
              { n: "03", title: "Analysis", desc: "Evidence is gathered, witness statements recorded, and contributing factors systematically examined." },
              { n: "04", title: "Publication", desc: "A preliminary report within 30 days. A final report — with safety recommendations — published for all to access." },
            ].map((step, i) => (
              <ScrollReveal key={step.n} direction="up" delay={0.1 + i * 0.12} distance={24}>
                <div className={styles.processStep}>
                  <div className={styles.stepNumber}>{step.n}</div>
                  <div className={styles.stepLine} />
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section className={styles.cta}>
        <div className={`container ${styles.ctaInner}`}>
          <ScrollReveal direction="left" delay={0.1} distance={28} className={styles.ctaLeft}>
            <p className={styles.ctaEyebrow}>Take Action</p>
            <h2 className={styles.ctaTitle}>Witnessed an accident?<br />Report it to NSIB.</h2>
            <p className={styles.ctaDesc}>Every report helps us build a safer transport sector. Your information is handled with full confidentiality.</p>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.2} distance={28} className={styles.ctaRight}>
            <Link href="/reporting" className={styles.ctaBtn}>
              Report an Accident
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
            <Link href="/contact-us" className={styles.ctaGhost}>Contact the Bureau</Link>
          </ScrollReveal>
        </div>
      </section>
      
      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
            0% { transform: translateY(0px) rotateZ(15deg); }
            50% { transform: translateY(-20px) rotateZ(10deg); }
            100% { transform: translateY(0px) rotateZ(15deg); }
        }
        @keyframes floatSlow {
            0% { transform: translateY(0px) rotateZ(0deg) scale(1); }
            50% { transform: translateY(-15px) rotateZ(5deg) scale(1.05); }
            100% { transform: translateY(0px) rotateZ(0deg) scale(1); }
        }
      `}} />

    </main>
  );
}

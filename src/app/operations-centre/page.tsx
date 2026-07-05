import Link from "next/link";
import { FadeIn, StaggerContainer, StaggerItem, ScaleHover } from "@/components/ui/MotionWrapper";
import styles from "./operations-centre.module.css";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Operations Centre",
  description:
    "The NSIB digital operations hub — live flight tracking, marine vessel tracking, accident reporting and the online learning centre in one place.",
  path: "/operations-centre",
});

const tools = [
  {
    num: "01",
    title: "Live Flight Tracker",
    desc: "Monitor real-time aviation data, verify aircraft positioning, and track flight trajectories across Nigerian airspace.",
    href: "/flight-track",
    cta: "Access Tracker",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l5 5-3.2 3.2-2.4-.8L2 16l3 3c.6.6 1.4.9 2.2.9h.1c.8-.1 1.5-.4 2.1-.9l.6-.6 3.2-3.2 5 5 1.2-.7c.4-.2.7-.6.6-1.1z"/>
      </svg>
    ),
  },
  {
    num: "02",
    title: "Marine Vessel Tracker",
    desc: "Access live Automatic Identification System (AIS) data for maritime vessels within territorial and coastal waters.",
    href: "/vessel-tracking",
    cta: "Access Tracker",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 21h20"/>
        <path d="M12 9V5a2 2 0 0 1 2-2h2"/>
        <path d="M20 21v-4a2 2 0 0 0-2-2h-3.5L12 9l-2.5 6H6a2 2 0 0 0-2 2v4"/>
      </svg>
    ),
  },
  {
    num: "03",
    title: "Report an Accident",
    desc: "Officially notify the Bureau of an accident or serious incident using our secure online reporting portal.",
    href: "/reporting",
    cta: "Submit Report",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <path d="M14 2v6h6"/>
        <path d="M16 13H8"/>
        <path d="M16 17H8"/>
        <path d="M10 9H8"/>
      </svg>
    ),
  },
  {
    num: "04",
    title: "Online Learning Centre",
    desc: "Access professional training modules, membership tiers, and certifications for transport safety experts.",
    href: "/learning-portal",
    cta: "Explore OLC",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
];

export default function OperationsCentrePage() {
  return (
    <main style={{ background: "var(--nsib-white)" }}>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <section className="page-hero" style={{
        backgroundColor: 'var(--nsib-navy)',
        color: 'white',
        padding: '10rem 0 8rem',
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
          <FadeIn delay={0.05}>
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
              Operations Centre
            </div>

            <h1 style={{
              fontSize: "clamp(2.6rem, 5vw, 4.5rem)",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: "800px",
              marginBottom: "1.5rem",
              textShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              Your central hub for tracking and reporting
            </h1>

            <p style={{
              fontSize: "1.25rem",
              color: "rgba(255, 255, 255, 0.8)",
              lineHeight: 1.6,
              maxWidth: "600px",
              textShadow: '0 5px 15px rgba(0,0,0,0.2)'
            }}>
              Real-time operational tools, secure reporting portals, and professional resources across aviation, maritime, and railway sectors.
            </p>
          </FadeIn>
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

      {/* ── Tools Grid — dark command-centre panel ───────────────────────── */}
      <section style={{
        padding: "6rem 0",
        background: "linear-gradient(135deg, var(--nsib-navy) 0%, #0d1435 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Dot pattern — same as homepage CTA */}
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: 0.05,
          backgroundImage: "radial-gradient(circle at 2px 2px, white 2px, transparent 0)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }} />

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <StaggerContainer className="responsive-grid-2col" style={{
          }}>
            {tools.map((tool) => (
              <StaggerItem key={tool.num}>
                <ScaleHover style={{ height: "100%" }}>
                  <div className={styles.card}>

                    {/* Ghost number */}
                    <span style={{
                      position: "absolute",
                      top: "1.5rem",
                      right: "2rem",
                      fontSize: "6rem",
                      fontWeight: 800,
                      color: "rgba(255, 255, 255, 0.04)",
                      lineHeight: 1,
                      letterSpacing: "-0.03em",
                      userSelect: "none",
                      pointerEvents: "none",
                    }}>
                      {tool.num}
                    </span>

                    {/* Icon */}
                    <div className={styles.icon}>
                      {tool.icon}
                    </div>

                    <h2 style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      color: "white",
                      letterSpacing: "-0.02em",
                      marginBottom: "0.85rem",
                    }}>
                      {tool.title}
                    </h2>

                    <p style={{
                      color: "rgba(255, 255, 255, 0.58)",
                      lineHeight: 1.8,
                      fontSize: "0.95rem",
                      marginBottom: "2.5rem",
                      flexGrow: 1,
                    }}>
                      {tool.desc}
                    </p>

                    <Link href={tool.href} className={styles.cta}>
                      {tool.cta}
                      <span style={{ fontSize: "1rem", lineHeight: 1 }}>→</span>
                    </Link>
                  </div>
                </ScaleHover>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Help Desk CTA ───────────────────────────────────────────────── */}
      <section style={{
        padding: "5rem 0",
        background: "var(--nsib-gray-50)",
        borderTop: "1px solid var(--nsib-gray-200)",
      }}>
        <div className="container">
          <FadeIn delay={0.1}>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "2rem",
            }}>
              <div style={{ maxWidth: "520px" }}>
                <p style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--nsib-slate-light)",
                  marginBottom: "1rem",
                }}>
                  Need Assistance?
                </p>
                <h2 style={{
                  fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                  fontWeight: 800,
                  color: "var(--nsib-navy)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  marginBottom: "1rem",
                }}>
                  Contact our Help Desk
                </h2>
                <p style={{
                  color: "var(--nsib-slate-light)",
                  lineHeight: 1.8,
                  fontSize: "1rem",
                }}>
                  For technical support or guidance on using these tools, our operations team is available during business hours.
                </p>
              </div>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link href="/help-desk" className="btn btn-primary">Visit Help Desk</Link>
                <Link href="/contact-us" className="btn btn-primary">Contact Us</Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

    </main>
  );
}

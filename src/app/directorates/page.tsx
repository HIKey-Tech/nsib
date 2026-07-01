import Link from "next/link";
import { FadeIn, StaggerContainer, StaggerItem, ScaleHover } from "@/components/ui/MotionWrapper";
import { directorates } from "./data";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Directorates",
  description:
    "Explore the directorates, departments and organisational structure of the Nigerian Safety Investigation Bureau (NSIB).",
  path: "/directorates",
});

export default function DirectoratesPage() {
  return (
    <main style={{ background: "var(--nsib-white)" }}>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
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
              Bureau Structure
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
              Nine directorates.<br />One mandate.
            </h1>

            <p style={{
              fontSize: "1.25rem",
              color: "rgba(255, 255, 255, 0.8)",
              lineHeight: 1.6,
              maxWidth: "600px",
              textShadow: '0 5px 15px rgba(0,0,0,0.2)'
            }}>
              The NSIB is structured into specialised operational and administrative arms. Each directorate plays a defined role in delivering independent, world-class transport safety investigation.
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

      {/* ── Count strip ──────────────────────────────────────────────────── */}
      <section style={{
        padding: "2rem 0",
        background: "var(--nsib-navy)",
      }}>
        <div className="container">
          <FadeIn delay={0.1}>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "3rem",
            }}>
              {[
                { value: "9", label: "Directorates" },
                { value: "3", label: "Transport Modes" },
                { value: "1", label: "Independent Mandate" },
              ].map((stat) => (
                <div key={stat.label}>
                  <span style={{
                    display: "block",
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    color: "var(--nsib-white)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}>{stat.value}</span>
                  <span style={{
                    display: "block",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.5)",
                    marginTop: "0.4rem",
                  }}>{stat.label}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Directorates Grid ─────────────────────────────────────────────── */}
      <section style={{ padding: "5rem 0 6rem", background: "var(--nsib-gray-50)" }}>
        <div className="container">
          <StaggerContainer style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
            gap: "1.75rem",
          }}>
            {directorates.map((d) => (
              <StaggerItem key={d.num}>
                <ScaleHover style={{ height: "100%", display: "block" }}>
                  <Link href={`/directorates/${d.slug}`} style={{
                    display: "flex",
                    flexDirection: "column",
                    background: "white",
                    borderRadius: "var(--radius-lg)",
                    padding: "2.5rem",
                    boxShadow: "0 2px 16px rgba(27, 42, 107, 0.07)",
                    borderTop: `4px solid ${d.accent}`,
                    height: "100%",
                    transition: "box-shadow 0.2s ease",
                  }}>

                    {/* Ghost number */}
                    <span style={{
                      display: "block",
                      fontSize: "2.5rem",
                      fontWeight: 800,
                      color: "var(--nsib-gray-200)",
                      lineHeight: 1,
                      letterSpacing: "-0.03em",
                      marginBottom: "1.5rem",
                    }}>{d.num}</span>

                    <h3 style={{
                      fontSize: "1.15rem",
                      fontWeight: 800,
                      color: "var(--nsib-navy)",
                      marginBottom: "0.75rem",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.25,
                    }}>
                      {d.label}
                    </h3>

                    <p style={{
                      color: "var(--nsib-slate-light)",
                      fontSize: "0.92rem",
                      lineHeight: 1.75,
                      flexGrow: 1,
                      marginBottom: "1.75rem",
                    }}>
                      {d.desc}
                    </p>

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      color: "var(--nsib-red)",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}>
                      <span>View Directorate</span>
                      <span>→</span>
                    </div>

                  </Link>
                </ScaleHover>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

    </main>
  );
}

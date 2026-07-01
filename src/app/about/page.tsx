import Link from "next/link";
import { FadeIn, StaggerContainer, StaggerItem, ScaleHover } from "@/components/ui/MotionWrapper";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "About the Bureau",
  description:
    "The Nigerian Safety Investigation Bureau (NSIB) is an independent federal agency mandated to investigate aviation, maritime and railway accidents — determining causes, not apportioning blame.",
  path: "/about",
});

const modes = [
  {
    num: "01",
    label: "Aviation",
    desc: "Civil aircraft accidents and serious incidents within Nigerian airspace and territory.",
  },
  {
    num: "02",
    label: "Maritime",
    desc: "Vessel casualties, collisions, and incidents on Nigerian inland and coastal waters.",
  },
  {
    num: "03",
    label: "Rail",
    desc: "Train derailments, collisions, and incidents on the national railway network.",
  },
];

export default function AboutPage() {
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
              About the Bureau
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
              Nigeria's independent transport safety investigator
            </h1>

            <p style={{
              fontSize: "1.25rem",
              color: "rgba(255, 255, 255, 0.8)",
              lineHeight: 1.6,
              maxWidth: "600px",
              textShadow: '0 5px 15px rgba(0,0,0,0.2)'
            }}>
              The Nigerian Safety Investigation Bureau (NSIB) is a federal agency
              tasked with investigating transport accidents and serious incidents
              across air, sea, and rail — not to assign blame, but to prevent recurrence.
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

      {/* ── Mission & Vision ─────────────────────────────────────────────── */}
      <section style={{ padding: "5rem 0", background: "var(--nsib-gray-50)" }}>
        <div className="container" style={{}}>
          <StaggerContainer style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: "2rem",
          }}>

            <StaggerItem>
              <div style={{
                background: "white",
                borderRadius: "var(--radius-lg)",
                padding: "2.75rem",
                boxShadow: "0 2px 16px rgba(27, 42, 107, 0.07)",
                borderTop: "4px solid var(--nsib-red)",
                height: "100%",
              }}>
                <p style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--nsib-red)",
                  marginBottom: "1.25rem",
                }}>Mission</p>
                <h2 style={{
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: "var(--nsib-navy)",
                  letterSpacing: "-0.02em",
                  marginBottom: "1rem",
                }}>What We Do</h2>
                <p style={{
                  color: "var(--nsib-slate)",
                  lineHeight: 1.85,
                  fontSize: "1rem",
                }}>
                  To independently investigate transport accidents and serious incidents,
                  determine probable causes, and issue safety recommendations to prevent
                  recurrence across Nigeria's transport network.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div style={{
                background: "white",
                borderRadius: "var(--radius-lg)",
                padding: "2.75rem",
                boxShadow: "0 2px 16px rgba(27, 42, 107, 0.07)",
                borderTop: "4px solid var(--nsib-navy)",
                height: "100%",
              }}>
                <p style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--nsib-navy)",
                  marginBottom: "1.25rem",
                }}>Vision</p>
                <h2 style={{
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: "var(--nsib-navy)",
                  letterSpacing: "-0.02em",
                  marginBottom: "1rem",
                }}>Where We're Headed</h2>
                <p style={{
                  color: "var(--nsib-slate)",
                  lineHeight: 1.85,
                  fontSize: "1rem",
                }}>
                  To be an independent, world-class multi-modal transport safety
                  investigation agency — setting the standard for safety governance
                  across Africa and beyond.
                </p>
              </div>
            </StaggerItem>

          </StaggerContainer>
        </div>
      </section>

      {/* ── Areas of Investigation ───────────────────────────────────────── */}
      <section style={{ padding: "5rem 0", background: "white", borderTop: "1px solid var(--nsib-gray-200)" }}>
        <div className="container" style={{}}>
          <FadeIn delay={0.1}>
            <p style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--nsib-slate-light)",
              marginBottom: "3rem",
            }}>Areas of Investigation</p>
          </FadeIn>

          <StaggerContainer style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: "0",
          }}>
            {modes.map((mode, i) => (
              <StaggerItem key={mode.num}>
                <div style={{
                  padding: "0 2.5rem 0 0",
                  borderLeft: i > 0 ? "1px solid var(--nsib-gray-200)" : "none",
                  paddingLeft: i > 0 ? "2.5rem" : "0",
                }}>
                  <span style={{
                    display: "block",
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    color: "var(--nsib-gray-200)",
                    lineHeight: 1,
                    marginBottom: "0.75rem",
                    letterSpacing: "-0.03em",
                  }}>{mode.num}</span>
                  <h3 style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "var(--nsib-navy)",
                    marginBottom: "0.75rem",
                    letterSpacing: "-0.01em",
                  }}>{mode.label}</h3>
                  <p style={{
                    color: "var(--nsib-slate-light)",
                    fontSize: "0.9rem",
                    lineHeight: 1.75,
                  }}>{mode.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Explore ──────────────────────────────────────────────────────── */}
      <section style={{
        padding: "5rem 0",
        background: "var(--nsib-gray-50)",
        borderTop: "1px solid var(--nsib-gray-200)",
      }}>
        <div className="container" style={{}}>
          <FadeIn delay={0.1}>
            <p style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--nsib-slate-light)",
              marginBottom: "2rem",
            }}>Explore Further</p>
          </FadeIn>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "1.5rem",
          }}>
            {[
              {
                href: "/history",
                label: "NSIB History",
                desc: "Our evolution, milestones, and mandate since establishment.",
              },
              {
                href: "/team",
                label: "Management Team",
                desc: "The leadership steering our agency's operations and strategy.",
              },
            ].map((card) => (
              <ScaleHover key={card.href} style={{ display: "block" }}>
                <Link href={card.href} style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "2.5rem",
                  background: "white",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "0 2px 16px rgba(27, 42, 107, 0.07)",
                  border: "1px solid var(--nsib-gray-200)",
                  minHeight: "200px",
                  transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                }}>
                  <div>
                    <h3 style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "var(--nsib-navy)",
                      marginBottom: "0.75rem",
                      letterSpacing: "-0.02em",
                    }}>{card.label}</h3>
                    <p style={{
                      color: "var(--nsib-slate-light)",
                      fontSize: "0.9rem",
                      lineHeight: 1.7,
                    }}>{card.desc}</p>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    marginTop: "1.75rem",
                    color: "var(--nsib-red)",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}>
                    <span>Learn More</span>
                    <span>→</span>
                  </div>
                </Link>
              </ScaleHover>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}

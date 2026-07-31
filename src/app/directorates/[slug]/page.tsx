import Link from "next/link";
import { notFound } from "next/navigation";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/MotionWrapper";
import { directorates, findDirectorateBySlug } from "../data";

export default async function DirectorateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const directorate = findDirectorateBySlug(slug);

  if (!directorate) {
    notFound();
  }

  const currentIndex = directorates.findIndex((d) => d.slug === slug);
  const prev = currentIndex > 0 ? directorates[currentIndex - 1] : null;
  const next = currentIndex < directorates.length - 1 ? directorates[currentIndex + 1] : null;

  return (
    <main style={{ background: "var(--nsib-white)" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{
        position: "relative",
        padding: "6rem 0 5.5rem",
        borderBottom: "1px solid var(--nsib-gray-200)",
        overflow: "hidden",
      }}>
        {/* Giant watermark number — the visual anchor */}
        <span aria-hidden style={{
          position: "absolute",
          right: "-1rem",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "clamp(6rem, 22vw, 20rem)",
          fontWeight: 800,
          color: "rgba(27, 42, 107, 0.045)",
          lineHeight: 1,
          letterSpacing: "-0.05em",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0,
        }}>
          {directorate.num}
        </span>

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <FadeIn delay={0.05}>
            {/* Back link */}
            <Link href="/directorates" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.85rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--nsib-slate-light)",
              marginBottom: "3rem",
              transition: "color 0.2s ease",
            }}>
              <span>←</span>
              <span>All Directorates</span>
            </Link>

            {/* Left accent bar + title block */}
            <div style={{
              borderLeft: `4px solid ${directorate.accent}`,
              paddingLeft: "clamp(1rem, 5vw, 2.25rem)",
            }}>
              {/* Tags row */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <span style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--nsib-white)",
                  background: directorate.accent,
                  padding: "0.35rem 0.85rem",
                  borderRadius: "2px",
                }}>
                  Directorate
                </span>
                <span style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--nsib-slate-light)",
                  border: "1px solid var(--nsib-gray-200)",
                  padding: "0.35rem 0.85rem",
                  borderRadius: "2px",
                }}>
                  {directorate.category}
                </span>
              </div>

              <h1 style={{
                fontSize: "clamp(1.9rem, 4.5vw, 3.75rem)",
                fontWeight: 800,
                color: "var(--nsib-navy)",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                maxWidth: "720px",
                marginBottom: "1.75rem",
              }}>
                {directorate.label}
              </h1>

              <p style={{
                fontSize: "1.3rem",
                color: "var(--nsib-slate-light)",
                lineHeight: 1.85,
                maxWidth: "600px",
              }}>
                {directorate.desc}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Mandate — dark statement block ────────────────────────────────── */}
      <section style={{
        background: "var(--nsib-navy)",
        padding: "5rem 0",
      }}>
        <div className="container">
          <FadeIn delay={0.1}>
            <p style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255, 255, 255, 0.35)",
              marginBottom: "2rem",
            }}>
              Mandate
            </p>

            <div style={{
              borderLeft: `3px solid ${directorate.accent}`,
              paddingLeft: "2.5rem",
              maxWidth: "760px",
            }}>
              <p style={{
                fontSize: "clamp(1.3rem, 2.5vw, 1.65rem)",
                color: "var(--nsib-white)",
                lineHeight: 1.9,
                fontWeight: 400,
              }}>
                {directorate.mandate}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Key Functions — editorial vertical list ───────────────────────── */}
      <section style={{
        padding: "5.5rem 0 6rem",
        background: "var(--nsib-white)",
        borderTop: "1px solid var(--nsib-gray-200)",
      }}>
        <div className="container">
          <FadeIn delay={0.05}>
            <p style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--nsib-slate-light)",
              marginBottom: "0.75rem",
            }}>
              Key Functions
            </p>
            <p style={{
              fontSize: "1.1rem",
              color: "var(--nsib-slate-light)",
              marginBottom: "3rem",
              maxWidth: "500px",
              lineHeight: 1.65,
            }}>
              The primary responsibilities of this directorate within the Bureau.
            </p>
          </FadeIn>

          <div style={{ maxWidth: "860px" }}>
            <div style={{ borderTop: "1px solid var(--nsib-gray-200)" }}>
              <StaggerContainer>
                {directorate.functions.map((fn, i) => (
                  <StaggerItem key={i}>
                    <div style={{
                      display: "flex",
                      gap: "3rem",
                      alignItems: "flex-start",
                      padding: "2.25rem 0",
                      borderBottom: "1px solid var(--nsib-gray-200)",
                    }}>
                      {/* Number */}
                      <span style={{
                        flexShrink: 0,
                        fontSize: "0.95rem",
                        fontWeight: 800,
                        color: directorate.accent,
                        letterSpacing: "-0.01em",
                        minWidth: "2.5rem",
                        paddingTop: "0.2rem",
                        fontVariantNumeric: "tabular-nums",
                      }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      {/* Function text */}
                      <p style={{
                        color: "var(--nsib-slate)",
                        fontSize: "1.15rem",
                        lineHeight: 1.8,
                        margin: 0,
                      }}>
                        {fn}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ── Directorate Navigation ────────────────────────────────────────── */}
      <section style={{
        padding: "4rem 0",
        background: "var(--nsib-gray-50)",
        borderTop: "1px solid var(--nsib-gray-200)",
      }}>
        <div className="container">
          <div className="responsive-grid-2col" style={{
          }}>

            {prev ? (
              <Link href={`/directorates/${prev.slug}`} style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "2rem",
                background: "white",
                borderRadius: "var(--radius-lg)",
                boxShadow: "0 2px 16px rgba(27, 42, 107, 0.07)",
                border: "1px solid var(--nsib-gray-200)",
                overflow: "hidden",
                transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                minHeight: "150px",
              }}>
                <span aria-hidden style={{
                  position: "absolute",
                  left: "-0.5rem",
                  bottom: "-1rem",
                  fontSize: "6rem",
                  fontWeight: 800,
                  color: "rgba(27, 42, 107, 0.05)",
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  pointerEvents: "none",
                  userSelect: "none",
                }}>{prev.num}</span>

                <span style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--nsib-slate-light)",
                }}>← Previous</span>

                <span style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "var(--nsib-navy)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.25,
                  maxWidth: "240px",
                  position: "relative",
                  zIndex: 1,
                }}>
                  {prev.label}
                </span>
              </Link>
            ) : <div />}

            {next ? (
              <Link href={`/directorates/${next.slug}`} style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "flex-end",
                padding: "2rem",
                background: "white",
                borderRadius: "var(--radius-lg)",
                boxShadow: "0 2px 16px rgba(27, 42, 107, 0.07)",
                border: "1px solid var(--nsib-gray-200)",
                overflow: "hidden",
                transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                minHeight: "150px",
              }}>
                <span aria-hidden style={{
                  position: "absolute",
                  right: "-0.5rem",
                  bottom: "-1rem",
                  fontSize: "6rem",
                  fontWeight: 800,
                  color: "rgba(27, 42, 107, 0.05)",
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  pointerEvents: "none",
                  userSelect: "none",
                }}>{next.num}</span>

                <span style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--nsib-slate-light)",
                }}>Next →</span>

                <span style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "var(--nsib-navy)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.25,
                  textAlign: "right",
                  maxWidth: "240px",
                  position: "relative",
                  zIndex: 1,
                }}>
                  {next.label}
                </span>
              </Link>
            ) : <div />}

          </div>
        </div>
      </section>

    </main>
  );
}

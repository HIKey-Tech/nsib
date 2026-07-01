import Link from "next/link";

export const metadata = {
  title: "The Bureau | NSIB",
  description:
    "The Nigerian Safety Investigation Bureau (NSIB) — an autonomous agency investigating transportation accidents and serious incidents to improve safety.",
};

const bureau = [
  "The Nigerian Safety Investigation Bureau (NSIB) is an autonomous agency that reports to the President of the Federal Republic of Nigeria through the Office of the National Security Adviser (NSA). It is charged with the responsibility to investigate transportation accidents and serious incidents occurring either in or over Nigeria, or involving Nigerian-registered aircraft, ships, trains, or vehicles elsewhere.",
  "The fundamental objective of the NSIB is to improve transportation safety by determining the circumstances and causes of accidents and serious incidents and providing safety recommendations intended to prevent recurrence. The purpose of these investigations is to enhance safety and is not to apportion blame or liability.",
];

const background = [
  "Before its transition into a multimodal transportation investigation body, the NSIB was known as the Accident Investigation Bureau (AIB), primarily focused on air accidents and serious incidents. The NSIB Act 2022 repealed the previous establishment Act of the AIB under the Civil Aviation Act 2006, expanding the Bureau’s mandate to include maritime, rail, and other transport modes.",
  "In the past, accident investigations were conducted by the Civil Aviation Department (CAD) of the Ministry of Aviation. The CAD also handled Airworthiness Certification; however, these functions were eventually separated to comply with ICAO Annex 8 (Airworthiness of Aircraft) and Annex 13 (Aircraft Accident and Incident Investigation) to ensure total objectivity.",
  "In 1989, the Federal Civil Aviation Authority (FCAA) was created, and the CAD became the Department of Safety Services. Concurrently, a new investigative department, the Accident Investigation Bureau (AIB), was established under the Federal Ministry of Aviation. The Nigerian Civil Aviation Policy of 2001 later recommended the creation of a financially independent agency to guarantee the expeditious movement of investigators to accident sites.",
  "While the Civil Aviation Act of 2006 established the AIB as an autonomous agency reporting through the Minister of Aviation, the current legal and administrative framework under the NSIB Act 2022 elevates the Bureau’s reporting line directly to the Presidency via the Office of the National Security Adviser (NSA). Under this Act, the Bureau is headed by a Director-General, who also serves as the Chief Executive Officer.",
];

export default function BureauPage() {
  return (
    <main style={{ paddingBottom: "6rem", overflowX: "hidden" }}>
      {/* Hero */}
      <section
        className="page-hero"
        style={{
          backgroundColor: "var(--nsib-navy)",
          color: "white",
          padding: "10rem 2rem 8rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(226, 48, 48, 0.15) 0%, transparent 50%)",
            zIndex: 0,
          }}
        />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div style={{ maxWidth: "820px" }}>
            <Link
              href="/about"
              style={{
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
              }}
            >
              <span>←</span>
              <span>Back to About</span>
            </Link>
            <div
              style={{
                display: "inline-flex",
                padding: "0.5rem 1rem",
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "30px",
                marginBottom: "1.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              About the NSIB
            </div>
            <h1
              style={{
                color: "white",
                fontSize: "clamp(3rem, 5vw, 4.5rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: "1.5rem",
                textShadow: "0 10px 30px rgba(0,0,0,0.3)",
              }}
            >
              The Bureau
            </h1>
            <p
              style={{
                fontSize: "1.25rem",
                color: "rgba(255, 255, 255, 0.8)",
                maxWidth: "620px",
                lineHeight: 1.6,
              }}
            >
              An autonomous agency charged with investigating transportation
              accidents and serious incidents across Nigeria — to improve safety,
              not to apportion blame.
            </p>
          </div>
        </div>
      </section>

      {/* The Bureau */}
      <div className="container" style={{ marginTop: "3rem" }}>
        <div className="glass-panel" style={{ padding: "2.5rem", lineHeight: 1.9 }}>
          <h2 className="text-navy" style={{ fontSize: "1.4rem", marginBottom: "1.25rem" }}>
            The Bureau
          </h2>
          {bureau.map((para, i) => (
            <p key={i} className="text-slate" style={{ marginBottom: "1rem" }}>
              {para}
            </p>
          ))}
        </div>
      </div>

      {/* Historical Background */}
      <div className="container" style={{ marginTop: "2.5rem" }}>
        <div className="glass-panel" style={{ padding: "2.5rem", lineHeight: 1.9 }}>
          <h2 className="text-navy" style={{ fontSize: "1.4rem", marginBottom: "1.25rem" }}>
            Historical Background
          </h2>
          {background.map((para, i) => (
            <p key={i} className="text-slate" style={{ marginBottom: "1rem" }}>
              {para}
            </p>
          ))}
        </div>
      </div>
    </main>
  );
}

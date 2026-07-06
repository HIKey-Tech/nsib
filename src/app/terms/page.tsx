import Link from "next/link";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Terms of Service",
  description:
    "Terms and conditions governing the use of the Nigerian Safety Investigation Bureau (NSIB) website.",
  path: "/terms",
});

const sections = [
  {
    heading: "1. Acceptance of Terms",
    body: [
      "These Terms of Service (\"Terms\") govern your access to and use of the official website of the Nigerian Safety Investigation Bureau (NSIB), nsib.gov.ng (the \"Site\"). By accessing or using the Site, you agree to be bound by these Terms. If you do not agree, please discontinue use of the Site.",
    ],
  },
  {
    heading: "2. Use of the Site",
    body: [
      "The Site is provided for the purpose of sharing information about NSIB's mandate, investigations, publications, and services with the public. You may view, download, and print content from the Site for personal, non-commercial, or official reference use, provided you do not modify the content and retain all copyright and attribution notices.",
      "You agree not to use the Site in any way that could damage, disable, overburden, or impair it, or interfere with any other party's use of the Site, including attempting to gain unauthorised access to any account, system, or network connected to the Site.",
    ],
  },
  {
    heading: "3. Accuracy of Information",
    body: [
      "NSIB makes reasonable efforts to ensure that information published on the Site — including reports, press releases, and directory information — is accurate and up to date. However, investigation reports, findings, and safety recommendations may be revised as investigations progress. NSIB does not warrant that the Site will be error-free or that content will always be current.",
      "Preliminary and interim reports reflect the information available at the time of publication and are subject to change as an investigation continues. The final report supersedes any preliminary or interim material on the same occurrence.",
    ],
  },
  {
    heading: "4. Reporting an Accident or Incident",
    body: [
      "Facilities on the Site for reporting an accident or incident, or for submitting comments, enquiries, or documents, are provided in good faith to support NSIB's statutory functions. Submitting a report does not create any client, contractual, or confidentiality relationship beyond what is provided for under the NSIB Act and applicable law.",
    ],
  },
  {
    heading: "5. Intellectual Property",
    body: [
      "Unless otherwise indicated, all content on the Site — including text, graphics, logos, and the NSIB name and crest — is the property of the Nigerian Safety Investigation Bureau or its licensors and is protected by applicable intellectual property laws. Reproduction for commercial purposes without prior written permission is prohibited.",
    ],
  },
  {
    heading: "6. External Links",
    body: [
      "The Site may contain links to third-party websites (for example, partner agencies or flight/vessel tracking providers) for convenience. NSIB does not control and is not responsible for the content, accuracy, or privacy practices of external sites, and inclusion of a link does not imply endorsement.",
    ],
  },
  {
    heading: "7. Limitation of Liability",
    body: [
      "To the fullest extent permitted by law, NSIB shall not be liable for any direct, indirect, incidental, or consequential loss or damage arising from your use of, or inability to use, the Site, or from reliance on any information published on it.",
    ],
  },
  {
    heading: "8. Changes to These Terms",
    body: [
      "NSIB may update these Terms from time to time to reflect changes in the law, our practices, or the Site's functionality. The revised Terms will be posted on this page with an updated effective date. Continued use of the Site after changes are posted constitutes acceptance of the revised Terms.",
    ],
  },
  {
    heading: "9. Governing Law",
    body: [
      "These Terms are governed by the laws of the Federal Republic of Nigeria, including the Nigerian Safety Investigation Bureau (Establishment) Act, 2022. Any dispute arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Nigeria.",
    ],
  },
  {
    heading: "10. Contact Us",
    body: [
      "Questions about these Terms may be sent to info@nsib.gov.ng or addressed to the Nigerian Safety Investigation Bureau, Nnamdi Azikiwe International Airport, Abuja, Federal Capital Territory, Nigeria.",
    ],
  },
];

export default function TermsPage() {
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
              href="/"
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
              <span>Back to Home</span>
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
              Legal
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
              Terms of Service
            </h1>
            <p
              style={{
                fontSize: "1.25rem",
                color: "rgba(255, 255, 255, 0.8)",
                maxWidth: "620px",
                lineHeight: 1.6,
              }}
            >
              The terms and conditions governing your use of the NSIB website.
            </p>
            <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.55)", marginTop: "1rem" }}>
              Effective date: 6 July 2026
            </p>
          </div>
        </div>
      </section>

      {/* Sections */}
      <div className="container" style={{ marginTop: "3rem", maxWidth: "900px" }}>
        {sections.map((s, i) => (
          <div key={s.heading} className="glass-panel" style={{ padding: "2.5rem", lineHeight: 1.9, marginTop: i === 0 ? 0 : "1.5rem" }}>
            <h2 className="text-navy" style={{ fontSize: "1.4rem", marginBottom: "1.25rem" }}>
              {s.heading}
            </h2>
            {s.body.map((para, j) => (
              <p key={j} className="text-slate" style={{ marginBottom: j === s.body.length - 1 ? 0 : "1rem", textAlign: "justify" }}>
                {para}
              </p>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}

import Link from "next/link";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Privacy Policy",
  description:
    "How the Nigerian Safety Investigation Bureau (NSIB) collects, uses, and protects information on its website.",
  path: "/privacy-policy",
});

const sections = [
  {
    heading: "1. Introduction",
    body: [
      "The Nigerian Safety Investigation Bureau (NSIB) respects your privacy. This Privacy Policy explains what information we collect through nsib.gov.ng (the \"Site\"), how we use it, and the choices available to you.",
    ],
  },
  {
    heading: "2. Information You Provide",
    body: [
      "We collect information you choose to submit through forms on the Site, such as accident/incident reports, contact enquiries, comments on regulations, vacancy applications, or training registrations. This may include your name, email address, phone number, organisation, and the details of your enquiry or submission.",
      "This information is used solely to respond to your request, process your submission, or carry out NSIB's statutory investigative functions, and is not sold or rented to third parties.",
    ],
  },
  {
    heading: "3. Information Collected Automatically",
    body: [
      "Like most websites, the Site automatically logs basic technical information such as the page visited, referring page, and approximate timestamp, to help us understand usage and improve the Site.",
      "We use a first-party cookie (\"nsib_vid\") to distinguish unique visits for aggregate analytics. This cookie does not contain personal information and cannot identify you individually. Staff and admin users who log in to the dashboard receive a separate, secure session cookie (\"nsib_token\") required to keep them signed in.",
    ],
  },
  {
    heading: "4. Cookies",
    body: [
      "Cookies are small text files stored on your device. We use only the cookies described above (visit analytics and, for authenticated staff, session login) — we do not use third-party advertising or tracking cookies. You can disable cookies in your browser settings, though this may affect sign-in functionality for staff accounts.",
    ],
  },
  {
    heading: "5. How We Use Information",
    body: [
      "Information collected is used to: respond to enquiries and accident/incident reports; process training registrations and job applications; publish reports, press releases, and public notices; maintain the security and proper functioning of the Site; and comply with our legal and statutory obligations under the NSIB Act, 2022.",
    ],
  },
  {
    heading: "6. Sharing of Information",
    body: [
      "NSIB does not sell or trade personal information. We may share information with other government agencies or international investigation bodies (e.g. under ICAO Annex 13 or equivalent maritime/rail protocols) where necessary to carry out an investigation, or where required by law.",
    ],
  },
  {
    heading: "7. Data Security",
    body: [
      "We apply reasonable administrative and technical safeguards to protect information submitted through the Site, including encrypted connections (HTTPS) and access controls for staff accounts. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    heading: "8. Your Rights",
    body: [
      "You may request access to, correction of, or deletion of personal information you have submitted to us, subject to our statutory record-keeping obligations. Requests can be made via info@nsib.gov.ng.",
    ],
  },
  {
    heading: "9. External Links",
    body: [
      "The Site links to third-party services (for example, flight and vessel tracking providers, webmail, and social platforms). Their own privacy policies govern any information you provide directly to them, and NSIB is not responsible for their practices.",
    ],
  },
  {
    heading: "10. Children's Privacy",
    body: [
      "The Site is intended for a general public and professional audience and is not directed at children. We do not knowingly collect personal information from children.",
    ],
  },
  {
    heading: "11. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. Changes will be posted on this page with a revised effective date. We encourage you to review this page periodically.",
    ],
  },
  {
    heading: "12. Contact Us",
    body: [
      "Questions about this Privacy Policy may be sent to info@nsib.gov.ng or addressed to the Nigerian Safety Investigation Bureau, Nnamdi Azikiwe International Airport, Abuja, Federal Capital Territory, Nigeria.",
    ],
  },
];

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p
              style={{
                fontSize: "1.25rem",
                color: "rgba(255, 255, 255, 0.8)",
                maxWidth: "620px",
                lineHeight: 1.6,
              }}
            >
              How we collect, use, and protect information on the NSIB website.
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

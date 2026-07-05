"use client";

import Link from "next/link";
import styles from "./open-ticket.module.css";

export default function OpenTicketPage() {
  // Opens the requester's own mail client addressed to NSIB. encodeURIComponent
  // neutralises special characters in user input, so nothing can inject extra
  // mailto headers or markup.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const subject = encodeURIComponent("Status Update Request");
    const body = encodeURIComponent(
      `Name: ${v("name")}\n` +
      `Email: ${v("email")}\n` +
      `Reference (date/subject of original enquiry): ${v("reference") || "Not specified"}\n\n` +
      `Details:\n${v("details")}`
    );
    window.location.href = `mailto:info@nsib.gov.ng?subject=${subject}&body=${body}`;
  }

  return (
    <div className={styles.page}>
      {/* Antigravity Hero Section */}
      <section className="page-hero" style={{
        backgroundColor: 'var(--nsib-navy)',
        color: 'white',
        padding: '10rem 2rem 8rem',
        position: 'relative',
        transformStyle: 'preserve-3d',
        overflow: 'hidden',
        marginBottom: '4rem'
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
          <div style={{ maxWidth: "800px" }}>
            <Link href="/operations-centre" style={{
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
              transition: "color 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "white"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
            >
              <span>←</span>
              <span>Back to Operations Centre</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(226, 48, 48, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(226, 48, 48, 0.2)'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E23030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <span style={{
                padding: '0.4rem 1rem',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '50px',
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                backdropFilter: 'blur(10px)'
              }}>Operations Centre</span>
            </div>

            <h1 style={{
              color: 'white',
              fontSize: 'clamp(3rem, 5vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              textShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              Request a Status Update
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '600px',
              lineHeight: 1.6,
              textShadow: '0 5px 15px rgba(0,0,0,0.2)',
              marginBottom: '2rem'
            }}>
              There&apos;s no automated ticket tracker yet. Tell us about the General Enquiry or FOI request you previously submitted, and our team will follow up by email.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }} />
                <span>No login required</span>
              </div>
              <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <div>Response via email</div>
            </div>
          </div>
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

      {/* Content */}
      <div className={styles.content}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.infoCard}>
            <h4>Before You Submit</h4>
            <ul className={styles.infoList}>
              <li className={styles.infoListItem}>
                <div className={styles.infoListIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                  </svg>
                </div>
                <div>
                  <span className={styles.infoListLabel}>Include</span>
                  <span className={styles.infoListValue}>The date and subject of your original enquiry</span>
                </div>
              </li>
              <li className={styles.infoListItem}>
                <div className={styles.infoListIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div>
                  <span className={styles.infoListLabel}>Response Time</span>
                  <span className={styles.infoListValue}>1–3 business days</span>
                </div>
              </li>
              <li className={styles.infoListItem}>
                <div className={styles.infoListIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <span className={styles.infoListLabel}>Email</span>
                  <span className={styles.infoListValue}>info@nsib.gov.ng</span>
                </div>
              </li>
              <li className={styles.infoListItem}>
                <div className={styles.infoListIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.07 19 19.45 19.45 0 0 1 5 12.93 19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <span className={styles.infoListLabel}>Phone</span>
                  <span className={styles.infoListValue}>+234 807 709 0908 / 0909</span>
                </div>
              </li>
            </ul>
          </div>
        </aside>

        {/* Form */}
        <main className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2>Request an Update</h2>
            <span className={styles.formTag}>Via Email</span>
          </div>

          <form className={styles.formBody} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ot-name">Full Name</label>
                <input id="ot-name" name="name" type="text" required className={styles.input} placeholder="Enter your full name" />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ot-email">Email Address</label>
                <input id="ot-email" name="email" type="email" required className={styles.input} placeholder="your@email.com" />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ot-reference">
                Original Enquiry Reference <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
              </label>
              <input
                id="ot-reference"
                name="reference"
                type="text"
                className={styles.input}
                placeholder="e.g. date submitted, subject line, or FOI reference number"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ot-details">Details</label>
              <textarea
                id="ot-details"
                name="details"
                required
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Briefly describe the General Enquiry or FOI request you'd like an update on."
              />
            </div>

            <div className={styles.submitRow}>
              <span className={styles.submitNote}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
                Opens your email client, addressed to info@nsib.gov.ng.
              </span>
              <button type="submit" className={styles.submitBtn}>
                <span>Send Request</span>
                <svg className={styles.submitArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

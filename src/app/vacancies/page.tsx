import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/MotionWrapper";
import styles from "./vacancies.module.css";
import Link from "next/link";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers & Vacancies | NSIB",
  description: "Join our team of dedicated professionals committed to advancing transport safety in Nigeria.",
};

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LineChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default function VacanciesPage() {
  const values = [
    {
      icon: <ShieldIcon />,
      title: "Purpose-Driven Mission",
      description: "Make a tangible impact on National Safety. Every investigation and recommendation you contribute to directly saves lives across Nigeria."
    },
    {
      icon: <LineChartIcon />,
      title: "Professional Growth",
      description: "Work alongside industry-leading investigators and analysts. We foster a dynamic environment dedicated to continuous technical learning."
    },
    {
      icon: <UserIcon />,
      title: "Collaborative Culture",
      description: "Join a supportive, multidisciplinary team that values diverse analytical perspectives when solving complex transportation challenges."
    }
  ];

  return (
    <main className={styles.pageContainer}>
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
          <FadeIn delay={0.05}>
            <div style={{ maxWidth: "800px" }}>
              <Link href="/contact-us" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                marginBottom: "2rem",
                textDecoration: "none"
              }}>
                <span>←</span>
                <span>Back to Contact</span>
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
                Opportunities
              </div>
              <h1 style={{ 
                color: 'white', 
                fontSize: 'clamp(2rem, 5vw, 4.5rem)', 
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: '1.5rem',
                textShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                Careers & Vacancies
              </h1>
              <p style={{ 
                fontSize: '1.25rem', 
                color: 'rgba(255, 255, 255, 0.8)', 
                maxWidth: '600px', 
                lineHeight: 1.6,
                textShadow: '0 5px 15px rgba(0,0,0,0.2)'
              }}>
                Join our team of dedicated professionals committed to advancing transport safety in Nigeria and across the global community.
              </p>
            </div>
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

      <div className={styles.mainContent}>
        <FadeIn delay={0.3}>
          <div className={styles.statusCard}>
            <div className={styles.statusIcon}>
              <MailIcon />
            </div>
            <h2>No Current Openings</h2>
            <p>
              We currently do not have any open positions. However, we are always looking for exceptional talent. Join our talent pool to be notified immediately when new opportunities arise.
            </p>
            
            <form className={styles.notifyForm}>
              <input 
                type="email" 
                placeholder="Enter your email address..." 
                className={styles.inputField} 
                required 
              />
              <button type="submit" className={styles.submitBtn}>
                Subscribe
              </button>
            </form>
          </div>
        </FadeIn>

        <section className={styles.valueSection}>
          <FadeIn delay={0.4} className={styles.valueHeader}>
            <h3>Why Join NSIB?</h3>
            <p>Building a safer tomorrow, starting with our people.</p>
          </FadeIn>

          <StaggerContainer className={styles.valuesGrid}>
            {values.map((val, idx) => (
              <StaggerItem key={idx}>
                <div className={styles.valueItem}>
                  <div className={styles.valueIcon}>{val.icon}</div>
                  <h4>{val.title}</h4>
                  <p>{val.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </div>
    </main>
  );
}

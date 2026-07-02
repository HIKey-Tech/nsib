import React from "react";
import Link from "next/link";
import styles from "./page.module.css";
import TrainingsList from "./TrainingsList";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Portal | Nigerian Safety Investigation Bureau",
  description: "Access NSIB's learning resources, courses, and certifications.",
};

export default function LearningPortal() {
  return (
    <main className={styles.main}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(135deg, var(--nsib-navy) 0%, #0d1435 100%)",
        color: "white",
        padding: "9rem 2rem 6rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "36px 36px" }} />
        <div style={{ position: "absolute", bottom: "-8%", right: "4%", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, rgba(226,48,48,0.12), transparent 70%)" }} />

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div style={{ animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" }}>
            <span style={{
              display: "inline-block",
              padding: "0.35rem 1rem",
              background: "rgba(226,48,48,0.2)",
              border: "1px solid rgba(226,48,48,0.3)",
              color: "#ffbaba",
              borderRadius: "50px",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}>
              NSIB LEARNING PORTAL
            </span>
            <h1 style={{ color: "white", fontSize: "clamp(2.2rem,4.5vw,4rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1rem", maxWidth: "660px" }}>
              Learning Portal
            </h1>
            <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", maxWidth: "540px", lineHeight: 1.7 }}>
              Enhance your knowledge with our safety courses, training modules, and certification programs.
            </p>
          </div>

          <div style={{ display: "flex", gap: "3rem", marginTop: "3rem", animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
            {[
              { num: "3", label: "Core Courses" },
              { num: "✓", label: "Certification" },
              { num: "24/7", label: "Access" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "white", lineHeight: 1 }}>{s.num}</div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem", marginTop: "0.2rem" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className="container">
          <TrainingsList />

          <div className={styles.comingSoon}>
            <h2>More courses are coming soon!</h2>
            <p>We are actively developing new curriculum to support our stakeholders.</p>
            <Link href="/" className="btn btn-outline" style={{ marginTop: "1.5rem", display: "inline-block" }}>
              Return to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

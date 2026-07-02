"use client";

import Link from "next/link";
import Image from "next/image";
import { FadeIn, StaggerContainer, StaggerItem, ScaleHover } from "@/components/ui/MotionWrapper";
import { teamMembers } from "./data";

export default function TeamPage() {
  return (
    <main style={{ paddingBottom: '6rem' }}>
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
              <Link href="/about" style={{
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
                transition: "color 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "white"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
              >
                <span>←</span>
                <span>Back to About</span>
              </Link>
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
                textTransform: 'uppercase',
                marginLeft: '1.5rem'
              }}>
                Executive Leadership
              </div>
              <h1 style={{ 
                color: 'white', 
                fontSize: 'clamp(3rem, 5vw, 4.5rem)', 
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: '1.5rem',
                textShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                Management Team
              </h1>
              <p style={{ 
                fontSize: '1.25rem', 
                color: 'rgba(255, 255, 255, 0.8)', 
                maxWidth: '600px', 
                lineHeight: 1.6,
                textShadow: '0 5px 15px rgba(0,0,0,0.2)'
              }}>
                The dedicated leadership steering the NSIB towards global standards in transport safety.
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

      <div className="container">
        {/* Director General — featured at the top to reflect seniority */}
        {teamMembers.length > 0 && (
          <FadeIn>
            <ScaleHover style={{ display: 'block', marginBottom: '3.5rem' }}>
              <div className="glass-panel" style={{ overflow: 'hidden', display: 'grid', gridTemplateColumns: 'minmax(280px, 420px) 1fr', gap: 0 }}>
                <div style={{ position: 'relative', minHeight: '420px', backgroundColor: 'var(--nsib-gray-100)' }}>
                  <Image
                    src={teamMembers[0].image}
                    alt={teamMembers[0].name}
                    fill
                    sizes="(max-width: 768px) 100vw, 420px"
                    style={{ objectFit: 'cover', objectPosition: 'top' }}
                    priority
                  />
                </div>
                <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ display: 'inline-block', alignSelf: 'flex-start', padding: '0.35rem 0.9rem', backgroundColor: 'var(--nsib-red)', color: 'white', borderRadius: '30px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                    Director General
                  </span>
                  <h2 className="text-navy" style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>{teamMembers[0].name}</h2>
                  <p className="text-red" style={{ fontWeight: 500, marginBottom: '1.5rem', fontSize: '1.05rem' }}>{teamMembers[0].title}</p>
                  <p style={{ color: 'var(--nsib-slate-light)', lineHeight: 1.7, marginBottom: '1.75rem' }}>{teamMembers[0].bio[0]}</p>
                  <Link href={`/team/${teamMembers[0].slug}`} className="btn btn-primary" style={{ alignSelf: 'flex-start', fontSize: '0.95rem' }}>View Full Profile</Link>
                </div>
              </div>
            </ScaleHover>
          </FadeIn>
        )}

        {/* Directors */}
        <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem' }}>
        {teamMembers.slice(1).map((member, idx) => (
          <StaggerItem key={idx}>
            <ScaleHover style={{ height: '100%' }}>
              <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ height: '320px', position: 'relative', backgroundColor: 'var(--nsib-gray-100)' }}>
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover', objectPosition: 'top' }}
                  />
                </div>
                <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 className="text-navy" style={{ marginBottom: '0.25rem', fontSize: '1.1rem' }}>{member.name}</h3>
                  <p className="text-red" style={{ fontWeight: '500', marginBottom: '1rem', fontSize: '0.9rem', flexGrow: 1 }}>{member.title}</p>
                  <Link href={`/team/${member.slug}`} className="btn btn-outline" style={{ fontSize: '0.9rem', width: '100%', padding: '0.5rem' }}>View Profile</Link>
                </div>
              </div>
            </ScaleHover>
          </StaggerItem>
        ))}
      </StaggerContainer>
      </div>
    </main>
  );
}

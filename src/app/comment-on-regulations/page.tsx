"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function CommentOnRegulationsPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState("Draft Civil Aviation (Investigation) Regulations 2026");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const documentOptions = [
    "Draft Civil Aviation (Investigation) Regulations 2026",
    "Draft Maritime Safety Directives v2.1",
    "Rail Transport Safety Standards Draft"
  ];

  // Opens the commenter's own mail client addressed to NSIB. encodeURIComponent
  // neutralises special characters in user input, so nothing can inject extra
  // mailto headers or markup.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const subject = encodeURIComponent(`Regulatory Comment — ${selectedDocument}`);
    const body = encodeURIComponent(
      `Document: ${selectedDocument}\n` +
      `Name: ${v("name")}\n` +
      `Organization: ${v("org") || "Not specified"}\n` +
      `Section/Clause: ${v("clause") || "Not specified"}\n\n` +
      `Comments:\n${v("comments")}`
    );
    window.location.href = `mailto:info@nsib.gov.ng?subject=${subject}&body=${body}`;
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <main style={{ backgroundColor: 'var(--bg-primary)', position: 'relative', overflow: 'hidden', paddingBottom: '8rem' }}>
      
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
              textDecoration: "none",
              transition: "color 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "white"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
            >
              <span>←</span>
              <span>Back to Contact</span>
            </Link>
            <br />
            <h1 style={{ 
              color: 'white', 
              fontSize: 'clamp(3rem, 5vw, 4.5rem)', 
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              textShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              Comment on Regulations
            </h1>
            <p style={{ 
              fontSize: '1.25rem', 
              color: 'rgba(255, 255, 255, 0.8)', 
              maxWidth: '600px', 
              lineHeight: 1.6,
              textShadow: '0 5px 15px rgba(0,0,0,0.2)'
            }}>
              Your professional feedback shapes the future of transportation safety. Submit your insights on draft regulatory documents and proposed rulemakings.
            </p>
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

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        <div className="responsive-grid-sidebar" style={{ 
          alignItems: 'flex-start',
          perspective: '1200px'
        }}>

          {/* Left Column: Context Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <ScrollReveal direction="up" delay={0.1}>
              <div 
                className="glass-panel"
                style={{ 
                  padding: '2.5rem', 
                  transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease',
                  borderTop: '4px solid var(--nsib-red)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) translateZ(15px)';
                  e.currentTarget.style.boxShadow = '0 30px 60px rgba(27, 42, 107, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) translateZ(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-premium)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(226, 48, 48, 0.05)', borderRadius: '12px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--nsib-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="20" x2="12" y2="10"></line>
                      <line x1="18" y1="20" x2="18" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="16"></line>
                    </svg>
                  </div>
                  <h3 className="text-navy" style={{ margin: 0, fontSize: '1.4rem' }}>Our Process</h3>
                </div>
                <p className="text-slate" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                  Every comment submitted is reviewed by our legal and regulatory experts before final policies are gazetted. Your voice ensures industry standards remain practical and safe.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2}>
              <div 
                className="glass-panel"
                style={{ 
                  padding: '2.5rem', 
                  transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease',
                  borderTop: '4px solid var(--nsib-navy)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) translateZ(15px)';
                  e.currentTarget.style.boxShadow = '0 30px 60px rgba(27, 42, 107, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) translateZ(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-premium)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(27, 42, 107, 0.05)', borderRadius: '12px' }}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--nsib-navy)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <h3 className="text-navy" style={{ margin: 0, fontSize: '1.4rem' }}>Guidelines</h3>
                </div>
                <ul className="text-slate" style={{ fontSize: '1.05rem', lineHeight: '1.7', paddingLeft: '1.25rem', margin: 0 }}>
                  <li style={{ paddingBottom: '0.5rem' }}>Be specific about the clause you are referencing.</li>
                  <li style={{ paddingBottom: '0.5rem' }}>Provide actionable recommendations.</li>
                  <li>Include supporting evidence if applicable.</li>
                </ul>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Interaction Form */}
          <ScrollReveal direction="left" delay={0.2}>
            <div 
              className="glass-panel" 
              style={{ 
                padding: '3.5rem', 
                borderRadius: '1.5rem', 
                background: 'rgba(255,255,255,0.95)',
                boxShadow: '0 30px 60px rgba(27, 42, 107, 0.08)',
                border: '1px solid rgba(27, 42, 107, 0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Form Decoration */}
              <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(27,42,107,0.03) 0%, transparent 70%)', borderRadius: '50%' }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  {/* Select Document Custom Dropdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }} ref={dropdownRef}>
                    <label className="text-navy" style={{ fontWeight: 600, fontSize: '0.95rem' }}>Select Document for Review</label>
                    <div style={{ position: 'relative' }}>
                      <div 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={{ 
                          width: '100%',
                          padding: '1rem', 
                          borderRadius: 'var(--radius-md)', 
                          border: isDropdownOpen ? '2px solid var(--nsib-navy)' : '2px solid var(--nsib-gray-100)', 
                          background: isDropdownOpen ? '#fff' : 'var(--nsib-gray-50)',
                          fontSize: '1rem',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          userSelect: 'none'
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {selectedDocument}
                        </span>
                        <svg 
                          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--nsib-slate)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          style={{
                            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                          }}
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>

                      {/* Dropdown Menu Options */}
                      <div 
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 0.5rem)',
                          left: 0,
                          right: 0,
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: '0 20px 40px rgba(27, 42, 107, 0.1)',
                          zIndex: 50,
                          opacity: isDropdownOpen ? 1 : 0,
                          transform: isDropdownOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.98)',
                          pointerEvents: isDropdownOpen ? 'auto' : 'none',
                          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          overflow: 'hidden'
                        }}
                      >
                        {documentOptions.map((option) => (
                          <div 
                            key={option}
                            onClick={() => {
                              setSelectedDocument(option);
                              setIsDropdownOpen(false);
                            }}
                            style={{
                              padding: '1rem',
                              cursor: 'pointer',
                              color: selectedDocument === option ? 'var(--nsib-navy)' : 'var(--text-primary)',
                              background: selectedDocument === option ? 'rgba(27, 42, 107, 0.05)' : 'transparent',
                              fontWeight: selectedDocument === option ? 600 : 400,
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              if (selectedDocument !== option) {
                                e.currentTarget.style.background = 'var(--nsib-gray-50)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedDocument !== option) {
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Name & Org */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label className="text-navy" style={{ fontWeight: 600, fontSize: '0.95rem' }}>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Your name"
                        style={{ 
                          padding: '0.85rem 1rem', 
                          borderRadius: 'var(--radius-md)', 
                          border: '2px solid var(--nsib-gray-100)',
                          background: 'var(--nsib-gray-50)',
                          fontSize: '1rem',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }} 
                        onFocus={(e) => { e.target.style.borderColor = 'var(--nsib-navy)'; e.target.style.background = '#fff'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'var(--nsib-gray-100)'; e.target.style.background = 'var(--nsib-gray-50)'; }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label className="text-navy" style={{ fontWeight: 600, fontSize: '0.95rem' }}>Organization <span className="text-slate" style={{fontWeight: 400}}>(Optional)</span></label>
                      <input
                        type="text"
                        name="org"
                        placeholder="Your organization"
                        style={{ 
                          padding: '0.85rem 1rem', 
                          borderRadius: 'var(--radius-md)', 
                          border: '2px solid var(--nsib-gray-100)',
                          background: 'var(--nsib-gray-50)',
                          fontSize: '1rem',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }} 
                        onFocus={(e) => { e.target.style.borderColor = 'var(--nsib-navy)'; e.target.style.background = '#fff'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'var(--nsib-gray-100)'; e.target.style.background = 'var(--nsib-gray-50)'; }}
                      />
                    </div>
                  </div>
                  
                  {/* Specific Clause */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="text-navy" style={{ fontWeight: 600, fontSize: '0.95rem' }}>Specific Section/Clause</label>
                    <input
                      type="text"
                      name="clause"
                      placeholder="e.g. Part 4, Clause 12.1"
                      style={{ 
                        padding: '0.85rem 1rem', 
                        borderRadius: 'var(--radius-md)', 
                        border: '2px solid var(--nsib-gray-100)',
                        background: 'var(--nsib-gray-50)',
                        fontSize: '1rem',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }} 
                      onFocus={(e) => { e.target.style.borderColor = 'var(--nsib-navy)'; e.target.style.background = '#fff'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--nsib-gray-100)'; e.target.style.background = 'var(--nsib-gray-50)'; }}
                    />
                  </div>

                  {/* Comments textarea */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="text-navy" style={{ fontWeight: 600, fontSize: '0.95rem' }}>Your Comments/Suggestions</label>
                    <textarea
                      rows={6}
                      name="comments"
                      required
                      placeholder="Share your feedback, proposed modifications, or rationale..."
                      style={{ 
                        padding: '1rem', 
                        borderRadius: 'var(--radius-md)', 
                        border: '2px solid var(--nsib-gray-100)',
                        background: 'var(--nsib-gray-50)',
                        fontSize: '1rem',
                        transition: 'all 0.2s',
                        resize: 'vertical',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--nsib-navy)'; e.target.style.background = '#fff'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--nsib-gray-100)'; e.target.style.background = 'var(--nsib-gray-50)'; }}
                    />
                  </div>
                  
                  {/* Submit Action */}
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ 
                        padding: '1.25rem 2.5rem',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.querySelector('svg')!.style.transform = 'translate(4px, -4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.querySelector('svg')!.style.transform = 'translate(0, 0)';
                      }}
                    >
                      Submit Feedback
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s ease' }}>
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                    <p className="text-slate" style={{ fontSize: '0.85rem', marginTop: '1rem' }}>
                      By submitting, you agree to public disclosure of your comments related to this rulemaking.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </ScrollReveal>
          
        </div>
      </div>
    </main>
  );
}

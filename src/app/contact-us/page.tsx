"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";

export default function ContactPage() {
  // Opens the visitor's own mail client addressed to NSIB. encodeURIComponent
  // neutralises any special characters in user input, so nothing can inject
  // extra mailto headers or markup.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const subject = encodeURIComponent(`Website Enquiry: ${v("subject")}`);
    const body = encodeURIComponent(
      `Name: ${v("name")}\nEmail: ${v("email")}\n\n${v("message")}`
    );
    window.location.href = `mailto:info@nsib.gov.ng?subject=${subject}&body=${body}`;
  }

  return (
    <main style={{ backgroundColor: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      
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
          <ScrollReveal direction="up" delay={0.05} distance={24}>
            <div style={{ maxWidth: "800px" }}>
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
                Contact Us
              </div>
              <h1 style={{ 
                color: 'white', 
                fontSize: 'clamp(3rem, 5vw, 4.5rem)', 
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: '1.5rem',
                textShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                Let's Connect
              </h1>
              <p style={{ 
                fontSize: '1.25rem', 
                color: 'rgba(255, 255, 255, 0.8)', 
                maxWidth: '650px', 
                lineHeight: 1.6,
                textShadow: '0 5px 15px rgba(0,0,0,0.2)'
              }}>
                Have questions or need to reach the Nigerian Safety Investigation Bureau? 
                Our team is here to provide you with the answers and support you need.
              </p>
            </div>
          </ScrollReveal>
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

      <div className="container" style={{ position: 'relative', zIndex: 1, paddingBottom: '8rem' }}>

        {/* Floating Grid Framework */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '3rem',
          alignItems: 'flex-start',
          perspective: '1200px'
        }}>
          
          {/* Left Column: Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <ScrollReveal direction="up" delay={0.1}>
              <div 
                className="glass-panel contact-card"
                style={{ 
                  padding: '2.5rem', 
                  transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease',
                  borderTop: '4px solid var(--nsib-navy)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) translateZ(20px)';
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
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <h3 className="text-navy" style={{ margin: 0, fontSize: '1.5rem' }}>Head Office</h3>
                </div>
                <p className="text-slate" style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Nnamdi Azikiwe International Airport</p>
                <p className="text-slate" style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Abuja, Federal Capital Territory</p>
                <p className="text-slate" style={{ fontSize: '1.1rem' }}>Nigeria</p>
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
                  e.currentTarget.style.transform = 'translateY(-8px) translateZ(20px)';
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
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <h3 className="text-navy" style={{ margin: 0, fontSize: '1.5rem' }}>Direct Lines</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>General Enquiries</span>
                    <p className="text-slate" style={{ fontSize: '1.15rem', fontWeight: 500 }}>+234 807 709 0909</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>Emergency / Duty Officer</span>
                    <p className="text-red" style={{ fontSize: '1.15rem', fontWeight: 600 }}>+234 807 709 0908 / 0909</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.3}>
              <div 
                className="glass-panel"
                style={{ 
                  padding: '2.5rem', 
                  transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease',
                  borderTop: '4px solid var(--nsib-navy)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) translateZ(20px)';
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
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <h3 className="text-navy" style={{ margin: 0, fontSize: '1.5rem' }}>Digital Elements</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>Email Support</span>
                    <p className="text-slate" style={{ fontSize: '1.15rem', fontWeight: 500 }}>
                      <a href="mailto:info@nsib.gov.ng" style={{ transition: 'color 0.2s', borderBottom: '1px solid transparent' }} 
                         onMouseEnter={(e) => e.currentTarget.style.color = 'var(--nsib-red)'}
                         onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                      >
                        info@nsib.gov.ng
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Contact Form */}
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
              {/* Subtle Form Decoration */}
              <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(226,48,48,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 className="text-navy" style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Send Us a Message</h2>
                <p className="text-slate" style={{ marginBottom: '2.5rem', fontSize: '1.05rem' }}>Fill out the form below and we will get back to you as soon as possible.</p>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  
                  <div className="responsive-grid-2col">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label className="text-navy" style={{ fontWeight: 600, fontSize: '0.95rem' }}>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="John Doe"
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
                      <label className="text-navy" style={{ fontWeight: 600, fontSize: '0.95rem' }}>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="john@example.com"
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

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="text-navy" style={{ fontWeight: 600, fontSize: '0.95rem' }}>Subject</label>
                    <input
                      type="text"
                      name="subject"
                      required
                      placeholder="How can we help you?"
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
                    <label className="text-navy" style={{ fontWeight: 600, fontSize: '0.95rem' }}>Message</label>
                    <textarea
                      rows={6}
                      name="message"
                      required
                      placeholder="Write your message here..."
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
                  
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      alignSelf: 'flex-start',
                      marginTop: '1rem',
                      padding: '1rem 2rem',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.querySelector('svg')!.style.transform = 'translate(4px, -4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.querySelector('svg')!.style.transform = 'translate(0, 0)';
                    }}
                  >
                    Send Message
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s ease' }}>
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>

                </form>
              </div>
            </div>
          </ScrollReveal>
          
        </div>
      </div>
    </main>
  );
}

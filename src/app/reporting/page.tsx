"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function ReportingPage() {
  const [incidentType, setIncidentType] = useState<string>("aviation");

  // Custom Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Custom Time Picker State
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const timePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setShowTimePicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const timeOptions = Array.from({length: 48}, (_, i) => {
    const h = Math.floor(i / 2).toString().padStart(2, '0');
    const m = (i % 2 === 0 ? '00' : '30');
    return `${h}:${m}`;
  });

  // Opens the reporter's own mail client addressed to NSIB. encodeURIComponent
  // neutralises special characters in user input, so nothing can inject extra
  // mailto headers or markup.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const date = selectedDate
      ? `${selectedDate.getDate().toString().padStart(2, "0")}/${(selectedDate.getMonth() + 1).toString().padStart(2, "0")}/${selectedDate.getFullYear()}`
      : "Not specified";
    const subject = encodeURIComponent(`Occurrence Report — ${incidentType.toUpperCase()}`);
    const body = encodeURIComponent(
      `Incident Modality: ${incidentType}\n` +
      `Date of Occurrence: ${date}\n` +
      `Time: ${selectedTime || "Not specified"}\n` +
      `Location: ${v("location")}\n\n` +
      `Description:\n${v("description")}`
    );
    window.location.href = `mailto:info@nsib.gov.ng?subject=${subject}&body=${body}`;
  }


  return (
    <main style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: '8rem', overflowX: 'hidden', perspective: '1000px' }}>
      
      {/* Antigravity Hero Section */}
      <section className="page-hero" style={{
        backgroundColor: 'var(--nsib-navy)',
        color: 'white',
        padding: '10rem 2rem 8rem',
        position: 'relative',
        transformStyle: 'preserve-3d'
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
          <ScrollReveal direction="up" distance={40} duration={0.8}>
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
            <div style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '30px',
              backdropFilter: 'blur(10px)',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Online Form
            </div>
            <h1 style={{ 
              color: 'white', 
              fontSize: 'clamp(3rem, 5vw, 4.5rem)', 
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              textShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              Report an Accident
            </h1>
            <p style={{ 
              fontSize: '1.25rem', 
              color: 'rgba(255, 255, 255, 0.8)', 
              maxWidth: '600px', 
              lineHeight: 1.6,
              textShadow: '0 5px 15px rgba(0,0,0,0.2)'
            }}>
              Prompt reporting of accidents and serious incidents is crucial for timely investigation and safety improvement.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Form Content - intentionally pulled up to overlap hero using negative margin */}
      <div className="container" style={{ position: 'relative', zIndex: 10, marginTop: '-4rem' }}>
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
                  borderTop: '4px solid var(--nsib-red)',
                  background: 'rgba(255, 255, 255, 0.95)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) translateZ(15px)';
                  e.currentTarget.style.boxShadow = '0 30px 60px rgba(226, 48, 48, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) translateZ(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-premium)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(226, 48, 48, 0.1)', borderRadius: '12px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--nsib-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <h3 className="text-navy" style={{ margin: 0, fontSize: '1.4rem' }}>Emergency</h3>
                </div>
                <p className="text-slate" style={{ fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  If this is an active emergency requiring immediate assistance, please bypass this form.
                </p>
                <div style={{ background: 'rgba(226, 48, 48, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(226, 48, 48, 0.1)' }}>
                  <p className="text-red" style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem', textAlign: 'center' }}>+234 807 709 0908 / 0909</p>
                </div>
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
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <h3 className="text-navy" style={{ margin: 0, fontSize: '1.4rem' }}>Confidentiality</h3>
                </div>
                <p className="text-slate" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                  In accordance with NSIB regulations, all reports are strictly confidential. Reporter identities will never be disclosed to organizations, operators, or the public.
                </p>
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
              <div style={{ position: 'relative', zIndex: 1 }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                  
                  {/* Step 1: Type */}
                  <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 className="text-navy" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--nsib-navy)', color: 'white', fontSize: '0.9rem', fontWeight: 700 }}>1</span>
                      Incident Modality
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                      
                      {['Aviation', 'Marine', 'Railway'].map((mode) => (
                        <div 
                          key={mode}
                          onClick={() => setIncidentType(mode.toLowerCase())}
                          style={{
                            padding: '1.5rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: incidentType === mode.toLowerCase() ? '2px solid var(--nsib-navy)' : '2px solid var(--nsib-gray-100)',
                            background: incidentType === mode.toLowerCase() ? 'rgba(27, 42, 107, 0.02)' : '#fff',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            transform: incidentType === mode.toLowerCase() ? 'translateY(-4px)' : 'translateY(0)',
                            boxShadow: incidentType === mode.toLowerCase() ? '0 15px 30px rgba(27,42,107,0.1)' : 'none'
                          }}
                        >
                          <span style={{ 
                            fontWeight: incidentType === mode.toLowerCase() ? 700 : 500,
                            color: incidentType === mode.toLowerCase() ? 'var(--nsib-navy)' : 'var(--text-primary)'
                          }}>
                            {mode}
                          </span>
                        </div>
                      ))}

                    </div>
                  </section>

                  {/* Step 2: Details */}
                  <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 className="text-navy" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--nsib-navy)', color: 'white', fontSize: '0.9rem', fontWeight: 700 }}>2</span>
                      Incident Details
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label className="text-navy" style={{ fontWeight: 600, fontSize: '0.95rem' }}>Date of Occurrence</label>
                        <div style={{ position: 'relative' }} ref={datePickerRef}>
                          <div 
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            style={{ 
                              width: '100%',
                              padding: '1rem 1rem 1rem 3rem', 
                              borderRadius: 'var(--radius-md)', 
                              border: showDatePicker ? '2px solid var(--nsib-navy)' : '2px solid var(--nsib-gray-100)',
                              background: showDatePicker ? '#fff' : 'var(--nsib-gray-50)',
                              fontSize: '1rem',
                              transition: 'all 0.3s',
                              cursor: 'pointer',
                              color: selectedDate ? 'var(--text-primary)' : 'var(--nsib-slate)',
                              userSelect: 'none',
                              boxShadow: showDatePicker ? '0 0 0 4px rgba(27, 42, 107, 0.1)' : 'none'
                            }}
                          >
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nsib-navy)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                              </svg>
                            </div>
                            {selectedDate ? `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}` : 'dd/mm/yyyy'}
                          </div>

                          {/* Custom Calendar Popup */}
                          <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 0.5rem)',
                            left: 0,
                            right: 0,
                            background: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: '0 20px 40px rgba(27, 42, 107, 0.1)',
                            zIndex: 50,
                            padding: '1.5rem',
                            opacity: showDatePicker ? 1 : 0,
                            transform: showDatePicker ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.98)',
                            pointerEvents: showDatePicker ? 'auto' : 'none',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                              <button type="button" onClick={handlePrevMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--nsib-gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--nsib-navy)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                              </button>
                              <span style={{ fontWeight: 600, color: 'var(--nsib-navy)' }}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                              <button type="button" onClick={handleNextMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--nsib-gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--nsib-navy)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                              </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', marginBottom: '0.5rem' }}>
                              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d} style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--nsib-slate)' }}>{d}</span>)}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center' }}>
                              {blanks.map(b => <div key={`b-${b}`} />)}
                              {days.map(d => {
                                const isSelected = selectedDate && selectedDate.getDate() === d && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear();
                                return (
                                  <div 
                                    key={d}
                                    onClick={() => {
                                      setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
                                      setShowDatePicker(false);
                                    }}
                                    style={{
                                      padding: '0.5rem',
                                      borderRadius: '50%',
                                      cursor: 'pointer',
                                      background: isSelected ? 'var(--nsib-navy)' : 'transparent',
                                      color: isSelected ? 'white' : 'var(--text-primary)',
                                      fontWeight: isSelected ? 600 : 400,
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { if(!isSelected) e.currentTarget.style.background = 'var(--nsib-gray-50)'; }}
                                    onMouseLeave={(e) => { if(!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                  >
                                    {d}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label className="text-navy" style={{ fontWeight: 600, fontSize: '0.95rem' }}>Time</label>
                        <div style={{ position: 'relative' }} ref={timePickerRef}>
                          <div 
                            onClick={() => setShowTimePicker(!showTimePicker)}
                            style={{ 
                              width: '100%',
                              padding: '1rem 1rem 1rem 3rem', 
                              borderRadius: 'var(--radius-md)', 
                              border: showTimePicker ? '2px solid var(--nsib-navy)' : '2px solid var(--nsib-gray-100)',
                              background: showTimePicker ? '#fff' : 'var(--nsib-gray-50)',
                              fontSize: '1rem',
                              transition: 'all 0.3s',
                              cursor: 'pointer',
                              color: selectedTime ? 'var(--text-primary)' : 'var(--nsib-slate)',
                              userSelect: 'none',
                              boxShadow: showTimePicker ? '0 0 0 4px rgba(27, 42, 107, 0.1)' : 'none'
                            }}
                          >
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nsib-navy)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                            </div>
                            {selectedTime || '-- : --'}
                          </div>
                          
                          {/* Custom Time Popup */}
                          <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 0.5rem)',
                            left: 0,
                            right: 0,
                            maxHeight: '220px',
                            overflowY: 'auto',
                            background: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: '0 20px 40px rgba(27, 42, 107, 0.1)',
                            zIndex: 50,
                            opacity: showTimePicker ? 1 : 0,
                            transform: showTimePicker ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.98)',
                            pointerEvents: showTimePicker ? 'auto' : 'none',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                          }}>
                             {timeOptions.map(time => (
                               <div 
                                 key={time}
                                 onClick={() => {
                                   setSelectedTime(time);
                                   setShowTimePicker(false);
                                 }}
                                 style={{
                                   padding: '0.85rem 1.5rem',
                                   cursor: 'pointer',
                                   fontWeight: selectedTime === time ? 600 : 400,
                                   background: selectedTime === time ? 'rgba(27, 42, 107, 0.05)' : 'transparent',
                                   color: selectedTime === time ? 'var(--nsib-navy)' : 'var(--text-primary)',
                                   transition: 'all 0.2s',
                                   borderBottom: '1px solid var(--nsib-gray-50)'
                                 }}
                                 onMouseEnter={(e) => { if(selectedTime !== time) e.currentTarget.style.background = 'var(--nsib-gray-50)'; }}
                                 onMouseLeave={(e) => { if(selectedTime !== time) e.currentTarget.style.background = 'transparent'; }}
                               >
                                 {time}
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label className="text-navy" style={{ fontWeight: 600, fontSize: '0.95rem' }}>Location</label>
                      <input
                        type="text"
                        name="location"
                        required
                        placeholder="e.g. 10nm North of ABV VOR, or specific coordinates"
                        style={{ 
                          padding: '0.85rem 1rem', 
                          borderRadius: 'var(--radius-md)', 
                          border: '2px solid var(--nsib-gray-100)',
                          background: 'var(--nsib-gray-50)',
                          fontSize: '1rem',
                          transition: 'all 0.2s',
                          outline: 'none',
                          lineHeight: '1.5'
                        }} 
                        onFocus={(e) => { e.target.style.borderColor = 'var(--nsib-navy)'; e.target.style.background = '#fff'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'var(--nsib-gray-100)'; e.target.style.background = 'var(--nsib-gray-50)'; }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label className="text-navy" style={{ fontWeight: 600, fontSize: '0.95rem' }}>Brief Description</label>
                      <textarea
                        rows={5}
                        name="description"
                        required
                        placeholder="Describe the sequence of events, conditions, and any known damage or injuries..."
                        style={{ 
                          padding: '1rem', 
                          borderRadius: 'var(--radius-md)', 
                          border: '2px solid var(--nsib-gray-100)',
                          background: 'var(--nsib-gray-50)',
                          fontSize: '1rem',
                          transition: 'all 0.2s',
                          resize: 'vertical',
                          outline: 'none',
                          fontFamily: 'inherit',
                          lineHeight: '1.6'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--nsib-navy)'; e.target.style.background = '#fff'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'var(--nsib-gray-100)'; e.target.style.background = 'var(--nsib-gray-50)'; }}
                      />
                    </div>
                  </section>
                  
                  {/* Submit Action */}
                  <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '1.25rem',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(27, 42, 107, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      Submit Confidential Report
                    </button>
                    <p className="text-slate" style={{ fontSize: '0.85rem', marginTop: '1rem', textAlign: 'center' }}>
                      Protected by NSIB Data Privacy & Confidentiality Policy
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </ScrollReveal>
          
        </div>
      </div>
      
      {/* CSS Animations */}
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
        .floating-element {
            animation: float 8s ease-in-out infinite;
        }
        .floating-element-slow {
            animation: floatSlow 12s ease-in-out infinite;
        }
      `}} />
    </main>
  );
}

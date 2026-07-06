import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about the Nigerian Safety Investigation Bureau (NSIB) — its mandate, how investigations work, and how to report an accident.",
  path: "/faqs",
});

export default function FaqsPage() {
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
          <div style={{ maxWidth: "800px" }}>
            <h1 style={{ 
              color: 'white', 
              fontSize: 'clamp(3rem, 5vw, 4.5rem)', 
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              textShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              Frequently Asked Questions
            </h1>
            <p style={{ 
              fontSize: '1.25rem', 
              color: 'rgba(255, 255, 255, 0.8)', 
              maxWidth: '600px', 
              lineHeight: 1.6,
              textShadow: '0 5px 15px rgba(0,0,0,0.2)'
            }}>
              Find answers to common inquiries regarding the NSIB's mandate and operations.
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

      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {[
          {
            q: "What is the primary function of the NSIB?",
            a: "The primary function of the NSIB is to independently investigate transport accidents and serious incidents in the aviation, maritime, and railway sectors to determine probable causes and make safety recommendations to prevent recurrence."
          },
          {
            q: "Does the NSIB assign blame or liability?",
            a: "No. Our investigations are solely for the purpose of enhancing transport safety. The NSIB does not apportion blame or establish legal liability."
          },
          {
            q: "How can I report a transport accident?",
            a: "You can report an accident immediately via our 24/7 Duty Officer lines (+234 807 709 0908 / +234 807 709 0909) or by using the Report an Accident portal on our website."
          },
          {
            q: "Are NSIB reports available to the public?",
            a: "Yes, final investigation reports are published on our website under the Publications section once they are officially released."
          }
        ].map((faq, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '2rem' }}>
            <h3 className="text-navy" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span className="text-red">Q.</span> {faq.q}
            </h3>
            <p className="text-slate" style={{ paddingLeft: '2.2rem' }}>{faq.a}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

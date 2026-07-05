import Link from "next/link";

export default function MembershipLevelsPage() {
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
              Membership & Training Levels
            </h1>
            <p style={{ 
              fontSize: '1.25rem', 
              color: 'rgba(255, 255, 255, 0.8)', 
              maxWidth: '600px', 
              lineHeight: 1.6,
              textShadow: '0 5px 15px rgba(0,0,0,0.2)'
            }}>
              Select a membership tier to access specialized online and offline safety investigation training.
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

      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Tier 1 */}
        <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 className="text-navy" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Observer</h3>
          <div className="text-red" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Free</div>
          <ul className="text-slate" style={{ flexGrow: 1, paddingLeft: '1.2rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>Access to public safety webinars</li>
            <li>Basic incident reporting guidelines</li>
            <li>Monthly newsletter access</li>
          </ul>
          <Link href="/learning-portal" className="btn btn-outline" style={{ width: '100%' }}>Select Tier</Link>
        </div>

        {/* Tier 2 */}
        <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', border: '2px solid var(--nsib-navy)', transform: 'scale(1.05)', zIndex: 10 }}>
          <div style={{ backgroundColor: 'var(--nsib-navy)', color: 'white', textAlign: 'center', padding: '0.25rem', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '-2.5rem', marginLeft: '-2.5rem', marginRight: '-2.5rem', marginBottom: '1.5rem', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }}>Most Popular</div>
          <h3 className="text-navy" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Professional</h3>
          <div className="text-red" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>₦50,000<span style={{fontSize: '1rem', color: 'var(--nsib-slate-light)'}}>/yr</span></div>
          <ul className="text-slate" style={{ flexGrow: 1, paddingLeft: '1.2rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>All Observer features</li>
            <li>Access to basic investigation courses</li>
            <li>Digital certificate of completion</li>
            <li>Access to investigation manual library</li>
          </ul>
          <Link href="/learning-portal" className="btn btn-primary" style={{ width: '100%' }}>Select Tier</Link>
        </div>

        {/* Tier 3 */}
        <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 className="text-navy" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Corporate</h3>
          <div className="text-red" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Custom</div>
          <ul className="text-slate" style={{ flexGrow: 1, paddingLeft: '1.2rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>All Professional features</li>
            <li>Bulk account management</li>
            <li>Advanced compliance training</li>
            <li>Dedicated account support</li>
          </ul>
          <Link href="/contact-us" className="btn btn-outline" style={{ width: '100%' }}>Contact Us</Link>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";

export default function DocumentLibraryPage() {
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
              fontSize: 'clamp(2rem, 5vw, 4.5rem)', 
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              textShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              Document Download Library
            </h1>
            <p style={{ 
              fontSize: '1.25rem', 
              color: 'rgba(255, 255, 255, 0.8)', 
              maxWidth: '600px', 
              lineHeight: 1.6,
              textShadow: '0 5px 15px rgba(0,0,0,0.2)'
            }}>
              Browsable library of all downloadable official NSIB documents.
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

      <div className="container">

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <input type="search" placeholder="Search documents..." style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '2rem' }} />
        
        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '520px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-subtle)' }}>
              <th style={{ padding: '1rem' }} className="text-navy">Document Name</th>
              <th style={{ padding: '1rem' }} className="text-navy">Category</th>
              <th style={{ padding: '1rem' }} className="text-navy">Date Added</th>
              <th style={{ padding: '1rem' }} className="text-navy">Action</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "FOI Act Manual 2026", cat: "Manuals", date: "Apr 01, 2026" },
              { name: "Strategic Safety Directive", cat: "Policy", date: "Mar 15, 2026" },
              { name: "Investigator Checklist", cat: "Forms", date: "Jan 10, 2026" },
            ].map((doc, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem' }} className="text-slate">{doc.name}</td>
                <td style={{ padding: '1rem' }}><span style={{ backgroundColor: 'var(--nsib-gray-200)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem' }}>{doc.cat}</span></td>
                <td style={{ padding: '1rem' }} className="text-slate">{doc.date}</td>
                <td style={{ padding: '1rem' }}><button className="text-red" style={{ fontWeight: 600 }}>Download</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      </div>
    </main>
  );
}

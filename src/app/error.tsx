'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '4rem 1.5rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.4rem', margin: 0, color: '#1B2A6B' }}>Something went wrong</h1>
      <p style={{ color: '#555', maxWidth: 480 }}>
        An unexpected error occurred. Please try again, or return to the homepage.
      </p>
      <button
        onClick={reset}
        style={{ background: '#1B2A6B', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem 1.4rem', fontWeight: 600, cursor: 'pointer' }}
      >
        Try again
      </button>
    </main>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '4rem 1.5rem', textAlign: 'center' }}>
      <p style={{ fontSize: '3rem', fontWeight: 700, color: '#1B2A6B', margin: 0 }}>404</p>
      <h1 style={{ fontSize: '1.4rem', margin: 0 }}>Page not found</h1>
      <p style={{ color: '#555', maxWidth: 480 }}>
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link href="/" style={{ color: '#1B2A6B', fontWeight: 600, textDecoration: 'underline' }}>
        Return to the homepage
      </Link>
    </main>
  );
}

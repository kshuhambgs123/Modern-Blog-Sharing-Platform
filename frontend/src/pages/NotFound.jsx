import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '6rem', fontWeight: 900, marginBottom: '0.5rem', opacity: 0.1 }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.2rem' }}>Oops! Page Not Found</h2>
      <p style={{ color: 'var(--text2)', marginBottom: '2.5rem', maxWidth: '440px', marginInline: 'auto' }}>
        We couldn't find the page you're looking for. It might have been moved or doesn't exist anymore.
      </p>
      <Link to="/" className="btn btn-primary" style={{ paddingInline: '2.5rem' }}>
        Return to Home →
      </Link>
    </div>
  );
}

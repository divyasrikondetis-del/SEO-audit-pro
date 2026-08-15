// React import not required with new JSX transform
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'grid', placeItems: 'center', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '480px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '1.75rem', background: '#fff', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)', padding: '2.5rem 2rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🔍</div>
        <h1 style={{ fontSize: '3.5rem', margin: '0', color: '#0f172a' }}>404</h1>
        <h2 style={{ margin: '0.6rem 0 0', fontSize: '1.5rem', color: '#1e293b' }}>Page not found</h2>
        <p style={{ marginTop: '0.75rem', color: '#64748b', lineHeight: 1.7 }}>
          The page you are looking for does not exist or may have moved.
        </p>
        <Link to="/dashboard" style={{ display: 'inline-flex', marginTop: '1.4rem', padding: '0.9rem 1.2rem', borderRadius: '0.95rem', background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
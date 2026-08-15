import { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import '../../styles/navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const hideNavbar = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  if (hideNavbar) return null;

  const closeMenu = () => setMenuOpen(false);
  const linkClass = ({ isActive }) => `navbar-nav-link ${isActive ? 'active' : ''}`;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        <span className="brand-mark">S</span>
        <span>SEO Audit Pro</span>
      </Link>

      <button className="navbar-mobile-toggle" type="button" aria-label="Toggle navigation menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
        <span /> <span /> <span />
      </button>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        {user ? (
          <>
            <NavLink to="/" className={linkClass} onClick={closeMenu}>Home</NavLink>
            <NavLink to="/dashboard" className={linkClass} onClick={closeMenu}>Dashboard</NavLink>
            <NavLink to="/reports" className={linkClass} onClick={closeMenu}>Reports</NavLink>
            <NavLink to="/profile" className={linkClass} onClick={closeMenu}>Profile</NavLink>
            <span className="navbar-user-name">{user.name?.split(' ')[0] || 'Account'}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/" className={linkClass} onClick={closeMenu}>Home</NavLink>
            <NavLink to="/login" className={linkClass} onClick={closeMenu}>Login</NavLink>
            <NavLink to="/register" className={linkClass} onClick={closeMenu}>Create account</NavLink>
            <Link to="/register" className="navbar-cta" onClick={closeMenu}>Get started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

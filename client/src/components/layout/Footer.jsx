// React import not required with new JSX transform
import { Link, useLocation } from 'react-router-dom';
import '../../styles/footer.css';

const Footer = () => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  // Don't show Footer on auth pages (login, register, forgot-password)
  const hideFooter = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  if (hideFooter) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-text">
          © {currentYear} SEO Audit Pro. All rights reserved.
        </div>
        <div className="footer-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/reports">Reports</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

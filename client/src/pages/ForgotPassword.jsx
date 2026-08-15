import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      await authService.forgotPassword(trimmedEmail);
      setSuccess(true);
      setEmail(trimmedEmail);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send the reset email. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card forgot-card">
        <div className="auth-logo">🔐</div>
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">Enter your email to receive a temporary password</p>

        {success ? (
          <div className="auth-success-state">
            <div className="success-icon">✓</div>
            <h3>Check your inbox</h3>
            <p>Reset instructions have been sent to your email address.</p>
            <div className="auth-actions">
              <Link to="/reset-password" className="auth-btn secondary-btn">
                Enter Temporary Password
              </Link>
              <Link to="/login" className="auth-btn secondary-btn">
                Back to Login
              </Link>
              <button type="button" className="link-button" onClick={() => setSuccess(false)}>
                Send to another email
              </button>
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="auth-error">⚠️ {error}</div>}

            <div className="form-group">
              <label htmlFor="forgot-email">Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon">✉</span>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={Boolean(error)}
                />
              </div>
              <small className="helper-text">We’ll send a temporary password to this email.</small>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <span className="button-content">
                  <span className="spinner" aria-hidden="true" />
                  Sending...
                </span>
              ) : (
                'Send Temporary Password'
              )}
            </button>

            <div className="auth-link-row">
              <Link to="/login" className="back-link">← Back to Login</Link>
            </div>
          </form>
        )}

        <div className="security-note">🔒 Your password will be reset securely.</div>
      </div>
    </div>
  );
};

export default ForgotPassword;
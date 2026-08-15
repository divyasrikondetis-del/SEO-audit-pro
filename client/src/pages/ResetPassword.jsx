import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/auth.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('verify'); // 'verify' or 'reset'
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  const handleVerifyTempPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !tempPassword.trim()) {
      setError('Please enter both email and temporary password.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyTempPassword(
        email.trim().toLowerCase(),
        tempPassword.trim()
      );
      setVerified(true);
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check your temporary password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(
        email.trim().toLowerCase(),
        tempPassword.trim(),
        newPassword
      );
      navigate('/login', { 
        state: { message: 'Password reset successfully! Please log in with your new password.' }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card forgot-card">
        <div className="auth-logo">🔑</div>
        <h2 className="auth-title">Reset Your Password</h2>

        {step === 'verify' ? (
          <>
            <p className="auth-subtitle">Enter the temporary password sent to your email</p>
            <form className="auth-form" onSubmit={handleVerifyTempPassword} noValidate>
              {error && <div className="auth-error">⚠️ {error}</div>}

              <div className="form-group">
                <label htmlFor="reset-email">Email Address</label>
                <div className="input-with-icon">
                  <span className="input-icon">✉</span>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="temp-password">Temporary Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔐</span>
                  <input
                    id="temp-password"
                    type="text"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    placeholder="Enter your temporary password"
                    autoComplete="off"
                    required
                  />
                </div>
                <small className="helper-text">Check your email for the temporary password sent by SEO Audit Pro</small>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? (
                  <span className="button-content">
                    <span className="spinner" aria-hidden="true" />
                    Verifying...
                  </span>
                ) : (
                  'Verify & Continue'
                )}
              </button>

              <div className="auth-link-row">
                <Link to="/forgot-password" className="back-link">← Try another email</Link>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className="auth-subtitle">Create your new password</p>
            <form className="auth-form" onSubmit={handleResetPassword} noValidate>
              {error && <div className="auth-error">⚠️ {error}</div>}

              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <small className="helper-text">At least 6 characters</small>
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">✓</span>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? (
                  <span className="button-content">
                    <span className="spinner" aria-hidden="true" />
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>

              <div className="auth-link-row">
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setStep('verify');
                    setError('');
                  }}
                >
                  ← Use different temp password
                </button>
              </div>
            </form>
          </>
        )}

        <div className="security-note">🔒 Your password will be reset securely.</div>
      </div>
    </div>
  );
};

export default ResetPassword;

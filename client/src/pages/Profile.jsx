import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [auditCount, setAuditCount] = useState(0);

  useEffect(() => {
    const fetchAuditCount = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/audits');
        setAuditCount(response.data.length || 0);
      } catch (err) {
        console.error('Failed to fetch audit count:', err);
      }
    };
    fetchAuditCount();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
      };

      await axios.put('http://localhost:5001/api/auth/profile', updateData);
      setSuccess('Profile updated successfully.');
      logout();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <main className="profile-shell">
        <section className="profile-header">
          <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide">Profile</p>
          <h1>Account settings</h1>
          <p>Update your name and email. Use "Forgot password" to reset your password.</p>
        </section>

        <div className="profile-grid">
          <section className="profile-card">
            <h2>Account overview</h2>
            <div className="profile-stack">
              <div className="profile-metric">
                <p>Full name</p>
                <p>{user?.name || 'Your name'}</p>
              </div>
              <div className="profile-metric">
                <p>Email address</p>
                <p>{user?.email || 'your@email.com'}</p>
              </div>
              <div className="profile-metric">
                <p>Websites analyzed</p>
                <p>{auditCount}</p>
              </div>
            </div>
          </section>

          <section className="profile-card">
            <h2>Update profile</h2>
            <form onSubmit={handleSubmit} className="profile-form">
              {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">{error}</div>}
              {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">{success}</div>}

              <div>
                <label>Full name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div>
                <label>Email address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="profile-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save changes'}
                </button>
                <button type="button" onClick={() => navigate('/dashboard')} className="secondary-btn">
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
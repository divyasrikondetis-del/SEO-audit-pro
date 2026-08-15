import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useAudits } from '../hooks/useAudits';
import '../styles/home.css';

const Home = () => {
  const { user } = useAuth();
  const { audits, loading, error, fetchAudits } = useAudits();

  const latestCompletedAudit = useMemo(() => {
    if (!audits?.length) return null;

    const completedAudits = audits.filter((audit) => audit.status === 'completed');
    if (!completedAudits.length) return null;

    return [...completedAudits].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  }, [audits]);

  const scoreBreakdown = latestCompletedAudit?.scoreBreakdown || {};
  const quickWin = latestCompletedAudit?.recommendations?.find((item) => item?.title)
    || latestCompletedAudit?.recommendations?.[0]
    || null;

  const healthState = (() => {
    if (!user) {
      return {
        kind: 'guest',
        title: 'Sign in to view your SEO health',
        message: 'Track your real SEO performance and audit history with your personal dashboard.',
        actionLabel: 'Sign in',
        actionTo: '/login',
      };
    }

    if (loading) {
      return {
        kind: 'loading',
        title: 'Loading SEO health...',
        message: 'Fetching your latest audit data and recommendations.',
        actionLabel: null,
        actionTo: null,
      };
    }

    if (error) {
      return {
        kind: 'error',
        title: 'Unable to load SEO health data.',
        message: 'We could not fetch your latest audit information right now.',
        actionLabel: 'Try again',
        actionTo: null,
      };
    }

    if (!latestCompletedAudit) {
      return {
        kind: 'empty',
        title: 'No audit data yet.',
        message: 'Run your first SEO audit to see your website\'s real SEO health metrics.',
        actionLabel: 'Run your first audit',
        actionTo: '/dashboard',
      };
    }

    return {
      kind: 'data',
      title: 'Optimization signals',
      message: null,
      actionLabel: null,
      actionTo: null,
    };
  })();

  const features = [
    {
      icon: '⚡',
      title: 'Instant website audits',
      description: 'Run a complete SEO audit in seconds and receive a clear score with actionable fixes.',
    },
    {
      icon: '🔍',
      title: 'Technical SEO insights',
      description: 'Review metadata, headings, images, links, and core technical checks in one view.',
    },
    {
      icon: '📈',
      title: 'Track performance over time',
      description: 'Compare audits, monitor improvement, and build momentum with every optimization sprint.',
    },
    {
      icon: '🛡️',
      title: 'Secure and private',
      description: 'Your audits are protected with a personal workspace built for serious website owners.',
    },
    {
      icon: '🧠',
      title: 'Actionable recommendations',
      description: 'Every issue comes with practical next steps so you know exactly what to improve.',
    },
    {
      icon: '📱',
      title: 'Built for modern teams',
      description: 'Responsive, accessible, and ready to use on desktop, tablet, and mobile.',
    },
  ];

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <div className="home-badge">
                <span className="text-amber-300">★</span>
                Trusted by modern marketing and product teams
              </div>
              <h1 className="home-title">
                Turn SEO insights into
                <span className="home-title-accent">real growth.</span>
              </h1>
              <p className="home-subtitle">
                Audit any website, understand what matters, and ship confident SEO improvements with a polished, professional workflow.
              </p>
              <div className="home-cta-row">
                {user ? (
                  <Link to="/dashboard" className="home-cta-primary">
                    Open dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="home-cta-primary">
                      Start free audit
                    </Link>
                    <Link to="/login" className="home-cta-secondary">
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="home-dashboard-card">
              <div className="home-dashboard-panel">
                <div className="home-panel-header">
                  <div>
                    <p className="home-panel-label">SEO health snapshot</p>
                    <h3>{healthState.title}</h3>
                  </div>
                  {healthState.kind === 'data' && <span className="home-status-pill">Live</span>}
                </div>

                {healthState.kind === 'loading' && (
                  <div className="home-empty-state">
                    <p>{healthState.message}</p>
                  </div>
                )}

                {healthState.kind === 'error' && (
                  <div className="home-empty-state home-empty-state--error">
                    <p>{healthState.message}</p>
                    <button type="button" className="home-empty-state-button" onClick={fetchAudits}>
                      {healthState.actionLabel}
                    </button>
                  </div>
                )}

                {healthState.kind === 'guest' && (
                  <div className="home-empty-state">
                    <p>{healthState.message}</p>
                    <Link to={healthState.actionTo} className="home-empty-state-button">
                      {healthState.actionLabel}
                    </Link>
                  </div>
                )}

                {healthState.kind === 'empty' && (
                  <div className="home-empty-state">
                    <p>{healthState.message}</p>
                    <Link to={healthState.actionTo} className="home-empty-state-button">
                      {healthState.actionLabel}
                    </Link>
                  </div>
                )}

                {healthState.kind === 'data' && latestCompletedAudit && (
                  <>
                    <div className="home-metric-stack">
                      <div className="home-mini-metric purple">
                        <span>On-page</span>
                        <strong>{Math.round(scoreBreakdown.onPageSeo || 0)}%</strong>
                      </div>
                      <div className="home-mini-metric cyan">
                        <span>Technical</span>
                        <strong>{Math.round(scoreBreakdown.technicalSeo || 0)}%</strong>
                      </div>
                      <div className="home-mini-metric amber">
                        <span>Content</span>
                        <strong>{Math.round(scoreBreakdown.contentSeo || 0)}%</strong>
                      </div>
                    </div>

                    <div className="home-insight-box">
                      <div className="home-insight-dot" />
                      <div>
                        <p>Quick win</p>
                        <strong>
                          {quickWin?.title || 'No major issues detected. Keep monitoring your SEO health.'}
                        </strong>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-title">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-indigo-600">Why teams use it</p>
          <h2>A complete SEO workspace, without the clutter.</h2>
          <p>Turn auditing into a repeatable process with clear scoring, detailed recommendations, and great reporting.</p>
        </div>

        <div className="home-feature-grid">
          {features.map((feature, index) => (
            <div key={index} className="home-feature-card">
              <div className="home-feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {!user && (
        <section className="home-section">
          <div className="home-cta-box">
            <h2>Ready to improve your SEO workflow?</h2>
            <p>Launch your first audit and see your website health clearly in minutes.</p>
            <div className="home-cta-actions">
              <Link to="/register" className="primary">
                Start free
              </Link>
              <Link to="/login" className="secondary">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
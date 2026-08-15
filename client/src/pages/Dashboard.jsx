import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';
import EmptyState from '../components/common/EmptyState';
import AuditFilters from '../components/seo/AuditFilters';
import { useAudits } from '../hooks/useAudits';
import '../styles/audit.css';
import '../styles/dashboard.css';

const scoreLabel = (score = 0) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Improvement';
  return 'Poor';
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { audits, loading, error, createAudit, deleteAudit, stats: backendStats } = useAudits();
  const [url, setUrl] = useState('');
  const [auditing, setAuditing] = useState(false);
  const [search, setSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [auditToDelete, setAuditToDelete] = useState(null);

  const localStats = useMemo(() => {
    const completed = audits.filter((audit) => audit.status === 'completed');
    const total = audits.length;
    const averageScore = completed.length
      ? Math.round(completed.reduce((sum, audit) => sum + (audit.seoScore || 0), 0) / completed.length)
      : 0;
    const issueCount = audits.reduce((sum, audit) => sum + (audit.issues?.length || 0), 0);
    const byScore = [...completed].sort((a, b) => (a.seoScore || 0) - (b.seoScore || 0));
    const categoryCounts = audits.reduce((counts, audit) => {
      Object.entries(audit.issueCategories || {}).forEach(([category, count]) => {
        counts[category] = (counts[category] || 0) + count;
      });
      return counts;
    }, {});
    const commonIssue = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      total,
      averageScore,
      strong: completed.filter((audit) => (audit.seoScore || 0) >= 80).length,
      needsImprovement: completed.filter((audit) => (audit.seoScore || 0) < 60).length,
      issueCount,
      best: byScore.at(-1),
      worst: byScore[0],
      recent: audits[0],
      commonIssue: commonIssue?.[1] ? commonIssue[0] : null,
    };
  }, [audits]);

  const stats = backendStats && Object.keys(backendStats).length ? {
    total: backendStats.total ?? localStats.total,
    averageScore: backendStats.average ?? backendStats.averageScore ?? localStats.averageScore,
    strong: localStats.strong,
    needsImprovement: localStats.needsImprovement,
    issueCount: backendStats.issues ?? backendStats.totalIssues ?? localStats.issueCount,
    best: backendStats.bestAudit ?? localStats.best,
    worst: backendStats.worstAudit ?? localStats.worst,
    recent: backendStats.mostRecent ?? localStats.recent,
    commonIssue: localStats.commonIssue,
  } : localStats;

  const visibleAudits = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...audits]
      .filter((audit) => {
        const matchesSearch = !query || audit.url?.toLowerCase().includes(query) || (() => {
          try { return new URL(audit.url).hostname.toLowerCase().includes(query); } catch { return false; }
        })();
        const score = audit.seoScore || 0;
        const matchesScore = scoreFilter === 'all'
          || (scoreFilter === 'excellent' && score >= 80)
          || (scoreFilter === 'good' && score >= 60 && score < 80)
          || (scoreFilter === 'needs-improvement' && score >= 40 && score < 60)
          || (scoreFilter === 'poor' && score < 40);
        return matchesSearch && matchesScore && (statusFilter === 'all' || audit.status === statusFilter);
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'highest') return (b.seoScore || 0) - (a.seoScore || 0);
        if (sortBy === 'lowest') return (a.seoScore || 0) - (b.seoScore || 0);
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [audits, search, scoreFilter, statusFilter, sortBy]);

  const handleAudit = async (event) => {
    event.preventDefault();
    setAuditing(true);
    const result = await createAudit(url);
    setAuditing(false);
    if (!result.success) return toast.error(result.error || 'Unable to analyze this website. Please check the URL and try again.');
    setUrl('');
    toast.success(result.cached ? 'Showing your recent audit.' : 'Audit completed successfully.');
    navigate(`/audit/${result.audit._id}`);
  };

  const confirmDelete = async () => {
    const result = await deleteAudit(auditToDelete._id);
    setAuditToDelete(null);
    result.success ? toast.success('Audit deleted successfully.') : toast.error(result.error || 'Unable to delete this audit.');
  };

  if (loading) return <div className="min-h-[60vh] grid place-items-center text-slate-600">Loading your audits…</div>;

  return (
    <div className="dashboard-shell">
      <header className="dashboard-hero">
        <div className="dashboard-hero__content">
          <p className="dashboard-eyebrow">SEO workspace</p>
          <h1>Dashboard</h1>
          <p>Run fresh audits, monitor website health, and focus on the improvements that matter.</p>
        </div>
      </header>

      {error && <div className="dashboard-alert">{error}</div>}

      <section className="dashboard-metric-grid">
        {[
          ['Total audits', stats.total, 'indigo'],
          ['Average score', `${stats.averageScore}/100`, 'indigo'],
          ['Strong audits', stats.strong, 'emerald'],
          ['Needs improvement', stats.needsImprovement, 'amber'],
          ['Issues detected', stats.issueCount, 'rose'],
        ].map(([label, value, tone]) => (
          <div key={label} className={`dashboard-stat-card dashboard-stat-card--${tone}`}>
            <p className="dashboard-stat-card__label">{label}</p>
            <p className="dashboard-stat-card__value">{value}</p>
          </div>
        ))}
      </section>

      <section className="dashboard-run-panel">
        <div className="dashboard-run-panel__header">
          <div>
            <h2>Run a new audit</h2>
            <p>Enter a public website URL to receive a detailed, rule-based SEO report.</p>
          </div>
        </div>
        <form onSubmit={handleAudit} className="dashboard-run-form">
          <input type="url" required value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" className="dashboard-url-input" />
          <button disabled={auditing} className="dashboard-submit-btn">{auditing ? 'Analyzing website…' : 'Analyze website'}</button>
        </form>
      </section>

      {stats.total > 0 && (
        <section className="dashboard-insight-grid">
          <Insight label="Best audit" audit={stats.best} tone="emerald" />
          <Insight label="Most recently audited" audit={stats.recent} tone="indigo" />
          <div className="dashboard-insight-card">
            <p className="dashboard-insight-card__label">Quick insight</p>
            <p className="dashboard-insight-card__text">{stats.commonIssue ? `Most common issue category: ${stats.commonIssue}.` : 'No recurring issue category has been detected yet.'}</p>
            <Link className="dashboard-insight-link" to="/reports">View analytics →</Link>
          </div>
        </section>
      )}

      <section className="dashboard-audit-panel">
        <div className="dashboard-panel-header">
          <div>
            <h2>Recent audits</h2>
            <p>{visibleAudits.length} matching audit{visibleAudits.length === 1 ? '' : 's'}</p>
          </div>
          <Link to="/reports" className="dashboard-panel-link">Open reports →</Link>
        </div>
        {audits.length > 0 && (
          <div className="dashboard-filters-wrap">
            <AuditFilters search={search} onSearchChange={setSearch} scoreFilter={scoreFilter} onScoreFilterChange={setScoreFilter} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} sortBy={sortBy} onSortChange={setSortBy} />
          </div>
        )}
        {audits.length === 0 ? (
          <div className="mt-5">
            <EmptyState title="No audits yet" description="Run your first SEO audit to see your website's SEO health." actionLabel="Run New Audit" onAction={() => document.querySelector('input[type=url]')?.focus()} />
          </div>
        ) : (
          <div className="dashboard-audit-list">
            {visibleAudits.map((audit) => (
              <AuditRow key={audit._id} audit={audit} onView={() => navigate(`/audit/${audit._id}`)} onDelete={() => setAuditToDelete(audit)} />
            ))}
            {visibleAudits.length === 0 && <p className="dashboard-empty-state">No audits match these filters.</p>}
          </div>
        )}
      </section>

      <ConfirmModal open={Boolean(auditToDelete)} title="Delete this audit?" description="This action cannot be undone." onCancel={() => setAuditToDelete(null)} onConfirm={confirmDelete} />
    </div>
  );
};

const Insight = ({ label, audit, tone }) => (
  <div className="dashboard-insight-card">
    <p className="dashboard-insight-card__label">{label}</p>
    {audit ? (
      <>
        <p className="dashboard-insight-card__url">{audit.url}</p>
        <p className={`dashboard-insight-card__score ${tone === 'emerald' ? 'is-emerald' : 'is-indigo'}`}>{audit.seoScore || 0}/100</p>
      </>
    ) : (
      <p className="dashboard-insight-card__text">No completed audits yet.</p>
    )}
  </div>
);

const AuditRow = ({ audit, onView, onDelete }) => (
  <article className="audit-row">
    <div className="audit-row__main">
      <button onClick={onView} className="audit-row__url">{audit.url}</button>
      <p className="audit-row__meta">{new Date(audit.createdAt).toLocaleDateString()} · {audit.wordCount || 0} words · {audit.images || 0} images · {audit.issues?.length || 0} issues</p>
    </div>
    <div className="audit-row__controls">
      <div className="audit-row__score-wrap">
        <p className="audit-row__score">{audit.seoScore || 0}/100</p>
        <p className="audit-row__status">{audit.status === 'completed' ? scoreLabel(audit.seoScore) : audit.status}</p>
      </div>
      <button onClick={onView} className="audit-row__action audit-row__action--view">View</button>
      <button onClick={onDelete} className="audit-row__action audit-row__action--delete">Delete</button>
    </div>
  </article>
);

export default Dashboard;

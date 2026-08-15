import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuditCharts from '../components/seo/AuditCharts';
import AuditComparison from '../components/seo/AuditComparison';
import AuditFilters from '../components/seo/AuditFilters';
import EmptyState from '../components/common/EmptyState';
import { useAudits } from '../hooks/useAudits';
import { auditService } from '../services/auditService';
import '../styles/audit.css';
import '../styles/reports.css';

const formatDate = (value) => {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getScoreTone = (score) => {
  if (score >= 80) return 'is-success';
  if (score >= 60) return 'is-warning';
  return 'is-danger';
};

const getStatusTone = (status) => {
  if (status === 'completed') return 'is-success';
  if (status === 'failed') return 'is-danger';
  return 'is-warning';
};

const Reports = () => {
  const { audits, loading, error, stats: backendStats } = useAudits();
  const [search, setSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [beforeId, setBeforeId] = useState('');
  const [afterId, setAfterId] = useState('');
  const [comparison, setComparison] = useState(null);
  const [comparing, setComparing] = useState(false);

  const computedStats = useMemo(() => {
    const completed = audits.filter((audit) => audit.status === 'completed');
    const scores = completed.map((audit) => audit.seoScore || 0);

    return {
      total: audits.length,
      average: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
      highest: scores.length ? Math.max(...scores) : 0,
      lowest: scores.length ? Math.min(...scores) : 0,
      issues: audits.reduce((sum, audit) => sum + (audit.issues?.length || 0), 0),
      completed: completed.length,
      failed: audits.filter((audit) => audit.status === 'failed').length,
      websites: new Set(
        audits.map((audit) => {
          try {
            return new URL(audit.url).hostname;
          } catch {
            return audit.url;
          }
        })
      ).size,
    };
  }, [audits]);

  const stats = backendStats && Object.keys(backendStats).length
    ? {
        total: backendStats.total ?? computedStats.total,
        average: backendStats.average ?? backendStats.averageScore ?? computedStats.average,
        highest: backendStats.highest ?? backendStats.highestScore ?? computedStats.highest,
        lowest: backendStats.lowest ?? backendStats.lowestScore ?? computedStats.lowest,
        issues: backendStats.issues ?? backendStats.totalIssues ?? computedStats.issues,
        completed: backendStats.completed ?? backendStats.completedAudits ?? computedStats.completed,
        failed: backendStats.failed ?? backendStats.failedAudits ?? computedStats.failed,
        websites: backendStats.websites ?? backendStats.uniqueWebsites ?? computedStats.websites,
      }
    : computedStats;

  const filteredAudits = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...audits]
      .filter((audit) => {
        const score = audit.seoScore || 0;
        const matchesScore =
          scoreFilter === 'all' ||
          (scoreFilter === 'excellent' && score >= 80) ||
          (scoreFilter === 'good' && score >= 60 && score < 80) ||
          (scoreFilter === 'needs-improvement' && score >= 40 && score < 60) ||
          (scoreFilter === 'poor' && score < 40);

        return (
          (!query || audit.url?.toLowerCase().includes(query)) &&
          matchesScore &&
          (statusFilter === 'all' || audit.status === statusFilter)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'highest') return (b.seoScore || 0) - (a.seoScore || 0);
        if (sortBy === 'lowest') return (a.seoScore || 0) - (b.seoScore || 0);
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [audits, search, scoreFilter, statusFilter, sortBy]);

  const compare = async () => {
    if (!beforeId || !afterId || beforeId === afterId) {
      return toast.error('Choose two different audits to compare.');
    }

    setComparing(true);

    try {
      const result = await auditService.compare(beforeId, afterId);
      setComparison(result);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to compare these audits.');
    } finally {
      setComparing(false);
    }
  };

  if (loading) {
    return <div className="reports-loading">Loading reports…</div>;
  }

  return (
    <div className="reports-shell">
      <header className="reports-hero">
        <div className="reports-hero__copy">
          <p className="eyebrow">Analytics</p>
          <h1>SEO performance overview</h1>
          <p>Trends and issue patterns are calculated from your saved audit data.</p>
        </div>

        <Link to="/dashboard" className="reports-primary-button">
          Run new audit
        </Link>
      </header>

      {error && <div className="reports-error">{error}</div>}

      <section className="reports-overview-grid">
        {[
          ['Total audits', stats.total],
          ['Average', `${stats.average}/100`],
          ['Highest', `${stats.highest}/100`],
          ['Lowest', `${stats.lowest}/100`],
          ['Issues', stats.issues],
          ['Completed', stats.completed],
          ['Failed', stats.failed],
          ['Websites', stats.websites],
        ].map(([label, value]) => (
          <div key={label} className="reports-stat-card">
            <p className="reports-stat-card__label">{label}</p>
            <p className="reports-stat-card__value">{value}</p>
          </div>
        ))}
      </section>

      {audits.length ? (
        <>
          <AuditCharts audits={audits} />

          <section className="reports-panel">
            <h2>Compare audits</h2>
            <p>Select an earlier audit and a later audit. Changes are evaluated in the right direction for each metric.</p>

            <div className="reports-compare-controls">
              <select value={beforeId} onChange={(event) => setBeforeId(event.target.value)}>
                <option value="">Before audit</option>
                {audits.map((audit) => (
                  <option key={audit._id} value={audit._id}>
                    {formatDate(audit.createdAt)} — {audit.url}
                  </option>
                ))}
              </select>

              <select value={afterId} onChange={(event) => setAfterId(event.target.value)}>
                <option value="">After audit</option>
                {audits.map((audit) => (
                  <option key={audit._id} value={audit._id}>
                    {formatDate(audit.createdAt)} — {audit.url}
                  </option>
                ))}
              </select>

              <button type="button" onClick={compare} disabled={comparing} className="reports-compare-button">
                {comparing ? 'Comparing…' : 'Compare'}
              </button>
            </div>

            {comparison && (
              <div className="reports-comparison-wrap">
                <AuditComparison comparison={comparison.comparison} />
              </div>
            )}
          </section>

          <section className="reports-panel">
            <h2>Audit library</h2>

            <div className="reports-filters-wrap">
              <AuditFilters
                search={search}
                onSearchChange={setSearch}
                scoreFilter={scoreFilter}
                onScoreFilterChange={setScoreFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>

            <div className="reports-table-shell">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Website</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Issues</th>
                    <th>Date</th>
                    <th>Report</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAudits.map((audit) => (
                    <tr key={audit._id}>
                      <td>
                        <a href={audit.url} target="_blank" rel="noreferrer" className="reports-table__link">
                          {audit.url}
                        </a>
                      </td>
                      <td className={`reports-score-cell ${getScoreTone(audit.seoScore || 0)}`}>
                        {audit.seoScore ?? 0}/100
                      </td>
                      <td>
                        <span className={`reports-status-badge ${getStatusTone(audit.status)}`}>
                          {audit.status}
                        </span>
                      </td>
                      <td>{audit.issues?.length || 0}</td>
                      <td>{formatDate(audit.createdAt)}</td>
                      <td>
                        <Link to={`/audit/${audit._id}`} className="reports-table__button">
                          View report
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <EmptyState
          title="No audits yet"
          description="Run your first SEO audit and your metrics will begin to appear here."
          actionLabel="Create report"
          onAction={() => window.location.assign('/dashboard')}
        />
      )}
    </div>
  );
};

export default Reports;

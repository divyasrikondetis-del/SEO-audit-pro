// React import not required with new JSX transform
import ScoreBreakdown from './ScoreBreakdown';
import SeoCheckCard from './SeoCheckCard';
import RecommendationCard from './RecommendationCard';

const AuditReport = ({ audit }) => {
  const score = audit?.seoScore || 0;
  const checks = audit?.checks || [];
  const passedChecks = checks.filter((check) => check.status === 'pass');
  const criticalIssues = checks.filter((check) => check.status === 'fail');
  const warningIssues = checks.filter((check) => check.status === 'warning');

  const getScoreLabel = () => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  const aiRecommendations = (audit?.recommendations?.length
    ? audit.recommendations
    : checks
      .filter((check) => check.status !== 'pass' && check.recommendation)
      .map((check) => ({ title: check.name, description: check.recommendation, severity: check.status === 'fail' ? 'high' : 'medium' })))
    .slice(0, 5);

  return (
    <div className="report-sections">
      <section className="audit-card">
        <div className="audit-section-heading">
          <h2>Website overview</h2>
        </div>
        <div className="audit-grid">
          <div className="audit-metric-card">
            <p>Website URL</p>
            <p>{audit?.url}</p>
          </div>
          <div className="audit-metric-card">
            <p>Audited on</p>
            <p>{new Date(audit?.createdAt).toLocaleString()}</p>
          </div>
          <div className="audit-metric-card">
            <p>Overall score</p>
            <p>{score}/100 • {getScoreLabel()}</p>
          </div>
          <div className="audit-metric-card">
            <p>Status</p>
            <p>{audit?.status}</p>
          </div>
        </div>
      </section>

      <section className="audit-card">
        <div className="audit-section-heading">
          <h2>Score breakdown</h2>
        </div>
        <ScoreBreakdown breakdown={audit?.scoreBreakdown || {}} />
      </section>

      <section className="audit-card">
        <div className="audit-section-heading">
          <h2>Issues found</h2>
        </div>
        <div className="issue-summary">
          <div className="issue-summary-card">
            <span className="issue-summary-label">SEO Score</span>
            <strong>{score}/100</strong>
            <small>{getScoreLabel()}</small>
          </div>
          <div className="issue-summary-card">
            <span className="issue-summary-label">Warnings</span>
            <strong>{warningIssues.length}</strong>
            <small>Important items to review</small>
          </div>
          <div className="issue-summary-card">
            <span className="issue-summary-label">Critical</span>
            <strong>{criticalIssues.length}</strong>
            <small>Potential SEO blockers</small>
          </div>
          <div className="issue-summary-card">
            <span className="issue-summary-label">Passed checks</span>
            <strong>{passedChecks.length}</strong>
            <small>Successful checks</small>
          </div>
        </div>

        <div className="stacked-list stacked-list--tight">
          {warningIssues.length > 0 && (
            <div className="severity-group">
              <h3>Warnings</h3>
              {warningIssues.map((check) => <SeoCheckCard key={`warning-${check.name}`} check={check} />)}
            </div>
          )}

          {criticalIssues.length > 0 && (
            <div className="severity-group">
              <h3>Critical</h3>
              {criticalIssues.map((check) => <SeoCheckCard key={`critical-${check.name}`} check={check} />)}
            </div>
          )}
        </div>
      </section>

      <section className="audit-card">
        <div className="audit-section-heading">
          <h2>Passed checks</h2>
        </div>
        <div className="stacked-list stacked-list--tight">
          {passedChecks.length ? passedChecks.map((check) => <SeoCheckCard key={check.name} check={check} />) : <p className="empty-muted">No passed checks were detected for this audit.</p>}
        </div>
      </section>

      <section className="audit-card">
        <div className="audit-section-heading">
          <h2>Recommendations</h2>
        </div>
        <div className="stacked-list stacked-list--tight">
          {(audit?.recommendations || []).length ? (
            (audit?.recommendations || []).map((recommendation, index) => <RecommendationCard key={`${recommendation.title}-${index}`} recommendation={recommendation} />)
          ) : (
            <p className="empty-muted">No recommendations were found for this audit.</p>
          )}
        </div>
      </section>

      <section className="audit-card">
        <div className="audit-section-heading">
          <h2>AI SEO Recommendations</h2>
          <span className="text-sm text-slate-500">Rule-based from this audit</span>
        </div>
        {aiRecommendations.length ? (
          <ol className="ai-recommendation-list">
            {aiRecommendations.map((recommendation, index) => <li key={`${recommendation.title}-${index}`}><strong>{recommendation.title}</strong><span>{recommendation.description}</span></li>)}
          </ol>
        ) : <p className="text-slate-500">No priority recommendations are available because this audit has no warnings or failures.</p>}
      </section>

      <section className="audit-card">
        <div className="audit-section-heading">
          <h2>Content analysis</h2>
        </div>
        <div className="audit-grid">
          <div className="audit-metric-card"><p>Word count</p><p>{audit?.contentStats?.wordCount || 0}</p></div>
          <div className="audit-metric-card"><p>H1 count</p><p>{audit?.contentStats?.h1Count || 0}</p></div>
          <div className="audit-metric-card"><p>H2 count</p><p>{audit?.contentStats?.h2Count || 0}</p></div>
          <div className="audit-metric-card"><p>H3 count</p><p>{audit?.contentStats?.h3Count || 0}</p></div>
        </div>
      </section>

      <section className="audit-card">
        <div className="audit-section-heading">
          <h2>Image analysis</h2>
        </div>
        <div className="audit-grid">
          <div className="audit-metric-card"><p>Total images</p><p>{audit?.imageStats?.total || 0}</p></div>
          <div className="audit-metric-card"><p>With alt text</p><p>{audit?.imageStats?.withAlt || 0}</p></div>
          <div className="audit-metric-card"><p>Missing alt text</p><p>{audit?.imageStats?.withoutAlt || 0}</p></div>
        </div>
      </section>

      <section className="audit-card">
        <div className="audit-section-heading">
          <h2>Link analysis</h2>
        </div>
        <div className="audit-grid">
          <div className="audit-metric-card"><p>Total links</p><p>{audit?.linkStats?.total || 0}</p></div>
          <div className="audit-metric-card"><p>Internal links</p><p>{audit?.linkStats?.internal || 0}</p></div>
          <div className="audit-metric-card"><p>External links</p><p>{audit?.linkStats?.external || 0}</p></div>
          <div className="audit-metric-card"><p>Invalid links</p><p>{audit?.linkStats?.invalidLinks || 0}</p></div>
        </div>
      </section>

      <section className="audit-card">
        <div className="audit-section-heading">
          <h2>Technical SEO</h2>
        </div>
        <div className="audit-grid">
          <div className="audit-metric-card"><p>HTTPS</p><p>{audit?.technicalStats?.https ? 'Enabled' : 'Disabled'}</p></div>
          <div className="audit-metric-card"><p>Canonical URL</p><p>{audit?.technicalStats?.canonical || 'Not detected'}</p></div>
          <div className="audit-metric-card"><p>Robots.txt</p><p>{audit?.technicalStats?.robotsTxt ? 'Available' : 'Not detected'}</p></div>
          <div className="audit-metric-card"><p>Sitemap.xml</p><p>{audit?.technicalStats?.sitemapXml ? 'Available' : 'Not detected'}</p></div>
        </div>
      </section>
    </div>
  );
};

export default AuditReport;

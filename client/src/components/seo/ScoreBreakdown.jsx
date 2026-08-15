// React import not required with new JSX transform

const ScoreBreakdown = ({ breakdown }) => {
  const categories = [
    { key: 'technicalSeo', label: 'Technical SEO' },
    { key: 'contentSeo', label: 'Content SEO' },
    { key: 'onPageSeo', label: 'On-Page SEO' },
    { key: 'images', label: 'Images' },
    { key: 'links', label: 'Links' },
    { key: 'accessibility', label: 'Accessibility' },
  ];

  const getScoreTone = (value) => {
    if (value >= 90) return 'excellent';
    if (value >= 75) return 'good';
    if (value >= 50) return 'needs-improvement';
    return 'poor';
  };

  return (
    <div className="score-breakdown-grid">
      {categories.map((item) => {
        const value = breakdown?.[item.key] ?? 0;
        const tone = getScoreTone(value);

        return (
          <div key={item.key} className="score-breakdown-card">
            <div className="score-breakdown-header">
              <span>{item.label}</span>
              <strong>{value}/100</strong>
            </div>
            <div className="score-breakdown-meta">
              <span className={`score-status score-status--${tone}`}>{
                value >= 90 ? 'Excellent' : value >= 75 ? 'Good' : value >= 50 ? 'Needs Improvement' : 'Poor'
              }</span>
            </div>
            <div className="score-bar" aria-label={`${item.label} score ${value} out of 100`}>
              <div className={`score-bar-fill score-bar-fill--${tone}`} style={{ width: `${value}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScoreBreakdown;

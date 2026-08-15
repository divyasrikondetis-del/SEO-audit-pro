// React import not required with new JSX transform

const SeoCheckCard = ({ check }) => {
  const statusConfig = {
    pass: { label: 'Passed', className: 'seo-check-pass' },
    warning: { label: 'Warning', className: 'seo-check-warning' },
    fail: { label: 'Critical', className: 'seo-check-fail' },
  };

  const config = statusConfig[check?.status] || statusConfig.fail;

  return (
    <div className={`seo-check-card ${config.className}`}>
      <div className="seo-check-head">
        <div>
          <h4>{check?.name}</h4>
          <p>{check?.explanation || 'No additional explanation provided.'}</p>
        </div>
        <span className="seo-check-badge">{config.label}</span>
      </div>
      {check?.recommendation ? <div className="seo-check-recommendation">{check.recommendation}</div> : null}
    </div>
  );
};

export default SeoCheckCard;

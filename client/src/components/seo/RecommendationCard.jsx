// React import not required with new JSX transform

const RecommendationCard = ({ recommendation }) => {
  const severityMap = {
    high: 'Critical',
    medium: 'Warning',
    low: 'Low',
  };

  const severity = severityMap[recommendation?.severity] || 'Warning';

  return (
    <div className="recommendation-card">
      <div className="recommendation-head">
        <h4>{recommendation?.title}</h4>
        <span className={`recommendation-pill ${recommendation?.severity || 'medium'}`}>{severity}</span>
      </div>
      <div className="recommendation-body">
        <div className="recommendation-block">
          <p className="recommendation-label">Why it matters</p>
          <p>{recommendation?.description || 'This issue may affect the site’s SEO health and should be reviewed.'}</p>
        </div>
        <div className="recommendation-block">
          <p className="recommendation-label">What to do</p>
          <p>{recommendation?.description || 'Apply the relevant fix based on the audit finding and re-run the check after updating the page.'}</p>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;

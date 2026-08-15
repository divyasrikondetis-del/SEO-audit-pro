// React import not required with new JSX transform

const SEOIssues = ({ issues }) => {
  const getSeverityColor = (issue) => {
    if (issue.includes('Missing') || issue.includes('No')) {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    if (issue.includes('too short') || issue.includes('too long') || issue.includes('low')) {
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getRecommendation = (issue) => {
    if (issue.includes('Meta description')) {
      return 'Add a compelling meta description between 50-160 characters to improve click-through rates from search results.';
    }
    if (issue.includes('images are missing alt text')) {
      return 'Add descriptive alt text to all images for better accessibility and image SEO.';
    }
    if (issue.includes('internal links')) {
      return 'Add internal links to help search engines discover other pages on your site and improve site structure.';
    }
    if (issue.includes('word count')) {
      return 'Add more valuable content to improve search engine rankings. Aim for at least 300 words.';
    }
    if (issue.includes('Title')) {
      return 'Optimize your title tag to be between 10-60 characters and include primary keywords.';
    }
    if (issue.includes('HTTPS')) {
      return 'Enable HTTPS on your site for better security and ranking.';
    }
    return 'Review this issue and make necessary improvements.';
  };

  if (!issues || issues.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <div className="text-green-500 text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Issues Found!</h2>
          <p className="text-gray-600">This page has excellent SEO! Great job! 🚀</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        ⚠️ SEO Issues ({issues.length})
      </h2>
      <div className="space-y-3">
        {issues.map((issue, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getSeverityColor(issue)}`}
          >
            <div className="flex items-start">
              <span className="text-xl mr-3">
                {issue.includes('Missing') || issue.includes('No') ? '❌' : '⚠️'}
              </span>
              <div>
                <p className="font-medium">{issue}</p>
                <p className="text-sm mt-1 text-gray-600">
                  💡 {getRecommendation(issue)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SEOIssues;
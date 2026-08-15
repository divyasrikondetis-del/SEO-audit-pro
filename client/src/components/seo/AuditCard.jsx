// React import not required with new JSX transform
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

const AuditCard = ({ audit, onDelete }) => {
  const navigate = useNavigate();

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (score) => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '📈';
    return '🔧';
  };

  const handleCardClick = () => {
    navigate(`/audit/${audit._id}`);
  };

  return (
    <div 
      className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer hover:border-blue-400"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <a
            href={audit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {audit.url}
          </a>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
            <span className="text-gray-600">📝 {audit.wordCount} words</span>
            <span className="text-gray-600">🔗 {audit.links} links</span>
            <span className="text-gray-600">🖼️ {audit.images} images</span>
            <span className="text-gray-600">📅 {new Date(audit.createdAt).toLocaleDateString()}</span>
          </div>
          {audit.issues?.length > 0 && (
            <div className="mt-2">
              <span className="text-sm text-red-600">⚠️ {audit.issues.length} issues found</span>
            </div>
          )}
          {audit.issues?.length === 0 && (
            <div className="mt-2">
              <span className="text-sm text-green-600">✅ No issues found!</span>
            </div>
          )}
        </div>
        <div className="text-right ml-4">
          <div className={`text-2xl font-bold ${getScoreColor(audit.seoScore)}`}>
            {audit.seoScore}/100
          </div>
          <div className="text-sm text-gray-500">
            {getScoreEmoji(audit.seoScore)} {audit.seoScore >= 80 ? 'Excellent' : audit.seoScore >= 60 ? 'Good' : 'Needs Work'}
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(audit._id);
            }}
            className="mt-2"
          >
            🗑️ Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuditCard;
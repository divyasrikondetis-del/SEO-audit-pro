import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const AuditForm = ({ onSubmit, loading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!url) {
      setError('Please enter a URL');
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('Please enter a valid URL with http:// or https://');
      return;
    }

    onSubmit(url);
    setUrl('');
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">🚀 Run New SEO Audit</h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="url"
            placeholder="Enter website URL (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            error={error}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="sm:w-auto"
        >
          {loading ? 'Auditing...' : '🔍 Audit Website'}
        </Button>
      </form>
    </div>
  );
};

export default AuditForm;
// React import not required with new JSX transform
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const AuditCharts = ({ audits }) => {
  const trendData = (audits || []).slice().reverse().map((audit) => ({
    label: new Date(audit.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: audit.seoScore || 0,
  }));

  const issueData = [
    { name: 'Technical', value: (audits || []).reduce((sum, audit) => sum + (audit.issueCategories?.technical || 0), 0) },
    { name: 'Content', value: (audits || []).reduce((sum, audit) => sum + (audit.issueCategories?.content || 0), 0) },
    { name: 'Images', value: (audits || []).reduce((sum, audit) => sum + (audit.issueCategories?.images || 0), 0) },
    { name: 'Links', value: (audits || []).reduce((sum, audit) => sum + (audit.issueCategories?.links || 0), 0) },
    { name: 'Accessibility', value: (audits || []).reduce((sum, audit) => sum + (audit.issueCategories?.accessibility || 0), 0) },
  ];

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h3>Score trend</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="5 5" />
            <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Issue distribution</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={issueData}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="5 5" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {issueData.map((entry, index) => (
                <Cell key={`${entry.name}-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#2563eb'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AuditCharts;

// React import not required with new JSX transform

const AuditFilters = ({ search, onSearchChange, scoreFilter, onScoreFilterChange, statusFilter, onStatusFilterChange, sortBy, onSortChange }) => (
  <div className="audit-filters">
    <input type="text" placeholder="Search audits by URL or domain" value={search} onChange={(e) => onSearchChange(e.target.value)} />
    <select value={scoreFilter} onChange={(e) => onScoreFilterChange(e.target.value)}>
      <option value="all">All</option>
      <option value="excellent">Excellent</option>
      <option value="good">Good</option>
      <option value="needs-improvement">Needs Improvement</option>
      <option value="poor">Poor</option>
    </select>
    <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)}>
      <option value="all">All statuses</option>
      <option value="completed">Completed</option>
      <option value="failed">Failed</option>
    </select>
    <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
      <option value="newest">Newest</option>
      <option value="oldest">Oldest</option>
      <option value="highest">Highest score</option>
      <option value="lowest">Lowest score</option>
    </select>
  </div>
);

export default AuditFilters;

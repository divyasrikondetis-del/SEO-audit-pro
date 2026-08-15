// React import not required with new JSX transform

const AuditComparison = ({ comparison }) => (
  <div className="comparison-card">
    <div className="comparison-head">
      <h3>Audit comparison</h3>
      <p>Improvements are highlighted in green and regressions in orange.</p>
    </div>
    <div className="comparison-table-wrap">
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Before</th>
            <th>After</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {(comparison || []).map((row) => {
            const delta = (row.after || 0) - (row.before || 0);
            const lowerIsBetter = ['Missing Alt', 'Issues'].includes(row.label);
            const improved = delta !== 0 && (lowerIsBetter ? delta < 0 : delta > 0);
            const changeClass = delta === 0 ? 'neutral' : improved ? 'positive' : 'negative';
            return (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td>{row.before}</td>
                <td>{row.after}</td>
                <td className={changeClass}>{delta > 0 ? `+${delta}` : delta} {delta !== 0 ? (improved ? 'improved' : 'declined') : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default AuditComparison;

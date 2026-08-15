// React import not required with new JSX transform

const EmptyState = ({ title, description, actionLabel, onAction }) => (
  <div className="empty-state">
    <h3>{title}</h3>
    <p>{description}</p>
    {actionLabel && onAction ? (
      <button type="button" className="empty-state-action" onClick={onAction}>{actionLabel}</button>
    ) : null}
  </div>
);

export default EmptyState;

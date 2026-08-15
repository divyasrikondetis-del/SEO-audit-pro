// React import not required with new JSX transform

const ConfirmModal = ({ open, title, description, onCancel, onConfirm, confirmLabel = 'Delete' }) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="modal-actions">
          <button type="button" className="modal-cancel" onClick={onCancel}>Cancel</button>
          <button type="button" className="modal-confirm" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

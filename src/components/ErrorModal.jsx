export default function ErrorModal({ modal, onClose }) {
  if (!modal.visible) return null;

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleOverlayClick}
    >
      <div className="modal">
        <div className="modal-icon">⚠️</div>
        <h2 className="modal-title" id="modal-title">
          {modal.title}
        </h2>
        <p className="modal-message">{modal.message}</p>
        <button className="button button-full" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

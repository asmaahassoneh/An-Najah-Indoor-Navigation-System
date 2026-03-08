export default function ConfirmDialog({
  open,
  title = "Confirm Action",
  message = "Are you sure?",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  danger = true,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="confirmOverlay" onClick={onCancel}>
      <div
        className="confirmCard"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="confirmTitle">{title}</h3>
        <p className="confirmMessage">{message}</p>

        <div className="confirmActions">
          <button
            type="button"
            className=" authBtnSecondary confirmBtn"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`confirmBtn ${danger ? "confirmDangerBtn" : "authBtn authBtnEnter"}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

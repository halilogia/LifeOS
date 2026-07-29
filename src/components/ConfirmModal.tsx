import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  lang: Language;
  onConfirm: () => void;
  onCancel?: () => void;
  isAlert?: boolean;
}

export function ConfirmModal({
  isOpen,
  message,
  lang,
  onConfirm,
  onCancel,
  isAlert = false,
}: ConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  const t = translations[lang];
  const okLabel = t.confirm_ok;
  const cancelLabel = t.confirm_cancel;

  const handleOverlayClick = () => {
    if (isAlert) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon-wrapper">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div
          className="confirm-modal-message"
          style={{ whiteSpace: "pre-wrap", textAlign: "center", width: "100%" }}
        >
          {message}
        </div>
        <div className="confirm-modal-actions">
          <button className="confirm-modal-btn primary" onClick={onConfirm}>
            {okLabel}
          </button>
          {!isAlert && onCancel && (
            <button className="confirm-modal-btn secondary" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

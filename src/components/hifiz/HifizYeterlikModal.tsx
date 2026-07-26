import { Language } from "@/types/types.js";

interface HifizYeterlikModalProps {
  lang: Language;
  activeYeterlik: { title: string; description: string };
  onClose: () => void;
}

export function HifizYeterlikModal({
  lang,
  activeYeterlik,
  onClose,
}: HifizYeterlikModalProps) {
  return (
    <div className="settings-panel active" onClick={onClose}>
      <div
        className="settings-content"
        style={{ maxWidth: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="settings-header">
          <h3 id="yeterlik-modal-title">{activeYeterlik.title}</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </header>
        <div className="note-editor-body" style={{ padding: "24px" }}>
          <p
            id="yeterlik-modal-description"
            style={{
              fontSize: "1.1rem",
              lineHeight: 1.6,
              color: "var(--text-primary)",
            }}
          >
            {activeYeterlik.description}
          </p>
        </div>
        <div className="settings-footer">
          <button
            className="settings-add-btn"
            style={{ width: "auto", padding: "0 30px" }}
            onClick={onClose}
          >
            {lang === "tr" ? "Anladım" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
}

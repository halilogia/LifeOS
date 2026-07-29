/**
 * NotesHeaderBar.tsx
 * Notlar başlığı ve Yeni Not / Yeni Söz ekleme butonları.
 */

import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/types/types.js";

interface NotesHeaderBarProps {
  title: string;
  lang: Language;
  onOpenQuoteModal: () => void;
  onOpenNoteModal: () => void;
  onOpenGraphModal?: () => void;
}

function IconMessageSquare() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function NotesHeaderBar({
  title,
  lang,
  onOpenQuoteModal,
  onOpenNoteModal,
  onOpenGraphModal,
}: NotesHeaderBarProps) {
  const t = getTranslation(lang);
  return (
    <div className="notes-header">
      <h2>{title}</h2>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {onOpenGraphModal && (
          <button
            type="button"
            className="add-note-action-btn secondary"
            onClick={onOpenGraphModal}
            style={{
              background: "rgba(168, 85, 247, 0.2)",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              color: "#c084fc",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>🕸️</span>
            <span>{t.notes_header_graph}</span>
          </button>
        )}
        <button
          id="add-quote-btn"
          className="add-note-action-btn secondary"
          onClick={onOpenQuoteModal}
        >
          <IconMessageSquare />
          <span>{t.notes_header_new_quote}</span>
        </button>
        <button
          id="add-note-btn"
          className="add-note-action-btn primary"
          onClick={onOpenNoteModal}
        >
          <IconPlus />
          <span>{t.notes_header_new_note}</span>
        </button>
      </div>
    </div>
  );
}

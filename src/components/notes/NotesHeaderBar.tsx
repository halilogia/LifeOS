/**
 * NotesHeaderBar.tsx
 * Notlar başlığı ve Yeni Not / Yeni Söz ekleme butonları.
 */

interface NotesHeaderBarProps {
  title: string;
  lang: string;
  onOpenQuoteModal: () => void;
  onOpenNoteModal: () => void;
}

function IconMessageSquare() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
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
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
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
}: NotesHeaderBarProps) {
  return (
    <div className="notes-header">
      <h2>{title}</h2>
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          id="add-quote-btn"
          className="add-note-action-btn secondary"
          onClick={onOpenQuoteModal}
        >
          <IconMessageSquare />
          <span>{lang === "tr" ? "Yeni Söz" : "New Quote"}</span>
        </button>
        <button
          id="add-note-btn"
          className="add-note-action-btn primary"
          onClick={onOpenNoteModal}
        >
          <IconPlus />
          <span>{lang === "tr" ? "Yeni Not" : "New Note"}</span>
        </button>
      </div>
    </div>
  );
}

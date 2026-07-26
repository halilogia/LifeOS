/**
 * QuoteEditorModal.tsx
 * Yeni Özlü Söz ekleme modali.
 */

interface QuoteEditorModalProps {
  isOpen: boolean;
  lang: string;
  quoteContent: string;
  quoteAuthor: string;
  onClose: () => void;
  onQuoteContentChange: (val: string) => void;
  onQuoteAuthorChange: (val: string) => void;
  onSave: () => void;
}

export function QuoteEditorModal({
  isOpen,
  lang,
  quoteContent,
  quoteAuthor,
  onClose,
  onQuoteContentChange,
  onQuoteAuthorChange,
  onSave,
}: QuoteEditorModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="settings-panel active" onClick={onClose}>
      <div
        className="settings-content"
        style={{ maxWidth: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="settings-header">
          <h3>{lang === "tr" ? "Yeni Özlü Söz" : "New Quote"}</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </header>
        <div className="note-editor-body" style={{ padding: "20px" }}>
          <textarea
            id="quote-content-input"
            className="note-content-input"
            style={{ height: "120px", fontStyle: "italic" }}
            value={quoteContent}
            onInput={(e) =>
              onQuoteContentChange((e.target as HTMLTextAreaElement).value)
            }
            placeholder={
              lang === "tr"
                ? "Özlü sözü buraya yazın..."
                : "Write the quote here..."
            }
          />
          <input
            type="text"
            id="quote-author-input"
            className="note-title-input"
            style={{ marginTop: "10px", fontSize: "0.9rem" }}
            value={quoteAuthor}
            onInput={(e) =>
              onQuoteAuthorChange((e.target as HTMLInputElement).value)
            }
            placeholder={
              lang === "tr" ? "Yazar (Opsiyonel)" : "Author (Optional)"
            }
          />
        </div>
        <div className="settings-footer">
          <button
            id="save-quote-btn"
            className="settings-add-btn"
            style={{ width: "auto", padding: "0 20px" }}
            onClick={onSave}
          >
            {lang === "tr" ? "Ekle" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

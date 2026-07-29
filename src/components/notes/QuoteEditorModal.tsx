/**
 * QuoteEditorModal.tsx
 * Yeni Özlü Söz ekleme modali.
 */

import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/types/types.js";

interface QuoteEditorModalProps {
  isOpen: boolean;
  lang: Language;
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
  const t = getTranslation(lang);
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
          <h3>{t.notes_quote_title}</h3>
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
            placeholder={t.notes_quote_content_placeholder}
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
            placeholder={t.notes_quote_author_placeholder}
          />
        </div>
        <div className="settings-footer">
          <button
            id="save-quote-btn"
            className="settings-add-btn"
            style={{ width: "auto", padding: "0 20px" }}
            onClick={onSave}
          >
            {t.notes_quote_add}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "preact/hooks";
import type { Language } from "@/types/types.js";
import type { MediaItem } from "@/types/media.js";
import { getTranslation } from "@/utils/i18n.js";

interface MediaQuotesModalProps {
  isOpen: boolean;
  book: MediaItem | null;
  lang: Language;
  onAddQuote: (bookId: string, quoteText: string, page?: number) => void;
  onRemoveQuote: (bookId: string, quoteId: string) => void;
  onClose: () => void;
}

export function MediaQuotesModal({
  isOpen,
  book,
  lang,
  onAddQuote,
  onRemoveQuote,
  onClose,
}: MediaQuotesModalProps) {
  if (!isOpen || !book) {
    return null;
  }

  const t = getTranslation(lang);
  const [quoteText, setQuoteText] = useState("");
  const [page, setPage] = useState("");

  const quotes = book.bookProgress?.quotes || [];

  const handleAdd = (e: Event) => {
    e.preventDefault();
    if (!quoteText.trim()) {
      return;
    }
    const pageNum = page ? parseInt(page, 10) : undefined;
    onAddQuote(book.id, quoteText.trim(), pageNum);
    setQuoteText("");
    setPage("");
  };

  return (
    <div className="media-modal-overlay" onClick={onClose}>
      <div
        className="media-modal-container media-quotes-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="media-modal-header">
          <div>
            <h2 className="media-modal-title">
              {t.media_quotes_title || "Book Quotes & Excerpts"}
            </h2>
            <p className="media-quotes-book-subtitle">
              📖 <strong>{book.title}</strong>
              {book.creator ? ` — ${book.creator}` : ""}
            </p>
          </div>
          <button
            type="button"
            className="media-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Add Quote Form */}
        <form onSubmit={handleAdd} className="media-quotes-form">
          <textarea
            required
            rows={3}
            className="media-form-textarea"
            placeholder={
              t.media_quotes_input_placeholder ||
              "Paste your favorite excerpt or quote here..."
            }
            value={quoteText}
            onInput={(e) =>
              setQuoteText((e.target as HTMLInputElement).value)
            }
          />

          <div className="media-quotes-form-row">
            <input
              type="number"
              min="1"
              className="media-form-input media-quotes-page-input"
              placeholder={
                t.media_quotes_page_placeholder || "Page no (optional)"
              }
              value={page}
              onInput={(e) => setPage((e.target as HTMLInputElement).value)}
            />

            <button type="submit" className="media-btn-primary">
              <svg
                width="14"
                height="14"
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
              <span>{t.media_quotes_add_btn || "Add Quote"}</span>
            </button>
          </div>
        </form>

        {/* Quotes List */}
        <div className="media-quotes-list">
          {quotes.length === 0 ? (
            <div className="media-quotes-empty">
              <p>
                {t.media_quotes_empty ||
                  "No quotes saved for this book yet."}
              </p>
            </div>
          ) : (
            quotes.map((q) => (
              <div key={q.id} className="media-quote-item">
                <blockquote className="media-quote-text">
                  "{q.text}"
                </blockquote>
                <div className="media-quote-footer">
                  {q.page ? (
                    <span className="media-quote-page-tag">
                      {t.media_quotes_page_badge || "Page"} {q.page}
                    </span>
                  ) : (
                    <span />
                  )}

                  <button
                    type="button"
                    className="media-quote-delete-btn"
                    title="Delete quote"
                    onClick={() => onRemoveQuote(book.id, q.id)}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

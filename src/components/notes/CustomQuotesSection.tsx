/**
 * CustomQuotesSection.tsx
 * Kullanıcının kaydettiği özel özlü sözlerin gösterim ve silme bölümü.
 */

import { CustomQuote } from "@/types/types.js";

interface CustomQuotesSectionProps {
  quotes: CustomQuote[];
  lang: string;
  onDeleteQuote: (index: number) => void;
}

export function CustomQuotesSection({
  quotes,
  lang,
  onDeleteQuote,
}: CustomQuotesSectionProps) {
  if (quotes.length === 0) {
    return null;
  }

  return (
    <div className="quotes-sub-section" style={{ marginBottom: "20px" }}>
      <h3
        style={{
          fontSize: "0.9rem",
          opacity: 0.6,
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginBottom: "10px",
        }}
      >
        {lang === "tr" ? "Eklediğim Sözler" : "My Custom Quotes"}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {quotes.map((q, idx) => (
          <div
            key={idx}
            className="settings-list-item"
            style={{
              background: "var(--card-bg, rgba(255,255,255,0.02))",
              border: "1px solid var(--card-border, rgba(255,255,255,0.06))",
              padding: "10px 14px",
              borderRadius: "10px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontStyle: "italic" }}>"{q.text}"</span>
              {q.author && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    opacity: 0.5,
                    marginTop: "2px",
                  }}
                >
                  — {q.author}
                </span>
              )}
            </div>
            <button
              className="settings-del-btn"
              onClick={() => onDeleteQuote(idx)}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

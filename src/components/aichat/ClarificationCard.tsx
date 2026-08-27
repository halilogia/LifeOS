/**
 * ClarificationCard.tsx
 * Interactive card displayed inside chat messages when AI requests clarification.
 * Provides quick selection buttons, custom text input, and cancellation.
 */

import { useState } from "preact/hooks";
import type { ClarificationRequest, ClarificationOption } from "@/services/aichat/types.js";

interface ClarificationCardProps {
  clarification: ClarificationRequest;
  t: Record<string, string>;
  onSelectOption: (value: string) => void;
  onSubmitCustomAnswer: (customText: string) => void;
  onCancel?: () => void;
}

export function ClarificationCard({
  clarification,
  t,
  onSelectOption,
  onSubmitCustomAnswer,
  onCancel,
}: ClarificationCardProps) {
  const [customText, setCustomText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitCustom = (e?: Event) => {
    e?.preventDefault();
    if (!customText.trim() || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    onSubmitCustomAnswer(customText.trim());
  };

  const handleSelect = (val: string) => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    onSelectOption(val);
  };

  // If already answered/resolved
  if (clarification.resolved) {
    return (
      <div className="clarification-card resolved">
        <div className="clarification-header resolved">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{t.clarification_resolved_label || "Tercih Belirtildi"}</span>
        </div>
        <div className="clarification-resolved-content">
          <span className="clarification-resolved-q">{clarification.question}</span>
          <span className="clarification-resolved-ans">
            👉 {clarification.selectedAnswer}
          </span>
        </div>
      </div>
    );
  }

  const options = clarification.options || [];

  return (
    <div className="clarification-card">
      <div className="clarification-header">
        <div className="clarification-icon-badge">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h4>{t.clarification_title || "Açıklama / Tercih Gerekiyor"}</h4>
      </div>

      <div className="clarification-question">
        {clarification.question}
      </div>

      {/* Quick Selection Options */}
      {options.length > 0 && (
        <div className="clarification-options">
          {options.map((opt, idx) => {
            const label = typeof opt === "string" ? opt : (opt as ClarificationOption).label;
            const value = typeof opt === "string" ? opt : (opt as ClarificationOption).value;
            const desc = typeof opt === "object" ? (opt as ClarificationOption).description : undefined;

            return (
              <button
                key={idx}
                type="button"
                className="clarification-btn"
                onClick={() => handleSelect(value)}
                disabled={isSubmitting}
              >
                <span className="clarification-btn-label">{label}</span>
                {desc && <span className="clarification-btn-desc">{desc}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Free Text Input (if allowed) */}
      {clarification.allowFreeText !== false && (
        <form className="clarification-input-row" onSubmit={handleSubmitCustom}>
          <input
            type="text"
            className="clarification-text-input"
            value={customText}
            onInput={(e) => setCustomText((e.target as HTMLInputElement).value)}
            placeholder={t.clarification_input_placeholder || "veya özel bir yanıt yazın..."}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="clarification-send-btn"
            disabled={!customText.trim() || isSubmitting}
            title="Yanıtı Gönder"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      )}

      {/* Cancel option */}
      {onCancel && (
        <div className="clarification-footer">
          <button
            type="button"
            className="clarification-cancel-btn"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t.clarification_cancel_btn || "Görevi İptal Et"}
          </button>
        </div>
      )}
    </div>
  );
}

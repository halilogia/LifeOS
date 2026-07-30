/**
 * KpssExternalResultModal.tsx
 * Harici AI sınavı tamamlandıktan sonra kullanıcının kaç doğru yaptığını
 * gireceği sonuç ekranı.
 */

import { useState } from "preact/hooks";

interface KpssExternalResultModalProps {
  t: Record<string, string>;
  totalCount: number;
  onSave: (correct: number, total: number) => void;
  onBack: () => void;
}

export function KpssExternalResultModal({
  t,
  totalCount,
  onSave,
  onBack,
}: KpssExternalResultModalProps) {
  const [total, setTotal] = useState(totalCount);
  const [correct, setCorrect] = useState(0);

  const wrong = Math.max(0, total - correct);
  const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0;

  const scoreColor =
    scorePercent >= 80
      ? "#10b981"
      : scorePercent >= 40
        ? "#ffc107"
        : "#ef4444";

  const handleSave = () => {
    if (total > 0) {
      onSave(correct, total);
    }
  };

  const clampCorrect = (val: number) => {
    return Math.max(0, Math.min(val, total));
  };

  return (
    <div class="kpss-external-result">
      <h4 class="kpss-external-result__title">{t.kpss_external_quiz_enter_result}</h4>
      <p class="kpss-external-result__desc">{t.kpss_external_quiz_result_desc}</p>

      {/* Giriş alanları */}
      <div class="kpss-external-result__inputs">
        <div class="kpss-external-result__field">
          <label class="kpss-external-result__label">{t.kpss_external_quiz_total}</label>
          <input
            type="number"
            class="kpss-external-result__input"
            value={total}
            min={1}
            max={100}
            onInput={(e) => {
              const v = parseInt((e.target as HTMLInputElement).value, 10) || 1;
              setTotal(v);
              setCorrect((prev) => Math.min(prev, v));
            }}
          />
        </div>
        <div class="kpss-external-result__field">
          <label class="kpss-external-result__label">{t.kpss_external_quiz_correct}</label>
          <input
            type="number"
            class="kpss-external-result__input"
            value={correct}
            min={0}
            max={total}
            onInput={(e) => {
              const v = parseInt((e.target as HTMLInputElement).value, 10) || 0;
              setCorrect(clampCorrect(v));
            }}
          />
        </div>
      </div>

      {/* Canlı skor önizlemesi */}
      <div class="kpss-external-result__score-preview">
        <span class="kpss-external-result__score-number" style={{ color: scoreColor }}>
          %{scorePercent}
        </span>
        <div class="kpss-external-result__score-label">
          <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
            {correct} / {total}
          </div>
          <div>
            {t.kpss_external_quiz_wrong}: {wrong}
          </div>
        </div>
      </div>

      {/* Aksiyon butonları */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button class="kpss-qcount-btn" style={{ flex: 1 }} onClick={onBack}>
          {t.kpss_external_quiz_back}
        </button>
        <button
          class="settings-add-btn"
          style={{ flex: 2, padding: "0 16px" }}
          disabled={total === 0}
          onClick={handleSave}
        >
          {t.kpss_external_quiz_save}
        </button>
      </div>
    </div>
  );
}

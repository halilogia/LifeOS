/**
 * KpssExternalResultModal.tsx
 * Harici AI sınavı tamamlandıktan sonra kullanıcının kaç doğru yaptığını
 * gireceği premium sonuç giriş ekranı.
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
        ? "#f59e0b"
        : scorePercent > 0
          ? "#ef4444"
          : "var(--text-secondary)";

  const scoreLabel =
    scorePercent >= 80
      ? "Mükemmel"
      : scorePercent >= 60
        ? "İyi"
        : scorePercent >= 40
          ? "Geliştirilmeli"
          : scorePercent > 0
            ? "Tekrar Et"
            : "—";

  const handleSave = () => {
    if (total > 0) {
      onSave(correct, total);
    }
  };

  const clampCorrect = (val: number) => Math.max(0, Math.min(val, total));

  // Skor çarkı için stroke-dasharray hesabı
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (scorePercent / 100) * circumference;

  return (
    <div class="kpss-ext-result">
      {/* Başlık */}
      <div class="kpss-ext-result__header">
        <h4 class="kpss-ext-result__title">
          {t.kpss_external_quiz_enter_result}
        </h4>
        <p class="kpss-ext-result__desc">{t.kpss_external_quiz_result_desc}</p>
      </div>

      {/* Skor çemberi + Input alanları yan yana */}
      <div class="kpss-ext-result__main">
        {/* SVG Skor Çemberi */}
        <div class="kpss-ext-result__ring-wrap">
          <svg class="kpss-ext-result__ring" viewBox="0 0 100 100">
            {/* Arka iz */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              stroke-width="8"
            />
            {/* Aktif yay */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={scorePercent > 0 ? scoreColor : "rgba(255,255,255,0.06)"}
              stroke-width="8"
              stroke-linecap="round"
              stroke-dasharray={circumference}
              stroke-dashoffset={dashOffset}
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "50% 50%",
                transition:
                  "stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1), stroke 0.3s ease",
              }}
            />
            {/* Merkez metin */}
            <text
              x="50"
              y="44"
              text-anchor="middle"
              font-size="18"
              font-weight="800"
              fill={scorePercent > 0 ? scoreColor : "rgba(255,255,255,0.3)"}
              font-family="inherit"
            >
              {scorePercent > 0 ? `%${scorePercent}` : "—"}
            </text>
            <text
              x="50"
              y="60"
              text-anchor="middle"
              font-size="7.5"
              font-weight="600"
              fill="rgba(255,255,255,0.45)"
              font-family="inherit"
            >
              {scoreLabel}
            </text>
          </svg>
        </div>

        {/* Input alanları */}
        <div class="kpss-ext-result__fields">
          {/* Toplam Soru */}
          <div class="kpss-ext-result__field">
            <label class="kpss-ext-result__label">
              {t.kpss_external_quiz_total}
            </label>
            <div class="kpss-ext-result__input-wrap">
              <input
                type="number"
                class="kpss-ext-result__input"
                value={total}
                min={1}
                max={100}
                onInput={(e) => {
                  const v =
                    parseInt((e.target as HTMLInputElement).value, 10) || 1;
                  setTotal(v);
                  setCorrect((prev) => Math.min(prev, v));
                }}
              />
              <span class="kpss-ext-result__input-unit">
                {t.kpss_quiz_questions}
              </span>
            </div>
          </div>

          {/* Doğru Sayısı */}
          <div class="kpss-ext-result__field">
            <label class="kpss-ext-result__label" style={{ color: "#10b981" }}>
              {t.kpss_external_quiz_correct}
            </label>
            <div class="kpss-ext-result__input-wrap">
              <input
                type="number"
                class="kpss-ext-result__input kpss-ext-result__input--correct"
                value={correct}
                min={0}
                max={total}
                onInput={(e) => {
                  const v =
                    parseInt((e.target as HTMLInputElement).value, 10) || 0;
                  setCorrect(clampCorrect(v));
                }}
              />
              <span
                class="kpss-ext-result__input-unit"
                style={{ color: "#10b981" }}
              >
                ✓
              </span>
            </div>
          </div>

          {/* Yanlış — readonly gösterim */}
          <div class="kpss-ext-result__field">
            <label class="kpss-ext-result__label" style={{ color: "#ef4444" }}>
              {t.kpss_external_quiz_wrong}
            </label>
            <div class="kpss-ext-result__input-wrap">
              <div class="kpss-ext-result__input kpss-ext-result__input--wrong kpss-ext-result__readonly">
                {wrong}
              </div>
              <span
                class="kpss-ext-result__input-unit"
                style={{ color: "#ef4444" }}
              >
                ✗
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detay bar */}
      <div class="kpss-ext-result__bar-wrap">
        <div
          class="kpss-ext-result__bar-fill"
          style={{
            width: `${scorePercent}%`,
            background: `linear-gradient(90deg, ${scoreColor}bb, ${scoreColor})`,
          }}
        />
        <div
          class="kpss-ext-result__bar-fill kpss-ext-result__bar-fill--wrong"
          style={{
            width: `${total > 0 ? (wrong / total) * 100 : 0}%`,
            marginLeft: `${scorePercent}%`,
          }}
        />
      </div>

      {/* Aksiyon butonları */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button class="kpss-qcount-btn" style={{ flex: 1 }} onClick={onBack}>
          {t.kpss_external_quiz_back}
        </button>
        <button
          class="settings-add-btn"
          style={{ flex: 2, padding: "0 16px" }}
          disabled={total === 0 || correct === 0}
          onClick={handleSave}
        >
          {t.kpss_external_quiz_save}
        </button>
      </div>
    </div>
  );
}

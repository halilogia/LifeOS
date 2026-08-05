/**
 * NotesDayScorePanel.tsx
 * Günlüğüm üstünde "güne puan ver" — mood tracker tarzı.
 * 1-10 arası skor seçici (SVG noktaları) + son 7 gün renkli şerit.
 * Emoji yok — AGENTS 2.1: renk kodlu SVG + premium tipografi.
 */

import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import type { DayScores } from "@/types/types.js";

interface NotesDayScorePanelProps {
  lang: Language;
  dayScores: DayScores;
  onSetScore: (dateKey: string, score: number) => void;
}

const MAX_SCORE = 10;

/** score (1-10) → hex renk. Gradient: kötü (kırmızı) → orta (sarı) → iyi (yeşil). */
function scoreColor(score: number): string {
  const t = Math.max(0, Math.min(1, (score - 1) / (MAX_SCORE - 1)));
  const stops: [number, [number, number, number]][] = [
    [0, [239, 68, 68]], // red-500
    [0.5, [245, 158, 11]], // amber-500
    [1, [16, 185, 129]], // emerald-500
  ];
  let a = stops[0];
  let b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) {
      a = stops[i];
      b = stops[i + 1];
      break;
    }
  }
  const span = b[0] - a[0] || 1;
  const f = (t - a[0]) / span;
  const mix = (x: number, y: number) => Math.round(x + (y - x) * f);
  return `rgb(${mix(a[1][0], b[1][0])}, ${mix(a[1][1], b[1][1])}, ${mix(a[1][2], b[1][2])})`;
}

/** Yerel saat ile `YYYY-MM-DD` üretir (dateKey kuralı). */
function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function DotIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="5" fill={active ? "currentColor" : "none"} />
    </svg>
  );
}

export function NotesDayScorePanel({
  lang,
  dayScores,
  onSetScore,
}: NotesDayScorePanelProps) {
  const t = getTranslation(lang);
  const todayKey = dateKey(new Date());
  const todayScore = dayScores[todayKey] ?? 0;

  // Son 7 gün (bugün dahil) — mood şeridi
  const last7: { key: string; label: string; score: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    last7.push({
      key,
      label: d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
        weekday: "short",
      }),
      score: dayScores[key] ?? 0,
    });
  }

  return (
    <div className="day-score-panel">
      <div className="day-score-row">
        <span className="day-score-label">{t.notes_day_score_label}</span>
        <div className="day-score-picker" role="radiogroup">
          {Array.from({ length: MAX_SCORE }, (_, i) => i + 1).map((score) => {
            const active = score <= todayScore;
            return (
              <button
                key={score}
                type="button"
                role="radio"
                aria-checked={score === todayScore}
                title={`${score}/10`}
                onClick={() =>
                  onSetScore(todayKey, score === todayScore ? 0 : score)
                }
                style={{
                  color: active
                    ? scoreColor(score)
                    : "rgba(255, 255, 255, 0.14)",
                  transform: score === todayScore ? "scale(1.18)" : "scale(1)",
                  transition: "transform 0.2s ease, color 0.2s ease",
                }}
              >
                <DotIcon active={active} />
              </button>
            );
          })}
          <span className="day-score-value">
            {todayScore ? `${todayScore}/10` : ""}
          </span>
        </div>
      </div>

      <div className="day-score-strip" title={t.notes_day_score_strip_title}>
        {last7.map((d) => (
          <div key={d.key} className="day-score-cell">
            <button
              type="button"
              className="day-score-dot"
              onClick={() => onSetScore(d.key, d.score ? 0 : 7)}
              title={`${d.label}${d.score ? ` · ${d.score}/10` : ""}`}
              style={{
                background: d.score
                  ? scoreColor(d.score)
                  : "rgba(255, 255, 255, 0.08)",
                border:
                  d.key === todayKey ? "1px solid var(--accent-color)" : "none",
              }}
            />
            <span className="day-score-day">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

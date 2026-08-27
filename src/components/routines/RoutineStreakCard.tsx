/**
 * RoutineStreakCard.tsx
 * Duolingo-style flame streak counter and GitHub-style routine heatmap card.
 */

import { useState } from "preact/hooks";
import { Todo, Language } from "@/types/types.js";
import { calculateRoutineStreak } from "@/domain/services/routineStreakCalculator.js";
import { FlameIcon } from "./FlameIcon.js";
import { RoutineHeatmap } from "./RoutineHeatmap.js";

interface RoutineStreakCardProps {
  todos: Todo[];
  lang: Language;
  t: Record<string, string>;
}

export function RoutineStreakCard({ todos, lang, t }: RoutineStreakCardProps) {
  const [showHeatmap, setShowHeatmap] = useState(true);

  const stats = calculateRoutineStreak(todos, 12);
  const {
    currentStreak,
    bestStreak,
    todayCompletedCount,
    todayTotalRoutines,
    isTodayCompleted,
    isIgnited,
    isSupercharged,
    weeks,
  } = stats;

  const progressPercent =
    todayTotalRoutines > 0
      ? Math.min(100, Math.round((todayCompletedCount / todayTotalRoutines) * 100))
      : 0;

  const streakTitle =
    currentStreak > 0
      ? `${currentStreak} ${t.routine_streak_days || "Günlük Seri!"}`
      : t.routine_streak_start || "Seriyi Başlat!";

  const streakSubtitle = isTodayCompleted
    ? t.routine_streak_completed_today || "Bugün tüm rutinlerini tamamladın! Alev parlıyor."
    : currentStreak > 0
      ? t.routine_streak_keep_going || "Bugünkü rutinlerini tamamla ve serini canlı tut!"
      : t.routine_streak_zero_hint || "İlk rutinini tamamlayarak alevi yak!";

  return (
    <div className={`routine-streak-card ${isIgnited ? "ignited" : "idle"} ${isSupercharged ? "supercharged" : ""}`}>
      {/* Top Banner Row: Flame + Streak Counter + Today's Progress */}
      <div className="routine-streak-header">
        <div className="streak-left-block">
          <FlameIcon
            isIgnited={isIgnited}
            isSupercharged={isSupercharged}
            streakCount={currentStreak}
            size={42}
          />
          <div className="streak-text-group">
            <div className="streak-title-row">
              <h3 className="streak-count-title">{streakTitle}</h3>
              {bestStreak > 0 && (
                <span className="best-streak-pill" title={`${t.willpower_best_streak || "En Uzun Seri"}: ${bestStreak} ${t.willpower_days || "gün"}`}>
                  🏆 {bestStreak} {t.willpower_days || "gün"}
                </span>
              )}
            </div>
            <p className="streak-sub-text">{streakSubtitle}</p>
          </div>
        </div>

        <div className="streak-right-block">
          <div className="today-progress-wrap">
            <div className="today-progress-header">
              <span className="today-progress-label">
                {t.routine_today_label || "Bugün"}:
              </span>
              <span className="today-progress-fraction">
                {todayCompletedCount}/{todayTotalRoutines}
              </span>
            </div>
            <div className="today-progress-bar-bg">
              <div
                className={`today-progress-bar-fill ${progressPercent === 100 ? "full" : ""}`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <button
            type="button"
            className="heatmap-toggle-btn"
            onClick={() => setShowHeatmap(!showHeatmap)}
            title={showHeatmap ? t.routine_hide_heatmap || "Isı Haritasını Gizle" : t.routine_show_heatmap || "Isı Haritasını Göster"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: showHeatmap ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.25s ease",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Collapsible Heatmap Grid */}
      {showHeatmap && (
        <div className="routine-heatmap-drawer">
          <RoutineHeatmap weeks={weeks} lang={lang} t={t} />
        </div>
      )}
    </div>
  );
}

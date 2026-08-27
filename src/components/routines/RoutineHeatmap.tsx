/**
 * RoutineHeatmap.tsx
 * GitHub & Duolingo style interactive contribution heatmap grid for routines.
 */

import { useState } from "preact/hooks";
import { HeatmapDay } from "@/domain/services/routineStreakCalculator.js";
import { Language } from "@/types/types.js";

interface RoutineHeatmapProps {
  weeks: HeatmapDay[][];
  lang: Language;
  t: Record<string, string>;
}

export function RoutineHeatmap({ weeks, lang, t }: RoutineHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  const dayLabels = [
    { dow: 1, label: t.day_mon?.slice(0, 3) || "Pzt" },
    { dow: 3, label: t.day_wed?.slice(0, 3) || "Çar" },
    { dow: 5, label: t.day_fri?.slice(0, 3) || "Cum" },
    { dow: 7, label: t.day_sun?.slice(0, 3) || "Paz" },
  ];

  const formatDateTooltip = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="routine-heatmap-wrapper">
      <div className="routine-heatmap-container">
        {/* Day of Week row headers */}
        <div className="heatmap-day-labels">
          <span className="dow-label">{t.day_mon?.slice(0, 2) || "Pt"}</span>
          <span className="dow-label"></span>
          <span className="dow-label">{t.day_wed?.slice(0, 2) || "Ça"}</span>
          <span className="dow-label"></span>
          <span className="dow-label">{t.day_fri?.slice(0, 2) || "Cu"}</span>
          <span className="dow-label"></span>
          <span className="dow-label">{t.day_sun?.slice(0, 2) || "Pz"}</span>
        </div>

        {/* 12-week Columns Grid */}
        <div className="heatmap-weeks-grid">
          {weeks.map((week, wIdx) => (
            <div key={`w-${wIdx}`} className="heatmap-week-column">
              {week.map((day) => (
                <div
                  key={day.dateStr}
                  className={`heatmap-cell level-${day.level} ${hoveredDay?.dateStr === day.dateStr ? "hovered" : ""}`}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  title={`${day.dateStr}: ${day.count} ${t.routine_completed_count || "rutin tamamlandı"}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info & Legend */}
      <div className="heatmap-footer">
        <div className="heatmap-tooltip-display">
          {hoveredDay ? (
            <span>
              <strong>{formatDateTooltip(hoveredDay.dateStr)}</strong>:{" "}
              {hoveredDay.count > 0
                ? `${hoveredDay.count} ${t.routine_completed_count || "rutin tamamlandı"}`
                : t.routine_none_completed || "Tamamlanan rutin yok"}
            </span>
          ) : (
            <span className="heatmap-hint-text">
              {t.routine_heatmap_hint || "Son 12 haftalık alışkanlık zinciriniz"}
            </span>
          )}
        </div>

        <div className="heatmap-legend">
          <span className="legend-label">{t.routine_less || "Az"}</span>
          <span className="heatmap-cell level-0 mini"></span>
          <span className="heatmap-cell level-1 mini"></span>
          <span className="heatmap-cell level-2 mini"></span>
          <span className="heatmap-cell level-3 mini"></span>
          <span className="heatmap-cell level-4 mini"></span>
          <span className="legend-label">{t.routine_more || "Çok"}</span>
        </div>
      </div>
    </div>
  );
}

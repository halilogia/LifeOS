import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";

interface PomoTimerCardProps {
  lang: Language;
  pomoMode: "focus" | "short" | "long";
  pomoTimeLeft: number;
  pomoRunning: boolean;
  customTimes: { focus: number; short: number; long: number };
  progressOffset: number;
  CIRCLE_CIRCUMFERENCE: number;
  MODE_LABELS: Record<string, string>;
  formatTime: (timeInSecs: number) => string;
  onPomoReset: () => void;
  onPomoStart: () => void;
  onPomoPause: () => void;
  onPomoModeChange: (mode: "focus" | "short" | "long") => void;
  onCustomTimeChange: (mode: "focus" | "short" | "long", mins: number) => void;
}

export function PomoTimerCard({
  lang,
  pomoMode,
  pomoTimeLeft,
  pomoRunning,
  customTimes,
  progressOffset,
  CIRCLE_CIRCUMFERENCE,
  MODE_LABELS,
  formatTime,
  onPomoReset,
  onPomoStart,
  onPomoPause,
  onPomoModeChange,
  onCustomTimeChange,
}: PomoTimerCardProps) {
  const t = getTranslation(lang);

  return (
    <div className="pomodoro-main-card">
      <div className="pomodoro-visual-container">
        <svg className="progress-ring-main" width="240" height="240">
          <circle
            className="progress-ring__circle-bg"
            stroke="rgba(255,255,255,0.05)"
            stroke-width="8"
            fill="transparent"
            r="110"
            cx="120"
            cy="120"
          />
          <circle
            id="pomodoro-progress"
            className="progress-ring__circle"
            stroke="var(--accent-color)"
            stroke-width="8"
            stroke-linecap="round"
            fill="transparent"
            r="110"
            cx="120"
            cy="120"
            style={{
              strokeDasharray: CIRCLE_CIRCUMFERENCE,
              strokeDashoffset: progressOffset,
              transition: "stroke-dashoffset 0.3s",
            }}
          />
        </svg>
        <div className="pomodoro-timer-inner">
          <div id="pomodoro-time">{formatTime(pomoTimeLeft)}</div>
          <div id="pomodoro-label">{MODE_LABELS[pomoMode]}</div>
        </div>
      </div>

      <div className="pomodoro-controls">
        <button
          id="pomodoro-reset"
          className="pomodoro-action-btn secondary"
          title="Reset"
          onClick={onPomoReset}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <polyline points="3 3 3 8 8 8"></polyline>
          </svg>
        </button>

        {!pomoRunning ? (
          <button
            id="pomodoro-start"
            className="pomodoro-action-btn primary play-btn"
            onClick={onPomoStart}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        ) : (
          <button
            id="pomodoro-pause"
            className="pomodoro-action-btn primary pause-btn"
            onClick={onPomoPause}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </button>
        )}

        <div style={{ width: "20px" }}></div>
      </div>

      <div className="pomodoro-modes" id="pomodoro-modes-container">
        <button
          className={`pomodoro-mode-btn ${pomoMode === "focus" ? "active" : ""}`}
          onClick={() => onPomoModeChange("focus")}
        >
          {t.pomodoro_focus}
        </button>
        <button
          className={`pomodoro-mode-btn ${pomoMode === "short" ? "active" : ""}`}
          onClick={() => onPomoModeChange("short")}
        >
          {t.pomodoro_short}
        </button>
        <button
          className={`pomodoro-mode-btn ${pomoMode === "long" ? "active" : ""}`}
          onClick={() => onPomoModeChange("long")}
        >
          {t.pomodoro_long}
        </button>
      </div>

      {/* Pomodoro Duration Editor */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "16px",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid var(--card-border)",
          borderRadius: "12px",
          padding: "10px 14px",
          alignItems: "center",
          width: "100%",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            style={{ color: "var(--accent-color)" }}
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {t.pomodoro_duration_label}
        </span>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            marginLeft: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.6rem",
                color: "var(--text-secondary)",
                fontWeight: "600",
              }}
            >
              {t.pomodoro_focus_btn}
            </span>
            <input
              type="number"
              min="1"
              max="120"
              value={Math.round(customTimes.focus / 60)}
              onChange={(e) =>
                onCustomTimeChange(
                  "focus",
                  parseInt((e.target as HTMLInputElement).value, 10),
                )
              }
              style={{
                width: "45px",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid var(--card-border)",
                borderRadius: "6px",
                color: "white",
                fontSize: "0.75rem",
                padding: "2px 4px",
                textAlign: "center",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.6rem",
                color: "var(--text-secondary)",
                fontWeight: "600",
              }}
            >
              {t.pomodoro_short_btn}
            </span>
            <input
              type="number"
              min="1"
              max="60"
              value={Math.round(customTimes.short / 60)}
              onChange={(e) =>
                onCustomTimeChange(
                  "short",
                  parseInt((e.target as HTMLInputElement).value, 10),
                )
              }
              style={{
                width: "45px",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid var(--card-border)",
                borderRadius: "6px",
                color: "white",
                fontSize: "0.75rem",
                padding: "2px 4px",
                textAlign: "center",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.6rem",
                color: "var(--text-secondary)",
                fontWeight: "600",
              }}
            >
              {t.pomodoro_long_btn}
            </span>
            <input
              type="number"
              min="1"
              max="60"
              value={Math.round(customTimes.long / 60)}
              onChange={(e) =>
                onCustomTimeChange(
                  "long",
                  parseInt((e.target as HTMLInputElement).value, 10),
                )
              }
              style={{
                width: "45px",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid var(--card-border)",
                borderRadius: "6px",
                color: "white",
                fontSize: "0.75rem",
                padding: "2px 4px",
                textAlign: "center",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { PomodoroRing } from "./PomodoroRing.js";
import { PomodoroControls } from "./PomodoroControls.js";
import { PomodoroDurationEditor } from "./PomodoroDurationEditor.js";

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
      <PomodoroRing
        progressOffset={progressOffset}
        CIRCLE_CIRCUMFERENCE={CIRCLE_CIRCUMFERENCE}
        timeLabel={formatTime(pomoTimeLeft)}
        modeLabel={MODE_LABELS[pomoMode]}
      />

      <PomodoroControls
        pomoRunning={pomoRunning}
        onPomoReset={onPomoReset}
        onPomoStart={onPomoStart}
        onPomoPause={onPomoPause}
      />

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
      <PomodoroDurationEditor
        t={t}
        customTimes={customTimes}
        onCustomTimeChange={onCustomTimeChange}
      />
    </div>
  );
}

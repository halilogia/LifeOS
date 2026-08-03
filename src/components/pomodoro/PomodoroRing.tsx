interface PomodoroRingProps {
  progressOffset: number;
  CIRCLE_CIRCUMFERENCE: number;
  timeLabel: string;
  modeLabel: string;
}

export function PomodoroRing({
  progressOffset,
  CIRCLE_CIRCUMFERENCE,
  timeLabel,
  modeLabel,
}: PomodoroRingProps) {
  return (
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
        <div id="pomodoro-time">{timeLabel}</div>
        <div id="pomodoro-label">{modeLabel}</div>
      </div>
    </div>
  );
}

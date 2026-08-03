interface PomodoroControlsProps {
  pomoRunning: boolean;
  onPomoReset: () => void;
  onPomoStart: () => void;
  onPomoPause: () => void;
}

export function PomodoroControls({
  pomoRunning,
  onPomoReset,
  onPomoStart,
  onPomoPause,
}: PomodoroControlsProps) {
  return (
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
  );
}

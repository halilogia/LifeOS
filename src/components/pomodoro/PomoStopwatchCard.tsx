/**
 * PomoStopwatchCard.tsx
 * Pomodoro yan panel kronometre mini kartı.
 */

interface PomoStopwatchCardProps {
  title: string;
  swTime: number;
  swRunning: boolean;
  onSwStart: () => void;
  onSwPause: () => void;
  onSwReset: () => void;
}

function formatTime(timeInSecs: number): string {
  const mins = Math.floor(timeInSecs / 60);
  const secs = timeInSecs % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function PomoStopwatchCard({
  title,
  swTime,
  swRunning,
  onSwStart,
  onSwPause,
  onSwReset,
}: PomoStopwatchCardProps) {
  return (
    <div className="mini-tool-card" id="stopwatch-mini">
      <div className="mini-tool-header">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{title}</span>
      </div>
      <div className="mini-tool-content">
        <div id="stopwatch-time" className="mini-time">
          {formatTime(swTime)}
        </div>
        <div className="mini-controls">
          {!swRunning ? (
            <button
              id="sw-start-btn"
              className="mini-btn primary"
              onClick={onSwStart}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          ) : (
            <button
              id="sw-pause-btn"
              className="mini-btn primary"
              onClick={onSwPause}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            </button>
          )}
          <button
            id="sw-reset-btn"
            className="mini-btn secondary"
            onClick={onSwReset}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <polyline points="3 3 3 8 8 8"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

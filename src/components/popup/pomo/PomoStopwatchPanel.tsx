interface PomoStopwatchPanelProps {
  t: Record<string, string>;
  swRunning: boolean;
  swTime: number;
  onPlayPause: () => void;
  onReset: () => void;
}

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export function PomoStopwatchPanel({
  t,
  swRunning,
  swTime,
  onPlayPause,
  onReset,
}: PomoStopwatchPanelProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--card-border)",
        borderRadius: "16px",
        padding: "10px 14px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontSize: "0.65rem",
            color: "var(--text-secondary)",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {t.pomo_stopwatch}
        </span>
        <span
          style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            marginTop: "2px",
          }}
        >
          {formatTime(swTime)}
        </span>
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          onClick={onPlayPause}
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "var(--accent-color)",
            border: "none",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {swRunning ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="4" height="16" rx="1" />
              <rect x="16" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button
          onClick={onReset}
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--card-border)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <polyline points="3 3 3 8 8 8" />
          </svg>
        </button>
      </div>
    </div>
  );
}

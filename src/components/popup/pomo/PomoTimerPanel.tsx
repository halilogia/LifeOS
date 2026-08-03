import type { PomoState } from "@/infrastructure/services/PomodoroManagerService.js";

interface PomoTimerPanelProps {
  t: Record<string, string>;
  pomoState: PomoState;
  onTabChange: (mode: "focus" | "short" | "long") => void;
  onPlayPause: () => void;
  onReset: () => void;
}

const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 53; // compact radius r=53

export function PomoTimerPanel({
  t,
  pomoState,
  onTabChange,
  onPlayPause,
  onReset,
}: PomoTimerPanelProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const percent = pomoState.timeLeft / pomoState.totalTime;
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - percent);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--card-border)",
        borderRadius: "16px",
        padding: "12px 8px",
      }}
    >
      {/* Pomo modes selector */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          width: "100%",
          padding: "0 4px",
        }}
      >
        {(["focus", "short", "long"] as const).map((m) => (
          <button
            key={m}
            onClick={() => onTabChange(m)}
            style={{
              flex: 1,
              background:
                pomoState.mode === m ? "var(--accent-color)" : "transparent",
              border: "none",
              color:
                pomoState.mode === m ? "white" : "var(--text-secondary)",
              borderRadius: "6px",
              fontSize: "0.65rem",
              padding: "4px 0",
              fontWeight: "700",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {m === "focus" ? t.focus : m === "short" ? t.short : t.long}
          </button>
        ))}
      </div>

      {/* Timer visual circle progress overlay */}
      <div
        style={{
          position: "relative",
          width: "120px",
          height: "120px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          style={{
            transform: "rotate(-90deg)",
            width: "100%",
            height: "100%",
          }}
          viewBox="0 0 120 120"
        >
          <circle
            cx="60"
            cy="60"
            r="53"
            fill="none"
            stroke="rgba(255,255,255,0.01)"
            stroke-width="6"
          />
          <circle
            cx="60"
            cy="60"
            r="53"
            fill="none"
            stroke="var(--accent-color)"
            stroke-width="6"
            stroke-linecap="round"
            stroke-dasharray={CIRCLE_CIRCUMFERENCE}
            stroke-dashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "1.6rem", fontWeight: "700" }}>
            {formatTime(pomoState.timeLeft)}
          </span>
          <span
            style={{
              fontSize: "0.55rem",
              letterSpacing: "1px",
              opacity: 0.7,
              textTransform: "uppercase",
            }}
          >
            {pomoState.mode === "focus"
              ? t.focus
              : pomoState.mode === "short"
                ? t.short
                : t.long}
          </span>
        </div>
      </div>

      {/* Controls play pause reset */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={onPlayPause}
          style={{
            width: "36px",
            height: "36px",
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
          {pomoState.running ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="4" y="4" width="4" height="16" rx="1" />
              <rect x="16" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button
          onClick={onReset}
          style={{
            width: "36px",
            height: "36px",
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
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

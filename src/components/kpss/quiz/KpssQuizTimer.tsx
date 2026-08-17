/**
 * KpssQuizTimer.tsx
 * KPSS Quiz süre sayacı — geri sayım halkası (SVG) ve kalan süre göstergesi.
 * Emoji kullanmaz; tema değişkenleriyle uyumlu glassmorphic tasarım.
 */

interface KpssQuizTimerProps {
  t: Record<string, string>;
  remainingSec: number;
  totalSec: number;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function KpssQuizTimer({
  t,
  remainingSec,
  totalSec,
}: KpssQuizTimerProps) {
  const safeTotal = totalSec > 0 ? totalSec : 1;
  const ratio = Math.max(0, Math.min(1, remainingSec / safeTotal));
  const isLow = remainingSec <= 60;

  const size = 56;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);

  const accent = isLow ? "#f87171" : "var(--accent-color)";
  const track = "rgba(255, 255, 255, 0.08)";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "10px 16px",
        borderRadius: "14px",
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid var(--card-border)",
        backdropFilter: "blur(8px)",
        transition: "border-color 0.3s ease",
        borderColor: isLow ? "rgba(248, 113, 113, 0.45)" : "var(--card-border)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          flexShrink: 0,
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={track}
            stroke-width={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={accent}
            stroke-width={stroke}
            stroke-linecap="round"
            stroke-dasharray={circumference}
            stroke-dashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 0.95s linear, stroke 0.3s ease",
            }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accent}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15.5 14" />
          </svg>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontSize: "0.62rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.55,
            fontWeight: 600,
          }}
        >
          {t.kpss_quiz_time_left}
        </span>
        <span
          style={{
            fontSize: "1.15rem",
            fontWeight: 800,
            fontVariantNumeric: "tabular-nums",
            color: accent,
            lineHeight: 1.1,
          }}
        >
          {formatTime(remainingSec)}
        </span>
      </div>
    </div>
  );
}

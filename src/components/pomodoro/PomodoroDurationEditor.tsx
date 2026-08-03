type PomoMode = "focus" | "short" | "long";

interface PomodoroDurationEditorProps {
  t: Record<string, string>;
  customTimes: { focus: number; short: number; long: number };
  onCustomTimeChange: (mode: PomoMode, mins: number) => void;
}

const DURATION_FIELDS: {
  mode: PomoMode;
  labelKey: string;
  min: number;
  max: number;
}[] = [
  { mode: "focus", labelKey: "pomodoro_focus_btn", min: 1, max: 120 },
  { mode: "short", labelKey: "pomodoro_short_btn", min: 1, max: 60 },
  { mode: "long", labelKey: "pomodoro_long_btn", min: 1, max: 60 },
];

export function PomodoroDurationEditor({
  t,
  customTimes,
  onCustomTimeChange,
}: PomodoroDurationEditorProps) {
  return (
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
        {DURATION_FIELDS.map((field) => (
          <div
            key={field.mode}
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
              {t[field.labelKey]}
            </span>
            <input
              type="number"
              min={field.min}
              max={field.max}
              value={Math.round(customTimes[field.mode] / 60)}
              onChange={(e) =>
                onCustomTimeChange(
                  field.mode,
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
        ))}
      </div>
    </div>
  );
}

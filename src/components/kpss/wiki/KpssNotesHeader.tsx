/**
 * KpssNotesHeader.tsx
 * Presentational Header for KPSS Not Stüdyosu.
 * Gradient title.
 */

interface KpssNotesHeaderProps {
  t: Record<string, string>;
}

export function KpssNotesHeader({ t }: KpssNotesHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "0 4px",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: "1.05rem",
          fontWeight: 800,
          color: "#e2e8f0",
          background: "linear-gradient(90deg, #c084fc, #60a5fa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {t.kpss_notes_title || "Ders Notları Stüdyosu"}
      </h2>
    </div>
  );
}

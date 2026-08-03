/**
 * KpssNotesHeader.tsx
 * Presentational Header for KPSS Not Stüdyosu.
 * MindVault icon + gradient title + optional sync status message.
 */

interface KpssNotesHeaderProps {
  t: Record<string, string>;
  syncMsg: string;
}

export function KpssNotesHeader({ t, syncMsg }: KpssNotesHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "0 4px",
      }}
    >
      <img
        src="icons/mindvault.png"
        alt="MindVault"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "9px",
          background: "#ffffff",
          objectFit: "contain",
          padding: "4px",
          boxSizing: "border-box",
          boxShadow: "0 2px 10px rgba(124, 58, 237, 0.45)",
        }}
      />
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
        {t.kpss_notes_title || "KPSS Ders Notları Stüdyosu"}
      </h2>
      {syncMsg && (
        <span
          style={{
            fontSize: "0.72rem",
            color: "#34d399",
            fontWeight: 600,
            marginLeft: "auto",
          }}
        >
          {syncMsg}
        </span>
      )}
    </div>
  );
}

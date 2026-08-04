interface MapControlsProps {
  t: Record<string, string>;
  title: string;
  subtitle?: string;
  total: number;
  revealedCount: number;
  playing: boolean;
  isFullscreen: boolean;
  onStep: (dir: 1 | -1) => void;
  onReset: () => void;
  onPlayToggle: () => void;
  onToggleFullscreen: () => void;
}

export function MapControls({
  t,
  title,
  subtitle,
  total,
  revealedCount,
  playing,
  isFullscreen,
  onStep,
  onReset,
  onPlayToggle,
  onToggleFullscreen,
}: MapControlsProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "10px",
        background: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "14px",
        padding: "14px 18px",
      }}
    >
      <div>
        <h3
          style={{
            margin: 0,
            color: "#f8fafc",
            fontSize: "1.05rem",
            fontWeight: 800,
          }}
        >
          {title}
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#94a3b8" }}>
          {subtitle ||
            `${total} ${t.kpss_map_subtitle || "konum — sırasıyla oynat"}`}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            fontSize: "0.78rem",
            color: "#94a3b8",
            background: "rgba(255,255,255,0.06)",
            padding: "6px 12px",
            borderRadius: "20px",
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {revealedCount} / {total}
        </span>

        {/* İleri/Geri Sarma */}
        <button
          type="button"
          onClick={() => onStep(-1)}
          disabled={revealedCount <= 0}
          title={t.kpss_map_prev || "Geri"}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            color: revealedCount <= 0 ? "#475569" : "#94a3b8",
            borderRadius: "8px",
            padding: "7px 12px",
            fontSize: "0.9rem",
            fontWeight: 700,
            cursor: revealedCount <= 0 ? "not-allowed" : "pointer",
            opacity: revealedCount <= 0 ? 0.5 : 1,
          }}
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => onStep(1)}
          disabled={revealedCount >= total}
          title={t.kpss_map_next || "İleri"}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            color: revealedCount >= total ? "#475569" : "#94a3b8",
            borderRadius: "8px",
            padding: "7px 12px",
            fontSize: "0.9rem",
            fontWeight: 700,
            cursor: revealedCount >= total ? "not-allowed" : "pointer",
            opacity: revealedCount >= total ? 0.5 : 1,
          }}
        >
          ›
        </button>

        <button
          type="button"
          onClick={onReset}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#94a3b8",
            borderRadius: "8px",
            padding: "7px 14px",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {t.kpss_map_reset || "Sıfırla"}
        </button>
        <button
          type="button"
          onClick={onPlayToggle}
          style={{
            background: playing
              ? "rgba(220, 38, 38, 0.85)"
              : "linear-gradient(135deg, #c8511f, #e6773f)",
            border: "none",
            color: "#fff8ef",
            borderRadius: "8px",
            padding: "7px 16px",
            fontSize: "0.78rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s ease",
          }}
        >
          {playing ? "⏸" : "▶"}{" "}
          {playing ? t.kpss_map_stop || "Durdur" : t.kpss_map_play || "Oynat"}
        </button>
        <button
          type="button"
          onClick={onToggleFullscreen}
          title={
            isFullscreen
              ? t.kpss_map_exit_fullscreen || "Tam Ekrandan Çık"
              : t.kpss_map_fullscreen || "Tam Ekran"
          }
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#94a3b8",
            borderRadius: "8px",
            padding: "7px 12px",
            fontSize: "0.9rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {isFullscreen ? "⤢" : "⤢"}
        </button>
      </div>
    </div>
  );
}

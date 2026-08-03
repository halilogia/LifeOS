interface KpssResetSectionProps {
  t: Record<string, string>;
  onReset: () => void;
}

export function KpssResetSection({ t, onReset }: KpssResetSectionProps) {
  return (
    <div className="settings-group">
      <h3>{t.settings_kpss_data_reset}</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background: "rgba(255,255,255,0.01)",
          border: "1px solid var(--card-border)",
          borderRadius: "10px",
          padding: "14px",
        }}
      >
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {t.settings_kpss_data_reset_desc}
        </p>
        <button
          type="button"
          onClick={onReset}
          style={{
            alignSelf: "flex-start",
            padding: "10px 16px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            color: "#ef4444",
            fontWeight: "600",
            fontSize: "0.82rem",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(239, 68, 68, 0.25)";
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(239, 68, 68, 0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(239, 68, 68, 0.12)";
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(239, 68, 68, 0.3)";
          }}
        >
          {t.settings_kpss_reset_button}
        </button>
      </div>
    </div>
  );
}

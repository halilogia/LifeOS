interface AppShortcutRowProps {
  t: Record<string, string>;
}

export function AppShortcutRow({ t }: AppShortcutRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid var(--card-border)",
        borderRadius: "10px",
        marginTop: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent-color)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "white",
            }}
          >
            {t.settings_shortcut_title}
          </span>
          <span
            style={{
              fontSize: "0.72rem",
              color: "var(--text-secondary)",
            }}
          >
            {t.settings_shortcut_default}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
        }}
        style={{
          background: "rgba(139, 92, 246, 0.15)",
          border: "1px solid var(--accent-color)",
          color: "white",
          borderRadius: "6px",
          padding: "6px 12px",
          fontSize: "0.75rem",
          fontWeight: "600",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        {t.settings_shortcut_configure}
      </button>
    </div>
  );
}

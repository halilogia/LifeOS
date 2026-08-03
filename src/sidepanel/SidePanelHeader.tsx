interface SidePanelHeaderProps {
  t: Record<string, string>;
  onNewChat: () => void;
}

export function SidePanelHeader({ t, onNewChat }: SidePanelHeaderProps) {
  return (
    <header className="sidepanel-header">
      <div className="sidepanel-header-title">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
        </svg>
        <span>Life OS Web Copilot</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          type="button"
          onClick={onNewChat}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 9px",
            fontSize: "0.74rem",
            fontWeight: 600,
            borderRadius: "6px",
            color: "#a78bfa",
            background: "rgba(139, 92, 246, 0.15)",
            border: "1px solid rgba(139, 92, 246, 0.35)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          title={t.new_chat_tooltip}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>{t.new_chat_label}</span>
        </button>
        <span className="sidepanel-header-badge">AI Agent</span>
      </div>
    </header>
  );
}

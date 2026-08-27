interface SidePanelHeaderProps {
  t: Record<string, string>;
  onNewChat: () => void;
  onOpenHistory?: () => void;
  onExport?: () => void;
}

export function SidePanelHeader({
  t,
  onNewChat,
  onOpenHistory,
  onExport,
}: SidePanelHeaderProps) {
  return (
    <header className="sidepanel-header">
      <div className="sidepanel-header-title">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
        </svg>
        <span>Life OS Web Copilot</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {/* History Drawer Trigger */}
        {onOpenHistory && (
          <button
            type="button"
            className="sidepanel-header-icon-btn"
            onClick={onOpenHistory}
            title={t.chat_history_title || "Sohbet Geçmişi"}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
        )}

        {/* Export Trigger */}
        {onExport && (
          <button
            type="button"
            className="sidepanel-header-icon-btn"
            onClick={onExport}
            title={t.chat_export_tooltip || "Markdown Olarak İndir"}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        )}

        {/* New Chat Button */}
        <button
          type="button"
          onClick={onNewChat}
          className="sidepanel-header-new-btn"
          title={t.new_chat_tooltip || "Yeni Sohbet Başlat"}
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
          <span>{t.new_chat_label || "Yeni"}</span>
        </button>
      </div>
    </header>
  );
}

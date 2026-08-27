/**
 * AiChatHeaderBar.tsx
 * AI Asistan başlığı, çevrimdışı komut modu rozeti, yeni sohbet, geçmiş, dışa aktar ve ayarlar butonları.
 */

interface AiChatHeaderBarProps {
  title: string;
  aiApiKey?: string;
  noKeyWarning: string;
  settingsTitle: string;
  offlineModeLabel: string;
  onSettingsOpen: () => void;
  onNewChat?: () => void;
  onOpenHistory?: () => void;
  onExport?: () => void;
}

function IconSettings() {
  return (
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function AiChatHeaderBar({
  title,
  aiApiKey,
  noKeyWarning,
  settingsTitle,
  offlineModeLabel,
  onSettingsOpen,
  onNewChat,
  onOpenHistory,
  onExport,
}: AiChatHeaderBarProps) {
  return (
    <header className="ai-chat-header">
      <div className="header-title-section">
        <h2>{title}</h2>
        {!aiApiKey && (
          <span className="local-mode-badge" title={noKeyWarning}>
            {offlineModeLabel}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* History Button */}
        {onOpenHistory && (
          <button
            type="button"
            className="aichat-header-action-btn"
            onClick={onOpenHistory}
            title="Sohbet Geçmişi"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
        )}

        {/* Export Button */}
        {onExport && (
          <button
            type="button"
            className="aichat-header-action-btn"
            onClick={onExport}
            title="Sohbeti Markdown Olarak İndir"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        )}

        {/* New Chat Button */}
        {onNewChat && (
          <button
            type="button"
            className="aichat-header-new-btn"
            onClick={onNewChat}
            title="Yeni Sohbet Başlat"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Yeni Sohbet</span>
          </button>
        )}

        {/* Settings button */}
        <button
          type="button"
          className={`key-panel-toggle-btn ${aiApiKey ? "configured" : ""}`}
          onClick={onSettingsOpen}
          title={settingsTitle}
        >
          <IconSettings />
        </button>
      </div>
    </header>
  );
}

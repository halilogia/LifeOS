/**
 * AiChatHeaderBar.tsx
 * AI Asistan başlığı, çevrimdışı komut modu rozeti, LifeOS: AI Companion butonu ve ayarlar butonu.
 */

interface AiChatHeaderBarProps {
  title: string;
  aiApiKey?: string;
  lang: string;
  noKeyWarning: string;
  keySavedText: string;
  keyTitleText: string;
  settingsTitle: string;
  onSettingsOpen: () => void;
  onOpenCompanionModal?: () => void;
}

function IconSettings() {
  return (
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function AiChatHeaderBar({
  title,
  aiApiKey,
  lang,
  noKeyWarning,
  keySavedText: _keySavedText,
  keyTitleText: _keyTitleText,
  settingsTitle,
  onSettingsOpen,
  onOpenCompanionModal,
}: AiChatHeaderBarProps) {
  return (
    <header className="ai-chat-header">
      <div className="header-title-section">
        <h2>{title}</h2>
        {!aiApiKey && (
          <span className="local-mode-badge" title={noKeyWarning}>
            {lang === "tr" ? "Çevrimdışı/Komut Modu" : "Offline Command Mode"}
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {onOpenCompanionModal && (
          <button
            className="key-panel-toggle-btn configured"
            onClick={onOpenCompanionModal}
            title="LifeOS: AI Companion (YouTube & Web Özetleyici)"
            style={{
              padding: "6px 12px",
              fontSize: "0.82rem",
              fontWeight: 600,
              background: "rgba(124, 58, 237, 0.2)",
              border: "1px solid var(--accent-color)",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
            }}
          >
            <span>🤖</span>
            <span>AI Companion</span>
          </button>
        )}

        <button
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

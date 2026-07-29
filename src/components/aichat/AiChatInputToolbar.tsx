/**
 * AiChatInputToolbar.tsx
 * Google AI Modu Canlı Arama çipi, hızlı komut çipleri ve mesaj yazma/gönderme çubuğu.
 */

interface AiChatInputToolbarProps {
  inputVal: string;
  placeholder: string;
  sendLabel: string;
  suggestion1: string;
  suggestion2: string;
  suggestion3: string;
  enableWebSearch: boolean;
  webSearchTitle: string;
  webSearchLabel: string;
  onInputChange: (val: string) => void;
  onSendMessage: (text?: string) => void;
  onToggleWebSearch: () => void;
}

function IconSend() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function AiChatInputToolbar({
  inputVal,
  placeholder,
  sendLabel,
  suggestion1,
  suggestion2,
  suggestion3,
  enableWebSearch,
  webSearchTitle,
  webSearchLabel,
  onInputChange,
  onSendMessage,
  onToggleWebSearch,
}: AiChatInputToolbarProps) {
  return (
    <div className="chat-input-panel">
      {/* Quick Suggestions & Google AI Mode Search Chip */}
      <div className="suggestion-chips-container" style={{ display: "flex", alignItems: "center", gap: "8px", overflowX: "auto" }}>
        <button
          type="button"
          className={`chip-btn ${enableWebSearch ? "active" : ""}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: enableWebSearch
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(16, 185, 129, 0.25))"
              : "rgba(255, 255, 255, 0.04)",
            borderColor: enableWebSearch ? "var(--accent-color)" : "rgba(255, 255, 255, 0.08)",
            color: enableWebSearch ? "#34d399" : "var(--text-secondary)",
            fontWeight: 600,
          }}
          onClick={onToggleWebSearch}
          title={webSearchTitle}
        >
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            <IconGlobe />
          </span>
          <span>{webSearchLabel}</span>
        </button>

        <button className="chip-btn" onClick={() => onSendMessage(suggestion1)}>
          💡 {suggestion1}
        </button>
        <button className="chip-btn" onClick={() => onSendMessage(suggestion2)}>
          💡 {suggestion2}
        </button>
        <button className="chip-btn" onClick={() => onSendMessage(suggestion3)}>
          💡 {suggestion3}
        </button>
      </div>

      {/* Main prompt input bar */}
      <div className="main-input-bar">
        <input
          type="text"
          className="chat-prompt-input"
          value={inputVal}
          onInput={(e) => onInputChange((e.target as HTMLInputElement).value)}
          onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
          placeholder={placeholder}
        />
        <button className="send-message-btn" onClick={() => onSendMessage()}>
          <span>{sendLabel}</span>
          <IconSend />
        </button>
      </div>
    </div>
  );
}

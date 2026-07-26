/**
 * AiChatInputToolbar.tsx
 * Hızlı komut çipleri ve mesaj yazma/gönderme çubuğu.
 */

interface AiChatInputToolbarProps {
  inputVal: string;
  placeholder: string;
  sendLabel: string;
  suggestion1: string;
  suggestion2: string;
  suggestion3: string;
  onInputChange: (val: string) => void;
  onSendMessage: (text?: string) => void;
}

function IconSend() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
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
  onInputChange,
  onSendMessage,
}: AiChatInputToolbarProps) {
  return (
    <div className="chat-input-panel">
      {/* Quick Suggestions Chips */}
      <div className="suggestion-chips-container">
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

interface SidePanelInputBarProps {
  t: Record<string, string>;
  inputText: string;
  isProcessing: boolean;
  isListening: boolean;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onToggleVoice: () => void;
}

export function SidePanelInputBar({
  t,
  inputText,
  isProcessing,
  isListening,
  onInputChange,
  onSend,
  onToggleVoice,
}: SidePanelInputBarProps) {
  return (
    <div className="sidepanel-input-container">
      <button
        className={`sidepanel-mic-btn ${isListening ? "listening" : ""}`}
        onClick={onToggleVoice}
        title={isListening ? t.listening_tooltip : t.voice_command_tooltip}
        disabled={isProcessing}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      </button>

      <input
        type="text"
        className="sidepanel-input"
        value={inputText}
        onInput={(e) => onInputChange((e.target as HTMLInputElement).value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSend();
          }
        }}
        placeholder={
          isListening ? t.listening_placeholder : t.question_placeholder
        }
        disabled={isProcessing}
      />

      <button
        className="sidepanel-send-btn"
        onClick={onSend}
        disabled={isProcessing}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  );
}

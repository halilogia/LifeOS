/**
 * AiChatMessageItem.tsx
 * AI sohbet mesaj balonu ve katlanabilir düşünme süreci (Thinking Process) bileşeni.
 */

export interface MessageItemData {
  sender: "user" | "bot";
  text: string;
  time: string;
  thinking?: string;
}

interface AiChatMessageItemProps {
  message: MessageItemData;
  index: number;
  aiShowThinking?: boolean;
  isThinkingOpen: boolean;
  lang: string;
  onToggleThinking: (idx: number) => void;
}

function IconInfoCircle() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function AiChatMessageItem({
  message,
  index,
  aiShowThinking = true,
  isThinkingOpen,
  lang,
  onToggleThinking,
}: AiChatMessageItemProps) {
  const isUser = message.sender === "user";

  return (
    <div className={`message-bubble-wrapper ${message.sender}`}>
      <div className="avatar">{isUser ? "👤" : "🤖"}</div>
      <div className="message-bubble">
        {message.thinking && aiShowThinking && (
          <div
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
              borderRadius: "var(--radius-sm, 6px)",
              padding: "8px 10px",
              marginBottom: "8px",
              fontSize: "0.78rem",
            }}
          >
            <div
              onClick={() => onToggleThinking(index)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                fontWeight: 600,
                color: "var(--text-secondary)",
                userSelect: "none",
              }}
            >
              <span
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <IconInfoCircle />
                {lang === "tr" ? "Düşünme Süreci" : "Thinking Process"}
              </span>
              <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                {isThinkingOpen ? "▲" : "▼"}
              </span>
            </div>
            {isThinkingOpen && (
              <div
                style={{
                  marginTop: "6px",
                  lineHeight: 1.4,
                  color: "var(--text-muted, rgba(255, 255, 255, 0.6))",
                  whiteSpace: "pre-wrap",
                  borderTop: "1px solid var(--card-border)",
                  paddingTop: "6px",
                  fontStyle: "italic",
                }}
              >
                {message.thinking}
              </div>
            )}
          </div>
        )}
        <p className="msg-text">{message.text}</p>
        <span className="msg-time">{message.time}</span>
      </div>
    </div>
  );
}

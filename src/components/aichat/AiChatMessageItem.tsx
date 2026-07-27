/**
 * AiChatMessageItem.tsx
 * AI sohbet mesaj balonu ve katlanabilir düşünme süreci (Thinking Process) bileşeni.
 */

import { useState } from "preact/hooks";

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

function IconCopy() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12" />
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
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!message.text) return;
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginTop: "4px" }}>
          <span className="msg-time">{message.time}</span>
          {!isUser && (
            <button
              onClick={handleCopy}
              title={copied ? (lang === "tr" ? "Kopyalandı!" : "Copied!") : (lang === "tr" ? "Kopyala" : "Copy")}
              style={{
                background: "transparent",
                border: "none",
                color: copied ? "#10b981" : "var(--text-secondary)",
                cursor: "pointer",
                padding: "2px 6px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.7rem",
                opacity: 0.8,
                transition: "all 0.2s ease",
              }}
            >
              {copied ? <IconCheck /> : <IconCopy />}
              <span style={{ fontSize: "0.68rem" }}>
                {copied ? (lang === "tr" ? "Kopyalandı" : "Copied") : (lang === "tr" ? "Kopyala" : "Copy")}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * AiChatMessageItem.tsx
 * AI sohbet mesaj balonu, katlanabilir düşünme süreci ve Google AI Modu Canlı Arama kaynak adımları bileşeni.
 */

import { useState } from "preact/hooks";
import type { WebSearchSource } from "@/services/webSearchAgent.js";

export interface MessageItemData {
  sender: "user" | "bot";
  text: string;
  time: string;
  thinking?: string;
  searchQuery?: string;
  sources?: WebSearchSource[];
}

interface AiChatMessageItemProps {
  message: MessageItemData;
  index: number;
  aiShowThinking?: boolean;
  isThinkingOpen: boolean;
  t: Record<string, string>;
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconExternal() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function AiChatMessageItem({
  message,
  index,
  aiShowThinking = true,
  isThinkingOpen,
  t,
  onToggleThinking,
}: AiChatMessageItemProps) {
  const isUser = message.sender === "user";
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(true);

  const handleCopy = () => {
    if (!message.text) {return;}
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`message-bubble-wrapper ${message.sender}`}>
      <div className="avatar">{isUser ? "👤" : "🤖"}</div>
      <div className="message-bubble">
        {/* Google AI Mode Live Research Step Card */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div
            style={{
              background: "rgba(139, 92, 246, 0.08)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              borderRadius: "10px",
              padding: "10px 12px",
              marginBottom: "10px",
              fontSize: "0.78rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontWeight: 700,
                color: "#c084fc",
                marginBottom: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <IconSearch />
                <span>{t.aichat_search_query.replace("{query}", message.searchQuery || t.aichat_web_research)}</span>
              </div>
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                }}
                onClick={() => setShowSources((prev) => !prev)}
              >
                {showSources ? t.aichat_sources_hide : t.aichat_sources_show}
              </button>
            </div>

            {showSources && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                  <IconGlobe />
                  <span>{t.aichat_sources.replace("{count}", String(message.sources.length))}</span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "6px",
                  }}
                >
                  {message.sources.map((src, idx) => {
                    let domain = "";
                    try {
                      domain = new URL(src.url).hostname.replace("www.", "");
                    } catch {
                      domain = "web";
                    }
                    return (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "6px",
                          padding: "5px 8px",
                          color: "#e2e8f0",
                          textDecoration: "none",
                          fontSize: "0.72rem",
                          fontWeight: 500,
                          transition: "all 0.15s ease",
                          overflow: "hidden",
                        }}
                      >
                        <span style={{ color: "#818cf8", fontWeight: 700 }}>[{idx + 1}]</span>
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            flex: 1,
                          }}
                          title={src.title}
                        >
                          {src.title}
                        </span>
                        <IconExternal />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Thinking Process Card */}
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
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <IconInfoCircle />
                {t.aichat_thinking_process}
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

        {/* Main Response Text */}
        <p className="msg-text">{message.text}</p>

        {/* Bottom Time & Actions Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginTop: "6px" }}>
          <span className="msg-time">{message.time}</span>
          {!isUser && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {message.sources && message.sources.length > 0 && (
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "#34d399",
                    background: "rgba(16, 185, 129, 0.12)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <IconGlobe />
                  {t.aichat_verified_badge}
                </span>
              )}
              <button
                onClick={handleCopy}
                title={copied ? t.aichat_copied : t.aichat_copy}
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
                  {copied ? t.aichat_copied : t.aichat_copy}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

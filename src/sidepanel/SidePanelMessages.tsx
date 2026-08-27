import { useState } from "preact/hooks";
import { Language } from "@/types/types.js";
import { ChatMessage } from "./ChatMessage.js";
import { formatFileSize } from "@/services/aichat/fileAttachmentService.js";

interface SidePanelMessagesProps {
  t: Record<string, string>;
  lang: Language;
  messages: ChatMessage[];
  agentStatus: string | null;
  messagesEndRef: { current: HTMLDivElement | null };
  onChipClick: (type: "summarize" | "key_takeaways") => void;
}

function SidePanelCopyBtn({
  text,
  t,
}: {
  text: string;
  t: Record<string, string>;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!text) {
      return;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title={copied ? t.copy_title_copied : t.copy_title}
      style={{
        background: "transparent",
        border: "none",
        color: copied ? "#10b981" : "rgba(255, 255, 255, 0.5)",
        cursor: "pointer",
        padding: "2px 4px",
        borderRadius: "4px",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "0.68rem",
        transition: "all 0.2s ease",
      }}
    >
      {copied ? (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      <span>{copied ? t.copy_label_copied : t.copy_label}</span>
    </button>
  );
}

export function SidePanelMessages({
  t,
  lang: _lang,
  messages,
  agentStatus,
  messagesEndRef,
  onChipClick,
}: SidePanelMessagesProps) {
  const [lightboxImg, setLightboxImg] = useState<{ src: string; alt: string } | null>(null);

  return (
    <div className="sidepanel-messages">
      {lightboxImg && (
        <div className="sidepanel-lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <div className="sidepanel-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImg.src} alt={lightboxImg.alt} className="sidepanel-lightbox-img" />
            <button className="sidepanel-lightbox-close" onClick={() => setLightboxImg(null)}>
              &times;
            </button>
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="sidepanel-empty-state">
          <div className="ai-orb-container">
            <div className="ai-orb-ring-outer"></div>
            <div className="ai-orb-ring-inner"></div>
            <div className="ai-orb-core">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
              >
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            </div>
          </div>
          <div className="sidepanel-empty-title">
            <span>{t.agent_ready}</span>
          </div>
          <p className="sidepanel-empty-desc">{t.agent_analyze_desc}</p>

          <div className="sidepanel-starter-grid">
            <button
              className="starter-card"
              onClick={() => onChipClick("summarize")}
            >
              <div className="starter-icon purple">✨</div>
              <div className="starter-text">
                <strong>{t.starter_summarize}</strong>
                <span>{t.starter_summarize_desc}</span>
              </div>
            </button>
            <button
              className="starter-card"
              onClick={() => onChipClick("key_takeaways")}
            >
              <div className="starter-icon green">💡</div>
              <div className="starter-text">
                <strong>{t.starter_takeaways}</strong>
                <span>{t.starter_takeaways_desc}</span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className={`sidepanel-msg ${msg.role}`}>
            {/* Render User Attached Files / Images */}
            {msg.attachments && msg.attachments.length > 0 && (
              <div className="sidepanel-msg-attachments">
                {msg.attachments.map((att) => (
                  <div key={att.id} className="sidepanel-msg-att-item">
                    {att.type === "image" && att.previewUrl ? (
                      <div
                        className="sidepanel-msg-img-wrap"
                        onClick={() =>
                          setLightboxImg({
                            src: att.previewUrl || att.dataUrl || "",
                            alt: att.name,
                          })
                        }
                      >
                        <img
                          src={att.previewUrl}
                          alt={att.name}
                          className="sidepanel-msg-thumb"
                        />
                        <span className="sidepanel-msg-att-badge">
                          {att.name} ({formatFileSize(att.size)})
                        </span>
                      </div>
                    ) : (
                      <div className={`sidepanel-msg-doc-pill ${att.type}`}>
                        {att.type === "pdf" ? (
                          <span className="doc-icon pdf">PDF</span>
                        ) : (
                          <span className="doc-icon code">DOC</span>
                        )}
                        <span className="doc-name">{att.name}</span>
                        <span className="doc-size">
                          {formatFileSize(att.size)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                marginTop: "4px",
              }}
            >
              <span style={{ fontSize: "0.62rem", opacity: 0.6 }}>
                {msg.timestamp}
              </span>
              {msg.role === "assistant" && (
                <SidePanelCopyBtn text={msg.content} t={t} />
              )}
            </div>
          </div>
        ))
      )}

      {agentStatus && (
        <div className="sidepanel-agent-status">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ animation: "spin 1s linear infinite" }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              strokeDasharray="32"
              strokeDashoffset="10"
            ></circle>
          </svg>
          <span>{agentStatus}</span>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

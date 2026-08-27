/**
 * AiChatMessageItem.tsx
 * AI sohbet mesaj balonu, katlanabilir düşünme süreci, ekli görsel/dosya rozetleri ve Google AI Modu Canlı Arama kaynak adımları bileşeni.
 */
import { useState } from "preact/hooks";
import type { WebSearchSource } from "@/services/webSearchAgent.js";
import type { ChatAttachment } from "@/services/aichat/types.js";
import { formatFileSize } from "@/services/aichat/fileAttachmentService.js";
import { AiMessageSources } from "./AiMessageSources.js";
import { AiThinkingCard } from "./AiThinkingCard.js";
import { AiMessageFooter } from "./AiMessageFooter.js";

export interface MessageItemData {
  sender: "user" | "bot";
  text: string;
  time: string;
  thinking?: string;
  searchQuery?: string;
  sources?: WebSearchSource[];
  attachments?: ChatAttachment[];
}

interface AiChatMessageItemProps {
  message: MessageItemData;
  index: number;
  aiShowThinking?: boolean;
  isThinkingOpen: boolean;
  t: Record<string, string>;
  onToggleThinking: (idx: number) => void;
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
  const [lightboxImg, setLightboxImg] = useState<{ src: string; alt: string } | null>(null);

  const handleCopy = () => {
    if (!message.text) {
      return;
    }
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`message-bubble-wrapper ${message.sender}`}>
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

      <div className="avatar">
        {isUser ? (
          "👤"
        ) : (
          <img
            src="icons/AI.png"
            alt="AI"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        )}
      </div>
      <div className="message-bubble">
        {/* Render User Attached Images or Document Badges */}
        {isUser && message.attachments && message.attachments.length > 0 && (
          <div className="aichat-msg-attachments">
            {message.attachments.map((att) => (
              <div key={att.id} className="aichat-msg-att-item">
                {att.type === "image" && (att.previewUrl || att.dataUrl) ? (
                  <div
                    className="aichat-msg-img-wrap"
                    onClick={() =>
                      setLightboxImg({
                        src: att.previewUrl || att.dataUrl || "",
                        alt: att.name,
                      })
                    }
                  >
                    <img
                      src={att.previewUrl || att.dataUrl}
                      alt={att.name}
                      className="aichat-msg-thumb"
                    />
                    <span className="aichat-msg-att-badge">
                      {att.name} ({formatFileSize(att.size)})
                    </span>
                  </div>
                ) : (
                  <div className={`aichat-msg-doc-pill ${att.type}`}>
                    {att.type === "pdf" ? (
                      <span className="doc-icon pdf">PDF</span>
                    ) : (
                      <span className="doc-icon code">DOC</span>
                    )}
                    <span className="doc-name">{att.name}</span>
                    <span className="doc-size">{formatFileSize(att.size)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Google AI Mode Live Research Step Card */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <AiMessageSources
            t={t}
            sources={message.sources}
            searchQuery={message.searchQuery}
            isVisible={showSources}
            onToggle={() => setShowSources((prev) => !prev)}
          />
        )}

        {/* Thinking Process Card */}
        {message.thinking && aiShowThinking && (
          <AiThinkingCard
            t={t}
            thinking={message.thinking}
            isOpen={isThinkingOpen}
            onToggle={() => onToggleThinking(index)}
          />
        )}

        {/* Main Response Text */}
        <p className="msg-text">{message.text}</p>

        {/* Bottom Time & Actions Bar */}
        {!isUser && (
          <AiMessageFooter
            t={t}
            time={message.time}
            hasSources={Boolean(message.sources && message.sources.length > 0)}
            copied={copied}
            onCopy={handleCopy}
          />
        )}
      </div>
    </div>
  );
}

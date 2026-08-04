/**
 * AiChatMessageItem.tsx
 * AI sohbet mesaj balonu, katlanabilir düşünme süreci ve Google AI Modu Canlı Arama kaynak adımları bileşeni.
 * Tuval: copied/showSources state + AiMessageSources/AiThinkingCard/AiMessageFooter + avatar + text.
 */
import { useState } from "preact/hooks";
import type { WebSearchSource } from "@/services/webSearchAgent.js";
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

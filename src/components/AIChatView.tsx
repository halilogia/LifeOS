/**
 * AIChatView.tsx
 * AI Chat view — pure UI orchestrator.
 * State & business logic lives in useAiChatMessages hook.
 * Target: ~150 satır (was 483)
 */
import { useRef, useEffect, useState } from "preact/hooks";
import type { Todo } from "@/types/types.js";
import type { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";

import { AiChatHeaderBar } from "./aichat/AiChatHeaderBar.js";
import { AiChatMessageItem } from "./aichat/AiChatMessageItem.js";
import { AiChatInputToolbar } from "./aichat/AiChatInputToolbar.js";
import { useAiChatMessages } from "./aichat/useAiChatMessages.js";

interface AIChatViewProps {
  lang: Language;
  todos: Todo[];
  onAddTodo: (
    text: string,
    repeat: Todo["repeat"],
    dueDate?: string,
  ) => Promise<void>;
  onToggleTodo: (index: number) => Promise<void>;
  onDeleteTodo: (index: number) => Promise<void>;
  onManualSync: () => Promise<void>;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
  aiShowThinking?: boolean;
  onSettingsOpen: () => void;
}

export function AIChatView({
  lang,
  todos: _todos,
  onAddTodo,
  onToggleTodo: _onToggleTodo,
  onDeleteTodo: _onDeleteTodo,
  onManualSync,
  aiProvider,
  aiApiKey,
  aiModel,
  aiEndpoint,
  aiShowThinking = true,
  onSettingsOpen,
}: AIChatViewProps) {
  const t = getTranslation(lang);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [inputVal, setInputVal] = useState("");

  const {
    messages,
    isBotTyping,
    enableWebSearch,
    openThinkingIndexes,
    handleSendMessage,
    handleToggleThinking,
    setOpenThinkingIndexes,
    setEnableWebSearch,
  } = useAiChatMessages({
    lang,
    onAddTodo,
    onManualSync,
    aiProvider,
    aiApiKey,
    aiModel,
    aiEndpoint,
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  const onSend = () => {
    const text = inputVal.trim();
    if (!text) {
      return;
    }
    setInputVal("");
    handleSendMessage(text);
  };

  return (
    <div id="ai-chat-view" className="view-content active">
      <div className="ai-chat-container">
        <AiChatHeaderBar
          title={t.ai_chat_title}
          aiApiKey={aiApiKey}
          noKeyWarning={t.ai_chat_no_key_warning}
          keySavedText={t.ai_chat_key_saved}
          keyTitleText={t.ai_chat_key_title}
          settingsTitle={t.settings_title}
          offlineModeLabel={t.aichat_offline_mode}
          onSettingsOpen={onSettingsOpen}
        />

        <div className="chat-messages-area">
          {messages.map((msg, idx) => (
            <AiChatMessageItem
              key={idx}
              message={msg}
              index={idx}
              aiShowThinking={aiShowThinking}
              isThinkingOpen={openThinkingIndexes[idx] !== false}
              t={t}
              onToggleThinking={handleToggleThinking}
            />
          ))}
          {isBotTyping && (
            <div className="message-bubble-wrapper bot">
              <div className="avatar">
                <img
                  src="icons/AI.png"
                  alt="AI"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                />
              </div>
              <div
                className="message-bubble typing"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                {enableWebSearch && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#34d399",
                      fontWeight: 600,
                      marginLeft: "6px",
                    }}
                  >
                    {t.aichat_web_search_active}
                  </span>
                )}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <AiChatInputToolbar
          inputVal={inputVal}
          placeholder={t.ai_chat_placeholder}
          sendLabel={t.ai_chat_send}
          suggestion1={t.ai_chat_suggestion_1}
          suggestion2={t.ai_chat_suggestion_2}
          suggestion3={t.ai_chat_suggestion_3}
          enableWebSearch={enableWebSearch}
          webSearchTitle={t.aichat_web_search_title}
          webSearchLabel={
            enableWebSearch ? t.aichat_web_search_on : t.aichat_web_search_off
          }
          onInputChange={setInputVal}
          onSendMessage={onSend}
          onToggleWebSearch={() => setEnableWebSearch((prev) => !prev)}
        />
      </div>
    </div>
  );
}

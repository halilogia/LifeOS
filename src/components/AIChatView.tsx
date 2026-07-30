import { useState, useEffect, useRef } from "preact/hooks";
import { Todo, Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";

import { AiChatHeaderBar } from "./aichat/AiChatHeaderBar.js";
import {
  AiChatMessageItem,
  MessageItemData,
} from "./aichat/AiChatMessageItem.js";
import { AiChatInputToolbar } from "./aichat/AiChatInputToolbar.js";
import { parseLocalCommand } from "@/utils/aiCommandParser.js";
import {
  callAIConfigured,
  handleAddNoteFromAI,
  handleUpdateMemoryFromAI,
} from "@/services/aiChatService.js";
import { ChromeStorageStockRepository } from "@/infrastructure/persistence/ChromeStorageStockRepository.js";
import type { StockPortfolioItem } from "@/types/stock.js";
import { logger } from "@/utils/logger.js";

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

  // Component States
  const [messages, setMessages] = useState<MessageItemData[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [enableWebSearch, setEnableWebSearch] = useState(true);
  const [openThinkingIndexes, setOpenThinkingIndexes] = useState<
    Record<number, boolean>
  >({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message
  useEffect(() => {
    setMessages([
      {
        sender: "bot",
        text: t.ai_chat_welcome,
        time: new Date().toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  // Handle Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query) {return;}

    if (!textToSend) {
      setInputVal("");
    }

    const time = new Date().toLocaleTimeString(
      lang === "tr" ? "tr-TR" : "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );

    setMessages((prev) => [...prev, { sender: "user", text: query, time }]);
    setIsBotTyping(true);

    try {
      const isLocalOrCustom =
        aiEndpoint &&
        (aiEndpoint.includes("localhost") || aiEndpoint.includes("127.0.0.1"));
      if ((aiApiKey && aiApiKey.trim()) || isLocalOrCustom) {
        const aiResponse = await callAIConfigured({
          userPrompt: query,
          aiProvider,
          aiApiKey,
          aiModel,
          aiEndpoint,
          enableWebSearch,
        });
        setIsBotTyping(false);

        if (aiResponse.action === "create_task" && aiResponse.params?.text) {
          const taskText = aiResponse.params.text as string;
          const repeat = (aiResponse.params.repeat as Todo["repeat"]) || "none";
          const dueDate = aiResponse.params.dueDate as string | undefined;

          await onAddTodo(taskText, repeat, dueDate);
          await onManualSync();
        } else if (
          aiResponse.action === "add_note" &&
          aiResponse.params?.note_content
        ) {
          const type = aiResponse.params.note_type as "note" | "diary" | "cornell" || "note";
          const content = aiResponse.params.note_content as string;
          const title = aiResponse.params.note_title !== undefined ? String(aiResponse.params.note_title) : "";
          const cues = aiResponse.params.note_cues !== undefined ? String(aiResponse.params.note_cues) : "";
          const summary = aiResponse.params.note_summary !== undefined ? String(aiResponse.params.note_summary) : "";
          await handleAddNoteFromAI(type, content, lang, title, cues, summary);
        } else if (
          aiResponse.action === "update_memory" &&
          aiResponse.params?.memory_fact
        ) {
          await handleUpdateMemoryFromAI(String(aiResponse.params.memory_fact));
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: aiResponse.reply,
            thinking: aiResponse.thinking,
            searchQuery: aiResponse.searchQuery,
            sources: aiResponse.sources,
            time: new Date().toLocaleTimeString(
              lang === "tr" ? "tr-TR" : "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            ),
          },
        ]);
      } else {
        // Fallback local command parser
        setTimeout(async () => {
          setIsBotTyping(false);
          const localParsed = parseLocalCommand(query);

          let replyText = "";
          if (localParsed.parsed) {
            if (localParsed.action === "add_note" && localParsed.content) {
              const type = localParsed.note_type || "note";
              await handleAddNoteFromAI(type, localParsed.content, lang);

              const typeLabel =
                type === "diary"
                  ? t.aichat_type_label_diary
                  : type === "cornell"
                    ? t.aichat_type_label_cornell
                    : t.aichat_type_label_note;

              replyText = t.aichat_added_note_success.replace('{type_label}', typeLabel);
            } else if (
              localParsed.action === "create_task" &&
              localParsed.text
            ) {
              const dueDateFormatted = localParsed.date
                ? ` (${localParsed.date})`
                : "";
              await onAddTodo(localParsed.text, "none", localParsed.date);
              await onManualSync();

              replyText = t.aichat_added_task_success
                .replace('{task_text}', localParsed.text)
                .replace('{date_part}', dueDateFormatted);
            } else if (
              localParsed.action === "add_stock" &&
              localParsed.stock
            ) {
              const { symbol, displayName, buyPrice, lotCount } =
                localParsed.stock;
              const stockRepo = new ChromeStorageStockRepository();
              const currentPortfolio = await stockRepo.getPortfolio();
              const newStock: StockPortfolioItem = {
                id: `stock-${Date.now()}`,
                symbol,
                displayName,
                buyPrice,
                lotCount,
                buyDate: new Date().toISOString().split("T")[0],
              };
              const updatedPortfolio = [...currentPortfolio, newStock];
              await stockRepo.savePortfolio(updatedPortfolio);

              const cleanSymbol = symbol.replace(".IS", "");
              const price = buyPrice.toFixed(2);
              replyText = t.aichat_added_stock_success
                .replace('{lot_count}', String(lotCount))
                .replace('{display_name}', displayName)
                .replace('{symbol}', cleanSymbol)
                .replace('{price}', price);
            }
          } else {
            replyText = t.aichat_parse_failed;
          }

          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: replyText,
              time: new Date().toLocaleTimeString(
                lang === "tr" ? "tr-TR" : "en-US",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              ),
            },
          ]);
        }, 800);
      }
    } catch (e) {
      logger.error(e);
      setIsBotTyping(false);

      const localParsed = parseLocalCommand(query);
      let replyText = "";
      if (localParsed.parsed) {
        if (localParsed.action === "add_note" && localParsed.content) {
          const type = localParsed.note_type || "note";
          await handleAddNoteFromAI(type, localParsed.content, lang);
          const typeLabel =
            type === "diary"
              ? t.aichat_type_label_diary
              : type === "cornell"
                ? t.aichat_type_label_cornell
                : t.aichat_type_label_note;
          replyText = t.aichat_fallback_added_note.replace('{type_label}', typeLabel);
        } else if (localParsed.action === "create_task" && localParsed.text) {
          const dueDateFormatted = localParsed.date
            ? ` (${localParsed.date})`
            : "";
          await onAddTodo(localParsed.text, "none", localParsed.date);
          await onManualSync();
          replyText = t.aichat_fallback_added_task
            .replace('{task_text}', localParsed.text)
            .replace('{date_part}', dueDateFormatted);
        }
      } else {
        const errorMsg = e instanceof Error ? e.message : String(e);
        replyText = t.aichat_connection_error.replace('{error_msg}', errorMsg);
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: replyText,
          time: new Date().toLocaleTimeString(
            lang === "tr" ? "tr-TR" : "en-US",
            {
              hour: "2-digit",
              minute: "2-digit",
            },
          ),
        },
      ]);
    }
  };

  const handleToggleThinking = (idx: number) => {
    setOpenThinkingIndexes((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div id="ai-chat-view" className="view-content active">
      <div className="ai-chat-container">
        {/* Header Bar */}
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

        {/* Messages List Area */}
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
              <div className="avatar">🤖</div>
              <div className="message-bubble typing" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                {enableWebSearch && (
                  <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600, marginLeft: "6px" }}>
                    {t.aichat_web_search_active}
                  </span>
                )}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input Panel & Suggestions */}
        <AiChatInputToolbar
          inputVal={inputVal}
          placeholder={t.ai_chat_placeholder}
          sendLabel={t.ai_chat_send}
          suggestion1={t.ai_chat_suggestion_1}
          suggestion2={t.ai_chat_suggestion_2}
          suggestion3={t.ai_chat_suggestion_3}
          enableWebSearch={enableWebSearch}
          webSearchTitle={t.aichat_web_search_title}
          webSearchLabel={enableWebSearch ? t.aichat_web_search_on : t.aichat_web_search_off}
          onInputChange={setInputVal}
          onSendMessage={handleSendMessage}
          onToggleWebSearch={() => setEnableWebSearch((prev) => !prev)}
        />
      </div>
    </div>
  );
}

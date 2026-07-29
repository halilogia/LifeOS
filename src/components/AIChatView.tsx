import { useState, useEffect, useRef } from "preact/hooks";
import { Todo, Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";

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
  const t = translations[lang];

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
    if (!query) return;

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
          const taskText = aiResponse.params.text;
          const repeat = aiResponse.params.repeat || "none";
          const dueDate = aiResponse.params.dueDate;

          await onAddTodo(taskText, repeat, dueDate);
          await onManualSync();
        } else if (
          aiResponse.action === "add_note" &&
          aiResponse.params?.note_content
        ) {
          const type = aiResponse.params.note_type || "note";
          const content = aiResponse.params.note_content;
          const title = aiResponse.params.note_title;
          const cues = aiResponse.params.note_cues;
          const summary = aiResponse.params.note_summary;
          await handleAddNoteFromAI(type, content, lang, title, cues, summary);
        } else if (
          aiResponse.action === "update_memory" &&
          aiResponse.params?.memory_fact
        ) {
          await handleUpdateMemoryFromAI(aiResponse.params.memory_fact);
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
                  ? lang === "tr"
                    ? "günlük yazısını"
                    : "diary entry"
                  : type === "cornell"
                    ? lang === "tr"
                      ? "Cornell ders notunu"
                      : "Cornell study note"
                    : lang === "tr"
                      ? "notu"
                      : "note";

              replyText =
                lang === "tr"
                  ? `Harika! İstediğiniz ${typeLabel} Günlüğüm sekmesine başarıyla ekledim. ✓`
                  : `Sure! I have successfully added the ${typeLabel} to your My Diary tab. ✓`;
            } else if (
              localParsed.action === "create_task" &&
              localParsed.text
            ) {
              const dueDateFormatted = localParsed.date
                ? ` (${localParsed.date})`
                : "";
              await onAddTodo(localParsed.text, "none", localParsed.date);
              await onManualSync();

              replyText =
                lang === "tr"
                  ? `Tamamdır! "${localParsed.text}" görevini${dueDateFormatted} takviminize ekledim. ✓`
                  : `Sure! I have added "${localParsed.text}" to your tasks list${dueDateFormatted}. ✓`;
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

              replyText =
                lang === "tr"
                  ? `📈 Harika! ${lotCount} lot ${displayName} (${symbol.replace(".IS", "")}) ₺${buyPrice.toFixed(2)} fiyattan BIST portföyünüze başarıyla eklendi! ✓`
                  : `📈 Great! Added ${lotCount} shares of ${displayName} (${symbol.replace(".IS", "")}) @ ₺${buyPrice.toFixed(2)} to your BIST portfolio! ✓`;
            }
          } else {
            replyText =
              lang === "tr"
                ? "Üzgünüm, bu komutu yerel olarak çözümleyemedim. Lütfen 'günlük ekle: ...', 'not ekle: ...' veya 'ders notu ekle: ...' formatında yazmayı deneyin."
                : "I couldn't parse this command locally. Try: 'günlük ekle: ...', 'not ekle: ...' or 'ders notu ekle: ...'";
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
      console.error(e);
      setIsBotTyping(false);

      const localParsed = parseLocalCommand(query);
      let replyText = "";
      if (localParsed.parsed) {
        if (localParsed.action === "add_note" && localParsed.content) {
          const type = localParsed.note_type || "note";
          await handleAddNoteFromAI(type, localParsed.content, lang);
          const typeLabel =
            type === "diary"
              ? lang === "tr"
                ? "günlük yazısını"
                : "diary entry"
              : type === "cornell"
                ? lang === "tr"
                  ? "Cornell ders notunu"
                  : "Cornell study note"
                : lang === "tr"
                  ? "notu"
                  : "note";
          replyText =
            lang === "tr"
              ? `[Yerel Fallback] İstediğiniz ${typeLabel} Günlüğüm sekmesine ekledim. ✓`
              : `[Local Fallback] Added the ${typeLabel} successfully. ✓`;
        } else if (localParsed.action === "create_task" && localParsed.text) {
          const dueDateFormatted = localParsed.date
            ? ` (${localParsed.date})`
            : "";
          await onAddTodo(localParsed.text, "none", localParsed.date);
          await onManualSync();
          replyText =
            lang === "tr"
              ? `[Yerel Fallback] "${localParsed.text}" görevini${dueDateFormatted} ekledim. ✓`
              : `[Local Fallback] Added "${localParsed.text}" task${dueDateFormatted}. ✓`;
        }
      } else {
        const errorMsg = e instanceof Error ? e.message : String(e);
        replyText =
          lang === "tr"
            ? `Yapay zeka servisine bağlanırken bir sorun oluştu: ${errorMsg}`
            : `Error connecting to the AI service: ${errorMsg}`;
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

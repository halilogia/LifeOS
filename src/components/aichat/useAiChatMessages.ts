/**
 * useAiChatMessages.ts
 * Hook — manages AI Chat state, message history, and AI API interaction.
 * Extracted from AIChatView.tsx to keep view pure (~200 satır, eski 483 → 200)
 */
import { useState, useEffect } from "preact/hooks";
import type { Todo } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/types/types.js";
import type { MessageItemData } from "./AiChatMessageItem.js";
import { parseLocalCommand } from "@/utils/aiCommandParser.js";
import {
  callAIConfigured,
  handleAddNoteFromAI,
  handleUpdateMemoryFromAI,
} from "@/services/aiChatService.js";
import { ChromeStorageStockRepository } from "@/infrastructure/persistence/repositories/ChromeStorageStockRepository.js";
import type { StockPortfolioItem } from "@/types/stock.js";
import { fetchStockQuote } from "@/services/bistService.js";
import { analyzeStockWithAI } from "@/services/stock/stockAiService.js";
import { logger } from "@/utils/logger.js";

export interface UseAiChatMessagesParams {
  lang: Language;
  onAddTodo: (
    text: string,
    repeat: Todo["repeat"],
    dueDate?: string,
  ) => Promise<void>;
  onManualSync: () => Promise<void>;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
}

export interface UseAiChatMessagesReturn {
  messages: MessageItemData[];
  isBotTyping: boolean;
  enableWebSearch: boolean;
  openThinkingIndexes: Record<number, boolean>;
  handleSendMessage: (textToSend?: string) => Promise<void>;
  handleToggleThinking: (idx: number) => void;
  setOpenThinkingIndexes: (
    fn: (prev: Record<number, boolean>) => Record<number, boolean>,
  ) => void;
  setEnableWebSearch: (fn: (prev: boolean) => boolean) => void;
}

function addBotMsg(
  setMessages: (fn: (prev: MessageItemData[]) => MessageItemData[]) => void,
  lang: Language,
  overrides: Partial<MessageItemData>,
) {
  setMessages((prev) => [
    ...prev,
    {
      sender: "bot",
      text: "",
      time: new Date().toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      ...overrides,
    } as MessageItemData,
  ]);
}

export function useAiChatMessages({
  lang,
  onAddTodo,
  onManualSync,
  aiProvider,
  aiApiKey,
  aiModel,
  aiEndpoint,
}: UseAiChatMessagesParams): UseAiChatMessagesReturn {
  const t = getTranslation(lang);
  const [messages, setMessages] = useState<MessageItemData[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [enableWebSearch, setEnableWebSearch] = useState(true);
  const [openThinkingIndexes, setOpenThinkingIndexes] = useState<
    Record<number, boolean>
  >({});

  // Initialize welcome message (and check for pending stock from BIST analysis)
  useEffect(() => {
    const pendingStock = sessionStorage.getItem("hermes_pending_stock");
    const initialMessages: MessageItemData[] = [];

    if (pendingStock) {
      sessionStorage.removeItem("hermes_pending_stock");
      const cleanSym = pendingStock.replace(".IS", "");
      initialMessages.push({
        sender: "user",
        text: `**${cleanSym}** hissesini analiz et`,
        time: new Date().toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      initialMessages.push({
        sender: "bot",
        text: `🔍 **${cleanSym}** analizini yapmıştık. Bu hisse hakkında ne sormak istersin? Örneğin:\n\n> "Satmalı mıyım, almalı mıyım?"\n> "Stop-loss nereye koyayım?"\n> "Teknik durumu nasıl?"`,
        time: new Date().toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    } else {
      initialMessages.push({
        sender: "bot",
        text: t.ai_chat_welcome,
        time: new Date().toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }

    setMessages(initialMessages);
  }, []);

  // ─── Handle Send Message ────────────────────────────────────────────────
  const handleSendMessage = async (textToSend?: string) => {
    // State'ten en güncel input'u al
    const query = (textToSend || "").trim();
    if (!query) {
      return;
    }
    if (!textToSend) {
      // stashed — inputVal ref'ten gelir, View kontrol eder
    }

    const time = new Date().toLocaleTimeString(
      lang === "tr" ? "tr-TR" : "en-US",
      { hour: "2-digit", minute: "2-digit" },
    );

    setMessages((prev) => [...prev, { sender: "user", text: query, time }]);
    setIsBotTyping(true);

    try {
      const isLocalOrCustom =
        aiEndpoint &&
        (aiEndpoint.includes("localhost") || aiEndpoint.includes("127.0.0.1"));

      // ── Stock analysis interception ──────────────────────────────────────
      const localCheck = parseLocalCommand(query);
      if (localCheck.action === "ask_stock" && localCheck.stockQuery) {
        const { symbol, question } = localCheck.stockQuery;
        try {
          const quote = await fetchStockQuote(symbol);
          const enrichedPrompt = [
            `Kullanıcı "${symbol}" hissesi hakkında soru soruyor.\n`,
            `--- CANLI BORSA VERİSİ (Teknik) ---\n`,
            `Hisse: ${symbol}\nCanlı Fiyat: ₺${quote.price}\nGünlük Değişim: %${quote.changePercent.toFixed(2)}\n`,
            `Gün İçi En Yüksek: ₺${quote.dayHigh}\nGün İçi En Düşük: ₺${quote.dayLow}\nHacim: ${quote.volume}\n\n`,
            `Kullanıcı Sorusu: ${question || query}\n\n`,
            `ÖNEMLİ: ${symbol} hakkında internette güncel haber, halka arz durumu, şirket profili ve finansalları araştır. Canlı borsa verisini temel bilgiler ile birleştirerek kapsamlı analiz yap.`,
          ].join("");

          const conversationHistory = messages
            .filter((m) => m.sender === "user" || m.sender === "bot")
            .map((m) => ({
              role:
                m.sender === "user"
                  ? ("user" as const)
                  : ("assistant" as const),
              content: m.text,
            }));

          const aiResponse = await callAIConfigured({
            userPrompt: enrichedPrompt,
            aiProvider,
            aiApiKey,
            aiModel,
            aiEndpoint,
            enableWebSearch: true,
            conversationHistory,
          });

          setIsBotTyping(false);
          addBotMsg(setMessages, lang, {
            text: aiResponse.reply,
            thinking: aiResponse.thinking,
            searchQuery: aiResponse.searchQuery,
            sources: aiResponse.sources,
          });
          return;
        } catch {
          logger.warn("ask_stock+websearch failed, falling through");
        }
      }

      // ── AI mode ──────────────────────────────────────────────────────────
      if ((aiApiKey && aiApiKey.trim()) || isLocalOrCustom) {
        const conversationHistory = messages
          .filter((m) => m.sender === "user" || m.sender === "bot")
          .map((m) => ({
            role:
              m.sender === "user" ? ("user" as const) : ("assistant" as const),
            content: m.text,
          }));

        const aiResponse = await callAIConfigured({
          userPrompt: query,
          aiProvider,
          aiApiKey,
          aiModel,
          aiEndpoint,
          enableWebSearch,
          conversationHistory,
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
          const type =
            (aiResponse.params.note_type as "note" | "diary" | "cornell") ||
            "note";
          const content = aiResponse.params.note_content as string;
          const title =
            aiResponse.params.note_title !== undefined
              ? String(aiResponse.params.note_title)
              : "";
          const cues =
            aiResponse.params.note_cues !== undefined
              ? String(aiResponse.params.note_cues)
              : "";
          const summary =
            aiResponse.params.note_summary !== undefined
              ? String(aiResponse.params.note_summary)
              : "";
          await handleAddNoteFromAI(type, content, lang, title, cues, summary);
        } else if (
          aiResponse.action === "update_memory" &&
          aiResponse.params?.memory_fact
        ) {
          await handleUpdateMemoryFromAI(String(aiResponse.params.memory_fact));
        }

        addBotMsg(setMessages, lang, {
          text: aiResponse.reply,
          thinking: aiResponse.thinking,
          searchQuery: aiResponse.searchQuery,
          sources: aiResponse.sources,
        });
        return;
      }

      // ── Offline mode ─────────────────────────────────────────────────────
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
          replyText = t.aichat_added_note_success.replace(
            "{type_label}",
            typeLabel,
          );
        } else if (localParsed.action === "create_task" && localParsed.text) {
          const dueDateFormatted = localParsed.date
            ? ` (${localParsed.date})`
            : "";
          await onAddTodo(localParsed.text, "none", localParsed.date);
          await onManualSync();
          replyText = t.aichat_added_task_success
            .replace("{task_text}", localParsed.text)
            .replace("{date_part}", dueDateFormatted);
        } else if (localParsed.action === "add_stock" && localParsed.stock) {
          const { symbol, displayName, buyPrice, lotCount } = localParsed.stock;
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
          await stockRepo.savePortfolio([...currentPortfolio, newStock]);
          replyText = t.aichat_added_stock_success
            .replace("{lot_count}", String(lotCount))
            .replace("{display_name}", displayName)
            .replace("{symbol}", symbol.replace(".IS", ""))
            .replace("{price}", buyPrice.toFixed(2));
        } else if (
          localParsed.action === "ask_stock" &&
          localParsed.stockQuery
        ) {
          const { symbol, question } = localParsed.stockQuery;
          try {
            const quote = await fetchStockQuote(symbol);
            replyText = await analyzeStockWithAI({
              symbol,
              quote,
              userQuestion: question,
            });
          } catch {
            const quote2 = await fetchStockQuote(symbol).catch(() => null);
            const price = quote2?.price ?? 0;
            const change = quote2?.changePercent ?? 0;
            replyText = `🔍 **${symbol.replace(".IS", "")}** ${change >= 0 ? "📈" : "📉"}\n\nCanlı Fiyat: **₺${price}**\nDeğişim: %${change.toFixed(2)}\n\n⚠️ AI analizi şu an kullanılamıyor.`;
          }
        }
      } else {
        replyText = t.aichat_parse_failed;
      }

      addBotMsg(setMessages, lang, { text: replyText });
    } catch (e) {
      // ── Catch → fallback ─────────────────────────────────────────────────
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
          replyText = t.aichat_fallback_added_note.replace(
            "{type_label}",
            typeLabel,
          );
        } else if (localParsed.action === "create_task" && localParsed.text) {
          await onAddTodo(localParsed.text, "none", localParsed.date);
          await onManualSync();
          replyText = t.aichat_fallback_added_task
            .replace("{task_text}", localParsed.text)
            .replace(
              "{date_part}",
              localParsed.date ? ` (${localParsed.date})` : "",
            );
        } else if (
          localParsed.action === "ask_stock" &&
          localParsed.stockQuery
        ) {
          try {
            const quote = await fetchStockQuote(localParsed.stockQuery.symbol);
            replyText = await analyzeStockWithAI({
              symbol: localParsed.stockQuery.symbol,
              quote,
              userQuestion: localParsed.stockQuery.question,
            });
          } catch {
            const q = await fetchStockQuote(
              localParsed.stockQuery.symbol,
            ).catch(() => null);
            const price = q?.price ?? 0;
            const change = q?.changePercent ?? 0;
            replyText = `🔍 **${localParsed.stockQuery.symbol.replace(".IS", "")}** ${change >= 0 ? "📈" : "📉"}\n\nCanlı Fiyat: **₺${price}**\nDeğişim: %${change.toFixed(2)}`;
          }
        }
      } else {
        const errorMsg = e instanceof Error ? e.message : String(e);
        replyText = t.aichat_connection_error.replace("{error_msg}", errorMsg);
      }

      addBotMsg(setMessages, lang, { text: replyText });
    }
  };

  // ─── Toggle Thinking ─────────────────────────────────────────────────────
  const handleToggleThinking = (idx: number) => {
    setOpenThinkingIndexes((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return {
    messages,
    isBotTyping,
    enableWebSearch,
    openThinkingIndexes,
    handleSendMessage,
    handleToggleThinking,
    setOpenThinkingIndexes,
    setEnableWebSearch,
  };
}

import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import type { Todo } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/types/types.js";
import type { MessageItemData } from "./AiChatMessageItem.js";
import type {
  ChatAttachment,
  ChatSession,
  ChatSessionMessage,
  ClarificationRequest,
  QueuedMessage,
} from "@/services/aichat/types.js";
import { processUploadedFile } from "@/services/aichat/fileAttachmentService.js";
import {
  getChatSessionRepository,
  generateSessionTitle,
  exportSessionAsMarkdown,
  downloadTextFile,
} from "@/services/aichat/chatSessionService.js";
import { parseLocalCommand } from "@/utils/aiCommandParser.js";
import {
  callAIConfigured,
  executeAIAction,
} from "@/services/aichat/index.js";
import { fetchStockQuote } from "@/services/bistService.js";
import { logger } from "@/utils/logger.js";
import { buildLocalReply } from "./localReplyBuilder.js";

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
  attachments: ChatAttachment[];
  sessions: ChatSession[];
  currentSessionId: string;
  isHistoryOpen: boolean;
  deleteConfirmSessionId: string | null;
  openThinkingIndexes: Record<number, boolean>;
  messageQueue: QueuedMessage[];
  handleRemoveQueuedMessage: (id: string) => void;
  handleClearQueue: () => void;
  setIsHistoryOpen: (open: boolean) => void;
  setDeleteConfirmSessionId: (id: string | null) => void;
  handleSendMessage: (textToSend?: string) => Promise<void>;
  handleAddFiles: (files: FileList | File[]) => Promise<void>;
  handleRemoveAttachment: (id: string) => void;
  handleToggleThinking: (idx: number) => void;
  handleNewChat: () => void;
  handleSwitchSession: (session: ChatSession) => void;
  handleRequestDeleteSession: (sessionId: string) => void;
  handleConfirmDeleteSession: () => void;
  handleRenameSession: (sessionId: string, newTitle: string) => void;
  handleExportCurrentChat: () => void;
  handleResolveClarification: (idx: number, answer: string) => void;
  handleCancelClarification: (idx: number) => void;
  setOpenThinkingIndexes: (
    fn: (prev: Record<number, boolean>) => Record<number, boolean>,
  ) => void;
  setEnableWebSearch: (fn: (prev: boolean) => boolean) => void;
}

function createNewNewtabSession(): ChatSession {
  const now = Date.now();
  return {
    id: `newtab_${now}_${Math.random().toString(36).slice(2, 7)}`,
    scope: "newtab",
    title: "Yeni Sohbet",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
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
  const repo = getChatSessionRepository();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession>(() =>
    createNewNewtabSession(),
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [deleteConfirmSessionId, setDeleteConfirmSessionId] = useState<string | null>(null);

  const [isBotTyping, setIsBotTyping] = useState(false);
  const [enableWebSearch, setEnableWebSearch] = useState(true);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [openThinkingIndexes, setOpenThinkingIndexes] = useState<
    Record<number, boolean>
  >({});

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load all newtab sessions
  const refreshSessions = useCallback(async () => {
    const all = await repo.getAllSessions("newtab");
    setSessions(all);
  }, [repo]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  // Convert ChatSession.messages <-> MessageItemData[]
  const messages: MessageItemData[] = currentSession.messages.map((m) => ({
    sender: m.role === "user" ? "user" : "bot",
    text: m.content,
    time: m.timestamp,
    attachments: m.attachments,
    thinking: m.thinking,
    searchQuery: m.searchQuery,
    sources: m.sources,
    clarification: m.clarification,
  }));

  const setMessages = (
    updater: MessageItemData[] | ((prev: MessageItemData[]) => MessageItemData[]),
  ) => {
    setCurrentSession((prev) => {
      const prevUiMsgs: MessageItemData[] = prev.messages.map((m) => ({
        sender: m.role === "user" ? "user" : "bot",
        text: m.content,
        time: m.timestamp,
        attachments: m.attachments,
        thinking: m.thinking,
        searchQuery: m.searchQuery,
        sources: m.sources,
        clarification: m.clarification,
      }));

      const nextUiMsgs =
        typeof updater === "function" ? updater(prevUiMsgs) : updater;

      let title = prev.title;
      // Auto-title on first user message
      if (
        (title === "Yeni Sohbet" || !title) &&
        nextUiMsgs.length > 0 &&
        nextUiMsgs[0].sender === "user"
      ) {
        title = generateSessionTitle(nextUiMsgs[0].text);
      }

      const nextSessionMsgs: ChatSessionMessage[] = nextUiMsgs.map((m, idx) => ({
        id: `msg_${idx}_${Date.now()}`,
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
        timestamp: m.time,
        attachments: m.attachments,
        thinking: m.thinking,
        searchQuery: m.searchQuery,
        sources: m.sources,
        clarification: m.clarification,
      }));

      const updated: ChatSession = {
        ...prev,
        title,
        updatedAt: Date.now(),
        messages: nextSessionMsgs,
      };

      repo.saveSession(updated).then(() => refreshSessions());
      return updated;
    });
  };

  const handleAddFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    try {
      const processed = await Promise.all(
        fileList.map((f) => processUploadedFile(f)),
      );
      setAttachments((prev) => [...prev, ...processed]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error("File upload error in AIChatView:", err);
      alert(msg);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Safe New Chat
  const handleNewChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsBotTyping(false);
    const fresh = createNewNewtabSession();
    setCurrentSession(fresh);
  };

  // Safe Switch Session
  const handleSwitchSession = (session: ChatSession) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsBotTyping(false);
    setCurrentSession(session);
  };

  // Delete Session
  const handleRequestDeleteSession = (sessionId: string) => {
    setDeleteConfirmSessionId(sessionId);
  };

  const handleConfirmDeleteSession = async () => {
    if (deleteConfirmSessionId) {
      await repo.deleteSession(deleteConfirmSessionId);
      if (currentSession.id === deleteConfirmSessionId) {
        handleNewChat();
      }
      setDeleteConfirmSessionId(null);
      await refreshSessions();
    }
  };

  // Rename Session
  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    await repo.renameSession(sessionId, newTitle);
    if (currentSession.id === sessionId) {
      setCurrentSession((prev) => ({ ...prev, title: newTitle }));
    }
    await refreshSessions();
  };

  // Export Chat
  const handleExportCurrentChat = () => {
    if (!currentSession) {
      return;
    }
    const md = exportSessionAsMarkdown(currentSession);
    const safeTitle = currentSession.title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    downloadTextFile(`lifeos_chat_${safeTitle}_${Date.now()}.md`, md);
  };

  // Initialize welcome message (and check for pending stock from BIST analysis)
  useEffect(() => {
    if (currentSession.messages.length > 0) {
      return;
    }
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

  const [messageQueue, setMessageQueue] = useState<QueuedMessage[]>([]);
  const messageQueueRef = useRef<QueuedMessage[]>([]);
  messageQueueRef.current = messageQueue;
  const isBotTypingRef = useRef<boolean>(false);
  isBotTypingRef.current = isBotTyping;

  const handleRemoveQueuedMessage = (id: string) => {
    setMessageQueue((prev) => prev.filter((q) => q.id !== id));
  };

  const handleClearQueue = () => {
    setMessageQueue([]);
  };

  const processNextInQueue = () => {
    if (messageQueueRef.current.length === 0) {
      return;
    }
    const nextItem = messageQueueRef.current[0];
    setMessageQueue((prev) => prev.slice(1));
    setTimeout(() => {
      executeChatMessage(nextItem.text, nextItem.attachments || []);
    }, 60);
  };

  // ─── Handle Send Message ────────────────────────────────────────────────
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || "").trim();
    const currentAttachments = [...attachments];

    if (!query && currentAttachments.length === 0) {
      return;
    }

    setAttachments([]);

    // If bot is already processing, queue the message
    if (isBotTypingRef.current) {
      const qItem: QueuedMessage = {
        id: `queue_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        text:
          query ||
          (currentAttachments.length > 0
            ? "Ekli dosyaları analiz et."
            : ""),
        timestamp: new Date().toLocaleTimeString(
          lang === "tr" ? "tr-TR" : "en-US",
          { hour: "2-digit", minute: "2-digit" },
        ),
        attachments:
          currentAttachments.length > 0 ? currentAttachments : undefined,
      };
      setMessageQueue((prev) => [...prev, qItem]);
      return;
    }

    await executeChatMessage(query, currentAttachments);
  };

  const executeChatMessage = async (
    query: string,
    currentAttachments: ChatAttachment[] = [],
  ) => {
    setIsBotTyping(true);
    isBotTypingRef.current = true;
    let pendingClarification: ClarificationRequest | undefined = undefined;

    const time = new Date().toLocaleTimeString(
      lang === "tr" ? "tr-TR" : "en-US",
      { hour: "2-digit", minute: "2-digit" },
    );

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text:
          query ||
          (currentAttachments.length > 0
            ? "Ekli dosyaları analiz et."
            : ""),
        time,
        attachments:
          currentAttachments.length > 0 ? currentAttachments : undefined,
      },
    ]);

    abortControllerRef.current = new AbortController();

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
            attachments: currentAttachments,
            conversationHistory,
            signal: abortControllerRef.current.signal,
            onChunk: (accumulated) => {
              setIsBotTyping(false);
              const cleanText = accumulated
                .replace(/<think>[\s\S]*?<\/think>/gi, "")
                .replace(/```json[\s\S]*?```/gi, "")
                .trimStart();

              setMessages((prev) => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.sender === "bot" && lastMsg.isStreaming) {
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMsg, text: cleanText },
                  ];
                }
                return [
                  ...prev,
                  {
                    sender: "bot",
                    text: cleanText,
                    time: new Date().toLocaleTimeString(
                      lang === "tr" ? "tr-TR" : "en-US",
                      { hour: "2-digit", minute: "2-digit" },
                    ),
                    isStreaming: true,
                  },
                ];
              });
            },
          });

          if (aiResponse.clarification && !aiResponse.clarification.resolved) {
            pendingClarification = aiResponse.clarification;
          }

          setIsBotTyping(false);
          setMessages((prev) => prev.filter((m) => !m.isStreaming));
          addBotMsg(setMessages, lang, {
            text: aiResponse.reply,
            thinking: aiResponse.thinking,
            searchQuery: aiResponse.searchQuery,
            sources: aiResponse.sources,
            clarification: aiResponse.clarification,
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
          userPrompt: query || "Ekli dosyaları incele ve açıkla.",
          aiProvider,
          aiApiKey,
          aiModel,
          aiEndpoint,
          enableWebSearch,
          attachments: currentAttachments,
          conversationHistory,
          signal: abortControllerRef.current.signal,
          onChunk: (accumulated) => {
            setIsBotTyping(false);
            const cleanText = accumulated
              .replace(/<think>[\s\S]*?<\/think>/gi, "")
              .replace(/```json[\s\S]*?```/gi, "")
              .trimStart();

            setMessages((prev) => {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg && lastMsg.sender === "bot" && lastMsg.isStreaming) {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMsg, text: cleanText },
                ];
              }
              return [
                ...prev,
                {
                  sender: "bot",
                  text: cleanText,
                  time: new Date().toLocaleTimeString(
                    lang === "tr" ? "tr-TR" : "en-US",
                    { hour: "2-digit", minute: "2-digit" },
                  ),
                  isStreaming: true,
                },
              ];
            });
          },
        });

        if (aiResponse.action) {
          await executeAIAction(aiResponse, lang);
          if (aiResponse.action === "create_task") {
            await onManualSync();
          }
        }

        if (aiResponse.clarification && !aiResponse.clarification.resolved) {
          pendingClarification = aiResponse.clarification;
        }

        setIsBotTyping(false);
        setMessages((prev) => prev.filter((m) => !m.isStreaming));
        addBotMsg(setMessages, lang, {
          text: aiResponse.reply,
          thinking: aiResponse.thinking,
          searchQuery: aiResponse.searchQuery,
          sources: aiResponse.sources,
          clarification: aiResponse.clarification,
        });
        return;
      }

      // ── Local Fallback Mode ───────────────────────────────────────────────
      const replyText = await buildLocalReply(query, {
        t,
        lang,
        onAddTodo,
        onManualSync,
      });
      setIsBotTyping(false);
      addBotMsg(setMessages, lang, { text: replyText });
    } catch (e: unknown) {
      if ((e as Error)?.name === "AbortError") {
        logger.info("Newtab AI Chat request aborted safely.");
        return;
      }
      setIsBotTyping(false);
      const replyText = await buildLocalReply(
        query,
        {
          t,
          lang,
          onAddTodo,
          onManualSync,
        },
        true,
      );
      if (replyText) {
        addBotMsg(setMessages, lang, { text: replyText });
      } else {
        const errorMsg = e instanceof Error ? e.message : String(e);
        addBotMsg(setMessages, lang, {
          text: t.aichat_connection_error.replace("{error_msg}", errorMsg),
        });
      }
    } finally {
      setIsBotTyping(false);
      isBotTypingRef.current = false;
      abortControllerRef.current = null;
      if (!pendingClarification) {
        processNextInQueue();
      }
    }
  };

  // ─── Toggle Thinking ─────────────────────────────────────────────────────
  const handleToggleThinking = (idx: number) => {
    setOpenThinkingIndexes((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // ─── Clarification Handlers ──────────────────────────────────────────────
  const handleResolveClarification = (idx: number, answer: string) => {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === idx && msg.clarification
          ? {
              ...msg,
              clarification: {
                ...msg.clarification,
                resolved: true,
                selectedAnswer: answer,
              },
            }
          : msg,
      ),
    );
    handleSendMessage(answer);
  };

  const handleCancelClarification = (idx: number) => {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === idx && msg.clarification
          ? {
              ...msg,
              clarification: {
                ...msg.clarification,
                resolved: true,
                selectedAnswer: "İptal Edildi",
              },
            }
          : msg,
      ),
    );
  };

  return {
    messages,
    isBotTyping,
    enableWebSearch,
    attachments,
    sessions,
    currentSessionId: currentSession.id,
    isHistoryOpen,
    deleteConfirmSessionId,
    openThinkingIndexes,
    messageQueue,
    handleRemoveQueuedMessage,
    handleClearQueue,
    setIsHistoryOpen,
    setDeleteConfirmSessionId,
    handleSendMessage,
    handleAddFiles,
    handleRemoveAttachment,
    handleToggleThinking,
    handleNewChat,
    handleSwitchSession,
    handleRequestDeleteSession,
    handleConfirmDeleteSession,
    handleRenameSession,
    handleExportCurrentChat,
    handleResolveClarification,
    handleCancelClarification,
    setOpenThinkingIndexes,
    setEnableWebSearch,
  };
}

import { useState, useEffect, useRef } from "preact/hooks";
import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { PageContext } from "@/content/agent/domAgentEngine.js";
import {
  getAIConfigFromStorage,
  handleUpdateMemoryFromAI,
} from "@/services/aichat/index.js";
import type {
  ChatAttachment,
  ChatSession,
  ClarificationRequest,
  ClarificationOption,
  QueuedMessage,
} from "@/services/aichat/types.js";
import {
  processUploadedFile,
  extractDocumentContext,
  formatFileSize,
} from "@/services/aichat/fileAttachmentService.js";
import {
  exportSessionAsMarkdown,
  downloadTextFile,
} from "@/services/aichat/chatSessionService.js";
import {
  detectNeedsWebSearch,
  executeWebSearch,
} from "@/services/webSearchAgent.js";
import { formatActionExecutionSummary } from "@/services/agentToolService.js";
import { logger } from "@/utils/logger.js";
import { ChatMessage } from "./ChatMessage.js";
import { useChatSession } from "./useChatSession.js";
import { useVoiceInput } from "./useVoiceInput.js";
import { useAgentBridge } from "./useAgentBridge.js";

export interface UseSidePanelChatReturn {
  t: Record<string, string>;
  lang: Language;
  messages: ChatMessage[];
  inputText: string;
  isProcessing: boolean;
  agentStatus: string | null;
  pageContext: PageContext | null;
  isListening: boolean;
  isYoutube: boolean;
  attachments: ChatAttachment[];
  enableWebSearch: boolean;
  sessions: ChatSession[];
  currentSessionId: string;
  isHistoryOpen: boolean;
  deleteConfirmSessionId: string | null;
  messagesEndRef: { current: HTMLDivElement | null };
  setInputText: (v: string) => void;
  setIsHistoryOpen: (open: boolean) => void;
  setDeleteConfirmSessionId: (id: string | null) => void;
  toggleVoiceInput: () => void;
  refreshPageContext: () => void;
  handleNewChat: () => void;
  handleSendMessage: (promptOverride?: string) => Promise<void>;
  handleAddFiles: (files: FileList | File[]) => Promise<void>;
  handleRemoveAttachment: (id: string) => void;
  handleToggleWebSearch: () => void;
  handleSwitchSession: (session: ChatSession) => void;
  handleRequestDeleteSession: (sessionId: string) => void;
  handleConfirmDeleteSession: () => void;
  handleRenameSession: (sessionId: string, newTitle: string) => void;
  handleExportCurrentChat: () => void;
  handleResolveClarification: (messageId: string, answer: string) => void;
  handleCancelClarification: (messageId: string) => void;
  messageQueue: QueuedMessage[];
  handleRemoveQueuedMessage: (id: string) => void;
  handleClearQueue: () => void;
  handleChipClick: (
    type:
      | "summarize"
      | "key_takeaways"
      | "ask"
      | "extract"
      | "yt_summarize"
      | "yt_quiz",
  ) => void;
}

export function useSidePanelChat(): UseSidePanelChatReturn {
  const [lang, setLang] = useState<Language>("tr");
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [enableWebSearch, setEnableWebSearch] = useState<boolean>(true);
  const [deleteConfirmSessionId, setDeleteConfirmSessionId] = useState<string | null>(null);
  const [messageQueue, setMessageQueue] = useState<QueuedMessage[]>([]);
  const messageQueueRef = useRef<QueuedMessage[]>([]);
  messageQueueRef.current = messageQueue;
  const isProcessingRef = useRef<boolean>(false);
  isProcessingRef.current = isProcessing;

  const abortControllerRef = useRef<AbortController | null>(null);

  const t = getTranslation(lang);

  // inputText ref: useVoiceInput needs getter, not setter callback pattern
  const inputTextRef = useRef(inputText);
  inputTextRef.current = inputText;

  /* ---- Oturum yönetimi alt-hook ---- */
  const {
    messages,
    currentSession,
    currentSessionId,
    sessions,
    isHistoryOpen,
    setIsHistoryOpen,
    setMessages,
    messagesEndRef,
    newChat,
    switchSession,
    deleteSession,
    renameSession,
    loadSession,
  } = useChatSession();

  /* ---- Ses tanıma alt-hook ---- */
  const { isListening, toggleVoiceInput } = useVoiceInput(
    lang,
    t,
    setInputText,
    () => inputTextRef.current,
  );

  /* ---- Agent köprüsü alt-hook (sayfa context + sekme dinleyicileri) ---- */
  const {
    agentStatus,
    setAgentStatus,
    pageContext,
    setPageContext,
    refreshPageContext,
  } = useAgentBridge(t, loadSession, setLang);

  /* ---- Auto-prompt listener ---- */
  useEffect(() => {
    const copilotAutoPromptListener = (msg: {
      type?: string;
      prompt?: string;
    }) => {
      if (msg && msg.type === "copilot_auto_prompt" && msg.prompt) {
        handleSendMessage(msg.prompt);
      }
    };
    chrome.runtime.onMessage.addListener(copilotAutoPromptListener);
    return () => {
      chrome.runtime.onMessage.removeListener(copilotAutoPromptListener);
    };
  }, []);

  const handleNewChatSafe = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsProcessing(false);
    setAgentStatus(null);
    newChat();
  };

  const handleSwitchSessionSafe = (session: ChatSession) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsProcessing(false);
    setAgentStatus(null);
    switchSession(session);
  };

  const handleRequestDeleteSession = (sessionId: string) => {
    setDeleteConfirmSessionId(sessionId);
  };

  const handleConfirmDeleteSession = async () => {
    if (deleteConfirmSessionId) {
      await deleteSession(deleteConfirmSessionId);
      setDeleteConfirmSessionId(null);
    }
  };

  const handleExportCurrentChat = () => {
    if (!currentSession) {
      return;
    }
    const md = exportSessionAsMarkdown(currentSession);
    const safeTitle = currentSession.title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    downloadTextFile(`lifeos_chat_${safeTitle}_${Date.now()}.md`, md);
  };

  /* ---- Dosya & Arama Yönetimi ---- */
  const handleAddFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    try {
      const processed = await Promise.all(
        fileList.map((f) => processUploadedFile(f)),
      );
      setAttachments((prev) => [...prev, ...processed]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error("File upload error in sidepanel:", err);
      alert(msg);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleWebSearch = () => {
    setEnableWebSearch((prev) => !prev);
  };

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

  const handleSendMessage = async (promptOverride?: string) => {
    const textToSend = (promptOverride || inputText).trim();
    const currentAttachments = [...attachments];

    if (!textToSend && currentAttachments.length === 0) {
      return;
    }

    if (!promptOverride) {
      setInputText("");
    }
    setAttachments([]);

    if (isProcessingRef.current) {
      const qItem: QueuedMessage = {
        id: `queue_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        text:
          textToSend ||
          (currentAttachments.length > 0 ? "Ekli dosyayı analiz et." : ""),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        attachments:
          currentAttachments.length > 0 ? currentAttachments : undefined,
      };
      setMessageQueue((prev) => [...prev, qItem]);
      return;
    }

    await executeChatMessage(textToSend, currentAttachments);
  };

  const executeChatMessage = async (
    textToSend: string,
    currentAttachments: ChatAttachment[] = [],
  ) => {
    setIsProcessing(true);
    isProcessingRef.current = true;
    let pendingClarification: ClarificationRequest | undefined = undefined;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content:
        textToSend ||
        (currentAttachments.length > 0 ? "Ekli dosyayı analiz et." : ""),
      attachments:
        currentAttachments.length > 0 ? currentAttachments : undefined,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setAgentStatus(t.agent_thinking);

    let activeCtx = pageContext;
    if (!activeCtx || !activeCtx.pageText || activeCtx.pageText.length === 0) {
      activeCtx = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: "get_active_tab_context" },
          (res) => {
            if (res && res.context) {
              setPageContext(res.context);
              resolve(res.context);
            } else {
              resolve(pageContext);
            }
          },
        );
      });
    }

    const aiConfig = await getAIConfigFromStorage();
    const apiKey = aiConfig.aiApiKey;
    const provider = aiConfig.aiProvider;
    const model = aiConfig.aiModel;
    const rawEndpoint = aiConfig.aiEndpoint;

    const userMemory: string = await new Promise<string>((r) =>
      chrome.storage.local.get(
        ["aiUserMemory"],
        (res: { aiUserMemory?: string }) =>
          r(typeof res?.aiUserMemory === "string" ? res.aiUserMemory : ""),
      ),
    );

    let webSearchSnippet = "";
    if (enableWebSearch && textToSend && detectNeedsWebSearch(textToSend)) {
      setAgentStatus("Web aranıyor...");
      try {
        const searchData = await executeWebSearch(textToSend);
        if (searchData && searchData.sources.length > 0) {
          webSearchSnippet =
            `\n\n[Canlı Web Arama Sonuçları: "${searchData.query}"]\n` +
            searchData.sources
              .slice(0, 4)
              .map(
                (s, i) =>
                  `[${i + 1}] ${s.title} (${s.url})\n${s.snippet}`,
              )
              .join("\n\n") +
            "\n[Web Arama Sonu]\n";
        }
      } catch (err) {
        logger.warn("Web search error in sidepanel:", err);
      }
    }

    const currentContextText = activeCtx ? activeCtx.pageText : "";
    const currentTitle = activeCtx ? activeCtx.title : "";
    const currentUrl = activeCtx ? activeCtx.url : "";
    const currentInteractiveElements =
      activeCtx && activeCtx.interactiveElements
        ? JSON.stringify(activeCtx.interactiveElements.slice(0, 50))
        : "[]";

    const docContext = extractDocumentContext(currentAttachments);

    const systemPrompt = `You are Life OS Web Agent & Copilot embedded in Chrome Side Panel for active tab:
Title: "${currentTitle}"
URL: "${currentUrl}"

User Personal Memory (memory.md):
"${userMemory || "No memory provided."}"

Active Page Content Excerpt:
"${currentContextText.slice(0, 4000)}"

Interactive Form & Input Elements on Active Page:
${currentInteractiveElements}
${docContext ? `\n\nEkli Belgeler ve Dosyalar:\n${docContext}` : ""}
${webSearchSnippet ? `\n\n${webSearchSnippet}` : ""}

INSTRUCTIONS FOR FORM FILLING, REGISTRATION & WEB ACTIONS:
If the user asks to fill a form, register, or sign up on a website/forum (e.g. "Formu doldur", "Kayıt ol", "Üye ol", "Bu siteye kayıt ol", "Sign up"), match input field labels/placeholders (Username, Email, Full Name, Bio, Occupation) on the active page against the user's personal memory (memory.md).
Return a JSON array of actions in markdown code block at the end:
\`\`\`json
[
  {
    "actionType": "type",
    "selector": "input[name='username']",
    "targetText": "Kullanıcı Adı",
    "textValue": "HalilEmre"
  }
]
\`\`\`

INSTRUCTIONS FOR SAVING / UPDATING PERSONAL MEMORY (memory.md):
If the user asks to save, add, or remember a fact/email/detail about them (e.g. "hafızana mail adresimi ekle", "e-postamı kaydet", "beni hatırla", "hafızayı güncelle"), format a JSON code block in your response:
\`\`\`json
{
  "action": "update_memory",
  "memory_fact": "E-posta: halilemrekuyupinar@proton.me"
}
\`\`\`

Answer the user clearly, professionally, and concisely in ${t.answer_language}. Do not use low-quality emojis in output formatting.`;

    try {
      let responseText = "";

      if (provider === "gemini") {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const userParts: Array<Record<string, unknown>> = [
          { text: systemPrompt },
          { text: `User request: ${textToSend || "Ekli dosyayı incele."}` },
        ];

        if (currentAttachments.length > 0) {
          for (const att of currentAttachments) {
            if (att.dataUrl && (att.type === "image" || att.type === "pdf")) {
              const base64Data = att.dataUrl.includes(",")
                ? att.dataUrl.split(",")[1]
                : att.dataUrl;
              userParts.push({
                inlineData: {
                  mimeType: att.mimeType,
                  data: base64Data,
                },
              });
            } else if (att.textContent) {
              userParts.push({
                text: `\n[Eklenen Belge: "${att.name}" (${formatFileSize(att.size)})]\n${att.textContent}\n`,
              });
            }
          }
        }

        const reqBody = {
          contents: [{ role: "user", parts: userParts }],
        };

        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqBody),
          signal: abortControllerRef.current?.signal,
        });

        if (!resp.ok) {
          throw new Error(`Gemini API returned status ${resp.status}`);
        }

        const data = await resp.json();
        responseText =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No response text received from Gemini.";
      } else {
        const endpoint =
          rawEndpoint && rawEndpoint.trim()
            ? rawEndpoint.trim().replace(/\/+$/, "")
            : "https://api.openai.com/v1";

        const resp = await fetch(`${endpoint}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify({
            model: model || "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content:
                  textToSend ||
                  (currentAttachments.length > 0
                    ? "Ekli belgeleri analiz et."
                    : ""),
              },
            ],
          }),
          signal: abortControllerRef.current?.signal,
        });

        if (!resp.ok) {
          throw new Error(`API returned status ${resp.status}`);
        }

        const data = await resp.json();
        responseText =
          data.choices?.[0]?.message?.content ||
          data.choices?.[0]?.text ||
          "No response received.";
      }

      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      let finalContent = responseText;
      let clarificationObj: ClarificationRequest | undefined = undefined;
      const assistantMsgId = (Date.now() + 1).toString();

      if (jsonMatch && jsonMatch[1]) {
        try {
          const actionPayload = JSON.parse(jsonMatch[1]);

          if (
            !Array.isArray(actionPayload) &&
            actionPayload.action === "clarification"
          ) {
            const q = String(
              actionPayload.params?.question ||
                actionPayload.question ||
                "Lütfen seçiminizi yapın:",
            );
            const opts = (actionPayload.params?.options ||
              actionPayload.options ||
              []) as Array<string | ClarificationOption>;
            const allowFreeText =
              actionPayload.params?.allowFreeText !== undefined
                ? Boolean(actionPayload.params.allowFreeText)
                : true;
            clarificationObj = {
              id: `clarify_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              question: q,
              options: opts,
              allowFreeText,
              context:
                typeof actionPayload.params?.context === "string"
                  ? actionPayload.params.context
                  : undefined,
              resolved: false,
            };
            finalContent =
              responseText.replace(/```json[\s\S]*?```/, "").trim() || q;
          } else if (
            !Array.isArray(actionPayload) &&
            actionPayload.action === "update_memory" &&
            actionPayload.memory_fact
          ) {
            await handleUpdateMemoryFromAI(actionPayload.memory_fact);
            finalContent = responseText
              .replace(/```json[\s\S]*?```/, "")
              .trim();
            finalContent += `\n\n_🧠 Hafıza Güncellendi: "${actionPayload.memory_fact}"_`;
          } else if (Array.isArray(actionPayload)) {
            const count = actionPayload.length;
            const actionSummary = formatActionExecutionSummary(
              actionPayload,
              lang,
            );

            setAgentStatus(
              t.executing_actions.replace("{count}", String(count)),
            );

            let cleanPromptResponse = responseText
              .replace(/```json[\s\S]*?```/gi, "")
              .replace(
                /Aşağıda\s*\*+memory\.md\*+[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi,
                "",
              )
              .replace(
                /⚠️\s*\*+Formda zorunlu olan alanlar[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi,
                "",
              )
              .trim();

            if (!cleanPromptResponse || cleanPromptResponse.length < 5) {
              cleanPromptResponse = actionSummary;
            } else {
              cleanPromptResponse = `${cleanPromptResponse}\n\n${actionSummary}`;
            }

            finalContent = cleanPromptResponse;

            chrome.runtime.sendMessage(
              { type: "execute_agent_action", payload: actionPayload },
              (actRes) => {
                setAgentStatus(null);
                if (actRes && actRes.success) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId
                        ? { ...msg, content: cleanPromptResponse }
                        : msg,
                    ),
                  );
                }
              },
            );
          }
        } catch {
          /* Fallback */
        }
      } else {
        const emailMatch = textToSend.match(
          /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
        );
        if (
          (textToSend.toLowerCase().includes("hafıza") ||
            textToSend.toLowerCase().includes("mail")) &&
          emailMatch
        ) {
          await handleUpdateMemoryFromAI(`E-posta: ${emailMatch[1]}`);
        }
        setAgentStatus(null);
      }

      if (clarificationObj && !clarificationObj.resolved) {
        pendingClarification = clarificationObj;
      }

      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: finalContent,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        clarification: clarificationObj,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      setAgentStatus(null);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ ${t.failed_response}\nError: ${err instanceof Error ? err.message : "Unknown error"}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
      if (!pendingClarification) {
        processNextInQueue();
      }
    }
  };

  const isYoutube = !!pageContext?.url?.includes("youtube.com/watch");

  const handleChipClick = (
    type:
      | "summarize"
      | "key_takeaways"
      | "ask"
      | "extract"
      | "yt_summarize"
      | "yt_quiz",
  ) => {
    let prompt = "";
    if (type === "yt_summarize") {
      prompt = t.prompt_yt_summarize;
    } else if (type === "yt_quiz") {
      prompt = t.prompt_yt_quiz;
    } else if (type === "summarize") {
      prompt = t.prompt_summarize;
    } else if (type === "key_takeaways") {
      prompt = t.prompt_takeaways;
    } else if (type === "ask") {
      prompt = t.prompt_ask;
    } else if (type === "extract") {
      prompt = t.prompt_extract;
    }
    handleSendMessage(prompt);
  };

  const handleResolveClarification = (messageId: string, answer: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.clarification
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

  const handleCancelClarification = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.clarification
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
    t,
    lang,
    messages,
    inputText,
    isProcessing,
    agentStatus,
    pageContext,
    isListening,
    isYoutube,
    attachments,
    enableWebSearch,
    sessions,
    currentSessionId,
    isHistoryOpen,
    deleteConfirmSessionId,
    messagesEndRef,
    setInputText,
    setIsHistoryOpen,
    setDeleteConfirmSessionId,
    toggleVoiceInput,
    refreshPageContext,
    handleNewChat: handleNewChatSafe,
    handleSendMessage,
    handleAddFiles,
    handleRemoveAttachment,
    handleToggleWebSearch,
    handleSwitchSession: handleSwitchSessionSafe,
    handleRequestDeleteSession,
    handleConfirmDeleteSession,
    handleRenameSession: renameSession,
    handleExportCurrentChat,
    handleResolveClarification,
    handleCancelClarification,
    messageQueue,
    handleRemoveQueuedMessage,
    handleClearQueue,
    handleChipClick,
  };
}

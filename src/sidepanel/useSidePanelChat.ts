import { useState, useEffect, useRef } from "preact/hooks";
import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { PageContext } from "@/content/agent/domAgentEngine.js";
import {
  getAIConfigFromStorage,
  handleUpdateMemoryFromAI,
} from "@/services/aichat/index.js";
import { formatActionExecutionSummary } from "@/services/agentToolService.js";
import { ChatMessage } from "./ChatMessage.js";

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
  messagesEndRef: { current: HTMLDivElement | null };
  setInputText: (v: string) => void;
  toggleVoiceInput: () => void;
  refreshPageContext: () => void;
  handleNewChat: () => void;
  handleSendMessage: (promptOverride?: string) => Promise<void>;
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [pageContext, setPageContext] = useState<PageContext | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [activeSessionKey, setActiveSessionKey] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const t = getTranslation(lang);

  const toggleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(t.speech_not_supported);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === "tr" ? "tr-TR" : "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const refreshPageContext = () => {
    setAgentStatus(t.page_scanning);
    try {
      chrome.runtime.sendMessage(
        { type: "get_active_tab_context" },
        (response) => {
          setAgentStatus(null);
          if (chrome.runtime.lastError || !response) {
            return;
          }
          if (response.context) {
            const newCtx: PageContext = response.context;
            setPageContext(newCtx);

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              const activeTab = tabs[0];
              const groupId =
                activeTab &&
                activeTab.groupId !== undefined &&
                activeTab.groupId !== -1
                  ? activeTab.groupId
                  : null;
              const domain = newCtx.domain || "default";
              const tabId = activeTab ? activeTab.id : 0;

              // Unique key per Chrome Tab Group (or per domain tab)
              const sessionKey = groupId
                ? `copilot_chat_group_${groupId}`
                : `copilot_chat_domain_${domain}_${tabId}`;

              if (sessionKey !== activeSessionKey) {
                setActiveSessionKey(sessionKey);
                chrome.storage.local.get([sessionKey], (storeRes) => {
                  const savedMsgs = storeRes[sessionKey];
                  if (Array.isArray(savedMsgs)) {
                    setMessages(savedMsgs);
                  } else {
                    setMessages([]);
                  }
                });
              }
            });
          }
        },
      );
    } catch {
      setAgentStatus(null);
    }
  };

  // Load language settings & initial page context
  useEffect(() => {
    chrome.storage.sync.get(["lang", "autoGroupTabs"], (res) => {
      if (res.lang) {
        setLang(res.lang as Language);
      }
      // Group tab ONCE when sidepanel is opened
      if (res.autoGroupTabs !== false) {
        chrome.runtime.sendMessage({ type: "group_active_tab" });
      }
    });

    refreshPageContext();

    // Listen for tab activation and URL update changes to auto-sync context
    const tabActivatedListener = () => refreshPageContext();
    const tabUpdatedListener = (
      _tabId: number,
      changeInfo: { status?: string; title?: string; url?: string },
    ) => {
      if (
        changeInfo.status === "complete" ||
        changeInfo.title ||
        changeInfo.url
      ) {
        refreshPageContext();
      }
    };

    chrome.tabs.onActivated.addListener(tabActivatedListener);
    chrome.tabs.onUpdated.addListener(tabUpdatedListener);

    // Listen for automatic prompts from right-click context menus
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
      chrome.tabs.onActivated.removeListener(tabActivatedListener);
      chrome.tabs.onUpdated.removeListener(tabUpdatedListener);
      chrome.runtime.onMessage.removeListener(copilotAutoPromptListener);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // Persist messages for unique Tab Group session key
    if (activeSessionKey && messages.length > 0) {
      chrome.storage.local.set({ [activeSessionKey]: messages });
    }
  }, [messages, agentStatus, activeSessionKey]);

  const handleNewChat = () => {
    setMessages([]);
    if (activeSessionKey) {
      chrome.storage.local.remove([activeSessionKey]);
    }
  };

  const handleSendMessage = async (promptOverride?: string) => {
    const textToSend = (promptOverride || inputText).trim();
    if (!textToSend || isProcessing) {
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptOverride) {
      setInputText("");
    }
    setIsProcessing(true);
    setAgentStatus(t.agent_thinking);

    // On-the-fly fetch active tab context if empty
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

    // Fetch AI config settings via centralized single authoritative helper
    const aiConfig = await getAIConfigFromStorage();
    const apiKey = aiConfig.aiApiKey;
    const provider = aiConfig.aiProvider;
    const model = aiConfig.aiModel;
    const rawEndpoint = aiConfig.aiEndpoint;

    const userMemory: string = await new Promise<string>((r) =>
      chrome.storage.sync.get(["aiUserMemory"], (res: Record<string, any>) =>
        r(typeof res?.aiUserMemory === "string" ? res.aiUserMemory : ""),
      ),
    );

    const currentContextText = activeCtx ? activeCtx.pageText : "";
    const currentTitle = activeCtx ? activeCtx.title : "";
    const currentUrl = activeCtx ? activeCtx.url : "";
    const currentInteractiveElements =
      activeCtx && activeCtx.interactiveElements
        ? JSON.stringify(activeCtx.interactiveElements.slice(0, 50))
        : "[]";

    const systemPrompt = `You are Life OS Web Agent & Copilot embedded in Chrome Side Panel for active tab:
Title: "${currentTitle}"
URL: "${currentUrl}"

User Personal Memory (memory.md):
"${userMemory || "No memory provided."}"

Active Page Content Excerpt:
"${currentContextText.slice(0, 4000)}"

Interactive Form & Input Elements on Active Page:
${currentInteractiveElements}

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
        const reqBody = {
          contents: [
            {
              role: "user",
              parts: [
                { text: systemPrompt },
                { text: `User request: ${textToSend}` },
              ],
            },
          ],
        };

        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqBody),
        });

        if (!resp.ok) {
          throw new Error(`API returned status ${resp.status}`);
        }

        const data = await resp.json();
        responseText =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No response received.";
      } else {
        // 9Router, OpenRouter, Custom OpenAI-compatible endpoints
        const baseUrl = rawEndpoint.replace(/\/+$/, "");
        const targetEndpoint = baseUrl.endsWith("/chat/completions")
          ? baseUrl
          : `${baseUrl}/chat/completions`;

        const reqHeaders: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (apiKey) {
          reqHeaders["Authorization"] = `Bearer ${apiKey}`;
        }

        const resp = await fetch(targetEndpoint, {
          method: "POST",
          headers: reqHeaders,
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: textToSend },
            ],
          }),
        });

        if (!resp.ok) {
          throw new Error(`API returned status ${resp.status}`);
        }

        const rawBody = await resp.text();
        let data: Record<string, any> = {};
        try {
          data = JSON.parse(rawBody);
        } catch {
          const jsonBlockMatch = rawBody.match(/\{[\s\S]*\}/);
          if (jsonBlockMatch) {
            try {
              data = JSON.parse(jsonBlockMatch[0]);
            } catch {
              data = {};
            }
          }
        }

        responseText =
          data.choices?.[0]?.message?.content ||
          data.choices?.[0]?.text ||
          (typeof data === "string" ? data : rawBody.slice(0, 2000)) ||
          "No response received.";
      }

      // Check for JSON action code block in response
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      let finalContent = responseText;

      if (jsonMatch && jsonMatch[1]) {
        try {
          const actionPayload = JSON.parse(jsonMatch[1]);

          // Handle Memory Update action directly
          if (
            !Array.isArray(actionPayload) &&
            actionPayload.action === "update_memory" &&
            actionPayload.memory_fact
          ) {
            await handleUpdateMemoryFromAI(actionPayload.memory_fact);
            finalContent = responseText
              .replace(/```json[\s\S]*?```/gi, "")
              .trim();
            if (!finalContent) {
              finalContent = t.memory_saved.replace(
                "{fact}",
                actionPayload.memory_fact,
              );
            }
          } else if (Array.isArray(actionPayload)) {
            // Handle dynamic Agent tool actions (clicks, typing, scroll, extract)
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
                        ? {
                            ...msg,
                            content: cleanPromptResponse,
                          }
                        : msg,
                    ),
                  );
                }
              },
            );
          }
        } catch {
          setAgentStatus(null);
        }
      } else {
        // Fallback: If user prompt asked to add email/memory but no JSON was generated, parse email directly
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

      const assistantMsgId = (Date.now() + 1).toString();
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: finalContent,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
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
    messagesEndRef,
    setInputText,
    toggleVoiceInput,
    refreshPageContext,
    handleNewChat,
    handleSendMessage,
    handleChipClick,
  };
}

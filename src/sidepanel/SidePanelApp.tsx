import { useState, useEffect, useRef } from "preact/hooks";
import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { PageContext, AgentActionPayload } from "@/content/agent/domAgentEngine.js";
import { getAIConfigFromStorage, handleUpdateMemoryFromAI, executeAIAction } from "@/services/aiChatService.js";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

/**
 * Robustly detects whether the active page contains personal registration/application form fields.
 */
function isPersonalFormPage(context: PageContext | null): boolean {
  if (!context || !context.interactiveElements || context.interactiveElements.length === 0) {
    return false;
  }

  // Keywords indicative of personal registration, application, or profile forms
  const personalKeywords = [
    "ad", "soyad", "name", "email", "e-posta", "mail", "tel", "phone", "telefon",
    "doğum", "birth", "tarih", "date", "adres", "address", "meslek", "job",
    "tckn", "tc", "şifre", "password", "kayıt", "register", "signup", "başvuru",
    "apply", "biyografi", "bio", "şehir", "city", "ülke", "country"
  ];

  const matchingFormInputs = context.interactiveElements.filter((el) => {
    if (el.tag !== "input" && el.tag !== "textarea" && el.tag !== "select") return false;
    
    const type = (el.type || "").toLowerCase();
    if (type === "hidden" || type === "checkbox" || type === "radio" || type === "submit" || type === "button" || type === "search") {
      return false;
    }

    const identifier = `${el.text || ""} ${el.label || ""} ${el.placeholder || ""} ${el.id || ""} ${el.className || ""}`.toLowerCase();
    
    // Ignore Wikipedia search bar, Google Search input, etc.
    if (identifier.includes("search") || identifier.includes("wiki")) return false;

    // Check if element label/placeholder/name matches any personal form field keyword
    return personalKeywords.some((kw) => identifier.includes(kw));
  });

  return matchingFormInputs.length >= 1;
}

export function SidePanelApp() {
  const [lang, setLang] = useState<Language>("tr");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [pageContext, setPageContext] = useState<PageContext | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const t = getTranslation(lang);

  const [activeSessionKey, setActiveSessionKey] = useState<string>("");

  // Load language settings & initial page context
  useEffect(() => {
    chrome.storage.sync.get(["lang", "autoGroupTabs"], (res) => {
      if (res.lang) setLang(res.lang as Language);
      // Group tab ONCE when sidepanel is opened
      if (res.autoGroupTabs !== false) {
        chrome.runtime.sendMessage({ type: "group_active_tab" });
      }
    });

    refreshPageContext();

    // Listen for tab activation and URL update changes to auto-sync context
    const tabActivatedListener = () => refreshPageContext();
    const tabUpdatedListener = (_tabId: number, changeInfo: { status?: string; title?: string; url?: string }) => {
      if (changeInfo.status === "complete" || changeInfo.title || changeInfo.url) {
        refreshPageContext();
      }
    };

    chrome.tabs.onActivated.addListener(tabActivatedListener);
    chrome.tabs.onUpdated.addListener(tabUpdatedListener);

    // Listen for automatic prompts from right-click context menus
    const copilotAutoPromptListener = (msg: any) => {
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

  const refreshPageContext = () => {
    setAgentStatus(lang === "tr" ? "Sayfa taranıyor..." : "Scanning page...");
    try {
      chrome.runtime.sendMessage({ type: "get_active_tab_context" }, (response) => {
        setAgentStatus(null);
        if (chrome.runtime.lastError || !response) {
          return;
        }
        if (response.context) {
          const newCtx: PageContext = response.context;
          setPageContext(newCtx);

          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            const groupId = activeTab && activeTab.groupId !== undefined && activeTab.groupId !== -1 ? activeTab.groupId : null;
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
      });
    } catch {
      setAgentStatus(null);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    if (activeSessionKey) {
      chrome.storage.local.remove([activeSessionKey]);
    }
  };

function SidePanelCopyBtn({ text, lang }: { text: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title={copied ? (lang === "tr" ? "Kopyalandı!" : "Copied!") : (lang === "tr" ? "Metni Kopyala" : "Copy text")}
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
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      <span>{copied ? (lang === "tr" ? "Kopyalandı" : "Copied") : (lang === "tr" ? "Kopyala" : "Copy")}</span>
    </button>
  );
}

  const handleSendMessage = async (promptOverride?: string) => {
    const textToSend = (promptOverride || inputText).trim();
    if (!textToSend || isProcessing) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptOverride) setInputText("");
    setIsProcessing(true);
    setAgentStatus(lang === "tr" ? "Yapay zeka yanıtlıyor..." : "AI Copilot thinking...");

    // On-the-fly fetch active tab context if empty
    let activeCtx = pageContext;
    if (!activeCtx || !activeCtx.pageText || activeCtx.pageText.length === 0) {
      activeCtx = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "get_active_tab_context" }, (res) => {
          if (res && res.context) {
            setPageContext(res.context);
            resolve(res.context);
          } else {
            resolve(pageContext);
          }
        });
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

Answer the user clearly, professionally, and concisely in ${lang === "tr" ? "Turkish" : "English"}. Do not use low-quality emojis in output formatting.`;

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
            responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
          } else {
            // 9Router, OpenRouter, Custom OpenAI-compatible endpoints
            const baseUrl = rawEndpoint.replace(/\/+$/, "");
            const targetEndpoint = baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl}/chat/completions`;
            
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
            let data: any = {};
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
              if (!Array.isArray(actionPayload) && actionPayload.action === "update_memory" && actionPayload.memory_fact) {
                await handleUpdateMemoryFromAI(actionPayload.memory_fact);
                finalContent = responseText.replace(/```json[\s\S]*?```/gi, "").trim();
                if (!finalContent) {
                  finalContent = lang === "tr"
                    ? `✓ "${actionPayload.memory_fact}" bilgisi kişisel hafızanıza (memory.md) eklendi.`
                    : `✓ "${actionPayload.memory_fact}" saved to personal memory (memory.md).`;
                }
              } else if (Array.isArray(actionPayload)) {
                // Handle Form filling array actions
                const count = actionPayload.length;
                setAgentStatus(
                  lang === "tr"
                    ? `Form aksiyonu yürütülüyor (${count} işlem)...`
                    : `Executing form action (${count} items)...`,
                );

                let cleanPromptResponse = responseText
                  .replace(/```json[\s\S]*?```/gi, "")
                  .replace(/Aşağıda\s*\*+memory\.md\*+[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi, "")
                  .replace(/⚠️\s*\*+Formda zorunlu olan alanlar[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi, "")
                  .trim();

                if (!cleanPromptResponse || cleanPromptResponse.length < 10) {
                  cleanPromptResponse = lang === "tr"
                    ? "✓ Sayfadaki form alanları kişisel hafızanızdaki (memory.md) bilgilerle otomatik olarak dolduruldu."
                    : "✓ Form fields on the page have been filled using your personal memory (memory.md).";
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
                                content: `${cleanPromptResponse}\n\n✓ *${
                                  lang === "tr"
                                    ? `${count} adet alan dolduruldu`
                                    : `${count} fields updated`
                                }*`,
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
            const emailMatch = textToSend.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
            if ((textToSend.toLowerCase().includes("hafıza") || textToSend.toLowerCase().includes("mail")) && emailMatch) {
              await handleUpdateMemoryFromAI(`E-posta: ${emailMatch[1]}`);
            }
            setAgentStatus(null);
          }

          const assistantMsgId = (Date.now() + 1).toString();
          const assistantMsg: ChatMessage = {
            id: assistantMsgId,
            role: "assistant",
            content: finalContent,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };

          setMessages((prev) => [...prev, assistantMsg]);
        } catch (err: any) {
          setAgentStatus(null);
          const errorMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `⚠️ ${lang === "tr" ? "Yanıt alınamadı. Lütfen Ayarlar'dan API Anahtarınızı kontrol edin." : "Failed to get response. Please check API Key in Settings."}\nError: ${err?.message || "Unknown error"}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, errorMsg]);
        } finally {
          setIsProcessing(false);
        }
  };

  const isYoutube = pageContext?.url?.includes("youtube.com/watch");

  const handleChipClick = (type: "summarize" | "key_takeaways" | "ask" | "extract" | "yt_summarize" | "yt_quiz") => {
    let prompt = "";
    if (type === "yt_summarize") {
      prompt = lang === "tr" ? "Bu YouTube videosunun alt yazılarını/transkriptini analiz et, 3 ana maddede özetle ve kilit zaman damgalarını çıkar." : "Summarize this YouTube video transcript and extract key timestamps.";
    } else if (type === "yt_quiz") {
      prompt = lang === "tr" ? "Bu YouTube videosunun içeriğini/transkriptini incele. Konuyu pekiştirmek için video içeriğinden 5 soruluk çoktan seçmeli (A, B, C, D seçenekli) soru testi oluştur ve en alt kısımda cevap anahtarı ile açıklamalarını ver." : "Create a 5-question multiple choice quiz with answer key based on this video.";
    } else if (type === "summarize") {
      prompt = lang === "tr" ? "Bu sayfayı 3 ana maddede özetle." : "Summarize this page in 3 key bullet points.";
    } else if (type === "key_takeaways") {
      prompt = lang === "tr" ? "Bu sayfadaki en önemli çıkarımları ve eylem maddelerini yaz." : "Extract key takeaways and action items from this page.";
    } else if (type === "ask") {
      prompt = lang === "tr" ? "Bu sayfa ne anlatıyor ve ne amaçla yazılmıştır?" : "What is this page about and what is its goal?";
    } else if (type === "extract") {
      prompt = lang === "tr" ? "Bu sayfadaki önemli veri veya listeleri çıkar." : "Extract important structured data or lists from this page.";
    }
    handleSendMessage(prompt);
  };

  return (
    <div className="sidepanel-container">
      {/* Header Bar */}
      <header className="sidepanel-header">
        <div className="sidepanel-header-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
          <span>Life OS Web Copilot</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={handleNewChat}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 9px",
              fontSize: "0.74rem",
              fontWeight: 600,
              borderRadius: "6px",
              color: "#a78bfa",
              background: "rgba(139, 92, 246, 0.15)",
              border: "1px solid rgba(139, 92, 246, 0.35)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            title={lang === "tr" ? "Yeni Sohbet Başlat" : "Start New Chat"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>{lang === "tr" ? "Yeni Sohbet" : "New Chat"}</span>
          </button>
          <span className="sidepanel-header-badge">AI Agent</span>
        </div>
      </header>

      {/* Active Tab Status Bar */}
      <div className="sidepanel-tab-status">
        <div className="sidepanel-tab-info">
          <span className="sidepanel-tab-title">{pageContext?.title || (lang === "tr" ? "Sayfa Yükleniyor..." : "Loading page...")}</span>
          <span className="sidepanel-tab-url">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
            </svg>
            {pageContext?.domain || pageContext?.url || ""}
          </span>
        </div>
        <button
          className="sidepanel-refresh-btn"
          onClick={refreshPageContext}
          title={lang === "tr" ? "Sayfayı Yeniden Tara" : "Rescan Page"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </button>
      </div>

      {/* Quick Action Chips with SVG Icons */}
      <div className="sidepanel-chips">
        {isYoutube && (
          <>
            <button
              className="sidepanel-chip"
              onClick={() => handleChipClick("yt_summarize")}
              style={{
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                color: "#ffffff",
                borderColor: "#8b5cf6",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              <span>{lang === "tr" ? "Videoyu Özetle" : "Summarize Video"}</span>
            </button>
            <button
              className="sidepanel-chip"
              onClick={() => handleChipClick("yt_quiz")}
              style={{
                background: "rgba(139, 92, 246, 0.15)",
                color: "#c084fc",
                borderColor: "rgba(139, 92, 246, 0.4)",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              <span>{lang === "tr" ? "5 Soruluk Test" : "5-Q Video Quiz"}</span>
            </button>
          </>
        )}

        {isPersonalFormPage(pageContext) && (
          <button
            className="sidepanel-chip"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(16, 185, 129, 0.25))",
              borderColor: "rgba(139, 92, 246, 0.4)",
              color: "#34d399",
              fontWeight: 600,
            }}
            onClick={() => handleSendMessage("Aktif sayfadaki formu benim memory.md kişisel bağlamımdaki verilerle (ad, soyad, e-posta, meslek vs.) doldur.")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span>{lang === "tr" ? "Formu Doldur (memory.md)" : "Autofill Form"}</span>
          </button>
        )}

        <button className="sidepanel-chip" onClick={() => handleChipClick("summarize")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <span>{lang === "tr" ? "Özetle" : "Summarize"}</span>
        </button>

        <button className="sidepanel-chip" onClick={() => handleChipClick("key_takeaways")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
          <span>{lang === "tr" ? "Ana Fikirler" : "Key Takeaways"}</span>
        </button>

        <button className="sidepanel-chip" onClick={() => handleChipClick("extract")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span>{lang === "tr" ? "Veri Çıkar" : "Extract Data"}</span>
        </button>

        <button className="sidepanel-chip" onClick={() => handleChipClick("ask")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span>{lang === "tr" ? "Soru Sor" : "Ask"}</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="sidepanel-messages">
        {messages.length === 0 ? (
          <div className="sidepanel-empty-state">
            <div className="ai-orb-container">
              <div className="ai-orb-ring-outer"></div>
              <div className="ai-orb-ring-inner"></div>
              <div className="ai-orb-core">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              </div>
            </div>
            <div className="sidepanel-empty-title">
              <span>{lang === "tr" ? "Life OS Agent Hazır" : "Life OS Agent Ready"}</span>
            </div>
            <p className="sidepanel-empty-desc">
              {lang === "tr"
                ? "Aktif web sayfasını analiz edebilir, sorular sorabilir veya hızlı aksiyonları kullanabilirsiniz."
                : "Analyze the active web page, ask questions, or use quick action triggers."}
            </p>

            <div className="sidepanel-starter-grid">
              <button className="starter-card" onClick={() => handleChipClick("summarize")}>
                <div className="starter-icon purple">✨</div>
                <div className="starter-text">
                  <strong>{lang === "tr" ? "Sayfayı Özetle" : "Summarize Page"}</strong>
                  <span>{lang === "tr" ? "3 ana maddede özetle" : "Get 3 key bullet points"}</span>
                </div>
              </button>
              <button className="starter-card" onClick={() => handleChipClick("key_takeaways")}>
                <div className="starter-icon green">💡</div>
                <div className="starter-text">
                  <strong>{lang === "tr" ? "Ana Fikirler" : "Key Takeaways"}</strong>
                  <span>{lang === "tr" ? "Kilit çıkarımlar & aksiyonlar" : "Key insights & action items"}</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`sidepanel-msg ${msg.role}`}>
              <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginTop: "4px" }}>
                <span style={{ fontSize: "0.62rem", opacity: 0.6 }}>
                  {msg.timestamp}
                </span>
                {msg.role === "assistant" && (
                  <SidePanelCopyBtn text={msg.content} lang={lang} />
                )}
              </div>
            </div>
          ))
        )}

        {agentStatus && (
          <div className="sidepanel-agent-status">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style={{ animation: "spin 1s linear infinite" }}>
              <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="10"></circle>
            </svg>
            <span>{agentStatus}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div className="sidepanel-input-container">
        <input
          type="text"
          className="sidepanel-input"
          value={inputText}
          onInput={(e) => setInputText((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          placeholder={lang === "tr" ? "Sayfa hakkında soru yazın..." : "Ask a question..."}
          disabled={isProcessing}
        />
        <button className="sidepanel-send-btn" onClick={() => handleSendMessage()} disabled={isProcessing}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}

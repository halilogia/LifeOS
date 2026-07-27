import { useState, useEffect, useRef } from "preact/hooks";
import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { PageContext, AgentActionPayload } from "@/content/agent/domAgentEngine.js";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
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

  // Load language settings & initial page context
  useEffect(() => {
    chrome.storage.sync.get(["lang"], (res) => {
      if (res.lang) setLang(res.lang as Language);
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
  }, [messages, agentStatus]);

  const refreshPageContext = () => {
    setAgentStatus(lang === "tr" ? "Sayfa taranıyor..." : "Scanning page...");
    try {
      chrome.runtime.sendMessage({ type: "get_active_tab_context" }, (response) => {
        setAgentStatus(null);
        if (chrome.runtime.lastError || !response) {
          return;
        }
        if (response.context) {
          setPageContext(response.context);
        }
      });
    } catch {
      setAgentStatus(null);
    }
  };

  const handleGroupTab = () => {
    chrome.runtime.sendMessage({ type: "group_active_tab" }, (res) => {
      if (res && res.success) {
        setAgentStatus(lang === "tr" ? "Sekme gruplandı (🤖 Life OS Agent)" : "Tab grouped (🤖 Life OS Agent)");
        setTimeout(() => setAgentStatus(null), 2500);
      }
    });
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

    // Fetch AI config settings
    chrome.storage.sync.get(
      ["geminiApiKey", "aiApiKey", "aiProvider", "aiModel", "aiEndpoint"],
      async (syncRes) => {
        const apiKey = (syncRes.geminiApiKey as string) || (syncRes.aiApiKey as string) || "";
        const provider = (syncRes.aiProvider as string) || "gemini";
        const model = (syncRes.aiModel as string) || (provider === "gemini" ? "gemini-1.5-flash" : "free");
        const rawEndpoint = (syncRes.aiEndpoint as string) || "http://localhost:20128/v1";

        const currentContextText = activeCtx ? activeCtx.pageText : "";
        const currentTitle = activeCtx ? activeCtx.title : "";
        const currentUrl = activeCtx ? activeCtx.url : "";

        const systemPrompt = `You are Life OS Web Agent & Copilot embedded in Chrome Side Panel for active tab:
Title: "${currentTitle}"
URL: "${currentUrl}"

Active Page Content Excerpt:
"${currentContextText.slice(0, 5000)}"

If the user asks an action like "click button", "fill form", or "scroll", return your final JSON action code block at the end in this format:
\`\`\`json
{
  "actionType": "click" | "type" | "scroll" | "extract" | "highlight",
  "selector": "#selector-or-class",
  "targetText": "button text to click",
  "textValue": "text to type if typing"
}
\`\`\`

Answer the user clearly, professionally, and concisely in ${lang === "tr" ? "Turkish" : "English"}.`;

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
          if (jsonMatch && jsonMatch[1]) {
            try {
              const actionPayload = JSON.parse(jsonMatch[1]) as AgentActionPayload;
              setAgentStatus(lang === "tr" ? `Sayfa aksiyonu yürütülüyor: ${actionPayload.actionType}...` : `Executing action: ${actionPayload.actionType}...`);
              
              chrome.runtime.sendMessage({ type: "execute_agent_action", payload: actionPayload }, (actRes) => {
                setAgentStatus(null);
                if (actRes && actRes.success) {
                  responseText += `\n\n✓ *${lang === "tr" ? "Aksiyon başarıyla gerçekleştirildi" : "Action executed successfully"} (${actionPayload.actionType})*`;
                }
              });
            } catch {
              setAgentStatus(null);
            }
          } else {
            setAgentStatus(null);
          }

          const assistantMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: responseText,
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
      },
    );
  };

  const isYoutube = pageContext?.url?.includes("youtube.com/watch");

  const handleChipClick = (type: "summarize" | "key_takeaways" | "ask" | "extract" | "yt_summarize") => {
    let prompt = "";
    if (type === "yt_summarize") {
      prompt = lang === "tr" ? "Bu YouTube videosunun alt yazılarını/transkriptini analiz et, 3 ana maddede özetle ve kilit zaman damgalarını çıkar." : "Summarize this YouTube video transcript and extract key timestamps.";
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
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={handleGroupTab}
            title={lang === "tr" ? "Bu sekmeyi Life OS Agent grubuna ekle" : "Group tab under Life OS Agent"}
            style={{
              background: "rgba(139, 92, 246, 0.15)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              borderRadius: "6px",
              color: "white",
              fontSize: "0.7rem",
              fontWeight: "600",
              padding: "3px 8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s ease",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
            </svg>
            <span>{lang === "tr" ? "Grupla" : "Group"}</span>
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
          <button
            className="sidepanel-chip"
            onClick={() => handleChipClick("yt_summarize")}
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "#ffffff",
              borderColor: "#8b5cf6",
            }}
          >
            <span>🎬</span>
            <span>{lang === "tr" ? "Videoyu Özetle" : "Summarize Video"}</span>
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
          <div style={{ padding: "24px 12px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.8rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" stroke-width="1.8">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"></path>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
            <span>{lang === "tr" ? "Web Copilot aktif. Sayfayı özetlemek veya soru sormak için butonları kullanın." : "Web Copilot is ready. Use action buttons or ask questions about this page."}</span>
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

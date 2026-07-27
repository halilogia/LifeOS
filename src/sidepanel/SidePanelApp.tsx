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

    // Listen for tab activation changes to refresh context
    const tabListener = () => refreshPageContext();
    chrome.tabs.onActivated.addListener(tabListener);
    return () => {
      chrome.tabs.onActivated.removeListener(tabListener);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agentStatus]);

  const refreshPageContext = () => {
    setAgentStatus(lang === "tr" ? "Sayfa taranıyor..." : "Reading page...");
    chrome.runtime.sendMessage({ type: "get_active_tab_context" }, (response) => {
      setAgentStatus(null);
      if (response && response.context) {
        setPageContext(response.context);
      } else {
        setPageContext({
          title: "Aktif Sayfa",
          url: "",
          domain: "",
          selectedText: "",
          pageText: "",
          interactiveElements: [],
        });
      }
    });
  };

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
    setAgentStatus(lang === "tr" ? "Yapay zeka yanıtlıyor..." : "AI Copilot is thinking...");

    // Fetch AI config settings
    chrome.storage.sync.get(
      ["aiApiKey", "aiProvider", "aiModel", "aiEndpoint"],
      async (syncRes) => {
        const apiKey = (syncRes.aiApiKey as string) || "";
        const provider = (syncRes.aiProvider as string) || "gemini";
        const model = (syncRes.aiModel as string) || (provider === "gemini" ? "gemini-1.5-flash" : "google/gemini-2.5-flash");
        const endpoint = (syncRes.aiEndpoint as string) || "https://generativelanguage.googleapis.com/v1beta";

        const currentContextText = pageContext ? pageContext.pageText : "";
        const currentTitle = pageContext ? pageContext.title : "";
        const currentUrl = pageContext ? pageContext.url : "";

        const systemPrompt = `You are Life OS Web Agent & Copilot. You are embedded in Chrome Side Panel for active tab:
Title: "${currentTitle}"
URL: "${currentUrl}"

Active Page Main Text Excerpt:
"${currentContextText.slice(0, 3000)}"

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

          if (provider === "gemini" || !provider) {
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
            // OpenRouter or custom endpoint
            const targetEndpoint = endpoint.endsWith("/") ? `${endpoint}chat/completions` : `${endpoint}/chat/completions`;
            const resp = await fetch(targetEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
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

            const data = await resp.json();
            responseText = data.choices?.[0]?.message?.content || "No response received.";
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
                  responseText += `\n\n✅ *${lang === "tr" ? "Aksiyon başarıyla gerçekleştirildi" : "Action executed successfully"} (${actionPayload.actionType})*`;
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

  const handleChipClick = (type: "summarize" | "key_takeaways" | "ask" | "extract") => {
    let prompt = "";
    if (type === "summarize") {
      prompt = lang === "tr" ? "Bu sayfayı 3 ana maddede özetle." : "Summarize this page in 3 key bullet points.";
    } else if (type === "key_takeaways") {
      prompt = lang === "tr" ? "Bu sayfadaki en önemli çıkarımları ve eylem maddelerini yaz." : "Extract key takeaways and action items from this page.";
    } else if (type === "ask") {
      prompt = lang === "tr" ? "Bu sayfa ne anlatıyor ve kimin için faydalı?" : "What is this page about and who is it for?";
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
          <span>Life OS Web Copilot</span>
        </div>
      </header>

      {/* Active Tab Status Bar */}
      <div className="sidepanel-tab-status">
        <div className="sidepanel-tab-info">
          <span className="sidepanel-tab-title">{pageContext?.title || (lang === "tr" ? "Sayfa Yükleniyor..." : "Loading page...")}</span>
          <span className="sidepanel-tab-url">{pageContext?.domain || pageContext?.url || ""}</span>
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

      {/* Quick Action Chips */}
      <div className="sidepanel-chips">
        <button className="sidepanel-chip" onClick={() => handleChipClick("summarize")}>
          📝 {lang === "tr" ? "Özetle" : "Summarize"}
        </button>
        <button className="sidepanel-chip" onClick={() => handleChipClick("key_takeaways")}>
          💡 {lang === "tr" ? "Ana Fikirler" : "Key Takeaways"}
        </button>
        <button className="sidepanel-chip" onClick={() => handleChipClick("extract")}>
          📊 {lang === "tr" ? "Veri Çıkar" : "Extract Data"}
        </button>
        <button className="sidepanel-chip" onClick={() => handleChipClick("ask")}>
          ❓ {lang === "tr" ? "Soru Sor" : "Ask"}
        </button>
      </div>

      {/* Messages Feed */}
      <div className="sidepanel-messages">
        {messages.length === 0 ? (
          <div style={{ padding: "20px 10px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            🤖 {lang === "tr" ? "Web Copilot aktif. Sayfayı özetlemek veya aksiyon almak için üstteki butonları kullanın veya soru yazın." : "Web Copilot is ready. Use action chips or type a prompt to interact with this page."}
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`sidepanel-msg ${msg.role}`}>
              <div>{msg.content}</div>
              <span style={{ fontSize: "0.65rem", opacity: 0.6, alignSelf: msg.role === "user" ? "flex-end" : "flex-start", marginTop: "4px" }}>
                {msg.timestamp}
              </span>
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
          placeholder={lang === "tr" ? "Sayfa hakkında soru yazın veya aksiyon isteyin..." : "Ask a question about this page..."}
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

import { useState, useEffect, useRef } from "preact/hooks";
import { Todo, Language } from "../types/types.js";
import { translations } from "../utils/i18n.js";

interface AIChatViewProps {
  lang: Language;
  todos: Todo[];
  onAddTodo: (text: string, repeat: Todo["repeat"], dueDate?: string) => Promise<void>;
  onToggleTodo: (index: number) => Promise<void>;
  onDeleteTodo: (index: number) => Promise<void>;
  onManualSync: () => Promise<void>;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  onSettingsOpen: () => void;
}

interface Message {
  sender: "user" | "bot";
  text: string;
  time: string;
}

const monthsMap: Record<string, number> = {
  ocak: 1, şubat: 2, mart: 3, nisan: 4, mayıs: 5, haziran: 6,
  temmuz: 7, ağustos: 8, eylül: 9, ekim: 10, kasım: 11, aralık: 12,
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
};

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
  onSettingsOpen,
}: AIChatViewProps) {
  const t = translations[lang];

  // Component States
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    // Add initial welcome message
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

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  // Local Rule-Based Command Parser (Turkish & English fallback)
  const parseLocalCommand = (query: string): { text: string; date?: string; parsed: boolean } => {
    const textLower = query.toLowerCase().trim();
    const today = new Date();

    // 1. Check for "yarın" / "tomorrow"
    if (textLower.startsWith("yarın") || textLower.includes(" yarın")) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const dateStr = tomorrow.toISOString().split("T")[0];
      
      let cleaned = query
        .replace(/yarın/gi, "")
        .replace(/için/gi, "")
        .replace(/(görev|task)?\s*(oluştur|ekle|yaz)/gi, "")
        .trim();
      cleaned = cleaned.replace(/^[:\-,\s]+/, "").trim();

      return { text: cleaned || "Görev", date: dateStr, parsed: true };
    }

    if (textLower.startsWith("tomorrow") || textLower.includes(" tomorrow")) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const dateStr = tomorrow.toISOString().split("T")[0];
      
      let cleaned = query
        .replace(/tomorrow/gi, "")
        .replace(/for/gi, "")
        .replace(/(task|todo)?\s*(create|add|write)/gi, "")
        .trim();
      cleaned = cleaned.replace(/^[:\-,\s]+/, "").trim();

      return { text: cleaned || "Task", date: dateStr, parsed: true };
    }

    // 2. Check for "ayın X'ine" / "ayın Xine"
    const ayinMatch = textLower.match(/(?:ayın\s+)?(\d+)(?:'sine|'sine\s+|sine|sine\s+|'ine|ine|'na|na|a|e)?\s+(?:görev|task)?\s*(?:oluştur|ekle|yaz)\s*[:\-]?\s*(.+)$/i);
    if (ayinMatch) {
      const dayNum = parseInt(ayinMatch[1], 10);
      const taskText = ayinMatch[2].trim();
      
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(dayNum).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      return { text: taskText, date: dateStr, parsed: true };
    }

    // 3. Check for specific date (e.g., "25 temmuz")
    const trDateMatch = textLower.match(/(\d+)\s+([a-zA-Zçıöşğüİ]+)\s*(?:için)?\s+(?:görev|task)?\s*(?:oluştur|ekle|yaz)\s*[:\-]?\s*(.+)$/i);
    if (trDateMatch) {
      const dayNum = parseInt(trDateMatch[1], 10);
      const monthName = trDateMatch[2].toLowerCase();
      const taskText = trDateMatch[3].trim();

      if (monthsMap[monthName]) {
        const monthNum = String(monthsMap[monthName]).padStart(2, "0");
        const year = today.getFullYear();
        const day = String(dayNum).padStart(2, "0");
        const dateStr = `${year}-${monthNum}-${day}`;
        return { text: taskText, date: dateStr, parsed: true };
      }
    }

    const enDateMatch = textLower.match(/(?:create|add)\s+task\s+for\s+([a-zA-Z]+)\s+(\d+)\s*[:\-]?\s*(.+)$/i);
    if (enDateMatch) {
      const monthName = enDateMatch[1].toLowerCase();
      const dayNum = parseInt(enDateMatch[2], 10);
      const taskText = enDateMatch[3].trim();

      if (monthsMap[monthName]) {
        const monthNum = String(monthsMap[monthName]).padStart(2, "0");
        const year = today.getFullYear();
        const day = String(dayNum).padStart(2, "0");
        const dateStr = `${year}-${monthNum}-${day}`;
        return { text: taskText, date: dateStr, parsed: true };
      }
    }

    // 4. Default generic command
    if (textLower.startsWith("görev ekle") || textLower.startsWith("task ekle") || textLower.startsWith("görev oluştur")) {
      let cleaned = query
        .replace(/görev ekle/gi, "")
        .replace(/task ekle/gi, "")
        .replace(/görev oluştur/gi, "")
        .trim();
      cleaned = cleaned.replace(/^[:\-,\s]+/, "").trim();
      return { text: cleaned, parsed: true };
    }

    return { text: query, parsed: false };
  };

  // Call AI Service
  const callAI = async (userPrompt: string): Promise<{ reply: string; action?: string; params?: any }> => {
    const todayStr = new Date().toISOString().split("T")[0];
    const systemPrompt = `You are a helpful AI Assistant for the Life OS Personal Dashboard Chrome Extension. The current year is ${new Date().getFullYear()}. The current date is ${todayStr}.
You can chat naturally, but if the user wants to add, create, or schedule a task, you must output a structured JSON response.
Format your final output ONLY as a JSON object matching this schema:
{
  "reply": "Your conversational response text in the user's language (Turkish or English).",
  "action": "create_task" | "none",
  "params": {
    "text": "Task text",
    "dueDate": "YYYY-MM-DD target date (calculated relative to today's date if requested)",
    "repeat": "none" | "daily" | "weekly" | "monthly"
  }
}
Output raw JSON only. Do not wrap it in markdown code blocks like \`\`\`json.`;

    if (aiProvider === "openrouter") {
      const url = "https://openrouter.ai/api/v1/chat/completions";
      const modelName = aiModel || "google/gemini-2.5-flash";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${aiApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/halilogia/chrome-extension-todo",
          "X-Title": "Life OS Dashboard",
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!res.ok) {
        throw new Error(`OpenRouter API returned status ${res.status}`);
      }

      const data = await res.json();
      const textResponse = data?.choices?.[0]?.message?.content;
      if (!textResponse) {
        throw new Error("Empty response from OpenRouter");
      }
      return JSON.parse(textResponse.trim());
    } else {
      // Gemini API
      const modelName = aiModel || "gemini-1.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${aiApiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
            },
          ],
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Gemini API returned status ${res.status}`);
      }

      const data = await res.json();
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        throw new Error("Empty response from Gemini");
      }
      return JSON.parse(textResponse.trim());
    }
  };

  // Handle Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query) return;

    if (!textToSend) {
      setInputVal("");
    }

    const time = new Date().toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [...prev, { sender: "user", text: query, time }]);
    setIsBotTyping(true);

    try {
      if (aiApiKey && aiApiKey.trim()) {
        const aiResponse = await callAI(query);
        setIsBotTyping(false);

        if (aiResponse.action === "create_task" && aiResponse.params?.text) {
          const taskText = aiResponse.params.text;
          const repeat = aiResponse.params.repeat || "none";
          const dueDate = aiResponse.params.dueDate;

          await onAddTodo(taskText, repeat, dueDate);
          await onManualSync();
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: aiResponse.reply,
            time: new Date().toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } else {
        // Fallback command parser
        setTimeout(async () => {
          setIsBotTyping(false);
          const localParsed = parseLocalCommand(query);

          let replyText = "";
          if (localParsed.parsed) {
            const dueDateFormatted = localParsed.date ? ` (${localParsed.date})` : "";
            await onAddTodo(localParsed.text, "none", localParsed.date);
            await onManualSync();

            replyText = lang === "tr"
              ? `Tamamdır! "${localParsed.text}" görevini${dueDateFormatted} takviminize ekledim. ✓`
              : `Sure! I have added "${localParsed.text}" to your tasks list${dueDateFormatted}. ✓`;
          } else {
            replyText = lang === "tr"
              ? "Üzgünüm, bu komutu yerel olarak çözümleyemedim. Lütfen 'ayın 20sine görev oluştur: X' formatında yazmayı deneyin veya ayarlardan bir API anahtarı ekleyerek tam sohbet modunu aktifleştirin."
              : "I couldn't parse this command locally. Try typing: 'create task for the 20th: X' or add an API Key in settings to enable full conversation mode.";
          }

          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: replyText,
              time: new Date().toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
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
        const dueDateFormatted = localParsed.date ? ` (${localParsed.date})` : "";
        await onAddTodo(localParsed.text, "none", localParsed.date);
        await onManualSync();

        replyText = lang === "tr"
          ? `[Yerel Fallback] "${localParsed.text}" görevini${dueDateFormatted} ekledim. ✓`
          : `[Local Fallback] Added "${localParsed.text}" task${dueDateFormatted} successfully. ✓`;
      } else {
        replyText = lang === "tr"
          ? "Yapay zeka servisine bağlanırken bir sorun oluştu. Ayarlardan anahtarınızı/modelinizi kontrol edin."
          : "Error connecting to the AI service. Please verify your settings and API Key.";
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: replyText,
          time: new Date().toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
  };

  return (
    <div id="ai-chat-view" className="view-content active">
      <div className="ai-chat-container">
        
        {/* Header */}
        <header className="ai-chat-header">
          <div className="header-title-section">
            <h2>{t.ai_chat_title}</h2>
            {!aiApiKey && (
              <span className="local-mode-badge" title={t.ai_chat_no_key_warning}>
                {lang === "tr" ? "Çevrimdışı/Komut Modu" : "Offline Command Mode"}
              </span>
            )}
          </div>
          <button
            className={`key-panel-toggle-btn ${aiApiKey ? "configured" : ""}`}
            onClick={onSettingsOpen}
            title={t.settings_title}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>{aiApiKey ? t.ai_chat_key_saved : t.ai_chat_key_title}</span>
          </button>
        </header>

        {/* Messages List Area */}
        <div className="chat-messages-area">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-bubble-wrapper ${msg.sender}`}>
              <div className="avatar">
                {msg.sender === "user" ? "👤" : "🤖"}
              </div>
              <div className="message-bubble">
                <p className="msg-text">{msg.text}</p>
                <span className="msg-time">{msg.time}</span>
              </div>
            </div>
          ))}
          {isBotTyping && (
            <div className="message-bubble-wrapper bot">
              <div className="avatar">🤖</div>
              <div className="message-bubble typing">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Control Input Panel */}
        <div className="chat-input-panel">
          {/* Quick Suggestions Chips */}
          <div className="suggestion-chips-container">
            <button
              className="chip-btn"
              onClick={() => handleSendMessage(t.ai_chat_suggestion_1)}
            >
              💡 {t.ai_chat_suggestion_1}
            </button>
            <button
              className="chip-btn"
              onClick={() => handleSendMessage(t.ai_chat_suggestion_2)}
            >
              💡 {t.ai_chat_suggestion_2}
            </button>
            <button
              className="chip-btn"
              onClick={() => handleSendMessage(t.ai_chat_suggestion_3)}
            >
              💡 {t.ai_chat_suggestion_3}
            </button>
          </div>

          {/* Main prompt input */}
          <div className="main-input-bar">
            <input
              type="text"
              className="chat-prompt-input"
              value={inputVal}
              onInput={(e) => setInputVal((e.target as HTMLInputElement).value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={t.ai_chat_placeholder}
            />
            <button className="send-message-btn" onClick={() => handleSendMessage()}>
              <span>{t.ai_chat_send}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

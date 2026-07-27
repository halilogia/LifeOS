import { useState, useEffect, useRef } from "preact/hooks";
import { Todo, Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";

import { AiChatHeaderBar } from "./aichat/AiChatHeaderBar.js";
import {
  AiChatMessageItem,
  MessageItemData,
} from "./aichat/AiChatMessageItem.js";
import { AiChatInputToolbar } from "./aichat/AiChatInputToolbar.js";
import { AICompanionModal } from "./AICompanionModal.js";

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

const monthsMap: Record<string, number> = {
  ocak: 1,
  şubat: 2,
  mart: 3,
  nisan: 4,
  mayıs: 5,
  haziran: 6,
  temmuz: 7,
  ağustos: 8,
  eylül: 9,
  ekim: 10,
  kasım: 11,
  aralık: 12,
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
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
  aiEndpoint,
  aiShowThinking = true,
  onSettingsOpen,
}: AIChatViewProps) {
  const t = translations[lang];

  // Component States
  const [messages, setMessages] = useState<MessageItemData[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [showCompanionModal, setShowCompanionModal] = useState(false);
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

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  // Local Rule-Based Command Parser (Turkish & English fallback)
  const parseLocalCommand = (
    query: string,
  ): {
    parsed: boolean;
    action?: "create_task" | "add_note";
    text?: string;
    date?: string;
    note_type?: "note" | "diary" | "cornell";
    content?: string;
  } => {
    const textLower = query.toLowerCase().trim();
    const today = new Date();

    // Check notes first
    if (
      textLower.includes("günlük ekle") ||
      textLower.includes("günlük yazısı ekle") ||
      textLower.includes("günlük oluştur") ||
      textLower.includes("günlük eklermisin")
    ) {
      const match = query.match(
        /(?:günlük ekle|günlük yazısı ekle|günlük oluştur|günlük eklermisin)\s*[:-]?\s*(.+)$/i,
      );
      if (match) {
        return {
          parsed: true,
          action: "add_note",
          note_type: "diary",
          content: match[1].trim(),
        };
      }
    }
    if (
      textLower.includes("ders notu ekle") ||
      textLower.includes("cornell ders notu ekle") ||
      textLower.includes("ders notu oluştur") ||
      textLower.includes("ders notu eklermisin") ||
      textLower.includes("cornell notu ekle")
    ) {
      const match = query.match(
        /(?:ders notu ekle|cornell ders notu ekle|ders notu oluştur|ders notu eklermisin|cornell notu ekle)\s*[:-]?\s*(.+)$/i,
      );
      if (match) {
        return {
          parsed: true,
          action: "add_note",
          note_type: "cornell",
          content: match[1].trim(),
        };
      }
    }
    if (
      textLower.includes("not ekle") ||
      textLower.includes("not oluştur") ||
      textLower.includes("not eklermisin")
    ) {
      const match = query.match(
        /(?:not ekle|not oluştur|not eklermisin)\s*[:-]?\s*(.+)$/i,
      );
      if (match) {
        return {
          parsed: true,
          action: "add_note",
          note_type: "note",
          content: match[1].trim(),
        };
      }
    }

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

      return {
        parsed: true,
        action: "create_task",
        text: cleaned || "Görev",
        date: dateStr,
      };
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
      cleaned = cleaned.replace(/^[:,\s-]+/, "").trim();

      return {
        parsed: true,
        action: "create_task",
        text: cleaned || "Task",
        date: dateStr,
      };
    }

    // 2. Check for "ayın X'ine" / "ayın Xine"
    const ayinMatch = textLower.match(
      /(?:ayın\s+)?(\d+)(?:'sine|'sine\s+|sine|sine\s+|'ine|ine|'na|na|a|e)?\s+(?:görev|task)?\s*(?:oluştur|ekle|yaz)\s*[:-]?\s*(.+)$/i,
    );
    if (ayinMatch) {
      const dayNum = parseInt(ayinMatch[1], 10);
      const taskText = ayinMatch[2].trim();

      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(dayNum).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      return {
        parsed: true,
        action: "create_task",
        text: taskText,
        date: dateStr,
      };
    }

    // 3. Check for specific date (e.g., "25 temmuz")
    const trDateMatch = textLower.match(
      /(\d+)\s+([a-zA-Zçıöşğüİ]+)\s*(?:için)?\s+(?:görev|task)?\s*(?:oluştur|ekle|yaz)\s*[:-]?\s*(.+)$/i,
    );
    if (trDateMatch) {
      const dayNum = parseInt(trDateMatch[1], 10);
      const monthName = trDateMatch[2].toLowerCase();
      const taskText = trDateMatch[3].trim();

      if (monthsMap[monthName]) {
        const monthNum = String(monthsMap[monthName]).padStart(2, "0");
        const year = today.getFullYear();
        const day = String(dayNum).padStart(2, "0");
        const dateStr = `${year}-${monthNum}-${day}`;
        return {
          parsed: true,
          action: "create_task",
          text: taskText,
          date: dateStr,
        };
      }
    }

    const enDateMatch = textLower.match(
      /(?:create|add)\s+task\s+for\s+([a-zA-Z]+)\s+(\d+)\s*[:-]?\s*(.+)$/i,
    );
    if (enDateMatch) {
      const monthName = enDateMatch[1].toLowerCase();
      const dayNum = parseInt(enDateMatch[2], 10);
      const taskText = enDateMatch[3].trim();

      if (monthsMap[monthName]) {
        const monthNum = String(monthsMap[monthName]).padStart(2, "0");
        const year = today.getFullYear();
        const day = String(dayNum).padStart(2, "0");
        const dateStr = `${year}-${monthNum}-${day}`;
        return {
          parsed: true,
          action: "create_task",
          text: taskText,
          date: dateStr,
        };
      }
    }

    // 4. Default generic command
    if (
      textLower.startsWith("görev ekle") ||
      textLower.startsWith("task ekle") ||
      textLower.startsWith("görev oluştur")
    ) {
      let cleaned = query
        .replace(/görev ekle/gi, "")
        .replace(/task ekle/gi, "")
        .replace(/görev oluştur/gi, "")
        .trim();
      cleaned = cleaned.replace(/^[:\-,\s]+/, "").trim();
      return { parsed: true, action: "create_task", text: cleaned };
    }

    return { parsed: false };
  };

  const cleanAndParseJSON = (text: string) => {
    let cleaned = text.trim();

    // 1. Remove think blocks entirely
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    // 2. Normalize smart quotes and typical invalid characters
    cleaned = cleaned
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'");

    // 3. Find first brace or bracket
    const firstBrace = cleaned.indexOf("{");
    const firstBracket = cleaned.indexOf("[");

    let isObject = false;
    let startIdx = -1;

    if (
      firstBrace !== -1 &&
      (firstBracket === -1 || firstBrace < firstBracket)
    ) {
      startIdx = firstBrace;
      isObject = true;
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      isObject = false;
    }

    if (startIdx === -1) {
      return { reply: cleaned, action: "none", params: null };
    }

    const openChar = isObject ? "{" : "[";
    const closeChar = isObject ? "}" : "]";

    let braceCount = 0;
    let endIdx = -1;
    let inString = false;
    let escape = false;

    for (let i = startIdx; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === "\\") {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === openChar) {
          braceCount++;
        } else if (char === closeChar) {
          braceCount--;
          if (braceCount === 0) {
            endIdx = i;
            break;
          }
        }
      }
    }

    if (endIdx !== -1) {
      cleaned = cleaned.substring(startIdx, endIdx + 1);
    }

    try {
      return JSON.parse(cleaned);
    } catch {
      try {
        const patched = cleaned
          .replace(/,\s*([\]}])/g, "$1")
          .replace(/(["\d])\s*\n\s*"/g, '$1,\n"');
        return JSON.parse(patched);
      } catch {
        console.warn(
          "[cleanAndParseJSON Fallback] JSON parsing failed twice. Raw text was:",
          text,
        );
        return {
          reply: text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim(),
          action: "none",
          params: null,
        };
      }
    }
  };

  const parseAIResponse = (rawText: string) => {
    let thinking = "";

    const thinkRegex = /<think>([\s\S]*?)<\/think>/i;
    const thinkMatch = rawText.match(thinkRegex);
    if (thinkMatch) {
      thinking = thinkMatch[1].trim();
    }

    try {
      const parsed = cleanAndParseJSON(rawText);
      return {
        reply: parsed.reply || "",
        action: parsed.action || "none",
        params: parsed.params || null,
        thinking,
      };
    } catch {
      const reply = rawText.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
      return {
        reply,
        action: "none",
        params: null,
        thinking,
      };
    }
  };

  // Call AI Service
  const callAI = async (
    userPrompt: string,
  ): Promise<{
    reply: string;
    action?: string;
    params?: any;
    thinking?: string;
  }> => {
    const todayStr = new Date().toISOString().split("T")[0];
    const systemPrompt = `You are a helpful AI Assistant for the Life OS Personal Dashboard Chrome Extension. The current year is ${new Date().getFullYear()}. The current date is ${todayStr}.
You MUST default to replying in Turkish unless the user explicitly requests you in their prompt to reply in another specific language (e.g. English, Arabic, Korean, French, German, Spanish, etc.). If the user does not explicitly request a foreign language response, always respond in Turkish.
You can chat naturally, but if the user wants to add, create, or schedule a task, or add a diary entry/note/study note, you must output a structured JSON response.
Format your final output ONLY as a JSON object matching this schema:
{
  "reply": "Your conversational response text (default to Turkish unless explicitly requested otherwise).",
  "action": "create_task" | "add_note" | "none",
  "params": {
    "text": "Task text (only for create_task)",
    "dueDate": "YYYY-MM-DD target date (calculated relative to today's date if requested - only for create_task)",
    "repeat": "none" | "daily" | "weekly" | "monthly" (only for create_task),
    "note_type": "note" | "diary" | "cornell" (only for add_note),
    "note_title": "Title for the note/diary/cornell entry (provide a suitable brief title if not explicitly provided - only for add_note)",
    "note_content": "Content of the note or main notes section of Cornell notes (only for add_note)",
    "note_cues": "Keywords, cues or questions (only for Cornell notes, cues/questions derived from context - only for add_note)",
    "note_summary": "A brief summary of the study material (only for Cornell notes - only for add_note)"
  }
}
Output raw JSON only. Do not wrap it in markdown code blocks like \`\`\`json.`;

    if (aiProvider === "ollama") {
      const baseUrl =
        aiEndpoint && aiEndpoint.trim()
          ? aiEndpoint.trim().replace(/\/$/, "")
          : "http://localhost:11434";
      const url = baseUrl.includes("/v1")
        ? `${baseUrl}/chat/completions`
        : `${baseUrl}/v1/chat/completions`;
      const modelName = aiModel || "llama3";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: false,
        }),
      });

      if (!res.ok) {
        let errBody = "";
        try {
          errBody = await res.text();
        } catch {
          // ignore
        }
        throw new Error(
          `Ollama returned status ${res.status}: ${errBody || res.statusText}`,
        );
      }

      const data = await res.json();
      const textResponse = data?.choices?.[0]?.message?.content;
      if (!textResponse) {
        throw new Error("Empty response from Ollama");
      }
      return parseAIResponse(textResponse);
    } else if (aiProvider === "openrouter") {
      const baseUrl =
        aiEndpoint && aiEndpoint.trim()
          ? aiEndpoint.trim().replace(/\/$/, "")
          : "https://openrouter.ai/api/v1";
      const url = `${baseUrl}/chat/completions`;
      const modelName = aiModel || "google/gemini-2.5-flash";
      const isLocal =
        baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (aiApiKey && aiApiKey.trim()) {
        headers["Authorization"] = `Bearer ${aiApiKey}`;
      }

      if (!isLocal) {
        headers["HTTP-Referer"] =
          "https://github.com/halilogia/chrome-extension-todo";
        headers["X-Title"] = "Life OS Dashboard";
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: false,
        }),
      });

      if (!res.ok) {
        let errBody = "";
        try {
          errBody = await res.text();
        } catch {
          // ignore
        }
        throw new Error(
          `OpenRouter API returned status ${res.status}: ${errBody || res.statusText}`,
        );
      }

      const data = await res.json();
      const textResponse = data?.choices?.[0]?.message?.content;
      if (!textResponse) {
        throw new Error("Empty response from OpenRouter");
      }
      return parseAIResponse(textResponse);
    } else {
      // Gemini API
      const modelName = aiModel || "gemini-1.5-flash";
      const baseUrl =
        aiEndpoint && aiEndpoint.trim()
          ? aiEndpoint.trim().replace(/\/$/, "")
          : "https://generativelanguage.googleapis.com/v1beta";
      const url = `${baseUrl}/models/${modelName}:generateContent?key=${aiApiKey}`;
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
        let errBody = "";
        try {
          errBody = await res.text();
        } catch {
          // ignore
        }
        throw new Error(
          `Gemini API returned status ${res.status}: ${errBody || res.statusText}`,
        );
      }

      const data = await res.json();
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        throw new Error("Empty response from Gemini");
      }
      return parseAIResponse(textResponse);
    }
  };

  const handleAddNoteFromAI = async (
    type: "note" | "diary" | "cornell",
    content: string,
    title?: string,
    cues?: string,
    summary?: string,
  ) => {
    const currentNotes: any[] = await new Promise((r) =>
      chrome.storage.sync.get(["notes"], (res) =>
        r((res.notes as any[]) || []),
      ),
    );
    const formattedDate = new Date().toLocaleDateString(
      lang === "tr" ? "tr-TR" : "en-US",
    );
    const defaultTitle =
      title ||
      (type === "diary"
        ? lang === "tr"
          ? `Günlük - ${formattedDate}`
          : `Diary - ${formattedDate}`
        : type === "cornell"
          ? lang === "tr"
            ? `Ders Notu - ${formattedDate}`
            : `Study Note - ${formattedDate}`
          : lang === "tr"
            ? `Not - ${formattedDate}`
            : `Note - ${formattedDate}`);

    currentNotes.push({
      id: crypto.randomUUID(),
      title: defaultTitle,
      content: content,
      type: type,
      cues: cues || "",
      summary: summary || "",
      createdAt: new Date().toISOString(),
    });
    await new Promise<void>((r) =>
      chrome.storage.sync.set({ notes: currentNotes }, r),
    );
  };

  // Handle Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query) {
      return;
    }

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
        const aiResponse = await callAI(query);
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
          await handleAddNoteFromAI(type, content, title, cues, summary);
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: aiResponse.reply,
            thinking: aiResponse.thinking,
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
        // Fallback command parser
        setTimeout(async () => {
          setIsBotTyping(false);
          const localParsed = parseLocalCommand(query);

          let replyText = "";
          if (localParsed.parsed) {
            if (localParsed.action === "add_note" && localParsed.content) {
              const type = localParsed.note_type || "note";
              await handleAddNoteFromAI(type, localParsed.content);

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
          await handleAddNoteFromAI(type, localParsed.content);
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
          lang={lang}
          noKeyWarning={t.ai_chat_no_key_warning}
          keySavedText={t.ai_chat_key_saved}
          keyTitleText={t.ai_chat_key_title}
          settingsTitle={t.settings_title}
          onSettingsOpen={onSettingsOpen}
          onOpenCompanionModal={() => setShowCompanionModal(true)}
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
              lang={lang}
              onToggleThinking={handleToggleThinking}
            />
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

        {/* Chat Input Panel & Suggestions */}
        <AiChatInputToolbar
          inputVal={inputVal}
          placeholder={t.ai_chat_placeholder}
          sendLabel={t.ai_chat_send}
          suggestion1={t.ai_chat_suggestion_1}
          suggestion2={t.ai_chat_suggestion_2}
          suggestion3={t.ai_chat_suggestion_3}
          onInputChange={setInputVal}
          onSendMessage={handleSendMessage}
        />
      </div>

      {showCompanionModal && (
        <AICompanionModal
          lang={lang}
          onClose={() => setShowCompanionModal(false)}
        />
      )}
    </div>
  );
}

/**
 * chatSessionService.ts
 * Business logic service for chat sessions management, titling,
 * human-readable markdown/JSON export, and persistence.
 */

import type { IChatSessionRepository } from "@/domain/repositories/IChatSessionRepository.js";
import { ChromeStorageChatSessionRepository } from "@/infrastructure/persistence/repositories/ChromeStorageChatSessionRepository.js";
import type { ChatSession, ChatSessionMessage } from "./types.js";
import { formatFileSize } from "./fileAttachmentService.js";

let repoInstance: IChatSessionRepository | null = null;

/** Returns the chat session repository singleton. */
export function getChatSessionRepository(): IChatSessionRepository {
  if (!repoInstance) {
    repoInstance = new ChromeStorageChatSessionRepository();
  }
  return repoInstance;
}

/**
 * Generates a clean, human-readable session title from the first user message.
 */
export function generateSessionTitle(
  firstPrompt: string,
  defaultTitle = "Yeni Sohbet",
): string {
  if (!firstPrompt || !firstPrompt.trim()) {
    return defaultTitle;
  }

  // Remove slash commands, mentions, markdown bold/italic/headers/backticks
  let clean = firstPrompt
    .replace(/^\/[a-zA-Z0-9_-]+\s*/, "")
    .replace(/^@[a-zA-Z0-9_-]+\s*/, "")
    .replace(/[*_~`#]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) {
    return defaultTitle;
  }

  // Truncate to maximum 40 characters
  if (clean.length > 40) {
    clean = clean.slice(0, 37).trim() + "...";
  }

  return clean;
}

/**
 * Cleans raw assistant response text from raw JSON codeblocks,
 * converting them into clean human-readable action summaries.
 */
function cleanAssistantContentForExport(rawContent: string): string {
  let text = rawContent || "";

  // Extract json codeblocks if any
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  let actionSummary = "";

  if (jsonMatch && jsonMatch[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.action === "create_task" && parsed.params?.text) {
        actionSummary = `\n\n⚡ **Gerçekleştirilen Eylem:** Görev Takvime Eklendi → *"${parsed.params.text}"* ${parsed.params.dueDate ? `(${parsed.params.dueDate})` : ""}`;
      } else if (parsed.action === "add_note" && (parsed.params?.note_content || parsed.params?.note_title)) {
        actionSummary = `\n\n⚡ **Gerçekleştirilen Eylem:** Not / Günlük Eklendi → *"${parsed.params.note_title || "Yeni Not"}"*`;
      } else if (parsed.action === "update_memory" && parsed.params?.memory_fact) {
        actionSummary = `\n\n🧠 **Hafıza Güncellendi:** *"${parsed.params.memory_fact}"*`;
      }
    } catch {
      /* ignore json parse failure in cleaner */
    }
  }

  // Remove raw JSON code blocks and redundant memory banners
  text = text
    .replace(/```json[\s\S]*?```/gi, "")
    .replace(/Aşağıda\s*\*+memory\.md\*+[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi, "")
    .replace(/⚠️\s*\*+Formda zorunlu olan alanlar[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi, "")
    .trim();

  if (actionSummary) {
    text += actionSummary;
  }

  return text;
}

/**
 * Exports a chat session as clean, elegant, human-readable Markdown text.
 */
export function exportSessionAsMarkdown(session: ChatSession): string {
  const createdDate = new Date(session.createdAt).toLocaleString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const scopeLabel =
    session.scope === "sidepanel"
      ? "Side Panel Web Copilot"
      : "Newtab AI Asistanı";

  const lines: string[] = [
    `# 💬 ${session.title}`,
    ``,
    `> 📅 **Tarih:** ${createdDate} | 🧭 **Kapsam:** ${scopeLabel} | ✉️ **Toplam Mesaj:** ${session.messages.length}`,
  ];

  if (session.url) {
    lines.push(`> 🌐 **Sayfa / URL:** [${session.domain || session.url}](${session.url})`);
  }

  lines.push(``, `---`, ``);

  for (const msg of session.messages) {
    const isUser = msg.role === "user";
    const header = isUser
      ? `## 👤 Kullanıcı ${msg.timestamp ? `(${msg.timestamp})` : ""}`
      : `## 🤖 Life OS Asistanı ${msg.timestamp ? `(${msg.timestamp})` : ""}`;

    lines.push(header, ``);

    // Attached files
    if (msg.attachments && msg.attachments.length > 0) {
      lines.push(`📎 **Ekli Dosyalar:**`);
      for (const att of msg.attachments) {
        lines.push(
          `- \`${att.name}\` (${att.type.toUpperCase()}, ${formatFileSize(att.size)})`,
        );
      }
      lines.push(``);
    }

    // Google AI Mode Search sources
    if (!isUser && msg.sources && msg.sources.length > 0) {
      lines.push(
        `🌐 **İncelenen Web Kaynakları (${msg.sources.length})${msg.searchQuery ? ` - Sorgu: "${msg.searchQuery}"` : ""}:**`,
      );
      msg.sources.forEach((src, sIdx) => {
        lines.push(`${sIdx + 1}. [${src.title}](${src.url})`);
      });
      lines.push(``);
    }

    // Thinking process (collapsible details)
    if (!isUser && msg.thinking) {
      lines.push(`<details>`);
      lines.push(`<summary>💭 Düşünme Süreci</summary>`);
      lines.push(``);
      lines.push(
        msg.thinking
          .split("\n")
          .map((l) => `> ${l}`)
          .join("\n"),
      );
      lines.push(``);
      lines.push(`</details>`);
      lines.push(``);
    }

    // Main Content
    const cleanContent = isUser
      ? msg.content
      : cleanAssistantContentForExport(msg.content);

    if (cleanContent) {
      lines.push(cleanContent);
      lines.push(``);
    }

    // Clarification details
    if (!isUser && msg.clarification) {
      lines.push(`❓ **Açıklama / Tercih:** ${msg.clarification.question}`);
      if (msg.clarification.resolved && msg.clarification.selectedAnswer) {
        lines.push(`👉 **Kullanıcı Yanıtı:** ${msg.clarification.selectedAnswer}`);
      } else {
        lines.push(`⏳ **Durum:** Beklemede / Yanıtlanmadı`);
      }
      lines.push(``);
    }

    lines.push(`---`, ``);
  }

  lines.push(`*Life OS AI Asistanı tarafından dışa aktarıldı.*`);

  return lines.join("\n");
}

/**
 * Exports a chat session as formatted JSON string.
 */
export function exportSessionAsJson(session: ChatSession): string {
  return JSON.stringify(session, null, 2);
}

/**
 * Triggers a browser download of text content as a file.
 */
export function downloadTextFile(
  filename: string,
  content: string,
  mimeType = "text/markdown",
): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

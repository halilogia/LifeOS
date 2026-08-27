/**
 * chatSessionService.ts
 * Business logic service for chat sessions management, titling,
 * markdown/JSON export, and persistence.
 */

import type { IChatSessionRepository } from "@/domain/repositories/IChatSessionRepository.js";
import { ChromeStorageChatSessionRepository } from "@/infrastructure/persistence/repositories/ChromeStorageChatSessionRepository.js";
import type { ChatSession } from "./types.js";

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
 * Exports a chat session as formatted Markdown text.
 */
export function exportSessionAsMarkdown(session: ChatSession): string {
  const createdDate = new Date(session.createdAt).toLocaleString("tr-TR");
  const lines: string[] = [
    `# ${session.title}`,
    ``,
    `- **Oluşturulma Tarihi:** ${createdDate}`,
    `- **Kapsam:** ${session.scope === "sidepanel" ? "Side Panel Web Copilot" : "Newtab AI Asistan"}`,
  ];

  if (session.url) {
    lines.push(`- **Sayfa URL:** ${session.url}`);
  }
  if (session.domain) {
    lines.push(`- **Alan Adı:** ${session.domain}`);
  }

  lines.push(``, `---`, ``);

  for (const msg of session.messages) {
    const roleLabel = msg.role === "user" ? "👤 Kullanıcı" : "🤖 Life OS AI";
    lines.push(`### ${roleLabel} (${msg.timestamp || ""})`);
    lines.push(``);

    if (msg.attachments && msg.attachments.length > 0) {
      lines.push(`*Ekli Dosyalar:*`);
      for (const att of msg.attachments) {
        lines.push(`- 📎 **${att.name}** (${att.type}, ${(att.size / 1024).toFixed(1)} KB)`);
      }
      lines.push(``);
    }

    if (msg.thinking) {
      lines.push(`> 💭 **Düşünce Süreci:**`);
      lines.push(
        msg.thinking
          .split("\n")
          .map((l) => `> ${l}`)
          .join("\n"),
      );
      lines.push(``);
    }

    lines.push(msg.content);
    lines.push(``);
  }

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

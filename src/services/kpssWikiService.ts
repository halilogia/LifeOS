/**
 * kpssWikiService.ts
 * Service layer for KPSS Ders Notları (Wiki/Article Note System).
 * Manages storage persistence via IWikiNoteRepository, markdown rendering,
 * headings extraction, and Wikilinks.
 */

import { renderMarkdown } from "@/utils/markdownRenderer.js";
import type { IWikiNoteRepository } from "@/domain/repositories/IWikiNoteRepository.js";
import type { KpssWikiNote, HeadingItem } from "@/types/kpss.js";

export type { KpssWikiNote, HeadingItem } from "@/types/kpss.js";

/**
 * Extract Title from content: extracts ONLY the very first word!
 * e.g. "Maki ailesinin..." -> "Maki"
 */
export function extractTitleFromContent(content: string): string {
  if (!content) {
    return "";
  }
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    const clean = trimmed
      .replace(/^#+\s*/, "")
      .replace(/^[:\-*_`]+/, "")
      .trim();
    if (!clean) {
      continue;
    }
    const words = clean.split(/\s+/);
    if (words.length > 0 && words[0]) {
      return words[0].replace(/[,;:!"'()]/g, "").trim();
    }
  }
  return "";
}

/**
 * Extract H1, H2, H3 headings from markdown content
 */
export function extractHeadings(content: string): HeadingItem[] {
  if (!content) {
    return [];
  }
  const lines = content.split("\n");
  const headings: HeadingItem[] = [];
  lines.forEach((l) => {
    const m = l.match(/^(#{1,3})\s+(.+)$/);
    if (m) {
      headings.push({
        level: m[1].length,
        text: m[2].replace(/[*_[\]]/g, "").trim(),
      });
    }
  });
  return headings;
}

/**
 * Extract the first Image URL from markdown content for Infobox Featured Header
 */
export function extractFirstImageUrl(content: string): string | null {
  if (!content) {
    return null;
  }
  const mdImgMatch = content.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/i);
  if (mdImgMatch && mdImgMatch[1]) {
    return mdImgMatch[1];
  }
  const plainUrlMatch = content.match(
    /(https?:\/\/[^\s<>"]+\.(?:jpg|jpeg|png|gif|webp|svg)|https?:\/\/[^\s<>"']+images\?[^\s<>"']+|https?:\/\/[^\s<>"']+encrypted-tbn[^\s<>"']+)/i,
  );
  if (plainUrlMatch && plainUrlMatch[0]) {
    return plainUrlMatch[0];
  }
  return null;
}

/**
 * Render Markdown with custom styled links highlighted in blue.
 */
export function renderCustomArticleMarkdown(
  content: string,
  allNotes: KpssWikiNote[],
): string {
  if (!content) {
    return "";
  }
  const firstImg = extractFirstImageUrl(content);
  let processedContent = content;
  if (firstImg) {
    const escapedUrl = firstImg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const mdPattern = new RegExp(`!\\[.*?\\]\\(${escapedUrl}\\)`, "gi");
    const plainPattern = new RegExp(`^\\s*${escapedUrl}\\s*$`, "gim");
    processedContent = processedContent
      .replace(mdPattern, "")
      .replace(plainPattern, "");
  }
  processedContent = processedContent.replace(
    /^(https?:\/\/[^\s<>"]+\.(?:jpg|jpeg|png|gif|webp|svg)|https?:\/\/[^\s<>"']+images\?[^\s<>"']+|https?:\/\/[^\s<>"']+encrypted-tbn[^\s<>"']+)$/gim,
    (url) => `![Görsel](${url})`,
  );
  let html = renderMarkdown(processedContent);
  html = html.replace(
    /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_, title, display) => {
      const text = display || title;
      return `<a data-wiki-link="${escapeHtmlAttr(title)}" class="article-link" style="color: #60a5fa; cursor: pointer; text-decoration: underline; font-weight: 600;">${text}</a>`;
    },
  );
  allNotes.forEach((n) => {
    if (!n.title || n.title.trim().length < 3) {
      return;
    }
    const cleanTitle = n.title.trim();
    const escaped = cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    try {
      const regex = new RegExp(
        `(?<![\\p{L}\\p{N}])(${escaped})(?![\\p{L}\\p{N}])`,
        "gui",
      );
      html = html.replace(
        regex,
        (match) =>
          `<a data-wiki-link="${escapeHtmlAttr(cleanTitle)}" class="article-link" style="color: #60a5fa; cursor: pointer; text-decoration: underline; font-weight: 600;">${match}</a>`,
      );
    } catch {
      const regex = new RegExp(`\\b(${escaped})\\b`, "gi");
      html = html.replace(
        regex,
        (match) =>
          `<a data-wiki-link="${escapeHtmlAttr(cleanTitle)}" class="article-link" style="color: #60a5fa; cursor: pointer; text-decoration: underline; font-weight: 600;">${match}</a>`,
      );
    }
  });
  return html;
}

/**
 * Get human readable Turkish label for KPSS subject keys
 */
export function getSubjectLabel(subj: string): string {
  const labels: Record<string, string> = {
    tarih: "KPSS Tarih",
    cografya: "KPSS Coğrafya",
    vatandaslik: "KPSS Vatandaşlık",
    turkce: "KPSS Türkçe",
    matematik: "KPSS Matematik",
  };
  return labels[subj] || "Genel KPSS";
}

function escapeHtmlAttr(str: string): string {
  return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* ------------------------------------------------------------------ */
/* Factory — persistence goes through repository                       */
/* ------------------------------------------------------------------ */

export function createKpssWikiService(wikiRepo: IWikiNoteRepository) {
  return {
    /** Fetch all KPSS wiki notes from storage, cleaning legacy samples. */
    async getKpssWikiNotes(): Promise<KpssWikiNote[]> {
      const loaded = await wikiRepo.getAll();

      const cleaned = loaded.filter(
        (n) =>
          !["wiki-1", "wiki-2", "wiki-3"].includes(n.id) &&
          !n.title.includes("II. Mehmed") &&
          !n.title.includes("Coğrafi Konumu") &&
          !n.title.includes("Anayasa Hukuku"),
      );

      cleaned.forEach((n) => {
        if (n.title.length > 35) {
          const firstWord = extractTitleFromContent(n.content);
          n.title = firstWord || n.title.split(/\s+/)[0] || "Ders Notu";
        }
      });

      if (cleaned.length !== loaded.length) {
        await wikiRepo.saveAll(cleaned);
      }

      return cleaned.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime(),
      );
    },

    /** Save all KPSS wiki notes array. */
    saveKpssWikiNotes(notes: KpssWikiNote[]): Promise<void> {
      return wikiRepo.saveAll(notes);
    },

    /** Get Auto Title Setting. */
    getAutoTitleSetting(): Promise<boolean> {
      return wikiRepo.getAutoTitleSetting();
    },

    /** Save Auto Title Setting. */
    saveAutoTitleSetting(enabled: boolean): Promise<void> {
      return wikiRepo.saveAutoTitleSetting(enabled);
    },
  };
}

export type KpssWikiService = ReturnType<typeof createKpssWikiService>;

/* ------------------------------------------------------------------ */
/* Singleton with default repository                                   */
/* ------------------------------------------------------------------ */

import { ChromeStorageWikiNoteRepository } from "@/infrastructure/persistence/ChromeStorageWikiNoteRepository.js";

const _defaultWikiRepo = new ChromeStorageWikiNoteRepository();
const _defaultWikiService = createKpssWikiService(_defaultWikiRepo);

export const {
  getKpssWikiNotes,
  saveKpssWikiNotes,
  getAutoTitleSetting,
  saveAutoTitleSetting,
} = _defaultWikiService;

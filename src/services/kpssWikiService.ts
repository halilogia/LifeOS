/**
 * kpssWikiService.ts
 * Service layer for KPSS Ders Notları (Wiki/Article Note System).
 * Manages storage persistence, markdown rendering, headings extraction, and Wikilinks.
 */

import { renderMarkdown } from "@/utils/markdownRenderer.js";

export interface KpssWikiNote {
  id: string;
  title: string;
  subject: "tarih" | "cografya" | "vatandaslik" | "turkce" | "matematik";
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface HeadingItem {
  text: string;
  level: number;
}

const STORAGE_KEY = "kpss_wiki_notes";
const AUTO_TITLE_SETTING_KEY = "kpss_auto_title_enabled";

/**
 * Fetch all KPSS wiki notes from chrome.storage.sync
 */
export async function getKpssWikiNotes(): Promise<KpssWikiNote[]> {
  const res = await new Promise<any>((r) => chrome.storage.sync.get([STORAGE_KEY], r));
  let loaded: KpssWikiNote[] = res[STORAGE_KEY] || [];

  // Filter out legacy dummy sample notes if present
  const cleaned = loaded.filter(
    (n) =>
      !["wiki-1", "wiki-2", "wiki-3"].includes(n.id) &&
      !n.title.includes("II. Mehmed") &&
      !n.title.includes("Coğrafi Konumu") &&
      !n.title.includes("Anayasa Hukuku")
  );

  // Fix overly long corrupted paragraph titles (shorten to first word)
  cleaned.forEach((n) => {
    if (n.title.length > 35) {
      const firstWord = extractTitleFromContent(n.content);
      n.title = firstWord || n.title.split(/\s+/)[0] || "Ders Notu";
    }
  });

  if (cleaned.length !== loaded.length) {
    await saveKpssWikiNotes(cleaned);
  }

  return cleaned.sort(
    (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
  );
}

/**
 * Save all KPSS wiki notes array to chrome.storage.sync
 */
export async function saveKpssWikiNotes(notes: KpssWikiNote[]): Promise<void> {
  await new Promise<void>((r) => chrome.storage.sync.set({ [STORAGE_KEY]: notes }, r));
}

/**
 * Get Auto Title Setting from chrome.storage.sync (Default: false)
 */
export async function getAutoTitleSetting(): Promise<boolean> {
  const res = await new Promise<any>((r) => chrome.storage.sync.get([AUTO_TITLE_SETTING_KEY], r));
  return res[AUTO_TITLE_SETTING_KEY] === true;
}

/**
 * Save Auto Title Setting to chrome.storage.sync
 */
export async function saveAutoTitleSetting(enabled: boolean): Promise<void> {
  await new Promise<void>((r) => chrome.storage.sync.set({ [AUTO_TITLE_SETTING_KEY]: enabled }, r));
}

/**
 * Extract Title from content: extracts ONLY the very first word!
 * e.g. "Maki ailesinin..." -> "Maki"
 */
export function extractTitleFromContent(content: string): string {
  if (!content) return "";
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed) {
      const clean = trimmed.replace(/^#+\s*/, "").replace(/^[\:\-\*\_\`]+/, "").trim();
      if (!clean) continue;
      const words = clean.split(/\s+/);
      if (words.length > 0 && words[0]) {
        return words[0].replace(/[\,\.\:\;\!\?\"\'\(\)]/g, "").trim();
      }
    }
  }
  return "";
}

/**
 * Extract H1, H2, H3 headings from markdown content
 */
export function extractHeadings(content: string): HeadingItem[] {
  if (!content) return [];
  const lines = content.split("\n");
  const headings: HeadingItem[] = [];
  lines.forEach((l) => {
    const m = l.match(/^(#{1,3})\s+(.+)$/);
    if (m) {
      headings.push({
        level: m[1].length,
        text: m[2].replace(/[\*\_\[\]]/g, "").trim(),
      });
    }
  });
  return headings;
}

/**
 * Render Markdown with custom styled links highlighted in blue.
 * Auto-links [[Target Note]] and mentions of other note titles.
 */
export function renderCustomArticleMarkdown(content: string, allNotes: KpssWikiNote[]): string {
  if (!content) return "";
  let html = renderMarkdown(content);

  // 1. Process explicit [[Target Note|Display Name]] or [[Target Note]]
  html = html.replace(/\[\[([^\]\|]+)(?:\|([^\]]+))?\]\]/g, (_, title, display) => {
    const text = display || title;
    return `<a data-wiki-link="${escapeHtmlAttr(title)}" class="article-link" style="color: #60a5fa; cursor: pointer; text-decoration: underline; font-weight: 600;">${text}</a>`;
  });

  // 2. Auto-link mentions of existing note titles (e.g. "Çorum", "Manisa")
  allNotes.forEach((n) => {
    if (!n.title || n.title.trim().length < 3) return;
    const cleanTitle = n.title.trim();
    const escaped = cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b(${escaped})\\b`, "gi");

    html = html.replace(regex, (match) => {
      return `<a data-wiki-link="${escapeHtmlAttr(cleanTitle)}" class="article-link" style="color: #60a5fa; cursor: pointer; text-decoration: underline; font-weight: 600;">${match}</a>`;
    });
  });

  return html;
}

/**
 * Get human readable Turkish label for KPSS subject keys
 */
export function getSubjectLabel(subj: string): string {
  switch (subj) {
    case "tarih":
      return "KPSS Tarih";
    case "cografya":
      return "KPSS Coğrafya";
    case "vatandaslik":
      return "KPSS Vatandaşlık";
    case "turkce":
      return "KPSS Türkçe";
    case "matematik":
      return "KPSS Matematik";
    default:
      return "Genel KPSS";
  }
}

function escapeHtmlAttr(str: string): string {
  return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

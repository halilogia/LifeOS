/**
 * kpssWikiService.ts
 * Service layer for KPSS Ders Notları (Wiki/Article Note System).
 * Manages storage persistence via IWikiNoteRepository, markdown rendering,
 * headings extraction, and Wikilinks.
 */

import { renderMarkdown } from "@/utils/markdownRenderer.js";
import { escapeHtml, escapeHtmlAttr, sanitizeUrl } from "@/utils/sanitize.js";
import katex from "katex";
import "katex/dist/katex.min.css";
import type { IWikiNoteRepository } from "@/domain/repositories/IWikiNoteRepository.js";
import type { KpssWikiNote, HeadingItem } from "@/types/kpss.js";

export type { KpssWikiNote, HeadingItem } from "@/types/kpss.js";

/**
 * Extract Title from content: extracts the first meaningful line as title (no limit).
 * e.g. "Maki ailesinin özellikleri..." -> "Maki ailesinin özellikleri..."
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
    // İlk anlamlı satırın tamamını başlık yap — karakter sınırı yok
    return clean;
  }
  return "";
}

/**
 * Extract H1, H2, H3 headings from markdown content
 * "```sema" / "```harita" bloklarının içindeki başlıklar hariç tutulur
 * (şema/harita başlığı İçindekiler'e karışmasın).
 */
export function extractHeadings(content: string): HeadingItem[] {
  if (!content) {
    return [];
  }
  const lines = content.split("\n");
  const headings: HeadingItem[] = [];
  let inBlock = false;
  lines.forEach((l) => {
    const trimmed = l.trim();
    if (/^```(sema|harita)\s*$/.test(trimmed)) {
      inBlock = true;
      return;
    }
    if (inBlock && /^```\s*$/.test(trimmed)) {
      inBlock = false;
      return;
    }
    if (inBlock) {
      return;
    }
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
 * `currentTitle` verilirse o başlığa yapılan otomatik bağlantılar
 * linke çevrilmez — not kendi başlığını kendine bağlamaz.
 * (Açık [[...]] wikilink'leri yine de link olarak kalır.)
 */
export function renderCustomArticleMarkdown(
  content: string,
  allNotes: KpssWikiNote[],
  currentTitle?: string,
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
  // ── Dipnot mekanizması ─────────────────────────────────────────
  // Paragraf içine yazılan ham URL'ler otomatik tespit edilir:
  // gövdede üst simge [!], sayfa sonunda "Kaynaklar" listesi.
  const footnotes: string[] = [];
  // http(s)://..., www....  veya  domain.tld/path şeklindeki ham URL'ler
  const urlRe =
    /(?:https?:\/\/|www\.)[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+|(?:[A-Za-z0-9-]+\.)+[A-Za-z0-9-]+\.[a-z]{2,}(?:\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+)?/gi;
  processedContent = processedContent.replace(urlRe, (urlRaw) => {
    // Zaten Markdown link/image syntax'ı içinde olan URL'leri atla
    const trimmed = urlRaw.trim();
    if (
      trimmed.endsWith(")") ||
      trimmed.endsWith("]") ||
      trimmed.startsWith("![") ||
      trimmed.startsWith("[")
    ) {
      return urlRaw;
    }
    // cümle sonu noktası/noktalama varsa temizle
    const clean = trimmed.replace(/[.,;:!?]+$/g, "");
    if (/\.[a-z]{2,}(?:\/|$)/i.test(clean) || /^https?:\/\//i.test(clean)) {
      footnotes.push(clean);
      return `\uFFF9FOOT${footnotes.length}\uFFFA`;
    }
    return urlRaw;
  });

  let html = renderMarkdown(processedContent);

  // Placeholder → üst simge referans
  html = html.replace(/\uFFF9FOOT(\d+)\uFFFA/g, (_, idx) => {
    return `<sup data-footnote="${idx}" style="color:#60a5fa;font-weight:700;font-size:0.62rem;cursor:pointer;margin-left:1px;">[${idx}]</sup>`;
  });
  // Sayfa sonunda Kaynaklar listesi
  if (footnotes.length > 0) {
    const list = footnotes
      .map((rawUrl, i) => {
        const fullUrl = /^https?:\/\//i.test(rawUrl)
          ? rawUrl
          : "https://" + rawUrl;
        const safeHref = sanitizeUrl(fullUrl);
        const safeDisplay = escapeHtml(rawUrl);
        return (
          `<div style="display:flex;gap:8px;align-items:flex-start;font-size:0.78rem;color:var(--text-secondary);line-height:1.5;margin-top:3px;">` +
          `<span style="color:#60a5fa;font-weight:700;flex-shrink:0;">[${i + 1}]</span>` +
          `<a href="${safeHref}" target="_blank" rel="noopener noreferrer" style="color:#60a5fa;text-decoration:underline;word-break:break-all;">${safeDisplay}</a>` +
          `</div>`
        );
      })
      .join("");
    html +=
      `<div style="margin-top:20px;padding-top:14px;border-top:1px solid var(--card-border);">` +
      `<div style="color:#94a3b8;font-weight:700;font-size:0.72rem;letter-spacing:0.4px;margin-bottom:6px;">Kaynaklar</div>` +
      list +
      `</div>`;
  }
  html = html.replace(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g, (match) => {
    const isBlock = match.startsWith("$$") && match.endsWith("$$");
    const math = isBlock ? match.slice(2, -2) : match.slice(1, -1);
    try {
      const rendered = katex.renderToString(math, {
        displayMode: isBlock,
        throwOnError: false,
      });
      return isBlock
        ? `<div style="margin:10px 0;overflow-x:auto;">${rendered}</div>`
        : rendered;
    } catch {
      return match;
    }
  });

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
    // Not kendi başlığını kendine bağlamaz — düz metin kalır
    if (
      currentTitle &&
      n.title.trim().toLocaleLowerCase("tr-TR") ===
        currentTitle.trim().toLocaleLowerCase("tr-TR")
    ) {
      return;
    }
    const cleanTitle = n.title.trim();
    const escaped = cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    try {
      const regex = new RegExp(
        `(?<![\\p{L}\\p{N}])(${escaped})(?![\\p{L}\\p{N}])`,
        "gui",
      );
      html = html.replace(regex, (match, _g, offset, str) => {
        // Zaten <a> veya KaTeX span içinde olan eşleşmeleri atla
        const before = str.slice(0, offset);
        const after = str.slice(offset + match.length);
        if (
          before.lastIndexOf("<a") > before.lastIndexOf("</a>") ||
          after.indexOf("</a>") < after.indexOf("<a") ||
          before.lastIndexOf("=") > before.lastIndexOf(">") ||
          before.lastIndexOf('<span class="katex"') >
            before.lastIndexOf("</span>")
        ) {
          return match;
        }
        return `<a data-wiki-link="${escapeHtmlAttr(cleanTitle)}" class="article-link" style="color: #60a5fa; cursor: pointer; text-decoration: underline; font-weight: 600;">${match}</a>`;
      });
    } catch {
      const regex = new RegExp(`\\b(${escaped})\\b`, "gi");
      html = html.replace(regex, (match, _g, offset, str) => {
        const before = str.slice(0, offset);
        const after = str.slice(offset + match.length);
        if (
          before.lastIndexOf("<a") > before.lastIndexOf("</a>") ||
          after.indexOf("</a>") < after.indexOf("<a") ||
          before.lastIndexOf('<span class="katex"') >
            before.lastIndexOf("</span>")
        ) {
          return match;
        }
        return `<a data-wiki-link="${escapeHtmlAttr(cleanTitle)}" class="article-link" style="color: #60a5fa; cursor: pointer; text-decoration: underline; font-weight: 600;">${match}</a>`;
      });
    }
  });

  return html;
}

/**
 * Get human readable Turkish label for KPSS subject keys
 */
export function getSubjectLabel(subj: string): string {
  const labels: Record<string, string> = {
    tarih: "Tarih",
    cografya: "Coğrafya",
    vatandaslik: "Vatandaşlık",
    turkce: "Türkçe",
    matematik: "Matematik",
  };
  return labels[subj] || "Genel";
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

      // Not: başlık kırpma bilinçli olarak kaldırıldı — manuel başlıklara asla dokunulmaz.

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
      scheduleCloudBackup();
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

/**
 * Build hierarchical tree from flat notes array using parentId.
 * Roots = notes without parentId (or parent missing). Children nested under parents.
 */
export interface WikiTreeNode {
  note: KpssWikiNote;
  children: WikiTreeNode[];
}

export function buildWikiTree(notes: KpssWikiNote[]): WikiTreeNode[] {
  const map = new Map<string, WikiTreeNode>();
  notes.forEach((n) => map.set(n.id, { note: n, children: [] }));
  const roots: WikiTreeNode[] = [];
  map.forEach((node) => {
    const parentId = node.note.parentId;
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

/* ------------------------------------------------------------------ */
/* Singleton with default repository                                   */
/* ------------------------------------------------------------------ */

import { ChromeStorageWikiNoteRepository } from "@/infrastructure/persistence/repositories/ChromeStorageWikiNoteRepository.js";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

const _defaultWikiRepo = new ChromeStorageWikiNoteRepository();
const _defaultWikiService = createKpssWikiService(_defaultWikiRepo);

export const {
  getKpssWikiNotes,
  saveKpssWikiNotes,
  getAutoTitleSetting,
  saveAutoTitleSetting,
} = _defaultWikiService;

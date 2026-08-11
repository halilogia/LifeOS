/**
 * facebookCleaner.ts
 * Real-time Facebook Reels / Short Video purger.
 * CSS selector'larının yakalayamadığı durumlar için JS tabanlı tarama:
 * href, aria-label ve görünür text ("Reels", "Reels Videosu") bazlı.
 * Element SİLMEZ — stil gizleme (mute), React re-render'a dayanıklı.
 */

import { DistractionSettings } from "./detoxTypes.js";

const REELS_LINK_SELECTOR =
  "a[href*='/reels/'], a[href*='/reel/'], a[href*='reels/']";
const REELS_LABEL_SELECTOR =
  '[aria-label*="Reels" i], [aria-label*="Reel" i], [aria-label*="Videos cortos" i]';
const REELS_BLOCK_SELECTOR =
  'div[data-pagelet*="Reels"], div[aria-label*="Reels" i], div[data-nosnippet]:has(a[href*="/reels/"])';

// Görünür UI label'ları — sadece kısa nav/tab text'leri (yorum metinleri değil)
const REELS_TEXT_MATCHES = new Set([
  "reels",
  "reel",
  "reels videosu",
  "reels videosu izle",
  "reels video",
  "watch reels",
  "videos cortos",
]);

function hideElement(el: Element): void {
  const htmlEl = el as HTMLElement;
  htmlEl.style.setProperty("display", "none", "important");
  htmlEl.style.setProperty("visibility", "hidden", "important");
}

/**
 * Elementi + en yakın tıklanabilir üst container'ı gizler
 * (role=tab, tablist, navigation, a, button).
 */
function hideUpToInteractive(el: Element): void {
  hideElement(el);
  let parent = el.parentElement;
  let depth = 0;
  while (parent && depth < 8) {
    const tag = parent.tagName;
    const role = parent.getAttribute("role") || "";
    const dataPagelet = parent.getAttribute("data-pagelet") || "";
    if (
      tag === "A" ||
      tag === "BUTTON" ||
      role === "tab" ||
      role === "tablist" ||
      role === "navigation" ||
      dataPagelet.toLowerCase().includes("reel")
    ) {
      hideElement(parent);
      break;
    }
    parent = parent.parentElement;
    depth++;
  }
}

function cleanTextLabels(): void {
  // a / tab / nav bağlamındaki kısa text'leri tara
  const textCandidates = document.querySelectorAll(
    'a span[dir="auto"], a div[dir="auto"], div[role="tab"] span[dir="auto"], div[role="navigation"] span[dir="auto"], div[role="navigation"] div[dir="auto"]',
  );
  textCandidates.forEach((span) => {
    const text = (span.textContent || "").trim().toLowerCase();
    if (!text || text.length > 40) {
      return; // uzun metin = yorum/feed içeriği, atla
    }
    if (REELS_TEXT_MATCHES.has(text)) {
      const link = span.closest("a");
      if (link) {
        hideUpToInteractive(link);
      } else {
        const tab = span.closest("div[role='tab']");
        if (tab) {
          hideUpToInteractive(tab);
        } else {
          hideElement(span);
        }
      }
    }
  });
}

export function cleanFacebookReels(currentSettings: DistractionSettings): void {
  const hostname = window.location.hostname;
  if (!hostname.includes("facebook.com")) {
    return;
  }
  if (!currentSettings.fbReelsBlock) {
    return;
  }

  // 1. Link bazlı (href)
  document.querySelectorAll(REELS_LINK_SELECTOR).forEach((el) => {
    hideUpToInteractive(el);
  });

  // 2. aria-label bazlı
  document.querySelectorAll(REELS_LABEL_SELECTOR).forEach((el) => {
    hideUpToInteractive(el);
  });

  // 3. Bölüm bazlı (feed carousel, data-pagelet)
  document.querySelectorAll(REELS_BLOCK_SELECTOR).forEach((el) => {
    hideElement(el);
  });

  // 4. Görünür text bazlı ("Reels Videosu" vb.)
  cleanTextLabels();
}

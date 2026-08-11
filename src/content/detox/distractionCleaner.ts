/**
 * distractionCleaner.ts
 * Social Media Distraction-Free & Anti-Doomscrolling Content Script Engine.
 * Clean Architecture - Content Script Module.
 * Hides Shorts, Reels, Endless Feeds, and injects clean Motivational Quote Banners.
 */

export interface DistractionSettings {
  ytShortsBlock: boolean;
  ytFeedBlock: boolean;
  ytCommentsBlock: boolean;
  igReelsBlock: boolean;
  igExploreBlock: boolean;
  igFeedBlock: boolean;
  fbReelsBlock: boolean;
  fbFeedBlock: boolean;
  ttFeedBlock: boolean;
  xFeedBlock: boolean;
  xExploreBlock: boolean;
}

const DEFAULT_DISTRACTION_SETTINGS: DistractionSettings = {
  ytShortsBlock: true,
  ytFeedBlock: true,
  ytCommentsBlock: false,
  igReelsBlock: true,
  igExploreBlock: false,
  igFeedBlock: false,
  fbReelsBlock: true,
  fbFeedBlock: false,
  ttFeedBlock: true,
  xFeedBlock: false,
  xExploreBlock: false,
};

const DEFAULT_QUOTES = [
  {
    text: "We must overcome the notion that we must be regular. It robs you of the chance to be extraordinary and leads you to the mediocre.",
    author: "Uta Hagen",
  },
  {
    text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
  },
  {
    text: "It is not that we have a short time to live, but that we waste a lot of it.",
    author: "Seneca",
  },
  {
    text: "Focus is a muscle. The more you practice saying no to distractions, the stronger it gets.",
    author: "Life OS Mindset",
  },
];

let activeStyleEl: HTMLStyleElement | null = null;
let currentSettings: DistractionSettings = DEFAULT_DISTRACTION_SETTINGS;

function getOrCreateStyleElement(): HTMLStyleElement {
  if (!activeStyleEl) {
    activeStyleEl = document.createElement("style");
    activeStyleEl.id = "lifeos-distraction-cleaner";
    const target = document.head || document.documentElement;
    if (target) {
      target.appendChild(activeStyleEl);
    }
  }
  return activeStyleEl;
}

function generateCSSRules(settings: DistractionSettings, hostname: string): string {
  const rules: string[] = [];

  // YouTube
  if (hostname.includes("youtube.com")) {
    if (settings.ytShortsBlock) {
      rules.push(`
        ytd-guide-entry-renderer:has(a[href*='/shorts']),
        ytd-mini-guide-entry-renderer:has(a[href*='/shorts']),
        ytd-rich-shelf-renderer[is-shorts],
        ytd-reel-shelf-renderer,
        ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]),
        a[id='endpoint'][title='Shorts'],
        a[aria-label='Shorts'] {
          display: none !important;
        }
      `);
    }
    if (settings.ytFeedBlock && (window.location.pathname === "/" || window.location.pathname === "/index.html")) {
      rules.push(`
        ytd-rich-grid-renderer {
          display: none !important;
        }
      `);
    }
    if (settings.ytCommentsBlock) {
      rules.push(`
        ytd-comments, #comments {
          display: none !important;
        }
      `);
    }
  }

  // Instagram
  if (hostname.includes("instagram.com")) {
    if (settings.igReelsBlock) {
      rules.push(`
        a[href*='/reels/'],
        a[aria-label*='Reels'],
        svg[aria-label='Reels'] {
          display: none !important;
        }
      `);
    }
    if (settings.igExploreBlock) {
      rules.push(`
        a[href*='/explore/'],
        a[aria-label*='Explore'],
        svg[aria-label='Explore'] {
          display: none !important;
        }
      `);
    }
    if (settings.igFeedBlock && window.location.pathname === "/") {
      rules.push(`
        main[role='main'] article,
        div[role='main'] section {
          display: none !important;
        }
      `);
    }
  }

  // Facebook
  if (hostname.includes("facebook.com")) {
    if (settings.fbReelsBlock) {
      rules.push(`
        a[href*='/reels/'],
        div[data-pagelet*='Reels'],
        div[aria-label*='Reels'] {
          display: none !important;
        }
      `);
    }
    if (settings.fbFeedBlock && window.location.pathname === "/") {
      rules.push(`
        div[role='feed'] {
          display: none !important;
        }
      `);
    }
  }

  // TikTok
  if (hostname.includes("tiktok.com")) {
    if (settings.ttFeedBlock) {
      rules.push(`
        div[data-e2e='recommend-list'],
        div[class*='DivItemContainer'],
        div[class*='DivFeedContainer'] {
          display: none !important;
        }
      `);
    }
  }

  // Twitter / X
  if (hostname.includes("x.com") || hostname.includes("twitter.com")) {
    if (
      settings.xFeedBlock &&
      (window.location.pathname.startsWith("/home") ||
        window.location.pathname === "/" ||
        window.location.pathname.startsWith("/i/timeline"))
    ) {
      rules.push(`
        div[data-testid='primaryColumn'] section[role='region'],
        div[data-testid='primaryColumn'] div[data-testid='cellInnerSequence'],
        div[aria-label*='timeline' i],
        div[aria-label*='zaman akışı' i],
        div[aria-label*='akış' i],
        main[role='main'] section[role='region'] {
          display: none !important;
        }
      `);
    }
    if (settings.xExploreBlock) {
      rules.push(`
        a[href*='/explore'],
        a[data-testid='AppTabBar_Explore_Link'],
        a[aria-label*='Explore' i],
        a[aria-label*='Keşfet' i],
        div[data-testid='sidebarColumn'],
        div[aria-label*='trending' i],
        div[aria-label*='gündem' i],
        div[aria-label*='neler oluyor' i],
        section[aria-label*='gündem' i],
        section[aria-label*='trending' i] {
          display: none !important;
        }
      `);
    }
  }

  return rules.join("\n");
}

function applyCSSRules(): void {
  const styleEl = getOrCreateStyleElement();
  const hostname = window.location.hostname;
  styleEl.textContent = generateCSSRules(currentSettings, hostname);
}

function injectYouTubeQuoteBanner(): void {
  const hostname = window.location.hostname;
  if (
    !hostname.includes("youtube.com") ||
    !currentSettings.ytFeedBlock ||
    (window.location.pathname !== "/" && window.location.pathname !== "/index.html")
  ) {
    const existing = document.getElementById("lifeos-yt-quote-card");
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
    return;
  }

  if (document.getElementById("lifeos-yt-quote-card")) {
    return;
  }

  const primaryContainer =
    document.querySelector("ytd-browse[page-subtype='home'] #primary") ||
    document.querySelector("ytd-browse[page-subtype='home']") ||
    document.querySelector("#primary");

  if (!primaryContainer) {
    return;
  }

  const randomQuote =
    DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)];

  const card = document.createElement("div");
  card.id = "lifeos-yt-quote-card";
  card.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 36px;
    margin: 60px auto;
    max-width: 680px;
    background: radial-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05);
    border-radius: 20px;
    color: #f8fafc;
    font-family: Georgia, serif;
    text-align: center;
    backdrop-filter: blur(12px);
    transition: all 0.3s ease;
  `;

  card.innerHTML = `
    <div style="margin-bottom: 16px; color: #60a5fa;">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    </div>
    <blockquote style="margin: 0 0 20px; font-size: 1.25rem; line-height: 1.6; font-style: italic; color: #f1f5f9; font-weight: 500;">
      “${cardEscapeHtml(randomQuote.text)}”
    </blockquote>
    <div style="font-size: 0.88rem; color: #94a3b8; font-weight: 600; font-family: system-ui, -apple-system, sans-serif; letter-spacing: 0.05em; text-transform: uppercase;">
      — ${cardEscapeHtml(randomQuote.author)}
    </div>
    <div style="display: inline-flex; align-items: center; gap: 6px; margin-top: 24px; padding: 6px 16px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 20px; font-size: 0.78rem; color: #60a5fa; font-family: system-ui, -apple-system, sans-serif; font-weight: 600;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      Life OS Anti-Doomscrolling Odak Modu Aktif
    </div>
  `;

  primaryContainer.prepend(card);
}

function injectTwitterQuoteBanner(): void {
  const hostname = window.location.hostname;
  if (
    (!hostname.includes("x.com") && !hostname.includes("twitter.com")) ||
    !currentSettings.xFeedBlock ||
    (!window.location.pathname.startsWith("/home") && window.location.pathname !== "/")
  ) {
    const existing = document.getElementById("lifeos-x-quote-card");
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
    return;
  }

  if (document.getElementById("lifeos-x-quote-card")) {
    return;
  }

  const primaryColumn =
    document.querySelector("div[data-testid='primaryColumn']") ||
    document.querySelector("main[role='main']");

  if (!primaryColumn) {
    return;
  }

  const randomQuote =
    DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)];

  const card = document.createElement("div");
  card.id = "lifeos-x-quote-card";
  card.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    margin: 40px auto;
    max-width: 560px;
    background: radial-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05);
    border-radius: 20px;
    color: #f8fafc;
    font-family: Georgia, serif;
    text-align: center;
    backdrop-filter: blur(12px);
    transition: all 0.3s ease;
  `;

  card.innerHTML = `
    <div style="margin-bottom: 16px; color: #38bdf8;">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    </div>
    <blockquote style="margin: 0 0 20px; font-size: 1.2rem; line-height: 1.6; font-style: italic; color: #f1f5f9; font-weight: 500;">
      “${cardEscapeHtml(randomQuote.text)}”
    </blockquote>
    <div style="font-size: 0.88rem; color: #94a3b8; font-weight: 600; font-family: system-ui, -apple-system, sans-serif; letter-spacing: 0.05em; text-transform: uppercase;">
      — ${cardEscapeHtml(randomQuote.author)}
    </div>
    <div style="display: inline-flex; align-items: center; gap: 6px; margin-top: 24px; padding: 6px 16px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 20px; font-size: 0.78rem; color: #38bdf8; font-family: system-ui, -apple-system, sans-serif; font-weight: 600;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      Life OS Anti-Doomscrolling Odak Modu Aktif
    </div>
  `;

  primaryColumn.prepend(card);
}

function cardEscapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function handleURLCheck(): void {
  const pathname = window.location.pathname;

  // Shorts redirect check
  if (
    currentSettings.ytShortsBlock &&
    window.location.hostname.includes("youtube.com") &&
    pathname.startsWith("/shorts")
  ) {
    window.location.href = "https://www.youtube.com/";
  }

  // Instagram Reels redirect check
  if (
    currentSettings.igReelsBlock &&
    window.location.hostname.includes("instagram.com") &&
    pathname.startsWith("/reels")
  ) {
    window.location.href = "https://www.instagram.com/";
  }
}

export function initDistractionCleaner(): void {
  const loadAndApplySettings = () => {
    try {
      if (!chrome.runtime?.id) {
        return;
      }
      chrome.storage.local.get(["detox_distraction_settings"], (res) => {
        if (chrome.runtime.lastError || !chrome.runtime?.id) {
          return;
        }
        if (res.detox_distraction_settings) {
          currentSettings = {
            ...DEFAULT_DISTRACTION_SETTINGS,
            ...res.detox_distraction_settings,
          };
        }
        applyCSSRules();
        injectYouTubeQuoteBanner();
        injectTwitterQuoteBanner();
        handleURLCheck();
      });
    } catch {
      // Extension context invalidated
    }
  };

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes["detox_distraction_settings"]) {
      loadAndApplySettings();
    }
    if (areaName === "sync" && changes["detox_distraction_settings"]) {
      loadAndApplySettings();
    }
  });

  loadAndApplySettings();

  // Periodic DOM check for SPA navigation & dynamically rendered YouTube/X Home Grids
  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      handleURLCheck();
      applyCSSRules();
    }
    injectYouTubeQuoteBanner();
    injectTwitterQuoteBanner();
  }, 1000);
}

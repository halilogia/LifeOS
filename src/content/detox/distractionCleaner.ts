/**
 * distractionCleaner.ts
 * Main Orchestrator for Social Media Distraction-Free & Anti-Doomscrolling Content Script Engine.
 * SSM (Saner Social Media) araştırması sonrası: element silme yerine CONTAINER gizleme tekniği.
 * Clean Architecture - Content Script Orchestrator.
 */

import {
  DEFAULT_DISTRACTION_SETTINGS,
  DistractionSettings,
  QuoteItem,
} from "./cleaners/detoxTypes.js";
import {
  injectTwitterQuoteBanner,
  injectYouTubeQuoteBanner,
} from "./cleaners/detoxQuoteBanners.js";
import { cleanTwitterTimeline } from "./cleaners/twitterCleaner.js";

export type { DistractionSettings };

const WIDGET_ATTR = "data-lifeos-widget";

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

  // YouTube — SSM: #primary container'ı gizle (element değil)
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
    if (
      settings.ytFeedBlock &&
      (window.location.pathname === "/" || window.location.pathname === "/index.html")
    ) {
      rules.push(`
        ytd-browse[page-subtype="home"] #primary,
        ytd-browse[page-subtype='home'] #primary,
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

  // Instagram — SSM: main çocuklarını gizle (widget hariç)
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
        main[role='main'] > :not([${WIDGET_ATTR}]),
        main[role=main] > :not([${WIDGET_ATTR}]) {
          display: none !important;
        }
      `);
    }
  }

  // Facebook — SSM: feed container + yeni nesil hash class'ları
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
        div[role='feed'],
        #ssrb_feed_start + div,
        .x1hc1fzr.x1unhpq9.x6o7n8i {
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

  // Twitter / X — SSM: CONTAINER 0 boyut (element silme değil!)
  if (hostname.includes("x.com") || hostname.includes("twitter.com")) {
    if (settings.xFeedBlock) {
      rules.push(`
        [data-testid="primaryColumn"] > div:last-child > div:nth-child(5),
        [data-testid='primaryColumn'] > div:last-child > div:nth-child(5),
        main[role='main'] section[role='region'],
        div[data-testid='primaryColumn'] section[role='region'] {
          width: 0px !important;
          height: 0px !important;
          max-height: 0px !important;
          overflow: hidden !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
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
  let customQuotes: QuoteItem[] = [];

  const loadAndApplySettings = () => {
    try {
      if (!chrome.runtime?.id) {
        return;
      }
      chrome.storage.local.get(["detox_distraction_settings", "customQuotes"], (res) => {
        if (chrome.runtime.lastError || !chrome.runtime?.id) {
          return;
        }
        if (res.detox_distraction_settings) {
          currentSettings = {
            ...DEFAULT_DISTRACTION_SETTINGS,
            ...res.detox_distraction_settings,
          };
        }
        if (Array.isArray(res.customQuotes)) {
          customQuotes = res.customQuotes as QuoteItem[];
        }
        applyCSSRules();
        injectYouTubeQuoteBanner(currentSettings, customQuotes);
        injectTwitterQuoteBanner(currentSettings, customQuotes);
        handleURLCheck();
      });
    } catch {
      // Extension context invalidated
    }
  };

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (
      areaName === "local" &&
      (changes["detox_distraction_settings"] || changes["customQuotes"])
    ) {
      loadAndApplySettings();
    }
    if (areaName === "sync" && changes["detox_distraction_settings"]) {
      loadAndApplySettings();
    }
  });

  loadAndApplySettings();

  // SSM: SPA route change — popstate + polling (back/forward dahil)
  let lastPath = window.location.pathname;
  window.addEventListener("popstate", () => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      handleURLCheck();
      applyCSSRules();
    }
  });

  // MutationObserver for real-time instant DOM cleaning on React render cycles
  const observer = new MutationObserver(() => {
    cleanTwitterTimeline(currentSettings);
  });
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Periodic DOM check for SPA navigation & dynamically rendered YouTube/X Home Grids
  setInterval(() => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      handleURLCheck();
      applyCSSRules();
    }
    injectYouTubeQuoteBanner(currentSettings, customQuotes);
    injectTwitterQuoteBanner(currentSettings, customQuotes);
    cleanTwitterTimeline(currentSettings);
  }, 100);
}

/**
 * distractionCleaner.ts
 * Main Orchestrator for Social Media Distraction-Free & Anti-Doomscrolling Content Script Engine.
 * Clean Architecture - Content Script Orchestrator.
 */

import {
  DEFAULT_DISTRACTION_SETTINGS,
  DistractionSettings,
} from "./cleaners/detoxTypes.js";
import {
  injectTwitterQuoteBanner,
  injectYouTubeQuoteBanner,
} from "./cleaners/detoxQuoteBanners.js";
import { cleanTwitterTimeline } from "./cleaners/twitterCleaner.js";

export type { DistractionSettings };

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
    if (
      settings.ytFeedBlock &&
      (window.location.pathname === "/" || window.location.pathname === "/index.html")
    ) {
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
    if (settings.xFeedBlock) {
      rules.push(`
        article[data-testid='tweet'],
        div[data-testid='cellInnerSequence'],
        div[data-testid='primaryColumn'] section[role='region'],
        div[data-testid='primaryColumn'] div[aria-label*='Home Timeline' i],
        div[data-testid='primaryColumn'] div[aria-label*='Timeline' i],
        main[role='main'] section[role='region'],
        div[aria-label*='timeline' i],
        div[aria-label*='zaman akışı' i],
        div[aria-label*='akış' i],
        div[data-testid='primaryColumn'] > div > div > div > section,
        section[role='region']:has(article[data-testid='tweet']) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          max-height: 0 !important;
          overflow: hidden !important;
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
        injectYouTubeQuoteBanner(currentSettings);
        injectTwitterQuoteBanner(currentSettings);
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

  // MutationObserver for real-time instant DOM cleaning on React render cycles
  const observer = new MutationObserver(() => {
    cleanTwitterTimeline(currentSettings);
  });
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Periodic DOM check for SPA navigation & dynamically rendered YouTube/X Home Grids
  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      handleURLCheck();
      applyCSSRules();
    }
    injectYouTubeQuoteBanner(currentSettings);
    injectTwitterQuoteBanner(currentSettings);
    cleanTwitterTimeline(currentSettings);
  }, 300);
}

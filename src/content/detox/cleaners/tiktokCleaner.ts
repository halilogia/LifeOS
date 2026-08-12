/**
 * tiktokCleaner.ts
 * Real-time TikTok feed / video purger — JS tabanlı, MutationObserver ile.
 * SSM tekniği: element SİLMEZ — stil gizleme (mute), React re-render'a dayanıklı.
 * TikTok webapp sürekli deploy aldığı için class isimleri değişir;
 * bu cleaner çoklu fallback selector + rol/text bazlı tarama yapar.
 */

import { DistractionSettings } from "./detoxTypes.js";

function hideElement(el: Element): void {
  const htmlEl = el as HTMLElement;
  htmlEl.style.setProperty("display", "none", "important");
  htmlEl.style.setProperty("visibility", "hidden", "important");
  htmlEl.style.setProperty("height", "0px", "important");
  htmlEl.style.setProperty("max-height", "0px", "important");
  htmlEl.style.setProperty("overflow", "hidden", "important");
}

/**
 * TikTok ana feed container'ını gizler.
 * Modern TikTok webapp yapısı: CSS module hashed class'lar kullanır,
 * data-e2e attribute'ları kaldırıldı. DOM yapısı üzerinden tespit ederiz.
 */
function hideFeedContainer(): void {
  // Yaklaşım 1: Ana sayfa layout container'ı (en güvenilir)
  const layoutSelectors = [
    'div[class*="DivHomeContainer"]',
    'div[class*="DivMainContainer"]',
    'div[class*="DivBodyContainer"]',
    'div[class*="DivFeedContainer"]',
    'div[class*="DivContentContainer"]',
  ];

  for (const selector of layoutSelectors) {
    const containers = document.querySelectorAll(selector);
    containers.forEach((c) => {
      // İçerik doluyken gizle (boş div'leri pas geç)
      if (c.children.length > 0) {
        hideElement(c);
      }
    });
  }
}

/**
 * Video kartlarını tek tek gizler.
 * TikTok her videoyu ayrı bir card container'da render eder.
 */
function hideVideoCards(): void {
  const cardSelectors = [
    'div[class*="DivPlayerContainer"]',
    'div[class*="DivItemContainerV2"]',
    'div[class*="DivItemContainer"]',
    'div[class*="DivVideoContainer"]',
    'div[class*="DivCardContainer"]',
    'div[class*="DivFeedItem"]',
  ];

  for (const selector of cardSelectors) {
    const cards = document.querySelectorAll(selector);
    cards.forEach((card) => {
      // Sadece video içerenleri gizle (video tag'i varsa)
      const hasVideo = card.querySelector("video");
      const hasImg = card.querySelector("img[src*='p16-sign']");
      if (hasVideo || hasImg) {
        hideElement(card);
      }
    });
  }
}

/**
 * Sidebar / navigasyon öğelerini gizler
 */
function hideSidebar(): void {
  const sidebarSelectors = [
    'div[class*="DivSideBarContainer"]',
    'div[class*="DivNavContainer"]',
    'div[class*="DivLeftContainer"]',
    'nav[class*="NavContainer"]',
    'div[class*="DivMenuContainer"]',
  ];

  for (const selector of sidebarSelectors) {
    const sidebars = document.querySelectorAll(selector);
    sidebars.forEach((s) => hideElement(s));
  }
}

/**
 * Keşfet / senin için sekme içeriklerini gizler
 */
function hideExploreFeed(): void {
  // Sayfada görünen tüm büyük video container'larını tara
  const allDivs = document.querySelectorAll("div");
  allDivs.forEach((div) => {
    const htmlDiv = div as HTMLElement;
    // En az 200px yükseklik + video içeren container'lar = feed kartı
    const rect = htmlDiv.getBoundingClientRect();
    if (rect.height >= 200) {
      const video = div.querySelector("video");
      if (video && video.duration > 0) {
        hideElement(div);
      }
    }
  });
}

export function cleanTikTokFeed(currentSettings: DistractionSettings): void {
  const hostname = window.location.hostname;
  if (!hostname.includes("tiktok.com")) {
    return;
  }
  if (!currentSettings.ttFeedBlock) {
    return;
  }

  hideFeedContainer();
  hideVideoCards();
  hideSidebar();
  hideExploreFeed();
}

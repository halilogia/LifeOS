/**
 * rssFeedDiscovery.ts
 * Content script: aktif sayfanın DOM'undaki RSS/Atom feed link'lerini
 * (rel="alternate", type="application/rss+xml" | "application/atom+xml")
 * keşfeder. Sağ tık menüsünden tetiklenen RSS Kaydet akışı tarafından
 * çağrılır — ham sayfa URL'i yerine gerçek feed URL'i kaydedilir.
 */

const FEED_MIME_TYPES = [
  "application/rss+xml",
  "application/atom+xml",
  "application/rdf+xml",
  "application/xml",
  "text/xml",
];

function findFeedLink(): string | null {
  const links = Array.from(
    document.querySelectorAll(
      'link[rel~="alternate"][type], link[rel="alternate"]',
    ),
  );
  for (const el of links) {
    const type = (el.getAttribute("type") || "").toLowerCase();
    const href = el.getAttribute("href");
    if (!href) {
      continue;
    }
    if (FEED_MIME_TYPES.includes(type)) {
      try {
        return new URL(href, document.baseURI).toString();
      } catch {
        return href;
      }
    }
  }
  // Type yoksa link rel alternate + href sonu .rss / .xml / /feed / /rss olanları da dene
  for (const el of links) {
    const href = el.getAttribute("href");
    if (!href) {
      continue;
    }
    if (/\.(rss|xml|atom)(\?|#|$)/i.test(href) || /(\/feed|\/rss|\/atom)(\/|$|\?)/i.test(href)) {
      try {
        return new URL(href, document.baseURI).toString();
      } catch {
        return href;
      }
    }
  }
  return null;
}

export function initRssFeedDiscovery(): void {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message && message.type === "rss_discover_feed") {
      const url = findFeedLink();
      sendResponse({ url });
      return true;
    }
    return false;
  });
}

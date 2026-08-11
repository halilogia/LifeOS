/**
 * detoxQuoteBanners.ts
 * Motivational Quote Banners generator and DOM enforcer for YouTube and Twitter / X.
 */

import { DEFAULT_QUOTES, DistractionSettings } from "./detoxTypes.js";

export function cardEscapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function injectYouTubeQuoteBanner(currentSettings: DistractionSettings): void {
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
    padding: 40px 24px;
    margin: 40px auto;
    max-width: 600px;
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
    <div style="margin-bottom: 16px; color: #ef4444;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

export function injectTwitterQuoteBanner(currentSettings: DistractionSettings): void {
  const hostname = window.location.hostname;
  if (
    (!hostname.includes("x.com") && !hostname.includes("twitter.com")) ||
    !currentSettings.xFeedBlock
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

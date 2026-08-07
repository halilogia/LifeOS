/**
 * sanitize.ts
 * Centralized, safe HTML & Attribute sanitization utilities for XSS prevention.
 * (AGENTS.md Rules 4.2 & 4.4 Compliance)
 */

/**
 * Escapes HTML entity special characters in user text:
 * &, <, >, ", '
 */
export function escapeHtml(str: string): string {
  if (!str) {
    return "";
  }
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Escapes strings intended for HTML attribute values (e.g. data-*, title, href, alt).
 */
export function escapeHtmlAttr(str: string): string {
  return escapeHtml(str);
}

/**
 * Validates and sanitizes external URLs, allowing only safe protocols (http, https, mailto, tel).
 * Returns empty string or # if URL protocol is unsafe (e.g. javascript:, data:, vbscript:).
 */
export function sanitizeUrl(url: string): string {
  if (!url) {
    return "#";
  }
  const trimmed = String(url).trim();
  if (/^(?:https?|mailto|tel):/i.test(trimmed) || trimmed.startsWith("/")) {
    return escapeHtmlAttr(trimmed);
  }
  return "#";
}

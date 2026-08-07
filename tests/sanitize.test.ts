import { describe, it, expect } from "vitest";
import { escapeHtml, escapeHtmlAttr, sanitizeUrl } from "@/utils/sanitize.js";
import { renderMarkdown } from "@/utils/markdownRenderer.js";

describe("Sanitizer & XSS Prevention Utils", () => {
  describe("escapeHtml", () => {
    it("should escape special HTML characters", () => {
      const input = `<script>alert("xss") & 'test'</script>`;
      const output = escapeHtml(input);
      expect(output).not.toContain("<script>");
      expect(output).toContain("&lt;script&gt;");
      expect(output).toContain("&quot;xss&quot;");
      expect(output).toContain("&amp;");
      expect(output).toContain("&#x27;test&#x27;");
    });

    it("should return empty string for falsy input", () => {
      expect(escapeHtml("")).toBe("");
    });
  });

  describe("escapeHtmlAttr", () => {
    it("should escape quotes and ampersands in HTML attributes", () => {
      const input = `x" onload="alert(1)&`;
      const output = escapeHtmlAttr(input);
      expect(output).not.toContain('"');
      expect(output).toContain("&quot;");
      expect(output).toContain("&amp;");
    });
  });

  describe("sanitizeUrl", () => {
    it("should allow safe http and https protocols", () => {
      expect(sanitizeUrl("https://example.com/api")).toContain("https://example.com/api");
      expect(sanitizeUrl("http://localhost:3000")).toContain("http://localhost:3000");
    });

    it("should allow safe mailto and tel protocols", () => {
      expect(sanitizeUrl("mailto:user@example.com")).toContain("mailto:user@example.com");
      expect(sanitizeUrl("tel:+123456789")).toContain("tel:+123456789");
    });

    it("should block dangerous javascript: and data: protocols", () => {
      expect(sanitizeUrl("javascript:alert(1)")).toBe("#");
      expect(sanitizeUrl("JAVASCRIPT:alert(1)")).toBe("#");
      expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe("#");
      expect(sanitizeUrl("vbscript:msgbox(1)")).toBe("#");
    });

    it("should fallback to # for empty or missing url", () => {
      expect(sanitizeUrl("")).toBe("#");
    });
  });

  describe("renderMarkdown XSS Security", () => {
    it("should escape raw HTML tags in markdown text", () => {
      const markdown = `Hello <script>alert(1)</script> **world**`;
      const html = renderMarkdown(markdown);
      expect(html).not.toContain("<script>");
      expect(html).toContain("&lt;script&gt;");
      expect(html).toContain("<strong>world</strong>");
    });

    it("should sanitize unsafe link hrefs in markdown links", () => {
      const markdown = `[Click Here](javascript:alert('xss'))`;
      const html = renderMarkdown(markdown);
      expect(html).not.toContain("javascript:alert");
      expect(html).toContain('href="#"');
    });

    it("should sanitize image src in markdown images and escape quotes in alt", () => {
      const markdown = `![my "alt" text](javascript:alert(1))`;
      const html = renderMarkdown(markdown);
      expect(html).not.toContain("javascript:alert");
      expect(html).toContain('alt="my &quot;alt&quot; text"');
    });
  });
});

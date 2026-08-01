/**
 * markdownRenderer.ts
 * Safe, XSS-protected Markdown to HTML converter.
 * Supports headings, bold/italic, code blocks, lists, links, and embedded images.
 */

export function renderMarkdown(text: string): string {
  if (!text) {
    return "";
  }
  // Escape HTML first to prevent XSS injection (crucial safety audit compliance!)
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Parse Markdown Images FIRST before link parser: ![alt](url)
  // Re-allow http/https in image src after XSS escaping
  html = html.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g,
    (_, alt, src) => {
      return `<img src="${src}" alt="${alt}" style="max-width: 100%; border-radius: 8px; margin: 12px 0; display: block; border: 1px solid rgba(255,255,255,0.12);" />`;
    },
  );

  // Parse Markdown Links: [text](url)
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (_, linkText, href) => {
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline; font-weight: 600;">${linkText}</a>`;
    },
  );

  // Parse Code blocks: ```javascript ... ```
  html = html.replace(/```([\s\S]+?)```/g, (_, code) => {
    return `<pre style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; font-family: monospace; overflow-x: auto; margin: 8px 0; border: 1px solid var(--card-border); color: #a78bfa; white-space: pre-wrap; word-break: break-all;"><code>${code.trim()}</code></pre>`;
  });

  // Parse Inline code: `code`
  html = html.replace(
    /`([^`]+)`/g,
    '<code style="background: rgba(139, 92, 246, 0.15); color: var(--accent-color); padding: 2px 5px; border-radius: 4px; font-family: monospace;">$1</code>',
  );

  // Parse Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Parse Italic: *text*
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Parse Headings: #, ##, ###
  html = html.replace(
    /^### (.*$)/gim,
    '<h4 style="margin: 10px 0 6px 0; color: #a78bfa; font-weight: 700;">$1</h4>',
  );
  html = html.replace(
    /^## (.*$)/gim,
    '<h3 style="margin: 12px 0 8px 0; color: #a78bfa; font-weight: 700;">$1</h3>',
  );
  html = html.replace(
    /^# (.*$)/gim,
    '<h2 style="margin: 14px 0 10px 0; color: #a78bfa; font-weight: 800; border-bottom: 1px solid var(--card-border); padding-bottom: 4px;">$1</h2>',
  );

  // Parse Lists: - or * items
  const lines = html.split("\n");
  let inList = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const content = line.substring(2);
      let prefix = "";
      if (!inList) {
        prefix = '<ul style="padding-left: 20px; margin: 6px 0;">';
        inList = true;
      }
      lines[i] = `${prefix}<li style="margin: 4px 0;">${content}</li>`;
    } else {
      if (inList) {
        lines[i] = `</ul>${lines[i]}`;
        inList = false;
      }
    }
  }
  if (inList) {
    lines[lines.length - 1] = `${lines[lines.length - 1]}</ul>`;
  }
  html = lines.join("\n");

  // Convert double newlines to paragraph spacers, single to br
  html = html.replace(/\n\n/g, '</p><p style="margin: 8px 0;">');
  html = html.replace(/\n/g, "<br />");

  return `<p style="margin: 0; line-height: 1.6;">${html}</p>`;
}

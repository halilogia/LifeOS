/**
 * pageContextExtractor.ts
 * Sayfa bağlamı (context) çıkarıcı — başlık, URL, metin, form elementleri.
 * Parça: domAgentEngine barrel re-export eder.
 */

export interface PageElementInfo {
  tag: string;
  id?: string;
  className?: string;
  text?: string;
  label?: string;
  placeholder?: string;
  type?: string;
  selector: string;
}

export interface PageContext {
  title: string;
  url: string;
  domain: string;
  selectedText: string;
  pageText: string;
  interactiveElements: PageElementInfo[];
}

/**
 * Extracts comprehensive page context and form field structure from active DOM.
 */
export function getPageContext(): PageContext {
  const title = document.title || "";
  const url = window.location.href || "";
  const domain = window.location.hostname.replace("www.", "");
  const selectedText = window.getSelection()?.toString().trim() || "";

  // Extract clean visible text content (exclude scripts, styles, boilerplate headers & footers)
  const cloneBody = document.body
    ? (document.body.cloneNode(true) as HTMLElement)
    : null;
  let pageText = "";
  if (cloneBody) {
    const junkElements = cloneBody.querySelectorAll(
      "script, style, noscript, svg, iframe, nav, footer, .footer, #footer, .sidebar-nav",
    );
    junkElements.forEach((el) => el.remove());
    pageText = cloneBody.innerText.replace(/\s+/g, " ").trim().slice(0, 3000);
  }

  // Find interactive elements and form inputs (supports Google Forms, HTML5 forms & custom React/Vue inputs)
  const elements: PageElementInfo[] = [];
  const query =
    "input, textarea, select, button, a[href], [role='button'], [role='textbox'], [contenteditable='true']";
  const nodes = Array.from(document.querySelectorAll(query)).slice(0, 75);

  nodes.forEach((node, idx) => {
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const isFormInput =
      tag === "input" || tag === "textarea" || tag === "select";

    // Skip hidden elements except form inputs that might be dynamically styled
    if (!isFormInput && !el.offsetWidth && !el.offsetHeight) {
      return;
    }
    if (
      el.style.display === "none" ||
      (el as HTMLInputElement).type === "hidden"
    ) {
      return;
    }

    const id = el.id ? `#${el.id}` : "";
    const placeholder = (el as HTMLInputElement).placeholder || "";
    const type = (el as HTMLInputElement).type || "";
    const text = (
      el.innerText ||
      (el as HTMLInputElement).value ||
      placeholder ||
      ""
    )
      .trim()
      .slice(0, 40);

    // Detect field label (Aria, Label tag, or nearby text wrapper)
    let label = "";
    if (el.getAttribute("aria-label")) {
      label = el.getAttribute("aria-label") || "";
    } else if (el.id) {
      const lblEl = document.querySelector(`label[for="${el.id}"]`);
      if (lblEl) {
        label = (lblEl as HTMLElement).innerText || "";
      }
    }

    if (!label) {
      const container = el.closest(".form-group, .field, label, div, p");
      if (container) {
        const heading = container.querySelector(
          "label, span, p, h1, h2, h3, h4, h5, h6",
        );
        if (heading && heading !== el) {
          label = (heading as HTMLElement).innerText || "";
        }
      }
    }

    // Generate unique CSS selector fallback
    let selector = id;
    if (!selector) {
      const nameAttr = el.getAttribute("name");
      if (nameAttr) {
        selector = `${tag}[name='${nameAttr}']`;
      } else if (placeholder) {
        selector = `${tag}[placeholder='${placeholder}']`;
      } else if (el.getAttribute("aria-label")) {
        selector = `${tag}[aria-label='${el.getAttribute("aria-label")}']`;
      } else if (el.className && typeof el.className === "string") {
        const firstClass = el.className.split(" ")[0];
        if (firstClass && !firstClass.includes(":")) {
          selector = `${tag}.${firstClass}`;
        }
      }
      if (!selector) {
        selector = `${tag}:nth-of-type(${idx + 1})`;
      }
    }

    elements.push({
      tag,
      id: el.id || undefined,
      className: el.className || undefined,
      text: text || undefined,
      label: label.trim() || undefined,
      placeholder: placeholder || undefined,
      type: type || undefined,
      selector,
    });
  });

  return {
    title,
    url,
    domain,
    selectedText,
    pageText,
    interactiveElements: elements,
  };
}

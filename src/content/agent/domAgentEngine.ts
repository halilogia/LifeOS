/**
 * domAgentEngine.ts
 * DOM inspection, element highlighting, and browser action execution engine.
 * Clean Architecture - Content Script Module.
 */

export interface PageElementInfo {
  tag: string;
  id?: string;
  className?: string;
  text?: string;
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

export interface AgentActionPayload {
  actionType: "click" | "type" | "scroll" | "extract" | "highlight";
  selector?: string;
  targetText?: string;
  textValue?: string;
  direction?: "up" | "down";
}

/**
 * Extracts comprehensive page context from active DOM.
 */
export function getPageContext(): PageContext {
  const title = document.title || "";
  const url = window.location.href || "";
  const domain = window.location.hostname.replace("www.", "");
  const selectedText = window.getSelection()?.toString().trim() || "";

  // Extract clean visible text content (exclude scripts, styles)
  const cloneBody = document.body ? (document.body.cloneNode(true) as HTMLElement) : null;
  let pageText = "";
  if (cloneBody) {
    const junkElements = cloneBody.querySelectorAll("script, style, noscript, svg, iframe");
    junkElements.forEach((el) => el.remove());
    pageText = cloneBody.innerText.replace(/\s+/g, " ").trim().slice(0, 4000);
  }

  // Find interactive elements (buttons, inputs, links, forms)
  const elements: PageElementInfo[] = [];
  const query = "button, a[href], input, textarea, select, [role='button']";
  const nodes = Array.from(document.querySelectorAll(query)).slice(0, 40);

  nodes.forEach((node, idx) => {
    const el = node as HTMLElement;
    if (!el.offsetWidth && !el.offsetHeight) {
      return; // Skip hidden elements
    }

    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : "";
    const text = (el.innerText || (el as HTMLInputElement).value || (el as HTMLInputElement).placeholder || "").trim().slice(0, 40);
    const placeholder = (el as HTMLInputElement).placeholder || "";
    const type = (el as HTMLInputElement).type || "";

    // Generate unique CSS selector fallback
    let selector = id;
    if (!selector) {
      if (el.className && typeof el.className === "string") {
        const firstClass = el.className.split(" ")[0];
        if (firstClass) {
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

/**
 * Applies temporary glowing visual highlight to target DOM element.
 */
export function highlightElement(target: HTMLElement): void {
  const originalOutline = target.style.outline;
  const originalBoxShadow = target.style.boxShadow;
  const originalTransition = target.style.transition;

  target.style.transition = "all 0.3s ease";
  target.style.outline = "2px solid #8b5cf6";
  target.style.boxShadow = "0 0 16px rgba(139, 92, 246, 0.8)";

  target.scrollIntoView({ behavior: "smooth", block: "center" });

  setTimeout(() => {
    target.style.outline = originalOutline;
    target.style.boxShadow = originalBoxShadow;
    target.style.transition = originalTransition;
  }, 2500);
}

/**
 * Finds element by selector or matching text content.
 */
function findTargetElement(selector?: string, targetText?: string): HTMLElement | null {
  if (selector) {
    try {
      const el = document.querySelector(selector) as HTMLElement;
      if (el) return el;
    } catch {
      // Ignore invalid CSS selector syntax
    }
  }

  if (targetText) {
    const textLower = targetText.toLowerCase().trim();
    const all = Array.from(document.querySelectorAll("button, a, input, [role='button'], label, span, div"));
    for (const el of all) {
      const htmlEl = el as HTMLElement;
      const val = (htmlEl.innerText || (htmlEl as HTMLInputElement).value || "").toLowerCase().trim();
      if (val === textLower || (val.length > 0 && val.includes(textLower))) {
        return htmlEl;
      }
    }
  }

  return null;
}

/**
 * Executes requested browser action on active DOM.
 */
export function executeAgentAction(payload: AgentActionPayload): { success: boolean; message: string; extractedData?: any } {
  const { actionType, selector, targetText, textValue, direction } = payload;

  if (actionType === "scroll") {
    const scrollAmount = direction === "up" ? -400 : 400;
    window.scrollBy({ top: scrollAmount, behavior: "smooth" });
    return { success: true, message: `Scrolled ${direction || "down"}` };
  }

  if (actionType === "extract") {
    const context = getPageContext();
    return {
      success: true,
      message: "Page data extracted successfully",
      extractedData: {
        title: context.title,
        url: context.url,
        summaryText: context.pageText.slice(0, 1000),
      },
    };
  }

  const targetEl = findTargetElement(selector, targetText);

  if (!targetEl) {
    return { success: false, message: `Target element not found: ${selector || targetText}` };
  }

  highlightElement(targetEl);

  if (actionType === "click" || actionType === "highlight") {
    if (actionType === "click") {
      targetEl.click();
      return { success: true, message: `Clicked element: ${selector || targetText}` };
    }
    return { success: true, message: `Highlighted element: ${selector || targetText}` };
  }

  if (actionType === "type") {
    const inputEl = targetEl as HTMLInputElement | HTMLTextAreaElement;
    if ("value" in inputEl) {
      inputEl.value = textValue || "";
      inputEl.dispatchEvent(new Event("input", { bubbles: true }));
      inputEl.dispatchEvent(new Event("change", { bubbles: true }));
      return { success: true, message: `Typed text into element: ${selector || targetText}` };
    }
  }

  return { success: false, message: `Action type '${actionType}' could not be completed.` };
}

/**
 * Initializes DOM Agent listener for incoming messages from extension background/sidepanel.
 */
export function initDomAgentEngine(): void {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "agent_get_context") {
      const context = getPageContext();
      sendResponse({ success: true, context });
      return true;
    }

    if (message.type === "agent_execute_action") {
      const result = executeAgentAction(message.payload as AgentActionPayload);
      sendResponse(result);
      return true;
    }
  });

  // Global webpage shortcut listener for Alt+S or Ctrl+Shift+E
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    const isAltS = e.altKey && (e.key === "s" || e.key === "S" || e.key === "ş" || e.key === "Ş");
    const isCtrlShiftE = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "e" || e.key === "E");

    if (isAltS || isCtrlShiftE) {
      const activeEl = document.activeElement;
      // Do not trigger if user is typing in an input or textarea
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || (activeEl as HTMLElement).isContentEditable)) {
        return;
      }
      try {
        if (!chrome.runtime?.id) return;
        chrome.runtime.sendMessage({ type: "open_sidepanel" });
      } catch {
        // Extension context invalidated on extension reload
      }
    }
  });
}

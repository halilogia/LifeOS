/**
 * domAgentEngine.ts
 * Claude / Browser-Use style visual element scanning sweep, neon target bounding box overlays, and form autofill execution engine.
 * Clean Architecture - Content Script Module.
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

export interface AgentActionPayload {
  actionType: "click" | "type" | "scroll" | "extract" | "highlight";
  selector?: string;
  targetText?: string;
  textValue?: string;
  direction?: "up" | "down";
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

/**
 * Triggers a temporary semi-transparent blue visual scan sweep overlay over active viewport (Claude / Browser-Use style).
 */
export function showScanningSweep(): void {
  const existing = document.getElementById("browser-use-scan-overlay");
  if (existing) {
    existing.remove();
  }

  const scanOverlay = document.createElement("div");
  scanOverlay.id = "browser-use-scan-overlay";
  scanOverlay.style.position = "fixed";
  scanOverlay.style.top = "0";
  scanOverlay.style.left = "0";
  scanOverlay.style.width = "100vw";
  scanOverlay.style.height = "100vh";
  scanOverlay.style.backgroundColor = "rgba(59, 130, 246, 0.08)";
  scanOverlay.style.backdropFilter = "blur(1px)";
  scanOverlay.style.zIndex = "999998";
  scanOverlay.style.pointerEvents = "none";
  scanOverlay.style.transition = "opacity 0.4s ease";

  // Animated laser scanning beam
  const beam = document.createElement("div");
  beam.style.position = "absolute";
  beam.style.top = "0";
  beam.style.left = "0";
  beam.style.width = "100%";
  beam.style.height = "3px";
  beam.style.background =
    "linear-gradient(90deg, transparent, #3b82f6, #60a5fa, #3b82f6, transparent)";
  beam.style.boxShadow = "0 0 15px #3b82f6, 0 0 30px #60a5fa";
  beam.style.animation = "browserUseSweep 0.8s ease-in-out forwards";

  // Inject keyframe style if missing
  if (!document.getElementById("browser-use-styles")) {
    const styleEl = document.createElement("style");
    styleEl.id = "browser-use-styles";
    styleEl.textContent = `
      @keyframes browserUseSweep {
        0% { top: 0%; opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { top: 100%; opacity: 0; }
      }
      @keyframes browserUsePulse {
        0% { transform: scale(1); box-shadow: 0 0 20px rgba(59, 130, 246, 0.9); }
        50% { transform: scale(1.02); box-shadow: 0 0 35px rgba(139, 92, 246, 1); }
        100% { transform: scale(1); box-shadow: 0 0 20px rgba(59, 130, 246, 0.9); }
      }
    `;
    document.head.appendChild(styleEl);
  }

  scanOverlay.appendChild(beam);
  document.body.appendChild(scanOverlay);

  setTimeout(() => {
    scanOverlay.style.opacity = "0";
    setTimeout(() => scanOverlay.remove(), 400);
  }, 750);
}

/**
 * Renders glowing floating bounding box and target action badge overlay over target DOM element.
 */
export function highlightElement(
  target: HTMLElement,
  actionLabel?: string,
): void {
  // Trigger blue scanning sweep effect
  showScanningSweep();

  target.scrollIntoView({ behavior: "smooth", block: "center" });

  const rect = target.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  // Create floating visual target overlay
  const overlayBox = document.createElement("div");
  overlayBox.className = "browser-use-target-box";
  overlayBox.style.position = "absolute";
  overlayBox.style.top = `${rect.top + scrollY - 4}px`;
  overlayBox.style.left = `${rect.left + scrollX - 4}px`;
  overlayBox.style.width = `${rect.width + 8}px`;
  overlayBox.style.height = `${rect.height + 8}px`;
  overlayBox.style.border = "2px solid #3b82f6";
  overlayBox.style.borderRadius = "6px";
  overlayBox.style.background = "rgba(59, 130, 246, 0.12)";
  overlayBox.style.boxShadow = "0 0 25px rgba(59, 130, 246, 0.9)";
  overlayBox.style.zIndex = "999999";
  overlayBox.style.pointerEvents = "none";
  overlayBox.style.animation = "browserUsePulse 1.2s infinite ease-in-out";

  // Action Badge Label
  const badge = document.createElement("div");
  badge.style.position = "absolute";
  badge.style.top = "-28px";
  badge.style.left = "0";
  badge.style.background = "linear-gradient(135deg, #2563eb, #7c3aed)";
  badge.style.color = "#ffffff";
  badge.style.fontSize = "11px";
  badge.style.fontWeight = "700";
  badge.style.padding = "3px 8px";
  badge.style.borderRadius = "4px";
  badge.style.whiteSpace = "nowrap";
  badge.style.boxShadow = "0 2px 8px rgba(0,0,0,0.4)";
  badge.style.display = "flex";
  badge.style.alignItems = "center";
  badge.style.gap = "4px";
  badge.textContent = `🎯 Browser-Use Agent: ${actionLabel || "İşlem Yapılıyor"}`;

  // Animated Glowing AI Cursor Dot (Claude / Browser-Use Cursor)
  const cursorDot = document.createElement("div");
  cursorDot.id = "browser-use-ai-cursor";
  cursorDot.style.position = "absolute";
  cursorDot.style.top = `${rect.top + scrollY + rect.height / 2}px`;
  cursorDot.style.left = `${rect.left + scrollX + rect.width / 2}px`;
  cursorDot.style.width = "18px";
  cursorDot.style.height = "18px";
  cursorDot.style.borderRadius = "50%";
  cursorDot.style.background =
    "radial-gradient(circle, #8b5cf6 0%, #3b82f6 100%)";
  cursorDot.style.border = "2px solid #ffffff";
  cursorDot.style.boxShadow = "0 0 15px #8b5cf6, 0 0 30px #3b82f6";
  cursorDot.style.zIndex = "9999999";
  cursorDot.style.pointerEvents = "none";
  cursorDot.style.transform = "translate(-50%, -50%) scale(1)";
  cursorDot.style.transition = "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";

  overlayBox.appendChild(badge);
  document.body.appendChild(overlayBox);
  document.body.appendChild(cursorDot);

  setTimeout(() => {
    cursorDot.style.transform = "translate(-50%, -50%) scale(1.4)";
    cursorDot.style.opacity = "0.7";
  }, 300);

  setTimeout(() => {
    overlayBox.style.transition = "opacity 0.3s ease";
    overlayBox.style.opacity = "0";
    cursorDot.style.opacity = "0";
    setTimeout(() => {
      overlayBox.remove();
      cursorDot.remove();
    }, 300);
  }, 2200);
}

/**
 * Finds element by selector, aria-label, or matching text content.
 */
function findTargetElement(
  selector?: string,
  targetText?: string,
): HTMLElement | null {
  if (selector) {
    try {
      const el = document.querySelector(selector) as HTMLElement;
      if (el) {
        return el;
      }
    } catch {
      // Ignore invalid CSS selector syntax
    }
  }

  if (targetText) {
    const textLower = targetText.toLowerCase().trim();
    const all = Array.from(
      document.querySelectorAll(
        "input, textarea, select, button, a, [role='button'], [role='textbox'], label",
      ),
    );

    for (const el of all) {
      const htmlEl = el as HTMLElement;
      const aria = (htmlEl.getAttribute("aria-label") || "")
        .toLowerCase()
        .trim();
      const placeholder = (htmlEl.getAttribute("placeholder") || "")
        .toLowerCase()
        .trim();
      const nameAttr = (htmlEl.getAttribute("name") || "").toLowerCase().trim();
      const idAttr = (htmlEl.id || "").toLowerCase().trim();
      const val = (htmlEl.innerText || (htmlEl as HTMLInputElement).value || "")
        .toLowerCase()
        .trim();
      const parentText =
        (
          (htmlEl.parentElement ||
            htmlEl.closest("label, div, p")) as HTMLElement
        )?.innerText
          ?.toLowerCase()
          .trim() || "";

      if (
        aria.includes(textLower) ||
        placeholder.includes(textLower) ||
        nameAttr.includes(textLower) ||
        idAttr.includes(textLower) ||
        val.includes(textLower) ||
        parentText.includes(textLower)
      ) {
        return htmlEl;
      }
    }
  }

  return null;
}

export interface ExtractedPageData {
  title: string;
  url: string;
  summaryText: string;
}

/**
 * Executes requested browser action or form autofill on active DOM with Claude / Browser-Use overlays.
 */
export function executeAgentAction(payload: AgentActionPayload): {
  success: boolean;
  message: string;
  extractedData?: ExtractedPageData;
} {
  const { actionType, selector, targetText, textValue, direction } = payload;

  if (actionType === "scroll") {
    showScanningSweep();
    const scrollAmount = direction === "up" ? -400 : 400;
    window.scrollBy({ top: scrollAmount, behavior: "smooth" });
    return { success: true, message: `Scrolled ${direction || "down"}` };
  }

  if (actionType === "extract") {
    showScanningSweep();
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
    return {
      success: false,
      message: `Target element not found: ${selector || targetText}`,
    };
  }

  const labelText =
    targetText ||
    (targetEl as HTMLInputElement).placeholder ||
    targetEl.innerText ||
    "Öğe";
  highlightElement(
    targetEl,
    `${actionType.toUpperCase()}: ${labelText.slice(0, 25)}`,
  );

  if (actionType === "click" || actionType === "highlight") {
    if (actionType === "click") {
      targetEl.click();
      return {
        success: true,
        message: `Clicked element: ${selector || targetText}`,
      };
    }
    return {
      success: true,
      message: `Highlighted element: ${selector || targetText}`,
    };
  }

  if (actionType === "type") {
    const inputEl = targetEl as HTMLInputElement | HTMLTextAreaElement;

    // Focus & Fill input with event dispatches for dynamic forms (Google Forms, React, Vue)
    inputEl.focus();
    inputEl.value = textValue || "";

    // Dispatch synthetic events so form state updates immediately
    inputEl.dispatchEvent(new Event("focus", { bubbles: true }));
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    inputEl.dispatchEvent(new Event("change", { bubbles: true }));
    inputEl.dispatchEvent(new Event("blur", { bubbles: true }));

    return {
      success: true,
      message: `Typed text into element: ${selector || targetText}`,
    };
  }

  return {
    success: false,
    message: `Action type '${actionType}' could not be completed.`,
  };
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
      if (Array.isArray(message.payload)) {
        const results = (message.payload as AgentActionPayload[]).map(
          (action) => executeAgentAction(action),
        );
        sendResponse({
          success: true,
          message: `Executed ${results.length} form actions`,
          results,
        });
      } else {
        const result = executeAgentAction(
          message.payload as AgentActionPayload,
        );
        sendResponse(result);
      }
      return true;
    }
  });
}

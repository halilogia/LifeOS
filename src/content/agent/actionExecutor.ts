/**
 * actionExecutor.ts
 * Browser Action Executor — click, type, scroll, extract, highlight.
 * Supports standard HTML forms, contenteditable rich text editors (LinkedIn, X/Twitter, Notion, Quill, ProseMirror),
 * and sequential asynchronous modal automation.
 * Claude / Browser-Use inspired visual overlays.
 */

import { getPageContext } from "./pageContextExtractor.js";
import {
  highlightElement,
  findTargetElement,
  showScanningSweep,
} from "./elementScanner.js";

export interface AgentActionPayload {
  actionType: "click" | "type" | "scroll" | "extract" | "highlight";
  selector?: string;
  targetText?: string;
  textValue?: string;
  direction?: "up" | "down";
}

export interface ExtractedPageData {
  title: string;
  url: string;
  summaryText: string;
}

/**
 * Polls the DOM until the target element appears (e.g. waiting for a modal dialog to open).
 */
async function waitForElement(
  selector?: string,
  targetText?: string,
  maxWaitMs = 2500,
): Promise<HTMLElement | null> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const el = findTargetElement(selector, targetText);
    if (el) {
      return el;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return findTargetElement(selector, targetText);
}

/**
 * Strictly verifies whether an element is legitimately editable.
 * Explicitly rejects arbitrary non-input <div>, <p>, <span> tags.
 */
function isElementEditable(el: HTMLElement | null): boolean {
  if (!el) {return false;}

  if (el instanceof HTMLInputElement) {
    const nonTextTypes = ["button", "checkbox", "radio", "submit", "reset", "file", "image", "hidden"];
    return !nonTextTypes.includes(el.type.toLowerCase());
  }

  if (el instanceof HTMLTextAreaElement) {
    return true;
  }

  if (el.isContentEditable || el.getAttribute("contenteditable") === "true") {
    return true;
  }

  if (el.getAttribute("role") === "textbox") {
    return true;
  }

  return (
    el.classList.contains("ql-editor") ||
    el.classList.contains("ProseMirror") ||
    el.classList.contains("notion-page-content") ||
    el.classList.contains("public-DraftEditor-content")
  );
}

/**
 * Safely inserts text into either standard HTML input/textarea or rich contenteditable / role="textbox" elements
 * (LinkedIn Post creator, Twitter tweet composer, Facebook post, Quill, Lexical, Draft.js).
 */
function fillTextIntoElement(targetEl: HTMLElement, textValue: string): boolean {
  if (!isElementEditable(targetEl)) {
    return false;
  }

  targetEl.focus();

  const isRichEditor =
    targetEl.isContentEditable ||
    targetEl.getAttribute("contenteditable") === "true" ||
    targetEl.getAttribute("role") === "textbox" ||
    targetEl.classList.contains("ql-editor") ||
    targetEl.classList.contains("ProseMirror") ||
    targetEl.classList.contains("notion-page-content") ||
    targetEl.classList.contains("public-DraftEditor-content");

  if (isRichEditor) {
    // Select all text in contenteditable if any
    try {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(targetEl);
      selection?.removeAllRanges();
      selection?.addRange(range);
    } catch {
      // Ignore selection errors
    }

    // Try document.execCommand insertText (most reliable for React/Lexical/Draft.js editors)
    let commandSuccess: boolean;
    try {
      commandSuccess = document.execCommand("insertText", false, textValue);
    } catch {
      commandSuccess = false;
    }

    // Fallback if execCommand didn't insert
    if (!commandSuccess || !targetEl.innerText.includes(textValue)) {
      targetEl.innerText = textValue;
    }

    // Dispatch synthetic InputEvents to notify state managers
    targetEl.dispatchEvent(
      new InputEvent("beforeinput", {
        bubbles: true,
        inputType: "insertText",
        data: textValue,
      }),
    );
    targetEl.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertText",
        data: textValue,
      }),
    );
    targetEl.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    // Standard HTML input / textarea element
    const inputEl = targetEl as HTMLInputElement | HTMLTextAreaElement;
    inputEl.value = textValue;

    inputEl.dispatchEvent(new Event("focus", { bubbles: true }));
    inputEl.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertText",
        data: textValue,
      }),
    );
    inputEl.dispatchEvent(new Event("change", { bubbles: true }));
    inputEl.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  return true;
}

/**
 * Executes requested browser action or form autofill on active DOM
 * with Claude / Browser-Use overlays.
 */
export async function executeAgentAction(payload: AgentActionPayload): Promise<{
  success: boolean;
  message: string;
  extractedData?: ExtractedPageData;
}> {
  const { actionType, selector, targetText, textValue, direction } = payload;

  if (selector && /javascript:|data:/i.test(selector)) {
    return {
      success: false,
      message: "Security violation: Dangerous selector pattern rejected.",
    };
  }

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

  // Wait for target element (handles modals opening dynamically)
  const targetEl = await waitForElement(selector, targetText, 2500);

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
    "Element";

  highlightElement(
    targetEl,
    `${actionType.toUpperCase()}: ${labelText.slice(0, 25)}`,
  );

  if (actionType === "click" || actionType === "highlight") {
    if (actionType === "click") {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

      // Dispatch full mouse & pointer sequence for modern frameworks (React / Vue)
      targetEl.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true }),
      );
      targetEl.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      targetEl.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
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
    const success = fillTextIntoElement(targetEl, textValue || "");
    if (!success) {
      return {
        success: false,
        message: `Target element is not a valid editable input or text editor: ${selector || targetText}`,
      };
    }

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
        (async () => {
          const results: Array<{
            success: boolean;
            message: string;
            extractedData?: ExtractedPageData;
          }> = [];
          for (const action of message.payload as AgentActionPayload[]) {
            const res = await executeAgentAction(action);
            results.push(res);
            // Delay between multi-step actions to allow DOM/modals to settle
            await new Promise((resolve) => setTimeout(resolve, 400));
          }
          sendResponse({
            success: true,
            message: `Executed ${results.length} actions`,
            results,
          });
        })();
        return true;
      } else {
        executeAgentAction(message.payload as AgentActionPayload).then(
          (result) => {
            sendResponse(result);
          },
        );
        return true;
      }
    }
  });
}

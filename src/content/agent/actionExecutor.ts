/**
 * actionExecutor.ts
 * Tarayıcı eylem yürütücü — click, type, scroll, extract, highlight.
 * Claude/Browser-Use overlay'leri ile form otomasyonu.
 * Parça: domAgentEngine barrel re-export eder.
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
 * Executes requested browser action or form autofill on active DOM
 * with Claude / Browser-Use overlays.
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
    "Element";
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

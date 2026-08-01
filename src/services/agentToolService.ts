/**
 * agentToolService.ts
 * Clean Architecture Domain Service for AI Agent Tools & Action Parsing.
 */

import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/types/types.js";

export interface AgentActionPayload {
  actionType: "click" | "type" | "scroll" | "extract" | "highlight";
  selector?: string;
  targetText?: string;
  textValue?: string;
  direction?: "up" | "down";
}

export interface AgentToolDefinition {
  name: string;
  description: string;
  actionType: string;
}

/**
 * Inventory of all 6 core tools currently registered in the Web Copilot Agent.
 */
export const REGISTERED_AGENT_TOOLS: AgentToolDefinition[] = [
  {
    name: "click",
    description:
      "Clicks buttons, links, tabs, or interactive elements by target text or CSS selector.",
    actionType: "click",
  },
  {
    name: "type",
    description:
      "Types text into input fields, textareas, or contenteditable elements.",
    actionType: "type",
  },
  {
    name: "scroll",
    description: "Scrolls active browser viewport up or down.",
    actionType: "scroll",
  },
  {
    name: "extract",
    description:
      "Extracts page structure, text content, and metadata from active DOM.",
    actionType: "extract",
  },
  {
    name: "highlight",
    description:
      "Highlights target elements visually with neon scanning bounding box.",
    actionType: "highlight",
  },
  {
    name: "update_memory",
    description:
      "Saves new user facts to personal memory.md (chrome.storage.sync.aiUserMemory).",
    actionType: "update_memory",
  },
];

/**
 * Generates an accurate, context-aware Turkish/English summary for executed tool actions.
 */
export function formatActionExecutionSummary(
  actions: AgentActionPayload[],
  lang: "tr" | "en",
): string {
  if (!actions || actions.length === 0) {
    return "";
  }

  const t = getTranslation(lang as Language);

  // Single action execution formatting
  if (actions.length === 1) {
    const act = actions[0];
    const targetName = act.targetText || act.selector || t.agent_tool_element;

    switch (act.actionType) {
      case "click":
        return t.agent_tool_clicked.replace("$target", targetName);

      case "type":
        return t.agent_tool_typed.replace("$target", targetName);

      case "scroll":
        return t.agent_tool_scrolled.replace(
          "$direction",
          act.direction === "up"
            ? t.agent_tool_scrolled_up
            : t.agent_tool_scrolled_down,
        );

      case "extract":
        return t.agent_tool_extracted;

      case "highlight":
        return t.agent_tool_highlighted.replace("$target", targetName);

      default:
        return t.agent_tool_executed_single.replace(
          "$count",
          String(actions.length),
        );
    }
  }

  // Multi-action execution summary (e.g. form autofill)
  const clickCount = actions.filter((a) => a.actionType === "click").length;
  const typeCount = actions.filter((a) => a.actionType === "type").length;

  if (typeCount > 0 && clickCount === 0) {
    return t.agent_tool_filled_form_fields.replace("$count", String(typeCount));
  }

  const parts: string[] = [];
  if (typeCount > 0) {
    parts.push(t.agent_tool_typing_label.replace("$count", String(typeCount)));
  }
  if (clickCount > 0) {
    parts.push(t.agent_tool_click_label.replace("$count", String(clickCount)));
  }
  const details = parts.join(", ");

  return t.agent_tool_executed_template
    .replace("$count", String(actions.length))
    .replace("$details", details);
}

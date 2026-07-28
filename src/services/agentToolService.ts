/**
 * agentToolService.ts
 * Clean Architecture Domain Service for AI Agent Tools & Action Parsing.
 */

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
    description: "Clicks buttons, links, tabs, or interactive elements by target text or CSS selector.",
    actionType: "click",
  },
  {
    name: "type",
    description: "Types text into input fields, textareas, or contenteditable elements.",
    actionType: "type",
  },
  {
    name: "scroll",
    description: "Scrolls active browser viewport up or down.",
    actionType: "scroll",
  },
  {
    name: "extract",
    description: "Extracts page structure, text content, and metadata from active DOM.",
    actionType: "extract",
  },
  {
    name: "highlight",
    description: "Highlights target elements visually with neon scanning bounding box.",
    actionType: "highlight",
  },
  {
    name: "update_memory",
    description: "Saves new user facts to personal memory.md (chrome.storage.sync.aiUserMemory).",
    actionType: "update_memory",
  },
];

/**
 * Generates an accurate, context-aware Turkish/English summary for executed tool actions.
 */
export function formatActionExecutionSummary(actions: AgentActionPayload[], lang: "tr" | "en"): string {
  if (!actions || actions.length === 0) return "";

  const isTr = lang === "tr";

  // Single action execution formatting
  if (actions.length === 1) {
    const act = actions[0];
    const targetName = act.targetText || act.selector || (isTr ? "Öğe" : "Element");

    switch (act.actionType) {
      case "click":
        return isTr
          ? `✓ "${targetName}" bağlantısına/sekmesine tıklandı.`
          : `✓ Clicked on "${targetName}".`;

      case "type":
        return isTr
          ? `✓ "${targetName}" alanına metin yazıldı.`
          : `✓ Typed value into "${targetName}".`;

      case "scroll":
        return isTr
          ? `✓ Sayfa ${act.direction === "up" ? "yukarı" : "aşağı"} kaydırıldı.`
          : `✓ Scrolled page ${act.direction || "down"}.`;

      case "extract":
        return isTr
          ? `✓ Sayfa verileri başarıyla analiz edildi.`
          : `✓ Page content extracted successfully.`;

      case "highlight":
        return isTr
          ? `✓ "${targetName}" öğesi vurgulandı.`
          : `✓ Highlighted "${targetName}".`;

      default:
        return isTr
          ? `✓ ${actions.length} adet işlem yürütüldü.`
          : `✓ Executed ${actions.length} actions.`;
    }
  }

  // Multi-action execution summary (e.g. form autofill)
  const clickCount = actions.filter((a) => a.actionType === "click").length;
  const typeCount = actions.filter((a) => a.actionType === "type").length;

  if (typeCount > 0 && clickCount === 0) {
    return isTr
      ? `✓ ${typeCount} adet form alanı dolduruldu.`
      : `✓ Filled ${typeCount} form fields.`;
  }

  return isTr
    ? `✓ ${actions.length} adet işlem başarıyla yürütüldü (${typeCount > 0 ? `${typeCount} yazma` : ""}${clickCount > 0 ? `, ${clickCount} tıklama` : ""}).`
    : `✓ Successfully executed ${actions.length} actions (${typeCount > 0 ? `${typeCount} typing` : ""}${clickCount > 0 ? `, ${clickCount} clicks` : ""}).`;
}

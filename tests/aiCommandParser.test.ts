import { describe, it, expect } from "vitest";
import {
  parseLocalCommand,
  cleanAndParseJSON,
  parseAIResponse,
} from "@/utils/aiCommandParser.js";

describe("AI Command Parser Suite", () => {
  describe("parseLocalCommand", () => {
    it("should parse generic task creation queries", () => {
      const res = parseLocalCommand("görev ekle: KPSS Tarih çalış");
      expect(res.parsed).toBe(true);
      expect(res.action).toBe("create_task");
      expect(res.text).toBe("KPSS Tarih çalış");
    });

    it("should parse BIST stock analysis queries by alias", () => {
      const res = parseLocalCommand("THYAO analiz et");
      expect(res.parsed).toBe(true);
      expect(res.action).toBe("ask_stock");
      expect(res.stockQuery?.symbol).toBe("THYAO");
    });

    it("should return parsed=false for unhandled natural language queries", () => {
      const res = parseLocalCommand("Bana kuantum fiziği hakkında bilgi ver");
      expect(res.parsed).toBe(false);
    });
  });

  describe("cleanAndParseJSON", () => {
    it("should parse plain JSON string", () => {
      const json = `{"reply": "Hello", "action": "none"}`;
      const res = cleanAndParseJSON(json) as { reply: string; action: string };
      expect(res.reply).toBe("Hello");
      expect(res.action).toBe("none");
    });

    it("should strip <think> reasoning blocks before parsing JSON", () => {
      const input = `<think>Model is reasoning here...</think> {"reply": "Parsed response", "action": "create_task"}`;
      const res = cleanAndParseJSON(input) as { reply: string; action: string };
      expect(res.reply).toBe("Parsed response");
      expect(res.action).toBe("create_task");
    });

    it("should extract JSON object embedded inside markdown code blocks", () => {
      const input = "Here is the response:\n```json\n{\"reply\": \"Done\", \"action\": \"none\"}\n```";
      const res = cleanAndParseJSON(input) as { reply: string };
      expect(res.reply).toBe("Done");
    });

    it("should fallback gracefully for non-JSON text", () => {
      const input = "This is a plain text response without JSON.";
      const res = cleanAndParseJSON(input) as { reply: string; action: string };
      expect(res.reply).toBe("This is a plain text response without JSON.");
      expect(res.action).toBe("none");
    });
  });

  describe("parseAIResponse", () => {
    it("should extract thinking block and parse JSON action payload", () => {
      const rawText = `<think>Step 1: Analyze user request.</think>\n\`\`\`json\n{"reply": "Task created!", "action": "create_task"}\n\`\`\``;
      const res = parseAIResponse(rawText);
      expect(res.thinking).toBe("Step 1: Analyze user request.");
      expect(res.reply).toBe("Task created!");
      expect(res.action).toBe("create_task");
    });
  });
});

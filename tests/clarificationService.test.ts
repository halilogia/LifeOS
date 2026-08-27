import { describe, it, expect } from "vitest";
import { parseAIResponse } from "@/utils/aiCommandParser.js";

describe("Clarification & Ask User Parsing Tests", () => {
  it("should parse a structured clarification JSON payload", () => {
    const rawAiOutput = JSON.stringify({
      action: "clarification",
      params: {
        question: "2D mi 3D mi sahne oluşturayım?",
        options: ["2D", "3D"],
        allowFreeText: true,
        context: "create_scene",
      },
    });

    const parsed = parseAIResponse(rawAiOutput);
    expect(parsed.action).toBe("clarification");
    expect(parsed.clarification).toBeDefined();
    expect(parsed.clarification?.question).toBe("2D mi 3D mi sahne oluşturayım?");
    expect(parsed.clarification?.options).toEqual(["2D", "3D"]);
    expect(parsed.clarification?.allowFreeText).toBe(true);
    expect(parsed.clarification?.context).toBe("create_scene");
    expect(parsed.clarification?.resolved).toBe(false);
  });

  it("should parse clarification embedded in markdown codeblock with thinking tags", () => {
    const rawAiOutput = `
<think>
Kullanıcı bir sahne ve slime yapmak istiyor. Ancak 2D mi 3D mi olduğu belirtilmemiş ve bu sahne mimarisini kökten değiştirir.
Bu yüzden kullanıcıya 2D/3D tercihi sormalıyım.
</think>

\`\`\`json
{
  "action": "clarification",
  "params": {
    "question": "Oyun sahnesini 2D mi 3D mi olarak hazırlayayım?",
    "options": [
      { "label": "2D Sahne (Sprite/Tilemap)", "value": "2D" },
      { "label": "3D Sahne (Mesh/Spatial)", "value": "3D" }
    ],
    "allowFreeText": true
  }
}
\`\`\`
`;

    const parsed = parseAIResponse(rawAiOutput);
    expect(parsed.action).toBe("clarification");
    expect(parsed.thinking).toContain("Kullanıcı bir sahne ve slime yapmak istiyor.");
    expect(parsed.clarification).toBeDefined();
    expect(parsed.clarification?.question).toBe("Oyun sahnesini 2D mi 3D mi olarak hazırlayayım?");
    expect(parsed.clarification?.options?.length).toBe(2);
  });

  it("should handle normal non-clarification conversational responses cleanly", () => {
    const rawAiOutput = "Sağlık (health) değeri başarıyla 100 olarak güncellendi.";
    const parsed = parseAIResponse(rawAiOutput);
    expect(parsed.action).toBe("none");
    expect(parsed.clarification).toBeUndefined();
    expect(parsed.reply).toBe(rawAiOutput);
  });
});

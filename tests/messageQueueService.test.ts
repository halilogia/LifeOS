import { describe, it, expect } from "vitest";
import {
  exportSessionAsMarkdown,
  generateSessionTitle,
} from "@/services/aichat/chatSessionService.js";
import type { ChatSession, QueuedMessage } from "@/services/aichat/types.js";

describe("Message Queue & Human-Readable Chat Export Tests", () => {
  it("should format queued messages correctly", () => {
    const queue: QueuedMessage[] = [
      {
        id: "q_1",
        text: "İlk sıradaki mesaj",
        timestamp: "22:30",
      },
      {
        id: "q_2",
        text: "İkinci sıradaki mesaj",
        timestamp: "22:31",
        attachments: [
          {
            id: "att_1",
            name: "test.pdf",
            type: "pdf",
            mimeType: "application/pdf",
            size: 20480,
          },
        ],
      },
    ];

    expect(queue.length).toBe(2);
    expect(queue[0].id).toBe("q_1");
    expect(queue[1].attachments?.length).toBe(1);

    // Filter/remove item
    const updated = queue.filter((q) => q.id !== "q_1");
    expect(updated.length).toBe(1);
    expect(updated[0].id).toBe("q_2");
  });

  it("should export a chat session into clean, human-readable markdown with sources, actions and clarifications", () => {
    const session: ChatSession = {
      id: "session_123",
      scope: "sidepanel",
      title: "Godot Sahne ve Slime Oluşturma",
      createdAt: 1772134000000,
      updatedAt: 1772135000000,
      url: "https://godotengine.org",
      domain: "godotengine.org",
      messages: [
        {
          id: "m1",
          role: "user",
          content: "Sahne oluştur ve slime yap.",
          timestamp: "22:30",
          attachments: [
            {
              id: "att_1",
              name: "slime_spec.pdf",
              type: "pdf",
              mimeType: "application/pdf",
              size: 45000,
            },
          ],
        },
        {
          id: "m2",
          role: "assistant",
          content:
            'Sahneyi nasıl oluşturmamı istersiniz?\n```json\n{"action": "create_task", "params": {"text": "Godot sahnesini tamamla", "dueDate": "2026-08-30"}}\n```',
          timestamp: "22:31",
          thinking: "Kullanıcı 2D/3D belirtmedi, önce soru sormalıyım.",
          sources: [
            {
              title: "Godot 2D vs 3D Documentation",
              url: "https://docs.godotengine.org",
              snippet: "Guide to choosing 2D or 3D nodes",
            },
          ],
          clarification: {
            id: "clarify_1",
            question: "Sahneyi 2D mi 3D mi olarak oluşturayım?",
            options: ["2D", "3D"],
            resolved: true,
            selectedAnswer: "2D",
          },
        },
      ],
    };

    const markdown = exportSessionAsMarkdown(session);

    // Check Meta Header
    expect(markdown).toContain("# 💬 Godot Sahne ve Slime Oluşturma");
    expect(markdown).toContain("Side Panel Web Copilot");
    expect(markdown).toContain("godotengine.org");

    // Check User message and attachments
    expect(markdown).toContain("## 👤 Kullanıcı (22:30)");
    expect(markdown).toContain("Sahne oluştur ve slime yap.");
    expect(markdown).toContain("slime_spec.pdf");

    // Check Assistant message, thinking and sources
    expect(markdown).toContain("## 🤖 Life OS Asistanı (22:31)");
    expect(markdown).toContain("💭 Düşünme Süreci");
    expect(markdown).toContain("Kullanıcı 2D/3D belirtmedi");
    expect(markdown).toContain("🌐 **İncelenen Web Kaynakları (1)");
    expect(markdown).toContain("[Godot 2D vs 3D Documentation](https://docs.godotengine.org)");

    // Check Action and Clarification rendering
    expect(markdown).toContain("⚡ **Gerçekleştirilen Eylem:** Görev Takvime Eklendi → *\"Godot sahnesini tamamla\"* (2026-08-30)");
    expect(markdown).toContain("❓ **Açıklama / Tercih:** Sahneyi 2D mi 3D mi olarak oluşturayım?");
    expect(markdown).toContain("👉 **Kullanıcı Yanıtı:** 2D");

    // Verify raw JSON codeblock is cleaned from main text
    expect(markdown).not.toContain('```json\n{"action": "create_task"');
  });

  it("should generate a clean session title from noisy first user prompt", () => {
    const title = generateSessionTitle("/task @gemini *Önemli* Proje Planı Hazırla");
    expect(title).toBe("Önemli Proje Planı Hazırla");
  });
});

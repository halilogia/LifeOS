import { describe, it, expect } from "vitest";
import {
  generateSessionTitle,
  exportSessionAsMarkdown,
  exportSessionAsJson,
} from "@/services/aichat/chatSessionService.js";
import type { ChatSession } from "@/services/aichat/types.js";

describe("chatSessionService Unit Tests", () => {
  describe("generateSessionTitle", () => {
    it("should generate a clean title from a user prompt", () => {
      const prompt = "BIST 100 endeksi ve THYAO hisse analizini yapabilir misin?";
      const title = generateSessionTitle(prompt);
      expect(title).toBe("BIST 100 endeksi ve THYAO hisse anali...");
    });

    it("should strip markdown headers and clean whitespace", () => {
      const prompt = "# **Hisse Senedi** \n Detayları nelerdir?";
      const title = generateSessionTitle(prompt);
      expect(title).toBe("Hisse Senedi Detayları nelerdir?");
    });

    it("should return default fallback title for empty prompt", () => {
      expect(generateSessionTitle("")).toBe("Yeni Sohbet");
      expect(generateSessionTitle("   ")).toBe("Yeni Sohbet");
    });
  });

  describe("exportSessionAsMarkdown & exportSessionAsJson", () => {
    const mockSession: ChatSession = {
      id: "test_session_123",
      scope: "newtab",
      title: "BIST Analizi Sohbeti",
      createdAt: 1740000000000,
      updatedAt: 1740000050000,
      messages: [
        {
          id: "m1",
          role: "user",
          content: "THYAO hissesi nasıl?",
          timestamp: "14:30",
          attachments: [
            {
              id: "att1",
              name: "rapor.pdf",
              type: "pdf",
              size: 2048,
              mimeType: "application/pdf",
            },
          ],
        },
        {
          id: "m2",
          role: "assistant",
          content: "THYAO teknik olarak 300 TL üzerinde güçlü seyrediyor.",
          timestamp: "14:31",
          thinking: "Fiyat hareketlerini ve RSI değerlerini kontrol ettim.",
        },
      ],
    };

    it("should export session correctly as Markdown", () => {
      const md = exportSessionAsMarkdown(mockSession);
      expect(md).toContain("# 💬 BIST Analizi Sohbeti");
      expect(md).toContain("## 👤 Kullanıcı (14:30)");
      expect(md).toContain("THYAO hissesi nasıl?");
      expect(md).toContain("`rapor.pdf` (PDF, 2.0 KB)");
      expect(md).toContain("## 🤖 Life OS Asistanı (14:31)");
      expect(md).toContain("💭 Düşünme Süreci");
      expect(md).toContain("THYAO teknik olarak 300 TL üzerinde güçlü seyrediyor.");
    });

    it("should export session correctly as JSON", () => {
      const jsonStr = exportSessionAsJson(mockSession);
      const parsed = JSON.parse(jsonStr);
      expect(parsed.id).toBe("test_session_123");
      expect(parsed.title).toBe("BIST Analizi Sohbeti");
      expect(parsed.messages.length).toBe(2);
    });
  });
});

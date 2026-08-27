import { describe, it, expect } from "vitest";
import {
  formatFileSize,
  getFileExtension,
  categorizeAttachmentType,
  extractDocumentContext,
} from "@/services/aichat/fileAttachmentService.js";
import type { ChatAttachment } from "@/services/aichat/types.js";

describe("fileAttachmentService", () => {
  it("formats file sizes correctly", () => {
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(150 * 1024)).toBe("150.0 KB");
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe("2.5 MB");
  });

  it("extracts file extensions correctly", () => {
    expect(getFileExtension("document.pdf")).toBe("pdf");
    expect(getFileExtension("script.test.tsx")).toBe("tsx");
    expect(getFileExtension("noextension")).toBe("");
    expect(getFileExtension(".hidden")).toBe("");
  });

  it("categorizes attachments into correct types", () => {
    expect(categorizeAttachmentType("image/png", "photo.png")).toBe("image");
    expect(categorizeAttachmentType("image/jpeg", "image.jpg")).toBe("image");
    expect(categorizeAttachmentType("application/pdf", "report.pdf")).toBe("pdf");
    expect(categorizeAttachmentType("text/javascript", "app.js")).toBe("code");
    expect(categorizeAttachmentType("text/x-python", "main.py")).toBe("code");
    expect(categorizeAttachmentType("text/plain", "notes.txt")).toBe("document");
    expect(categorizeAttachmentType("text/markdown", "README.md")).toBe("document");
  });

  it("extracts document context into a formatted prompt block", () => {
    const attachments: ChatAttachment[] = [
      {
        id: "1",
        name: "test.txt",
        type: "document",
        mimeType: "text/plain",
        size: 1024,
        textContent: "Hello World Content",
      },
      {
        id: "2",
        name: "document.pdf",
        type: "pdf",
        mimeType: "application/pdf",
        size: 204800,
      },
    ];

    const result = extractDocumentContext(attachments);
    expect(result).toContain('Eklenen Belge: "test.txt"');
    expect(result).toContain("Hello World Content");
    expect(result).toContain('Eklenen PDF Belgesi: "document.pdf"');
  });
});

/**
 * fileAttachmentService.ts
 * Client-side file processing, base64 conversion, text extraction,
 * and attachment validation for Life OS AI Chat & Web Copilot.
 */

import type { ChatAttachment } from "./types.js";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "svg",
  "bmp",
  "ico",
]);

const CODE_EXTENSIONS = new Set([
  "js",
  "jsx",
  "ts",
  "tsx",
  "py",
  "html",
  "css",
  "json",
  "sql",
  "sh",
  "bash",
  "yaml",
  "yml",
  "xml",
  "c",
  "cpp",
  "h",
  "cs",
  "java",
  "go",
  "rs",
  "php",
  "rb",
  "swift",
  "kt",
]);

const DOC_EXTENSIONS = new Set(["txt", "md", "markdown", "csv", "log", "env"]);

/** Formats byte counts into human readable strings (e.g. "124 KB", "2.4 MB"). */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Extracts file extension safely. */
export function getFileExtension(filename: string): string {
  const cleanName = filename.trim();
  const lastDot = cleanName.lastIndexOf(".");
  if (lastDot <= 0) {
    return "";
  }
  return cleanName.slice(lastDot + 1).toLowerCase();
}

/** Determines attachment category type from MIME type and filename. */
export function categorizeAttachmentType(
  mimeType: string,
  filename: string,
): "image" | "pdf" | "document" | "code" {
  const ext = getFileExtension(filename);

  if (mimeType.startsWith("image/") || IMAGE_EXTENSIONS.has(ext)) {
    return "image";
  }
  if (mimeType === "application/pdf" || ext === "pdf") {
    return "pdf";
  }
  if (CODE_EXTENSIONS.has(ext)) {
    return "code";
  }
  if (mimeType.startsWith("text/") || DOC_EXTENSIONS.has(ext)) {
    return "document";
  }
  return "document";
}

/** Reads a File as DataURL (Base64). */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/** Reads a File as UTF-8 plain text. */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Processes a user uploaded File (image, pdf, text, code) into a ChatAttachment object.
 */
export async function processUploadedFile(file: File): Promise<ChatAttachment> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `Dosya boyutu çok büyük (${formatFileSize(file.size)}). Maksimum dosya boyutu 10 MB'dir.`,
    );
  }

  const category = categorizeAttachmentType(file.type, file.name);
  const id = `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  if (category === "image") {
    const dataUrl = await readFileAsDataUrl(file);
    return {
      id,
      name: file.name,
      type: "image",
      mimeType: file.type || "image/jpeg",
      size: file.size,
      dataUrl,
      previewUrl: dataUrl,
    };
  }

  if (category === "pdf") {
    const dataUrl = await readFileAsDataUrl(file);
    return {
      id,
      name: file.name,
      type: "pdf",
      mimeType: "application/pdf",
      size: file.size,
      dataUrl,
    };
  }

  // Text / Code document
  let textContent = "";
  try {
    textContent = await readFileAsText(file);
  } catch {
    textContent = "";
  }

  return {
    id,
    name: file.name,
    type: category,
    mimeType: file.type || "text/plain",
    size: file.size,
    textContent,
  };
}

/**
 * Extracts plain text context from non-image attachments to inject into prompt text.
 */
export function extractDocumentContext(attachments: ChatAttachment[]): string {
  if (!attachments || attachments.length === 0) {
    return "";
  }

  const docSnippets: string[] = [];

  for (const att of attachments) {
    if (att.textContent) {
      docSnippets.push(
        `--- [Eklenen Belge: "${att.name}" (${formatFileSize(att.size)})] ---\n${att.textContent.slice(0, 12000)}\n--- [Belge Sonu] ---`,
      );
    } else if (att.type === "pdf") {
      docSnippets.push(
        `[Eklenen PDF Belgesi: "${att.name}" (${formatFileSize(att.size)})]`,
      );
    } else if (att.type === "image") {
      docSnippets.push(
        `[Eklenen Görsel: "${att.name}" (${formatFileSize(att.size)})]`,
      );
    }
  }

  return docSnippets.join("\n\n");
}

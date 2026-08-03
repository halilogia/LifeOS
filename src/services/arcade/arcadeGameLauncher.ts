import { GameEntry } from "@/types/game.js";
import type { IArcadeRepository } from "@/domain/repositories/IArcadeRepository.js";
import { logger } from "@/utils/logger.js";
import {
  ensurePermission,
  arrayBufferToBase64,
  getMimeType,
  walkDirectory,
} from "./arcadeFileSystem.js";
import { rewriteHTML } from "./arcadeHtmlRewriter.js";

interface DirHandle {
  getDirectoryHandle(name: string): Promise<DirHandle>;
  getFileHandle(name: string): Promise<FileHandle>;
}

interface FileHandle {
  getFile(): Promise<File>;
}

/**
 * Resolves a game's entry HTML into a self-contained data-URL document.
 * Reads the local game folder via File System Access API, rewrites asset
 * references (src/href/srcset) to inline base64 data URLs, and strips
 * refresh/CSP meta tags and inline event handlers.
 */
export async function resolveGameURL(
  repo: IArcadeRepository,
  game: GameEntry,
): Promise<string | null> {
  const handle = await repo.getDirectoryHandle(game.handleId);
  if (!handle) {
    return null;
  }
  const ok = await ensurePermission(handle);
  if (!ok) {
    return null;
  }

  const ALLOWED_ENTRY_PATHS = ["dist/index.html", "index.html"] as const;
  const candidate = game.entryHTMLPath ?? "dist/index.html";
  if (
    !ALLOWED_ENTRY_PATHS.includes(
      candidate as (typeof ALLOWED_ENTRY_PATHS)[number],
    )
  ) {
    logger.warn("Refusing to resolve disallowed entryHTMLPath:", candidate);
    return null;
  }

  const rootPath = candidate;
  const parts = rootPath.split("/");
  const fileName = parts.pop()!;
  if (parts.some((p) => p === "" || p === "." || p === "..")) {
    return null;
  }
  let folderDir = handle as DirHandle;
  for (const part of parts) {
    try {
      folderDir = await folderDir.getDirectoryHandle(part);
    } catch {
      return null;
    }
  }

  let htmlFile: File;
  try {
    const fileHandle = await folderDir.getFileHandle(fileName);
    htmlFile = await fileHandle.getFile();
  } catch {
    return null;
  }

  const html = await htmlFile.text();
  const folderPrefix = parts.join("/") + (parts.length ? "/" : "");

  const cache = new Map<string, string>();
  const resolveAsset = async (relPath: string): Promise<string | null> => {
    const clean = relPath.split("#")[0].split("?")[0];
    if (!clean) {
      return null;
    }
    const segments = clean.split("/");
    if (segments.some((p) => p === "..")) {
      return null;
    }
    if (cache.has(clean)) {
      return cache.get(clean)!;
    }
    let parent = handle as DirHandle;
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i];
      if (seg === "" || seg === ".") {
        continue;
      }
      try {
        parent = await parent.getDirectoryHandle(seg);
      } catch {
        return null;
      }
    }
    const targetName = segments[segments.length - 1];
    if (
      !targetName ||
      targetName.includes("/") ||
      targetName.includes("\\") ||
      targetName === "." ||
      targetName === ".."
    ) {
      return null;
    }
    try {
      const fileHandle = await parent.getFileHandle(targetName);
      const file = await fileHandle.getFile();
      const buffer = await file.arrayBuffer();
      const mime = getMimeType(targetName, file.type);
      const base64 = arrayBufferToBase64(buffer);
      const url = `data:${mime};base64,${base64}`;
      cache.set(clean, url);
      return url;
    } catch {
      return null;
    }
  };

  let rewritten = await rewriteHTML(html, folderPrefix, resolveAsset);
  rewritten = rewritten.replace(
    /<meta\s+[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi,
    "",
  );
  rewritten = rewritten.replace(
    /<meta\s+[^>]*http-equiv\s*=\s*["']?(x-frame-options|content-security-policy)["']?[^>]*>/gi,
    "",
  );
  rewritten = rewritten.replace(
    /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*')/gi,
    "",
  );
  return rewritten;
}

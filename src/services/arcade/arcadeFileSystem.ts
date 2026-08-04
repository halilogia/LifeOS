import { GameEntry } from "@/types/game.js";
import { logger } from "@/utils/logger.js";

/** Minimal interface for FileSystemDirectoryHandle operations used in this module. */
interface DirHandle {
  getDirectoryHandle(name: string): Promise<DirHandle>;
  getFileHandle(name: string): Promise<FileHandle>;
  values(): AsyncIterableIterator<DirHandle | FileHandle>;
}

interface FileHandle {
  getFile(): Promise<File>;
}

export const ensurePermission = async (handle: unknown): Promise<boolean> => {
  const h = handle as {
    queryPermission?: (opts: { mode: string }) => Promise<string>;
    requestPermission?: (opts: { mode: string }) => Promise<string>;
  };
  if (h.queryPermission) {
    const state = await h.queryPermission({ mode: "read" });
    if (state === "granted") {
      return true;
    }
    if (h.requestPermission) {
      const next = await h.requestPermission({ mode: "read" });
      return next === "granted";
    }
  }
  return false;
};

export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.byteLength; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(
        i,
        Math.min(i + chunkSize, bytes.byteLength),
      ) as unknown as number[],
    );
  }
  return btoa(binary);
};

export const getMimeType = (
  filename: string,
  fallbackType?: string,
): string => {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "js":
    case "mjs":
      return "text/javascript;charset=utf-8";
    case "css":
      return "text/css;charset=utf-8";
    case "html":
    case "htm":
      return "text/html;charset=utf-8";
    case "json":
      return "application/json;charset=utf-8";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml;charset=utf-8";
    case "woff":
      return "font/woff";
    case "woff2":
      return "font/woff2";
    case "ttf":
      return "font/ttf";
    case "otf":
      return "font/otf";
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "ogg":
      return "audio/ogg";
    case "mp4":
      return "video/mp4";
    default:
      return fallbackType || "application/octet-stream";
  }
};

export const formatFolderName = (name: string): string => {
  const cleaned = name.replace(/[-_]+/g, " ").trim();
  return cleaned
    .split(/\s+/)
    .map((word) => word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1))
    .join(" ");
};

export const detectCategory = (name: string): GameEntry["category"] => {
  const lower = name.toLowerCase();
  if (
    lower.includes("rpg") ||
    lower.includes("adventure") ||
    lower.includes("isekai") ||
    lower.includes("quest")
  ) {
    return "rpg";
  }
  if (
    lower.includes("sim") ||
    lower.includes("manager") ||
    lower.includes("survival") ||
    lower.includes("tycoon") ||
    lower.includes("market") ||
    lower.includes("stardew")
  ) {
    return "simulation";
  }
  if (lower.includes("ai") || lower.includes("focus")) {
    return "ai";
  }
  if (
    lower.includes("puzzle") ||
    lower.includes("match") ||
    lower.includes("tarot") ||
    lower.includes("card")
  ) {
    return "puzzle";
  }
  if (
    lower.includes("race") ||
    lower.includes("moto") ||
    lower.includes("runner") ||
    lower.includes("wave")
  ) {
    return "casual";
  }
  return "action";
};

export const detectTechStack = (name: string): string[] => {
  const lower = name.toLowerCase();
  const stack: string[] = [];
  if (
    lower.includes("3d") ||
    lower.includes("voxel") ||
    lower.includes("webgl")
  ) {
    stack.push("Three.js");
  }
  if (
    lower.includes("2d") ||
    lower.includes("canvas") ||
    lower.includes("phaser")
  ) {
    stack.push("Canvas / 2D");
  }
  if (lower.includes("ai")) {
    stack.push("Gemini API");
  }
  if (stack.length === 0) {
    stack.push("TypeScript", "Vite");
  }
  return stack;
};

export const isDirHandle = (entry: unknown): boolean =>
  entry !== null &&
  typeof entry === "object" &&
  typeof (entry as Record<string, unknown>).values === "function" &&
  typeof (entry as Record<string, unknown>).getDirectoryHandle === "function";

export const isFileHandle = (entry: unknown): boolean =>
  entry !== null &&
  typeof entry === "object" &&
  typeof (entry as Record<string, unknown>).getFile === "function" &&
  !isDirHandle(entry);

export async function* walkDirectory(
  dir: unknown,
  prefix = "",
): AsyncGenerator<{ path: string; handle: unknown }> {
  const dirVal = dir as { values: () => AsyncIterableIterator<unknown> };
  for await (const entry of dirVal.values()) {
    const entryVal = entry as { name: string };
    const relPath = prefix ? `${prefix}/${entryVal.name}` : entryVal.name;
    if (isDirHandle(entry)) {
      yield* walkDirectory(entry, relPath);
    } else if (isFileHandle(entry)) {
      yield { path: relPath, handle: entry };
    }
  }
}

const coverPattern =
  /(^|\/)(cover|thumbnail|screenshot|icon|logo)[^/]*\.(png|jpe?g|webp|gif|svg)$/i;
const imagePattern = /\.(png|jpe?g|webp|gif|svg)$/i;

export const findCoverImage = async (
  rootDir: unknown,
): Promise<string | undefined> => {
  const candidates: unknown[] = [];
  for await (const { path, handle } of walkDirectory(rootDir)) {
    if (imagePattern.test(path)) {
      if (coverPattern.test(path)) {
        candidates.unshift(handle);
      } else {
        candidates.push(handle);
      }
    }
  }
  if (candidates.length === 0) {
    return undefined;
  }
  const preferred = (candidates.find((h) =>
    coverPattern.test((h as { name: string }).name),
  ) ?? candidates[0]) as { getFile: () => Promise<File> };
  try {
    const file = await preferred.getFile();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  } catch (e) {
    logger.warn("Cover image read failed:", e);
    return undefined;
  }
};

export const findEntryHTMLPath = async (
  rootDir: unknown,
): Promise<string | undefined> => {
  const dirVal = rootDir as {
    getDirectoryHandle: (name: string) => Promise<unknown>;
    getFileHandle: (name: string) => Promise<unknown>;
  };
  for (const rel of ["dist/index.html", "index.html"]) {
    const parts = rel.split("/");
    let dir: unknown = rootDir;
    let ok = true;
    for (let i = 0; i < parts.length - 1; i++) {
      try {
        dir = await (
          dir as { getDirectoryHandle: (name: string) => Promise<unknown> }
        ).getDirectoryHandle(parts[i]);
      } catch {
        ok = false;
        break;
      }
    }
    if (!ok) {
      continue;
    }
    try {
      await (
        dir as { getFileHandle: (name: string) => Promise<unknown> }
      ).getFileHandle(parts[parts.length - 1]);
      return rel;
    } catch {
      // try next
    }
  }
  return undefined;
};

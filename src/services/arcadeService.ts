import { GameEntry } from "@/types/game.js";
import type { IArcadeRepository } from "@/domain/repositories/IArcadeRepository.js";

/* ------------------------------------------------------------------ */
/* Generic helpers (pure — no persistence, no chrome.*)                */
/* ------------------------------------------------------------------ */

/** Minimal interface for FileSystemDirectoryHandle operations used in this module. */
interface DirHandle {
  getDirectoryHandle(name: string): Promise<DirHandle>;
  getFileHandle(name: string): Promise<FileHandle>;
  values(): AsyncIterableIterator<DirHandle | FileHandle>;
}

interface FileHandle {
  getFile(): Promise<File>;
}

const ensurePermission = async (handle: unknown): Promise<boolean> => {
  const h = handle as { queryPermission?: (opts: { mode: string }) => Promise<string>; requestPermission?: (opts: { mode: string }) => Promise<string> };
  if (h.queryPermission) {
    const state = await h.queryPermission({ mode: "read" });
    if (state === "granted") {return true;}
    if (h.requestPermission) {
      const next = await h.requestPermission({ mode: "read" });
      return next === "granted";
    }
  }
  return false;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.byteLength; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, Math.min(i + chunkSize, bytes.byteLength)) as unknown as number[],
    );
  }
  return btoa(binary);
};

const getMimeType = (filename: string, fallbackType?: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "js": case "mjs": return "text/javascript;charset=utf-8";
    case "css": return "text/css;charset=utf-8";
    case "html": case "htm": return "text/html;charset=utf-8";
    case "json": return "application/json;charset=utf-8";
    case "png": return "image/png";
    case "jpg": case "jpeg": return "image/jpeg";
    case "gif": return "image/gif";
    case "webp": return "image/webp";
    case "svg": return "image/svg+xml;charset=utf-8";
    case "woff": return "font/woff";
    case "woff2": return "font/woff2";
    case "ttf": return "font/ttf";
    case "otf": return "font/otf";
    case "mp3": return "audio/mpeg";
    case "wav": return "audio/wav";
    case "ogg": return "audio/ogg";
    case "mp4": return "video/mp4";
    default: return fallbackType || "application/octet-stream";
  }
};

const formatFolderName = (name: string): string => {
  const cleaned = name.replace(/[-_]+/g, " ").trim();
  return cleaned
    .split(/\s+/)
    .map((word) => word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1))
    .join(" ");
};

const detectCategory = (name: string): GameEntry["category"] => {
  const lower = name.toLowerCase();
  if (lower.includes("rpg") || lower.includes("adventure") || lower.includes("isekai") || lower.includes("quest")) {return "rpg";}
  if (lower.includes("sim") || lower.includes("manager") || lower.includes("survival") || lower.includes("tycoon") || lower.includes("market") || lower.includes("stardew")) {return "simulation";}
  if (lower.includes("ai") || lower.includes("focus")) {return "ai";}
  if (lower.includes("puzzle") || lower.includes("match") || lower.includes("tarot") || lower.includes("card")) {return "puzzle";}
  if (lower.includes("race") || lower.includes("moto") || lower.includes("runner") || lower.includes("wave")) {return "casual";}
  return "action";
};

const detectTechStack = (name: string): string[] => {
  const lower = name.toLowerCase();
  const stack: string[] = [];
  if (lower.includes("3d") || lower.includes("voxel") || lower.includes("webgl")) {stack.push("Three.js");}
  if (lower.includes("2d") || lower.includes("canvas") || lower.includes("phaser")) {stack.push("Canvas / 2D");}
  if (lower.includes("ai")) {stack.push("Gemini API");}
  if (stack.length === 0) {stack.push("TypeScript", "Vite");}
  return stack;
};

const isDirHandle = (entry: unknown): boolean =>
  entry !== null &&
  typeof entry === "object" &&
  typeof (entry as Record<string, unknown>).values === "function" &&
  typeof (entry as Record<string, unknown>).getDirectoryHandle === "function";

const isFileHandle = (entry: unknown): boolean =>
  entry !== null &&
  typeof entry === "object" &&
  typeof (entry as Record<string, unknown>).getFile === "function" &&
  !isDirHandle(entry);

async function* walkDirectory(
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

const coverPattern = /(^|\/)(cover|thumbnail|screenshot|icon|logo)[^/]*\.(png|jpe?g|webp|gif|svg)$/i;
const imagePattern = /\.(png|jpe?g|webp|gif|svg)$/i;

const findCoverImage = async (rootDir: unknown): Promise<string | undefined> => {
  const candidates: unknown[] = [];
  for await (const { path, handle } of walkDirectory(rootDir)) {
    if (imagePattern.test(path)) {
      if (coverPattern.test(path)) {candidates.unshift(handle);}
      else {candidates.push(handle);}
    }
  }
  if (candidates.length === 0) {return undefined;}
  const preferred = (candidates.find((h) => coverPattern.test((h as { name: string }).name)) ?? candidates[0]) as { getFile: () => Promise<File> };
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

const findEntryHTMLPath = async (rootDir: unknown): Promise<string | undefined> => {
  const dirVal = rootDir as { getDirectoryHandle: (name: string) => Promise<unknown>; getFileHandle: (name: string) => Promise<unknown> };
  for (const rel of ["dist/index.html", "index.html"]) {
    const parts = rel.split("/");
    let dir: unknown = rootDir;
    let ok = true;
    for (let i = 0; i < parts.length - 1; i++) {
      try {
        dir = await (dir as { getDirectoryHandle: (name: string) => Promise<unknown> }).getDirectoryHandle(parts[i]);
      } catch {
        ok = false;
        break;
      }
    }
    if (!ok) {continue;}
    try {
      await (dir as { getFileHandle: (name: string) => Promise<unknown> }).getFileHandle(parts[parts.length - 1]);
      return rel;
    } catch {
      // try next
    }
  }
  return undefined;
};

/* ------------------------------------------------------------------ */
/* HTML rewriting (pure helpers)                                       */
/* ------------------------------------------------------------------ */

const isExternal = (value: string): boolean => {
  if (!value) {return true;}
  if (/^(https?:|data:|blob:|javascript:)/i.test(value)) {return true;}
  if (value.startsWith("#")) {return true;}
  return false;
};

const joinPath = (base: string, rel: string): string => {
  let cleanRel = rel;
  if (cleanRel.startsWith("/")) { cleanRel = cleanRel.slice(1); }
  const stack = base.split("/").filter(Boolean);
  for (const part of cleanRel.split("/")) {
    if (part === "" || part === ".") {continue;}
    if (part === "..") {stack.pop();}
    else {stack.push(part);}
  }
  return stack.join("/");
};

const rewriteHTML = async (
  html: string,
  basePrefix: string,
  resolve: (relPath: string) => Promise<string | null>,
): Promise<string> => {
  const tagRegex = /<(link|script|img|source|video|audio)\b([^>]*)>/gi;
  const out: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(html))) {
    out.push(html.slice(lastIndex, match.index));
    const [, tag, attrs] = match;
    const newAttrs = await rewriteAttributes(attrs, basePrefix, resolve);
    out.push(`<${tag}${newAttrs}>`);
    lastIndex = tagRegex.lastIndex;
  }
  out.push(html.slice(lastIndex));
  return out.join("");
};

const rewriteAttributes = async (
  attrs: string,
  basePrefix: string,
  resolve: (relPath: string) => Promise<string | null>,
): Promise<string> => {
  const attrRegex = /\b([a-zA-Z\-:]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let result = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = attrRegex.exec(attrs))) {
    result += attrs.slice(last, m.index);
    const name = m[1].toLowerCase();
    const value = m[2] ?? m[3] ?? "";
    let newValue = value;
    if ((name === "src" || name === "href" || name === "poster") && !isExternal(value)) {
      const resolved = await resolve(joinPath(basePrefix, value));
      if (resolved) {newValue = resolved;}
    } else if (name === "srcset") {
      const parts = value.split(",").map((entry) => entry.trim());
      const rewritten = await Promise.all(parts.map(async (entry) => {
        const [urlPart, ...rest] = entry.split(/\s+/);
        const resolved = await resolve(joinPath(basePrefix, urlPart));
        return resolved ? [resolved, ...rest].join(" ") : entry;
      }));
      newValue = rewritten.join(", ");
    }
    result += `${m[1]}="${newValue.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`;
    last = attrRegex.lastIndex;
  }
  result += attrs.slice(last);
  return result;
};

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export interface GamePackage {
  html: string;
  files: Record<string, ArrayBuffer>;
}

export type ImportMode = "dist" | "dev";

export interface ImportResult {
  game: GameEntry;
  mode: ImportMode;
  missingDist: boolean;
}

export function createArcadeService(repo: IArcadeRepository) {
  return {
    async loadGames(): Promise<GameEntry[]> {
      return repo.getAllGames();
    },

    async importFolder(): Promise<ImportResult | null> {
      if (typeof window === "undefined" || typeof window.showDirectoryPicker !== "function") {
        throw new Error("Bu tarayıcı File System Access API'ı desteklemiyor. Lütfen Chrome veya Edge'in güncel sürümünü kullanın.");
      }
      const dir = await window.showDirectoryPicker({ mode: "read" });
      const folderName = dir.name;

      const handleId = `h_${crypto.randomUUID()}`;
      await repo.saveDirectoryHandle(handleId, dir);

      const entryHTMLPath = await findEntryHTMLPath(dir);
      const coverImage = await findCoverImage(dir);
      const isPlayable = Boolean(entryHTMLPath);

      let displayTitle = formatFolderName(folderName);
      if (folderName.toLowerCase() === "dist" || folderName.toLowerCase() === "build") {
        displayTitle = `Oyun Projesi (${folderName})`;
      }

      const game: GameEntry = {
        id: `import_${handleId.slice(2, 14)}`,
        title: displayTitle,
        description: isPlayable
          ? `${displayTitle} (çalıştırmaya hazır).`
          : `${displayTitle} geliştirme aşamasında. Oynamak için npm run dev çalıştırın.`,
        category: detectCategory(folderName),
        status: isPlayable ? "playable" : "in_progress",
        coverImage,
        folderPath: folderName,
        handleId,
        entryHTMLPath,
        mode: isPlayable ? "dist" : "dev",
        techStack: detectTechStack(folderName),
        devNotes: "",
        isFavorite: false,
        createdAt: new Date().toISOString(),
      };

      const games = await repo.getAllGames();
      const next = [game, ...games.filter((g) => g.handleId !== handleId && g.folderPath !== folderName)];
      await repo.saveAllGames(next);
      return { game, mode: isPlayable ? "dist" : "dev", missingDist: !isPlayable };
    },

    async loadGamePackage(game: GameEntry): Promise<GamePackage | null> {
      const handle = await repo.getDirectoryHandle(game.handleId);
      if (!handle) {return null;}
      const ok = await ensurePermission(handle);
      if (!ok) {return null;}

      const ALLOWED_ENTRY_PATHS = ["dist/index.html", "index.html"] as const;
      const candidate = game.entryHTMLPath ?? "dist/index.html";
      if (!ALLOWED_ENTRY_PATHS.includes(candidate as typeof ALLOWED_ENTRY_PATHS[number])) {
        logger.warn("Disallowed entryHTMLPath:", candidate);
        return null;
      }

      const parts = candidate.split("/");
      const fileName = parts.pop()!;
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
      const files: Record<string, ArrayBuffer> = {};

      for await (const { path, handle: fHandle } of walkDirectory(folderDir)) {
        if (path === fileName) {continue;}
        try {
          const file = await (fHandle as FileHandle).getFile();
          files[path] = await file.arrayBuffer();
        } catch (e) {
          logger.warn("Failed reading asset:", path, e);
        }
      }

      return { html, files };
    },

    async resolveGameURL(game: GameEntry): Promise<string | null> {
      const handle = await repo.getDirectoryHandle(game.handleId);
      if (!handle) {return null;}
      const ok = await ensurePermission(handle);
      if (!ok) {return null;}

      const ALLOWED_ENTRY_PATHS = ["dist/index.html", "index.html"] as const;
      const candidate = game.entryHTMLPath ?? "dist/index.html";
      if (!ALLOWED_ENTRY_PATHS.includes(candidate as typeof ALLOWED_ENTRY_PATHS[number])) {
        logger.warn("Refusing to resolve disallowed entryHTMLPath:", candidate);
        return null;
      }

      const rootPath = candidate;
      const parts = rootPath.split("/");
      const fileName = parts.pop()!;
      if (parts.some((p) => p === "" || p === "." || p === "..")) {return null;}
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
        if (!clean) {return null;}
        const segments = clean.split("/");
        if (segments.some((p) => p === "..")) {return null;}
        if (cache.has(clean)) {return cache.get(clean)!;}
        let parent = handle as DirHandle;
        for (let i = 0; i < segments.length - 1; i++) {
          const seg = segments[i];
          if (seg === "" || seg === ".") {continue;}
          try {
            parent = await parent.getDirectoryHandle(seg);
          } catch {
            return null;
          }
        }
        const targetName = segments[segments.length - 1];
        if (!targetName || targetName.includes("/") || targetName.includes("\\") || targetName === "." || targetName === "..") {
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
      rewritten = rewritten.replace(/<meta\s+[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi, "");
      rewritten = rewritten.replace(/<meta\s+[^>]*http-equiv\s*=\s*["']?(x-frame-options|content-security-policy)["']?[^>]*>/gi, "");
      rewritten = rewritten.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*')/gi, "");
      return rewritten;
    },

    async resolveGameHTML(game: GameEntry): Promise<string | null> {
      return this.resolveGameURL(game);
    },

    async deleteGame(gameId: string): Promise<GameEntry[]> {
      const games = await repo.getAllGames();
      const target = games.find((g) => g.id === gameId);
      const next = games.filter((g) => g.id !== gameId);
      await repo.saveAllGames(next);
      if (target?.handleId) {
        try { await repo.deleteDirectoryHandle(target.handleId); } catch { /* ignore */ }
      }
      return next;
    },

    async toggleFavorite(gameId: string): Promise<GameEntry[]> {
      const games = await repo.getAllGames();
      const next = games.map((g) => (g.id === gameId ? { ...g, isFavorite: !g.isFavorite } : g));
      await repo.saveAllGames(next);
      return next;
    },

    async updateGameStatus(gameId: string, status: GameEntry["status"]): Promise<GameEntry[]> {
      const games = await repo.getAllGames();
      const next = games.map((g) => (g.id === gameId ? { ...g, status } : g));
      await repo.saveAllGames(next);
      return next;
    },

    async updateDevNotes(gameId: string, notes: string, todoList?: GameEntry["todoList"], title?: string): Promise<GameEntry[]> {
      const games = await repo.getAllGames();
      const next = games.map((g) =>
        g.id === gameId ? { ...g, devNotes: notes, todoList: todoList ?? g.todoList, title: title?.trim() || g.title } : g,
      );
      await repo.saveAllGames(next);
      return next;
    },

    async recheckGame(gameId: string): Promise<GameEntry | null> {
      const games = await repo.getAllGames();
      const g = games.find((x) => x.id === gameId);
      if (!g) {return null;}
      const handle = await repo.getDirectoryHandle(g.handleId);
      if (!handle) {return g;}

      const hasDist = await hasDirectoryNamed(handle, "dist");
      const updated: GameEntry = {
        ...g,
        mode: hasDist ? "dist" : "dev",
        status: hasDist ? "playable" : "in_progress",
        entryHTMLPath: await findEntryHTMLPath(handle),
      };
      const next = games.map((x) => (x.id === gameId ? updated : x));
      await repo.saveAllGames(next);
      return updated;
    },

    async ensurePermissionForGame(gameId: string): Promise<boolean> {
      const games = await repo.getAllGames();
      const g = games.find((x) => x.id === gameId);
      if (!g) {return false;}
      const handle = await repo.getDirectoryHandle(g.handleId);
      if (!handle) {return false;}
      return ensurePermission(handle);
    },

    async listGamesWithAccess(): Promise<GameEntry[]> {
      const games = await repo.getAllGames();
      const result: GameEntry[] = [];
      for (const g of games) {
        const handle = await repo.getDirectoryHandle(g.handleId);
        if (handle) {result.push(g);}
      }
      return result;
    },
  };
}

export type ArcadeService = ReturnType<typeof createArcadeService>;

/* ------------------------------------------------------------------ */
/* Misc (module-private)                                                */
/* ------------------------------------------------------------------ */

async function hasDirectoryNamed(root: unknown, name: string): Promise<boolean> {
  try {
    await (root as { getDirectoryHandle: (name: string) => Promise<unknown> }).getDirectoryHandle(name);
    return true;
  } catch {
    return false;
  }
}

/**
 * Singleton instance with the default storage-backed repository.
 */
import { ChromeStorageArcadeRepository } from "@/infrastructure/persistence/ChromeStorageArcadeRepository.js";
import { logger } from "@/utils/logger.js";
const _defaultRepo = new ChromeStorageArcadeRepository();
export const arcadeService = createArcadeService(_defaultRepo);

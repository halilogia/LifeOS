import { GameEntry } from "@/types/game.js";

const STORAGE_KEY_GAMES = "lifeos_arcade_games_v1";
const LEGACY_SYNC_KEY_GAMES = STORAGE_KEY_GAMES;
const IDB_NAME = "lifeos_arcade_handles";
const IDB_STORE = "directory_handles";
const IDB_KEY = (id: string) => `handle_${id}`;

/* ------------------------------------------------------------------ */
/* IndexedDB helpers for FileSystemDirectoryHandle persistence        */
/* ------------------------------------------------------------------ */

const openHandlesDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const putHandle = async (id: string, handle: any): Promise<void> => {
  const db = await openHandlesDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(handle, IDB_KEY(id));
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
};

const isValidDirHandle = (h: any): boolean =>
  h !== null &&
  h !== undefined &&
  typeof h === "object" &&
  typeof h.name === "string" &&
  typeof h.values === "function" &&
  typeof h.getDirectoryHandle === "function" &&
  typeof h.getFileHandle === "function";

const getHandle = async (id: string): Promise<any | null> => {
  const db = await openHandlesDB();
  return new Promise<any | null>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(IDB_KEY(id));
    req.onsuccess = () => {
      db.close();
      const raw = req.result ?? null;
      // SECURITY: validate that the stored value is actually a directory handle.
      resolve(isValidDirHandle(raw) ? raw : null);
    };
    req.onerror = () => { db.close(); reject(req.error); };
  });
};

const deleteHandle = async (id: string): Promise<void> => {
  const db = await openHandlesDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).delete(IDB_KEY(id));
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
};

const ensurePermission = async (handle: any): Promise<boolean> => {
  if (handle.queryPermission) {
    const state = await handle.queryPermission({ mode: "read" });
    if (state === "granted") {return true;}
    if (handle.requestPermission) {
      const next = await handle.requestPermission({ mode: "read" });
      return next === "granted";
    }
  }
  return false;
};

/* ------------------------------------------------------------------ */
/* Generic helpers                                                     */
/* ------------------------------------------------------------------ */

const formatFolderName = (name: string): string =>
  name.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();

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

const isDirHandle = (entry: any): boolean =>
  entry && typeof entry.values === "function" && typeof entry.getDirectoryHandle === "function";

const isFileHandle = (entry: any): boolean =>
  entry && typeof entry.getFile === "function" && !isDirHandle(entry);

const walkDirectory = async function* (
  dir: any,
  prefix = "",
): AsyncGenerator<{ path: string; handle: any }> {
  for await (const entry of dir.values()) {
    const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (isDirHandle(entry)) {
      yield* walkDirectory(entry, relPath);
    } else if (isFileHandle(entry)) {
      yield { path: relPath, handle: entry };
    }
  }
};

const coverPattern = /(^|\/)(cover|thumbnail|screenshot|icon|logo)[^/]*\.(png|jpe?g|webp|gif|svg)$/i;
const imagePattern = /\.(png|jpe?g|webp|gif|svg)$/i;

const findCoverImage = async (rootDir: any): Promise<string | undefined> => {
  const candidates: any[] = [];
  for await (const { path, handle } of walkDirectory(rootDir)) {
    if (imagePattern.test(path)) {
      if (coverPattern.test(path)) {candidates.unshift(handle);}
      else {candidates.push(handle);}
    }
  }
  if (candidates.length === 0) {return undefined;}
  const preferred = candidates.find((h) => coverPattern.test(h.name)) ?? candidates[0];
  try {
    const file = await preferred.getFile();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  } catch (e) {
    console.warn("Cover image read failed:", e);
    return undefined;
  }
};

const findEntryHTMLPath = async (rootDir: any): Promise<string | undefined> => {
  for (const rel of ["dist/index.html", "index.html"]) {
    const parts = rel.split("/");
    let dir = rootDir;
    let ok = true;
    for (let i = 0; i < parts.length - 1; i++) {
      try {
        dir = await dir.getDirectoryHandle(parts[i]);
      } catch {
        ok = false;
        break;
      }
    }
    if (!ok) {continue;}
    try {
      await dir.getFileHandle(parts[parts.length - 1]);
      return rel;
    } catch {
      // try next
    }
  }
  return undefined;
};

const readJSON = async <T,>(key: string, fallback: T): Promise<T> => {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      return new Promise<T>((resolve) => {
        chrome.storage.local.get([key], (res) => {
          const v = res?.[key];
          if (v !== undefined && v !== null) {resolve(v as T);}
          else {resolve(fallback);}
        });
      });
    }
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch (e) {
    console.error(`Failed to read ${key}:`, e);
    return fallback;
  }
};

const writeJSON = async (key: string, value: unknown): Promise<void> => {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({ [key]: value });
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.error(`Failed to write ${key}:`, e);
  }
};

/* ------------------------------------------------------------------ */
/* HTML rewriting                                                      */
/* ------------------------------------------------------------------ */

const joinPath = (base: string, rel: string): string => {
  if (rel.startsWith("/")) {return rel.slice(1);}
  const stack = base.split("/").filter(Boolean);
  for (const part of rel.split("/")) {
    if (part === "" || part === ".") {continue;}
    if (part === "..") {stack.pop();}
    else {stack.push(part);}
  }
  return stack.join("/");
};

const isExternal = (value: string): boolean => {
  if (!value) {return true;}
  if (/^(https?:|data:|blob:|javascript:)/i.test(value)) {return true;}
  if (value.startsWith("#")) {return true;}
  return false;
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

export type ImportMode = "dist" | "dev" | "missing";

export interface ImportResult {
  game: GameEntry;
  mode: ImportMode;
  missingDist: boolean;
}

export const arcadeService = {
  async loadGames(): Promise<GameEntry[]> {
    const games = await readJSON<GameEntry[]>(STORAGE_KEY_GAMES, []);
    if (games.length > 0) {return games;}

    if (typeof chrome !== "undefined" && chrome.storage?.sync) {
      const legacy = await new Promise<unknown>((resolve) => {
        chrome.storage.sync.get([LEGACY_SYNC_KEY_GAMES], (res) => {
          resolve(res?.[LEGACY_SYNC_KEY_GAMES]);
        });
      });
      if (Array.isArray(legacy)) {
        const migrated = (legacy as GameEntry[]).map((g) => ({
          ...g,
          folderPath: g.folderPath ?? "",
          handleId: g.handleId ?? "",
          mode: "dist" as const,
        }));
        await writeJSON(STORAGE_KEY_GAMES, migrated);
        return migrated;
      }
    }
    return [];
  },

  async importFolder(): Promise<ImportResult | null> {
    if (typeof window === "undefined" || typeof window.showDirectoryPicker !== "function") {
      throw new Error("Bu tarayıcı File System Access API'ı desteklemiyor. Lütfen Chrome veya Edge'in güncel sürümünü kullanın.");
    }
    const dir = await window.showDirectoryPicker({ mode: "read" });
    const folderName = dir.name;

    const handleId = `h_${crypto.randomUUID()}`;
    await putHandle(handleId, dir);

    const hasDist = await hasDirectoryNamed(dir, "dist");
    const entryHTMLPath = await findEntryHTMLPath(dir);
    const coverImage = await findCoverImage(dir);

    const game: GameEntry = {
      id: `import_${handleId.slice(2, 14)}`,
      title: formatFolderName(folderName),
      description: hasDist
        ? `${folderName} oyun projesi (dist build).`
        : `${folderName} geliştirme aşamasında. Oynamak için npm run dev çalıştırın.`,
      category: detectCategory(folderName),
      status: hasDist ? "playable" : "in_progress",
      coverImage,
      folderPath: folderName,
      handleId,
      entryHTMLPath,
      mode: hasDist ? "dist" : "dev",
      techStack: detectTechStack(folderName),
      devNotes: "",
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    const games = await this.loadGames();
    const next = [game, ...games.filter((g) => g.handleId !== handleId)];
    await writeJSON(STORAGE_KEY_GAMES, next);
    return { game, mode: hasDist ? "dist" : "dev", missingDist: !hasDist };
  },

  async resolveGameURL(game: GameEntry): Promise<string | null> {
    const handle = await getHandle(game.handleId);
    if (!handle) {return null;}
    const ok = await ensurePermission(handle);
    if (!ok) {return null;}

    // SECURITY: validate entryHTMLPath before any FS access.
    // Only allow either "dist/index.html" or "index.html" literal paths.
    // Anything else (e.g. user-controlled paths) is rejected outright.
    const ALLOWED_ENTRY_PATHS = ["dist/index.html", "index.html"] as const;
    const candidate = game.entryHTMLPath ?? "dist/index.html";
    if (!ALLOWED_ENTRY_PATHS.includes(candidate as typeof ALLOWED_ENTRY_PATHS[number])) {
      console.warn("Refusing to resolve disallowed entryHTMLPath:", candidate);
      return null;
    }
    const rootPath = candidate;
    const parts = rootPath.split("/");
    const fileName = parts.pop()!;
    // SECURITY: reject any path component that escapes the root.
    if (parts.some((p) => p === "" || p === "." || p === "..")) {return null;}
    let folderDir = handle;
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
      // SECURITY: reject path traversal segments outright.
      const segments = clean.split("/");
      if (segments.some((p) => p === "..")) {return null;}
      if (cache.has(clean)) {return cache.get(clean)!;}
      let parent = handle;
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
      // SECURITY: reject filenames that contain path separators or dots.
      if (!targetName || targetName.includes("/") || targetName.includes("\\") || targetName === "." || targetName === "..") {
        return null;
      }
      try {
        const fileHandle = await parent.getFileHandle(targetName);
        const file = await fileHandle.getFile();
        const blob = new Blob([await file.arrayBuffer()], { type: file.type || "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        cache.set(clean, url);
        return url;
      } catch {
        return null;
      }
    };

    let rewritten = await rewriteHTML(html, folderPrefix, resolveAsset);
    // SECURITY: strip <meta http-equiv="refresh"> tags that could redirect the iframe
    // to attacker-controlled URLs.
    rewritten = rewritten.replace(/<meta\s+[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi, "");
    // SECURITY: strip "X-Frame-Options" / "Content-Security-Policy" meta tags that
    // could break the iframe sandbox or grant extra permissions.
    rewritten = rewritten.replace(/<meta\s+[^>]*http-equiv\s*=\s*["']?(x-frame-options|content-security-policy)["']?[^>]*>/gi, "");
    // SECURITY: strip inline event handlers like onclick="..." that could leak
    // a parent frame reference.
    rewritten = rewritten.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*')/gi, "");
    const blob = new Blob([rewritten], { type: "text/html; charset=utf-8" });
    return URL.createObjectURL(blob);
  },

  async deleteGame(gameId: string): Promise<GameEntry[]> {
    const games = await this.loadGames();
    const target = games.find((g) => g.id === gameId);
    const next = games.filter((g) => g.id !== gameId);
    await writeJSON(STORAGE_KEY_GAMES, next);
    if (target?.handleId) {
      try { await deleteHandle(target.handleId); } catch (_) { /* ignore */ }
    }
    return next;
  },

  async toggleFavorite(gameId: string): Promise<GameEntry[]> {
    const games = await this.loadGames();
    const next = games.map((g) => (g.id === gameId ? { ...g, isFavorite: !g.isFavorite } : g));
    await writeJSON(STORAGE_KEY_GAMES, next);
    return next;
  },

  async updateGameStatus(gameId: string, status: GameEntry["status"]): Promise<GameEntry[]> {
    const games = await this.loadGames();
    const next = games.map((g) => (g.id === gameId ? { ...g, status } : g));
    await writeJSON(STORAGE_KEY_GAMES, next);
    return next;
  },

  async updateDevNotes(gameId: string, notes: string, todoList?: GameEntry["todoList"]): Promise<GameEntry[]> {
    const games = await this.loadGames();
    const next = games.map((g) =>
      g.id === gameId ? { ...g, devNotes: notes, todoList: todoList ?? g.todoList } : g,
    );
    await writeJSON(STORAGE_KEY_GAMES, next);
    return next;
  },

  async recheckGame(gameId: string): Promise<GameEntry | null> {
    const games = await this.loadGames();
    const g = games.find((x) => x.id === gameId);
    if (!g) {return null;}
    const handle = await getHandle(g.handleId);
    if (!handle) {return g;}

    const hasDist = await hasDirectoryNamed(handle, "dist");
    const updated: GameEntry = {
      ...g,
      mode: hasDist ? "dist" : "dev",
      status: hasDist ? "playable" : "in_progress",
      entryHTMLPath: await findEntryHTMLPath(handle),
    };
    const next = games.map((x) => (x.id === gameId ? updated : x));
    await writeJSON(STORAGE_KEY_GAMES, next);
    return updated;
  },

  async ensurePermissionForGame(gameId: string): Promise<boolean> {
    const games = await this.loadGames();
    const g = games.find((x) => x.id === gameId);
    if (!g) {return false;}
    const handle = await getHandle(g.handleId);
    if (!handle) {return false;}
    return ensurePermission(handle);
  },

  async listGamesWithAccess(): Promise<GameEntry[]> {
    const games = await this.loadGames();
    const result: GameEntry[] = [];
    for (const g of games) {
      const handle = await getHandle(g.handleId);
      if (handle) {result.push(g);}
    }
    return result;
  },
};

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */

async function hasDirectoryNamed(root: any, name: string): Promise<boolean> {
  try {
    await root.getDirectoryHandle(name);
    return true;
  } catch {
    return false;
  }
}

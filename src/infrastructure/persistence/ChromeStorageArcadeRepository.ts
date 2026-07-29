/**
 * ChromeStorageArcadeRepository
 * Infrastructure implementation of IArcadeRepository.
 *
 * Uses chrome.storage.local for game metadata, IndexedDB for
 * FileSystemDirectoryHandle objects, and chrome.storage.sync for
 * legacy migration.
 */

import type { IArcadeRepository } from "@/domain/repositories/IArcadeRepository.js";
import type { GameEntry } from "@/types/game.js";
import { LOCAL_ARCADE_GAMES } from "@/infrastructure/storage/keys.js";

const STORAGE_KEY_GAMES = LOCAL_ARCADE_GAMES;
const LEGACY_SYNC_KEY_GAMES = STORAGE_KEY_GAMES;

/* ------------------------------------------------------------------ */
/* IndexedDB helpers (directory handle persistence)                    */
/* ------------------------------------------------------------------ */

const IDB_NAME = "lifeos_arcade_handles";
const IDB_STORE = "directory_handles";
const IDB_KEY = (id: string) => `handle_${id}`;

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

const isValidDirHandle = (h: unknown): boolean =>
  h !== null &&
  h !== undefined &&
  typeof h === "object" &&
  typeof (h as Record<string, unknown>).name === "string" &&
  typeof (h as Record<string, unknown>).values === "function" &&
  typeof (h as Record<string, unknown>).getDirectoryHandle === "function" &&
  typeof (h as Record<string, unknown>).getFileHandle === "function";

const getHandleInner = async (id: string): Promise<unknown | null> => {
  const db = await openHandlesDB();
  return new Promise<unknown | null>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(IDB_KEY(id));
    req.onsuccess = () => {
      db.close();
      const raw = req.result ?? null;
      resolve(isValidDirHandle(raw) ? raw : null);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
};

const putHandleInner = async (id: string, handle: unknown): Promise<void> => {
  const db = await openHandlesDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(handle, IDB_KEY(id));
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
};

const deleteHandleInner = async (id: string): Promise<void> => {
  const db = await openHandlesDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).delete(IDB_KEY(id));
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
};

/* ------------------------------------------------------------------ */
/* chrome.storage helpers                                              */
/* ------------------------------------------------------------------ */

const readJSON = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      return new Promise<T>((resolve) => {
        chrome.storage.local.get([key], (res) => {
          const v = res?.[key];
          if (v !== undefined && v !== null) {
            resolve(v as T);
          } else {
            resolve(fallback);
          }
        });
      });
    }
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
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
  } catch {
    // swallow write errors
  }
};

/* ------------------------------------------------------------------ */
/* Repository implementation                                           */
/* ------------------------------------------------------------------ */

export class ChromeStorageArcadeRepository implements IArcadeRepository {
  async getAllGames(): Promise<GameEntry[]> {
    const games = await readJSON<GameEntry[]>(STORAGE_KEY_GAMES, []);
    if (games.length > 0) {
      return games;
    }

    // Fallback: legacy sync migration
    const legacy = await this.loadLegacySyncGames();
    if (legacy && legacy.length > 0) {
      const migrated = legacy.map((g) => ({
        ...g,
        folderPath: g.folderPath ?? "",
        handleId: g.handleId ?? "",
        mode: "dist" as const,
      }));
      await writeJSON(STORAGE_KEY_GAMES, migrated);
      return migrated;
    }

    return [];
  }

  async saveAllGames(games: GameEntry[]): Promise<void> {
    await writeJSON(STORAGE_KEY_GAMES, games);
  }

  async loadLegacySyncGames(): Promise<GameEntry[] | null> {
    if (typeof chrome === "undefined" || !chrome.storage?.sync) {
      return null;
    }
    return new Promise<GameEntry[] | null>((resolve) => {
      chrome.storage.sync.get([LEGACY_SYNC_KEY_GAMES], (res) => {
        const data = res?.[LEGACY_SYNC_KEY_GAMES];
        resolve(Array.isArray(data) ? (data as GameEntry[]) : null);
      });
    });
  }

  async getDirectoryHandle(handleId: string): Promise<unknown | null> {
    return getHandleInner(handleId);
  }

  async saveDirectoryHandle(handleId: string, handle: unknown): Promise<void> {
    await putHandleInner(handleId, handle);
  }

  async deleteDirectoryHandle(handleId: string): Promise<void> {
    await deleteHandleInner(handleId);
  }
}

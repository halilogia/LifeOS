import { GameEntry } from "@/types/game.js";
import type { IArcadeRepository } from "@/domain/repositories/IArcadeRepository.js";
import { logger } from "@/utils/logger.js";
import {
  ensurePermission,
  formatFolderName,
  detectCategory,
  detectTechStack,
  walkDirectory,
  findCoverImage,
  findEntryHTMLPath,
} from "./arcadeFileSystem.js";
import { resolveGameURL } from "./arcadeGameLauncher.js";
import type { GamePackage, ImportResult } from "./types.js";

interface DirHandle {
  getDirectoryHandle(name: string): Promise<DirHandle>;
  getFileHandle(name: string): Promise<FileHandle>;
  values(): AsyncIterableIterator<DirHandle | FileHandle>;
}

interface FileHandle {
  getFile(): Promise<File>;
}

async function hasDirectoryNamed(
  root: unknown,
  name: string,
): Promise<boolean> {
  try {
    await (
      root as { getDirectoryHandle: (name: string) => Promise<unknown> }
    ).getDirectoryHandle(name);
    return true;
  } catch {
    return false;
  }
}

export function createArcadeService(repo: IArcadeRepository) {
  return {
    async loadGames(): Promise<GameEntry[]> {
      return repo.getAllGames();
    },

    async importFolder(): Promise<ImportResult | null> {
      if (
        typeof window === "undefined" ||
        typeof window.showDirectoryPicker !== "function"
      ) {
        throw new Error(
          "Bu tarayıcı File System Access API'ı desteklemiyor. Lütfen Chrome veya Edge'in güncel sürümünü kullanın.",
        );
      }
      const dir = await window.showDirectoryPicker({ mode: "read" });
      const folderName = dir.name;

      const handleId = `h_${crypto.randomUUID()}`;
      await repo.saveDirectoryHandle(handleId, dir);

      const entryHTMLPath = await findEntryHTMLPath(dir);
      const coverImage = await findCoverImage(dir);
      const isPlayable = Boolean(entryHTMLPath);

      let displayTitle = formatFolderName(folderName);
      if (
        folderName.toLowerCase() === "dist" ||
        folderName.toLowerCase() === "build"
      ) {
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
      const next = [
        game,
        ...games.filter(
          (g) => g.handleId !== handleId && g.folderPath !== folderName,
        ),
      ];
      await repo.saveAllGames(next);
      return {
        game,
        mode: isPlayable ? "dist" : "dev",
        missingDist: !isPlayable,
      };
    },

    async loadGamePackage(game: GameEntry): Promise<GamePackage | null> {
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
        if (path === fileName) {
          continue;
        }
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
      return resolveGameURL(repo, game);
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
        try {
          await repo.deleteDirectoryHandle(target.handleId);
        } catch {
          /* ignore */
        }
      }
      return next;
    },

    async toggleFavorite(gameId: string): Promise<GameEntry[]> {
      const games = await repo.getAllGames();
      const next = games.map((g) =>
        g.id === gameId ? { ...g, isFavorite: !g.isFavorite } : g,
      );
      await repo.saveAllGames(next);
      return next;
    },

    async updateGameStatus(
      gameId: string,
      status: GameEntry["status"],
    ): Promise<GameEntry[]> {
      const games = await repo.getAllGames();
      const next = games.map((g) => (g.id === gameId ? { ...g, status } : g));
      await repo.saveAllGames(next);
      return next;
    },

    async updateDevNotes(
      gameId: string,
      notes: string,
      todoList?: GameEntry["todoList"],
      title?: string,
    ): Promise<GameEntry[]> {
      const games = await repo.getAllGames();
      const next = games.map((g) =>
        g.id === gameId
          ? {
              ...g,
              devNotes: notes,
              todoList: todoList ?? g.todoList,
              title: title?.trim() || g.title,
            }
          : g,
      );
      await repo.saveAllGames(next);
      return next;
    },

    async recheckGame(gameId: string): Promise<GameEntry | null> {
      const games = await repo.getAllGames();
      const g = games.find((x) => x.id === gameId);
      if (!g) {
        return null;
      }
      const handle = await repo.getDirectoryHandle(g.handleId);
      if (!handle) {
        return g;
      }

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
      if (!g) {
        return false;
      }
      const handle = await repo.getDirectoryHandle(g.handleId);
      if (!handle) {
        return false;
      }
      return ensurePermission(handle);
    },

    async listGamesWithAccess(): Promise<GameEntry[]> {
      const games = await repo.getAllGames();
      const result: GameEntry[] = [];
      for (const g of games) {
        const handle = await repo.getDirectoryHandle(g.handleId);
        if (handle) {
          result.push(g);
        }
      }
      return result;
    },
  };
}

export type ArcadeService = ReturnType<typeof createArcadeService>;

import { ChromeStorageArcadeRepository } from "@/infrastructure/persistence/repositories/ChromeStorageArcadeRepository.js";
const _defaultRepo = new ChromeStorageArcadeRepository();
export const arcadeService = createArcadeService(_defaultRepo);

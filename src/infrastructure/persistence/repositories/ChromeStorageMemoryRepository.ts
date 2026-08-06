/**
 * ChromeStorageMemoryRepository
 * Infrastructure implementation of IMemoryRepository using chrome.storage.local
 * for AI user memory (memory.md).
 */

import type { IMemoryRepository } from "@/domain/repositories/IMemoryRepository.js";
import { SYNC_AI_USER_MEMORY } from "@/infrastructure/storage/keys.js";

const MEMORY_KEY = SYNC_AI_USER_MEMORY;

export class ChromeStorageMemoryRepository implements IMemoryRepository {
  async getMemory(): Promise<string> {
    return new Promise<string>((resolve) => {
      chrome.storage.local.get([MEMORY_KEY], (res: Record<string, unknown>) => {
        resolve(typeof res?.[MEMORY_KEY] === "string" ? res[MEMORY_KEY] : "");
      });
    });
  }

  async setMemory(memory: string): Promise<void> {
    return new Promise<void>((resolve) => {
      chrome.storage.local.set({ [MEMORY_KEY]: memory }, resolve);
    });
  }
}

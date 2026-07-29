/**
 * ChromeStorageMemoryRepository
 * Infrastructure implementation of IMemoryRepository using chrome.storage.sync
 * for AI user memory (memory.md).
 */

import type { IMemoryRepository } from "@/domain/repositories/IMemoryRepository.js";

const MEMORY_KEY = "aiUserMemory";

export class ChromeStorageMemoryRepository implements IMemoryRepository {
  async getMemory(): Promise<string> {
    return new Promise<string>((resolve) => {
      chrome.storage.sync.get([MEMORY_KEY], (res: Record<string, unknown>) => {
        resolve(typeof res?.[MEMORY_KEY] === "string" ? res[MEMORY_KEY] : "");
      });
    });
  }

  async setMemory(memory: string): Promise<void> {
    return new Promise<void>((resolve) => {
      chrome.storage.sync.set({ [MEMORY_KEY]: memory }, resolve);
    });
  }
}

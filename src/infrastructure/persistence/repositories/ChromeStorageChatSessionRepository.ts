/**
 * ChromeStorageChatSessionRepository.ts
 * Infrastructure implementation of IChatSessionRepository using chrome.storage.local.
 */

import type { IChatSessionRepository } from "@/domain/repositories/IChatSessionRepository.js";
import type { ChatSession } from "@/services/aichat/types.js";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

const CHAT_SESSIONS_STORAGE_KEY = "lifeos_chat_sessions";

export class ChromeStorageChatSessionRepository implements IChatSessionRepository {
  private async readAllFromStorage(): Promise<ChatSession[]> {
    return new Promise<ChatSession[]>((resolve) => {
      if (typeof chrome !== "undefined" && chrome?.storage?.local) {
        chrome.storage.local.get([CHAT_SESSIONS_STORAGE_KEY], (res: Record<string, unknown>) => {
          const sessions = res?.[CHAT_SESSIONS_STORAGE_KEY];
          if (Array.isArray(sessions)) {
            resolve(sessions as ChatSession[]);
          } else {
            resolve([]);
          }
        });
      } else {
        // Fallback for tests / non-extension environments
        try {
          const raw = localStorage.getItem(CHAT_SESSIONS_STORAGE_KEY);
          resolve(raw ? JSON.parse(raw) : []);
        } catch {
          resolve([]);
        }
      }
    });
  }

  private async writeAllToStorage(sessions: ChatSession[]): Promise<void> {
    return new Promise<void>((resolve) => {
      if (typeof chrome !== "undefined" && chrome?.storage?.local) {
        chrome.storage.local.set({ [CHAT_SESSIONS_STORAGE_KEY]: sessions }, () => {
          scheduleCloudBackup();
          resolve();
        });
      } else {
        try {
          localStorage.setItem(CHAT_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
        } catch {
          /* ignore */
        }
        resolve();
      }
    });
  }

  async getAllSessions(scope?: "sidepanel" | "newtab"): Promise<ChatSession[]> {
    const all = await this.readAllFromStorage();
    const filtered = scope ? all.filter((s) => s.scope === scope) : all;
    return filtered.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    const all = await this.readAllFromStorage();
    return all.find((s) => s.id === sessionId) || null;
  }

  async saveSession(session: ChatSession): Promise<void> {
    const all = await this.readAllFromStorage();
    const existingIndex = all.findIndex((s) => s.id === session.id);

    const updatedSession: ChatSession = {
      ...session,
      updatedAt: session.updatedAt || Date.now(),
    };

    if (existingIndex >= 0) {
      all[existingIndex] = updatedSession;
    } else {
      all.unshift(updatedSession);
    }

    await this.writeAllToStorage(all);
  }

  async deleteSession(sessionId: string): Promise<void> {
    const all = await this.readAllFromStorage();
    const filtered = all.filter((s) => s.id !== sessionId);
    await this.writeAllToStorage(filtered);
  }

  async renameSession(sessionId: string, newTitle: string): Promise<void> {
    const all = await this.readAllFromStorage();
    const target = all.find((s) => s.id === sessionId);
    if (target) {
      target.title = newTitle.trim() || target.title;
      target.updatedAt = Date.now();
      await this.writeAllToStorage(all);
    }
  }
}

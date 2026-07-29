/**
 * ChromeStorageAiConfigRepository
 * Infrastructure implementation of IAiConfigRepository.
 * Reads from chrome.storage.sync first, falls back to chrome.storage.local, then defaults.
 */

import type { IAiConfigRepository, AiConfig } from "@/domain/repositories/IAiConfigRepository.js";
import { DEFAULT_AI_CONFIG } from "@/domain/repositories/IAiConfigRepository.js";
import { SYNC_AI_KEYS } from "@/infrastructure/storage/keys.js";

const AI_KEYS = SYNC_AI_KEYS;

export class ChromeStorageAiConfigRepository implements IAiConfigRepository {
  async getConfig(): Promise<AiConfig> {
    const [syncRes, localRes] = await Promise.all([
      this.getFromStorage("sync"),
      this.getFromStorage("local"),
    ]);

    const provider =
      (typeof syncRes.aiProvider === "string" && syncRes.aiProvider) ||
      (typeof localRes.aiProvider === "string" && localRes.aiProvider) ||
      DEFAULT_AI_CONFIG.aiProvider;

    const rawApiKey =
      syncRes.geminiApiKey ||
      syncRes.aiApiKey ||
      localRes.geminiApiKey ||
      localRes.aiApiKey;
    const apiKey = typeof rawApiKey === "string" ? rawApiKey.trim() : DEFAULT_AI_CONFIG.aiApiKey;

    const rawModel =
      (typeof syncRes.aiModel === "string" && syncRes.aiModel) ||
      (typeof localRes.aiModel === "string" && localRes.aiModel) ||
      DEFAULT_AI_CONFIG.aiModel;
    const model = rawModel.trim() ? rawModel.trim() : DEFAULT_AI_CONFIG.aiModel;

    const rawEndpoint =
      (typeof syncRes.aiEndpoint === "string" && syncRes.aiEndpoint) ||
      (typeof localRes.aiEndpoint === "string" && localRes.aiEndpoint) ||
      DEFAULT_AI_CONFIG.aiEndpoint;
    const endpoint = rawEndpoint.trim() ? rawEndpoint.trim() : DEFAULT_AI_CONFIG.aiEndpoint;

    const showThinking =
      syncRes.aiShowThinking !== undefined
        ? syncRes.aiShowThinking
        : localRes.aiShowThinking !== undefined
          ? localRes.aiShowThinking
          : DEFAULT_AI_CONFIG.aiShowThinking;

    return {
      aiProvider: provider,
      aiApiKey: apiKey,
      aiModel: model,
      aiEndpoint: endpoint,
      aiShowThinking: Boolean(showThinking),
    };
  }

  private getFromStorage(area: "sync" | "local"): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
      const storage = area === "sync" ? chrome.storage.sync : chrome.storage.local;
      storage.get([...AI_KEYS], (res: Record<string, unknown>) => resolve(res));
    });
  }
}

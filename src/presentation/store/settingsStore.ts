/**
 * useSettings store
 * Zustand singleton — global app settings (language, sidebar, notifications, AI config,
 * KPSS goals, detox limits). Persists to chrome.storage.local via settings use cases or
 * direct syncSet where the hook previously used raw local storage.
 * Hook file stays as a facade; consumer components are untouched.
 *
 * NOTE: some settings (AI provider/config, KPSS goals, detox, autoGroupTabs) were
 * persisted directly under flat local keys (aiProvider, geminiApiKey, ...) by the old
 * hook. Those keys are preserved verbatim to keep migration/idempotency safe.
 */

import { create } from "zustand";
import type { Language } from "@/domain/value-objects/Language.js";
import { ChromeStorageSettingsRepository } from "@/infrastructure/persistence/repositories/ChromeStorageSettingsRepository.js";
import { UpdateSettingsUseCase } from "@/application/use-cases/settings/UpdateSettingsUseCase.js";
import { scheduleCloudBackup, runCloudBackup } from "@/utils/cloudBackup.js";

function syncGet<T>(keys: string[]): Promise<Record<string, T>> {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) =>
      resolve(result as Record<string, T>),
    );
  });
}
function syncSet(data: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, () => {
      scheduleCloudBackup();
      resolve();
    });
  });
}

const settingsRepo = new ChromeStorageSettingsRepository();
const settingsUC = new UpdateSettingsUseCase(settingsRepo);

type KpssGoalType = "net" | "score";

interface SettingsState {
  // Base
  lang: Language;
  sidebarOpen: boolean;
  freeGamesNotificationsEnabled: boolean;
  calendarNotificationsEnabled: boolean;
  pomoBlockEnabled: boolean;
  universalInfoBoxEnabled: boolean;
  universalInfoBoxHotkey: string;
  whatsappBridgeEnabled: boolean;
  telegramBridgeEnabled: boolean;
  autoGroupTabsEnabled: boolean;
  // AI
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
  aiShowThinking: boolean;
  // KPSS
  kpssGoalType: KpssGoalType;
  kpssTargetNet: number;
  kpssTargetScore: number;
  // Detox
  detoxLimits: Record<string, number>;

  // Actions
  loadSettings: () => Promise<void>;
  handleToggleLang: () => Promise<void>;
  handleSidebarToggle: () => Promise<void>;
  handleToggleFreeGamesNotifications: () => Promise<void>;
  handleToggleCalendarNotifications: () => Promise<void>;
  handleTogglePomoBlock: () => Promise<void>;
  handleToggleUniversalInfoBox: () => Promise<void>;
  handleUniversalInfoBoxHotkeyChange: (hotkey: string) => Promise<void>;
  handleToggleWhatsappBridge: () => Promise<void>;
  handleToggleTelegramBridge: () => Promise<void>;
  handleToggleAutoGroupTabs: () => Promise<void>;
  handleClearAllData: () => Promise<void>;
  handleUpdateAIConfig: (
    provider: string,
    key: string,
    model: string,
    endpoint?: string,
  ) => Promise<void>;
  handleUpdateAIShowThinking: (val: boolean) => Promise<void>;
  handleKpssGoalTypeChange: (type: KpssGoalType) => Promise<void>;
  handleKpssTargetNetChange: (val: number) => Promise<void>;
  handleKpssTargetScoreChange: (val: number) => Promise<void>;
  handleDetoxLimitsChange: (limits: Record<string, number>) => Promise<void>;

  // Raw setters (for facade parity / non-UC writes)
  setLangState: (v: Language) => void;
  setSidebarOpenState: (v: boolean) => void;
  setFreeGamesNotificationsEnabledState: (v: boolean) => void;
  setCalendarNotificationsEnabledState: (v: boolean) => void;
  setPomoBlockEnabledState: (v: boolean) => void;
  setUniversalInfoBoxEnabledState: (v: boolean) => void;
  setUniversalInfoBoxHotkeyState: (v: string) => void;
  setWhatsappBridgeEnabledState: (v: boolean) => void;
  setTelegramBridgeEnabledState: (v: boolean) => void;
  setAutoGroupTabsEnabledState: (v: boolean) => void;
  setAiProvider: (v: string) => void;
  setAiApiKey: (v: string) => void;
  setAiModel: (v: string) => void;
  setAiEndpoint: (v: string) => void;
  setAiShowThinking: (v: boolean) => void;
  setKpssGoalType: (v: KpssGoalType) => void;
  setKpssTargetNet: (v: number) => void;
  setKpssTargetScore: (v: number) => void;
  setDetoxLimitsState: (v: Record<string, number>) => void;
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  // Base settings
  lang: "tr",
  sidebarOpen: true,
  freeGamesNotificationsEnabled: true,
  calendarNotificationsEnabled: true,
  pomoBlockEnabled: true,
  universalInfoBoxEnabled: true,
  universalInfoBoxHotkey: "none",
  whatsappBridgeEnabled: false,
  telegramBridgeEnabled: false,
  autoGroupTabsEnabled: true,
  // AI settings
  aiProvider: "openrouter",
  aiApiKey: "",
  aiModel: "free",
  aiEndpoint: "http://localhost:20128/v1",
  aiShowThinking: true,
  // KPSS settings
  kpssGoalType: "net",
  kpssTargetNet: 80,
  kpssTargetScore: 80,
  // Detox settings
  detoxLimits: {},

  // --- Actions ---
  loadSettings: async () => {
    const config = await settingsUC.getSettings();
    set({
      lang: config.lang,
      sidebarOpen: config.sidebarOpen,
      freeGamesNotificationsEnabled: config.freeGamesNotificationsEnabled,
      calendarNotificationsEnabled: config.calendarNotificationsEnabled,
      pomoBlockEnabled: config.pomoBlockEnabled,
      universalInfoBoxHotkey: config.universalInfoBoxHotkey,
      whatsappBridgeEnabled: config.whatsappBridgeEnabled,
      telegramBridgeEnabled: config.telegramBridgeEnabled,
    });

    const ai = await syncGet<string>([
      "aiProvider",
      "geminiApiKey",
      "aiModel",
      "aiEndpoint",
      "aiShowThinking",
    ]);
    set({
      aiProvider: ai.aiProvider || "openrouter",
      aiApiKey: ai.geminiApiKey || "",
      aiModel: ai.aiModel || "free",
      aiEndpoint: ai.aiEndpoint || "http://localhost:20128/v1",
      aiShowThinking: (ai.aiShowThinking as unknown as boolean | undefined) !== false,
    });

    const kpss = await syncGet<unknown>([
      "kpssGoalType",
      "kpssTargetNet",
      "kpssTargetScore",
    ]);
    set({
      kpssGoalType: (kpss.kpssGoalType as KpssGoalType) || "net",
      kpssTargetNet: (kpss.kpssTargetNet as number) ?? 80,
      kpssTargetScore: (kpss.kpssTargetScore as number) ?? 80,
    });

    const detox = await syncGet<Record<string, number>>(["detoxLimits"]);
    set({ detoxLimits: detox.detoxLimits || {} });

    const autoGroup = await syncGet<boolean>(["autoGroupTabs"]);
    set({
      autoGroupTabsEnabled: (autoGroup.autoGroupTabs as boolean | undefined) !== false,
    });
  },

  handleToggleLang: async () => {
    const nextLang: Language = get().lang === "tr" ? "en" : "tr";
    set({ lang: nextLang });
    await settingsUC.setLanguage(nextLang);
  },

  handleSidebarToggle: async () => {
    const nextVal = !get().sidebarOpen;
    set({ sidebarOpen: nextVal });
    document.body.classList.toggle("sidebar-open", nextVal);
    await settingsUC.setSidebarOpen(nextVal);
  },

  handleToggleFreeGamesNotifications: async () => {
    const nextVal = await settingsUC.toggleFreeGamesNotifications();
    set({ freeGamesNotificationsEnabled: nextVal });
  },

  handleToggleCalendarNotifications: async () => {
    const nextVal = await settingsUC.toggleCalendarNotifications();
    set({ calendarNotificationsEnabled: nextVal });
  },

  handleTogglePomoBlock: async () => {
    const nextVal = await settingsUC.togglePomoBlock();
    set({ pomoBlockEnabled: nextVal });
  },

  handleToggleUniversalInfoBox: async () => {
    const nextVal = !get().universalInfoBoxEnabled;
    await settingsUC.setUniversalInfoBox(
      nextVal,
      get().universalInfoBoxHotkey,
    );
    set({ universalInfoBoxEnabled: nextVal });
  },

  handleUniversalInfoBoxHotkeyChange: async (hotkey) => {
    await settingsUC.setUniversalInfoBox(get().universalInfoBoxEnabled, hotkey);
    set({ universalInfoBoxHotkey: hotkey });
  },

  handleToggleWhatsappBridge: async () => {
    const nextVal = await settingsUC.toggleWhatsappBridge();
    set({ whatsappBridgeEnabled: nextVal });
  },

  handleToggleTelegramBridge: async () => {
    const nextVal = await settingsUC.toggleTelegramBridge();
    set({ telegramBridgeEnabled: nextVal });
  },

  handleClearAllData: async () => {
    await settingsUC.clearAllData(get().lang as Language);
    // Drive'daki backup da temizlensin — yoksa restore eski veriyi geri getirir.
    // enabled false olduğu için force=true gerekir.
    await runCloudBackup(true);
  },

  handleUpdateAIConfig: async (provider, key, model, endpoint) => {
    const epVal = endpoint || "";
    set({ aiProvider: provider, aiApiKey: key, aiModel: model, aiEndpoint: epVal });
    const payload = {
      aiProvider: provider,
      geminiApiKey: key,
      aiApiKey: key,
      aiModel: model,
      aiEndpoint: epVal,
    };
    await syncSet(payload);
    void chrome.storage.local.set(payload);
  },

  handleUpdateAIShowThinking: async (val) => {
    set({ aiShowThinking: val });
    await syncSet({ aiShowThinking: val });
  },

  handleKpssGoalTypeChange: async (type) => {
    set({ kpssGoalType: type });
    await syncSet({ kpssGoalType: type });
  },

  handleKpssTargetNetChange: async (val) => {
    if (isNaN(val) || val < 0 || val > 120) {
      return;
    }
    set({ kpssTargetNet: val });
    await syncSet({ kpssTargetNet: val });
  },

  handleKpssTargetScoreChange: async (val) => {
    if (isNaN(val) || val < 0 || val > 100) {
      return;
    }
    set({ kpssTargetScore: val });
    await syncSet({ kpssTargetScore: val });
  },

  handleDetoxLimitsChange: async (limits) => {
    set({ detoxLimits: limits });
    await syncSet({ detoxLimits: limits, detox_limits: limits });
  },

  handleToggleAutoGroupTabs: async () => {
    const nextVal = !get().autoGroupTabsEnabled;
    set({ autoGroupTabsEnabled: nextVal });
    await syncSet({ autoGroupTabs: nextVal });
  },

  // --- Raw setters ---
  setLangState: (v) => set({ lang: v }),
  setSidebarOpenState: (v) => set({ sidebarOpen: v }),
  setFreeGamesNotificationsEnabledState: (v) =>
    set({ freeGamesNotificationsEnabled: v }),
  setCalendarNotificationsEnabledState: (v) =>
    set({ calendarNotificationsEnabled: v }),
  setPomoBlockEnabledState: (v) => set({ pomoBlockEnabled: v }),
  setUniversalInfoBoxEnabledState: (v) =>
    set({ universalInfoBoxEnabled: v }),
  setUniversalInfoBoxHotkeyState: (v) => set({ universalInfoBoxHotkey: v }),
  setWhatsappBridgeEnabledState: (v) => set({ whatsappBridgeEnabled: v }),
  setTelegramBridgeEnabledState: (v) => set({ telegramBridgeEnabled: v }),
  setAutoGroupTabsEnabledState: (v) => set({ autoGroupTabsEnabled: v }),
  setAiProvider: (v) => set({ aiProvider: v }),
  setAiApiKey: (v) => set({ aiApiKey: v }),
  setAiModel: (v) => set({ aiModel: v }),
  setAiEndpoint: (v) => set({ aiEndpoint: v }),
  setAiShowThinking: (v) => set({ aiShowThinking: v }),
  setKpssGoalType: (v) => set({ kpssGoalType: v }),
  setKpssTargetNet: (v) => set({ kpssTargetNet: v }),
  setKpssTargetScore: (v) => set({ kpssTargetScore: v }),
  setDetoxLimitsState: (v) => set({ detoxLimits: v }),
}));
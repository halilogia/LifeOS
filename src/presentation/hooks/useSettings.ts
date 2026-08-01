/**
 * useSettings Hook
 * Presentation hook that wraps all settings-related state and use cases.
 * Manages: language, sidebar, notifications, AI config, KPSS goals, detox limits.
 */

import { useState, useCallback } from "preact/hooks";
import type { Language } from "@/domain/value-objects/Language.js";
import { ChromeStorageSettingsRepository } from "@/infrastructure/persistence/repositories/ChromeStorageSettingsRepository.js";
import { UpdateSettingsUseCase } from "@/application/use-cases/settings/UpdateSettingsUseCase.js";

// Helper for simple chrome.storage.sync get/set
function syncGet<T>(keys: string[]): Promise<Record<string, T>> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(keys, (result) =>
      resolve(result as Record<string, T>),
    );
  });
}
function syncSet(data: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) => chrome.storage.sync.set(data, resolve));
}

export function useSettings() {
  // --- Base settings ---
  const [lang, setLangState] = useState<Language>("tr");
  const [sidebarOpen, setSidebarOpenState] = useState(true);
  const [freeGamesNotificationsEnabled, setFreeGamesNotificationsEnabledState] =
    useState(true);
  const [calendarNotificationsEnabled, setCalendarNotificationsEnabledState] =
    useState(true);
  const [pomoBlockEnabled, setPomoBlockEnabledState] = useState(true);
  const [universalInfoBoxEnabled, setUniversalInfoBoxEnabledState] =
    useState(true);
  const [universalInfoBoxHotkey, setUniversalInfoBoxHotkeyState] =
    useState("none");
  const [autoGroupTabsEnabled, setAutoGroupTabsEnabledState] = useState(true);

  // --- AI settings ---
  const [aiProvider, setAiProvider] = useState<string>("openrouter");
  const [aiApiKey, setAiApiKey] = useState<string>("");
  const [aiModel, setAiModel] = useState<string>("free");
  const [aiEndpoint, setAiEndpoint] = useState<string>(
    "http://localhost:20128/v1",
  );
  const [aiShowThinking, setAiShowThinking] = useState<boolean>(true);

  // --- KPSS settings ---
  const [kpssGoalType, setKpssGoalType] = useState<"net" | "score">("net");
  const [kpssTargetNet, setKpssTargetNet] = useState<number>(80);
  const [kpssTargetScore, setKpssTargetScore] = useState<number>(80);

  // --- Detox settings ---
  const [detoxLimits, setDetoxLimitsState] = useState<Record<string, number>>(
    {},
  );

  const settingsRepo = new ChromeStorageSettingsRepository();
  const settingsUC = new UpdateSettingsUseCase(settingsRepo);

  // --- Load all settings from storage ---
  const loadSettings = useCallback(async () => {
    const config = await settingsUC.getSettings();
    setLangState(config.lang);
    setSidebarOpenState(config.sidebarOpen);
    setFreeGamesNotificationsEnabledState(config.freeGamesNotificationsEnabled);
    setCalendarNotificationsEnabledState(config.calendarNotificationsEnabled);
    setPomoBlockEnabledState(config.pomoBlockEnabled);
    setUniversalInfoBoxHotkeyState(config.universalInfoBoxHotkey);

    // AI settings
    const ai = await syncGet<string>([
      "aiProvider",
      "geminiApiKey",
      "aiModel",
      "aiEndpoint",
      "aiShowThinking",
    ]);
    setAiProvider((ai.aiProvider as string) || "openrouter");
    setAiApiKey((ai.geminiApiKey as string) || "");
    setAiModel((ai.aiModel as string) || "free");
    setAiEndpoint((ai.aiEndpoint as string) || "http://localhost:20128/v1");
    setAiShowThinking(
      (ai.aiShowThinking as unknown as boolean | undefined) !== false,
    );

    // KPSS settings
    const kpss = await syncGet<unknown>([
      "kpssGoalType",
      "kpssTargetNet",
      "kpssTargetScore",
    ]);
    setKpssGoalType((kpss.kpssGoalType as "net" | "score") || "net");
    setKpssTargetNet((kpss.kpssTargetNet as number) ?? 80);
    setKpssTargetScore((kpss.kpssTargetScore as number) ?? 80);

    // Detox settings
    const detox = await syncGet<Record<string, number>>(["detoxLimits"]);
    setDetoxLimitsState((detox.detoxLimits as Record<string, number>) || {});

    // Auto Tab Grouping settings
    const autoGroup = await syncGet<boolean>(["autoGroupTabs"]);
    setAutoGroupTabsEnabledState(
      (autoGroup.autoGroupTabs as boolean | undefined) !== false,
    );
  }, []);

  // --- Base setting handlers ---
  const handleToggleLang = useCallback(async () => {
    const nextLang: Language = lang === "tr" ? "en" : "tr";
    setLangState(nextLang);
    await settingsUC.setLanguage(nextLang);
  }, [lang]);

  const handleSidebarToggle = useCallback(async () => {
    const nextVal = !sidebarOpen;
    setSidebarOpenState(nextVal);
    document.body.classList.toggle("sidebar-open", nextVal);
    await settingsUC.setSidebarOpen(nextVal);
  }, [sidebarOpen]);

  const handleToggleFreeGamesNotifications = useCallback(async () => {
    const nextVal = await settingsUC.toggleFreeGamesNotifications();
    setFreeGamesNotificationsEnabledState(nextVal);
  }, []);

  const handleToggleCalendarNotifications = useCallback(async () => {
    const nextVal = await settingsUC.toggleCalendarNotifications();
    setCalendarNotificationsEnabledState(nextVal);
  }, []);

  const handleTogglePomoBlock = useCallback(async () => {
    const nextVal = await settingsUC.togglePomoBlock();
    setPomoBlockEnabledState(nextVal);
  }, []);

  const handleToggleUniversalInfoBox = useCallback(async () => {
    const nextVal = !universalInfoBoxEnabled;
    await settingsUC.setUniversalInfoBox(nextVal, universalInfoBoxHotkey);
    setUniversalInfoBoxEnabledState(nextVal);
  }, [universalInfoBoxEnabled, universalInfoBoxHotkey]);

  const handleUniversalInfoBoxHotkeyChange = useCallback(
    async (hotkey: string) => {
      await settingsUC.setUniversalInfoBox(universalInfoBoxEnabled, hotkey);
      setUniversalInfoBoxHotkeyState(hotkey);
    },
    [universalInfoBoxEnabled],
  );

  const handleClearAllData = useCallback(async () => {
    await settingsUC.clearAllData(lang);
  }, [lang]);

  // --- AI setting handlers ---
  const handleUpdateAIConfig = useCallback(
    async (provider: string, key: string, model: string, endpoint?: string) => {
      const epVal = endpoint || "";
      setAiProvider(provider);
      setAiApiKey(key);
      setAiModel(model);
      setAiEndpoint(epVal);
      await syncSet({
        aiProvider: provider,
        geminiApiKey: key,
        aiApiKey: key,
        aiModel: model,
        aiEndpoint: epVal,
      });
      chrome.storage.local.set({
        aiProvider: provider,
        geminiApiKey: key,
        aiApiKey: key,
        aiModel: model,
        aiEndpoint: epVal,
      });
    },
    [],
  );

  const handleUpdateAIShowThinking = useCallback(async (val: boolean) => {
    setAiShowThinking(val);
    await syncSet({ aiShowThinking: val });
  }, []);

  // --- KPSS setting handlers ---
  const handleKpssGoalTypeChange = useCallback(
    async (type: "net" | "score") => {
      setKpssGoalType(type);
      await syncSet({ kpssGoalType: type });
    },
    [],
  );

  const handleKpssTargetNetChange = useCallback(async (val: number) => {
    if (isNaN(val) || val < 0 || val > 120) {
      return;
    }
    setKpssTargetNet(val);
    await syncSet({ kpssTargetNet: val });
  }, []);

  const handleKpssTargetScoreChange = useCallback(async (val: number) => {
    if (isNaN(val) || val < 0 || val > 100) {
      return;
    }
    setKpssTargetScore(val);
    await syncSet({ kpssTargetScore: val });
  }, []);

  // --- Detox setting handlers ---
  const handleDetoxLimitsChange = useCallback(
    async (limits: Record<string, number>) => {
      setDetoxLimitsState(limits);
      await syncSet({ detoxLimits: limits, detox_limits: limits });
    },
    [],
  );

  const handleToggleAutoGroupTabs = useCallback(async () => {
    const nextVal = !autoGroupTabsEnabled;
    setAutoGroupTabsEnabledState(nextVal);
    await syncSet({ autoGroupTabs: nextVal });
  }, [autoGroupTabsEnabled]);

  return {
    // State
    lang,
    setLangState,
    sidebarOpen,
    setSidebarOpenState,
    freeGamesNotificationsEnabled,
    calendarNotificationsEnabled,
    pomoBlockEnabled,
    universalInfoBoxEnabled,
    universalInfoBoxHotkey,
    autoGroupTabsEnabled,
    aiProvider,
    aiApiKey,
    aiModel,
    aiEndpoint,
    aiShowThinking,
    kpssGoalType,
    kpssTargetNet,
    kpssTargetScore,
    detoxLimits,
    // Actions
    loadSettings,
    handleToggleLang,
    handleSidebarToggle,
    handleToggleFreeGamesNotifications,
    handleToggleCalendarNotifications,
    handleTogglePomoBlock,
    handleToggleUniversalInfoBox,
    handleUniversalInfoBoxHotkeyChange,
    handleToggleAutoGroupTabs,
    handleClearAllData,
    handleUpdateAIConfig,
    handleUpdateAIShowThinking,
    handleKpssGoalTypeChange,
    handleKpssTargetNetChange,
    handleKpssTargetScoreChange,
    handleDetoxLimitsChange,
  };
}

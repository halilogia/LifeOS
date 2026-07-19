/**
 * useSettings Hook
 * Presentation hook that wraps all settings-related state and use cases.
 * Currently wraps the existing App.tsx settings logic for future migration.
 */

import { useState, useCallback } from "preact/hooks";
import type { Language } from "../../domain/value-objects/Language.js";
import { ChromeStorageSettingsRepository } from "../../infrastructure/persistence/ChromeStorageSettingsRepository.js";
import { UpdateSettingsUseCase } from "../../application/use-cases/settings/UpdateSettingsUseCase.js";

export function useSettings() {
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

    const settingsRepo = new ChromeStorageSettingsRepository();
    const settingsUC = new UpdateSettingsUseCase(settingsRepo);

    const loadSettings = useCallback(async () => {
        const config = await settingsUC.getSettings();
        setLangState(config.lang);
        setSidebarOpenState(config.sidebarOpen);
        setFreeGamesNotificationsEnabledState(
            config.freeGamesNotificationsEnabled,
        );
        setCalendarNotificationsEnabledState(
            config.calendarNotificationsEnabled,
        );
        setPomoBlockEnabledState(config.pomoBlockEnabled);
        setUniversalInfoBoxEnabledState(config.universalInfoBoxEnabled);
        setUniversalInfoBoxHotkeyState(config.universalInfoBoxHotkey);
    }, []);

    const handleToggleLang = useCallback(async () => {
        const nextLang: Language = lang === "tr" ? "en" : "tr";
        setLangState(nextLang);
        await settingsUC.setLanguage(nextLang);
    }, [lang]);

    const handleSidebarToggle = useCallback(async () => {
        const nextVal = !sidebarOpen;
        setSidebarOpenState(nextVal);
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
            await settingsUC.setUniversalInfoBox(
                universalInfoBoxEnabled,
                hotkey,
            );
            setUniversalInfoBoxHotkeyState(hotkey);
        },
        [universalInfoBoxEnabled],
    );

    const handleClearAllData = useCallback(async () => {
        await settingsUC.clearAllData(lang);
    }, [lang]);

    return {
        lang,
        setLangState,
        sidebarOpen,
        setSidebarOpenState,
        freeGamesNotificationsEnabled,
        calendarNotificationsEnabled,
        pomoBlockEnabled,
        universalInfoBoxEnabled,
        universalInfoBoxHotkey,
        loadSettings,
        handleToggleLang,
        handleSidebarToggle,
        handleToggleFreeGamesNotifications,
        handleToggleCalendarNotifications,
        handleTogglePomoBlock,
        handleToggleUniversalInfoBox,
        handleUniversalInfoBoxHotkeyChange,
        handleClearAllData,
    };
}
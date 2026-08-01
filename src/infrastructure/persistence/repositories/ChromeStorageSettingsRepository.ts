/**
 * ChromeStorageSettingsRepository
 * Infrastructure implementation of ISettingsRepository using chrome.storage.sync
 * directly (not wrapping legacy storage.ts).
 */

import type { ISettingsRepository } from "@/domain/repositories/ISettingsRepository.js";
import type { Language } from "@/domain/value-objects/Language.js";
import {
  SYNC_SETTINGS_KEYS,
  SYNC_SIDEBAR_ORDER,
  SYNC_LANG,
  SYNC_SIDEBAR_OPEN,
  SYNC_FREE_GAMES_NOTIFICATIONS,
  SYNC_CALENDAR_NOTIFICATIONS,
  SYNC_POMO_BLOCK_ENABLED,
  SYNC_UNIVERSAL_INFOBOX_ENABLED,
  SYNC_UNIVERSAL_INFOBOX_HOTKEY,
  SYNC_WHATSAPP_BRIDGE_ENABLED,
  SYNC_TELEGRAM_BRIDGE_ENABLED,
} from "@/infrastructure/storage/keys.js";

export class ChromeStorageSettingsRepository implements ISettingsRepository {
  async getSettings(): Promise<{
    lang: Language;
    sidebarOpen: boolean;
    freeGamesNotificationsEnabled: boolean;
    calendarNotificationsEnabled: boolean;
    pomoBlockEnabled: boolean;
    universalInfoBoxEnabled: boolean;
    universalInfoBoxHotkey: string;
    whatsappBridgeEnabled: boolean;
    telegramBridgeEnabled: boolean;
  }> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(
        [...SYNC_SETTINGS_KEYS],
        (result: Record<string, any>) => {
          resolve({
            lang: (result[SYNC_LANG] as Language) || "tr",
            sidebarOpen: result[SYNC_SIDEBAR_OPEN] ?? true,
            freeGamesNotificationsEnabled:
              result[SYNC_FREE_GAMES_NOTIFICATIONS] ?? true,
            calendarNotificationsEnabled:
              result[SYNC_CALENDAR_NOTIFICATIONS] ?? true,
            pomoBlockEnabled: result[SYNC_POMO_BLOCK_ENABLED] ?? true,
            universalInfoBoxEnabled:
              result[SYNC_UNIVERSAL_INFOBOX_ENABLED] ?? true,
            universalInfoBoxHotkey:
              result[SYNC_UNIVERSAL_INFOBOX_HOTKEY] || "none",
            whatsappBridgeEnabled:
              result[SYNC_WHATSAPP_BRIDGE_ENABLED] ?? false,
            telegramBridgeEnabled:
              result[SYNC_TELEGRAM_BRIDGE_ENABLED] ?? false,
          });
        },
      );
    });
  }

  async getSidebarOrder(): Promise<string[]> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([SYNC_SIDEBAR_ORDER], (result) => {
        resolve((result[SYNC_SIDEBAR_ORDER] as string[]) || []);
      });
    });
  }

  async setSidebarOrder(order: string[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [SYNC_SIDEBAR_ORDER]: order }, resolve);
    });
  }

  async setLang(lang: Language): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ lang }, resolve);
    });
  }

  async setSidebarOpen(isOpen: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [SYNC_SIDEBAR_OPEN]: isOpen }, resolve);
    });
  }

  async setFreeGamesNotificationsEnabled(enabled: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set(
        { [SYNC_FREE_GAMES_NOTIFICATIONS]: enabled },
        resolve,
      );
    });
  }

  async setCalendarNotificationsEnabled(enabled: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set(
        { [SYNC_CALENDAR_NOTIFICATIONS]: enabled },
        resolve,
      );
    });
  }

  async setPomoBlockEnabled(enabled: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [SYNC_POMO_BLOCK_ENABLED]: enabled }, resolve);
    });
  }

  async setUniversalInfoBox(enabled: boolean, hotkey: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set(
        {
          [SYNC_UNIVERSAL_INFOBOX_ENABLED]: enabled,
          [SYNC_UNIVERSAL_INFOBOX_HOTKEY]: hotkey,
        },
        resolve,
      );
    });
  }

  async setWhatsappBridgeEnabled(enabled: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set(
        { [SYNC_WHATSAPP_BRIDGE_ENABLED]: enabled },
        resolve,
      );
    });
  }

  async setTelegramBridgeEnabled(enabled: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set(
        { [SYNC_TELEGRAM_BRIDGE_ENABLED]: enabled },
        resolve,
      );
    });
  }

  async clearAll(lang: Language): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.clear(() => {
        chrome.storage.sync.set({ lang }, resolve);
      });
    });
  }
}

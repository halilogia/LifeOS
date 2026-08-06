/**
 * ChromeStorageSettingsRepository
 * Infrastructure implementation of ISettingsRepository using chrome.storage.local
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
      chrome.storage.local.get(
        [...SYNC_SETTINGS_KEYS],
        (result: Record<string, unknown>) => {
          const r = result;
          resolve({
            lang: (r[SYNC_LANG] as Language) || "tr",
            sidebarOpen: (r[SYNC_SIDEBAR_OPEN] as boolean) ?? true,
            freeGamesNotificationsEnabled:
              (r[SYNC_FREE_GAMES_NOTIFICATIONS] as boolean) ?? true,
            calendarNotificationsEnabled:
              (r[SYNC_CALENDAR_NOTIFICATIONS] as boolean) ?? true,
            pomoBlockEnabled: (r[SYNC_POMO_BLOCK_ENABLED] as boolean) ?? true,
            universalInfoBoxEnabled:
              (r[SYNC_UNIVERSAL_INFOBOX_ENABLED] as boolean) ?? true,
            universalInfoBoxHotkey:
              (r[SYNC_UNIVERSAL_INFOBOX_HOTKEY] as string) || "none",
            whatsappBridgeEnabled:
              (r[SYNC_WHATSAPP_BRIDGE_ENABLED] as boolean) ?? false,
            telegramBridgeEnabled:
              (r[SYNC_TELEGRAM_BRIDGE_ENABLED] as boolean) ?? false,
          });
        },
      );
    });
  }

  async getSidebarOrder(): Promise<string[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([SYNC_SIDEBAR_ORDER], (result) => {
        resolve((result[SYNC_SIDEBAR_ORDER] as string[]) || []);
      });
    });
  }

  async setSidebarOrder(order: string[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [SYNC_SIDEBAR_ORDER]: order }, resolve);
    });
  }

  async setLang(lang: Language): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ lang }, resolve);
    });
  }

  async setSidebarOpen(isOpen: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [SYNC_SIDEBAR_OPEN]: isOpen }, resolve);
    });
  }

  async setFreeGamesNotificationsEnabled(enabled: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set(
        { [SYNC_FREE_GAMES_NOTIFICATIONS]: enabled },
        resolve,
      );
    });
  }

  async setCalendarNotificationsEnabled(enabled: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set(
        { [SYNC_CALENDAR_NOTIFICATIONS]: enabled },
        resolve,
      );
    });
  }

  async setPomoBlockEnabled(enabled: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [SYNC_POMO_BLOCK_ENABLED]: enabled }, resolve);
    });
  }

  async setUniversalInfoBox(enabled: boolean, hotkey: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set(
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
      chrome.storage.local.set(
        { [SYNC_WHATSAPP_BRIDGE_ENABLED]: enabled },
        resolve,
      );
    });
  }

  async setTelegramBridgeEnabled(enabled: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set(
        { [SYNC_TELEGRAM_BRIDGE_ENABLED]: enabled },
        resolve,
      );
    });
  }

  async clearAll(lang: Language): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        chrome.storage.local.set({ lang }, resolve);
      });
    });
  }
}

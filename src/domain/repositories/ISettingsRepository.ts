/**
 * ISettingsRepository Interface
 * Repository pattern for application settings persistence.
 * Domain layer - no external dependencies, pure interface.
 */

import type { Language } from "@/domain/value-objects/Language.js";

export interface AppSettings {
  readonly lang: Language;
  readonly sidebarOpen: boolean;
  readonly freeGamesNotificationsEnabled: boolean;
  readonly calendarNotificationsEnabled: boolean;
  readonly pomoBlockEnabled: boolean;
  readonly universalInfoBoxEnabled: boolean;
  readonly universalInfoBoxHotkey: string;
  readonly whatsappBridgeEnabled: boolean;
  readonly telegramBridgeEnabled: boolean;
}

export interface ISettingsRepository {
  getSettings(): Promise<AppSettings>;
  getSidebarOrder(): Promise<string[]>;
  setLang(lang: Language): Promise<void>;
  setSidebarOpen(isOpen: boolean): Promise<void>;
  setSidebarOrder(order: string[]): Promise<void>;
  setFreeGamesNotificationsEnabled(enabled: boolean): Promise<void>;
  setCalendarNotificationsEnabled(enabled: boolean): Promise<void>;
  setPomoBlockEnabled(enabled: boolean): Promise<void>;
  setUniversalInfoBox(enabled: boolean, hotkey: string): Promise<void>;
  setWhatsappBridgeEnabled(enabled: boolean): Promise<void>;
  setTelegramBridgeEnabled(enabled: boolean): Promise<void>;
  clearAll(lang: Language): Promise<void>;
}

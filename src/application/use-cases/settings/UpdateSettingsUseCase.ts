/**
 * UpdateSettingsUseCase
 * Application use case for updating application settings.
 * Handles all setting changes (language, sidebar, notifications, AI, KPSS, detox, etc.).
 */

import type {
  ISettingsRepository,
  AppSettings,
} from "@/domain/repositories/ISettingsRepository.js";
import type { Language } from "@/domain/value-objects/Language.js";

export class UpdateSettingsUseCase {
  constructor(private settingsRepo: ISettingsRepository) {}

  async getSettings(): Promise<AppSettings> {
    return this.settingsRepo.getSettings();
  }

  async setLanguage(lang: Language): Promise<void> {
    await this.settingsRepo.setLang(lang);
  }

  async setSidebarOpen(isOpen: boolean): Promise<void> {
    await this.settingsRepo.setSidebarOpen(isOpen);
  }

  async toggleFreeGamesNotifications(): Promise<boolean> {
    const settings = await this.settingsRepo.getSettings();
    const nextVal = !settings.freeGamesNotificationsEnabled;
    await this.settingsRepo.setFreeGamesNotificationsEnabled(nextVal);
    return nextVal;
  }

  async toggleCalendarNotifications(): Promise<boolean> {
    const settings = await this.settingsRepo.getSettings();
    const nextVal = !settings.calendarNotificationsEnabled;
    await this.settingsRepo.setCalendarNotificationsEnabled(nextVal);
    return nextVal;
  }

  async togglePomoBlock(): Promise<boolean> {
    const settings = await this.settingsRepo.getSettings();
    const nextVal = !settings.pomoBlockEnabled;
    await this.settingsRepo.setPomoBlockEnabled(nextVal);
    return nextVal;
  }

  async setUniversalInfoBox(enabled: boolean, hotkey: string): Promise<void> {
    await this.settingsRepo.setUniversalInfoBox(enabled, hotkey);
  }

  async toggleWhatsappBridge(): Promise<boolean> {
    const settings = await this.settingsRepo.getSettings();
    const nextVal = !settings.whatsappBridgeEnabled;
    await this.settingsRepo.setWhatsappBridgeEnabled(nextVal);
    return nextVal;
  }

  async toggleTelegramBridge(): Promise<boolean> {
    const settings = await this.settingsRepo.getSettings();
    const nextVal = !settings.telegramBridgeEnabled;
    await this.settingsRepo.setTelegramBridgeEnabled(nextVal);
    return nextVal;
  }

  async clearAllData(lang: Language): Promise<void> {
    await this.settingsRepo.clearAll(lang);
  }
}

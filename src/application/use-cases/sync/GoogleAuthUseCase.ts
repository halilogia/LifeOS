/**
 * GoogleAuthUseCase
 * Application use case for Google OAuth authentication.
 * Handles login, logout, and user info retrieval.
 */

import type { ISyncRepository } from "../../../domain/repositories/ISyncRepository.js";
import type { ITodoSyncPort } from "../../ports/ITodoSyncPort.js";
import type { GoogleSyncSettings } from "../../../domain/repositories/ISyncRepository.js";

export interface GoogleAuthResponse {
  readonly success: boolean;
  readonly email?: string;
  readonly error?: string;
}

export class GoogleAuthUseCase {
  constructor(
    private syncRepo: ISyncRepository,
    private syncPort: ITodoSyncPort,
  ) {}

  async login(): Promise<GoogleAuthResponse> {
    try {
      const token = await this.syncPort.getAuthToken(true);
      const info = await this.syncPort.getUserEmail(token);

      const nextSettings: GoogleSyncSettings = {
        enabled: true,
        tasksEnabled: true,
        calendarEnabled: true,
        userEmail: info,
      };

      await this.syncRepo.setSyncSettings(nextSettings);

      return { success: true, email: info };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error("Google sign in failed:", e);
      return { success: false, error: errMsg };
    }
  }

  async logout(): Promise<void> {
    try {
      const token = await this.syncPort.getAuthToken(false);
      await this.syncPort.removeCachedAuthToken(token);
    } catch (e) {
      console.warn("Cached token remove skipped:", e);
    }

    const nextSettings: GoogleSyncSettings = {
      enabled: false,
      tasksEnabled: false,
      calendarEnabled: false,
      userEmail: "",
    };

    await this.syncRepo.setSyncSettings(nextSettings);
  }

  async getUserEmail(): Promise<string | undefined> {
    const settings = await this.syncRepo.getSyncSettings();
    return settings.userEmail;
  }
}

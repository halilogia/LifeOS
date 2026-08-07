/**
 * SyncGoogleCalendarUseCase
 *
 * Application use case for fetching Google Calendar events for a given month.
 * Orchestrates the sync settings check (domain repository) with the
 * Google Calendar API (via ICalendarSyncPort).
 */

import type { ISyncRepository } from "@/domain/repositories/ISyncRepository.js";
import type {
  ICalendarSyncPort,
  RemoteCalendarEvent,
} from "@/application/ports/ICalendarSyncPort.js";
import { logger } from "@/utils/logger.js";

export interface CalendarSyncResult {
  events: RemoteCalendarEvent[];
}

export class SyncGoogleCalendarUseCase {
  constructor(
    private syncRepository: ISyncRepository,
    private calendarPort: ICalendarSyncPort,
  ) {}

  async execute(year: number, month: number): Promise<CalendarSyncResult> {
    const settings = await this.syncRepository.getSyncSettings();
    if (!settings.enabled || !settings.calendarEnabled) {
      return { events: [] };
    }
    try {
      const token = await this.calendarPort.getAuthToken(false);
      const startStr = new Date(year, month, 1, 0, 0, 0).toISOString();
      const endStr = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      const events = await this.calendarPort.getCalendarEvents(
        token,
        startStr,
        endStr,
      );
      return { events };
    } catch (e) {
      logger.error("[CalendarView] Google Calendar fetching error:", e);
      return { events: [] };
    }
  }
}

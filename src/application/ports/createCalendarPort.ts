/**
 * createCalendarPort.ts
 * Factory function for creating an ICalendarSyncPort adapter.
 * This is a composition root concern — creates the bridge between
 * application ports and infrastructure implementations.
 */

import type { ICalendarSyncPort } from "@/application/ports/ICalendarSyncPort.js";
import { GoogleAuthApi } from "@/infrastructure/api/GoogleAuthApi.js";
import { GoogleCalendarApi } from "@/infrastructure/api/GoogleCalendarApi.js";

/**
 * Creates an ICalendarSyncPort instance backed by GoogleAuthApi and GoogleCalendarApi.
 * Called once in the composition root and injected into use cases.
 */
export function createCalendarPort(): ICalendarSyncPort {
  const authApi = new GoogleAuthApi();
  const calendarApi = new GoogleCalendarApi();

  return {
    getAuthToken: (interactive) => authApi.getAuthToken(interactive),
    getCalendarEvents: (token, start, end) =>
      calendarApi.getCalendarEvents(token, start, end),
  };
}

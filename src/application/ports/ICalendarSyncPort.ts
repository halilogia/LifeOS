/**
 * ICalendarSyncPort Interface
 * Port for fetching Google Calendar events.
 * Application layer - defines the boundary between application and infrastructure.
 */

export interface RemoteCalendarEvent {
  readonly id?: string;
  readonly summary?: string;
  readonly description?: string;
  readonly start?: { dateTime?: string; date?: string };
  readonly end?: { dateTime?: string; date?: string };
}

export interface ICalendarSyncPort {
  getAuthToken(interactive: boolean): Promise<string>;
  getCalendarEvents(
    token: string,
    start: string,
    end: string,
  ): Promise<RemoteCalendarEvent[]>;
}

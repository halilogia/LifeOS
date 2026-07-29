/**
 * GoogleCalendarApi
 * Infrastructure adapter for Google Calendar REST API.
 */

export interface GoogleCalendarEvent {
  id?: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  [key: string]: unknown;
}

export class GoogleCalendarApi {
  async getCalendarEvents(
    token: string,
    startStr: string,
    endStr: string,
  ): Promise<GoogleCalendarEvent[]> {
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(startStr)}&timeMax=${encodeURIComponent(endStr)}&singleEvents=true&orderBy=startTime`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error(`Calendar fetch failed: ${res.statusText}`);
    }
    const data = await res.json();
    return data.items || [];
  }

  async createCalendarEvent(token: string, event: GoogleCalendarEvent): Promise<GoogleCalendarEvent> {
    const url =
      "https://www.googleapis.com/calendar/v3/calendars/primary/events";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      throw new Error(`Calendar event creation failed: ${res.statusText}`);
    }
    return await res.json();
  }
}

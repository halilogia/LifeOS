/**
 * Google Sync Service
 * Interacts with Google OAuth and REST APIs for Tasks, Calendar, and Drive AppData.
 */

export interface GoogleUserInfo {
  email: string;
}

export const googleSyncService = {
  /**
   * Fetch OAuth2 access token from Chrome Identity API.
   */
  getAuthToken(interactive: boolean = false): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof chrome === "undefined" || !chrome.identity) {
        return reject(new Error("Chrome Identity API is not available."));
      }
      chrome.identity.getAuthToken({ interactive }, (result) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }
        if (!result) {
          return reject(new Error("Failed to retrieve token."));
        }
        const token = typeof result === "string" ? result : (result as any).token;
        if (!token) {
          return reject(new Error("No token returned in auth result."));
        }
        resolve(token);
      });
    });
  },

  /**
   * Clear cached OAuth2 token (useful for logout or when token expires).
   */
  removeCachedAuthToken(token: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.identity) {
        chrome.identity.removeCachedAuthToken({ token }, () => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  },

  /**
   * Retrieve user info using token.
   */
  async getUserInfo(token: string): Promise<GoogleUserInfo> {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch Google user info.");
    }
    return response.json();
  },

  // ==========================================
  // GOOGLE TASKS API
  // ==========================================

  /**
   * Find a TaskList ID by title, or create it if not exists.
   */
  async getOrCreateTaskList(token: string, title: string): Promise<string> {
    const listsResponse = await fetch(
      "https://www.googleapis.com/tasks/v1/users/@me/lists",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!listsResponse.ok) {
      throw new Error(`Failed to fetch task lists: ${listsResponse.statusText}`);
    }
    const data = await listsResponse.json();
    const existingList = data.items?.find((list: any) => list.title === title);

    if (existingList) {
      return existingList.id;
    }

    // Create the task list
    const createResponse = await fetch(
      "https://www.googleapis.com/tasks/v1/users/@me/lists",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      },
    );
    if (!createResponse.ok) {
      throw new Error(
        `Failed to create task list "${title}": ${createResponse.statusText}`,
      );
    }
    const newList = await createResponse.json();
    return newList.id;
  },

  /**
   * Fetch all tasks from a specific TaskList.
   */
  async getTasks(token: string, taskListId: string): Promise<any[]> {
    const url = `https://www.googleapis.com/tasks/v1/lists/${taskListId}/tasks?showCompleted=true&showHidden=true&maxResults=100`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }
    const data = await response.json();
    return data.items || [];
  },

  /**
   * Create a new task in a TaskList.
   */
  async createTask(
    token: string,
    taskListId: string,
    task: { title: string; notes?: string; status?: "needsAction" | "completed"; due?: string | null },
  ): Promise<any> {
    const url = `https://www.googleapis.com/tasks/v1/lists/${taskListId}/tasks`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Update a task in a TaskList (e.g. toggle completion or edit title/notes).
   */
  async updateTask(
    token: string,
    taskListId: string,
    taskId: string,
    task: { title?: string; notes?: string; status?: "needsAction" | "completed"; completed?: string | null; due?: string | null },
  ): Promise<any> {
    const url = `https://www.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Delete a task from a TaskList.
   */
  async deleteTask(
    token: string,
    taskListId: string,
    taskId: string,
  ): Promise<void> {
    const url = `https://www.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.statusText}`);
    }
  },

  // ==========================================
  // GOOGLE CALENDAR API
  // ==========================================

  /**
   * Get calendar events for a specific month time range from primary calendar.
   */
  async getCalendarEvents(
    token: string,
    timeMin: string, // ISO Date string
    timeMax: string, // ISO Date string
  ): Promise<any[]> {
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
      timeMin,
    )}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=250`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch calendar events: ${response.statusText}`);
    }
    const data = await response.json();
    return data.items || [];
  },

  /**
   * Create a calendar event in the primary calendar.
   */
  async createCalendarEvent(
    token: string,
    event: {
      summary: string;
      description?: string;
      start: { dateTime?: string; date?: string; timeZone?: string };
      end: { dateTime?: string; date?: string; timeZone?: string };
    },
  ): Promise<any> {
    const url = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });
    if (!response.ok) {
      throw new Error(`Failed to create calendar event: ${response.statusText}`);
    }
    return response.json();
  },

  // ==========================================
  // GOOGLE DRIVE (APPDATA) BACKUP & RESTORE
  // ==========================================

  /**
   * Backup all settings and statistics to the user's Google Drive appDataFolder.
   */
  async backupToDrive(token: string, backupData: any): Promise<boolean> {
    try {
      const fileName = "zentodo_lifeos_backup.json";

      // 1. Search if backup file already exists
      const searchUrl = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${fileName}'&fields=files(id)`;
      const searchRes = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!searchRes.ok) {
        throw new Error(`Backup search failed: ${searchRes.statusText}`);
      }
      const searchResult = await searchRes.json();
      const existingFile = searchResult.files?.[0];

      let fileId = existingFile?.id;

      if (!fileId) {
        // 2a. Create metadata-only file if it doesn't exist
        const createUrl = "https://www.googleapis.com/drive/v3/files";
        const createRes = await fetch(createUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: fileName,
            parents: ["appDataFolder"],
          }),
        });
        if (!createRes.ok) {
          throw new Error(`Failed to initialize backup file on Drive: ${createRes.statusText}`);
        }
        const createdFile = await createRes.json();
        fileId = createdFile.id;
      }

      // 3. Upload content using upload endpoint
      const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
      const uploadRes = await fetch(uploadUrl, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backupData),
      });

      if (!uploadRes.ok) {
        throw new Error(`Failed to upload backup contents: ${uploadRes.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("Backup to Google Drive failed:", error);
      throw error;
    }
  },

  /**
   * Retrieve and restore settings and statistics from Google Drive.
   */
  async restoreFromDrive(token: string): Promise<any | null> {
    try {
      const fileName = "zentodo_lifeos_backup.json";

      // 1. Search for backup file
      const searchUrl = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${fileName}'&fields=files(id)`;
      const searchRes = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!searchRes.ok) {
        throw new Error(`Backup search failed: ${searchRes.statusText}`);
      }
      const searchResult = await searchRes.json();
      const existingFile = searchResult.files?.[0];

      if (!existingFile) {
        return null;
      }

      // 2. Download content
      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`;
      const downloadRes = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!downloadRes.ok) {
        throw new Error(`Failed to download backup: ${downloadRes.statusText}`);
      }

      const backupData = await downloadRes.json();
      return backupData;
    } catch (error) {
      console.error("Restore from Google Drive failed:", error);
      throw error;
    }
  },
};

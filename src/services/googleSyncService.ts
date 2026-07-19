/**
 * googleSyncService - Legacy Bridge
 * 
 * BU DOSYA GEÇİCİDİR (Legacy Bridge).
 * Amacı: Mevcut App.tsx ve CalendarView.tsx'in bozulmadan çalışmaya devam etmesini sağlamak.
 * 
 * Kullanımı:
 *   import { googleSyncService } from "./services/googleSyncService.js";
 *   const token = await googleSyncService.getAuthToken(false);
 * 
 * Migration plan:
 *   1. App.tsx → useSync hook'una taşınacak (presentation/hooks/useSync.ts zaten var)
 *   2. CalendarView.tsx → CalendarApi infrastructure sınıfı kullanılacak
 *   3. Bu dosya silinecek
 * 
 * Infrastructure katmanındaki gerçek implementasyonlar:
 *   - src/infrastructure/api/GoogleAuthApi.ts
 *   - src/infrastructure/api/GoogleTasksApi.ts
 *   - src/infrastructure/api/GoogleDriveApi.ts
 */

import { GoogleAuthApi } from "../infrastructure/api/GoogleAuthApi.js";
import { GoogleTasksApi } from "../infrastructure/api/GoogleTasksApi.js";
import { GoogleDriveApi } from "../infrastructure/api/GoogleDriveApi.js";

const authApi = new GoogleAuthApi();
const tasksApi = new GoogleTasksApi();
const driveApi = new GoogleDriveApi();

export const googleSyncService = {
    // --- Auth ---
    getAuthToken: (interactive: boolean) => authApi.getAuthToken(interactive),
    getUserInfo: async (token: string) => {
        const email = await authApi.getUserEmail(token);
        return { email };
    },
    removeCachedAuthToken: (token: string) => authApi.removeCachedAuthToken(token),

    // --- Tasks ---
    getOrCreateTaskList: (token: string, title: string) =>
        tasksApi.getOrCreateTaskList(token, title),
    getTasks: (token: string, taskListId: string) =>
        tasksApi.getTasks(token, taskListId),
    createTask: (token: string, taskListId: string, task: any) =>
        tasksApi.createTask(token, taskListId, task),
    updateTask: (token: string, taskListId: string, taskId: string, task: any) =>
        tasksApi.updateTask(token, taskListId, taskId, task),
    deleteTask: (token: string, taskListId: string, taskId: string) =>
        tasksApi.deleteTask(token, taskListId, taskId),

    // --- Drive ---
    backupToDrive: (token: string, backupData: Record<string, unknown>) =>
        driveApi.backupToDrive(token, backupData),
    restoreFromDrive: async (token: string) => {
        const result = await driveApi.restoreFromDrive(token);
        return result as any; // Legacy bridge: App.tsx accesses .todos, .notes etc.
    },

    // --- Calendar (legacy, not yet migrated) ---
    getCalendarEvents: async (token: string, startStr: string, endStr: string) => {
        console.warn("getCalendarEvents is not yet migrated to new infrastructure");
        const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(startStr)}&timeMax=${encodeURIComponent(endStr)}&singleEvents=true&orderBy=startTime`;
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Calendar fetch failed: ${res.statusText}`);
        const data = await res.json();
        return data.items || [];
    },

    createCalendarEvent: async (token: string, event: any) => {
        console.warn("createCalendarEvent is not yet migrated to new infrastructure");
        const url = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
        const res = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(event),
        });
        if (!res.ok) throw new Error(`Calendar event creation failed: ${res.statusText}`);
        return await res.json();
    },
};
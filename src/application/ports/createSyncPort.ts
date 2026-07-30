/**
 * createSyncPort.ts
 * Factory function for creating an ITodoSyncPort adapter.
 * This is a composition root concern — creates the bridge between
 * application ports and infrastructure implementations.
 */

import type { ITodoSyncPort } from "@/application/ports/ITodoSyncPort.js";
import { GoogleAuthApi } from "@/infrastructure/api/GoogleAuthApi.js";
import { GoogleTasksApi } from "@/infrastructure/api/GoogleTasksApi.js";

/**
 * Creates an ITodoSyncPort instance backed by GoogleAuthApi and GoogleTasksApi.
 * Called once in the composition root (App.tsx) and passed down to hooks/use-cases.
 */
export function createSyncPort(): ITodoSyncPort {
    const authApi = new GoogleAuthApi();
    const tasksApi = new GoogleTasksApi();

    return {
        getAuthToken: (interactive) => authApi.getAuthToken(interactive),
        getUserEmail: (token) => authApi.getUserEmail(token),
        getOrCreateTaskList: (token, title) =>
            tasksApi.getOrCreateTaskList(token, title),
        getTasks: (token, taskListId) => tasksApi.getTasks(token, taskListId),
        createTask: (token, taskListId, task) =>
            tasksApi.createTask(token, taskListId, task),
        updateTask: (token, taskListId, taskId, task) =>
            tasksApi.updateTask(token, taskListId, taskId, task),
        deleteTask: (token, taskListId, taskId) =>
            tasksApi.deleteTask(token, taskListId, taskId),
        removeCachedAuthToken: (token) => authApi.removeCachedAuthToken(token),
    };
}
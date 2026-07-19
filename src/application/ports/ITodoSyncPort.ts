/**
 * ITodoSyncPort Interface
 * Port for synchronizing todos with an external service (e.g. Google Tasks).
 * Application layer - defines the boundary between application and infrastructure.
 */

import type { RepeatType } from "../../domain/value-objects/RepeatType.js";

export interface RemoteTask {
    readonly id: string;
    readonly title: string;
    readonly status: "needsAction" | "completed";
    readonly notes?: string;
    readonly due?: string;
    readonly completed?: string;
}

export interface ITodoSyncPort {
    getAuthToken(interactive: boolean): Promise<string>;
    getUserEmail(token: string): Promise<string>;
    getOrCreateTaskList(token: string, title: string): Promise<string>;
    getTasks(token: string, taskListId: string): Promise<RemoteTask[]>;
    createTask(
        token: string,
        taskListId: string,
        task: {
            title: string;
            notes?: string;
            status?: "needsAction" | "completed";
            due?: string | null;
        },
    ): Promise<{ id: string }>;
    updateTask(
        token: string,
        taskListId: string,
        taskId: string,
        task: {
            status?: "needsAction" | "completed";
            completed?: string | null;
        },
    ): Promise<void>;
    deleteTask(token: string, taskListId: string, taskId: string): Promise<void>;
    removeCachedAuthToken(token: string): Promise<void>;
}
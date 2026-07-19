/**
 * GoogleTasksApi
 * Infrastructure implementation of Google Tasks API operations.
 * Wraps the existing googleSyncService for task CRUD operations.
 * Implements the ITodoSyncPort interface partially (task operations).
 */

import { googleSyncService } from "../../services/googleSyncService.js";
import type { ITodoSyncPort, RemoteTask } from "../../application/ports/ITodoSyncPort.js";

export class GoogleTasksApi implements Pick<ITodoSyncPort, "getOrCreateTaskList" | "getTasks" | "createTask" | "updateTask" | "deleteTask"> {
    async getOrCreateTaskList(token: string, title: string): Promise<string> {
        return googleSyncService.getOrCreateTaskList(token, title);
    }

    async getTasks(token: string, taskListId: string): Promise<RemoteTask[]> {
        return googleSyncService.getTasks(token, taskListId);
    }

    async createTask(
        token: string,
        taskListId: string,
        task: {
            title: string;
            notes?: string;
            status?: "needsAction" | "completed";
            due?: string | null;
        },
    ): Promise<{ id: string }> {
        return googleSyncService.createTask(token, taskListId, task);
    }

    async updateTask(
        token: string,
        taskListId: string,
        taskId: string,
        task: {
            status?: "needsAction" | "completed";
            completed?: string | null;
        },
    ): Promise<void> {
        await googleSyncService.updateTask(token, taskListId, taskId, task);
    }

    async deleteTask(token: string, taskListId: string, taskId: string): Promise<void> {
        await googleSyncService.deleteTask(token, taskListId, taskId);
    }
}
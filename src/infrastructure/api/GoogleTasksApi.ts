/**
 * GoogleTasksApi
 * Infrastructure implementation of Google Tasks API operations.
 * Directly uses Google Tasks REST API v1.
 * Implements the ITodoSyncPort interface partially (task operations).
 */

import type {
  ITodoSyncPort,
  RemoteTask,
} from "../../application/ports/ITodoSyncPort.js";

export class GoogleTasksApi implements Pick<
  ITodoSyncPort,
  | "getOrCreateTaskList"
  | "getTasks"
  | "createTask"
  | "updateTask"
  | "deleteTask"
> {
  async getOrCreateTaskList(token: string, title: string): Promise<string> {
    const listsResponse = await fetch(
      "https://www.googleapis.com/tasks/v1/users/@me/lists",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!listsResponse.ok) {
      throw new Error(
        `Failed to fetch task lists: ${listsResponse.statusText}`,
      );
    }
    const data = await listsResponse.json();
    const existingList = (
      data.items as Array<{ id: string; title: string }> | undefined
    )?.find((list) => list.title === title);

    if (existingList) {
      return existingList.id;
    }

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
  }

  async getTasks(token: string, taskListId: string): Promise<RemoteTask[]> {
    const url = `https://www.googleapis.com/tasks/v1/lists/${taskListId}/tasks?showCompleted=true&showHidden=true&maxResults=100`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }
    const data = await response.json();
    return data.items || [];
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
  }

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
  }
}

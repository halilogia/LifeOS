/**
 * SyncGoogleTasksUseCase
 *
 * Application use case for synchronizing local todos with Google Tasks.
 * Orchestrates the domain layer (Todo entity) with infrastructure (Google Tasks API).
 */

import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { ISyncRepository } from "@/domain/repositories/ISyncRepository.js";
import type {
  ITodoSyncPort,
  RemoteTask,
} from "@/application/ports/ITodoSyncPort.js";
import { parseRepeatFromNotes } from "@/domain/services/TaskService.js";
import type { Todo } from "@/domain/entities/Todo.js";
import { logger } from "@/utils/logger.js";

export interface SyncResult {
  todos: Todo[];
  error?: string;
}

export class SyncGoogleTasksUseCase {
  constructor(
    private todoRepository: ITodoRepository,
    private syncRepository: ISyncRepository,
    private syncPort: ITodoSyncPort,
  ) {}

  async execute(): Promise<SyncResult> {
    const syncSettings = await this.syncRepository.getSyncSettings();
    if (!syncSettings.enabled || !syncSettings.tasksEnabled) {
      return { todos: await this.todoRepository.getAll() };
    }

    try {
      const token = await this.syncPort.getAuthToken(false);

      const focusListId = await this.syncPort.getOrCreateTaskList(
        token,
        "Life OS - Focus",
      );
      const routinesListId = await this.syncPort.getOrCreateTaskList(
        token,
        "Life OS - Routines",
      );

      const [remoteFocusTasks, remoteRoutinesTasks, localTodos] =
        await Promise.all([
          this.syncPort.getTasks(token, focusListId),
          this.syncPort.getTasks(token, routinesListId),
          this.todoRepository.getAll(),
        ]);

      const mappedFocus: Todo[] = remoteFocusTasks.map((t: RemoteTask) => {
        const status: "done" | "todo" =
          t.status === "completed" ? "done" : "todo";
        return {
          id: t.id,
          text: t.title,
          completed: t.status === "completed",
          status,
          repeat: "none" as const,
          category: "general",
          lastCompletedDate: t.completed || null,
          dueDate: t.due ? t.due.split("T")[0] : undefined,
        };
      });

      const mappedRoutines: Todo[] = remoteRoutinesTasks.map(
        (t: RemoteTask) => {
          const repeat = parseRepeatFromNotes(t.notes);
          const status: "done" | "todo" =
            t.status === "completed" ? "done" : "todo";
          return {
            id: t.id,
            text: t.title,
            completed: t.status === "completed",
            status,
            repeat: repeat === "none" ? "daily" : repeat,
            category: "general",
            lastCompletedDate: t.completed || null,
            dueDate: t.due ? t.due.split("T")[0] : undefined,
          };
        },
      );

      const mergedTodos = [...mappedFocus, ...mappedRoutines];
      const mergedById = new Map(mergedTodos.map((t) => [t.id, t]));

      // Upload unsynced local tasks (no remote id yet)
      const unSyncedLocal = localTodos.filter((t) => !t.id);
      for (const localTodo of unSyncedLocal) {
        const isRoutine = localTodo.repeat !== "none";
        const listId = isRoutine ? routinesListId : focusListId;
        const notes = `[repeat:${localTodo.repeat}]`;
        try {
          const createdRemote = await this.syncPort.createTask(token, listId, {
            title: localTodo.text,
            notes,
            status: localTodo.completed ? "completed" : "needsAction",
            due: localTodo.dueDate
              ? `${localTodo.dueDate}T00:00:00.000Z`
              : undefined,
          });
          localTodo.id = createdRemote.id;
          mergedById.set(localTodo.id, localTodo);
        } catch (err) {
          logger.error("Failed to upload offline task:", err);
        }
      }

      // Push status/due changes for todos that already have a remote id.
      // Without this, completing a todo on PC-A never reaches Google Tasks,
      // and the next sync on PC-B would resurrect it as "open".
      const remoteById = new Map(mergedTodos.map((t) => [t.id, t]));
      for (const localTodo of localTodos) {
        if (!localTodo.id) {
          continue;
        }
        const remote = remoteById.get(localTodo.id);
        if (!remote) {
          continue; // remote task was deleted — keep local copy
        }
        const localDone = localTodo.completed;
        const remoteDone = remote.completed;
        if (localDone !== remoteDone) {
          const isRoutine = localTodo.repeat !== "none";
          const listId = isRoutine ? routinesListId : focusListId;
          try {
            await this.syncPort.updateTask(token, listId, localTodo.id, {
              status: localDone ? "completed" : "needsAction",
              completed: localDone ? new Date().toISOString() : null,
            });
            // Reflect pushed state in merged result
            const merged = mergedById.get(localTodo.id);
            if (merged) {
              merged.completed = localDone;
              merged.status = localDone ? "done" : "todo";
              merged.lastCompletedDate = localDone
                ? new Date().toISOString()
                : null;
            }
          } catch (err) {
            logger.error("Failed to push task update:", err);
          }
        }
      }

      const finalTodos = Array.from(mergedById.values());
      await this.todoRepository.saveAll(finalTodos);
      return { todos: finalTodos };
    } catch (err) {
      logger.warn("SyncGoogleTasksUseCase failed:", err);
      const localTodos = await this.todoRepository.getAll();
      return { todos: localTodos, error: String(err) };
    }
  }
}

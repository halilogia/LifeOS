/**
 * useTodos - Todo CRUD operations hook
 *
 * Orchestrates todo state through application-layer use cases instead of
 * calling infrastructure APIs directly. Every mutation flows through:
 *   useTodos → UseCase → Domain Entity + Repository (+ optional sync)
 *
 * The hook only manages local state and side effects (cloud backup triggers);
 * all business logic and external sync lives in the use cases / domain layer.
 *
 * Dependencies (repository, syncPort) are injected from the composition root
 * (App.tsx) — the hook never instantiates infrastructure directly.
 */

import { useState, useCallback } from "preact/hooks";
import type { Todo } from "@/domain/entities/Todo.js";
import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { ITodoSyncPort } from "@/application/ports/ITodoSyncPort.js";
import type { ISyncRepository } from "@/domain/repositories/ISyncRepository.js";
import { AddTodoUseCase } from "@/application/use-cases/todo/AddTodoUseCase.js";
import { ToggleTodoUseCase } from "@/application/use-cases/todo/ToggleTodoUseCase.js";
import { DeleteTodoUseCase } from "@/application/use-cases/todo/DeleteTodoUseCase.js";
import { MoveTaskUseCase } from "@/application/use-cases/todo/MoveTaskUseCase.js";
import { UpdatePrioritiesUseCase } from "@/application/use-cases/todo/UpdatePrioritiesUseCase.js";
import { ResetRepeatingTodosUseCase } from "@/application/use-cases/todo/ResetRepeatingTodosUseCase.js";
import { logger } from "@/utils/logger.js";

export function useTodos(
  todoRepository: ITodoRepository,
  syncPort: ITodoSyncPort,
  syncRepo: ISyncRepository,
  triggerCloudBackup: () => Promise<void>,
  showAlert?: (message: string, onConfirm?: () => void) => void,
  t?: Record<string, string>,
) {
  const [todos, setTodos] = useState<Todo[]>([]);

  // ---- use cases (created once per hook mount) ----
  const resetUC = new ResetRepeatingTodosUseCase(todoRepository);
  const addUC = new AddTodoUseCase(todoRepository, syncRepo, syncPort);
  const toggleUC = new ToggleTodoUseCase(todoRepository, syncRepo, syncPort);
  const deleteUC = new DeleteTodoUseCase(todoRepository, syncRepo, syncPort);
  const moveUC = new MoveTaskUseCase(todoRepository, syncRepo, syncPort);
  const updatePriorityUC = new UpdatePrioritiesUseCase(todoRepository);

  // ---- refresh local state from storage ----
  const refreshTodos = useCallback(async () => {
    const loaded = await todoRepository.getAll();
    setTodos(loaded);
    return loaded;
  }, [todoRepository]);

  // --- Initialize: load + run repeating-task reset -----
  const initTodos = useCallback(async () => {
    const { todos: resetTodos } = await resetUC.execute();
    setTodos(resetTodos as Todo[]);
    return resetTodos as Todo[];
  }, []);

  // --- Add Todo ---
  const handleAddTodo = useCallback(
    async (text: string, repeat: Todo["repeat"], dueDate?: string) => {
      await addUC.execute({ text, repeat, dueDate });
      await refreshTodos();
      await triggerCloudBackup();
    },
    [refreshTodos, triggerCloudBackup],
  );

  // --- Toggle Todo ---
  const handleToggleTodo = useCallback(
    async (index: number) => {
      await toggleUC.execute({ index });
      await refreshTodos();
      await triggerCloudBackup();
    },
    [refreshTodos, triggerCloudBackup],
  );

  // --- Delete Todo ---
  const handleDeleteTodo = useCallback(
    async (index: number) => {
      await deleteUC.execute({ index });
      await refreshTodos();
      await triggerCloudBackup();
    },
    [refreshTodos, triggerCloudBackup],
  );

  // --- Move Task Status ---
  const handleMoveTaskStatus = useCallback(
    async (index: number, newStatus: Todo["status"]) => {
      await moveUC.moveToStatus({ index, newStatus });
      await refreshTodos();
      await triggerCloudBackup();
    },
    [refreshTodos, triggerCloudBackup],
  );

  // --- Move Task Direction ---
  const handleMoveTaskDirection = useCallback(
    async (index: number, direction: 1 | -1) => {
      await moveUC.moveByDirection({ index, direction });
      await refreshTodos();
      await triggerCloudBackup();
    },
    [refreshTodos, triggerCloudBackup],
  );

  // --- Update Urgent/Important (Eisenhower) ---
  const handleUpdateTodoUrgentImportant = useCallback(
    async (originalIndex: number, urgent: boolean, important: boolean) => {
      await updatePriorityUC.execute({ originalIndex, urgent, important });
      await refreshTodos();
      await triggerCloudBackup();
    },
    [refreshTodos, triggerCloudBackup],
  );

  // --- Export Backup (UI-only, no use case needed) ---
  const handleExportBackup = useCallback(async () => {
    const dataList = await todoRepository.getAll();
    const blob = new Blob([JSON.stringify(dataList, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zentodo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [todoRepository]);

  // --- Import Backup (UI-only, uses showAlert/t for error messages) ---
  const handleImportBackup = useCallback(
    (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (!input.files || input.files.length === 0) {
        return;
      }

      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          if (Array.isArray(parsed)) {
            await todoRepository.saveAll(parsed);
            setTodos(parsed);
            if (showAlert && t?.alert_restore_success) {
              showAlert(t.alert_restore_success);
            }
          } else if (showAlert && t?.alert_restore_invalid) {
            showAlert(t.alert_restore_invalid);
          }
        } catch (err) {
          logger.error(err);
          const errMsg = err instanceof Error ? err.message : String(err);
          const detailLabel = t?.sync_detail_label || "Detail";
          if (showAlert) {
            showAlert(
              `${t?.alert_restore_error || "Restore failed"}\n\n[${detailLabel}]: ${errMsg}`,
            );
          }
        }
        input.value = "";
      };
      reader.readAsText(input.files[0]);
    },
    [showAlert, t, todoRepository],
  );

  return {
    todos,
    setTodos,
    initTodos,
    handleAddTodo,
    handleToggleTodo,
    handleDeleteTodo,
    handleMoveTaskStatus,
    handleMoveTaskDirection,
    handleUpdateTodoUrgentImportant,
    handleExportBackup,
    handleImportBackup,
  };
}
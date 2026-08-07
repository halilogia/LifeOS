/**
 * useTodos — facade over the Zustand singleton store.
 * The store instantiates its own DI deps (singleton); the injected args below are
 * ignored for parity of the old call signature — same chrome.storage is used.
 */

import { useTodosStore } from "@/presentation/store/todosStore.js";

export function useTodos(
  _todoRepository?: unknown,
  _syncPort?: unknown,
  _syncRepo?: unknown,
  _triggerCloudBackup?: unknown,
  _showAlert?: unknown,
  _t?: unknown,
) {
  const s = useTodosStore;
  return {
    todos: s((st) => st.todos),
    setTodos: s((st) => st.setTodos),
    initTodos: s((st) => st.initTodos),
    handleAddTodo: s((st) => st.handleAddTodo),
    handleToggleTodo: s((st) => st.handleToggleTodo),
    handleDeleteTodo: s((st) => st.handleDeleteTodo),
    handleMoveTaskStatus: s((st) => st.handleMoveTaskStatus),
    handleMoveTaskDirection: s((st) => st.handleMoveTaskDirection),
    handleUpdateTodoUrgentImportant: s((st) => st.handleUpdateTodoUrgentImportant),
    handleExportBackup: s((st) => st.handleExportBackup),
    handleImportBackup: s((st) => st.handleImportBackup),
  };
}
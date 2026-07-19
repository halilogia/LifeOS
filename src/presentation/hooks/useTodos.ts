/**
 * useTodos Hook
 * Presentation hook that wraps todo-related state and use cases.
 * Currently wraps the existing App.tsx todo logic for future migration.
 */

import { useState, useCallback } from "preact/hooks";
import type { Todo } from "../../domain/entities/Todo.js";
import type { RepeatType } from "../../domain/value-objects/RepeatType.js";
import type { TodoStatus } from "../../domain/value-objects/TodoStatus.js";
import { ChromeStorageTodoRepository } from "../../infrastructure/persistence/ChromeStorageTodoRepository.js";
import { ChromeStorageSyncRepository } from "../../infrastructure/persistence/ChromeStorageSyncRepository.js";
import { GoogleTasksApi } from "../../infrastructure/api/GoogleTasksApi.js";
import { GoogleAuthApi } from "../../infrastructure/api/GoogleAuthApi.js";
import { AddTodoUseCase } from "../../application/use-cases/todo/AddTodoUseCase.js";
import { ToggleTodoUseCase } from "../../application/use-cases/todo/ToggleTodoUseCase.js";
import { DeleteTodoUseCase } from "../../application/use-cases/todo/DeleteTodoUseCase.js";
import { MoveTaskUseCase } from "../../application/use-cases/todo/MoveTaskUseCase.js";
import { UpdatePrioritiesUseCase } from "../../application/use-cases/todo/UpdatePrioritiesUseCase.js";

function createSyncPort() {
    const tasksApi = new GoogleTasksApi();
    const authApi = new GoogleAuthApi();
    return {
        getAuthToken: (interactive: boolean) => authApi.getAuthToken(interactive),
        getUserEmail: (token: string) => authApi.getUserEmail(token),
        getOrCreateTaskList: (token: string, title: string) =>
            tasksApi.getOrCreateTaskList(token, title),
        getTasks: (token: string, taskListId: string) =>
            tasksApi.getTasks(token, taskListId),
        createTask: (
            token: string,
            taskListId: string,
            task: { title: string; notes?: string; status?: "needsAction" | "completed"; due?: string | null },
        ) => tasksApi.createTask(token, taskListId, task),
        updateTask: (
            token: string,
            taskListId: string,
            taskId: string,
            task: { status?: "needsAction" | "completed"; completed?: string | null },
        ) => tasksApi.updateTask(token, taskListId, taskId, task),
        deleteTask: (token: string, taskListId: string, taskId: string) =>
            tasksApi.deleteTask(token, taskListId, taskId),
        removeCachedAuthToken: (token: string) =>
            authApi.removeCachedAuthToken(token),
    };
}

export function useTodos(initialTodos: Todo[] = []) {
    const [todos, setTodos] = useState<Todo[]>(initialTodos);

    const todoRepo = new ChromeStorageTodoRepository();
    const syncRepo = new ChromeStorageSyncRepository();
    const syncPort = createSyncPort();

    const addTodoUC = new AddTodoUseCase(todoRepo, syncRepo, syncPort);
    const toggleTodoUC = new ToggleTodoUseCase(todoRepo, syncRepo, syncPort);
    const deleteTodoUC = new DeleteTodoUseCase(todoRepo, syncRepo, syncPort);
    const moveTaskUC = new MoveTaskUseCase(todoRepo, syncRepo, syncPort);
    const updatePrioritiesUC = new UpdatePrioritiesUseCase(todoRepo);

    const addTodo = useCallback(
        async (text: string, repeat: RepeatType, dueDate?: string) => {
            await addTodoUC.execute({ text, repeat, dueDate });
            const loaded = await todoRepo.getAll();
            setTodos(loaded);
        },
        [],
    );

    const toggleTodo = useCallback(async (index: number) => {
        const result = await toggleTodoUC.execute({ index });
        setTodos([...result.todos]);
    }, []);

    const deleteTodo = useCallback(async (index: number) => {
        const result = await deleteTodoUC.execute({ index });
        setTodos([...result.todos]);
    }, []);

    const moveTaskStatus = useCallback(
        async (index: number, newStatus: TodoStatus) => {
            const result = await moveTaskUC.moveToStatus({ index, newStatus });
            setTodos([...result.todos]);
        },
        [],
    );

    const moveTaskDirection = useCallback(
        async (index: number, direction: 1 | -1) => {
            const result = await moveTaskUC.moveByDirection({
                index,
                direction,
            });
            setTodos([...result.todos]);
        },
        [],
    );

    const updatePriorities = useCallback(
        async (originalIndex: number, urgent: boolean, important: boolean) => {
            const result = await updatePrioritiesUC.execute({
                originalIndex,
                urgent,
                important,
            });
            setTodos([...result.todos]);
        },
        [],
    );

    const setTodosFromStorage = useCallback(async () => {
        const loaded = await todoRepo.getAll();
        setTodos(loaded);
    }, []);

    return {
        todos,
        setTodos,
        addTodo,
        toggleTodo,
        deleteTodo,
        moveTaskStatus,
        moveTaskDirection,
        updatePriorities,
        setTodosFromStorage,
    };
}
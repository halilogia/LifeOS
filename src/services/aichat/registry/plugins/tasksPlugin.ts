/**
 * tasksPlugin.ts
 * AI Tasks & Todo Management Plugin.
 * Clean Architecture - AI Service Layer.
 */

import type { AiFeaturePlugin } from "../types.js";
import type { Todo } from "@/domain/entities/Todo.js";
import { logger } from "@/utils/logger.js";

export const tasksPlugin: AiFeaturePlugin = {
  id: "tasks",
  name: "Görev & Yapılacaklar Listesi",
  description: "Creates, batch schedules, and monitors pending user tasks and deadlines.",

  getContextSnapshot: async (ctx) => {
    try {
      const todos = await ctx.todoRepo.getAll();
      const pending = todos.filter((t) => !t.completed && t.status !== "done");

      if (pending.length === 0) {
        return "[Yapılacaklar / Görevler] Bekleyen görev yok (hepsi tamamlandı!).";
      }

      const list = pending
        .slice(0, 6)
        .map((t) => {
          const due = t.dueDate ? ` [Tarih: ${t.dueDate}]` : "";
          return `  • [ ] ${t.text}${due}`;
        })
        .join("\n");

      return `[Yapılacaklar / Görevler (Bekleyen ${pending.length} Görev)]\n${list}`;
    } catch (err) {
      logger.warn("[tasksPlugin] Error building snapshot:", err);
      return null;
    }
  },

  actions: [
    {
      name: "create_task",
      description: "Creates a new task or to-do item for the user.",
      parametersExample: {
        text: "Akşam makale tahlilini tamamla",
        repeat: "none",
        dueDate: "2026-09-25",
        category: "study",
      },
      execute: async (params, ctx) => {
        const text = String(params.text ?? "").trim();
        if (!text) {
          return { success: false, message: "Görev metni boş olamaz." };
        }

        const todos = await ctx.todoRepo.getAll();
        const newTodo: Todo = {
          id: `task-${Date.now()}`,
          text,
          completed: false,
          repeat: String(params.repeat ?? "none") as Todo["repeat"],
          dueDate: String(params.dueDate ?? ""),
          status: "todo",
          category: String(params.category ?? "general"),
          lastCompletedDate: null,
        };

        todos.unshift(newTodo);
        await ctx.todoRepo.saveAll(todos);
        if (ctx.onManualSync) {
          await ctx.onManualSync();
        }

        logger.info(`[tasksPlugin] Created task: "${newTodo.text}"`);
        return {
          success: true,
          message: `Görev eklendi: "${newTodo.text}"`,
          data: { todoId: newTodo.id },
        };
      },
    },
    {
      name: "batch_create_tasks",
      description: "Batch creates multiple tasks (e.g. from study plans, schedules, or curriculum milestones).",
      parametersExample: {
        tasks: [
          { text: "1984 1. Bölüm Notları", dueDate: "2026-09-25" },
          { text: "Yeni Konuş Tahlili", dueDate: "2026-09-26" },
        ],
      },
      execute: async (params, ctx) => {
        if (!Array.isArray(params.tasks) || params.tasks.length === 0) {
          return { success: false, message: "Görev listesi boş." };
        }

        const rawTasks = params.tasks as Array<Record<string, unknown>>;
        const todos = await ctx.todoRepo.getAll();
        const now = Date.now();
        const newTodos: Todo[] = [];
        let addedCount = 0;

        for (let i = 0; i < rawTasks.length; i++) {
          const task = rawTasks[i];
          const text = String(task.text ?? "").trim();
          if (text) {
            newTodos.push({
              id: `task-${now}-${i}`,
              text,
              completed: false,
              repeat: String(task.repeat ?? "none") as Todo["repeat"],
              dueDate: String(task.dueDate ?? ""),
              status: "todo",
              category: String(task.category ?? "general"),
              lastCompletedDate: null,
            });
            addedCount++;
          }
        }

        todos.unshift(...newTodos);

        await ctx.todoRepo.saveAll(todos);
        if (ctx.onManualSync) {
          await ctx.onManualSync();
        }

        logger.info(`[tasksPlugin] Batch created ${addedCount} tasks`);
        return {
          success: true,
          message: `${addedCount} adet görev başarıyla oluşturuldu.`,
          data: { count: addedCount },
        };
      },
    },
  ],
};

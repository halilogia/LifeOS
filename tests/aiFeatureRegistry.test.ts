import { describe, it, expect, beforeEach } from "vitest";
import {
  aiFeatureRegistry,
  registerAiFeature,
  initDefaultAiPlugins,
  type AiFeaturePlugin,
  type AiActionExecutionContext,
} from "@/services/aichat/registry/index.js";
import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { INoteRepository, Note } from "@/domain/repositories/INoteRepository.js";
import type { IMemoryRepository } from "@/domain/repositories/IMemoryRepository.js";
import type { IMediaRepository } from "@/domain/repositories/IMediaRepository.js";
import type { Todo } from "@/domain/entities/Todo.js";
import type { MediaItem } from "@/types/media.js";

class MockTodoRepo implements ITodoRepository {
  public todos: Todo[] = [];
  async getAll(): Promise<Todo[]> {
    return [...this.todos];
  }
  async saveAll(todos: Todo[]): Promise<void> {
    this.todos = [...todos];
  }
  async getById(id: string): Promise<Todo | undefined> {
    return this.todos.find((t) => t.id === id);
  }
}

class MockNoteRepo implements INoteRepository {
  public notes: Note[] = [];
  async getAll(): Promise<Note[]> {
    return [...this.notes];
  }
  async saveAll(notes: Note[]): Promise<void> {
    this.notes = [...notes];
  }
}

class MockMemoryRepo implements IMemoryRepository {
  public memory: string = "";
  async getMemory(): Promise<string> {
    return this.memory;
  }
  async setMemory(mem: string): Promise<void> {
    this.memory = mem;
  }
}

class MockMediaRepo implements IMediaRepository {
  public items: MediaItem[] = [];
  async getItems(): Promise<MediaItem[]> {
    return [...this.items];
  }
  async saveItems(items: MediaItem[]): Promise<void> {
    this.items = [...items];
  }
  async getItemById(id: string): Promise<MediaItem | null> {
    return this.items.find((i) => i.id === id) || null;
  }
  async saveItem(item: MediaItem): Promise<void> {
    const idx = this.items.findIndex((i) => i.id === item.id);
    if (idx >= 0) this.items[idx] = item;
    else this.items.unshift(item);
  }
  async deleteItem(id: string): Promise<void> {
    this.items = this.items.filter((i) => i.id !== id);
  }
}

describe("Extensible AI Feature Registry & Multi-Page Bridge", () => {
  let todoRepo: MockTodoRepo;
  let noteRepo: MockNoteRepo;
  let memoryRepo: MockMemoryRepo;
  let mediaRepo: MockMediaRepo;
  let execCtx: AiActionExecutionContext;

  beforeEach(() => {
    aiFeatureRegistry.clear();
    initDefaultAiPlugins();

    todoRepo = new MockTodoRepo();
    noteRepo = new MockNoteRepo();
    memoryRepo = new MockMemoryRepo();
    mediaRepo = new MockMediaRepo();

    execCtx = {
      lang: "tr",
      todoRepo,
      noteRepo,
      memoryRepo,
      mediaRepo,
    };
  });

  it("registers all default LifeOS plugins successfully", () => {
    const plugins = aiFeatureRegistry.getAllPlugins();
    const ids = plugins.map((p) => p.id);

    expect(ids).toContain("navigation");
    expect(ids).toContain("tasks");
    expect(ids).toContain("media_vault");
    expect(ids).toContain("pomodoro");
    expect(ids).toContain("routines");
    expect(ids).toContain("bist");
    expect(ids).toContain("prayer");
    expect(ids).toContain("kpss");
    expect(ids).toContain("notes");
    expect(ids).toContain("memory");
  });

  it("dynamically generates capabilities prompt containing all plugin actions", () => {
    const prompt = aiFeatureRegistry.generateCapabilitiesPrompt();

    expect(prompt).toContain("CAPABILITIES & ACTIONS:");
    expect(prompt).toContain("navigate_view");
    expect(prompt).toContain("control_pomodoro");
    expect(prompt).toContain("add_media");
    expect(prompt).toContain("batch_add_media");
    expect(prompt).toContain("create_task");
    expect(prompt).toContain("batch_create_tasks");
    expect(prompt).toContain("add_stock_watchlist");
    expect(prompt).toContain("log_kpss_study");
    expect(prompt).toContain("set_prayer_city");
    expect(prompt).toContain("toggle_routine");
    expect(prompt).toContain("clarification");
  });

  it("gathers live context snapshots in parallel across all modules", async () => {
    todoRepo.todos = [
      {
        id: "1",
        text: "Kitap Oku",
        completed: false,
        repeat: "daily",
        dueDate: "2026-09-22",
        status: "todo",
        category: "study",
        lastCompletedDate: null,
      },
    ];

    mediaRepo.items = [
      {
        id: "m1",
        type: "book",
        title: "1984",
        status: "in_progress",
        rating: 9,
        favorite: true,
        bookProgress: { currentPage: 80, totalPages: 350, quotes: [] },
        createdAt: "",
        updatedAt: "",
      },
    ];

    const snapshot = await aiFeatureRegistry.gatherAllContextSnapshots(execCtx);

    expect(snapshot).toContain("CANLI KULLANICI & DASHBOARD SİSTEM BAĞLAMI");
    expect(snapshot).toContain("Kitap Oku");
    expect(snapshot).toContain("1984");
    expect(snapshot).toContain("Alışkanlık Zinciri / Rutinler");
  });

  it("executes toggle_routine action and checks off habit", async () => {
    todoRepo.todos = [
      {
        id: "r1",
        text: "Sabah Yürüyüşü",
        completed: false,
        repeat: "daily",
        dueDate: "",
        status: "todo",
        category: "health",
        lastCompletedDate: null,
      },
    ];

    const result = await aiFeatureRegistry.executeAction(
      "toggle_routine",
      { routine_text: "Yürüyüş", completed: true },
      execCtx,
    );

    expect(result.success).toBe(true);
    expect(todoRepo.todos[0].completed).toBe(true);
    expect(todoRepo.todos[0].lastCompletedDate).toBeDefined();
  });

  it("executes navigate_view action cleanly", async () => {
    const result = await aiFeatureRegistry.executeAction(
      "navigate_view",
      { view: "pomodoro" },
      execCtx,
    );

    // In Node test environment window may be mocked or undefined, should return handled result
    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });

  it("allows any new future module to self-register and automatically integrate with AI", async () => {
    const dummyFuturePlugin: AiFeaturePlugin = {
      id: "smart_garden",
      name: "Akıllı Bahçe & Çiçek Bakımı",
      description: "Monitors houseplant moisture and watering schedules.",
      getContextSnapshot: async () => {
        return "[Akıllı Bahçe] 3 saksı çiçeği var. Orkide bugün sulanmalı.";
      },
      actions: [
        {
          name: "water_plant",
          description: "Marks a plant as watered today.",
          parametersExample: { plantName: "Orkide" },
          execute: async (params) => {
            return {
              success: true,
              message: `${params.plantName} sulandı!`,
            };
          },
        },
      ],
    };

    registerAiFeature(dummyFuturePlugin);

    // 1. Appears in capabilities prompt
    const prompt = aiFeatureRegistry.generateCapabilitiesPrompt();
    expect(prompt).toContain("water_plant");
    expect(prompt).toContain("Orkide");

    // 2. Contributes to live context
    const snapshot = await aiFeatureRegistry.gatherAllContextSnapshots(execCtx);
    expect(snapshot).toContain("Akıllı Bahçe");
    expect(snapshot).toContain("Orkide bugün sulanmalı.");

    // 3. Directly executable
    const res = await aiFeatureRegistry.executeAction(
      "water_plant",
      { plantName: "Monstera" },
      execCtx,
    );
    expect(res.success).toBe(true);
    expect(res.message).toBe("Monstera sulandı!");
  });
});

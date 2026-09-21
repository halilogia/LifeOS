import { describe, it, expect, beforeEach } from "vitest";
import { executeAIAction } from "@/services/aichat/actionExecutor.js";
import { aiFeatureRegistry } from "@/services/aichat/registry/index.js";
import type { IMediaRepository } from "@/domain/repositories/IMediaRepository.js";
import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { INoteRepository, Note } from "@/domain/repositories/INoteRepository.js";
import type { IMemoryRepository } from "@/domain/repositories/IMemoryRepository.js";
import type { MediaItem } from "@/types/media.js";
import type { Todo } from "@/domain/entities/Todo.js";
import type { AIResponseData } from "@/services/aichat/types.js";

class InMemoryMediaRepo implements IMediaRepository {
  private items: MediaItem[] = [];

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
    if (idx >= 0) {
      this.items[idx] = item;
    } else {
      this.items.unshift(item);
    }
  }

  async deleteItem(id: string): Promise<void> {
    this.items = this.items.filter((i) => i.id !== id);
  }
}

class InMemoryTodoRepo implements ITodoRepository {
  private todos: Todo[] = [];

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

class InMemoryNoteRepo implements INoteRepository {
  private notes: Note[] = [];

  async getAll(): Promise<Note[]> {
    return [...this.notes];
  }

  async saveAll(notes: Note[]): Promise<void> {
    this.notes = [...notes];
  }
}

class InMemoryMemoryRepo implements IMemoryRepository {
  private memory: string = "";

  async getMemory(): Promise<string> {
    return this.memory;
  }

  async setMemory(mem: string): Promise<void> {
    this.memory = mem;
  }
}

describe("AI Media Actions & Dashboard Context Integration", () => {
  let mediaRepo: InMemoryMediaRepo;
  let todoRepo: InMemoryTodoRepo;
  let noteRepo: InMemoryNoteRepo;
  let memoryRepo: InMemoryMemoryRepo;

  beforeEach(() => {
    mediaRepo = new InMemoryMediaRepo();
    todoRepo = new InMemoryTodoRepo();
    noteRepo = new InMemoryNoteRepo();
    memoryRepo = new InMemoryMemoryRepo();
  });

  it("executes add_media action and stores book in Media Vault", async () => {
    const aiResult: AIResponseData = {
      reply: "Kitap eklendi",
      action: "add_media",
      params: {
        type: "book",
        title: "1984",
        creator: "George Orwell",
        status: "in_progress",
        currentPage: 50,
        totalPages: 350,
      },
    };

    await executeAIAction(aiResult, "tr", todoRepo, noteRepo, memoryRepo, mediaRepo);

    const items = await mediaRepo.getItems();
    expect(items.length).toBe(1);
    expect(items[0].title).toBe("1984");
    expect(items[0].type).toBe("book");
    expect(items[0].creator).toBe("George Orwell");
    expect(items[0].bookProgress?.currentPage).toBe(50);
    expect(items[0].bookProgress?.totalPages).toBe(350);
  });

  it("executes batch_add_media action with multiple books and deduplicates", async () => {
    const aiResult: AIResponseData = {
      reply: "Kitaplar listenize eklendi",
      action: "batch_add_media",
      params: {
        items: [
          {
            type: "book",
            title: "Hayvan Çiftliği",
            creator: "George Orwell",
            status: "completed",
            totalPages: 160,
            currentPage: 160,
          },
          {
            type: "book",
            title: "Cesur Yeni Dünya",
            creator: "Aldous Huxley",
            status: "in_progress",
            totalPages: 270,
            currentPage: 40,
          },
        ],
      },
    };

    await executeAIAction(aiResult, "tr", todoRepo, noteRepo, memoryRepo, mediaRepo);

    const items = await mediaRepo.getItems();
    expect(items.length).toBe(2);
    const titles = items.map((i) => i.title);
    expect(titles).toContain("Hayvan Çiftliği");
    expect(titles).toContain("Cesur Yeni Dünya");

    // Execute same action with updated page progress for one item
    const updateResult: AIResponseData = {
      reply: "Güncelleme",
      action: "batch_add_media",
      params: {
        items: [
          {
            type: "book",
            title: "Cesur Yeni Dünya",
            currentPage: 120,
            totalPages: 270,
          },
        ],
      },
    };

    await executeAIAction(updateResult, "tr", todoRepo, noteRepo, memoryRepo, mediaRepo);
    const updatedItems = await mediaRepo.getItems();
    expect(updatedItems.length).toBe(2); // No duplicates created
    const cesur = updatedItems.find((i) => i.title === "Cesur Yeni Dünya");
    expect(cesur?.bookProgress?.currentPage).toBe(120);
  });

  it("executes add_media_quote to attach quote to an existing book", async () => {
    await mediaRepo.saveItems([
      {
        id: "book-1",
        type: "book",
        title: "1984",
        status: "in_progress",
        rating: 9,
        favorite: true,
        bookProgress: { currentPage: 100, totalPages: 350, quotes: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    const quoteAction: AIResponseData = {
      reply: "Alıntı eklendi",
      action: "add_media_quote",
      params: {
        book_title: "1984",
        quote_text: "Savaş barıştır, özgürlük köleliktir, cahillik güçtür.",
        page: 25,
      },
    };

    await executeAIAction(quoteAction, "tr", todoRepo, noteRepo, memoryRepo, mediaRepo);

    const items = await mediaRepo.getItems();
    expect(items[0].bookProgress?.quotes.length).toBe(1);
    expect(items[0].bookProgress?.quotes[0].text).toBe(
      "Savaş barıştır, özgürlük köleliktir, cahillik güçtür.",
    );
    expect(items[0].bookProgress?.quotes[0].page).toBe(25);
  });

  it("executes update_media_progress and marks completed when reaching total pages", async () => {
    await mediaRepo.saveItems([
      {
        id: "book-1",
        type: "book",
        title: "Savaş Sanatı",
        status: "in_progress",
        rating: 8,
        favorite: false,
        bookProgress: { currentPage: 50, totalPages: 100, quotes: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    const progressAction: AIResponseData = {
      reply: "İlerleme kaydedildi",
      action: "update_media_progress",
      params: {
        title: "Savaş Sanatı",
        currentPage: 100,
      },
    };

    await executeAIAction(progressAction, "tr", todoRepo, noteRepo, memoryRepo, mediaRepo);

    const items = await mediaRepo.getItems();
    expect(items[0].bookProgress?.currentPage).toBe(100);
    expect(items[0].status).toBe("completed");
    expect(items[0].finishedAt).toBeDefined();
  });

  it("executes batch_create_tasks to add multiple tasks simultaneously", async () => {
    const batchTaskAction: AIResponseData = {
      reply: "Görevler oluşturuldu",
      action: "batch_create_tasks",
      params: {
        tasks: [
          { text: "1984 1. Bölüm Tahlili", category: "reading", dueDate: "2026-09-25" },
          { text: "Yeni Konuş Notlarını Çıkar", category: "study" },
        ],
      },
    };

    await executeAIAction(batchTaskAction, "tr", todoRepo, noteRepo, memoryRepo, mediaRepo);

    const todos = await todoRepo.getAll();
    expect(todos.length).toBe(2);
    expect(todos[0].text).toBe("1984 1. Bölüm Tahlili");
    expect(todos[0].dueDate).toBe("2026-09-25");
    expect(todos[1].text).toBe("Yeni Konuş Notlarını Çıkar");
  });

  it("builds live dashboard context including active media reading and pending tasks", async () => {
    await todoRepo.saveAll([
      {
        id: "todo-1",
        text: "Akşam makale oku",
        completed: false,
        repeat: "none",
        dueDate: "2026-09-22",
        status: "todo",
        category: "general",
        lastCompletedDate: null,
      },
    ]);

    await mediaRepo.saveItems([
      {
        id: "media-1",
        type: "book",
        title: "İktidar",
        creator: "Robert Greene",
        status: "in_progress",
        rating: 9,
        favorite: true,
        bookProgress: { currentPage: 120, totalPages: 450, quotes: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "media-2",
        type: "movie",
        title: "Oppenheimer",
        status: "completed",
        rating: 9,
        favorite: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    const context = await aiFeatureRegistry.gatherAllContextSnapshots({
      lang: "tr",
      todoRepo,
      noteRepo,
      memoryRepo,
      mediaRepo,
    });
    expect(context).toContain("CANLI KULLANICI & DASHBOARD SİSTEM BAĞLAMI");
    expect(context).toContain("Akşam makale oku");
    expect(context).toContain("İktidar");
    expect(context).toContain("Toplam 2 kayıtlı eser");
  });
});

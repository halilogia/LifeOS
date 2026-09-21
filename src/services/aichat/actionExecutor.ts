import { getTranslation } from "@/utils/i18n.js";
import type { AIResponseData } from "./types.js";
import type { INoteRepository } from "@/domain/repositories/INoteRepository.js";
import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { IMemoryRepository } from "@/domain/repositories/IMemoryRepository.js";
import type { IMediaRepository } from "@/domain/repositories/IMediaRepository.js";
import type { Todo } from "@/domain/entities/Todo.js";
import type { Language } from "@/domain/value-objects/Language.js";
import type { MediaItem, MediaType, MediaStatus } from "@/types/media.js";
import { formatMemoryUpdate } from "@/domain/constants/memoryConstants.js";
import { logger } from "@/utils/logger.js";
import { aiFeatureRegistry } from "./registry/index.js";
import type { AiActionExecutionContext } from "./registry/types.js";

function notifyMediaStoreReload() {
  try {
    if (typeof window !== "undefined") {
      import("@/presentation/store/mediaStore.js")
        .then(({ useMediaStore }) => {
          const store = useMediaStore.getState();
          if (store && typeof store.loadItems === "function") {
            void store.loadItems();
          }
        })
        .catch((err) => {
          logger.warn("[actionExecutor] Could not reload mediaStore:", err);
        });
    }
  } catch {
    /* ignore in service worker */
  }
}

/**
 * Automatically execute structured AI actions (create tasks, add notes, update memory, manage media vault, etc.).
 */
export async function executeAIAction(
  aiResult: AIResponseData,
  lang: string = "tr",
  todoRepo: ITodoRepository,
  noteRepo: INoteRepository,
  memoryRepo: IMemoryRepository,
  mediaRepo?: IMediaRepository,
): Promise<void> {
  if (!aiResult.action || aiResult.action === "none") {
    return;
  }

  // 0. Extensible AI Feature Registry dynamic routing
  const regMatch = aiFeatureRegistry.getAction(aiResult.action);
  if (regMatch) {
    const execCtx: AiActionExecutionContext = {
      lang,
      todoRepo,
      noteRepo,
      memoryRepo,
      mediaRepo,
    };
    await aiFeatureRegistry.executeAction(
      aiResult.action,
      (aiResult.params as Record<string, unknown>) || {},
      execCtx,
    );
    return;
  }

  // 1. Single Task Creation
  if (aiResult.action === "create_task" && aiResult.params?.text) {
    const todos = await todoRepo.getAll();
    const newTodo: Todo = {
      id: `task-${Date.now()}`,
      text: String(aiResult.params?.text ?? ""),
      completed: false,
      repeat: String(aiResult.params?.repeat ?? "none") as Todo["repeat"],
      dueDate: String(aiResult.params?.dueDate ?? ""),
      status: "todo",
      category: String(aiResult.params?.category ?? "general"),
      lastCompletedDate: null,
    };
    todos.unshift(newTodo);
    await todoRepo.saveAll(todos);
    logger.info(`[actionExecutor] Created task: "${newTodo.text}"`);
  }

  // 2. Batch Task Creation (e.g. from study plans or reading calendars)
  else if (
    aiResult.action === "batch_create_tasks" &&
    Array.isArray(aiResult.params?.tasks)
  ) {
    const rawTasks = aiResult.params.tasks as Array<Record<string, unknown>>;
    const todos = await todoRepo.getAll();
    const newTodos: Todo[] = [];
    const now = Date.now();

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
      }
    }

    if (newTodos.length > 0) {
      await todoRepo.saveAll([...newTodos, ...todos]);
      logger.info(`[actionExecutor] Batch created ${newTodos.length} tasks`);
    }
  }

  // 3. Add Note / Diary / Cornell Note
  else if (aiResult.action === "add_note" && aiResult.params?.note_content) {
    await handleAddNoteFromAI(
      (String(aiResult.params.note_type) || "note") as
        "note" | "diary" | "cornell",
      aiResult.params.note_content as string,
      lang,
      noteRepo,
      aiResult.params.note_title as string,
      aiResult.params.note_cues as string,
      aiResult.params.note_summary as string,
    );
  }

  // 4. Update Personal Memory
  else if (
    aiResult.action === "update_memory" &&
    aiResult.params?.memory_fact
  ) {
    await handleUpdateMemoryFromAI(
      String(aiResult.params.memory_fact),
      memoryRepo,
      lang as Language,
    );
  }

  // 5. Add Single Media to Media Vault
  else if (aiResult.action === "add_media" && aiResult.params?.title && mediaRepo) {
    await handleAddMediaFromAI(aiResult.params, mediaRepo);
  }

  // 6. Batch Add Media to Media Vault
  else if (
    aiResult.action === "batch_add_media" &&
    Array.isArray(aiResult.params?.items) &&
    mediaRepo
  ) {
    await handleBatchAddMediaFromAI(
      aiResult.params.items as Array<Record<string, unknown>>,
      mediaRepo,
    );
  }

  // 7. Add Quote to Book in Media Vault
  else if (
    aiResult.action === "add_media_quote" &&
    aiResult.params?.book_title &&
    aiResult.params?.quote_text &&
    mediaRepo
  ) {
    await handleAddMediaQuoteFromAI(
      String(aiResult.params.book_title),
      String(aiResult.params.quote_text),
      typeof aiResult.params.page === "number" ? aiResult.params.page : undefined,
      mediaRepo,
    );
  }

  // 8. Update Media Progress (e.g. current page, episode, hours)
  else if (
    aiResult.action === "update_media_progress" &&
    aiResult.params?.title &&
    mediaRepo
  ) {
    await handleUpdateMediaProgressFromAI(aiResult.params, mediaRepo);
  }
}

/** Append a note (diary, cornell, or plain note) to the notes list. */
export async function handleAddNoteFromAI(
  type: "note" | "diary" | "cornell",
  content: string,
  lang: string,
  noteRepo: INoteRepository,
  title?: string,
  cues?: string,
  summary?: string,
): Promise<void> {
  const currentNotes = await noteRepo.getAll();
  const t = getTranslation(lang as Language);
  const formattedDate = new Date().toLocaleDateString(
    lang === "tr" ? "tr-TR" : "en-US",
  );
  const defaultTitle =
    title ||
    (type === "diary"
      ? t.note_diary_title.replace("{date}", formattedDate)
      : type === "cornell"
        ? t.note_cornell_title.replace("{date}", formattedDate)
        : t.note_title.replace("{date}", formattedDate));

  currentNotes.push({
    id: crypto.randomUUID(),
    title: defaultTitle,
    content: content,
    type: type,
    cues: cues || "",
    summary: summary || "",
    createdAt: new Date().toISOString(),
  });
  await noteRepo.saveAll(currentNotes);
}

/** Append a new learned personal memory fact. */
export async function handleUpdateMemoryFromAI(
  newFact: string,
  memoryRepo: IMemoryRepository,
  lang: Language = "tr",
): Promise<void> {
  if (!newFact || !newFact.trim()) {
    return;
  }

  const currentMemory = await memoryRepo.getMemory();
  const dateStr = new Date().toLocaleDateString(
    lang === "tr" ? "tr-TR" : "en-US",
  );
  const cleanFact = `- [${dateStr}] ${newFact.trim()}`;

  const updatedMemory = formatMemoryUpdate(currentMemory, cleanFact, lang);
  await memoryRepo.setMemory(updatedMemory);
}

/** Adds or updates a single MediaItem from structured AI params. */
export async function handleAddMediaFromAI(
  params: Record<string, unknown>,
  mediaRepo: IMediaRepository,
): Promise<void> {
  const title = String(params.title ?? "").trim();
  if (!title) return;

  const type = (String(params.type ?? "book").toLowerCase()) as MediaType;
  const status = (String(params.status ?? "in_progress").toLowerCase()) as MediaStatus;
  const now = new Date().toISOString();

  const items = await mediaRepo.getItems();
  const existingIdx = items.findIndex(
    (i) => i.type === type && i.title.toLowerCase().trim() === title.toLowerCase(),
  );

  const totalPages = Number(params.totalPages) || 0;
  const currentPage = Number(params.currentPage) || 0;

  const newItem: MediaItem = {
    id: existingIdx !== -1 ? items[existingIdx].id : `media_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    title,
    creator: params.creator ? String(params.creator).trim() : undefined,
    status,
    rating: Math.max(0, Math.min(10, Number(params.rating) || 0)),
    review: params.review ? String(params.review) : undefined,
    genres: Array.isArray(params.genres) ? params.genres.map(String) : [],
    favorite: Boolean(params.favorite),
    createdAt: existingIdx !== -1 ? items[existingIdx].createdAt : now,
    updatedAt: now,
  };

  if (type === "book") {
    newItem.bookProgress = {
      currentPage: currentPage,
      totalPages: totalPages,
      quotes: existingIdx !== -1 ? items[existingIdx].bookProgress?.quotes || [] : [],
    };
  } else if (type === "tv") {
    newItem.tvProgress = {
      currentSeason: Number(params.currentSeason) || 1,
      currentEpisode: Number(params.currentEpisode) || 0,
      totalEpisodes: Number(params.totalEpisodes) || undefined,
    };
  } else if (type === "game") {
    newItem.gameProgress = {
      playtimeHours: Number(params.playtimeHours) || 0,
      playstyle: "main_story",
      platform: "PC",
    };
  } else if (type === "movie") {
    newItem.movieProgress = {
      runtimeMinutes: Number(params.runtimeMinutes) || undefined,
    };
  }

  if (existingIdx !== -1) {
    items[existingIdx] = newItem;
  } else {
    items.unshift(newItem);
  }

  await mediaRepo.saveItems(items);
  notifyMediaStoreReload();
  logger.info(`[actionExecutor] Added/updated media "${newItem.title}" (${newItem.type})`);
}

/** Batch adds multiple media items from structured AI params (with deduplication). */
export async function handleBatchAddMediaFromAI(
  rawItems: Array<Record<string, unknown>>,
  mediaRepo: IMediaRepository,
): Promise<number> {
  if (!rawItems || rawItems.length === 0) return 0;

  const existing = await mediaRepo.getItems();
  const existingMap = new Map<string, number>();
  existing.forEach((item, index) => {
    existingMap.set(`${item.type}:${item.title.toLowerCase().trim()}`, index);
  });

  const now = new Date().toISOString();
  let addedCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < rawItems.length; i++) {
    const raw = rawItems[i];
    const title = String(raw.title ?? "").trim();
    if (!title) continue;

    const type = (String(raw.type ?? "book").toLowerCase()) as MediaType;
    const status = (String(raw.status ?? "in_progress").toLowerCase()) as MediaStatus;
    const key = `${type}:${title.toLowerCase()}`;

    const totalPages = Number(raw.totalPages) || 0;
    const currentPage = Number(raw.currentPage) || 0;

    const existingIdx = existingMap.get(key);
    const mediaId = existingIdx !== undefined ? existing[existingIdx].id : `media_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`;

    const item: MediaItem = {
      id: mediaId,
      type,
      title,
      creator: raw.creator ? String(raw.creator).trim() : undefined,
      status,
      rating: Math.max(0, Math.min(10, Number(raw.rating) || 0)),
      review: raw.review ? String(raw.review) : undefined,
      genres: Array.isArray(raw.genres) ? raw.genres.map(String) : [],
      favorite: Boolean(raw.favorite),
      createdAt: existingIdx !== undefined ? existing[existingIdx].createdAt : now,
      updatedAt: now,
    };

    if (type === "book") {
      item.bookProgress = {
        currentPage,
        totalPages,
        quotes: existingIdx !== undefined ? existing[existingIdx].bookProgress?.quotes || [] : [],
      };
    } else if (type === "tv") {
      item.tvProgress = {
        currentSeason: Number(raw.currentSeason) || 1,
        currentEpisode: Number(raw.currentEpisode) || 0,
        totalEpisodes: Number(raw.totalEpisodes) || undefined,
      };
    } else if (type === "game") {
      item.gameProgress = {
        playtimeHours: Number(raw.playtimeHours) || 0,
        playstyle: "main_story",
        platform: "PC",
      };
    }

    if (existingIdx !== undefined) {
      existing[existingIdx] = item;
      updatedCount++;
    } else {
      existing.unshift(item);
      existingMap.set(key, 0);
      addedCount++;
    }
  }

  await mediaRepo.saveItems(existing);
  notifyMediaStoreReload();
  logger.info(`[actionExecutor] Batch media executed: ${addedCount} added, ${updatedCount} updated`);
  return addedCount + updatedCount;
}

/** Adds a memorable quote to an existing book in Media Vault. */
export async function handleAddMediaQuoteFromAI(
  bookTitle: string,
  quoteText: string,
  page: number | undefined,
  mediaRepo: IMediaRepository,
): Promise<boolean> {
  const cleanTitle = bookTitle.toLowerCase().trim();
  const cleanQuote = quoteText.trim();
  if (!cleanTitle || !cleanQuote) return false;

  const items = await mediaRepo.getItems();
  const book = items.find(
    (i) => i.type === "book" && i.title.toLowerCase().includes(cleanTitle),
  );

  if (!book) {
    logger.warn(`[actionExecutor] Book not found for quote: "${bookTitle}"`);
    return false;
  }

  if (!book.bookProgress) {
    book.bookProgress = { currentPage: 0, totalPages: 0, quotes: [] };
  }

  book.bookProgress.quotes.push({
    id: `quote_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    text: cleanQuote,
    page,
    createdAt: new Date().toISOString(),
  });
  book.updatedAt = new Date().toISOString();

  await mediaRepo.saveItems(items);
  notifyMediaStoreReload();
  logger.info(`[actionExecutor] Added quote to book "${book.title}"`);
  return true;
}

/** Updates reading, watching, or gaming progress for an item. */
export async function handleUpdateMediaProgressFromAI(
  params: Record<string, unknown>,
  mediaRepo: IMediaRepository,
): Promise<boolean> {
  const title = String(params.title ?? "").toLowerCase().trim();
  if (!title) return false;

  const items = await mediaRepo.getItems();
  const item = items.find((i) => i.title.toLowerCase().includes(title));

  if (!item) {
    logger.warn(`[actionExecutor] Item not found for progress update: "${title}"`);
    return false;
  }

  if (item.type === "book" && item.bookProgress && typeof params.currentPage === "number") {
    item.bookProgress.currentPage = params.currentPage;
    if (item.bookProgress.totalPages > 0 && item.bookProgress.currentPage >= item.bookProgress.totalPages) {
      item.status = "completed";
      item.finishedAt = new Date().toISOString();
    }
  } else if (item.type === "tv" && item.tvProgress && typeof params.currentEpisode === "number") {
    item.tvProgress.currentEpisode = params.currentEpisode;
  } else if (item.type === "game" && item.gameProgress && typeof params.playtimeHours === "number") {
    item.gameProgress.playtimeHours = params.playtimeHours;
  }

  if (params.status && typeof params.status === "string") {
    item.status = params.status as MediaStatus;
  }

  item.updatedAt = new Date().toISOString();
  await mediaRepo.saveItems(items);
  notifyMediaStoreReload();
  logger.info(`[actionExecutor] Updated progress for "${item.title}"`);
  return true;
}

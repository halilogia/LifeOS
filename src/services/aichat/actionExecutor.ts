import { getTranslation } from "@/utils/i18n.js";
import type { AIResponseData } from "./types.js";
import type { INoteRepository } from "@/domain/repositories/INoteRepository.js";
import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { IMemoryRepository } from "@/domain/repositories/IMemoryRepository.js";
import type { Todo } from "@/domain/entities/Todo.js";
import type { Language } from "@/domain/value-objects/Language.js";

/**
 * Automatically execute structured AI actions (create tasks, add notes, update memory).
 */
export async function executeAIAction(
  aiResult: AIResponseData,
  lang: string = "tr",
  todoRepo: ITodoRepository,
  noteRepo: INoteRepository,
  memoryRepo: IMemoryRepository,
): Promise<void> {
  if (!aiResult.action || aiResult.action === "none") {
    return;
  }

  if (aiResult.action === "create_task" && aiResult.params?.text) {
    const todos = await todoRepo.getAll();
    const newTodo = {
      id: `task-${Date.now()}`,
      text: String(aiResult.params?.text ?? ""),
      completed: false,
      repeat: String(aiResult.params?.repeat ?? "none") as Todo["repeat"],
      dueDate: String(aiResult.params?.dueDate ?? ""),
      status: "todo",
      category: "general",
      createdAt: new Date().toISOString(),
    };
    todos.unshift({
      ...newTodo,
      status: "todo" as const,
      lastCompletedDate: null,
    });
    await todoRepo.saveAll(todos);
  } else if (aiResult.action === "add_note" && aiResult.params?.note_content) {
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
  } else if (
    aiResult.action === "update_memory" &&
    aiResult.params?.memory_fact
  ) {
    await handleUpdateMemoryFromAI(
      String(aiResult.params.memory_fact),
      memoryRepo,
    );
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
): Promise<void> {
  if (!newFact || !newFact.trim()) {
    return;
  }

  const currentMemory = await memoryRepo.getMemory();
  const dateStr = new Date().toLocaleDateString("tr-TR");
  const cleanFact = `- [${dateStr}] ${newFact.trim()}`;

  let updatedMemory = currentMemory;
  if (!updatedMemory || !updatedMemory.trim()) {
    updatedMemory = `# Kişisel Hafıza & Kullanıcı Bağlamı (memory.md)\n\n## 💡 AI Tarafından Öğrenilen Bilgiler\n${cleanFact}`;
  } else if (updatedMemory.includes("## 💡 AI Tarafından Öğrenilen Bilgiler")) {
    updatedMemory = updatedMemory.replace(
      "## 💡 AI Tarafından Öğrenilen Bilgiler",
      `## 💡 AI Tarafından Öğrenilen Bilgiler\n${cleanFact}`,
    );
  } else {
    updatedMemory = `${updatedMemory.trim()}\n\n## 💡 AI Tarafından Öğrenilen Bilgiler\n${cleanFact}`;
  }

  await memoryRepo.setMemory(updatedMemory);
}

import { storage } from "@/core/storage.js";
import { elements } from "@/ui/dom.js";
import { Note } from "@/types/types.js";
import { state } from "@/core/state.js";

let currentEditingId: string | null = null;

export async function initNotes(): Promise<void> {
  elements.addNoteBtn().addEventListener("click", () => {
    openNoteModal();
  });

  elements.noteModalClose().addEventListener("click", () => {
    closeNoteModal();
  });

  elements.saveNoteBtn().addEventListener("click", async () => {
    await saveNote();
  });

  elements.noteModal().addEventListener("click", (e) => {
    if (e.target === elements.noteModal()) {
      closeNoteModal();
    }
  });

  await loadNotes();
}

export async function loadNotes(): Promise<void> {
  const notes = await storage.getNotes();
  const grid = elements.notesGrid();
  grid.innerHTML = "";

  notes.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  notes.forEach((note) => {
    const card = renderNoteCard(note);
    grid.appendChild(card);
  });
}

function renderNoteCard(note: Note): HTMLElement {
  const card = document.createElement("div");
  card.className = "note-card";

  const title =
    note.title || (state.currentLang === "tr" ? "Başlıksız" : "Untitled");
  const content =
    note.content.length > 100
      ? note.content.substring(0, 100) + "..."
      : note.content;

  card.innerHTML = `
    <div class="note-card-header">
      <h3 class="note-card-title">${title}</h3>
      <button class="note-delete-btn" title="Delete">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    </div>
    <div class="note-card-content">${content}</div>
    <div class="note-card-footer">
      <span class="note-card-date">${new Date(note.createdAt).toLocaleDateString()}</span>
    </div>
  `;

  card.addEventListener("click", (e) => {
    if (!(e.target as HTMLElement).closest(".note-delete-btn")) {
      openNoteModal(note);
    }
  });

  card
    .querySelector(".note-delete-btn")
    ?.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (
        confirm(
          state.currentLang === "tr"
            ? "Bu notu silmek istediğinize emin misiniz?"
            : "Are you sure you want to delete this note?",
        )
      ) {
        await deleteNote(note.id);
      }
    });

  return card;
}

function openNoteModal(note?: Note): void {
  const modal = elements.noteModal();
  const titleInput = elements.noteTitleInput();
  const contentInput = elements.noteContentInput();

  if (note) {
    currentEditingId = note.id;
    titleInput.value = note.title;
    contentInput.value = note.content;
  } else {
    currentEditingId = null;
    titleInput.value = "";
    contentInput.value = "";
  }

  modal.classList.add("active");
  contentInput.focus();
}

function closeNoteModal(): void {
  elements.noteModal().classList.remove("active");
  currentEditingId = null;
}

async function saveNote(): Promise<void> {
  const title = elements.noteTitleInput().value.trim();
  const content = elements.noteContentInput().value.trim();

  if (!title && !content) {
    closeNoteModal();
    return;
  }

  const notes = await storage.getNotes();

  if (currentEditingId) {
    const index = notes.findIndex((n) => n.id === currentEditingId);
    if (index !== -1) {
      notes[index].title = title;
      notes[index].content = content;
      notes[index].createdAt = new Date().toISOString(); // Update timestamp on edit? or keep original?
    }
  } else {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: new Date().toISOString(),
    };
    notes.push(newNote);
  }

  await storage.setNotes(notes);
  await loadNotes();
  closeNoteModal();
}

async function deleteNote(id: string): Promise<void> {
  const notes = await storage.getNotes();
  const filtered = notes.filter((n) => n.id !== id);
  await storage.setNotes(filtered);
  await loadNotes();
}

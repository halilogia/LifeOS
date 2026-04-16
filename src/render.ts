import { Todo } from "./types.js";
import { translations } from "./i18n.js";
import { elements } from "./dom.js";
import { state } from "./state.js";

export function renderTodo(
  todo: Todo,
  index: number,
  targetList: HTMLUListElement,
  handlers: {
    toggle: (idx: number) => void;
    delete: (idx: number, el: HTMLLIElement) => void;
  },
): void {
  const li = document.createElement("li");
  li.className = `todo-item ${todo.completed ? "completed" : ""}`;
  const key = `repeat_${todo.repeat}` as keyof (typeof translations)["tr"];
  const rLabel =
    todo.repeat !== "none"
      ? `<span class="repeat-badge">${translations[state.currentLang][key]}</span>`
      : "";

  li.innerHTML = `
        <div class="checkbox">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="todo-content" style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
            <span class="todo-text">${todo.text}</span>
            <div style="display: flex; gap: 6px; align-items: center;">
                ${rLabel}
            </div>
        </div>
        <button class="delete-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
    `;

  li.querySelector(".checkbox")?.addEventListener("click", () =>
    handlers.toggle(index),
  );
  li.querySelector(".todo-text")?.addEventListener("click", () =>
    handlers.toggle(index),
  );
  li.querySelector(".delete-btn")?.addEventListener("click", () =>
    handlers.delete(index, li),
  );
  targetList.appendChild(li);
}

export function renderKanbanItem(
  todo: Todo,
  index: number,
  handlers: {
    move: (idx: number, dir: number) => void;
    statusChange: (idx: number, status: Todo["status"]) => void;
  },
): void {
  const item = document.createElement("div");
  item.className = "kanban-item";
  item.setAttribute("draggable", "true");

  item.innerHTML = `
        <div class="kanban-item-content" style="display: flex; flex-direction: column; gap: 8px;">
            <div class="kanban-item-text">${todo.text}</div>
        </div>
        <div class="kanban-controls">
            <button class="move-btn move-left" title="${state.currentLang === "tr" ? "Sola Taşı" : "Move Left"}" ${todo.status === "todo" ? "disabled" : ""}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button class="move-btn move-right" title="${state.currentLang === "tr" ? "Sağa Taşı" : "Move Right"}" ${todo.status === "done" ? "disabled" : ""}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
        </div>
    `;

  item.addEventListener("dragstart", (e) => {
    e.dataTransfer?.setData("text/plain", index.toString());
    item.classList.add("dragging");
  });
  item.addEventListener("dragend", () => item.classList.remove("dragging"));

  item
    .querySelector(".move-left")
    ?.addEventListener("click", () => handlers.move(index, -1));
  item
    .querySelector(".move-right")
    ?.addEventListener("click", () => handlers.move(index, 1));

  if (todo.status === "todo") {
    elements.kanbanTodo().appendChild(item);
  } else if (todo.status === "in-progress") {
    elements.kanbanInProgress().appendChild(item);
  } else if (todo.status === "done") {
    elements.kanbanDone().appendChild(item);
  }
}

export function switchView(view: "list" | "kanban" | "hifiz"): void {
  const isList = view === "list";
  const isKanban = view === "kanban";
  const isHifiz = view === "hifiz";

  elements.viewListBtn().classList.toggle("active", isList);
  elements.viewKanbanBtn().classList.toggle("active", isKanban);
  elements.viewHifizBtn().classList.toggle("active", isHifiz);

  elements.listView().classList.toggle("active", isList);
  elements.kanbanView().classList.toggle("active", isKanban);
  elements.hifizView().classList.toggle("active", isHifiz);

  const hero = elements.hero();
  const topHeader = elements.topHeader();
  if (hero) {
    hero.style.display = isList ? "block" : "none";
  }
  if (topHeader) {
    topHeader.style.display = isList ? "flex" : "none";
  }

  const container = elements.container();
  if (container) {
    container.style.maxWidth = isList ? "1000px" : isKanban ? "100%" : "1200px";
    container.style.margin = isList
      ? "120px auto 0 auto"
      : isKanban
        ? "20px auto 0 auto"
        : "40px auto 0 auto";
  }
}

export function switchTab(tab: "focus" | "routines"): void {
  state.activeTab = tab;
  const isFocus = tab === "focus";
  elements.navFocusBtn().classList.toggle("active", isFocus);
  elements.navRoutinesBtn().classList.toggle("active", !isFocus);
  elements.tasksSection().classList.toggle("active", isFocus);
  elements.recurringSection().classList.toggle("active", !isFocus);
}

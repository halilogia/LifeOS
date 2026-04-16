import { Todo } from "./types.js";
import { applyI18n, translations } from "./i18n.js";
import { updateTime, setRandomQuote } from "./utils.js";
import { elements } from "./dom.js";
import { state } from "./state.js";
import { storage } from "./storage.js";
import {
  renderTodo,
  renderKanbanItem,
  switchView,
  switchTab,
} from "./render.js";
import { handleBackup, handleRestore } from "./backup.js";
import {
  checkAndResetRepeatingTasks,
  moveTaskWithStatus,
  getUpdatedStatuses,
} from "./tasks.js";
import { initHifiz } from "./hifiz.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Initial data load
  const settings = await storage.getSettings();
  state.currentLang = settings.lang;
  const isSidebarOpen = !!(settings.sidebarOpen !== undefined
    ? settings.sidebarOpen
    : window.innerWidth >= 1200);
  document.body.classList.toggle("sidebar-open", isSidebarOpen);

  // Initial UI setup
  applyI18n(state.currentLang, elements.todoInput(), elements.langToggleBtn());
  setRandomQuote(elements.quote(), state.currentLang);
  updateTime(elements.clock(), elements.date(), state.currentLang);
  elements.langText().textContent = state.currentLang.toUpperCase();

  async function loadTodos(): Promise<void> {
    let todos = await storage.getTodos();
    let needsSave = false;

    todos = todos.map((todo) => {
      if (!todo.status) {
        todo.status = todo.completed ? "done" : "todo";
        needsSave = true;
      }
      return todo;
    });

    const wasModified = checkAndResetRepeatingTasks(todos);
    if (wasModified || needsSave) {
      await storage.setTodos(todos);
    }

    const elList = [
      elements.todoList(),
      elements.recurringList(),
      elements.kanbanTodo(),
      elements.kanbanInProgress(),
      elements.kanbanDone(),
    ];
    elList.forEach((el) => {
      if (el) {
        el.innerHTML = "";
      }
    });

    let oneCount = 0;
    let recCount = 0;

    todos.forEach((todo, index) => {
      if (todo.repeat === "none") {
        renderTodo(todo, index, elements.todoList(), {
          toggle: toggleTodo,
          delete: deleteTodo,
        });
        oneCount++;
      } else {
        renderTodo(todo, index, elements.recurringList(), {
          toggle: toggleTodo,
          delete: deleteTodo,
        });
        recCount++;
      }
      renderKanbanItem(todo, index, {
        move: moveTask,
        statusChange: moveTaskWithStatusAndReload,
      });
    });

    const count = state.activeTab === "focus" ? oneCount : recCount;
    elements.emptyState().classList.toggle("active", count === 0);
  }

  async function toggleTodo(index: number): Promise<void> {
    const todos = await storage.getTodos();
    if (index < 0 || index >= todos.length) {
      return;
    }
    const isComp = !todos[index].completed;
    todos[index].completed = isComp;
    todos[index].status = isComp ? "done" : "todo";
    if (isComp) {
      todos[index].lastCompletedDate = new Date().toISOString();
    }
    await storage.setTodos(todos);
    loadTodos();
  }

  async function deleteTodo(index: number, el: HTMLLIElement): Promise<void> {
    el.style.animation = "slideOut 0.3s ease-out forwards";
    setTimeout(async () => {
      const todos = await storage.getTodos();
      if (index >= 0 && index < todos.length) {
        todos.splice(index, 1);
        await storage.setTodos(todos);
        loadTodos();
      }
    }, 300);
  }

  async function moveTask(index: number, direction: number): Promise<void> {
    const todos = await storage.getTodos();
    const nextStatus = getUpdatedStatuses(todos, index, direction);
    if (nextStatus) {
      moveTaskWithStatus(index, nextStatus, todos);
      await storage.setTodos(todos);
      loadTodos();
    }
  }

  async function moveTaskWithStatusAndReload(
    index: number,
    newStatus: Todo["status"],
  ): Promise<void> {
    const todos = await storage.getTodos();
    moveTaskWithStatus(index, newStatus, todos);
    await storage.setTodos(todos);
    loadTodos();
  }

  // Event Listeners
  elements.addButton().addEventListener("click", async () => {
    const text = elements.todoInput().value.trim();
    if (!text) {
      return;
    }

    const todos = await storage.getTodos();
    const repeat = elements.repeatSelect().value as Todo["repeat"];

    todos.push({
      text,
      completed: false,
      status: "todo",
      repeat: repeat,
      category: "other",
      lastCompletedDate: null,
    });

    await storage.setTodos(todos);
    elements.todoInput().value = "";
    elements.repeatSelect().value =
      state.activeTab === "focus" ? "none" : "daily";
    loadTodos();
  });

  elements.sidebarToggle().addEventListener("click", async () => {
    const isOpen = document.body.classList.toggle("sidebar-open");
    await storage.setSidebarOpen(isOpen);
  });

  document.addEventListener("click", (e) => {
    if (
      document.body.classList.contains("sidebar-open") &&
      !elements.sidebar().contains(e.target as Node) &&
      !elements.sidebarToggle().contains(e.target as Node) &&
      window.innerWidth < 1200
    ) {
      document.body.classList.remove("sidebar-open");
      storage.setSidebarOpen(false);
    }
  });

  elements.todoInput().addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      elements.addButton().click();
    }
  });

  elements.backupBtn().addEventListener("click", handleBackup);
  elements
    .restoreInput()
    .addEventListener("change", (e) => handleRestore(e, loadTodos));
  elements
    .restoreBtn()
    .addEventListener("click", () => elements.restoreInput().click());
  elements.viewListBtn().addEventListener("click", () => switchView("list"));
  elements
    .viewKanbanBtn()
    .addEventListener("click", () => switchView("kanban"));
  elements
    .viewHifizBtn()
    .addEventListener("click", () => {
      switchView("hifiz");
      initHifiz();
    });

  elements.navFocusBtn().addEventListener("click", () => {
    switchTab("focus");
    elements.repeatSelect().value = "none";
    loadTodos();
  });
  elements.navRoutinesBtn().addEventListener("click", () => {
    switchTab("routines");
    elements.repeatSelect().value = "daily";
    loadTodos();
  });

  elements.langToggleBtn().addEventListener("click", async () => {
    state.currentLang = state.currentLang === "tr" ? "en" : "tr";
    await storage.setLang(state.currentLang);
    applyI18n(
      state.currentLang,
      elements.todoInput(),
      elements.langToggleBtn(),
    );
    setRandomQuote(elements.quote(), state.currentLang);
    updateTime(elements.clock(), elements.date(), state.currentLang);
    elements.langText().textContent = state.currentLang.toUpperCase();
    loadTodos();
  });

  elements
    .settingsBtn()
    .addEventListener("click", () =>
      elements.settingsPanel().classList.add("active"),
    );
  elements
    .settingsClose()
    .addEventListener("click", () =>
      elements.settingsPanel().classList.remove("active"),
    );

  elements.clearAllBtn().addEventListener("click", async () => {
    const settings = await storage.getSettings();
    if (confirm(translations[settings.lang].alert_clear_confirm)) {
      await storage.clearAll(settings.lang);
      loadTodos();
      elements.settingsPanel().classList.remove("active");
    }
  });

  elements.settingsPanel().addEventListener("click", (e) => {
    if (e.target === elements.settingsPanel()) {
      elements.settingsPanel().classList.remove("active");
    }
  });

  [
    elements.kanbanTodo(),
    elements.kanbanInProgress(),
    elements.kanbanDone(),
  ].forEach((col) => {
    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      (col.closest(".kanban-column") as HTMLElement)?.classList.add(
        "drag-over",
      );
    });
    col.addEventListener("dragleave", () =>
      (col.closest(".kanban-column") as HTMLElement)?.classList.remove(
        "drag-over",
      ),
    );
    col.addEventListener("drop", (e) => {
      e.preventDefault();
      (col.closest(".kanban-column") as HTMLElement)?.classList.remove(
        "drag-over",
      );
      const idx = e.dataTransfer?.getData("text/plain");
      if (idx !== undefined) {
        moveTaskWithStatusAndReload(
          parseInt(idx),
          col.dataset.status as Todo["status"],
        );
      }
    });
  });

  // Final Initialization
  loadTodos();
  initHifiz();
  setInterval(
    () => updateTime(elements.clock(), elements.date(), state.currentLang),
    1000,
  );
});

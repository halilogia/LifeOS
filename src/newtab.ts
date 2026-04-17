import { Todo } from "./types/types.js";
import { applyI18n, translations } from "./utils/i18n.js";
import { updateTime, setRandomQuote } from "./utils/utils.js";
import { elements } from "./ui/dom.js";
import { state } from "./core/state.js";
import { storage } from "./core/storage.js";
import {
  renderTodo,
  renderKanbanItem,
  switchView,
  switchTab,
  setupKanbanListeners,
} from "./render.js";
import { handleBackup, handleRestore } from "./core/backup.js";
import {
  checkAndResetRepeatingTasks,
  moveTaskWithStatus,
  getUpdatedStatuses,
} from "./features/tasks.js";
import { initHifiz } from "./features/hifiz.js";
import { initNotes } from "./features/notes.js";
import { initSrs } from "./ui/srsView.js";
import { initPomodoro } from "./features/pomodoro.js";
import { initCalendar, renderCalendar } from "./features/calendar.js";
import { initPrayers } from "./ui/prayerView.js";
import { initKpss } from "./features/kpss.js";
import { initQuotes } from "./features/quotes.js";
import { initSidebar } from "./ui/sidebar.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Restore local data to sync on first run
  await storage.migrateLocalToSync();

  // Initial data load
  const settings = await storage.getSettings();
  state.currentLang = settings.lang;
  const isSidebarOpen = !!(settings.sidebarOpen !== undefined
    ? settings.sidebarOpen
    : window.innerWidth >= 1200);
  document.body.classList.toggle("sidebar-open", isSidebarOpen);

  // Initial UI setup
  applyI18n(state.currentLang, elements.todoInput(), elements.langToggleBtn());
  await setRandomQuote(elements.quote(), state.currentLang);
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
      const now = new Date().toISOString();
      todos[index].lastCompletedDate = now;
      if (!todos[index].completedDates) {
        todos[index].completedDates = [];
      }
      todos[index].completedDates.push(now);
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
      completedDates: [],
    });

    await storage.setTodos(todos);
    elements.todoInput().value = "";
    elements.repeatSelect().value =
      state.activeTab === "focus" ? "none" : "daily";
    loadTodos();
  });

  initSidebar();

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
  // Navigation Buttons
  const navMap: Record<string, () => void> = {
    viewListBtn: () => switchView("list"),
    viewKanbanBtn: () => switchView("kanban"),
    viewHifizBtn: () => {
      switchView("hifiz");
      initHifiz();
    },
    viewNotesBtn: () => {
      switchView("notes");
      initNotes();
    },
    viewSrsBtn: () => {
      switchView("srs");
      initSrs();
    },
    viewPomodoroBtn: () => {
      switchView("pomodoro");
      initPomodoro();
    },
    viewCalendarBtn: () => {
      switchView("calendar");
      renderCalendar();
    },
    viewPrayerBtn: () => {
      switchView("prayer");
      initPrayers();
    },
    viewKpssBtn: () => {
      switchView("kpss");
      initKpss();
    },
    navFocusBtn: () => {
      switchView("list");
      switchTab("focus");
      elements.repeatSelect().value = "none";
      loadTodos();
    },
    navRoutinesBtn: () => {
      switchView("list");
      switchTab("routines");
      elements.repeatSelect().value = "daily";
      loadTodos();
    },
  };

  Object.entries(navMap).forEach(([btnKey, action]) => {
    const getEl = (
      elements as unknown as Record<string, () => HTMLElement | null>
    )[btnKey];
    getEl?.()?.addEventListener("click", action);
  });

  elements.langToggleBtn().addEventListener("click", async () => {
    state.currentLang = state.currentLang === "tr" ? "en" : "tr";
    await storage.setLang(state.currentLang);
    applyI18n(
      state.currentLang,
      elements.todoInput(),
      elements.langToggleBtn(),
    );
    await setRandomQuote(elements.quote(), state.currentLang);
    updateTime(elements.clock(), elements.date(), state.currentLang);
    elements.langText().textContent = state.currentLang.toUpperCase();
    initPrayers();
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

  setupKanbanListeners(moveTaskWithStatusAndReload);

  // Final Initialization
  loadTodos();
  initHifiz();
  initNotes();
  initPomodoro();
  initCalendar();
  initKpss();
  initQuotes();
  switchView("pomodoro");
  setInterval(
    () => updateTime(elements.clock(), elements.date(), state.currentLang),
    1000,
  );
});

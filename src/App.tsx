import { useState, useEffect } from "preact/hooks";
import { storage, GoogleSyncSettings } from "./core/storage.js";
import { googleSyncService } from "./services/googleSyncService.js";
import {
  checkAndResetRepeatingTasks,
  moveTaskWithStatus,
  getUpdatedStatuses,
} from "./features/tasks.js";
import { translations } from "./utils/i18n.js";
import { Language, Todo } from "./types/types.js";

// Import View Components
import { Sidebar } from "./components/Sidebar.js";
import { ListView } from "./components/ListView.js";
import { KanbanView } from "./components/KanbanView.js";
import { NotesView } from "./components/NotesView.js";
import { PomodoroView } from "./components/PomodoroView.js";
import { WillpowerView } from "./components/WillpowerView.js";
import { HifizView } from "./components/HifizView.js";
import { SrsView } from "./components/SrsView.js";
import { CalendarView } from "./components/CalendarView.js";
import { PrayerView } from "./components/PrayerView.js";
import { KpssView } from "./components/KpssView.js";
import { FreeGamesView } from "./components/FreeGamesView.js";
import { DetoxView } from "./components/DetoxView.js";
import { HalkaArzView } from "./components/HalkaArzView.js";
import { AIChatView } from "./components/AIChatView.js";
import { ConfirmModal } from "@/components/ConfirmModal.js";

export function App() {
  // Navigation & UI States
  const [lang, setLang] = useState<Language>("tr");
  const [activeView, setActiveView] = useState<string>("free-games");
  const [activeTab, setActiveTab] = useState<"focus" | "routines">("focus");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Google Sync States
  const [syncSettings, setSyncSettingsState] = useState<GoogleSyncSettings>({
    enabled: false,
    tasksEnabled: false,
    calendarEnabled: false,
  });
  const [googleUserEmail, setGoogleUserEmail] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);

  // Free games notification toggle
  const [freeGamesNotificationsEnabled, setFreeGamesNotificationsEnabled] =
    useState(true);

  // AI Assistant States
  const [aiProvider, setAiProvider] = useState<string>("gemini");
  const [aiApiKey, setAiApiKey] = useState<string>("");
  const [aiModel, setAiModel] = useState<string>("");
  const [settingsTab, setSettingsTab] = useState<"general" | "ai" | "sync">("general");

  // Universal Info Box / Inline Translation Bubble states
  const [universalInfoBoxEnabled, setUniversalInfoBoxEnabled] = useState(true);
  const [universalInfoBoxHotkey, setUniversalInfoBoxHotkey] = useState("none");

  // Custom confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: "",
    onConfirm: () => {},
  });

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Custom alert dialog state
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    message: "",
  });

  const showAlert = (message: string, onConfirm?: () => void) => {
    setAlertDialog({
      isOpen: true,
      message,
      onConfirm,
    });
  };

  // Time & Date State
  const [clockText, setClockText] = useState("00:00");
  const [dateText, setDateText] = useState("");

  // Quotes State
  const [quoteText, setQuoteText] = useState("");

  // Global Sync Todos State
  const [todos, setTodos] = useState<Todo[]>([]);

  // Todo Input States (moved to root level for correct fixed-position layout alignment)
  const [todoText, setTodoText] = useState("");
  const [todoRepeat, setTodoRepeat] = useState<Todo["repeat"]>("none");
  const [todoDueDate, setTodoDueDate] = useState("");

  const handleTabChange = (tabVal: "focus" | "routines") => {
    setActiveTab(tabVal);
    setTodoRepeat(tabVal === "focus" ? "none" : "daily");
  };

  const t = translations[lang];

  // Initialize and load configurations
  useEffect(() => {
    const initializeApp = async () => {
      // 1. Run storage migrations (sync storage setup)
      await storage.migrateLocalToSync();

      // 2. Load configurations
      const config = await storage.getSettings();
      setLang(config.lang);
      setSidebarOpen(config.sidebarOpen ?? true);
      setFreeGamesNotificationsEnabled(
        config.freeGamesNotificationsEnabled ?? true,
      );
      setUniversalInfoBoxEnabled(config.universalInfoBoxEnabled ?? true);
      setUniversalInfoBoxHotkey(config.universalInfoBoxHotkey || "none");

      // Load Google Sync Settings
      const syncConfig = await storage.getSyncSettings();
      setSyncSettingsState(syncConfig);

      // Load AI Configs
      const provider = await storage.getAIProvider();
      const key = await storage.getGeminiApiKey();
      const model = await storage.getAIModel();
      setAiProvider(provider);
      setAiApiKey(key);
      setAiModel(model);

      // Apply body class for legacy CSS compatibilities
      document.body.classList.toggle(
        "sidebar-open",
        config.sidebarOpen ?? true,
      );

      // 3. Load and clean task items (Offline/Local first)
      const loadedTodos = await storage.getTodos();
      const clone = JSON.parse(JSON.stringify(loadedTodos));
      const hasResets = checkAndResetRepeatingTasks(clone);
      if (hasResets) {
        await storage.setTodos(clone);
        setTodos(clone);
      } else {
        setTodos(loadedTodos);
      }

      // 4. Trigger background task sync if Google Sync is enabled
      if (syncConfig.enabled) {
        try {
          const token = await googleSyncService.getAuthToken(false);
          const uinfo = await googleSyncService.getUserInfo(token);
          setGoogleUserEmail(uinfo.email);
          if (syncConfig.tasksEnabled) {
            await syncGoogleTasks(token);
          }
        } catch (e) {
          console.warn("Silent Google OAuth login failed on startup:", e);
        }
      }

      // 5. Set quote
      refreshQuote(config.lang);
    };

    initializeApp();

    // Setup clocks ticking interval
    const clockInterval = setInterval(refreshClock, 1000);
    refreshClock();

    return () => clearInterval(clockInterval);
  }, []);

  // Update clock elements in real-time
  const refreshClock = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setClockText(`${hours}:${minutes}`);

    const locale = lang === "tr" ? "tr-TR" : "en-US";
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    setDateText(now.toLocaleDateString(locale, options));
  };

  // Trigger language change updates
  useEffect(() => {
    refreshClock();
    refreshQuote(lang);
  }, [lang]);

  // Load a random quote from default translations + user custom quotes
  const refreshQuote = async (activeLang: Language) => {
    const customQuotes = await storage.getCustomQuotes();
    const defaultQuoteCount = 7;
    const poolSize = defaultQuoteCount + customQuotes.length;
    const randomIndex = Math.floor(Math.random() * poolSize);

    if (randomIndex < defaultQuoteCount) {
      const quoteKeys = [
        "quote_1",
        "quote_2",
        "quote_3",
        "quote_4",
        "quote_5",
        "quote_6",
        "quote_7",
      ];
      const randomKey = quoteKeys[
        randomIndex
      ] as keyof (typeof translations)["tr"];
      setQuoteText(translations[activeLang][randomKey]);
    } else {
      const custom = customQuotes[randomIndex - defaultQuoteCount];
      setQuoteText(
        custom.author
          ? `"${custom.text}" — ${custom.author}`
          : `"${custom.text}"`,
      );
    }
  };

  // --- Google Cloud Sync Handlers & Helpers ---
  const triggerCloudBackup = async () => {
    const settings = await storage.getSyncSettings();
    if (settings.enabled) {
      try {
        const token = await googleSyncService.getAuthToken(false);
        const allData = {
          todos: await storage.getTodos(),
          notes: await storage.getNotes(),
          hifizProgress: await storage.getHifizProgress(),
          srsProgress: await storage.getSrsProgress(),
          customCategories: await storage.getCustomCategories(),
          kpssProgress: await storage.getKpssProgress(),
          customQuotes: await storage.getCustomQuotes(),
          yeterlikler: await storage.getYeterlikler(),
          kpssDailyStats: await storage.getKpssDailyStats(),
          willpowerStreak: await storage.getWillpowerStreak(),
          pomodoroHistory: await storage.getPomodoroHistory(),
          lang,
        };
        await googleSyncService.backupToDrive(token, allData);
        console.log("Cloud auto-backup completed successfully.");
      } catch (e) {
        console.error("Auto cloud backup failed:", e);
      }
    }
  };

  const syncGoogleTasks = async (token: string) => {
    setIsSyncing(true);
    try {
      const focusListId = await googleSyncService.getOrCreateTaskList(token, "Life OS - Focus");
      const routinesListId = await googleSyncService.getOrCreateTaskList(token, "Life OS - Routines");

      const remoteFocusTasks = await googleSyncService.getTasks(token, focusListId);
      const remoteRoutinesTasks = await googleSyncService.getTasks(token, routinesListId);

      const localTodos = await storage.getTodos();

      const parseDescription = (notes?: string) => {
        if (!notes) return { repeat: "none" as const };
        const match = notes.match(/\[repeat:(none|daily|weekly|monthly)\]/);
        return {
          repeat: match ? (match[1] as Todo["repeat"]) : ("none" as const),
        };
      };

      const mappedFocus: Todo[] = remoteFocusTasks.map((t: any) => ({
        id: t.id,
        text: t.title,
        completed: t.status === "completed",
        status: t.status === "completed" ? "done" : "todo",
        repeat: "none",
        category: "general",
        lastCompletedDate: t.completed || null,
        dueDate: t.due ? t.due.split("T")[0] : undefined,
      }));

      const mappedRoutines: Todo[] = remoteRoutinesTasks.map((t: any) => {
        const { repeat } = parseDescription(t.notes);
        return {
          id: t.id,
          text: t.title,
          completed: t.status === "completed",
          status: t.status === "completed" ? "done" : "todo",
          repeat: repeat === "none" ? "daily" : repeat,
          category: "general",
          lastCompletedDate: t.completed || null,
          dueDate: t.due ? t.due.split("T")[0] : undefined,
        };
      });

      const remoteTodos = [...mappedFocus, ...mappedRoutines];

      // Upload unsynced local tasks
      const unSyncedLocal = localTodos.filter((t) => !t.id);
      for (const localTodo of unSyncedLocal) {
        const isRoutine = localTodo.repeat !== "none";
        const listId = isRoutine ? routinesListId : focusListId;
        const notes = `[repeat:${localTodo.repeat}]`;
        try {
          const createdRemote = await googleSyncService.createTask(token, listId, {
            title: localTodo.text,
            notes,
            status: localTodo.completed ? "completed" : "needsAction",
            due: localTodo.dueDate ? `${localTodo.dueDate}T00:00:00.000Z` : undefined,
          });
          localTodo.id = createdRemote.id;
          remoteTodos.push(localTodo);
        } catch (err) {
          console.error("Failed to upload offline task:", err);
        }
      }

      await storage.setTodos(remoteTodos);
      setTodos(remoteTodos);
    } catch (e) {
      console.error("Google Tasks sync failed:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSyncing(true);
    try {
      const token = await googleSyncService.getAuthToken(true);
      const info = await googleSyncService.getUserInfo(token);
      setGoogleUserEmail(info.email);
      const nextSettings = {
        ...syncSettings,
        enabled: true,
        tasksEnabled: true,
        calendarEnabled: true,
        userEmail: info.email,
      };
      await storage.setSyncSettings(nextSettings);
      setSyncSettingsState(nextSettings);
      await syncGoogleTasks(token);
    } catch (e) {
      console.error("Google sign in failed:", e);
      const errMsg = e instanceof Error ? e.message : String(e);
      const detailLabel = lang === "tr" ? "Detay" : "Detail";
      showAlert(`${t.google_sync_error}\n\n[${detailLabel}]: ${errMsg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleLogout = async () => {
    setIsSyncing(true);
    try {
      const token = await googleSyncService.getAuthToken(false);
      await googleSyncService.removeCachedAuthToken(token);
    } catch (e) {
      console.warn("Cached token remove skipped:", e);
    }
    setGoogleUserEmail("");
    const nextSettings = {
      enabled: false,
      tasksEnabled: false,
      calendarEnabled: false,
      userEmail: "",
    };
    await storage.setSyncSettings(nextSettings);
    setSyncSettingsState(nextSettings);
    setIsSyncing(false);
  };

  const handleBackupToGoogleDrive = async () => {
    setIsSyncing(true);
    try {
      const token = await googleSyncService.getAuthToken(false);
      const allData = {
        todos: await storage.getTodos(),
        notes: await storage.getNotes(),
        hifizProgress: await storage.getHifizProgress(),
        srsProgress: await storage.getSrsProgress(),
        customCategories: await storage.getCustomCategories(),
        kpssProgress: await storage.getKpssProgress(),
        customQuotes: await storage.getCustomQuotes(),
        yeterlikler: await storage.getYeterlikler(),
        kpssDailyStats: await storage.getKpssDailyStats(),
        willpowerStreak: await storage.getWillpowerStreak(),
        pomodoroHistory: await storage.getPomodoroHistory(),
        lang,
      };
      await googleSyncService.backupToDrive(token, allData);
      const nextSettings = {
        ...syncSettings,
        lastSyncedBackup: Date.now(),
      };
      await storage.setSyncSettings(nextSettings);
      setSyncSettingsState(nextSettings);
      showAlert(t.google_sync_success_backup);
    } catch (e) {
      console.error("Manual backup failed:", e);
      const errMsg = e instanceof Error ? e.message : String(e);
      const detailLabel = lang === "tr" ? "Detay" : "Detail";
      showAlert(`${t.google_sync_error}\n\n[${detailLabel}]: ${errMsg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestoreFromGoogleDrive = async () => {
    setIsSyncing(true);
    try {
      const token = await googleSyncService.getAuthToken(false);
      const restored = await googleSyncService.restoreFromDrive(token);
      if (restored) {
        if (restored.todos) await storage.setTodos(restored.todos);
        if (restored.notes) await storage.setNotes(restored.notes);
        if (restored.hifizProgress) await storage.setHifizProgress(restored.hifizProgress);
        if (restored.srsProgress) await storage.setSrsProgress(restored.srsProgress);
        if (restored.customCategories) await storage.setCustomCategories(restored.customCategories);
        if (restored.kpssProgress) await storage.setKpssProgress(restored.kpssProgress);
        if (restored.customQuotes) await storage.setCustomQuotes(restored.customQuotes);
        if (restored.yeterlikler) await storage.setYeterlikler(restored.yeterlikler);
        if (restored.kpssDailyStats) await storage.setKpssDailyStats(restored.kpssDailyStats);
        if (restored.willpowerStreak) await storage.setWillpowerStreak(restored.willpowerStreak);
        if (restored.pomodoroHistory) await storage.setPomodoroHistory(restored.pomodoroHistory);
        if (restored.lang) await storage.setLang(restored.lang);

        showAlert(t.google_sync_success_restore, () => {
          window.location.reload();
        });
      } else {
        showAlert(t.google_sync_no_backup);
      }
    } catch (e) {
      console.error("Restore failed:", e);
      const errMsg = e instanceof Error ? e.message : String(e);
      const detailLabel = lang === "tr" ? "Detay" : "Detail";
      showAlert(`${t.google_sync_error}\n\n[${detailLabel}]: ${errMsg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSyncTasks = async () => {
    try {
      const token = await googleSyncService.getAuthToken(false);
      await syncGoogleTasks(token);
    } catch (e) {
      console.error("Manual task sync failed:", e);
      const errMsg = e instanceof Error ? e.message : String(e);
      const detailLabel = lang === "tr" ? "Detay" : "Detail";
      showAlert(`${t.google_sync_error}\n\n[${detailLabel}]: ${errMsg}`);
    }
  };

  const handleUpdateAIConfig = async (provider: string, key: string, model: string) => {
    setAiProvider(provider);
    setAiApiKey(key);
    setAiModel(model);
    await storage.setAIProvider(provider);
    await storage.setGeminiApiKey(key);
    await storage.setAIModel(model);
    triggerCloudBackup();
  };

  // --- Task Mutators ---
  const handleAddTodo = async (text: string, repeat: Todo["repeat"], dueDate?: string) => {
    const newTodo: Todo = {
      text,
      completed: false,
      repeat,
      status: "todo",
      category: "general",
      lastCompletedDate: "",
      dueDate: dueDate || undefined,
    };

    if (syncSettings.enabled && syncSettings.tasksEnabled) {
      try {
        const token = await googleSyncService.getAuthToken(false);
        const focusListId = await googleSyncService.getOrCreateTaskList(token, "Life OS - Focus");
        const routinesListId = await googleSyncService.getOrCreateTaskList(
          token,
          "Life OS - Routines",
        );
        const isRoutine = repeat !== "none";
        const listId = isRoutine ? routinesListId : focusListId;
        const notes = `[repeat:${repeat}]`;

        const remote = await googleSyncService.createTask(token, listId, {
          title: text,
          notes,
          status: "needsAction",
          due: dueDate ? `${dueDate}T00:00:00.000Z` : undefined,
        });
        newTodo.id = remote.id;
      } catch (err) {
        console.error("Failed to add task to Google Tasks:", err);
      }
    }

    const next = [...todos, newTodo];
    await storage.setTodos(next);
    setTodos(next);
    triggerCloudBackup();
  };

  const handleToggleTodo = async (index: number) => {
    const next = [...todos];
    const item = next[index];

    item.completed = !item.completed;
    item.status = item.completed ? "done" : "todo";

    if (item.completed) {
      const now = new Date().toISOString();
      item.lastCompletedDate = now;
      if (!item.completedDates) {
        item.completedDates = [];
      }
      item.completedDates.push(now);
    }

    if (syncSettings.enabled && syncSettings.tasksEnabled && item.id) {
      try {
        const token = await googleSyncService.getAuthToken(false);
        const focusListId = await googleSyncService.getOrCreateTaskList(token, "Life OS - Focus");
        const routinesListId = await googleSyncService.getOrCreateTaskList(
          token,
          "Life OS - Routines",
        );
        const isRoutine = item.repeat !== "none";
        const listId = isRoutine ? routinesListId : focusListId;

        await googleSyncService.updateTask(token, listId, item.id, {
          status: item.completed ? "completed" : "needsAction",
          completed: item.completed ? new Date().toISOString() : null,
        });
      } catch (err) {
        console.error("Failed to update Google Task:", err);
      }
    }

    await storage.setTodos(next);
    setTodos(next);
    triggerCloudBackup();
  };

  const handleDeleteTodo = async (index: number) => {
    const item = todos[index];
    if (syncSettings.enabled && syncSettings.tasksEnabled && item.id) {
      try {
        const token = await googleSyncService.getAuthToken(false);
        const focusListId = await googleSyncService.getOrCreateTaskList(token, "Life OS - Focus");
        const routinesListId = await googleSyncService.getOrCreateTaskList(
          token,
          "Life OS - Routines",
        );
        const isRoutine = item.repeat !== "none";
        const listId = isRoutine ? routinesListId : focusListId;

        await googleSyncService.deleteTask(token, listId, item.id);
      } catch (err) {
        console.error("Failed to delete Google Task:", err);
      }
    }

    const next = todos.filter((_, idx) => idx !== index);
    await storage.setTodos(next);
    setTodos(next);
    triggerCloudBackup();
  };

  const handleMoveTaskStatus = async (index: number, newStatus: Todo["status"]) => {
    const next = [...todos];
    moveTaskWithStatus(index, newStatus, next);
    const item = next[index];

    if (syncSettings.enabled && syncSettings.tasksEnabled && item.id) {
      try {
        const token = await googleSyncService.getAuthToken(false);
        const focusListId = await googleSyncService.getOrCreateTaskList(token, "Life OS - Focus");
        const routinesListId = await googleSyncService.getOrCreateTaskList(
          token,
          "Life OS - Routines",
        );
        const isRoutine = item.repeat !== "none";
        const listId = isRoutine ? routinesListId : focusListId;

        await googleSyncService.updateTask(token, listId, item.id, {
          status: newStatus === "done" ? "completed" : "needsAction",
          completed: newStatus === "done" ? new Date().toISOString() : null,
        });
      } catch (err) {
        console.error("Failed to move Google Task:", err);
      }
    }

    await storage.setTodos(next);
    setTodos(next);
    triggerCloudBackup();
  };

  const handleMoveTaskDirection = async (index: number, direction: number) => {
    const next = [...todos];
    const newStatus = getUpdatedStatuses(next, index, direction);
    if (newStatus) {
      moveTaskWithStatus(index, newStatus, next);
      const item = next[index];

      if (syncSettings.enabled && syncSettings.tasksEnabled && item.id) {
        try {
          const token = await googleSyncService.getAuthToken(false);
          const focusListId = await googleSyncService.getOrCreateTaskList(token, "Life OS - Focus");
          const routinesListId = await googleSyncService.getOrCreateTaskList(
            token,
            "Life OS - Routines",
          );
          const isRoutine = item.repeat !== "none";
          const listId = isRoutine ? routinesListId : focusListId;

          await googleSyncService.updateTask(token, listId, item.id, {
            status: newStatus === "done" ? "completed" : "needsAction",
            completed: newStatus === "done" ? new Date().toISOString() : null,
          });
        } catch (err) {
          console.error("Failed to move Google Task direction:", err);
        }
      }

      await storage.setTodos(next);
      setTodos(next);
      triggerCloudBackup();
    }
  };

  // --- Sidebar toggles ---
  const handleSidebarToggle = () => {
    const stateVal = !sidebarOpen;
    setSidebarOpen(stateVal);
    storage.setSidebarOpen(stateVal);
    document.body.classList.toggle("sidebar-open", stateVal);
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  // --- Settings Panel operations ---
  const handleToggleLang = async () => {
    const nextLang: Language = lang === "tr" ? "en" : "tr";
    setLang(nextLang);
    await storage.setLang(nextLang);
  };

  const handleExportBackup = async () => {
    const dataList = await storage.getTodos();
    const blob = new Blob([JSON.stringify(dataList, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zentodo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (Array.isArray(parsed)) {
          await storage.setTodos(parsed);
          setTodos(parsed);
          showAlert(translations[lang].alert_restore_success);
        } else {
          showAlert(translations[lang].alert_restore_invalid);
        }
      } catch (err) {
        console.error(err);
        const errMsg = err instanceof Error ? err.message : String(err);
        const detailLabel = lang === "tr" ? "Detay" : "Detail";
        showAlert(`${translations[lang].alert_restore_error}\n\n[${detailLabel}]: ${errMsg}`);
      }
      input.value = "";
    };
    reader.readAsText(input.files[0]);
  };

  const handleToggleFreeGamesNotifications = async () => {
    const nextVal = !freeGamesNotificationsEnabled;
    await storage.setFreeGamesNotificationsEnabled(nextVal);
    setFreeGamesNotificationsEnabled(nextVal);
  };

  const handleToggleUniversalInfoBox = async () => {
    const nextVal = !universalInfoBoxEnabled;
    await storage.setUniversalInfoBox(nextVal, universalInfoBoxHotkey);
    setUniversalInfoBoxEnabled(nextVal);
  };

  const handleUniversalInfoBoxHotkeyChange = async (hotkey: string) => {
    await storage.setUniversalInfoBox(universalInfoBoxEnabled, hotkey);
    setUniversalInfoBoxHotkey(hotkey);
  };

  const handleClearAllData = async () => {
    const confirmMsg =
      lang === "tr"
        ? "Tüm verileriniz kalıcı olarak silinecektir. Emin misiniz?"
        : "All your data will be permanently deleted. Are you sure?";

    showConfirm(confirmMsg, async () => {
      await storage.clearAll(lang);
      window.location.reload();
    });
  };

  // Render current dashboard card sub-view
  const renderActiveViewComponent = () => {
    switch (activeView) {
      case "list":
        return (
          <ListView
            todos={todos}
            activeTab={activeTab}
            lang={lang}
            onTabChange={handleTabChange}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
            googleSyncActive={syncSettings.enabled && syncSettings.tasksEnabled}
            isSyncing={isSyncing}
            onManualSync={handleManualSyncTasks}
          />
        );
      case "kanban":
        return (
          <KanbanView
            todos={todos}
            lang={lang}
            onMoveTaskStatus={handleMoveTaskStatus}
            onMoveTaskDirection={handleMoveTaskDirection}
          />
        );
      case "notes":
        return <NotesView lang={lang} onShowConfirm={showConfirm} />;
      case "pomodoro":
        return <PomodoroView lang={lang} />;
      case "willpower":
        return <WillpowerView lang={lang} onShowConfirm={showConfirm} />;
      case "hifiz":
        return <HifizView lang={lang} />;
      case "srs":
        return <SrsView lang={lang} />;
      case "calendar":
        return <CalendarView todos={todos} lang={lang} />;
      case "prayer":
        return <PrayerView lang={lang} />;
      case "kpss":
        return <KpssView lang={lang} onShowConfirm={showConfirm} />;
      case "free-games":
        return <FreeGamesView lang={lang} />;
      case "detox":
        return <DetoxView lang={lang} />;
      case "halka-arz":
        return <HalkaArzView lang={lang} />;
      case "ai-chat":
        return (
          <AIChatView
            lang={lang}
            todos={todos}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
            onManualSync={async () => {
              if (syncSettings.enabled && syncSettings.tasksEnabled) {
                try {
                  const token = await googleSyncService.getAuthToken(false);
                  await syncGoogleTasks(token);
                } catch (e) {
                  console.error(e);
                }
              }
            }}
            aiProvider={aiProvider}
            aiApiKey={aiApiKey}
            aiModel={aiModel}
            onSettingsOpen={() => setSettingsOpen(true)}
          />
        );
      default:
        return <FreeGamesView lang={lang} />;
    }
  };

  return (
    <>
      {/* Background visual overlay blur */}
      <div className="background-overlay"></div>

      {/* Sidebar Navigation */}
      <Sidebar
        lang={lang}
        activeView={activeView}
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        onViewChange={handleViewChange}
        onTabChange={(tabVal) => {
          setActiveView("list");
          handleTabChange(tabVal);
        }}
        onSidebarToggle={handleSidebarToggle}
        onSettingsOpen={() => setSettingsOpen(true)}
      />

      {/* Top Input Header (fixed positioning at the top viewport) */}
      {activeView === "list" && (
        <header className="top-header" style={{ display: "flex" }}>
          <div className="global-input-container">
            <div className="input-group">
              <input
                type="text"
                id="todo-input"
                value={todoText}
                onInput={(e) =>
                  setTodoText((e.target as HTMLInputElement).value)
                }
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    if (todoText.trim()) {
                      handleAddTodo(todoText.trim(), todoRepeat, todoDueDate);
                      setTodoText("");
                      setTodoDueDate("");
                    }
                  }
                }}
                placeholder={t.todo_placeholder}
                autocomplete="off"
              />
              <input
                type="date"
                id="todo-date-input"
                className="todo-date-input"
                value={todoDueDate}
                onChange={(e) => setTodoDueDate((e.target as HTMLInputElement).value)}
                title={lang === "tr" ? "Son Tarih" : "Due Date"}
              />
              <select
                id="repeat-select"
                className="repeat-select"
                value={todoRepeat}
                onChange={(e) => {
                  const val = (e.target as HTMLSelectElement).value as Todo["repeat"];
                  setTodoRepeat(val);
                  setActiveTab(val === "none" ? "focus" : "routines");
                }}
              >
                <option value="none">{t.repeat_none}</option>
                <option value="daily">{t.repeat_daily}</option>
                <option value="weekly">{t.repeat_weekly}</option>
                <option value="monthly">{t.repeat_monthly}</option>
              </select>
              <button
                id="add-btn"
                onClick={() => {
                  if (todoText.trim()) {
                    handleAddTodo(todoText.trim(), todoRepeat, todoDueDate);
                    setTodoText("");
                    setTodoDueDate("");
                  }
                }}
                aria-label="Add Task"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Settings Panel Drawer Modal */}
      {settingsOpen && (
        <div
          className="settings-panel active"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="settings-content"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="settings-header">
              <h2>{t.settings_title}</h2>
              <button
                className="close-btn"
                onClick={() => setSettingsOpen(false)}
              >
                &times;
              </button>
            </header>

            {/* Settings Tab Headers */}
            <div className="settings-tabs">
              <button
                className={`settings-tab-btn ${settingsTab === "general" ? "active" : ""}`}
                onClick={() => setSettingsTab("general")}
              >
                {t.settings_tab_general}
              </button>
              <button
                className={`settings-tab-btn ${settingsTab === "ai" ? "active" : ""}`}
                onClick={() => setSettingsTab("ai")}
              >
                {t.settings_tab_ai}
              </button>
              <button
                className={`settings-tab-btn ${settingsTab === "sync" ? "active" : ""}`}
                onClick={() => setSettingsTab("sync")}
              >
                {t.settings_tab_sync}
              </button>
            </div>

            {/* TAB 1: GENERAL SETTINGS */}
            {settingsTab === "general" && (
              <div className="settings-group">
                <h3>{t.settings_data_title}</h3>
                <div className="settings-actions">
                  {/* Language Switch */}
                  <button
                    className="settings-action-btn"
                    onClick={handleToggleLang}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <span>{t.change_lang}</span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontWeight: 700,
                        color: "var(--accent-color)",
                      }}
                    >
                      {lang.toUpperCase()}
                    </span>
                  </button>

                  {/* Free Games Notifications Toggle */}
                  <button
                    className="settings-action-btn"
                    onClick={handleToggleFreeGamesNotifications}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span>{t.free_games_notifications_title}</span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontWeight: 700,
                        color: freeGamesNotificationsEnabled
                          ? "var(--accent-color)"
                          : "var(--text-secondary)",
                      }}
                    >
                      {freeGamesNotificationsEnabled ? t.enabled : t.disabled}
                    </span>
                  </button>

                  {/* Universal Info Box Toggle */}
                  <button
                    className="settings-action-btn"
                    onClick={handleToggleUniversalInfoBox}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span>{t.uib_title}</span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontWeight: 700,
                        color: universalInfoBoxEnabled
                          ? "var(--accent-color)"
                          : "var(--text-secondary)",
                      }}
                    >
                      {universalInfoBoxEnabled ? t.enabled : t.disabled}
                    </span>
                  </button>

                  {/* Universal Info Box Hotkey Selection */}
                  {universalInfoBoxEnabled && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 12px",
                        background: "rgba(255, 255, 255, 0.03)",
                        borderRadius: "6px",
                        margin: "2px 0 6px 0",
                      }}
                    >
                      <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                        {t.uib_hotkey}:
                      </span>
                      <select
                        value={universalInfoBoxHotkey}
                        onChange={(e) =>
                          handleUniversalInfoBoxHotkeyChange(
                            (e.target as HTMLSelectElement).value,
                          )
                        }
                        style={{
                          marginLeft: "auto",
                          background: "#1e1e24",
                          color: "#f1f5f9",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          fontSize: "0.85rem",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        <option
                          style={{ background: "#1e1e24", color: "#f1f5f9" }}
                          value="none"
                        >
                          {t.uib_hotkey_none}
                        </option>
                        <option
                          style={{ background: "#1e1e24", color: "#f1f5f9" }}
                          value="alt"
                        >
                          {t.uib_hotkey_alt}
                        </option>
                        <option
                          style={{ background: "#1e1e24", color: "#f1f5f9" }}
                          value="ctrl"
                        >
                          {t.uib_hotkey_ctrl}
                        </option>
                        <option
                          style={{ background: "#1e1e24", color: "#f1f5f9" }}
                          value="shift"
                        >
                          {t.uib_hotkey_shift}
                        </option>
                      </select>
                    </div>
                  )}

                  {/* Export Backup */}
                  <button
                    className="settings-action-btn"
                    onClick={handleExportBackup}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>{t.backup}</span>
                  </button>

                  {/* Import Backup */}
                  <label
                    className="settings-action-btn"
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span style={{ flex: 1 }}>{t.restore}</span>
                    <input
                      type="file"
                      accept=".json"
                      style={{ display: "none" }}
                      onChange={handleImportBackup}
                    />
                  </label>

                  {/* Delete / Reset All */}
                  <button
                    className="settings-action-btn danger"
                    onClick={handleClearAllData}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>{t.clear_all}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: AI ASSISTANT SETTINGS */}
            {settingsTab === "ai" && (
              <div className="settings-group">
                <h3>{t.settings_ai_title}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>{t.settings_ai_provider}:</label>
                    <select
                      value={aiProvider}
                      onChange={(e) => handleUpdateAIConfig((e.target as HTMLSelectElement).value, aiApiKey, aiModel)}
                      style={{
                        background: "#1e1e24",
                        color: "#f1f5f9",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        fontSize: "0.85rem",
                        outline: "none",
                        cursor: "pointer"
                      }}
                    >
                      <option value="gemini">Gemini API</option>
                      <option value="openrouter">OpenRouter API</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>{t.settings_ai_key}:</label>
                    <input
                      type="password"
                      value={aiApiKey}
                      placeholder="sk-or-v1-... veya AIzaSy..."
                      onInput={(e) => handleUpdateAIConfig(aiProvider, (e.target as HTMLInputElement).value, aiModel)}
                      style={{
                        background: "rgba(0, 0, 0, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        color: "#f1f5f9",
                        fontSize: "0.85rem",
                        outline: "none"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>{t.settings_ai_model}:</label>
                    <input
                      type="text"
                      value={aiModel}
                      placeholder={aiProvider === "openrouter" ? "google/gemini-2.5-flash" : "gemini-1.5-flash"}
                      onInput={(e) => handleUpdateAIConfig(aiProvider, aiApiKey, (e.target as HTMLInputElement).value)}
                      style={{
                        background: "rgba(0, 0, 0, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        color: "#f1f5f9",
                        fontSize: "0.85rem",
                        outline: "none"
                      }}
                    />
                    <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", opacity: 0.6 }}>
                      {t.settings_ai_model_desc}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: GOOGLE CLOUD SYNC SETTINGS */}
            {settingsTab === "sync" && (
              <div className="settings-group">
                <h3>{t.google_sync_title}</h3>
                <div className="google-sync-card">
                  {!googleUserEmail ? (
                    <button className="google-sync-btn primary" onClick={handleGoogleLogin} disabled={isSyncing}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                      {t.google_sync_btn_login}
                    </button>
                  ) : (
                    <>
                      <div className="google-account-info">
                        <div className="google-user-details">
                          <span className="google-user-label">{t.google_sync_connected_as}</span>
                          <span className="google-user-email">{googleUserEmail}</span>
                        </div>
                        <button className="google-sync-btn danger" onClick={handleGoogleLogout} disabled={isSyncing} style={{ width: "auto", minWidth: "0" }}>
                          {t.google_sync_btn_logout}
                        </button>
                      </div>

                      <div className="google-sync-status-indicator" style={{ marginTop: "8px" }}>
                        <span className={`sync-dot ${isSyncing ? "syncing" : "synced"}`}></span>
                        <span>
                          {isSyncing ? (lang === "tr" ? "Senkronize ediliyor..." : "Syncing...") : t.google_sync_status_synced}
                        </span>
                      </div>

                      {syncSettings.lastSyncedBackup && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                          {t.google_sync_last_synced} {new Date(syncSettings.lastSyncedBackup).toLocaleString(lang === "tr" ? "tr-TR" : "en-US")}
                        </div>
                      )}

                      <div className="google-sync-actions" style={{ marginTop: "12px" }}>
                        <button className="google-sync-btn" onClick={handleBackupToGoogleDrive} disabled={isSyncing}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          {t.google_sync_backup_now}
                        </button>
                        <button className="google-sync-btn" onClick={handleRestoreFromGoogleDrive} disabled={isSyncing}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          {t.google_sync_restore_now}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Card Viewport Container */}
      <main id="container" className="container">
        {activeView === "free-games" && (
          <header className="hero">
            <div id="clock" className="clock">
              {clockText}
            </div>
            <div id="date" className="date">
              {dateText}
            </div>
          </header>
        )}

        {renderActiveViewComponent()}

        {/* Global Footer Quote Section */}
        {quoteText && (
          <footer className="footer-quote" style={{ marginTop: "30px" }}>
            <p
              id="quote"
              className="quote-text"
              style={{
                fontStyle: "italic",
                textAlign: "center",
                opacity: 0.85,
                fontSize: "0.95rem",
              }}
            >
              {quoteText}
            </p>
          </footer>
        )}
      </main>

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        lang={lang}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }
      />

      <ConfirmModal
        isOpen={alertDialog.isOpen}
        message={alertDialog.message}
        lang={lang}
        onConfirm={() => {
          if (alertDialog.onConfirm) {
            alertDialog.onConfirm();
          }
          setAlertDialog({ isOpen: false, message: "" });
        }}
        isAlert={true}
      />
    </>
  );
}

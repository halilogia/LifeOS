import { useState, useEffect } from "preact/hooks";
import { storage, GoogleSyncSettings } from "./core/storage.js";
import { googleSyncService } from "./services/googleSyncService.js";
import { useTodos } from "./presentation/hooks/useTodos.js";
import { translations } from "./utils/i18n.js";
import { Language, Todo } from "./types/types.js";

import { Sidebar } from "./components/Sidebar.js";
import { ListView } from "./components/ListView.js";
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
import { EisenhowerView } from "@/components/EisenhowerView.js";
import { SettingsDrawer } from "@/components/SettingsDrawer.js";
import { HeroHeader } from "@/components/HeroHeader.js";
import { FooterQuote } from "@/components/FooterQuote.js";
import { DatePicker } from "@/components/DatePicker.js";

export function App() {
  // Navigation & UI States
  const [lang, setLang] = useState<Language>("tr");
  const [activeView, setActiveView] = useState<string>("free-games");
  const [sidebarOrder, setSidebarOrder] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"focus" | "routines">("focus");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<"general" | "kpss" | "detox" | "ai" | "sync">("general");

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

  // Calendar tasks due today notification toggle
  const [calendarNotificationsEnabled, setCalendarNotificationsEnabled] =
    useState(true);

  // Pomodoro focus blocking toggle
  const [pomoBlockEnabled, setPomoBlockEnabled] = useState(true);

  // AI Assistant States
  const [aiProvider, setAiProvider] = useState<string>("openrouter");
  const [aiApiKey, setAiApiKey] = useState<string>("");
  const [aiModel, setAiModel] = useState<string>("free");
  const [aiEndpoint, setAiEndpoint] = useState<string>("http://localhost:20128/v1");
  const [aiShowThinking, setAiShowThinking] = useState<boolean>(true);

  // Universal Info Box / Inline Translation Bubble states
  const [universalInfoBoxEnabled, setUniversalInfoBoxEnabled] = useState(true);
  const [universalInfoBoxHotkey, setUniversalInfoBoxHotkey] = useState("none");

  const [kpssGoalType, setKpssGoalType] = useState<"net" | "score">("net");
  const [kpssTargetNet, setKpssTargetNet] = useState<number>(80);
  const [kpssTargetScore, setKpssTargetScore] = useState<number>(80);

  // Detox Limits States
  const [detoxLimits, setDetoxLimits] = useState<Record<string, number>>({});

  // Custom confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: "",
    onConfirm: () => { },
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

      const savedOrder = await storage.getSidebarOrder();
      setSidebarOrder(savedOrder || []);
      if (savedOrder && savedOrder.length > 0) {
        setActiveView(savedOrder[0]);
      } else {
        setActiveView("free-games");
      }

      setSidebarOpen(config.sidebarOpen ?? true);
      setFreeGamesNotificationsEnabled(
        config.freeGamesNotificationsEnabled ?? true,
      );
      setCalendarNotificationsEnabled(
        config.calendarNotificationsEnabled ?? true,
      );
      setPomoBlockEnabled(
        config.pomoBlockEnabled ?? true,
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
      const endpoint = await storage.getAIEndpoint();
      const showThinking = await storage.getAIShowThinking();
      setAiProvider(provider);
      setAiApiKey(key);
      setAiModel(model);
      setAiEndpoint(endpoint);
      setAiShowThinking(showThinking);

      // Load KPSS configurations
      const kGoalType = await storage.getKpssGoalType();
      const kTargetNet = await storage.getKpssTargetNet();
      const kTargetScore = await storage.getKpssTargetScore();
      setKpssGoalType(kGoalType);
      setKpssTargetNet(kTargetNet);
      setKpssTargetScore(kTargetScore);

      // Load Detox Limits configurations
      const dLimits = await storage.getDetoxLimits();
      setDetoxLimits(dLimits);

      // Apply body class for legacy CSS compatibilities
      document.body.classList.toggle(
        "sidebar-open",
        config.sidebarOpen ?? true,
      );

      // 3. Load and clean task items (Offline/Local first)
      await initTodos();

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
  const handleKpssGoalTypeChange = async (type: "net" | "score") => {
    setKpssGoalType(type);
    await storage.setKpssGoalType(type);
  };

  const handleKpssTargetNetChange = async (val: number) => {
    if (isNaN(val) || val < 0 || val > 120) return;
    setKpssTargetNet(val);
    await storage.setKpssTargetNet(val);
  };

  const handleKpssTargetScoreChange = async (val: number) => {
    if (isNaN(val) || val < 0 || val > 100) return;
    setKpssTargetScore(val);
    await storage.setKpssTargetScore(val);
  };

  const handleDetoxLimitsChange = async (limits: Record<string, number>) => {
    setDetoxLimits(limits);
    await storage.setDetoxLimits(limits);
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
          kpssSrsProgress: await storage.getKpssSrsProgress(),
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
        kpssSrsProgress: await storage.getKpssSrsProgress(),
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
        if (restored.kpssSrsProgress) await storage.setKpssSrsProgress(restored.kpssSrsProgress);
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

  const handleUpdateAIConfig = async (provider: string, key: string, model: string, endpoint?: string) => {
    const epVal = endpoint || "";
    setAiProvider(provider);
    setAiApiKey(key);
    setAiModel(model);
    setAiEndpoint(epVal);
    await storage.setAIProvider(provider);
    await storage.setGeminiApiKey(key);
    await storage.setAIModel(model);
    await storage.setAIEndpoint(epVal);
    triggerCloudBackup();
  };

  const handleUpdateAIShowThinking = async (val: boolean) => {
    setAiShowThinking(val);
    await storage.setAIShowThinking(val);
    triggerCloudBackup();
  };

  // useTodos Hook – manages todo state, CRUD, and Google Tasks sync
  const {
    todos,
    setTodos,
    initTodos,
    handleAddTodo,
    handleToggleTodo,
    handleDeleteTodo,
    handleMoveTaskStatus,
    handleMoveTaskDirection,
    handleUpdateTodoUrgentImportant,
    handleExportBackup,
    handleImportBackup,
  } = useTodos(syncSettings, triggerCloudBackup, showAlert, t);

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

  const handleToggleFreeGamesNotifications = async () => {
    const nextVal = !freeGamesNotificationsEnabled;
    await storage.setFreeGamesNotificationsEnabled(nextVal);
    setFreeGamesNotificationsEnabled(nextVal);
  };

  const handleToggleCalendarNotifications = async () => {
    const nextVal = !calendarNotificationsEnabled;
    await storage.setCalendarNotificationsEnabled(nextVal);
    setCalendarNotificationsEnabled(nextVal);
  };

  const handleTogglePomoBlock = async () => {
    const nextVal = !pomoBlockEnabled;
    await storage.setPomoBlockEnabled(nextVal);
    setPomoBlockEnabled(nextVal);
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

  const handleOpenSettings = (tab: "general" | "kpss" | "detox" | "ai" | "sync" = "general") => {
    setSettingsInitialTab(tab);
    setSettingsOpen(true);
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
          <EisenhowerView
            todos={todos as any}
            lang={lang}
            defaultTab="kanban"
            onUpdateTodoUrgentImportant={handleUpdateTodoUrgentImportant}
            onMoveTaskStatus={handleMoveTaskStatus as any}
            onMoveTaskDirection={handleMoveTaskDirection as any}
          />
        );
      case "eisenhower":
        return (
          <EisenhowerView
            todos={todos as any}
            lang={lang}
            defaultTab="kanban"
            onUpdateTodoUrgentImportant={handleUpdateTodoUrgentImportant}
            onMoveTaskStatus={handleMoveTaskStatus as any}
            onMoveTaskDirection={handleMoveTaskDirection as any}
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
        return (
          <KpssView
            lang={lang}
            onShowConfirm={showConfirm}
            aiProvider={aiProvider}
            aiApiKey={aiApiKey}
            aiModel={aiModel}
            aiEndpoint={aiEndpoint}
            goalType={kpssGoalType}
            targetNet={kpssTargetNet}
            targetScore={kpssTargetScore}
          />
        );
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
            aiEndpoint={aiEndpoint}
            aiShowThinking={aiShowThinking}
            onSettingsOpen={() => handleOpenSettings("ai")}
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
        onSettingsOpen={() => handleOpenSettings("general")}
        onOrderChange={(newOrder) => setSidebarOrder(newOrder)}
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
              <DatePicker
                value={todoDueDate}
                onChange={setTodoDueDate}
                lang={lang}
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
      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialTab={settingsInitialTab}
        lang={lang}
        onToggleLang={handleToggleLang}
        freeGamesNotificationsEnabled={freeGamesNotificationsEnabled}
        onToggleFreeGamesNotifications={handleToggleFreeGamesNotifications}
        calendarNotificationsEnabled={calendarNotificationsEnabled}
        onToggleCalendarNotifications={handleToggleCalendarNotifications}
        pomoBlockEnabled={pomoBlockEnabled}
        onTogglePomoBlock={handleTogglePomoBlock}
        universalInfoBoxEnabled={universalInfoBoxEnabled}
        onToggleUniversalInfoBox={handleToggleUniversalInfoBox}
        universalInfoBoxHotkey={universalInfoBoxHotkey}
        onUniversalInfoBoxHotkeyChange={handleUniversalInfoBoxHotkeyChange}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onClearAllData={handleClearAllData}
        aiProvider={aiProvider}
        aiApiKey={aiApiKey}
        aiModel={aiModel}
        aiEndpoint={aiEndpoint}
        onUpdateAIConfig={handleUpdateAIConfig}
        aiShowThinking={aiShowThinking}
        onUpdateAIShowThinking={handleUpdateAIShowThinking}
        googleUserEmail={googleUserEmail}
        isSyncing={isSyncing}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
        syncSettings={syncSettings}
        onBackupToGoogleDrive={handleBackupToGoogleDrive}
        onRestoreFromGoogleDrive={handleRestoreFromGoogleDrive}
        kpssGoalType={kpssGoalType}
        kpssTargetNet={kpssTargetNet}
        kpssTargetScore={kpssTargetScore}
        onKpssGoalTypeChange={handleKpssGoalTypeChange}
        onKpssTargetNetChange={handleKpssTargetNetChange}
        onKpssTargetScoreChange={handleKpssTargetScoreChange}
        detoxLimits={detoxLimits}
        onDetoxLimitsChange={handleDetoxLimitsChange}
      />

      {/* Main Card Viewport Container */}
      <main id="container" className="container">
        {sidebarOrder.length > 0 && activeView === sidebarOrder[0] && (
          <HeroHeader clockText={clockText} dateText={dateText} />
        )}

        {renderActiveViewComponent()}

        {quoteText && activeView !== "ai-chat" && (
          <FooterQuote quoteText={quoteText} />
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

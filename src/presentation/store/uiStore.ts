/**
 * useUI store
 * Zustand singleton — global UI state (navigation, tab, modals, clock/quote, sync-status).
 * Owns sidebarOrder persistence, quote/clock refresh, confirm/alert dialogs.
 * Hook file stays as a facade; consumer components are untouched.
 */

import { create } from "zustand";
import type { Language } from "@/domain/value-objects/Language.js";
import { translations } from "@/utils/i18n.js";
import type { CustomQuote } from "@/types/types.js";
import type { GoogleSyncSettings } from "@/domain/repositories/ISyncRepository.js";

const SIDEBAR_ORDER_KEY = "sidebarOrder";

type SettingsTab = "general" | "kpss" | "detox" | "ai" | "sync";

interface ConfirmDialogState {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
}
interface AlertDialogState {
  isOpen: boolean;
  message: string;
  onConfirm?: () => void;
}

interface UIState {
  // Navigation
  activeView: string;
  sidebarOrder: string[];
  activeTab: "focus" | "routines";
  settingsOpen: boolean;
  settingsInitialTab: SettingsTab;
  // Sync status
  googleUserEmail: string;
  isSyncing: boolean;
  syncSettings: GoogleSyncSettings;
  // Time & Date & Quote
  clockText: string;
  dateText: string;
  quoteText: string;
  // Dialogs
  confirmDialog: ConfirmDialogState;
  alertDialog: AlertDialogState;

  // Actions
  setActiveView: (v: string) => void;
  setSidebarOrder: (o: string[]) => void;
  setActiveTab: (t: "focus" | "routines") => void;
  setSettingsOpen: (o: boolean) => void;
  setSettingsInitialTab: (t: SettingsTab) => void;
  setGoogleUserEmail: (e: string) => void;
  setIsSyncing: (v: boolean) => void;
  setSyncSettings: (s: GoogleSyncSettings) => void;
  setConfirmDialog: (d: ConfirmDialogState | ((prev: ConfirmDialogState) => ConfirmDialogState)) => void;
  setAlertDialog: (d: AlertDialogState | ((prev: AlertDialogState) => AlertDialogState)) => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
  showAlert: (message: string, onConfirm?: () => void) => void;
  refreshClock: (lang: Language) => void;
  refreshQuote: (activeLang: Language) => Promise<void>;
  handleViewChange: (view: string) => void;
  handleTabChange: (tabVal: "focus" | "routines") => void;
  handleTabChangeUI: (tabVal: "focus" | "routines") => void;
  handleOpenSettings: (tab?: SettingsTab) => void;
  loadSidebarOrder: () => Promise<void>;
}

export const useUIStore = create<UIState>()((set) => ({
  // Navigation
  activeView: "free-games",
  sidebarOrder: [],
  activeTab: "focus",
  settingsOpen: false,
  settingsInitialTab: "general",
  // Sync status
  googleUserEmail: "",
  isSyncing: false,
  syncSettings: { enabled: false, tasksEnabled: false, calendarEnabled: false },
  // Time & Date
  clockText: "00:00",
  dateText: "",
  // Quotes
  quoteText: "",
  // Dialogs
  confirmDialog: { isOpen: false, message: "", onConfirm: () => {} },
  alertDialog: { isOpen: false, message: "" },

  // --- Actions ---
  setActiveView: (v) => set({ activeView: v }),
  setSidebarOrder: (o) => set({ sidebarOrder: o }),
  setActiveTab: (t) => set({ activeTab: t }),
  setSettingsOpen: (o) => set({ settingsOpen: o }),
  setSettingsInitialTab: (t) => set({ settingsInitialTab: t }),
  setGoogleUserEmail: (e) => set({ googleUserEmail: e }),
  setIsSyncing: (v) => set({ isSyncing: v }),
  setSyncSettings: (s) => set({ syncSettings: s }),
  setConfirmDialog: (d) =>
    set((prev) => ({
      confirmDialog:
        typeof d === "function" ? d(prev.confirmDialog) : d,
    })),
  setAlertDialog: (d) =>
    set((prev) => ({
      alertDialog: typeof d === "function" ? d(prev.alertDialog) : d,
    })),

  showConfirm: (message, onConfirm) => {
    set({
      confirmDialog: {
        isOpen: true,
        message,
        onConfirm: () => {
          onConfirm();
          set((prev) => ({
            confirmDialog: { ...prev.confirmDialog, isOpen: false },
          }));
        },
      },
    });
  },

  showAlert: (message, onConfirm) => {
    set({ alertDialog: { isOpen: true, message, onConfirm } });
  },

  refreshClock: (lang) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const locale = lang === "tr" ? "tr-TR" : "en-US";
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    set({
      clockText: `${hours}:${minutes}`,
      dateText: now.toLocaleDateString(locale, options),
    });
  },

  refreshQuote: async (activeLang) => {
    const customQuotes: CustomQuote[] = await new Promise((resolve) => {
      chrome.storage.local.get(["customQuotes"], (result) => {
        resolve((result.customQuotes as CustomQuote[]) || []);
      });
    });
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
      set({ quoteText: translations[activeLang][randomKey] });
    } else {
      const custom = customQuotes[randomIndex - defaultQuoteCount];
      set({
        quoteText: custom.author
          ? `"${custom.text}" — ${custom.author}`
          : `"${custom.text}"`,
      });
    }
  },

  handleViewChange: (view) => set({ activeView: view }),

  handleTabChange: (tabVal) => set({ activeTab: tabVal }),

  handleTabChangeUI: (tabVal) => set({ activeTab: tabVal }),

  handleOpenSettings: (section = "general") =>
    set({ settingsInitialTab: section, settingsOpen: true }),

  loadSidebarOrder: async () => {
    const savedOrder: string[] = await new Promise((resolve) => {
      chrome.storage.local.get([SIDEBAR_ORDER_KEY], (result) => {
        resolve((result[SIDEBAR_ORDER_KEY] as string[]) || []);
      });
    });
    set({ sidebarOrder: savedOrder || [] });
    if (savedOrder && savedOrder.length > 0) {
      set({ activeView: savedOrder[0] });
    } else {
      set({ activeView: "free-games" });
    }
  },
}));
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
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";
import { DEFAULT_SIDEBAR_ORDER } from "@/domain/constants/sidebarConstants.js";
import { getDefaultQuotesForLang } from "@/domain/constants/quoteConstants.js";
import { useSidebarUsageStore } from "@/presentation/store/sidebarUsageStore.js";

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
  // Sidebar auto-sort (kullanım sıklığına göre)
  autoSortEnabled: boolean;
  suppressAutoSort: boolean;
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
  persistSidebarOrder: (o: string[]) => void;
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
  setAutoSortEnabled: (enabled: boolean) => Promise<void>;
  applySortedOrder: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  // Navigation
  activeView: "free-games",
  sidebarOrder: [],
  activeTab: "focus",
  settingsOpen: false,
  settingsInitialTab: "general",
  autoSortEnabled: true,
  suppressAutoSort: false,
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
  persistSidebarOrder: (o) => {
    set({ sidebarOrder: o });
    chrome.storage.local.set({ [SIDEBAR_ORDER_KEY]: o });
    scheduleCloudBackup();
  },
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
    const defaults = getDefaultQuotesForLang(activeLang);
    const pool = [...customQuotes, ...defaults];
    if (pool.length === 0) {
      set({ quoteText: "" });
      return;
    }
    const randomIndex = Math.floor(Math.random() * pool.length);
    const selected = pool[randomIndex];
    set({
      quoteText: selected.author
        ? `"${selected.text}" — ${selected.author}`
        : `"${selected.text}"`,
    });
  },

  handleViewChange: (view) => {
    set({ activeView: view });
    // Kullanım istatistiği güncelle + auto-sort açıksa yeniden sırala
    const usage = useSidebarUsageStore.getState();
    usage.increment(view);
    const ui = useUIStore.getState();
    if (ui.autoSortEnabled && !ui.suppressAutoSort) {
      ui.applySortedOrder();
    }
  },

  handleTabChange: (tabVal) => set({ activeTab: tabVal }),

  handleTabChangeUI: (tabVal) => set({ activeTab: tabVal }),

  handleOpenSettings: (section = "general") =>
    set({ settingsInitialTab: section, settingsOpen: true }),

  setAutoSortEnabled: async (enabled) => {
    set({ autoSortEnabled: enabled });
    // Tek doğruluk kaynağı sidebarUsageStore (sidebarAutoSort key'ine persist eder)
    await useSidebarUsageStore.getState().setAutoSort(enabled);
    // Açılınca anında yeniden sırala; kapanınca kullanıcının mevcut sırası korunur
    if (enabled) {
      useUIStore.getState().applySortedOrder();
    }
  },

  applySortedOrder: () => {
    const usage = useSidebarUsageStore.getState();
    const sorted = usage.computeSortedOrder();
    const current = useUIStore.getState().sidebarOrder;
    // Sıra gerçekten değişti mi? Değişmediyse yazma (gereksiz re-render yok)
    if (
      sorted.length === current.length &&
      sorted.every((v, i) => v === current[i])
    ) {
      return;
    }
    useUIStore.setState({ sidebarOrder: sorted });
    chrome.storage.local.set({ [SIDEBAR_ORDER_KEY]: sorted });
  },

  loadSidebarOrder: async () => {
    const savedOrder: string[] = await new Promise((resolve) => {
      chrome.storage.local.get([SIDEBAR_ORDER_KEY], (result) => {
        const data = result[SIDEBAR_ORDER_KEY];
        resolve(Array.isArray(data) ? data : []);
      });
    });
    let orderToUse: string[];
    if (savedOrder && savedOrder.length > 0) {
      // Migration: yeni eklenen view key'leri (örn. "rss") saved order'da yoksa,
      // DEFAULT_SIDEBAR_ORDER'daki pozisyonlarına ekle. Kullanıcının sırası korunur.
      const known = new Set(savedOrder);
      const missing = DEFAULT_SIDEBAR_ORDER.filter((k) => !known.has(k));
      if (missing.length > 0) {
        orderToUse = [...savedOrder];
        for (const key of DEFAULT_SIDEBAR_ORDER) {
          if (missing.includes(key)) {
            // DEFAULT listesindeki index'e göre sıralı ekle (kullanıcı sırasını bozmadan)
            const insertIdx = Math.min(orderToUse.length, DEFAULT_SIDEBAR_ORDER.indexOf(key));
            orderToUse.splice(insertIdx, 0, key);
          }
        }
        // Kaydet ki bir sonraki açılışta migration tekrar çalışmasın
        chrome.storage.local.set({ [SIDEBAR_ORDER_KEY]: orderToUse });
      } else {
        orderToUse = savedOrder;
      }
    } else {
      orderToUse = DEFAULT_SIDEBAR_ORDER;
    }
    set({ sidebarOrder: orderToUse });
    if (orderToUse && orderToUse.length > 0) {
      set({ activeView: orderToUse[0] });
    } else {
      set({ activeView: "free-games" });
    }

    // autoSortEnabled'i kalıcı kaynaktan (sidebarUsageStore) hidrasyonla yükle.
    // Böylece refresh sonrası kullanıcının kapattığı auto-sort kapanık kalır.
    const usage = useSidebarUsageStore.getState();
    set({ autoSortEnabled: usage.autoSort });
  },
}));
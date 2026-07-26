/**
 * useUI Hook
 * Presentation hook that wraps UI-related state (navigation, clock, quotes, dialogs).
 * Uses chrome.storage.sync directly instead of legacy core/storage.
 */

import { useState, useCallback } from "preact/hooks";
import type { Language } from "../../domain/value-objects/Language.js";
import { translations } from "../../utils/i18n.js";
import type { CustomQuote } from "../../types/types.js";

const SIDEBAR_ORDER_KEY = "sidebarOrder";

export function useUI() {
  // Navigation
  const [activeView, setActiveView] = useState<string>("free-games");
  const [sidebarOrder, setSidebarOrder] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"focus" | "routines">("focus");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<
    "general" | "kpss" | "detox" | "ai" | "sync"
  >("general");

  // Time & Date
  const [clockText, setClockText] = useState("00:00");
  const [dateText, setDateText] = useState("");

  // Quotes
  const [quoteText, setQuoteText] = useState("");

  // Confirm Dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: "",
    onConfirm: () => {},
  });

  // Alert Dialog
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    message: "",
  });

  const showConfirm = useCallback((message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  }, []);

  const showAlert = useCallback((message: string, onConfirm?: () => void) => {
    setAlertDialog({
      isOpen: true,
      message,
      onConfirm,
    });
  }, []);

  const refreshClock = useCallback((lang: Language) => {
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
  }, []);

  const refreshQuote = useCallback(async (activeLang: Language) => {
    const customQuotes: CustomQuote[] = await new Promise((resolve) => {
      chrome.storage.sync.get(["customQuotes"], (result) => {
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
      setQuoteText(translations[activeLang][randomKey]);
    } else {
      const custom = customQuotes[randomIndex - defaultQuoteCount];
      setQuoteText(
        custom.author
          ? `"${custom.text}" — ${custom.author}`
          : `"${custom.text}"`,
      );
    }
  }, []);

  const handleViewChange = useCallback((view: string) => {
    setActiveView(view);
  }, []);

  const handleTabChange = useCallback((tabVal: "focus" | "routines") => {
    setActiveTab(tabVal);
  }, []);

  const handleOpenSettings = useCallback(
    (tab: "general" | "kpss" | "detox" | "ai" | "sync" = "general") => {
      setSettingsInitialTab(tab);
      setSettingsOpen(true);
    },
    [],
  );

  const loadSidebarOrder = useCallback(async () => {
    const savedOrder: string[] = await new Promise((resolve) => {
      chrome.storage.sync.get([SIDEBAR_ORDER_KEY], (result) => {
        resolve((result[SIDEBAR_ORDER_KEY] as string[]) || []);
      });
    });
    setSidebarOrder(savedOrder || []);
    if (savedOrder && savedOrder.length > 0) {
      setActiveView(savedOrder[0]);
    } else {
      setActiveView("free-games");
    }
  }, []);

  return {
    // Navigation
    activeView,
    setActiveView,
    sidebarOrder,
    setSidebarOrder,
    activeTab,
    setActiveTab,
    settingsOpen,
    setSettingsOpen,
    settingsInitialTab,
    // Time & Date
    clockText,
    dateText,
    // Quotes
    quoteText,
    // Dialogs
    confirmDialog,
    setConfirmDialog,
    alertDialog,
    setAlertDialog,
    // Actions
    showConfirm,
    showAlert,
    refreshClock,
    refreshQuote,
    handleViewChange,
    handleTabChange,
    handleOpenSettings,
    loadSidebarOrder,
  };
}

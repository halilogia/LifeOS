import { useCallback, useEffect } from "preact/hooks";
import { useUIStore } from "@/presentation/store/uiStore.js";

const DEFAULT_ORDER = [
  "list",
  "eisenhower",
  "notes",
  "pomodoro",
  "willpower",
  "hifiz",
  "srs",
  "calendar",
  "prayer",
  "kpss",
  "free-games",
  "arcade",
  "detox",
  "bist",
  "halka-arz",
  "ai-chat",
];

/**
 * Facade over uiStore.sidebarOrder — UI-only state, no chrome.storage here.
 * uiStore owns persistence (loadSidebarOrder). Merge with DEFAULT_ORDER
 * (new views appended when missing) happens here once on mount.
 */
export function useSidebarOrder() {
  const order = useUIStore((s) => s.sidebarOrder);
  const setOrder = useUIStore((s) => s.setSidebarOrder);

  // Merge DEFAULT_ORDER with saved order: saved order first, missing keys appended.
  useEffect(() => {
    if (order.length === 0) {
      return; // still loading (uiStore initial [] )
    }
    const filtered = order.filter((k) => DEFAULT_ORDER.includes(k));
    const missing = DEFAULT_ORDER.filter((k) => !filtered.includes(k));
    if (filtered.length !== order.length || missing.length > 0) {
      setOrder([...filtered, ...missing]);
    }
  }, [order, setOrder]);

  const saveOrder = useCallback(
    (nextOrder: string[]) => {
      useUIStore.getState().persistSidebarOrder(nextOrder);
    },
    [],
  );

  return { order, setOrder, saveOrder };
}

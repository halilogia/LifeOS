import { useCallback, useEffect } from "preact/hooks";
import { useUIStore } from "@/presentation/store/uiStore.js";
import { DEFAULT_SIDEBAR_ORDER } from "@/domain/constants/sidebarConstants.js";

/**
 * Facade over uiStore.sidebarOrder — UI-only state, no chrome.storage here.
 * uiStore owns persistence (loadSidebarOrder). Merge with DEFAULT_SIDEBAR_ORDER
 * (new views appended when missing) happens here once on mount.
 */
export function useSidebarOrder() {
  const order = useUIStore((s) => s.sidebarOrder);
  const setOrder = useUIStore((s) => s.setSidebarOrder);

  // Merge DEFAULT_SIDEBAR_ORDER with saved order: saved order first, missing keys appended.
  useEffect(() => {
    if (order.length === 0) {
      setOrder(DEFAULT_SIDEBAR_ORDER);
      return;
    }
    const filtered = order.filter((k) => DEFAULT_SIDEBAR_ORDER.includes(k));
    const missing = DEFAULT_SIDEBAR_ORDER.filter((k) => !filtered.includes(k));
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

import { useState, useEffect, useCallback } from "preact/hooks";

export function useKpssWikiSidebar() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    void (async () => {
      const result = await chrome.storage.local.get("kpssWikiSidebarCollapsed");
      if (result.kpssWikiSidebarCollapsed !== undefined) {
        setSidebarCollapsed(Boolean(result.kpssWikiSidebarCollapsed));
      }
    })();
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      void chrome.storage.local.set({ kpssWikiSidebarCollapsed: next });
      return next;
    });
  }, []);

  return { sidebarCollapsed, toggleSidebar };
}

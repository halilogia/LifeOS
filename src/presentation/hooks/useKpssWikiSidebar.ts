import { useState, useEffect, useCallback } from "preact/hooks";

export function useKpssWikiSidebar() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    void (async () => {
      const result = await chrome.storage.sync.get("kpssWikiSidebarCollapsed");
      if (result.kpssWikiSidebarCollapsed !== undefined) {
        setSidebarCollapsed(Boolean(result.kpssWikiSidebarCollapsed));
      }
    })();
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      void chrome.storage.sync.set({ kpssWikiSidebarCollapsed: next });
      return next;
    });
  }, []);

  return { sidebarCollapsed, toggleSidebar };
}

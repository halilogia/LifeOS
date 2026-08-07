/**
 * useKpssWikiSidebar — facade over the Zustand singleton store.
 * Signature unchanged; consumer components untouched.
 */

import {
  useKpssWikiSidebarState,
} from "@/presentation/store/kpssWikiSidebarStore.js";

export function useKpssWikiSidebar() {
  const sidebarCollapsed = useKpssWikiSidebarState(
    (s) => s.sidebarCollapsed,
  );
  const toggleSidebar = useKpssWikiSidebarState((s) => s.toggleSidebar);
  return { sidebarCollapsed, toggleSidebar };
}
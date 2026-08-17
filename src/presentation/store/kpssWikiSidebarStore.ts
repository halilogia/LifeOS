/**
 * useKpssWikiSidebar store
 * Zustand singleton — KPSS wiki sidebar collapse state, persisted to chrome.storage.local.
 * Hook file stays as a facade; consumer components are untouched.
 */

import { create } from "zustand";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

const STORAGE_KEY = "kpssWikiSidebarCollapsed";

interface KpssWikiSidebarState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
}

export const useKpssWikiSidebarState = create<KpssWikiSidebarState>()(
  (set) => ({
    sidebarCollapsed: true,
    setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
    toggleSidebar: () => {
      set((s) => {
        const next = !s.sidebarCollapsed;
        void chrome.storage.local.set({ [STORAGE_KEY]: next }, () =>
          scheduleCloudBackup(),
        );
        return { sidebarCollapsed: next };
      });
    },
  }),
);

/** Load persisted value once at module init. Idempotent + races with React mount harmless. */
void (async () => {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  if (result[STORAGE_KEY] !== undefined) {
    useKpssWikiSidebarState
      .getState()
      .setSidebarCollapsed(Boolean(result[STORAGE_KEY]));
  }
})();

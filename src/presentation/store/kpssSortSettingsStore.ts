/**
 * kpssSortSettingsStore
 * Zustand singleton — KPSS topic list sort preference ("default" | "questions" | "status"),
 * persisted to chrome.storage.local so the user's last selection is remembered across reloads.
 * Hook file stays as a facade; consumer components are untouched.
 */

import { create } from "zustand";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

const KEY_SORT = "kpssTopicSortBy";

export type KpssTopicSort = "default" | "questions" | "status";

interface KpssSortSettingsState {
  sortBy: KpssTopicSort;
  setSortBy: (v: KpssTopicSort) => void;
}

export const useKpssSortSettingsState = create<KpssSortSettingsState>()(
  (set) => ({
    sortBy: "default",
    setSortBy: (v) => {
      set({ sortBy: v });
      void chrome.storage.local.set({ [KEY_SORT]: v }, () =>
        scheduleCloudBackup(),
      );
    },
  }),
);

/** Load persisted value once at module init. */
void (async () => {
  const res = await chrome.storage.local.get([KEY_SORT]);
  const stored = res[KEY_SORT];
  if (stored === "default" || stored === "questions" || stored === "status") {
    useKpssSortSettingsState.getState().setSortBy(stored);
  }
})();

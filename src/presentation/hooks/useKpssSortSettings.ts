/**
 * useKpssSortSettings — facade over the Zustand singleton store.
 * Signature unchanged; consumer components untouched.
 */

import {
  useKpssSortSettingsState,
  type KpssTopicSort,
} from "@/presentation/store/kpssSortSettingsStore.js";

export function useKpssSortSettings() {
  const sortBy = useKpssSortSettingsState((s) => s.sortBy);
  const setSortBy = useKpssSortSettingsState((s) => s.setSortBy);
  return { sortBy, setSortBy };
}

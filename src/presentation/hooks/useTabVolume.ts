/**
 * useTabVolume — facade over the Zustand singleton store.
 * Signature unchanged; consumer components untouched.
 */

import { useTabVolumeState } from "@/presentation/store/tabVolumeStore.js";

export function useTabVolume() {
  const volumeLevel = useTabVolumeState((s) => s.volumeLevel);
  const activeTabId = useTabVolumeState((s) => s.activeTabId);
  const tabTitle = useTabVolumeState((s) => s.tabTitle);
  const saveVolume = useTabVolumeState((s) => s.saveVolume);
  return { volumeLevel, activeTabId, tabTitle, saveVolume };
}

/**
 * useTabVolume store
 * Zustand singleton — per-tab volume boost state for the popup volume tab.
 * Persists volume to chrome.storage.local keyed by tab id + posts messages to background/content.
 * Hook file stays as a facade; consumer components are untouched.
 */

import { create } from "zustand";

interface TabVolumeState {
  volumeLevel: number;
  activeTabId: number | null;
  tabTitle: string;
  setVolume: (level: number, tabId: number | null, title: string) => void;
  saveVolume: (level: number) => void;
}

export const useTabVolumeState = create<TabVolumeState>()((set, get) => ({
  volumeLevel: 100,
  activeTabId: null,
  tabTitle: "",
  setVolume: (level, tabId, title) =>
    set({ volumeLevel: level, activeTabId: tabId, tabTitle: title }),
  saveVolume: (level) => {
    set({ volumeLevel: level });
    const tabId = get().activeTabId;
    if (tabId === null) {
      return;
    }

    const storageKey = `volume_tab_${tabId}`;
    void chrome.storage.local.set({ [storageKey]: level });

    const multiplier = level / 100;
    void chrome.runtime.sendMessage({
      type: "set_volume_boost",
      tabId,
      volumeLevel: multiplier,
    });
    void chrome.tabs
      .sendMessage(tabId, {
        type: "set_volume_boost",
        tabId,
        volumeLevel: multiplier,
      })
      .catch(() => {});
  },
}));

/** Initialise from the active tab once at module init. */
void (async () => {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  const tab = tabs && tabs[0];
  if (tab && tab.id) {
    const tId = tab.id;
    const storageKey = `volume_tab_${tId}`;
    const res = await chrome.storage.local.get([storageKey]);
    const level =
      res[storageKey] !== undefined ? (res[storageKey] as number) : 100;
    useTabVolumeState.getState().setVolume(level, tId, tab.title || "Aktif Sekme");
  }
})();
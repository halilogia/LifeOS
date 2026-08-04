import { useState, useEffect, useCallback } from "preact/hooks";

export function useTabVolume() {
  const [volumeLevel, setVolumeLevel] = useState<number>(100);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [tabTitle, setTabTitle] = useState<string>("");

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        const tId = tabs[0].id;
        setActiveTabId(tId);
        setTabTitle(tabs[0].title || "Aktif Sekme");

        const storageKey = `volume_tab_${tId}`;
        chrome.storage.local.get([storageKey], (res) => {
          if (res[storageKey] !== undefined) {
            setVolumeLevel(res[storageKey] as number);
          } else {
            setVolumeLevel(100);
          }
        });
      }
    });
  }, []);

  const saveVolume = useCallback(
    (newLevel: number) => {
      setVolumeLevel(newLevel);

      if (activeTabId !== null) {
        const storageKey = `volume_tab_${activeTabId}`;
        chrome.storage.local.set({ [storageKey]: newLevel });

        const multiplier = newLevel / 100;
        chrome.runtime.sendMessage({
          type: "set_volume_boost",
          tabId: activeTabId,
          volumeLevel: multiplier,
        });

        chrome.tabs
          .sendMessage(activeTabId, {
            type: "set_volume_boost",
            tabId: activeTabId,
            volumeLevel: multiplier,
          })
          .catch(() => {});
      }
    },
    [activeTabId],
  );

  return { volumeLevel, activeTabId, tabTitle, saveVolume };
}

import { useState, useEffect, useCallback } from "preact/hooks";

const DEFAULT_ORDER = [
  "list",
  "eisenhower",
  "notes",
  "pomodoro",
  "willpower",
  "hifiz",
  "srs",
  "calendar",
  "prayer",
  "kpss",
  "free-games",
  "arcade",
  "detox",
  "bist",
  "halka-arz",
  "ai-chat",
];

export function useSidebarOrder() {
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);

  useEffect(() => {
    new Promise<string[]>((resolve) =>
      chrome.storage.sync.get(["sidebarOrder"], (res) =>
        resolve((res.sidebarOrder as string[]) || []),
      ),
    ).then((saved) => {
      let finalOrder = DEFAULT_ORDER;
      if (saved && saved.length > 0) {
        const filtered = saved.filter((k) => DEFAULT_ORDER.includes(k));
        const missing = DEFAULT_ORDER.filter((k) => !filtered.includes(k));
        finalOrder = [...filtered, ...missing];
      }
      setOrder(finalOrder);
    });
  }, []);

  const saveOrder = useCallback((nextOrder: string[]) => {
    chrome.storage.sync.set({ sidebarOrder: nextOrder });
  }, []);

  return { order, setOrder, saveOrder };
}

import { useState, useEffect, useCallback } from "preact/hooks";

const DEFAULT_MEMORY = `# Kişisel Hafıza & Kullanıcı Bağlamı (memory.md)

- **İsim**: Halil Emre
- **Rol / İlgiler**: Yazılım Geliştirme, Borsa İstanbul (BİST) ve Kişisel Verimlilik.
- **AI İletişim Tercihi**: Sade, net, Türkçe, doğrudan sonuca odaklanan ifadeler.
- **Kişisel Hedefler**: Günlük iş akışını ve yatırım takip alışkanlıklarını disiplinli yönetmek.`;

export function useAiUserMemory() {
  const [userMemory, setUserMemory] = useState("");

  useEffect(() => {
    const loadMemory = () => {
      chrome.storage.sync.get(
        ["aiUserMemory"],
        (syncRes: { aiUserMemory?: string }) => {
          if (syncRes && typeof syncRes.aiUserMemory === "string") {
            setUserMemory(syncRes.aiUserMemory);
          } else {
            setUserMemory(DEFAULT_MEMORY);
          }
        },
      );
    };

    loadMemory();

    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (
        areaName === "sync" &&
        changes.aiUserMemory &&
        typeof changes.aiUserMemory.newValue === "string"
      ) {
        setUserMemory(changes.aiUserMemory.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const saveMemory = useCallback((memory: string, onSuccess?: () => void) => {
    chrome.storage.sync.set({ aiUserMemory: memory }, () => {
      onSuccess?.();
    });
  }, []);

  return { userMemory, setUserMemory, saveMemory };
}

/**
 * useAiUserMemory store
 * Zustand singleton — AI user memory markdown, persisted to chrome.storage.local.
 * Listens to cross-context storage changes (background/other views) via onChanged.
 * Hook file stays as a facade; consumer components are untouched.
 */

import { create } from "zustand";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

const KEY = "aiUserMemory";
const AREA = "sync"; // key historically read/written under sync namespace

const DEFAULT_MEMORY = `# Kişisel Hafıza & Kullanıcı Bağlamı (memory.md)

- **İsim**: Halil Emre
- **Rol / İlgiler**: Yazılım Geliştirme, Borsa İstanbul (BİST) ve Kişisel Verimlilik.
- **AI İletişim Tercihi**: Sade, net, Türkçe, doğrudan sonuca odaklanan ifadeler.
- **Kişisel Hedefler**: Günlük iş akışını ve yatırım takip alışkanlıklarını disiplinli yönetmek.`;

interface AiUserMemoryState {
  userMemory: string;
  setUserMemory: (m: string) => void;
  saveMemory: (m: string, onSuccess?: () => void) => void;
}

export const useAiUserMemoryState = create<AiUserMemoryState>()((set) => ({
  userMemory: "",
  setUserMemory: (m) => set({ userMemory: m }),
  saveMemory: (m, onSuccess) => {
    set({ userMemory: m });
    void chrome.storage.local.set({ [KEY]: m }, () => {
      scheduleCloudBackup();
      onSuccess?.();
    });
  },
}));

/** Load persisted value once at module init + subscribe to cross-context writes. */
void (async () => {
  const res = await chrome.storage.local.get([KEY]);
  if (res && typeof res[KEY] === "string") {
    useAiUserMemoryState.getState().setUserMemory(res[KEY]);
  } else {
    useAiUserMemoryState.getState().setUserMemory(DEFAULT_MEMORY);
  }
})();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (
    areaName === AREA &&
    changes[KEY] &&
    typeof changes[KEY].newValue === "string"
  ) {
    useAiUserMemoryState.getState().setUserMemory(changes[KEY].newValue);
  }
});
import { Todo, Language, HifizProgress } from "./types.js";

export const storage = {
  getTodos: (): Promise<Todo[]> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(["todos"], (result) => {
        resolve((result.todos as Todo[]) || []);
      });
    });
  },
  setTodos: (todos: Todo[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ todos }, resolve);
    });
  },
  getHifizProgress: (): Promise<HifizProgress[]> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(["hifizProgress"], (result) => {
        resolve((result.hifizProgress as HifizProgress[]) || []);
      });
    });
  },
  setHifizProgress: (hifizProgress: HifizProgress[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ hifizProgress }, resolve);
    });
  },
  getCustomCategories: (): Promise<string[]> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(["customCategories"], (result) => {
        resolve((result.customCategories as string[]) || []);
      });
    });
  },
  setCustomCategories: (customCategories: string[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ customCategories }, resolve);
    });
  },
  getSettings: (): Promise<{ lang: Language; sidebarOpen?: boolean }> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(["lang", "sidebarOpen"], (result) => {
        resolve({
          lang: (result.lang as Language) || "tr",
          sidebarOpen: result.sidebarOpen as boolean | undefined,
        });
      });
    });
  },
  setLang: (lang: Language): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ lang }, resolve);
    });
  },
  setSidebarOpen: (isOpen: boolean): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ sidebarOpen: isOpen }, resolve);
    });
  },
  clearAll: (lang: Language): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        chrome.storage.local.set({ lang }, resolve);
      });
    });
  },
};

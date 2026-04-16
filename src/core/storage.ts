import { Todo, Language, HifizProgress, Note } from "../types/types.js";
import { WordReviewData } from "../types/word.js";

export const storage = {
  getTodos: (): Promise<Todo[]> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["todos"], (result) => {
        resolve((result.todos as Todo[]) || []);
      });
    });
  },
  setTodos: (todos: Todo[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ todos }, resolve);
    });
  },
  getNotes: (): Promise<Note[]> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["notes"], (result) => {
        resolve((result.notes as Note[]) || []);
      });
    });
  },
  setNotes: (notes: Note[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ notes }, resolve);
    });
  },
  getHifizProgress: (): Promise<HifizProgress[]> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["hifizProgress"], (result) => {
        resolve((result.hifizProgress as HifizProgress[]) || []);
      });
    });
  },
  setHifizProgress: (hifizProgress: HifizProgress[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ hifizProgress }, resolve);
    });
  },
  getSrsProgress: (): Promise<WordReviewData[]> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["srsProgress"], (result) => {
        resolve((result.srsProgress as WordReviewData[]) || []);
      });
    });
  },
  setSrsProgress: (srsProgress: WordReviewData[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ srsProgress }, resolve);
    });
  },
  getCustomCategories: (): Promise<string[]> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["customCategories"], (result) => {
        resolve((result.customCategories as string[]) || []);
      });
    });
  },
  setCustomCategories: (customCategories: string[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ customCategories }, resolve);
    });
  },
  getSettings: (): Promise<{ lang: Language; sidebarOpen?: boolean }> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["lang", "sidebarOpen"], (result) => {
        resolve({
          lang: (result.lang as Language) || "tr",
          sidebarOpen: result.sidebarOpen as boolean | undefined,
        });
      });
    });
  },
  setLang: (lang: Language): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ lang }, resolve);
    });
  },
  setSidebarOpen: (isOpen: boolean): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ sidebarOpen: isOpen }, resolve);
    });
  },
  clearAll: (lang: Language): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.clear(() => {
        chrome.storage.sync.set({ lang }, resolve);
      });
    });
  },
};

import type { StateCreator } from "zustand";
import type { PomodoroState } from "../pomodoroStore.js";
import type { PomodoroLog } from "@/types/types.js";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

const HISTORY_KEY = "pomodoroHistory";

export interface ZenSlice {
  pomodoroHistory: PomodoroLog[];
  setPomodoroHistory: (h: PomodoroLog[]) => void;
  showPlantModal: boolean;
  setShowPlantModal: (v: boolean) => void;
  focusNote: string;
  setFocusNote: (n: string) => void;
  selectedElement: PomodoroLog["element"];
  setSelectedElement: (e: PomodoroLog["element"]) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  lastCompletedDuration: number;
  lastCompletedStartTime: string;
  lastCompletedEndTime: string;
  setLastCompletedDuration: (d: number) => void;
  setLastCompletedStartTime: (s: string) => void;
  setLastCompletedEndTime: (s: string) => void;
  handlePlantElement: () => Promise<void>;
  initZen: () => void;
}

export const createZenSlice: StateCreator<PomodoroState, [], [], ZenSlice> = (
  set,
  get,
) => ({
  pomodoroHistory: [],
  setPomodoroHistory: (h) => set({ pomodoroHistory: h }),
  showPlantModal: false,
  setShowPlantModal: (v) => set({ showPlantModal: v }),
  focusNote: "",
  setFocusNote: (n) => set({ focusNote: n }),
  selectedElement: "bonsai",
  setSelectedElement: (e) => set({ selectedElement: e }),
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
  lastCompletedDuration: 25 * 60,
  lastCompletedStartTime: "",
  lastCompletedEndTime: "",
  setLastCompletedDuration: (d) => set({ lastCompletedDuration: d }),
  setLastCompletedStartTime: (s) => set({ lastCompletedStartTime: s }),
  setLastCompletedEndTime: (s) => set({ lastCompletedEndTime: s }),
  handlePlantElement: async () => {
    const {
      pomodoroHistory,
      lastCompletedStartTime,
      lastCompletedEndTime,
      lastCompletedDuration,
      focusNote,
      selectedElement,
    } = get();
    let position = -1;
    const occupied = new Set(pomodoroHistory.map((h) => h.position));
    for (let i = 0; i < 25; i++) {
      if (!occupied.has(i)) {
        position = i;
        break;
      }
    }
    if (position === -1) {
      position = pomodoroHistory.length % 25;
    }
    const newLog: PomodoroLog = {
      id: crypto.randomUUID(),
      startTime: lastCompletedStartTime || new Date().toISOString(),
      endTime: lastCompletedEndTime || new Date().toISOString(),
      duration: lastCompletedDuration,
      mode: "focus",
      note: focusNote.trim() || "Pomodoro Session",
      element: selectedElement,
      position,
    };
    const nextHistory = [
      ...pomodoroHistory.filter((h) => h.position !== position),
      newLog,
    ];
    await new Promise<void>((r) =>
      chrome.storage.local.set({ [HISTORY_KEY]: nextHistory }, r),
    );
    set({ pomodoroHistory: nextHistory, showPlantModal: false, focusNote: "" });
    scheduleCloudBackup();
  },
  initZen: () => {
    chrome.storage.local.get([HISTORY_KEY], (res) => {
      set({ pomodoroHistory: (res[HISTORY_KEY] as PomodoroLog[]) || [] });
    });
  },
});

import type { StateCreator } from "zustand";
import type { PomodoroState } from "../pomodoroStore.js";
import {
  pomodoroManager,
  type AlarmItem,
} from "@/infrastructure/services/PomodoroManagerService.js";
import { notify } from "./pomodoroNotify.js";

export interface AlarmSlice {
  alarms: AlarmItem[];
  alarmInput: string;
  setAlarmInput: (s: string) => void;
  handleAddAlarm: () => Promise<void>;
  handleToggleAlarm: (id: string, enabled: boolean) => Promise<void>;
  handleDeleteAlarm: (id: string) => Promise<void>;
  initAlarms: () => () => void;
}

export const createAlarmSlice: StateCreator<
  PomodoroState,
  [],
  [],
  AlarmSlice
> = (set, get) => ({
  alarms: [],
  alarmInput: "",
  setAlarmInput: (s) => set({ alarmInput: s }),
  handleAddAlarm: async () => {
    const { alarmInput } = get();
    if (!alarmInput) {
      return;
    }
    const list = await pomodoroManager.addAlarm(alarmInput);
    set({ alarms: list, alarmInput: "" });
  },
  handleToggleAlarm: async (id, enabled) => {
    const list = await pomodoroManager.toggleAlarm(id, enabled);
    set({ alarms: list });
  },
  handleDeleteAlarm: async (id) => {
    const list = await pomodoroManager.deleteAlarm(id);
    set({ alarms: list });
  },
  initAlarms: () => {
    void pomodoroManager.getAlarms().then((list) => set({ alarms: list }));
    const unsub = pomodoroManager.onAlarmsChanged((list) =>
      set({ alarms: list }),
    );
    const alarmTimer = setInterval(() => {
      const { alarms } = get();
      const currentHHMM = new Date().toTimeString().slice(0, 5);
      alarms.forEach(async (alarm) => {
        if (alarm.enabled && alarm.time === currentHHMM) {
          await pomodoroManager.toggleAlarm(alarm.id, false);
          notify(`Alarm ${alarm.time}`);
        }
      });
    }, 1000);
    return () => {
      unsub();
      clearInterval(alarmTimer);
    };
  },
});

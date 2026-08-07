/**
 * useKpssChartSettings store
 * Zustand singleton — KPSS chart type (line/bar) and days (7/30), persisted to chrome.storage.local.
 * Hook file stays as a facade; consumer components are untouched.
 */

import { create } from "zustand";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

const KEY_TYPE = "kpssChartType";
const KEY_DAYS = "kpssChartDays";

interface KpssChartSettingsState {
  chartType: "line" | "bar";
  chartDays: 7 | 30;
  setChartType: (t: "line" | "bar") => void;
  setChartDays: (d: 7 | 30) => void;
}

export const useKpssChartSettingsState = create<KpssChartSettingsState>()(
  (set) => ({
    chartType: "line",
    chartDays: 7,
    setChartType: (t) => {
      set({ chartType: t });
      void chrome.storage.local.set({ [KEY_TYPE]: t }, () =>
        scheduleCloudBackup(),
      );
    },
    setChartDays: (d) => {
      set({ chartDays: d });
      void chrome.storage.local.set({ [KEY_DAYS]: d }, () =>
        scheduleCloudBackup(),
      );
    },
  }),
);

/** Load persisted values once at module init. */
void (async () => {
  const res = await chrome.storage.local.get([KEY_TYPE, KEY_DAYS]);
  if (res[KEY_TYPE] === "line" || res[KEY_TYPE] === "bar") {
    useKpssChartSettingsState.getState().setChartType(res[KEY_TYPE]);
  }
  if (res[KEY_DAYS] === 30) {
    useKpssChartSettingsState.getState().setChartDays(30);
  }
})();
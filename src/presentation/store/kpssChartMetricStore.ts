/**
 * useKpssChartMetric store
 * Zustand singleton — KPSS chart metric mode (all/questions/videos), persisted to chrome.storage.local.
 * Hook file stays as a facade; consumer components are untouched.
 */

import { create } from "zustand";

const KEY = "kpss_chart_metric_mode";
type KpssChartMetricMode = "all" | "questions" | "videos";

interface KpssChartMetricState {
  chartMetric: KpssChartMetricMode;
  setChartMetric: (m: KpssChartMetricMode) => void;
}

export const useKpssChartMetricState = create<KpssChartMetricState>()(
  (set) => ({
    chartMetric: "all",
    setChartMetric: (m) => {
      set({ chartMetric: m });
      void chrome.storage.local.set({ [KEY]: m });
    },
  }),
);

/** Load persisted value once at module init. */
void (async () => {
  const res = await chrome.storage.local.get(KEY);
  const mode = res?.[KEY];
  if (mode === "all" || mode === "questions" || mode === "videos") {
    useKpssChartMetricState.getState().setChartMetric(mode);
  }
})();
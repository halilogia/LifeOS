/**
 * useKpssChartSettings — facade over the Zustand singleton store.
 * Signature unchanged; consumer components untouched.
 */

import { useKpssChartSettingsState } from "@/presentation/store/kpssChartSettingsStore.js";

export function useKpssChartSettings() {
  const chartType = useKpssChartSettingsState((s) => s.chartType);
  const chartDays = useKpssChartSettingsState((s) => s.chartDays);
  const setChartType = useKpssChartSettingsState((s) => s.setChartType);
  const setChartDays = useKpssChartSettingsState((s) => s.setChartDays);
  return {
    chartType,
    chartDays,
    saveChartType: setChartType,
    saveChartDays: setChartDays,
  };
}

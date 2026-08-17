/**
 * useKpssChartMetric — facade over the Zustand singleton store.
 * Signature unchanged; consumer components untouched.
 */

import { useKpssChartMetricState } from "@/presentation/store/kpssChartMetricStore.js";

export function useKpssChartMetric() {
  const chartMetric = useKpssChartMetricState((s) => s.chartMetric);
  const setChartMetric = useKpssChartMetricState((s) => s.setChartMetric);
  return { chartMetric, saveChartMetric: setChartMetric };
}

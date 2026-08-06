import { useState, useEffect, useCallback } from "preact/hooks";

export function useKpssChartMetric() {
  const [chartMetric, setChartMetric] = useState<
    "all" | "questions" | "videos"
  >("all");

  useEffect(() => {
    chrome.storage.local.get(["kpss_chart_metric_mode"], (res) => {
      const mode = res?.kpss_chart_metric_mode;
      if (mode === "all" || mode === "questions" || mode === "videos") {
        setChartMetric(mode);
      }
    });
  }, []);

  const saveChartMetric = useCallback(
    (mode: "all" | "questions" | "videos") => {
      setChartMetric(mode);
      chrome.storage.local.set({ kpss_chart_metric_mode: mode });
    },
    [],
  );

  return { chartMetric, saveChartMetric };
}

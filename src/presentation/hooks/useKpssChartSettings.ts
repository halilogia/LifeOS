import { useState, useEffect, useCallback } from "preact/hooks";

export function useKpssChartSettings() {
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [chartDays, setChartDays] = useState<7 | 30>(7);

  useEffect(() => {
    void (async () => {
      const cType: "line" | "bar" = await new Promise((r) =>
        chrome.storage.local.get(["kpssChartType"], (res) =>
          r((res.kpssChartType as "line" | "bar") || "line"),
        ),
      );
      const cDays: 7 | 30 = await new Promise((r) =>
        chrome.storage.local.get(["kpssChartDays"], (res) =>
          r(res.kpssChartDays === 30 ? 30 : 7),
        ),
      );
      setChartType(cType);
      setChartDays(cDays);
    })();
  }, []);

  const saveChartType = useCallback(async (type: "line" | "bar") => {
    setChartType(type);
    chrome.storage.local.set({ kpssChartType: type });
  }, []);

  const saveChartDays = useCallback(async (days: 7 | 30) => {
    setChartDays(days);
    chrome.storage.local.set({ kpssChartDays: days });
  }, []);

  return { chartType, chartDays, saveChartType, saveChartDays };
}

export type ChartRange = "1d" | "1mo" | "3mo" | "6mo" | "1y";

interface ChartRangeSelectorProps {
  t: Record<string, string>;
  range: ChartRange;
  onRangeChange: (range: ChartRange) => void;
}

export function ChartRangeSelector({
  t,
  range,
  onRangeChange,
}: ChartRangeSelectorProps) {
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {(["1d", "1mo", "3mo", "6mo", "1y"] as const).map((r) => (
        <button
          key={r}
          className={`stock-btn ${range === r ? "stock-btn-primary" : "stock-btn-secondary"}`}
          style={{ padding: "4px 10px", fontSize: "0.75rem" }}
          onClick={() => onRangeChange(r)}
        >
          {r === "1d"
            ? t.stock_chart_period_1d
            : r === "1mo"
              ? t.stock_chart_period_1m
              : r === "3mo"
                ? t.stock_chart_period_3m
                : r === "6mo"
                  ? "6A"
                  : t.stock_chart_period_1y}
        </button>
      ))}
    </div>
  );
}

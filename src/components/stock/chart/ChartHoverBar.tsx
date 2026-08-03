import type { Language } from "@/types/types.js";
import type { StockHistoryItem } from "@/types/bist.js";

interface ChartHoverBarProps {
  t: Record<string, string>;
  lang: Language;
  range: "1d" | "1mo" | "3mo" | "6mo" | "1y";
  hoveredPoint: StockHistoryItem | null;
}

export function ChartHoverBar({
  t,
  lang,
  range,
  hoveredPoint,
}: ChartHoverBarProps) {
  return (
    <div
      style={{
        height: "24px",
        display: "flex",
        gap: "16px",
        fontSize: "0.8rem",
        color: "#cbd5e1",
      }}
    >
      {hoveredPoint ? (
        <>
          <span>
            {range === "1d"
              ? `${t.stock_chart_interval}: `
              : `${t.stock_card_open}: `}
            {range === "1d"
              ? new Date(hoveredPoint.timestamp).toLocaleTimeString(
                  lang === "tr" ? "tr-TR" : "en-US",
                  { hour: "2-digit", minute: "2-digit" },
                )
              : new Date(hoveredPoint.timestamp).toLocaleDateString(
                  lang === "tr" ? "tr-TR" : "en-US",
                )}
          </span>
          <span>
            {t.stock_card_open}: ₺{hoveredPoint.open.toFixed(2)}
          </span>
          <span style={{ color: "#4ade80" }}>
            {t.stock_card_high}: ₺{hoveredPoint.high.toFixed(2)}
          </span>
          <span style={{ color: "#f87171" }}>
            {t.stock_card_low}: ₺{hoveredPoint.low.toFixed(2)}
          </span>
          <span>
            {t.stock_card_close_price}: ₺{hoveredPoint.close.toFixed(2)}
          </span>
        </>
      ) : (
        <span style={{ color: "#64748b" }}>{t.stock_chart_hover_hint}</span>
      )}
    </div>
  );
}

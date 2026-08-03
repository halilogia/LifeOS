import { useState, useEffect, useRef } from "preact/hooks";
import { Language } from "@/types/types.js";
import { fetchStockHistory } from "@/services/bistService.js";
import type { StockHistoryItem } from "@/types/bist.js";
import { getTranslation } from "@/utils/i18n.js";
import { drawStockChart } from "./stockChartDrawer.js";
import { ChartHoverBar } from "./ChartHoverBar.js";
import { ChartRangeSelector } from "./ChartRangeSelector.js";
import type { ChartRange } from "./ChartRangeSelector.js";

interface CustomStockChartProps {
  symbol: string;
  lang: Language;
}

export function CustomStockChart({ symbol, lang }: CustomStockChartProps) {
  const t = getTranslation(lang);
  const [range, setRange] = useState<ChartRange>("1d");
  const [history, setHistory] = useState<StockHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<StockHistoryItem | null>(
    null,
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchStockHistory(symbol, range);
      setHistory(data);
      setLoading(false);
    }
    loadData();
  }, [symbol, range]);

  useEffect(() => {
    if (!canvasRef.current || history.length === 0) {
      return;
    }
    drawStockChart(canvasRef.current, history, hoveredPoint);
  }, [history, hoveredPoint]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!canvasRef.current || history.length === 0) {
      return;
    }
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const paddingLeft = 10;
    const paddingRight = 50;
    const chartWidth = rect.width - paddingLeft - paddingRight;

    if (x < paddingLeft || x > rect.width - paddingRight) {
      setHoveredPoint(null);
      return;
    }

    const index = Math.floor(((x - paddingLeft) / chartWidth) * history.length);
    if (index >= 0 && index < history.length) {
      setHoveredPoint(history[index]);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "16px",
        background: "rgba(30, 41, 59, 0.5)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: "#f8fafc" }}>
            {t.stock_chart_title_live.replace("{symbol}", symbol.toUpperCase())}
          </h3>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            Yahoo Finance BIST Veri Akışı
          </span>
        </div>

        <ChartRangeSelector t={t} range={range} onRangeChange={setRange} />
      </div>

      <ChartHoverBar
        t={t}
        lang={lang}
        range={range}
        hoveredPoint={hoveredPoint}
      />

      <div style={{ position: "relative", width: "100%", height: "260px" }}>
        {loading ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(15, 23, 42, 0.6)",
              zIndex: 10,
              color: "#94a3b8",
            }}
          >
            <span>{t.stock_loading}</span>
          </div>
        ) : history.length === 0 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(15, 23, 42, 0.8)",
              zIndex: 10,
              color: "#94a3b8",
              gap: "8px",
              textAlign: "center",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <div
              style={{ fontSize: "1rem", fontWeight: 700, color: "#f8fafc" }}
            >
              {symbol.toUpperCase()} — {t.stock_chart_no_data}
            </div>
            <div
              style={{
                fontSize: "0.82rem",
                color: "#94a3b8",
                maxWidth: "420px",
              }}
            >
              {t.stock_chart_no_data_hint}
            </div>
          </div>
        ) : null}
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    </div>
  );
}

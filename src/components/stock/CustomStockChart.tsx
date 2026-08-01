import { useState, useEffect, useRef } from "preact/hooks";
import { Language } from "@/types/types.js";
import { fetchStockHistory } from "@/services/bistService.js";
import type { StockHistoryItem } from "@/types/bist.js";
import { getTranslation } from "@/utils/i18n.js";

interface CustomStockChartProps {
  symbol: string;
  lang: Language;
}

export function CustomStockChart({ symbol, lang }: CustomStockChartProps) {
  const t = getTranslation(lang);
  const [range, setRange] = useState<"1d" | "1mo" | "3mo" | "6mo" | "1y">("1d");
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
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    const paddingLeft = 10;
    const paddingRight = 50;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    let minPrice = Math.min(...history.map((d) => d.low));
    let maxPrice = Math.max(...history.map((d) => d.high));
    if (minPrice === maxPrice) {
      minPrice *= 0.95;
      maxPrice *= 1.05;
    }

    const gridLines = 5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillStyle = "#64748b";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";

    for (let i = 0; i <= gridLines; i++) {
      const y = paddingTop + (chartHeight / gridLines) * i;
      const priceVal = maxPrice - ((maxPrice - minPrice) / gridLines) * i;

      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      ctx.fillText(`₺${priceVal.toFixed(2)}`, width - paddingRight + 5, y + 3);
    }

    const candleCount = history.length;
    const candleWidth = Math.max(2, chartWidth / candleCount - 2);

    history.forEach((d, i) => {
      const x = paddingLeft + (chartWidth / candleCount) * i + candleWidth / 2;
      const isGreen = d.close >= d.open;

      const openY =
        paddingTop +
        chartHeight -
        ((d.open - minPrice) / (maxPrice - minPrice)) * chartHeight;
      const closeY =
        paddingTop +
        chartHeight -
        ((d.close - minPrice) / (maxPrice - minPrice)) * chartHeight;
      const highY =
        paddingTop +
        chartHeight -
        ((d.high - minPrice) / (maxPrice - minPrice)) * chartHeight;
      const lowY =
        paddingTop +
        chartHeight -
        ((d.low - minPrice) / (maxPrice - minPrice)) * chartHeight;

      ctx.strokeStyle = isGreen ? "#4ade80" : "#f87171";
      ctx.fillStyle = isGreen ? "#4ade80" : "#f87171";

      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(2, Math.abs(openY - closeY));
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });

    if (hoveredPoint) {
      const hoveredIndex = history.findIndex(
        (h) => h.timestamp === hoveredPoint.timestamp,
      );
      if (hoveredIndex !== -1) {
        const x =
          paddingLeft +
          (chartWidth / candleCount) * hoveredIndex +
          candleWidth / 2;
        ctx.strokeStyle = "rgba(99, 102, 241, 0.4)";
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        ctx.moveTo(x, paddingTop);
        ctx.lineTo(x, height - paddingBottom);
        ctx.stroke();

        const closeY =
          paddingTop +
          chartHeight -
          ((hoveredPoint.close - minPrice) / (maxPrice - minPrice)) *
            chartHeight;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, closeY);
        ctx.lineTo(width - paddingRight, closeY);
        ctx.stroke();

        ctx.setLineDash([]);
      }
    }
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

        <div style={{ display: "flex", gap: "6px" }}>
          {(["1d", "1mo", "3mo", "6mo", "1y"] as const).map((r) => (
            <button
              key={r}
              className={`stock-btn ${range === r ? "stock-btn-primary" : "stock-btn-secondary"}`}
              style={{ padding: "4px 10px", fontSize: "0.75rem" }}
              onClick={() => setRange(r)}
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
      </div>

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

import { useState, useEffect, useRef } from "preact/hooks";
import { Language } from "@/types/types.js";
import { fetchStockHistory, StockHistoryItem } from "@/services/bistService.js";

interface CustomStockChartProps {
  symbol: string;
  lang: Language;
}

export function CustomStockChart({ symbol, lang }: CustomStockChartProps) {
  const [range, setRange] = useState<"1mo" | "3mo" | "6mo" | "1y" | any>("1mo");
  const [history, setHistory] = useState<StockHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<StockHistoryItem | null>(null);

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
    if (loading || history.length === 0) {return;}
    draw();
  }, [history, loading, hoveredPoint]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) {return;}

    const ctx = canvas.getContext("2d");
    if (!ctx) {return;}

    // Handle high DPI screens
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Padding margins
    const paddingLeft = 15;
    const paddingRight = 60;
    const paddingTop = 40;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const minPrice = Math.min(...history.map(h => h.low)) * 0.99;
    const maxPrice = Math.max(...history.map(h => h.high)) * 1.01;
    const priceRange = maxPrice - minPrice;

    // 1. Draw horizontal grid lines & prices
    const gridLines = 5;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";

    for (let i = 0; i < gridLines; i++) {
      const ratio = i / (gridLines - 1);
      const y = paddingTop + (1 - ratio) * chartHeight;
      const price = minPrice + ratio * priceRange;

      // Draw grid line
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      // Draw price text
      ctx.fillText(price.toFixed(2), width - paddingRight + 8, y + 3);
    }

    // 2. Draw candles
    const totalBars = history.length;
    const barWidth = (chartWidth / totalBars) * 0.7;
    const barGap = (chartWidth / totalBars) * 0.3;

    history.forEach((bar, i) => {
      const x = paddingLeft + i * (chartWidth / totalBars) + barGap / 2;

      // Scale prices
      const yOpen = paddingTop + (1 - (bar.open - minPrice) / priceRange) * chartHeight;
      const yClose = paddingTop + (1 - (bar.close - minPrice) / priceRange) * chartHeight;
      const yHigh = paddingTop + (1 - (bar.high - minPrice) / priceRange) * chartHeight;
      const yLow = paddingTop + (1 - (bar.low - minPrice) / priceRange) * chartHeight;

      const isGreen = bar.close >= bar.open;
      const color = isGreen ? "#10b981" : "#ef4444";

      // Draw wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + barWidth / 2, yHigh);
      ctx.lineTo(x + barWidth / 2, yLow);
      ctx.stroke();

      // Draw body
      ctx.fillStyle = color;
      const rectY = Math.min(yOpen, yClose);
      const rectH = Math.max(Math.abs(yOpen - yClose), 1.5);
      ctx.fillRect(x, rectY, barWidth, rectH);
    });

    // 3. Draw dates on X-axis
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.textAlign = "center";
    const dateInterval = Math.max(Math.floor(totalBars / 4), 1);
    for (let i = 0; i < totalBars; i += dateInterval) {
      const x = paddingLeft + i * (chartWidth / totalBars) + barWidth / 2;
      const date = new Date(history[i].timestamp);
      const dateStr = date.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
        day: "numeric",
        month: "short"
      });
      ctx.fillText(dateStr, x, height - 10);
    }

    // 4. Hover crosshair drawing
    if (hoveredPoint) {
      const hoverIndex = history.findIndex(h => h.timestamp === hoveredPoint.timestamp);
      if (hoverIndex !== -1) {
        const x = paddingLeft + hoverIndex * (chartWidth / totalBars) + barWidth / 2;
        
        // Draw vertical dashed line
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x, paddingTop);
        ctx.lineTo(x, height - paddingBottom);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) {return;}

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const paddingLeft = 15;
    const paddingRight = 60;
    const chartWidth = rect.width - paddingLeft - paddingRight;

    if (x < paddingLeft || x > rect.width - paddingRight) {
      setHoveredPoint(null);
      return;
    }

    const totalBars = history.length;
    const index = Math.floor(((x - paddingLeft) / chartWidth) * totalBars);

    if (index >= 0 && index < totalBars) {
      setHoveredPoint(history[index]);
    } else {
      setHoveredPoint(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const displayPoint = hoveredPoint || history[history.length - 1];

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      {/* Price Info Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "10px", flexWrap: "wrap" }}>
        {displayPoint ? (
          <div style={{ display: "flex", gap: "12px", fontSize: "0.82rem", color: "var(--text-secondary)", background: "rgba(255,255,255,0.02)", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div><span style={{ opacity: 0.6 }}>{lang === "tr" ? "Açılış:" : "Open:"}</span> <strong style={{ color: "#fff" }}>{displayPoint.open.toFixed(2)}</strong></div>
            <div><span style={{ opacity: 0.6 }}>{lang === "tr" ? "Yüksek:" : "High:"}</span> <strong style={{ color: "#10b981" }}>{displayPoint.high.toFixed(2)}</strong></div>
            <div><span style={{ opacity: 0.6 }}>{lang === "tr" ? "Düşük:" : "Low:"}</span> <strong style={{ color: "#ef4444" }}>{displayPoint.low.toFixed(2)}</strong></div>
            <div><span style={{ opacity: 0.6 }}>{lang === "tr" ? "Kapanış:" : "Close:"}</span> <strong style={{ color: "#fff" }}>{displayPoint.close.toFixed(2)}</strong></div>
            <div><span style={{ opacity: 0.6 }}>{lang === "tr" ? "Hacim:" : "Vol:"}</span> <strong style={{ color: "#fff" }}>{displayPoint.volume.toLocaleString("tr-TR")}</strong></div>
          </div>
        ) : <div />}

        {/* Range selectors */}
        <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", padding: "3px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", gap: "4px" }}>
          {(["1mo", "3mo", "6mo", "1y"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                background: range === r ? "var(--accent-color)" : "transparent",
                border: "none",
                color: range === r ? "#fff" : "rgba(255, 255, 255, 0.6)",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {r === "1mo" ? (lang === "tr" ? "1 Ay" : "1M") :
               r === "3mo" ? (lang === "tr" ? "3 Ay" : "3M") :
               r === "6mo" ? (lang === "tr" ? "6 Ay" : "6M") :
               (lang === "tr" ? "1 Yıl" : "1Y")}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <div style={{ position: "relative", flex: 1, minHeight: "350px", background: "rgba(0,0,0,0.15)", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.05)", overflow: "hidden" }}>
        {loading && (
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 15, 22, 0.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", zIndex: 5 }}>
            <div class="ha-spinner"></div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              {lang === "tr" ? "Tarihsel veriler yükleniyor..." : "Loading historical data..."}
            </span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ width: "100%", height: "100%", display: "block", cursor: "crosshair" }}
        />
      </div>
    </div>
  );
}

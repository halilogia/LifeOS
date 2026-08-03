/**
 * stockChartDrawer.ts
 * CustomStockChart için saf canvas çizim fonksiyonu.
 * Mum grafiği + grid + hover vurgu çizgileri.
 */
import type { StockHistoryItem } from "@/types/bist.js";

const PADDING = {
  left: 10,
  right: 50,
  top: 20,
  bottom: 30,
};

/**
 * Canvas üzerine BIST mum grafiğini çizer.
 */
export function drawStockChart(
  canvas: HTMLCanvasElement,
  history: StockHistoryItem[],
  hoveredPoint: StockHistoryItem | null,
) {
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

  const paddingLeft = PADDING.left;
  const paddingRight = PADDING.right;
  const paddingTop = PADDING.top;
  const paddingBottom = PADDING.bottom;

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
}

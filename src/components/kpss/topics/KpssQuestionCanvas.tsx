import { useEffect, useRef } from "preact/hooks";
import {
  ChartConfig,
  drawBarChart,
  drawLineChart,
  drawGeometry,
} from "./kpssCanvasDrawers.js";

interface KpssQuestionCanvasProps {
  chart: ChartConfig;
}

export function KpssQuestionCanvas({ chart }: KpssQuestionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    // Handle High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // Apply Premium Font Styling
    ctx.font = "bold 12px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (chart.type === "bar") {
      drawBarChart(ctx, width, height, chart);
    } else if (chart.type === "line") {
      drawLineChart(ctx, width, height, chart);
    } else if (chart.type === "geometry") {
      drawGeometry(ctx, width, height, chart);
    }
  }, [chart]);

  return (
    <div className="kpss-canvas-container">
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "230px",
          display: "block",
        }}
      />
    </div>
  );
}

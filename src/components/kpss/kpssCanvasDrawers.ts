/**
 * kpssCanvasDrawers.ts
 * KpssQuestionCanvas için saf canvas çizim fonksiyonları.
 * Bar chart, line chart ve geometri şekilleri (üçgen/daire/paralel doğrular).
 */

export interface ChartConfig {
  type: "bar" | "line" | "geometry";
  title?: string;
  labels?: string[];
  values?: (number | string)[];
  shape?: "triangle" | "circle" | "parallel_lines";
  angles?: Record<string, string>; // e.g. { "A": "60°", "B": "x", "C": "80°" }
  sides?: Record<string, string>; // e.g. { "AB": "6", "BC": "8", "AC": "y" }
}

export function drawBarChart(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: ChartConfig,
) {
  const title = config.title || "";
  const labels = config.labels || [];
  const values = (config.values || []).map((val) => Number(val) || 0);

  // Draw Title
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = "bold 13px 'Inter', sans-serif";
  ctx.fillText(title, w / 2, 20);

  const chartX = 50;
  const chartY = 40;
  const chartW = w - 80;
  const chartH = h - 80;

  // Draw grid & axes
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = "10px sans-serif";

  const maxValue = Math.max(...values, 10);
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const val = Math.round((maxValue / steps) * i);
    const y = chartY + chartH - (chartH / steps) * i;
    // Draw grid line
    ctx.beginPath();
    ctx.moveTo(chartX, y);
    ctx.lineTo(chartX + chartW, y);
    ctx.stroke();
    // Draw label
    ctx.textAlign = "right";
    ctx.fillText(val.toString(), chartX - 8, y);
  }

  // Draw Bars
  const barCount = values.length;
  const gap = 16;
  const totalGap = gap * (barCount + 1);
  const barW = (chartW - totalGap) / barCount;

  values.forEach((val, idx) => {
    const barH = (val / maxValue) * chartH;
    const x = chartX + gap + idx * (barW + gap);
    const y = chartY + chartH - barH;

    // Draw Gradient Bar
    const grad = ctx.createLinearGradient(x, y, x, chartY + chartH);
    grad.addColorStop(0, "rgba(139, 92, 246, 0.85)"); // Purple
    grad.addColorStop(1, "rgba(99, 102, 241, 0.25)"); // Indigo

    ctx.fillStyle = grad;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
    } else {
      ctx.rect(x, y, barW, barH);
    }
    ctx.fill();

    // Draw border highlight
    ctx.strokeStyle = "rgba(167, 139, 250, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw value on top of bar
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(val.toString(), x + barW / 2, y - 8);

    // Draw X label
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "10px sans-serif";
    const lbl = labels[idx] || "";
    ctx.fillText(lbl, x + barW / 2, chartY + chartH + 16);
  });

  // Draw main axes
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(chartX, chartY);
  ctx.lineTo(chartX, chartY + chartH);
  ctx.lineTo(chartX + chartW, chartY + chartH);
  ctx.stroke();
}

export function drawLineChart(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: ChartConfig,
) {
  const title = config.title || "";
  const labels = config.labels || [];
  const values = (config.values || []).map((val) => Number(val) || 0);

  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = "bold 13px 'Inter', sans-serif";
  ctx.fillText(title, w / 2, 20);

  const chartX = 50;
  const chartY = 40;
  const chartW = w - 80;
  const chartH = h - 80;

  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = "10px sans-serif";

  const maxValue = Math.max(...values, 10);
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const val = Math.round((maxValue / steps) * i);
    const y = chartY + chartH - (chartH / steps) * i;
    ctx.beginPath();
    ctx.moveTo(chartX, y);
    ctx.lineTo(chartX + chartW, y);
    ctx.stroke();
    ctx.textAlign = "right";
    ctx.fillText(val.toString(), chartX - 8, y);
  }

  const points = values.map((val, idx) => {
    const x = chartX + (chartW / (values.length - 1 || 1)) * idx;
    const y = chartY + chartH - (val / maxValue) * chartH;
    return { x, y, value: val };
  });

  // Draw connecting line
  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((pt, idx) => {
    if (idx === 0) {
      ctx.moveTo(pt.x, pt.y);
    } else {
      ctx.lineTo(pt.x, pt.y);
    }
  });
  ctx.stroke();

  // Draw line glow underlay
  ctx.strokeStyle = "rgba(139, 92, 246, 0.2)";
  ctx.lineWidth = 8;
  ctx.stroke();

  // Draw dots and text labels
  points.forEach((pt, idx) => {
    ctx.fillStyle = "#a78bfa";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Value label
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(pt.value.toString(), pt.x, pt.y - 12);

    // X Label
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "10px sans-serif";
    const lbl = labels[idx] || "";
    ctx.fillText(lbl, pt.x, chartY + chartH + 16);
  });

  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(chartX, chartY);
  ctx.lineTo(chartX, chartY + chartH);
  ctx.lineTo(chartX + chartW, chartY + chartH);
  ctx.stroke();
}

export function drawGeometry(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: ChartConfig,
) {
  const shape = config.shape || "triangle";
  const angles = config.angles || {};
  const sides = config.sides || {};

  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = "bold 13px 'Inter', sans-serif";

  if (shape === "triangle") {
    // Coordinates
    const ax = w / 2;
    const ay = 45;
    const bx = w / 2 - 110;
    const by = h - 50;
    const cx = w / 2 + 110;
    const cy = h - 50;

    // Draw triangle
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.stroke();

    // Vertex Labels
    ctx.font = "bold 14px 'Inter', sans-serif";
    ctx.fillStyle = "rgba(167, 139, 250, 1)";
    ctx.fillText("A", ax, ay - 16);
    ctx.fillText("B", bx - 14, by + 4);
    ctx.fillText("C", cx + 14, cy + 4);

    // Angle Labels (inside near corners)
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    if (angles.A) {
      ctx.fillText(angles.A, ax, ay + 26);
    }
    if (angles.B) {
      ctx.fillText(angles.B, bx + 28, by - 12);
    }
    if (angles.C) {
      ctx.fillText(angles.C, cx - 28, cy - 12);
    }

    // Side Labels (midpoints of sides)
    ctx.font = "italic bold 12px sans-serif";
    ctx.fillStyle = "#ffc107";
    if (sides.AB) {
      ctx.fillText(sides.AB, (ax + bx) / 2 - 18, (ay + by) / 2);
    }
    if (sides.BC) {
      ctx.fillText(sides.BC, (bx + cx) / 2, by + 18);
    }
    if (sides.AC) {
      ctx.fillText(sides.AC, (ax + cx) / 2 + 18, (ay + cy) / 2);
    }
  } else if (shape === "circle") {
    const cx = w / 2;
    const cy = h / 2 + 5;
    const r = 65;

    // Draw Circle
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw Center point O
    ctx.fillStyle = "#8b5cf6";
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, 2 * Math.PI);
    ctx.fill();

    // Center label
    ctx.font = "bold 13px 'Inter', sans-serif";
    ctx.fillStyle = "rgba(167, 139, 250, 1)";
    ctx.fillText("O", cx - 12, cy + 12);

    // Draw radius line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r, cy);
    ctx.stroke();

    // Side label (Radius name or value)
    ctx.font = "italic bold 12px sans-serif";
    ctx.fillStyle = "#ffc107";
    if (sides.radius) {
      ctx.fillText(sides.radius, cx + r / 2, cy - 12);
    } else if (sides.r) {
      ctx.fillText(sides.r, cx + r / 2, cy - 12);
    } else {
      ctx.fillText("r", cx + r / 2, cy - 12);
    }

    // Other labels if passed
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    if (angles.center) {
      ctx.fillText(angles.center, cx + 18, cy - 16);
    }
  } else if (shape === "parallel_lines") {
    const ly1 = 70;
    const ly2 = h - 70;

    // Draw horizontal parallel lines
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(40, ly1);
    ctx.lineTo(w - 40, ly1);
    ctx.moveTo(40, ly2);
    ctx.lineTo(w - 40, ly2);
    ctx.stroke();

    // Draw transversal cutting line
    ctx.strokeStyle = "#8b5cf6";
    ctx.beginPath();
    ctx.moveTo(110, 35);
    ctx.lineTo(290, h - 35);
    ctx.stroke();

    // Intersection coordinates
    const tx = 150;
    const ty = ly1;
    const bx = 250;
    const by = ly2;

    // Draw parallel marks (d1, d2 labels)
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText("d1", w - 30, ly1 - 10);
    ctx.fillText("d2", w - 30, ly2 - 10);

    // Label Angles
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#ffc107";

    if (angles.top_left) {
      ctx.fillText(angles.top_left, tx - 25, ty - 18);
    }
    if (angles.top_right) {
      ctx.fillText(angles.top_right, tx + 20, ty - 18);
    }
    if (angles.bottom_left) {
      ctx.fillText(angles.bottom_left, tx - 20, ty + 18);
    }
    if (angles.bottom_right) {
      ctx.fillText(angles.bottom_right, tx + 25, ty + 18);
    }

    if (angles.bottom_top_left) {
      ctx.fillText(angles.bottom_top_left, bx - 25, by - 18);
    }
    if (angles.bottom_top_right) {
      ctx.fillText(angles.bottom_top_right, bx + 20, by - 18);
    }
    if (angles.bottom_bottom_left) {
      ctx.fillText(angles.bottom_bottom_left, bx - 20, by + 18);
    }
    if (angles.bottom_bottom_right) {
      ctx.fillText(angles.bottom_bottom_right, bx + 25, by + 18);
    }

    // Fallback
    if (angles.a) {
      ctx.fillText(angles.a, tx + 20, ty - 18);
    }
    if (angles.b) {
      ctx.fillText(angles.b, bx - 20, by + 18);
    }
    if (angles.x) {
      ctx.fillText(angles.x, bx - 20, by + 18);
    }
  }
}

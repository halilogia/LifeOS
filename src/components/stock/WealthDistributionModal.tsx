import type { StockPortfolioItem } from "@/types/stock.js";
import { formatPrice } from "@/services/bistService.js";

interface WealthDistributionModalProps {
  cashBalance: number;
  totalWealth: number;
  portfolio: StockPortfolioItem[];
  /** Symbol → current market price map (fallback to buyPrice). */
  prices: Map<string, number>;
  onClose: () => void;
}

interface PieSegment {
  label: string;
  value: number;
  color: string;
  path: string;
}

const CX = 60;
const CY = 60;
const R = 50;

function polarToCartesian(angleDeg: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180; // start at 12 o'clock
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

/** Build filled pie slice paths. Each slice is an SVG arc path. */
function buildPieSegments(
  segments: Array<{ label: string; value: number; color: string }>,
  total: number,
): PieSegment[] {
  let acc = 0;
  return segments.map((seg) => {
    const frac = total > 0 ? seg.value / total : 0;
    const startAngle = acc * 360;
    const endAngle = (acc + frac) * 360;
    acc += frac;

    const start = polarToCartesian(startAngle);
    const end = polarToCartesian(endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    // Full circle edge case (single 100% slice).
    const path =
      frac >= 0.9999
        ? `M ${CX} ${CY} m -${R} 0 a ${R} ${R} 0 1 0 ${R * 2} 0 a ${R} ${R} 0 1 0 -${R * 2} 0`
        : `M ${CX} ${CY} L ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;

    return { ...seg, path };
  });
}

const PALETTE = [
  "#22d3ee", // neon cyan (cash)
  "#e879f9", // neon magenta
  "#facc15", // electric yellow
  "#4ade80", // acid green
  "#fb7185", // hot rose
  "#818cf8", // indigo
  "#fb923c", // orange
  "#34d399", // mint
];

export function WealthDistributionModal({
  cashBalance,
  totalWealth,
  portfolio,
  prices,
  onClose,
}: WealthDistributionModalProps) {
  // Build segments: cash first, then each holding.
  const segments = [
    {
      label: "Nakit",
      value: Math.max(cashBalance, 0),
      color: PALETTE[0],
    },
    ...portfolio.map((item, i) => {
      const price = prices.get(item.symbol.toUpperCase()) ?? item.buyPrice;
      return {
        label: item.symbol.replace(/\.IS$/i, ""),
        value: price * item.lotCount,
        color: PALETTE[(i + 1) % PALETTE.length],
      };
    }),
  ];

  const pie = buildPieSegments(segments, totalWealth);

  return (
    <div
      className="settings-panel active"
      onClick={onClose}
      style={{ zIndex: 1002 }}
    >
      <div
        className="settings-content"
        style={{ maxWidth: "440px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <h2>Varlık Dağılımı</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            padding: "16px 0",
          }}
        >
          {/* Toplam Varlık */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Toplam Varlık
            </div>
            <div
              style={{
                fontSize: "1.6rem",
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              {formatPrice(totalWealth)}
            </div>
          </div>

          {/* Cyberpunk pie chart — dual-layer slices */}
          <svg viewBox="0 0 120 120" width="210" height="210">
            {pie.map((seg) => (
              <g key={seg.label}>
                {/* Alt katman: koyu ton — derinlik */}
                <path d={seg.path} fill={seg.color} opacity="0.35" />
                {/* Üst katman: parlak ton */}
                <path d={seg.path} fill={seg.color} opacity="0.9" />
              </g>
            ))}
          </svg>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              width: "100%",
            }}
          >
            {pie.map((seg) => {
              const pct =
                totalWealth > 0
                  ? ((seg.value / totalWealth) * 100).toFixed(1)
                  : "0.0";
              return (
                <div
                  key={seg.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--card-border)",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "3px",
                        background: seg.color,
                        display: "inline-block",
                      }}
                    />
                    {seg.label}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--text-primary)",
                        fontWeight: 600,
                      }}
                    >
                      {formatPrice(seg.value)}
                    </span>
                    <span
                      style={{
                        color: "var(--text-secondary)",
                        minWidth: "44px",
                        textAlign: "right",
                      }}
                    >
                      %{pct}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

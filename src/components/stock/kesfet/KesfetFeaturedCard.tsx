import { IconSparkles, IconBookmark, IconChart } from "./kesfetIcons.js";

export interface FeaturedStock {
  sym: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
  tlVolume: number;
  isUp: boolean;
}

interface KesfetFeaturedCardProps {
  t: Record<string, string>;
  featuredStocks: FeaturedStock[];
  onOpenAiModal: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
  onOpenWatchlistModal: (symbol: string) => void;
}

export function KesfetFeaturedCard({
  t,
  featuredStocks,
  onOpenAiModal,
  onOpenChart,
  onOpenWatchlistModal,
}: KesfetFeaturedCardProps) {
  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(139, 92, 246, 0.25)",
        borderRadius: "16px",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: "1rem",
          color: "#f8fafc",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          paddingBottom: "10px",
        }}
      >
        <IconSparkles />
        <span>{t.stock_ai_featured_title}</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "10px",
        }}
      >
        {featuredStocks.map((item, idx) => {
          const scoreLabel =
            item.changePercent >= 5
              ? t.stock_featured_score_bull_high
              : item.changePercent > 0
                ? t.stock_featured_score_bull
                : item.changePercent === 0
                  ? t.stock_featured_score_neutral
                  : t.stock_featured_score_bear;

          let tagLabel = t.stock_tag_normal_flow;
          let tagBg = "rgba(139, 92, 246, 0.15)";
          let tagColor = "#c084fc";

          if (idx === 0 && item.tlVolume > 0) {
            tagLabel = t.stock_tag_volume_leader;
            tagBg = "rgba(59, 130, 246, 0.15)";
            tagColor = "#60a5fa";
          } else if (item.changePercent >= 3.0) {
            tagLabel = t.stock_tag_strong_momentum;
            tagBg = "rgba(16, 185, 129, 0.15)";
            tagColor = "#34d399";
          } else if (item.changePercent > 0) {
            tagLabel = t.stock_tag_positive_trend;
            tagBg = "rgba(16, 185, 129, 0.15)";
            tagColor = "#34d399";
          } else if (item.changePercent < 0) {
            tagLabel = t.stock_tag_correction;
            tagBg = "rgba(239, 68, 68, 0.15)";
            tagColor = "#f87171";
          }

          return (
            <div
              key={item.sym}
              style={{
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "#f8fafc" }}>
                    {item.sym}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    {item.name}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    padding: "2px 6px",
                    borderRadius: "6px",
                    background: tagBg,
                    color: tagColor,
                    fontWeight: 600,
                  }}
                >
                  {tagLabel}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "2px",
                }}
              >
                <div style={{ fontWeight: 700, color: "#f1f5f9" }}>
                  {item.price > 0 ? `₺${item.price.toFixed(2)}` : "—"}
                </div>
                <span
                  className={`stock-card-badge ${
                    item.isUp
                      ? "stock-badge-positive"
                      : "stock-badge-negative"
                  }`}
                  style={{ fontSize: "0.75rem" }}
                >
                  {item.isUp ? "+" : ""}
                  {item.changePercent.toFixed(2)}%
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  marginTop: "4px",
                }}
              >
                <button
                  className="stock-btn stock-btn-ai"
                  style={{ flex: 1, padding: "4px 8px", fontSize: "0.72rem" }}
                  onClick={() => onOpenAiModal(item.sym)}
                >
                  <IconSparkles />
                  <span>{t.stock_ai_analysis}</span>
                </button>
                <button
                  className="stock-btn stock-btn-secondary"
                  style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                  onClick={() => onOpenWatchlistModal(item.sym)}
                  title={t.stock_add_watchlist}
                >
                  <IconBookmark />
                </button>
                <button
                  className="stock-btn stock-btn-secondary"
                  style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                  onClick={() => onOpenChart(item.sym)}
                  title={t.stock_chart}
                >
                  <IconChart />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

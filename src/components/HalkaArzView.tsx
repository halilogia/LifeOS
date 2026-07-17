import { useState, useEffect, useCallback, useRef } from "preact/hooks";
import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import {
  fetchActiveIPOs,
  fetchIPOHistory,
  IPOEntry,
} from "@/services/ipoService.js";
import {
  fetchStockPrices,
  refreshStockPrices,
  POPULAR_BIST_STOCKS,
  StockQuote,
  formatPrice,
  formatVolume,
  formatMarketCap,
  fetchStockHistory,
  StockHistoryItem,
} from "@/services/bistService.js";

interface HalkaArzViewProps {
  lang: Language;
}

type TabId = "active" | "upcoming" | "history" | "stocks";

// ── Format helpers ────────────────────────────────────────────────────────────

function formatDate(dateStr: string, lang: Language): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    if (lang === "tr") {
      const months = [
        "Oca", "Şub", "Mar", "Nis", "May", "Haz",
        "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
      ];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function IconChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconTag() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function IconTrendUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// ── IPO Status helper ─────────────────────────────────────────────────────────

function statusLabel(status: IPOEntry["status"], t: (typeof translations)["tr"]): string {
  switch (status) {
    case "active":    return t.ipo_status_active;
    case "upcoming":  return t.ipo_status_upcoming;
    case "completed": return t.ipo_status_completed;
    case "cancelled": return t.ipo_status_cancelled;
  }
}

// ── IPO Card ──────────────────────────────────────────────────────────────────

function IpoCard({ ipo, lang, t }: { ipo: IPOEntry; lang: Language; t: (typeof translations)["tr"] }) {
  return (
    <div class={`ipo-card status-${ipo.status}`}>
      {/* Header */}
      <div class="ipo-card-header">
        <div class="ipo-company-info">
          <h3 class="ipo-company-name">{ipo.name}</h3>
          {ipo.ticker && <span class="ipo-ticker-badge">{ipo.ticker}</span>}
        </div>
        <div class={`ipo-status-badge status-${ipo.status}`}>
          <span class="ipo-status-dot" />
          {statusLabel(ipo.status, t)}
        </div>
      </div>

      {/* Details */}
      <div class="ipo-card-details">
        <div class="ipo-detail-row">
          <span class="ipo-detail-label">
            <IconCalendar />
            {t.ipo_dates}
          </span>
          <span class="ipo-detail-value">
            {formatDate(ipo.startDate, lang)} — {formatDate(ipo.endDate, lang)}
          </span>
        </div>
        <div class="ipo-detail-row">
          <span class="ipo-detail-label">
            <IconTag />
            {t.ipo_price_range}
          </span>
          <span class="ipo-detail-value">{ipo.priceRange}</span>
        </div>
        <div class="ipo-detail-row">
          <span class="ipo-detail-label">{t.ipo_sector}</span>
          <span class="ipo-sector-chip">{ipo.sector}</span>
        </div>
      </div>

      {/* Footer */}
      {ipo.kapUrl && (
        <div class="ipo-card-footer">
          <a
            href={ipo.kapUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="ipo-kap-link"
          >
            {t.ipo_view_kap}
            <IconExternalLink />
          </a>
        </div>
      )}
    </div>
  );
}

// ── Custom Stock Chart Component ──────────────────────────────────────────────

interface CustomStockChartProps {
  symbol: string;
  lang: Language;
}

function CustomStockChart({ symbol, lang }: CustomStockChartProps) {
  const [range, setRange] = useState<"1mo" | "3mo" | "6mo" | "1y">("1mo");
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
    if (loading || history.length === 0) return;
    draw();
  }, [history, loading, hoveredPoint]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
    if (!canvas || history.length === 0) return;

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

// ── Stock Card ────────────────────────────────────────────────────────────────

function StockCard({ quote, t, onClick }: { quote: StockQuote; t: (typeof translations)["tr"]; onClick: () => void }) {
  const meta = POPULAR_BIST_STOCKS.find((s) => s.symbol === quote.symbol);
  const sector = meta?.sector ?? "";

  const direction =
    quote.error
      ? "neutral"
      : quote.change > 0
        ? "positive"
        : quote.change < 0
          ? "negative"
          : "neutral";

  const changeSign = quote.change > 0 ? "+" : "";

  return (
    <div class={`stock-card ${direction} ${quote.error ? "error-card" : ""}`} onClick={onClick}>
      {/* Header */}
      <div class="stock-card-header">
        <div class="stock-symbol-group">
          <span class="stock-symbol">{quote.symbol.replace(".IS", "")}</span>
          <span class="stock-company-name">{quote.shortName}</span>
        </div>
        {sector && <span class="stock-sector-tag">{sector}</span>}
      </div>

      {/* Price */}
      <div class="stock-price-block">
        {quote.error ? (
          <span class="stock-price error-price">—</span>
        ) : (
          <span class="stock-price">{formatPrice(quote.price, quote.currency)}</span>
        )}
        {!quote.error && (
          <div class="stock-change-row">
            <span class={`stock-change-value ${direction === "positive" ? "stock-arrow-up" : direction === "negative" ? "stock-arrow-down" : ""}`}>
              {changeSign}{formatPrice(quote.change, quote.currency)}
            </span>
            <span class="stock-change-pct">
              {changeSign}{quote.changePercent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Meta */}
      {!quote.error && (
        <div class="stock-meta">
          <div class="stock-meta-row">
            <span class="stock-meta-label">{t.stock_high}</span>
            <span class="stock-meta-value">{formatPrice(quote.dayHigh, quote.currency)}</span>
          </div>
          <div class="stock-meta-row">
            <span class="stock-meta-label">{t.stock_low}</span>
            <span class="stock-meta-value">{formatPrice(quote.dayLow, quote.currency)}</span>
          </div>
          <div class="stock-meta-row">
            <span class="stock-meta-label">{t.stock_volume}</span>
            <span class="stock-meta-value">{formatVolume(quote.volume)}</span>
          </div>
          {quote.marketCap && (
            <div class="stock-meta-row">
              <span class="stock-meta-label">{t.stock_market_cap}</span>
              <span class="stock-meta-value">{formatMarketCap(quote.marketCap)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export function HalkaArzView({ lang }: HalkaArzViewProps) {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<TabId>("active");

  // IPO states
  const [activeIPOs, setActiveIPOs] = useState<IPOEntry[]>([]);
  const [historyIPOs, setHistoryIPOs] = useState<IPOEntry[]>([]);
  const [ipoLoading, setIpoLoading] = useState(true);
  const [ipoError, setIpoError] = useState(false);
  const [ipoIsFallback, setIpoIsFallback] = useState(false);

  // Stock states
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState(false);
  const [stocksLoaded, setStocksLoaded] = useState(false);
  const [stockLastUpdated, setStockLastUpdated] = useState<number | null>(null);
  const [stockRefreshing, setStockRefreshing] = useState(false);
  const [selectedStockForChart, setSelectedStockForChart] = useState<string | null>(null);
  const [chartFrameLoading, setChartFrameLoading] = useState(true);

  // Derived filter states
  const openIPOs = activeIPOs.filter((ipo) => ipo.status === "active");
  const upcomingIPOs = activeIPOs.filter((ipo) => ipo.status === "upcoming");

  // ── Load IPOs on mount ──────────────────────────────────────────────────────
  const loadIPOs = useCallback(async () => {
    setIpoLoading(true);
    setIpoError(false);
    try {
      const [activeResult, historyResult] = await Promise.all([
        fetchActiveIPOs(),
        fetchIPOHistory(30),
      ]);
      setActiveIPOs(activeResult.data);
      setHistoryIPOs(historyResult.data);
      setIpoIsFallback(activeResult.isFallback);
    } catch {
      setIpoError(true);
    } finally {
      setIpoLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIPOs();
  }, [loadIPOs]);

  // ── Load stocks when tab is opened ─────────────────────────────────────────
  const loadStocks = useCallback(async () => {
    if (stocksLoaded) return;
    setStockLoading(true);
    setStockError(false);
    try {
      const data = await fetchStockPrices();
      setStocks(data);
      setStockLastUpdated(Date.now());
      setStocksLoaded(true);
    } catch {
      setStockError(true);
    } finally {
      setStockLoading(false);
    }
  }, [stocksLoaded]);

  useEffect(() => {
    if (activeTab === "stocks") {
      loadStocks();
    }
  }, [activeTab, loadStocks]);

  // ── Refresh stocks ──────────────────────────────────────────────────────────
  const handleRefreshStocks = async () => {
    setStockRefreshing(true);
    setStockError(false);
    try {
      const data = await refreshStockPrices();
      setStocks(data);
      setStockLastUpdated(Date.now());
    } catch {
      setStockError(true);
    } finally {
      setStockRefreshing(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div id="halka-arz-view" class="view-content active">
      <div class="halka-arz-container">

        {/* Header */}
        <div class="halka-arz-header">
          <div class="halka-arz-title-group">
            <div class="halka-arz-icon">
              <IconChart />
            </div>
            <div>
              <h1 class="halka-arz-page-title">{t.view_halka_arz}</h1>
              <p class="halka-arz-page-subtitle">BIST · KAP · Yahoo Finance</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div class="halka-arz-tabs">
          <button
            id="ha-tab-active"
            class={`ha-tab-btn ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            <IconTrendUp />
            {t.ipo_tab_active}
            {!ipoLoading && !ipoError && (
              <span class="ha-tab-badge">{openIPOs.length}</span>
            )}
          </button>
          <button
            id="ha-tab-upcoming"
            class={`ha-tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            <IconCalendar />
            {t.ipo_tab_upcoming}
            {!ipoLoading && !ipoError && (
              <span class="ha-tab-badge">{upcomingIPOs.length}</span>
            )}
          </button>
          <button
            id="ha-tab-history"
            class={`ha-tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <IconClock />
            {t.ipo_tab_history}
            {!ipoLoading && !ipoError && (
              <span class="ha-tab-badge">{historyIPOs.length}</span>
            )}
          </button>
          <button
            id="ha-tab-stocks"
            class={`ha-tab-btn ${activeTab === "stocks" ? "active" : ""}`}
            onClick={() => setActiveTab("stocks")}
          >
            <IconChart />
            {t.ipo_tab_stocks}
          </button>
        </div>

        {/* Fallback notice (IPO tabs) */}
        {ipoIsFallback && (activeTab === "active" || activeTab === "upcoming" || activeTab === "history") && (
          <div class="halka-arz-fallback-notice">
            <IconWarning />
            {t.ipo_fallback_notice}
          </div>
        )}

        {/* ── TAB: Active IPOs ─────────────────────────────────────────── */}
        {activeTab === "active" && (
          <div id="ha-active-container">
            {ipoLoading && (
              <div class="ha-loading">
                <div class="ha-spinner" />
                <span>{t.ipo_loading}</span>
              </div>
            )}
            {!ipoLoading && ipoError && (
              <div class="ha-error">
                <span>{t.ipo_error}</span>
                <button id="ha-retry-btn" class="ha-retry-btn" onClick={loadIPOs}>
                  {t.ipo_refresh}
                </button>
              </div>
            )}
            {!ipoLoading && !ipoError && openIPOs.length === 0 && (
              <div class="ha-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style={{ opacity: 0.35 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                <p>{t.ipo_empty_active}</p>
              </div>
            )}
            {!ipoLoading && !ipoError && openIPOs.length > 0 && (
              <div class="ipo-grid">
                {openIPOs.map((ipo) => (
                  <IpoCard key={ipo.id} ipo={ipo} lang={lang} t={t} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Upcoming IPOs ───────────────────────────────────────── */}
        {activeTab === "upcoming" && (
          <div id="ha-upcoming-container">
            {ipoLoading && (
              <div class="ha-loading">
                <div class="ha-spinner" />
                <span>{t.ipo_loading}</span>
              </div>
            )}
            {!ipoLoading && ipoError && (
              <div class="ha-error">
                <span>{t.ipo_error}</span>
                <button class="ha-retry-btn" onClick={loadIPOs}>
                  {t.ipo_refresh}
                </button>
              </div>
            )}
            {!ipoLoading && !ipoError && upcomingIPOs.length === 0 && (
              <div class="ha-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style={{ opacity: 0.35 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                <p>{t.ipo_empty_upcoming}</p>
              </div>
            )}
            {!ipoLoading && !ipoError && upcomingIPOs.length > 0 && (
              <div class="ipo-grid">
                {upcomingIPOs.map((ipo) => (
                  <IpoCard key={ipo.id} ipo={ipo} lang={lang} t={t} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: History ─────────────────────────────────────────────── */}
        {activeTab === "history" && (
          <div id="ha-history-container">
            {ipoLoading && (
              <div class="ha-loading">
                <div class="ha-spinner" />
                <span>{t.ipo_loading}</span>
              </div>
            )}
            {!ipoLoading && ipoError && (
              <div class="ha-error">
                <span>{t.ipo_error}</span>
                <button class="ha-retry-btn" onClick={loadIPOs}>
                  {t.ipo_refresh}
                </button>
              </div>
            )}
            {!ipoLoading && !ipoError && historyIPOs.length === 0 && (
              <div class="ha-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style={{ opacity: 0.35 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                <p>{t.ipo_empty_history}</p>
              </div>
            )}
            {!ipoLoading && !ipoError && historyIPOs.length > 0 && (
              <div class="ipo-grid">
                {historyIPOs.map((ipo) => (
                  <IpoCard key={ipo.id} ipo={ipo} lang={lang} t={t} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Stocks ──────────────────────────────────────────────── */}
        {activeTab === "stocks" && (
          <div id="ha-stocks-container">
            <div class="stock-grid-header">
              <div>
                <span class="stock-delay-note">
                  <IconClock />
                  {t.stock_data_delayed}
                </span>
                {stockLastUpdated && (
                  <span class="stock-last-updated">
                    {" · "}{t.stock_cache_note} {formatTime(stockLastUpdated)}
                  </span>
                )}
              </div>
              <button
                id="ha-refresh-stocks-btn"
                class={`ha-refresh-btn ${stockRefreshing ? "spinning" : ""}`}
                onClick={handleRefreshStocks}
                disabled={stockLoading || stockRefreshing}
              >
                <IconRefresh />
                {t.stock_refresh}
              </button>
            </div>

            {(stockLoading || stockRefreshing) && (
              <div class="ha-loading">
                <div class="ha-spinner" />
                <span>{t.stock_loading}</span>
              </div>
            )}

            {!stockLoading && !stockRefreshing && stockError && (
              <div class="ha-error">
                <span>{t.stock_error}</span>
                <button class="ha-retry-btn" onClick={() => { setStocksLoaded(false); loadStocks(); }}>
                  {t.ipo_refresh}
                </button>
              </div>
            )}

             {!stockLoading && !stockRefreshing && !stockError && stocks.length > 0 && (
              <div class="stock-grid">
                {stocks.map((q) => (
                  <StockCard
                    key={q.symbol}
                    quote={q}
                    t={t}
                    onClick={() => {
                      setChartFrameLoading(true);
                      setSelectedStockForChart(q.symbol.replace(".IS", ""));
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Custom Historical Candlestick Chart Modal */}
      {selectedStockForChart && (
        <div class="chart-modal-overlay" onClick={() => setSelectedStockForChart(null)}>
          <div class="chart-modal-content" style={{ maxWidth: "850px", width: "95%", height: "550px" }} onClick={(e) => e.stopPropagation()}>
            <div class="chart-modal-header">
              <h2>{selectedStockForChart} {lang === "tr" ? "Grafiği" : "Chart"}</h2>
              <button class="chart-close-btn" onClick={() => setSelectedStockForChart(null)}>
                {lang === "tr" ? "Kapat" : "Close"}
              </button>
            </div>
            <div style={{ position: "relative", width: "100%", height: "calc(100% - 60px)" }}>
              <CustomStockChart symbol={selectedStockForChart} lang={lang} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

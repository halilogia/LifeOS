import { useState, useEffect, useCallback } from "preact/hooks";
import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import { IpoCard } from "@/components/halkaarz/IpoCard.js";
import { StockCard } from "@/components/halkaarz/StockCard.js";
import { CustomStockChart } from "@/components/halkaarz/CustomStockChart.js";
import {
  fetchActiveIPOs,
  fetchIPOHistory,
  IPOEntry,
} from "@/services/ipoService.js";
import {
  fetchStockPrices,
  refreshStockPrices,
  StockQuote,
} from "@/services/bistService.js";

interface HalkaArzViewProps {
  lang: Language;
}

type TabId = "active" | "upcoming" | "history" | "stocks";

// ── Format helpers ────────────────────────────────────────────────────────────



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



function IconTrendUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
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
    if (stocksLoaded) {return;}
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

/**
 * BistView.tsx
 * Midas Tarzı BIST Borsa OS ve Portföy Yönetim Ekranı.
 * Canlı Hisse Arama, Portföy Takibi, Kural Motoru, AI Özeti ve KAP Bildirimleri.
 */

import { useState, useEffect, useCallback } from "preact/hooks";
import { Language } from "@/types/types.js";

import {
  fetchStockPrices,
  fetchStockQuote,
  POPULAR_BIST_STOCKS,
  StockQuote,
  formatPrice,
} from "@/services/bistService.js";
import { ChromeStorageStockRepository } from "@/infrastructure/persistence/ChromeStorageStockRepository.js";
import { evaluateStockRules } from "@/services/stockRuleEngine.js";
import type {
  StockPortfolioItem,
  StockRule,
  StockAlertLog,
} from "@/types/stock.js";

import { PortfolioSummaryCard } from "@/components/stock/PortfolioSummaryCard.js";
import { StockWatchlistTable } from "@/components/stock/StockWatchlistTable.js";
import { AddStockModal } from "@/components/stock/AddStockModal.js";
import { RuleBuilderModal } from "@/components/stock/RuleBuilderModal.js";
import { StockAlertHistoryModal } from "@/components/stock/StockAlertHistoryModal.js";
import { StockAiAnalysisModal } from "@/components/stock/StockAiAnalysisModal.js";
import { StockAiReportTab } from "@/components/stock/StockAiReportTab.js";
import { StockKapNewsModal } from "@/components/stock/StockKapNewsModal.js";
import { CustomStockChart } from "@/components/stock/CustomStockChart.js";

interface BistViewProps {
  lang: Language;
}

type TabId = "portfolio" | "ai-report" | "chart";

const stockRepository = new ChromeStorageStockRepository();

function IconSearch() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function IconNewspaper() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M18 18h-8" />
      <path d="M10 6h8v4h-8V6Z" />
    </svg>
  );
}

function IconSparkles() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
    </svg>
  );
}

export function BistView({ lang: _lang }: BistViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("portfolio");

  // Portfolio & Rules states
  const [portfolio, setPortfolio] = useState<StockPortfolioItem[]>([]);
  const [rules, setRules] = useState<StockRule[]>([]);
  const [alertLogs, setAlertLogs] = useState<StockAlertLog[]>([]);
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [_loading, setLoading] = useState(false);

  // Search states (Midas-style search bar)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchAddingSymbol, setSearchAddingSymbol] = useState<string | null>(
    null,
  );

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalPrefill, setAddModalPrefill] = useState<string>("");
  const [ruleModalSymbol, setRuleModalSymbol] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showKapNewsModal, setShowKapNewsModal] = useState(false);
  const [aiModalSymbol, setAiModalSymbol] = useState<string | null>(null);
  const [selectedChartSymbol, setSelectedChartSymbol] = useState<string | null>(
    null,
  );

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [savedPortfolio, savedRules, savedLogs, popularQuotes] =
        await Promise.all([
          stockRepository.getPortfolio(),
          stockRepository.getRules(),
          stockRepository.getAlertLogs(),
          fetchStockPrices(),
        ]);

      setPortfolio(savedPortfolio);
      setRules(savedRules);
      setAlertLogs(savedLogs);

      const customSymbols = savedPortfolio.map((p) => p.symbol);
      let allQuotes = [...popularQuotes];

      if (customSymbols.length > 0) {
        const extraQuotes = await Promise.all(
          customSymbols.map((sym) => fetchStockQuote(sym)),
        );
        const map = new Map<string, StockQuote>();
        for (const q of [...popularQuotes, ...extraQuotes]) {
          map.set(q.symbol.toUpperCase(), q);
        }
        allQuotes = Array.from(map.values());
      }

      setQuotes(allQuotes);

      if (savedPortfolio.length > 0 && savedRules.length > 0) {
        const evalResult = evaluateStockRules(
          allQuotes,
          savedPortfolio,
          savedRules,
        );
        if (evalResult.alerts.length > 0) {
          for (const alert of evalResult.alerts) {
            await stockRepository.addAlertLog(alert);
          }
          const updatedLogs = await stockRepository.getAlertLogs();
          setAlertLogs(updatedLogs);
        }
      }
    } catch (e) {
      console.error("BistView load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handlers
  const handleSaveStock = async (item: Omit<StockPortfolioItem, "id">) => {
    const newItem: StockPortfolioItem = {
      ...item,
      id: `stock-${Date.now()}`,
    };
    const updated = [newItem, ...portfolio];
    setPortfolio(updated);
    await stockRepository.savePortfolio(updated);
    loadData();
  };

  const handleDeleteStock = async (id: string) => {
    const updated = portfolio.filter((p) => p.id !== id);
    setPortfolio(updated);
    await stockRepository.savePortfolio(updated);
  };

  const handleSaveRule = async (rule: Omit<StockRule, "id" | "createdAt">) => {
    const newRule: StockRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newRule, ...rules];
    setRules(updated);
    await stockRepository.saveRules(updated);
  };

  const handleClearAlertLogs = async () => {
    await stockRepository.saveAlertLogs([]);
    setAlertLogs([]);
  };

  // Quick add from search results
  const handleQuickAddStock = (symbolClean: string) => {
    setAddModalPrefill(symbolClean);
    setShowAddModal(true);
  };

  // Filter BIST catalog stocks for Midas Search
  const qClean = searchQuery.trim().toLowerCase();
  const searchResults = qClean
    ? POPULAR_BIST_STOCKS.filter(
        (s) =>
          s.symbol.toLowerCase().includes(qClean) ||
          s.displayName.toLowerCase().includes(qClean) ||
          s.sector.toLowerCase().includes(qClean),
      )
    : [];

  // Metrics
  let totalPortfolioValue = 0;
  let totalPortfolioCost = 0;
  let dailyProfitLossTotal = 0;

  const quoteMap = new Map<string, StockQuote>();
  for (const q of quotes) {
    quoteMap.set(q.symbol.replace(/\.IS$/, "").toUpperCase(), q);
  }

  for (const item of portfolio) {
    const sym = item.symbol.replace(/\.IS$/, "").toUpperCase();
    const q = quoteMap.get(sym);
    const price = q ? q.price : item.buyPrice;
    const itemVal = price * item.lotCount;
    const itemCost = item.buyPrice * item.lotCount;
    totalPortfolioValue += itemVal;
    totalPortfolioCost += itemCost;
    if (q) {
      dailyProfitLossTotal += q.change * item.lotCount;
    }
  }

  const dailyProfitLossPercent =
    totalPortfolioCost > 0
      ? (dailyProfitLossTotal / totalPortfolioCost) * 100
      : 0;
  const activeRulesCount = rules.filter((r) => r.isActive).length;

  return (
    <div className="stock-dashboard">
      {/* 🟢 Midas Tarzı Canlı BIST Hisse Arama Çubuğu */}
      <div
        style={{
          background: "rgba(30, 41, 59, 0.65)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{ color: "#818cf8", display: "flex", alignItems: "center" }}
          >
            <IconSearch />
          </div>
          <input
            type="text"
            className="stock-input"
            style={{
              flex: 1,
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "0.98rem",
              padding: "10px 14px",
            }}
            placeholder="🔍 Tüm BIST Hisselerini Ara... (Örn: THYAO, Garanti, Aselsan, Şişecam)"
            value={searchQuery}
            onInput={(e) =>
              setSearchQuery((e.target as HTMLInputElement).value)
            }
          />
          {searchQuery && (
            <button
              className="stock-btn stock-btn-secondary"
              style={{ padding: "6px 12px", fontSize: "0.8rem" }}
              onClick={() => setSearchQuery("")}
            >
              Temizle
            </button>
          )}
        </div>

        {/* Midas Arama Sonuçları Paneli */}
        {searchQuery.trim().length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "320px",
              overflowY: "auto",
              background: "rgba(15, 23, 42, 0.95)",
              borderRadius: "12px",
              border: "1px solid rgba(129, 140, 248, 0.3)",
              padding: "12px",
              marginTop: "4px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#94a3b8",
                marginBottom: "4px",
              }}
            >
              BIST HİSSE ARAMA SONUÇLARI ({searchResults.length})
            </div>

            {searchResults.length === 0 ? (
              <div
                style={{
                  color: "#64748b",
                  padding: "12px",
                  textAlign: "center",
                  fontSize: "0.88rem",
                }}
              >
                "{searchQuery}" aramanızla eşleşen BIST hissesi bulunamadı.
              </div>
            ) : (
              searchResults.map((item) => {
                const symClean = item.symbol.replace(/\.IS$/, "");
                const liveQ = quoteMap.get(symClean);
                const isPos = liveQ ? liveQ.changePercent >= 0 : true;

                return (
                  <div
                    key={item.symbol}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justify: "space-between",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "rgba(30, 41, 59, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: "rgba(99, 102, 241, 0.2)",
                          color: "#818cf8",
                        }}
                      >
                        {symClean}
                      </span>
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#f8fafc",
                            fontSize: "0.92rem",
                          }}
                        >
                          {item.displayName}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          {item.sector}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      {liveQ ? (
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "#f8fafc",
                              fontSize: "0.95rem",
                            }}
                          >
                            {formatPrice(liveQ.price)}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: isPos ? "#4ade80" : "#f87171",
                            }}
                          >
                            {isPos ? "+" : ""}
                            {liveQ.changePercent.toFixed(2)}%
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          BIST 100
                        </span>
                      )}

                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="stock-btn stock-btn-primary"
                          style={{ padding: "5px 10px", fontSize: "0.78rem" }}
                          onClick={() => handleQuickAddStock(symClean)}
                        >
                          <IconPlus />
                          <span>+ Portföye Ekle</span>
                        </button>
                        <button
                          className="stock-btn stock-btn-secondary"
                          style={{ padding: "5px 10px", fontSize: "0.78rem" }}
                          onClick={() => {
                            setSelectedChartSymbol(symClean);
                            setActiveTab("chart");
                          }}
                        >
                          Grafik
                        </button>
                        <button
                          className="stock-btn stock-btn-ai"
                          style={{ padding: "5px 10px", fontSize: "0.78rem" }}
                          onClick={() => setAiModalSymbol(symClean)}
                        >
                          <IconSparkles />
                          <span>AI</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Action & Nav Bar */}
      <div className="stock-action-bar">
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            className={`stock-btn ${activeTab === "portfolio" ? "stock-btn-primary" : "stock-btn-secondary"}`}
            onClick={() => setActiveTab("portfolio")}
          >
            BIST Portföy & Takip Listem
          </button>
          <button
            className={`stock-btn ${activeTab === "ai-report" ? "stock-btn-primary" : "stock-btn-secondary"}`}
            onClick={() => setActiveTab("ai-report")}
          >
            <IconSparkles />
            <span>AI Borsa Özeti & Danışman</span>
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            className="stock-btn stock-btn-secondary"
            onClick={() => setShowKapNewsModal(true)}
          >
            <IconNewspaper />
            <span>KAP Haberleri</span>
          </button>
          <button
            className="stock-btn stock-btn-primary"
            onClick={() => {
              setAddModalPrefill("");
              setShowAddModal(true);
            }}
          >
            <IconPlus />
            <span>+ Hisse Ekle</span>
          </button>
          <button
            className="stock-btn stock-btn-secondary"
            onClick={() => setShowLogsModal(true)}
          >
            <IconBell />
            <span>Alarmlar ({alertLogs.length})</span>
          </button>
          <button
            className="stock-btn stock-btn-secondary"
            onClick={loadData}
            title="Canlı Verileri Yenile"
          >
            <IconRefresh />
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "portfolio" && (
        <>
          <PortfolioSummaryCard
            totalValue={totalPortfolioValue}
            totalCost={totalPortfolioCost}
            dailyProfitLoss={dailyProfitLossTotal}
            dailyProfitLossPercent={dailyProfitLossPercent}
            activeRulesCount={activeRulesCount}
            triggeredAlertsCount={alertLogs.length}
          />

          <StockWatchlistTable
            portfolio={portfolio}
            quotes={quotes}
            rules={rules}
            onAddRuleClick={(sym) => setRuleModalSymbol(sym)}
            onDeleteItem={handleDeleteStock}
            onAiAnalyzeClick={(sym) => setAiModalSymbol(sym)}
          />
        </>
      )}

      {activeTab === "ai-report" && (
        <StockAiReportTab portfolio={portfolio} quotes={quotes} />
      )}

      {activeTab === "chart" && selectedChartSymbol && (
        <CustomStockChart symbol={selectedChartSymbol} lang="tr" />
      )}

      {/* Modals */}
      {showAddModal && (
        <AddStockModal
          initialSymbol={addModalPrefill}
          onSave={handleSaveStock}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {ruleModalSymbol && (
        <RuleBuilderModal
          initialSymbol={ruleModalSymbol}
          availableSymbols={portfolio.map((p) => p.symbol.replace(/\.IS$/, ""))}
          onSave={handleSaveRule}
          onClose={() => setRuleModalSymbol(null)}
        />
      )}

      {showLogsModal && (
        <StockAlertHistoryModal
          logs={alertLogs}
          onClearLogs={handleClearAlertLogs}
          onClose={() => setShowLogsModal(false)}
        />
      )}

      {showKapNewsModal && (
        <StockKapNewsModal
          symbols={portfolio.map((p) => p.symbol.replace(/\.IS$/, ""))}
          onClose={() => setShowKapNewsModal(false)}
        />
      )}

      {aiModalSymbol && (
        <StockAiAnalysisModal
          symbol={aiModalSymbol}
          quote={quoteMap.get(aiModalSymbol.toUpperCase())}
          onClose={() => setAiModalSymbol(null)}
        />
      )}
    </div>
  );
}

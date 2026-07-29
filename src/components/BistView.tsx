/**
 * BistView.tsx
 * Midas Tarzı BIST Borsa OS, Halka Arz Takvimi ve Portföy Yönetim Ekranı.
 * Canlı Hisse Arama, Halka Arz Takibi, Portföy Takibi, Kural Motoru, AI Özeti ve KAP Bildirimleri.
 */

import { useState, useEffect, useCallback } from "preact/hooks";
import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";

import {
  fetchStockPrices,
  fetchStockQuote,
} from "@/services/bistService.js";
import type { StockQuote } from "@/types/bist.js";
import { ChromeStorageStockRepository } from "@/infrastructure/persistence/ChromeStorageStockRepository.js";
import { evaluateStockRules } from "@/services/stockRuleEngine.js";
import type {
  StockPortfolioItem,
  StockRule,
  StockAlertLog,
  StockWatchlist,
} from "@/types/stock.js";

// Extracted Sub-components
import { BistSearchBar } from "@/components/stock/BistSearchBar.js";
import { BistKesfetTab } from "@/components/stock/BistKesfetTab.js";
import { BistActionBar, BistTabId } from "@/components/stock/BistActionBar.js";
import { PortfolioSummaryCard } from "@/components/stock/PortfolioSummaryCard.js";
import { PortfolioTable } from "@/components/stock/PortfolioTable.js";
import { StockWatchlistTable } from "@/components/stock/StockWatchlistTable.js";
import { AddStockModal } from "@/components/stock/AddStockModal.js";
import { RuleBuilderModal } from "@/components/stock/RuleBuilderModal.js";
import { StockAlertHistoryModal } from "@/components/stock/StockAlertHistoryModal.js";
import { StockAiAnalysisModal } from "@/components/stock/StockAiAnalysisModal.js";
import { StockAiReportTab } from "@/components/stock/StockAiReportTab.js";
import { StockKapNewsModal } from "@/components/stock/StockKapNewsModal.js";
import { CustomStockChart } from "@/components/stock/CustomStockChart.js";
import { HalkaArzView } from "@/components/HalkaArzView.js";
import { logger } from "@/utils/logger.js";

interface BistViewProps {
  lang: Language;
}

const stockRepository = new ChromeStorageStockRepository();

export function BistView({ lang }: BistViewProps) {
  const t = getTranslation(lang);
  const [activeTab, setActiveTab] = useState<BistTabId>("portfolio");

  // Portfolio & Watchlists & Rules states
  const [portfolio, setPortfolio] = useState<StockPortfolioItem[]>([]);
  const [watchlists, setWatchlists] = useState<StockWatchlist[]>([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<string>("all");
  const [rules, setRules] = useState<StockRule[]>([]);
  const [alertLogs, setAlertLogs] = useState<StockAlertLog[]>([]);
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [, setLoading] = useState(false);

  // Search states (Midas-style search bar inside Keşfet tab)
  const [searchQuery, setSearchQuery] = useState("");

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
      const [savedPortfolio, savedWatchlists, savedRules, savedLogs, popularQuotes] =
        await Promise.all([
          stockRepository.getPortfolio(),
          stockRepository.getWatchlists(),
          stockRepository.getRules(),
          stockRepository.getAlertLogs(),
          fetchStockPrices(),
        ]);

      setPortfolio(savedPortfolio);
      setWatchlists(savedWatchlists);
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
          const updatedLogs = [...evalResult.alerts, ...savedLogs];
          setAlertLogs(updatedLogs);
          await stockRepository.saveAlertLogs(updatedLogs);
        }
      }
    } catch (err) {
      logger.error("BistView loadData error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30s live quote polling
    return () => clearInterval(interval);
  }, [loadData]);

  // Watchlist Handlers
  const handleCreateWatchlist = async (name: string) => {
    const updated = await stockRepository.createWatchlist(name);
    setWatchlists(updated);
    if (updated.length > 0) {
      setActiveWatchlistId(updated[updated.length - 1].id);
    }
  };

  const handleDeleteWatchlist = async (id: string) => {
    const updated = await stockRepository.deleteWatchlist(id);
    setWatchlists(updated);
    setActiveWatchlistId("all");
  };

  const handleToggleSymbolInWatchlist = async (watchlistId: string, symbol: string) => {
    const updated = await stockRepository.toggleSymbolInWatchlist(watchlistId, symbol);
    setWatchlists(updated);
  };

  // Handlers
  const handleSaveStock = async (itemData: Omit<StockPortfolioItem, "id">) => {
    const fullItem: StockPortfolioItem = {
      id: (itemData as StockPortfolioItem).id || `stock-${Date.now()}`,
      ...itemData,
    };
    const existingIdx = portfolio.findIndex(
      (p) => p.symbol.toUpperCase() === fullItem.symbol.toUpperCase(),
    );
    let updated: StockPortfolioItem[];
    if (existingIdx >= 0) {
      updated = [...portfolio];
      updated[existingIdx] = fullItem;
    } else {
      updated = [...portfolio, fullItem];
    }
    setPortfolio(updated);
    await stockRepository.savePortfolio(updated);
    setShowAddModal(false);
    loadData();
  };

  const handleDeleteStock = async (symbolOrId: string) => {
    const updated = portfolio.filter(
      (p) => p.id !== symbolOrId && p.symbol.toUpperCase() !== symbolOrId.toUpperCase(),
    );
    setPortfolio(updated);
    await stockRepository.savePortfolio(updated);
  };

  const handleSaveRule = async (
    ruleData: Omit<StockRule, "id" | "createdAt">,
  ) => {
    const fullRule: StockRule = {
      id: (ruleData as StockRule).id || `rule-${Date.now()}`,
      createdAt: (ruleData as StockRule).createdAt || new Date().toISOString(),
      ...ruleData,
    };
    const existingIdx = rules.findIndex((r) => r.id === fullRule.id);
    let updated: StockRule[];
    if (existingIdx >= 0) {
      updated = [...rules];
      updated[existingIdx] = fullRule;
    } else {
      updated = [...rules, fullRule];
    }
    setRules(updated);
    await stockRepository.saveRules(updated);
    setRuleModalSymbol(null);
  };

  const handleClearAlertLogs = async () => {
    setAlertLogs([]);
    await stockRepository.saveAlertLogs([]);
  };

  const handleQuickAddStock = (symbol: string) => {
    setAddModalPrefill(symbol);
    setShowAddModal(true);
  };

  const quoteMap = new Map<string, StockQuote>(
    quotes.map((q) => [q.symbol.toUpperCase(), q]),
  );

  // Portfolio Total calculations
  let totalPortfolioValue = 0;
  let totalPortfolioCost = 0;
  let dailyProfitLossTotal = 0;

  for (const item of portfolio) {
    const q = quoteMap.get(item.symbol.toUpperCase());
    const price = q && q.price > 0 ? q.price : item.buyPrice;
    const itemVal = price * item.lotCount;
    const itemCost = item.buyPrice * item.lotCount;
    totalPortfolioValue += itemVal;
    totalPortfolioCost += itemCost;
    if (q && q.price > 0) {
      dailyProfitLossTotal += q.change * item.lotCount;
    }
  }

  const dailyProfitLossPercent =
    totalPortfolioCost > 0
      ? (dailyProfitLossTotal / totalPortfolioCost) * 100
      : 0;
  const activeRulesCount = rules.filter((r) => r.isActive).length;

  const handleDeleteRule = async (ruleId: string) => {
    const updatedRules = rules.filter((r) => r.id !== ruleId);
    setRules(updatedRules);
    await stockRepository.saveRules(updatedRules);
  };

  return (
    <div className="stock-dashboard">
      {/* Action & Nav Bar */}
      <BistActionBar
        activeTab={activeTab}
        alertLogsCount={alertLogs.length}
        onTabChange={setActiveTab}
        onOpenKapNewsModal={() => setShowKapNewsModal(true)}
        onOpenAddModal={() => {
          setAddModalPrefill("");
          setShowAddModal(true);
        }}
        onOpenLogsModal={() => setShowLogsModal(true)}
        onRefreshData={loadData}
      />

      {/* TAB 1: BİST PORTFÖYÜM */}
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

          <PortfolioTable
            portfolio={portfolio}
            quotes={quotes}
            rules={rules}
            onAddRuleClick={(sym) => setRuleModalSymbol(sym)}
            onDeleteRule={handleDeleteRule}
            onDeleteItem={handleDeleteStock}
            onAiAnalyzeClick={(sym) => setAiModalSymbol(sym)}
            onOpenChart={(sym) => setSelectedChartSymbol(sym)}
          />
        </>
      )}

      {/* TAB 2: TAKİP LİSTELERİM (Midas Style Custom Watchlists) */}
      {activeTab === "watchlist" && (
        <StockWatchlistTable
          watchlists={watchlists}
          activeWatchlistId={activeWatchlistId}
          quotes={quotes}
          onSelectWatchlist={setActiveWatchlistId}
          onCreateWatchlist={handleCreateWatchlist}
          onDeleteWatchlist={handleDeleteWatchlist}
          onAddRuleClick={(sym) => setRuleModalSymbol(sym)}
          onAiAnalyzeClick={(sym) => setAiModalSymbol(sym)}
          onOpenChart={(sym) => setSelectedChartSymbol(sym)}
        />
      )}

      {/* TAB 2: KEŞFET & HISSE ARAMA (Midas Discovery & Stock Search Grid) */}
      {activeTab === "kesfet" && (
        <BistKesfetTab
          lang={lang}
          searchQuery={searchQuery}
          quoteMap={quoteMap}
          watchlists={watchlists}
          onSearchQueryChange={setSearchQuery}
          onQuickAddStock={handleQuickAddStock}
          onToggleWatchlistSymbol={handleToggleSymbolInWatchlist}
          onCreateWatchlist={handleCreateWatchlist}
          onOpenChart={(symClean) => setSelectedChartSymbol(symClean)}
          onOpenAiModal={(symClean) => setAiModalSymbol(symClean)}
        />
      )}

      {activeTab === "halka-arz" && <HalkaArzView lang={lang} />}

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
          symbols={portfolio.map((p) => p.symbol.replace(/\.IS$/i, ""))}
          lang={lang}
          onClose={() => setShowKapNewsModal(false)}
        />
      )}

      {aiModalSymbol && (
        <StockAiAnalysisModal
          lang={lang}
          symbol={aiModalSymbol}
          quote={
            quoteMap.get(aiModalSymbol.toUpperCase()) ||
            quoteMap.get(`${aiModalSymbol.toUpperCase()}.IS`)
          }
          portfolioItems={portfolio}
          onClose={() => setAiModalSymbol(null)}
        />
      )}

      {/* Interactive Stock Chart Modal Overlay */}
      {selectedChartSymbol && (
        <div
          className="chart-modal-overlay"
          onClick={() => setSelectedChartSymbol(null)}
        >
          <div
            className="chart-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="chart-modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <span>{t.stock_chart_title_live.replace("{symbol}", selectedChartSymbol.toUpperCase())}</span>
              </h2>
              <button
                className="chart-close-btn"
                onClick={() => setSelectedChartSymbol(null)}
              >
                {t.chart_close}
              </button>
            </div>
            <CustomStockChart symbol={selectedChartSymbol} lang={lang} />
          </div>
        </div>
      )}
    </div>
  );
}


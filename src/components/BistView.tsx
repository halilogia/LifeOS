/**
 * BistView.tsx
 * Midas Tarzı BIST Borsa OS, Halka Arz Takvimi ve Portföy Yönetim Ekranı.
 * Canlı Hisse Arama, Halka Arz Takibi, Portföy Takibi, Kural Motoru, AI Özeti ve KAP Bildirimleri.
 */

import { useState, useEffect, useCallback } from "preact/hooks";
import { Language } from "@/types/types.js";

import {
  fetchStockPrices,
  fetchStockQuote,
  StockQuote,
} from "@/services/bistService.js";
import { ChromeStorageStockRepository } from "@/infrastructure/persistence/ChromeStorageStockRepository.js";
import { evaluateStockRules } from "@/services/stockRuleEngine.js";
import type {
  StockPortfolioItem,
  StockRule,
  StockAlertLog,
} from "@/types/stock.js";

// Extracted Sub-components
import { BistSearchBar } from "@/components/stock/BistSearchBar.js";
import { BistKesfetTab } from "@/components/stock/BistKesfetTab.js";
import { BistActionBar, BistTabId } from "@/components/stock/BistActionBar.js";
import { PortfolioSummaryCard } from "@/components/stock/PortfolioSummaryCard.js";
import { StockWatchlistTable } from "@/components/stock/StockWatchlistTable.js";
import { AddStockModal } from "@/components/stock/AddStockModal.js";
import { RuleBuilderModal } from "@/components/stock/RuleBuilderModal.js";
import { StockAlertHistoryModal } from "@/components/stock/StockAlertHistoryModal.js";
import { StockAiAnalysisModal } from "@/components/stock/StockAiAnalysisModal.js";
import { StockAiReportTab } from "@/components/stock/StockAiReportTab.js";
import { StockKapNewsModal } from "@/components/stock/StockKapNewsModal.js";
import { CustomStockChart } from "@/components/stock/CustomStockChart.js";
import { HalkaArzView } from "@/components/HalkaArzView.js";

interface BistViewProps {
  lang: Language;
}

const stockRepository = new ChromeStorageStockRepository();

export function BistView({ lang }: BistViewProps) {
  const [activeTab, setActiveTab] = useState<BistTabId>("portfolio");

  // Portfolio & Rules states
  const [portfolio, setPortfolio] = useState<StockPortfolioItem[]>([]);
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
          const updatedLogs = [...evalResult.alerts, ...savedLogs];
          setAlertLogs(updatedLogs);
          await stockRepository.saveAlertLogs(updatedLogs);
        }
      }
    } catch (err) {
      console.error("BistView loadData error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30s live quote polling
    return () => clearInterval(interval);
  }, [loadData]);

  // Handlers
  const handleSaveStock = async (itemData: Omit<StockPortfolioItem, "id">) => {
    const fullItem: StockPortfolioItem = {
      id: (itemData as any).id || `stock-${Date.now()}`,
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

  const handleDeleteStock = async (symbol: string) => {
    const updated = portfolio.filter(
      (p) => p.symbol.toUpperCase() !== symbol.toUpperCase(),
    );
    setPortfolio(updated);
    await stockRepository.savePortfolio(updated);
  };

  const handleSaveRule = async (
    ruleData: Omit<StockRule, "id" | "createdAt">,
  ) => {
    const fullRule: StockRule = {
      id: (ruleData as any).id || `rule-${Date.now()}`,
      createdAt: (ruleData as any).createdAt || new Date().toISOString(),
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

      {/* TAB 1: MAIN PORTFOLIO (Clean Midas-style view without search bar clutter) */}
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

      {/* TAB 2: KEŞFET & HISSE ARAMA (Midas Discovery & Stock Search Grid) */}
      {activeTab === "kesfet" && (
        <BistKesfetTab
          searchQuery={searchQuery}
          quoteMap={quoteMap}
          onSearchQueryChange={setSearchQuery}
          onQuickAddStock={handleQuickAddStock}
          onOpenChart={(symClean) => {
            setSelectedChartSymbol(symClean);
            setActiveTab("chart");
          }}
          onOpenAiModal={(symClean) => setAiModalSymbol(symClean)}
        />
      )}

      {activeTab === "halka-arz" && <HalkaArzView lang={lang} />}

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

import { useState, useEffect, useCallback } from "preact/hooks";
import { Language } from "@/types/types.js";
import { fetchStockPrices, fetchStockQuote } from "@/services/bistService.js";
import type { StockQuote } from "@/types/bist.js";
import { ChromeStorageStockRepository } from "@/infrastructure/persistence/repositories/ChromeStorageStockRepository.js";
import { evaluateStockRules } from "@/services/stock/stockRuleEngine.js";
import type {
  StockPortfolioItem,
  StockRule,
  StockAlertLog,
  StockWatchlist,
} from "@/types/stock.js";
import type { BistTabId } from "@/components/stock/BistActionBar.js";
import { logger } from "@/utils/logger.js";

interface UseBistOptions {
  lang: Language;
}

const stockRepository = new ChromeStorageStockRepository();

/**
 * BIST borsa dashboard state + business logic (AGENTS.md 6.3: presentation/hooks/).
 * View sadece JSX render eder; storage, fetch, kural motoru burada yaşar.
 */
export function useBist({ lang }: UseBistOptions) {
  const [activeTab, setActiveTab] = useState<BistTabId>("portfolio");

  // Portfolio & Watchlists & Rules states
  const [portfolio, setPortfolio] = useState<StockPortfolioItem[]>([]);
  const [watchlists, setWatchlists] = useState<StockWatchlist[]>([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<string>("all");
  const [rules, setRules] = useState<StockRule[]>([]);
  const [alertLogs, setAlertLogs] = useState<StockAlertLog[]>([]);
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(false);

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
  const [sellModal, setSellModal] = useState<{
    id: string;
    symbol: string;
    currentLot: number;
    currentPrice: number;
  } | null>(null);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        savedPortfolio,
        savedWatchlists,
        savedRules,
        savedLogs,
        popularQuotes,
      ] = await Promise.all([
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
      logger.error("[BistView] loadData error:", err);
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

  const handleToggleSymbolInWatchlist = async (
    watchlistId: string,
    symbol: string,
  ) => {
    const updated = await stockRepository.toggleSymbolInWatchlist(
      watchlistId,
      symbol,
    );
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
      (p) =>
        p.id !== symbolOrId &&
        p.symbol.toUpperCase() !== symbolOrId.toUpperCase(),
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

  const handleSellStock = (
    id: string,
    symbol: string,
    currentLot: number,
    currentPrice: number,
  ) => {
    setSellModal({ id, symbol, currentLot, currentPrice });
  };

  const handleConfirmSell = async (lotToSell: number, _sellPrice: number) => {
    if (!sellModal) {
      return;
    }
    const item = portfolio.find((p) => p.id === sellModal.id);
    if (!item) {
      return;
    }

    const remaining = item.lotCount - lotToSell;
    let updated: StockPortfolioItem[];
    if (remaining <= 0) {
      updated = portfolio.filter((p) => p.id !== sellModal.id);
    } else {
      updated = portfolio.map((p) =>
        p.id === sellModal.id ? { ...p, lotCount: remaining } : p,
      );
    }
    setPortfolio(updated);
    await stockRepository.savePortfolio(updated);
    setSellModal(null);
  };

  const handleDeleteRule = async (ruleId: string) => {
    const updatedRules = rules.filter((r) => r.id !== ruleId);
    setRules(updatedRules);
    await stockRepository.saveRules(updatedRules);
  };

  // Derived data
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

  return {
    lang,
    activeTab,
    setActiveTab,
    portfolio,
    watchlists,
    activeWatchlistId,
    setActiveWatchlistId,
    rules,
    alertLogs,
    quotes,
    loading,
    searchQuery,
    setSearchQuery,
    showAddModal,
    setShowAddModal,
    addModalPrefill,
    setAddModalPrefill,
    ruleModalSymbol,
    setRuleModalSymbol,
    showLogsModal,
    setShowLogsModal,
    showKapNewsModal,
    setShowKapNewsModal,
    aiModalSymbol,
    setAiModalSymbol,
    selectedChartSymbol,
    setSelectedChartSymbol,
    sellModal,
    setSellModal,
    quoteMap,
    totalPortfolioValue,
    totalPortfolioCost,
    dailyProfitLossTotal,
    dailyProfitLossPercent,
    activeRulesCount,
    loadData,
    handleCreateWatchlist,
    handleDeleteWatchlist,
    handleToggleSymbolInWatchlist,
    handleSaveStock,
    handleDeleteStock,
    handleSaveRule,
    handleClearAlertLogs,
    handleQuickAddStock,
    handleSellStock,
    handleConfirmSell,
    handleDeleteRule,
  };
}

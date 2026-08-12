import { useState, useCallback } from "preact/hooks";
import { Language } from "@/types/types.js";
import type { StockQuote } from "@/types/bist.js";
import type { IStockRepository } from "@/domain/repositories/IStockRepository.js";
import { ChromeStorageStockRepository } from "@/infrastructure/persistence/repositories/ChromeStorageStockRepository.js";
import type { BistTabId } from "@/components/stock/common/BistActionBar.js";
import type { StockPortfolioItem } from "@/types/stock.js";

import { usePortfolio } from "@/presentation/hooks/bist/usePortfolio.js";
import { useWatchlists } from "@/presentation/hooks/bist/useWatchlists.js";
import { useStockRules } from "@/presentation/hooks/bist/useStockRules.js";
import { useStockTrading } from "@/presentation/hooks/bist/useStockTrading.js";
import { useBistQuotes } from "@/presentation/hooks/bist/useBistQuotes.js";

interface UseBistOptions {
  lang: Language;
}

const stockRepository: IStockRepository = new ChromeStorageStockRepository();

/**
 * BIST borsa dashboard — kompozisyon tuvali.
 * 5 alt-hook'u çağırır (usePortfolio, useWatchlists, useStockRules,
 * useStockTrading, useBistQuotes). Return yüzeyi korunur — BistView.tsx değişmez.
 */
export function useBist({ lang }: UseBistOptions) {
  const [activeTab, setActiveTab] = useState<BistTabId>("portfolio");

  // Search + Modal state (tek başına duran UI state'ler — alt-hook'a girmez)
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalPrefill, setAddModalPrefill] = useState<string>("");
  const [ruleModalSymbol, setRuleModalSymbol] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showKapNewsModal, setShowKapNewsModal] = useState(false);
  const [aiModalSymbol, setAiModalSymbol] = useState<string | null>(null);
  const [selectedChartSymbol, setSelectedChartSymbol] = useState<string | null>(
    null,
  );

  /* ---- Portföy alt-hook (hesaplamalar dahil) ---- */
  const quotesProxy = useRefQuotes();
  const {
    portfolio,
    setPortfolio,
    saveStock: saveStockOnly,
    deleteStock,
    quoteMap,
    totalPortfolioValue,
    totalPortfolioCost,
    dailyProfitLossTotal,
    dailyProfitLossPercent,
  } = usePortfolio(stockRepository, quotesProxy.quotes);

  /* ---- İzleme listeleri alt-hook ---- */
  const {
    watchlists,
    activeWatchlistId,
    setActiveWatchlistId,
    createWatchlist,
    deleteWatchlist,
    toggleSymbol: toggleSymbolInWatchlist,
  } = useWatchlists(stockRepository);

  /* ---- Kural motoru alt-hook ---- */
  const { rules, activeRulesCount, saveRule, deleteRule } =
    useStockRules(stockRepository);

  /* ---- Trade/nakit alt-hook ---- */
  const {
    tradeHistory,
    cashBalance,
    setCashBalance,
    openSell,
    confirmSell,
    updateCash,
    sellModal,
    setSellModal,
  } = useStockTrading(stockRepository, () => portfolio, setPortfolio);

  /* ---- Canlı fiyat + kural değerlendirme alt-hook ---- */
  const { quotes, alertLogs, loading, loadData, clearAlerts } = useBistQuotes(
    stockRepository,
    () => portfolio,
    () => rules,
  );

  // quotesProxy stores latest quotes so usePortfolio's totals are always fresh
  quotesProxy.quotes = quotes;

  // Toplam servet: nakit + portföy değeri
  const totalWealth = cashBalance.amount + totalPortfolioValue;

  /* ---- Sarıcılar (wrapper) — alt-hook'lar arası köprü ---- */

  const handleSaveStock = useCallback(
    async (itemData: Omit<StockPortfolioItem, "id">) => {
      await saveStockOnly(itemData);
      // Nakit düş: alış tutarı
      const cashCost = (itemData.buyPrice ?? 0) * (itemData.lotCount ?? 0);
      if (cashCost > 0) {
        const newCash = {
          amount: cashBalance.amount - cashCost,
          updatedAt: new Date().toISOString(),
        };
        setCashBalance(newCash);
        await stockRepository.setCashBalance(newCash);
      }
      setShowAddModal(false);
      void loadData();
    },
    [saveStockOnly, cashBalance, setCashBalance, loadData],
  );

  const handleQuickAddStock = useCallback((symbol: string) => {
    setAddModalPrefill(symbol);
    setShowAddModal(true);
  }, []);

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
    handleCreateWatchlist: createWatchlist,
    handleDeleteWatchlist: deleteWatchlist,
    handleToggleSymbolInWatchlist: toggleSymbolInWatchlist,
    handleSaveStock,
    handleDeleteStock: deleteStock,
    handleSaveRule: saveRule,
    handleClearAlertLogs: clearAlerts,
    handleQuickAddStock,
    handleSellStock: openSell,
    handleConfirmSell: confirmSell,
    handleDeleteRule: deleteRule,
    tradeHistory,
    cashBalance,
    totalWealth,
    updateCashBalance: updateCash,
  };
}

/** Ref sarıcı — quotes güncellemelerini portföy hesabına taşır. */
function useRefQuotes() {
  const ref = { quotes: [] as StockQuote[] };
  return ref;
}

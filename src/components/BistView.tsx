/**
 * BistView.tsx
 * Midas Tarzı BIST Borsa OS, Halka Arz Takvimi ve Portföy Yönetim Ekranı.
 * Canlı Hisse Arama, Halka Arz Takibi, Portföy Takibi, Kural Motoru, AI Özeti ve KAP Bildirimleri.
 * Router: tab'ları yönetir, portföy görünümü BistPortfolioTab'a devredildi (6.1).
 */

import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { useState } from "preact/hooks";
import { useBist } from "@/presentation/hooks/useBist.js";

// Extracted Sub-components
import { BistExploreTab } from "@/components/stock/explore/BistExploreTab.js";
import { BistActionBar } from "@/components/stock/common/BistActionBar.js";
import { BistPortfolioTab } from "@/components/stock/portfolio/BistPortfolioTab.js";
import { StockWatchlistTable } from "@/components/stock/watchlist/StockWatchlistTable.js";
import { AddStockModal } from "@/components/stock/portfolio/AddStockModal.js";
import { RuleBuilderModal } from "@/components/stock/analysis/RuleBuilderModal.js";
import { StockAlertHistoryModal } from "@/components/stock/analysis/StockAlertHistoryModal.js";
import { StockAiAnalysisModal } from "@/components/stock/analysis/StockAiAnalysisModal.js";
import { StockKapNewsModal } from "@/components/stock/news/StockKapNewsModal.js";
import { CustomStockChart } from "@/components/stock/chart/CustomStockChart.js";
import { HalkaArzView } from "@/components/HalkaArzView.js";

interface BistViewProps {
  lang: Language;
  onContinueToChat?: (symbol: string) => void;
}

export function BistView({ lang, onContinueToChat }: BistViewProps) {
  const t = getTranslation(lang);
  const {
    activeTab,
    setActiveTab,
    portfolio,
    watchlists,
    activeWatchlistId,
    setActiveWatchlistId,
    rules,
    alertLogs,
    quotes,
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
    tradeHistory,
    cashBalance,
    totalWealth,
    updateCashBalance,
  } = useBist({ lang });

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
        <BistPortfolioTab
          portfolio={portfolio}
          quotes={quotes}
          rules={rules}
          tradeHistory={tradeHistory}
          cashBalance={cashBalance}
          totalWealth={totalWealth}
          totalPortfolioValue={totalPortfolioValue}
          totalPortfolioCost={totalPortfolioCost}
          dailyProfitLossTotal={dailyProfitLossTotal}
          dailyProfitLossPercent={dailyProfitLossPercent}
          alertLogsCount={alertLogs.length}
          onAddRuleClick={(sym) => setRuleModalSymbol(sym)}
          onDeleteRule={handleDeleteRule}
          onDeleteItem={handleDeleteStock}
          onSellItem={handleSellStock}
          onAiAnalyzeClick={(sym) => setAiModalSymbol(sym)}
          onOpenChart={(sym) => setSelectedChartSymbol(sym)}
          sellModal={sellModal}
          setSellModal={setSellModal}
          handleConfirmSell={handleConfirmSell}
          updateCashBalance={updateCashBalance}
          getBuyPrice={(id) => portfolio.find((p) => p.id === id)?.buyPrice ?? 0}
        />
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
        <BistExploreTab
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
          onContinueToChat={
            onContinueToChat
              ? () => {
                  const sym = aiModalSymbol;
                  setAiModalSymbol(null);
                  onContinueToChat(sym);
                }
              : undefined
          }
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
                <span>
                  {t.stock_chart_title_live.replace(
                    "{symbol}",
                    selectedChartSymbol.toUpperCase(),
                  )}
                </span>
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

/**
 * BistPortfolioTab.tsx
 * BistView > TAB 1: Portföy görünümü + satış/nakit/varlık modalları.
 * BistView dosya limitini aşmasın diye ayrı (6.1).
 */

import { useState } from "preact/hooks";
import type { StockQuote } from "@/types/bist.js";
import type {
  StockPortfolioItem,
  StockTradeHistory,
  StockRule,
  StockCashBalance,
} from "@/types/stock.js";
import { PortfolioSummaryCard } from "@/components/stock/portfolio/PortfolioSummaryCard.js";
import { PortfolioTable } from "@/components/stock/portfolio/PortfolioTable.js";
import { SellStockModal } from "@/components/stock/portfolio/SellStockModal.js";
import { StockTradeHistoryModal } from "@/components/stock/portfolio/StockTradeHistoryModal.js";
import { CashBalanceModal } from "@/components/stock/portfolio/CashBalanceModal.js";
import { WealthDistributionModal } from "@/components/stock/portfolio/WealthDistributionModal.js";

export interface BistPortfolioTabProps {
  portfolio: StockPortfolioItem[];
  quotes: StockQuote[];
  rules: StockRule[];
  tradeHistory: StockTradeHistory[];
  cashBalance: StockCashBalance;
  totalWealth: number;
  totalPortfolioValue: number;
  totalPortfolioCost: number;
  dailyProfitLossTotal: number;
  dailyProfitLossPercent: number;
  alertLogsCount: number;
  onAddRuleClick: (sym: string) => void;
  onDeleteRule: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onSellItem: (
    id: string,
    symbol: string,
    currentLot: number,
    currentPrice: number,
  ) => void;
  onAiAnalyzeClick: (sym: string) => void;
  onOpenChart: (sym: string) => void;
  sellModal: {
    id: string;
    symbol: string;
    currentLot: number;
    currentPrice: number;
  } | null;
  setSellModal: (
    m: {
      id: string;
      symbol: string;
      currentLot: number;
      currentPrice: number;
    } | null,
  ) => void;
  handleConfirmSell: (lotToSell: number, sellPrice: number) => void;
  updateCashBalance: (amount: number) => void;
  getBuyPrice: (id: string) => number;
}

export function BistPortfolioTab({
  portfolio,
  quotes,
  rules,
  tradeHistory,
  cashBalance,
  totalWealth,
  totalPortfolioValue,
  totalPortfolioCost,
  dailyProfitLossTotal,
  dailyProfitLossPercent,
  alertLogsCount,
  onAddRuleClick,
  onDeleteRule,
  onDeleteItem,
  onSellItem,
  onAiAnalyzeClick,
  onOpenChart,
  sellModal,
  setSellModal,
  handleConfirmSell,
  updateCashBalance,
  getBuyPrice,
}: BistPortfolioTabProps) {
  const [showTradeHistory, setShowTradeHistory] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showWealthModal, setShowWealthModal] = useState(false);

  return (
    <>
      <div onClick={() => setShowWealthModal(true)}>
        <PortfolioSummaryCard
          totalValue={totalPortfolioValue}
          totalCost={totalPortfolioCost}
          dailyProfitLoss={dailyProfitLossTotal}
          dailyProfitLossPercent={dailyProfitLossPercent}
          activeRulesCount={rules.filter((r) => r.isActive).length}
          triggeredAlertsCount={alertLogsCount}
          cashBalance={cashBalance.amount}
          totalWealth={totalWealth}
          onEditCash={(e) => {
            e.stopPropagation();
            setShowCashModal(true);
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: "4px 0 12px",
        }}
      >
        <button
          onClick={() => setShowTradeHistory(true)}
          style={{
            background: "transparent",
            border: "1px solid var(--card-border)",
            borderRadius: "10px",
            padding: "8px 14px",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Satış Geçmişi ({tradeHistory.length})
        </button>
      </div>

      <PortfolioTable
        portfolio={portfolio}
        quotes={quotes}
        rules={rules}
        onAddRuleClick={onAddRuleClick}
        onDeleteRule={onDeleteRule}
        onDeleteItem={onDeleteItem}
        onSellItem={onSellItem}
        onAiAnalyzeClick={onAiAnalyzeClick}
        onOpenChart={onOpenChart}
      />

      {/* Satış Modalı */}
      {sellModal && (
        <SellStockModal
          symbol={sellModal.symbol}
          currentLot={sellModal.currentLot}
          currentPrice={sellModal.currentPrice}
          buyPrice={getBuyPrice(sellModal.id)}
          onConfirm={handleConfirmSell}
          onClose={() => setSellModal(null)}
        />
      )}

      {/* Satış Geçmişi Modalı */}
      {showTradeHistory && (
        <StockTradeHistoryModal
          trades={tradeHistory}
          onClose={() => setShowTradeHistory(false)}
        />
      )}

      {/* Nakit Bakiyesi Modalı */}
      {showCashModal && (
        <CashBalanceModal
          currentAmount={cashBalance.amount}
          onAdd={(newAmount) => {
            updateCashBalance(newAmount);
            setShowCashModal(false);
          }}
          onClose={() => setShowCashModal(false)}
        />
      )}

      {/* Varlık Dağılımı Modalı */}
      {showWealthModal && (
        <WealthDistributionModal
          cashBalance={cashBalance.amount}
          totalWealth={totalWealth}
          portfolio={portfolio}
          prices={new Map(quotes.map((q) => [q.symbol.toUpperCase(), q.price]))}
          onClose={() => setShowWealthModal(false)}
        />
      )}
    </>
  );
}

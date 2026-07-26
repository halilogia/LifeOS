import { useState, useEffect, useCallback } from "preact/hooks";
import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { IpoCard } from "@/components/stock/IpoCard.js";
import { CustomStockChart } from "@/components/stock/CustomStockChart.js";
import {
  fetchActiveIPOs,
  fetchIPOHistory,
  IPOEntry,
} from "@/services/ipoService.js";
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

import { PortfolioSummaryCard } from "@/components/stock/PortfolioSummaryCard.js";
import { StockWatchlistTable } from "@/components/stock/StockWatchlistTable.js";
import { AddStockModal } from "@/components/stock/AddStockModal.js";
import { RuleBuilderModal } from "@/components/stock/RuleBuilderModal.js";
import { StockAlertHistoryModal } from "@/components/stock/StockAlertHistoryModal.js";
import { StockAiAnalysisModal } from "@/components/stock/StockAiAnalysisModal.js";
import { StockAiReportTab } from "@/components/stock/StockAiReportTab.js";
import { StockKapNewsModal } from "@/components/stock/StockKapNewsModal.js";

interface HalkaArzViewProps {
  lang: Language;
}

type TabId = "stocks" | "ai-report" | "active" | "history" | "chart";

const stockRepository = new ChromeStorageStockRepository();

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

export function HalkaArzView({ lang }: HalkaArzViewProps) {
  const t = getTranslation(lang);

  const [activeTab, setActiveTab] = useState<TabId>("stocks");

  // Stock Portfolio & Rules states
  const [portfolio, setPortfolio] = useState<StockPortfolioItem[]>([]);
  const [rules, setRules] = useState<StockRule[]>([]);
  const [alertLogs, setAlertLogs] = useState<StockAlertLog[]>([]);
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [_loading, setLoading] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [ruleModalSymbol, setRuleModalSymbol] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showKapNewsModal, setShowKapNewsModal] = useState(false);
  const [aiModalSymbol, setAiModalSymbol] = useState<string | null>(null);
  const [selectedChartSymbol, _setSelectedChartSymbol] = useState<
    string | null
  >(null);

  // IPO states
  const [activeIPOs, setActiveIPOs] = useState<IPOEntry[]>([]);
  const [historyIPOs, setHistoryIPOs] = useState<IPOEntry[]>([]);

  // ── Load Repository Data & Quotes ──────────────────────────────────────────
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
      console.error("HalkaArzView load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    Promise.all([fetchActiveIPOs(), fetchIPOHistory(30)]).then(
      ([act, hist]) => {
        setActiveIPOs(act.data);
        setHistoryIPOs(hist.data);
      },
    );
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
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

  // Metrik hesaplamaları
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
      {/* Üst Sekme ve Buton Barı */}
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
            className={`stock-btn ${activeTab === "stocks" ? "stock-btn-primary" : "stock-btn-secondary"}`}
            onClick={() => setActiveTab("stocks")}
          >
            BIST Portföy & Takip
          </button>
          <button
            className={`stock-btn ${activeTab === "ai-report" ? "stock-btn-primary" : "stock-btn-secondary"}`}
            onClick={() => setActiveTab("ai-report")}
          >
            <IconSparkles />
            <span>AI Borsa Raporu & Danışman</span>
          </button>
          <button
            className={`stock-btn ${activeTab === "active" ? "stock-btn-primary" : "stock-btn-secondary"}`}
            onClick={() => setActiveTab("active")}
          >
            Halka Arz Takibi ({activeIPOs.length})
          </button>
          <button
            className={`stock-btn ${activeTab === "history" ? "stock-btn-primary" : "stock-btn-secondary"}`}
            onClick={() => setActiveTab("history")}
          >
            Halka Arz Geçmişi
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
          {activeTab === "stocks" && (
            <>
              <button
                className="stock-btn stock-btn-primary"
                onClick={() => setShowAddModal(true)}
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
            </>
          )}
          <button
            className="stock-btn stock-btn-secondary"
            onClick={loadData}
            title="Canlı Verileri Yenile"
          >
            <IconRefresh />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "stocks" && (
        <>
          {/* Özet Kartlar */}
          <PortfolioSummaryCard
            totalValue={totalPortfolioValue}
            totalCost={totalPortfolioCost}
            dailyProfitLoss={dailyProfitLossTotal}
            dailyProfitLossPercent={dailyProfitLossPercent}
            activeRulesCount={activeRulesCount}
            triggeredAlertsCount={alertLogs.length}
          />

          {/* İzleme Listesi & Tablo */}
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

      {activeTab === "active" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "16px",
          }}
        >
          {activeIPOs.map((ipo) => (
            <IpoCard key={ipo.id} ipo={ipo} lang={lang} t={t} />
          ))}
        </div>
      )}

      {activeTab === "history" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "16px",
          }}
        >
          {historyIPOs.map((ipo) => (
            <IpoCard key={ipo.id} ipo={ipo} lang={lang} t={t} />
          ))}
        </div>
      )}

      {activeTab === "chart" && selectedChartSymbol && (
        <CustomStockChart symbol={selectedChartSymbol} lang={lang} />
      )}

      {/* Modals */}
      {showAddModal && (
        <AddStockModal
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

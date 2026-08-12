/**
 * useBistQuotes.ts
 * BIST canlı fiyat verisi + 30sn polling + kural değerlendirme + alert log.
 * Alt-hook — tuval (useBist.ts) orkestrasyonu yapar.
 * getPortfolio/getRules ref'lerle tutulur, loadData stabil kalır.
 */

import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import type { IStockRepository } from "@/domain/repositories/IStockRepository.js";
import type { StockQuote } from "@/types/bist.js";
import type {
  StockPortfolioItem,
  StockRule,
  StockAlertLog,
} from "@/types/stock.js";
import { fetchStockPrices, fetchStockQuote } from "@/services/bistService.js";
import { evaluateStockRules } from "@/services/stock/stockRuleEngine.js";
import { logger } from "@/utils/logger.js";

export function useBistQuotes(
  stockRepository: IStockRepository,
  getPortfolio: () => StockPortfolioItem[],
  getRules: () => StockRule[],
) {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [alertLogs, setAlertLogs] = useState<StockAlertLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Ref pattern: keep getters stable so loadData identity doesn't change
  const portfolioRef = useRef(getPortfolio);
  portfolioRef.current = getPortfolio;
  const rulesRef = useRef(getRules);
  rulesRef.current = getRules;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [savedRules, savedLogs, popularQuotes] = await Promise.all([
        stockRepository.getRules(),
        stockRepository.getAlertLogs(),
        fetchStockPrices(),
      ]);

      setAlertLogs(savedLogs);

      const portfolio = portfolioRef.current();
      const customSymbols = portfolio.map((p) => p.symbol);
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

      if (portfolio.length > 0 && savedRules.length > 0) {
        const evalResult = evaluateStockRules(allQuotes, portfolio, savedRules);
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
  }, [stockRepository]);

  useEffect(() => {
    void loadData();
    const interval = setInterval(() => {
      void loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const clearAlerts = useCallback(async () => {
    setAlertLogs([]);
    await stockRepository.saveAlertLogs([]);
  }, [stockRepository]);

  return {
    quotes,
    setQuotes,
    alertLogs,
    setAlertLogs,
    loading,
    loadData,
    clearAlerts,
  };
}

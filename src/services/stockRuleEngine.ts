/**
 * stockRuleEngine.ts
 * BIST Hisseleri için Kural Değerlendirme Motoru (Pure Functions).
 */

import type { StockQuote } from "@/services/bistService.js";
import type {
  StockPortfolioItem,
  StockRule,
  StockAlertLog,
} from "@/types/stock.js";

export interface RuleEvaluationResult {
  alerts: StockAlertLog[];
  updatedPortfolio: StockPortfolioItem[];
}

/**
 * Sembolleri standartlaştırır (örn: "THYAO.IS" veya "THYAO" -> "THYAO")
 */
export function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase().replace(/\.IS$/, "");
}

/**
 * Verilen canlı fiyat verileri, portföy ve aktif kuralları değerlendirerek
 * yeni tetiklenen alarmları ve güncellenmiş portföyü (izleyen stop için zirve fiyatlar) döndürür.
 */
export function evaluateStockRules(
  quotes: StockQuote[],
  portfolio: StockPortfolioItem[],
  rules: StockRule[],
): RuleEvaluationResult {
  const alerts: StockAlertLog[] = [];
  const updatedPortfolio = portfolio.map((item) => ({ ...item }));

  const quoteMap = new Map<string, StockQuote>();
  for (const q of quotes) {
    if (!q.error) {
      quoteMap.set(normalizeSymbol(q.symbol), q);
    }
  }

  const activeRules = rules.filter((r) => r.isActive);

  for (const rule of activeRules) {
    const sym = normalizeSymbol(rule.symbol);
    const quote = quoteMap.get(sym);
    if (!quote || quote.price <= 0) {
      continue;
    }

    const itemIndex = updatedPortfolio.findIndex(
      (p) => normalizeSymbol(p.symbol) === sym,
    );
    const item = itemIndex !== -1 ? updatedPortfolio[itemIndex] : undefined;

    // İzleyen stop için görülen en yüksek fiyatı güncelle
    if (item) {
      const currentHighest =
        item.highestPriceSeen || item.buyPrice || quote.price;
      if (quote.price > currentHighest) {
        item.highestPriceSeen = quote.price;
      }
    }

    const nowIso = new Date().toISOString();
    const displayName = quote.shortName || sym;

    switch (rule.ruleType) {
      case "RED_CANDLE": {
        if (quote.changePercent < 0) {
          alerts.push({
            id: `alert-red-${sym}-${Date.now()}`,
            symbol: sym,
            ruleType: "RED_CANDLE",
            triggerValue: quote.changePercent,
            message: `${displayName} (${sym}) günü eksiye geçti! Değişim: %${quote.changePercent.toFixed(2)} | Fiyat: ₺${quote.price.toFixed(2)}`,
            timestamp: nowIso,
            isRead: false,
          });
        }
        break;
      }

      case "TAVAN_BREAK": {
        // BIST tavan %10 civarındadır. Eğer günün yükseği tavan seviyesine yakınsa (>= +9.2%) ama anlık fiyat tavanın altına (%8.5 altına) düştüyse
        const dayHighPercent =
          quote.previousClose > 0
            ? ((quote.dayHigh - quote.previousClose) / quote.previousClose) *
              100
            : 0;
        if (dayHighPercent >= 9.2 && quote.changePercent < 8.5) {
          alerts.push({
            id: `alert-tavan-${sym}-${Date.now()}`,
            symbol: sym,
            ruleType: "TAVAN_BREAK",
            triggerValue: quote.changePercent,
            message: `${displayName} (${sym}) tavan bozdu! Günlük Zirve: %${dayHighPercent.toFixed(1)} -> Anlık: %${quote.changePercent.toFixed(2)} | Fiyat: ₺${quote.price.toFixed(2)}`,
            timestamp: nowIso,
            isRead: false,
          });
        }
        break;
      }

      case "STOP_LOSS": {
        if (item && item.buyPrice > 0) {
          const targetPct = rule.targetValue ?? 3;
          const stopPrice = item.buyPrice * (1 - targetPct / 100);
          if (quote.price <= stopPrice) {
            const lossPct =
              ((quote.price - item.buyPrice) / item.buyPrice) * 100;
            alerts.push({
              id: `alert-stop-${sym}-${Date.now()}`,
              symbol: sym,
              ruleType: "STOP_LOSS",
              triggerValue: quote.price,
              message: `${displayName} (${sym}) Stop-Loss seviyesine düştü! Alış: ₺${item.buyPrice.toFixed(2)} -> Anlık: ₺${quote.price.toFixed(2)} (%${lossPct.toFixed(2)})`,
              timestamp: nowIso,
              isRead: false,
            });
          }
        }
        break;
      }

      case "TAKE_PROFIT": {
        if (item && item.buyPrice > 0) {
          const targetPct = rule.targetValue ?? 15;
          const tpPrice = item.buyPrice * (1 + targetPct / 100);
          if (quote.price >= tpPrice) {
            const profitPct =
              ((quote.price - item.buyPrice) / item.buyPrice) * 100;
            alerts.push({
              id: `alert-tp-${sym}-${Date.now()}`,
              symbol: sym,
              ruleType: "TAKE_PROFIT",
              triggerValue: quote.price,
              message: `${displayName} (${sym}) Kar-Al hedefine ulaştı! Alış: ₺${item.buyPrice.toFixed(2)} -> Anlık: ₺${quote.price.toFixed(2)} (+%${profitPct.toFixed(2)})`,
              timestamp: nowIso,
              isRead: false,
            });
          }
        }
        break;
      }

      case "TRAILING_STOP": {
        if (item && item.highestPriceSeen && item.highestPriceSeen > 0) {
          const dropTargetPct = rule.targetValue ?? 4;
          const trailStopPrice =
            item.highestPriceSeen * (1 - dropTargetPct / 100);
          if (quote.price <= trailStopPrice) {
            alerts.push({
              id: `alert-trail-${sym}-${Date.now()}`,
              symbol: sym,
              ruleType: "TRAILING_STOP",
              triggerValue: quote.price,
              message: `${displayName} (${sym}) İzleyen Stop seviyesini kırdı! Zirve: ₺${item.highestPriceSeen.toFixed(2)} -> Anlık: ₺${quote.price.toFixed(2)} (-%${dropTargetPct} zirve düşüşü)`,
              timestamp: nowIso,
              isRead: false,
            });
          }
        }
        break;
      }

      default:
        break;
    }
  }

  return {
    alerts,
    updatedPortfolio,
  };
}

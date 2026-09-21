/**
 * bistPlugin.ts
 * AI BIST Stock Portfolio & Watchlist Plugin.
 * Clean Architecture - AI Service Layer.
 */

import type { AiFeaturePlugin } from "../types.js";
import {
  SYNC_STOCK_PORTFOLIO,
  SYNC_STOCK_WATCHLISTS,
  SYNC_STOCK_CASH,
} from "@/infrastructure/storage/keys.js";
import { logger } from "@/utils/logger.js";

interface StockHolding {
  symbol: string;
  shares: number;
  avgCost: number;
}

interface StockWatchlist {
  id: string;
  name: string;
  symbols: string[];
}

export const bistPlugin: AiFeaturePlugin = {
  id: "bist",
  name: "BIST Portföy & Borsa",
  description: "Monitors BIST portfolio holdings, cash balance, and manages stock watchlists.",

  getContextSnapshot: async () => {
    try {
      return new Promise<string | null>((resolve) => {
        if (typeof chrome === "undefined" || !chrome.storage?.local) {
          resolve(null);
          return;
        }

        chrome.storage.local.get(
          [SYNC_STOCK_PORTFOLIO, SYNC_STOCK_WATCHLISTS, SYNC_STOCK_CASH],
          (data) => {
            const portfolio = (data[SYNC_STOCK_PORTFOLIO] as StockHolding[]) || [];
            const watchlists = (data[SYNC_STOCK_WATCHLISTS] as StockWatchlist[]) || [];
            const cash = Number(data[SYNC_STOCK_CASH]) || 0;

            if (portfolio.length === 0 && watchlists.length === 0 && cash === 0) {
              resolve(null);
              return;
            }

            const holdingsSummary =
              portfolio.length > 0
                ? portfolio
                    .slice(0, 5)
                    .map((h) => `${h.symbol}: ${h.shares} adet (Maliyet: ₺${h.avgCost.toFixed(2)})`)
                    .join(", ")
                : "Hisse senedi yok";

            const watchSymbols =
              watchlists.length > 0
                ? watchlists
                    .flatMap((w) => w.symbols)
                    .slice(0, 8)
                    .join(", ")
                : "Boş";

            resolve(
              `[BIST Borsa Portföyü] Nakit: ₺${cash.toLocaleString("tr-TR")}. Varlıklar (${portfolio.length} hisse): ${holdingsSummary}. Takip Listesi: ${watchSymbols}.`,
            );
          },
        );
      });
    } catch {
      return null;
    }
  },

  actions: [
    {
      name: "add_stock_watchlist",
      description: "Adds a stock ticker symbol (e.g. 'THYAO', 'ASELS', 'BIMAS') to the BIST watchlist.",
      parametersExample: {
        symbol: "THYAO",
      },
      execute: async (params) => {
        const rawSymbol = String(params.symbol ?? "")
          .toUpperCase()
          .trim()
          .replace(/[^A-Z0-9]/g, "");

        if (!rawSymbol) {
          return { success: false, message: "Geçerli bir hisse sembolü belirtilmedi." };
        }

        return new Promise((resolve) => {
          if (typeof chrome === "undefined" || !chrome.storage?.local) {
            resolve({ success: false, message: "Storage erişimi yok." });
            return;
          }

          chrome.storage.local.get([SYNC_STOCK_WATCHLISTS], (data) => {
            let lists = (data[SYNC_STOCK_WATCHLISTS] as StockWatchlist[]) || [];
            if (lists.length === 0) {
              lists = [{ id: "default", name: "Genel Takip", symbols: [] }];
            }

            const targetList = lists[0];
            if (!targetList.symbols.includes(rawSymbol)) {
              targetList.symbols.push(rawSymbol);
              chrome.storage.local.set({ [SYNC_STOCK_WATCHLISTS]: lists }, () => {
                logger.info(`[bistPlugin] Added ${rawSymbol} to watchlist`);
                resolve({
                  success: true,
                  message: `${rawSymbol} hissesi takip listesine eklendi.`,
                });
              });
            } else {
              resolve({
                success: true,
                message: `${rawSymbol} zaten takip listenizde mevcut.`,
              });
            }
          });
        });
      },
    },
  ],
};

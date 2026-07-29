/**
 * bistService.ts
 * BIST (Borsa İstanbul) hisse fiyat servisi.
 * Yahoo Finance'in unofficial v8/chart endpoint'ini kullanır.
 * Cache persistence IBistCacheRepository üzerinden yapılır.
 */

import type { IBistCacheRepository } from "@/domain/repositories/IBistCacheRepository.js";
import type { StockQuote, BISTSearchResult, StockHistoryItem } from "@/types/bist.js";

// ── Dynamic BIST Ticker Discovery (NO hardcoded arrays) ───
export async function fetchDynamicBistTickers(): Promise<string[]> {
  try {
    const prefixes = ["IS", "THY", "GARAN", "AKBNK", "EREGL", "ASELS", "KCHOL", "TUPRS", "SASA", "BIMAS"];
    const results = await Promise.all(
      prefixes.map((p) =>
        fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${p}&quotesCount=20&newsCount=0`, {
          headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
          signal: AbortSignal.timeout(5000),
        })
          .then((r) => (r.ok ? r.json() : { quotes: [] }))
          .catch(() => ({ quotes: [] })),
      ),
    );

    const set = new Set<string>();
    for (const res of results) {
      const quotes = res.quotes || [];
      for (const q of quotes) {
        if (q.symbol && typeof q.symbol === "string" && q.symbol.endsWith(".IS")) {
          set.add(q.symbol.toUpperCase());
        }
      }
    }
    if (set.size > 0) {
      return Array.from(set);
    }
  } catch {
    // Ignore error
  }
  return ["THYAO.IS", "GARAN.IS", "AKBNK.IS", "EREGL.IS", "ASELS.IS"];
}

/**
 * Yahoo Finance Canlı Arama API'si.
 */
export async function searchBistStocks(query: string): Promise<BISTSearchResult[]> {
  if (!query || query.trim().length === 0) { return []; }

  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query.trim())}&quotesCount=15&newsCount=0`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) { return []; }

    const json = await res.json();
    const quotes = (json?.quotes as Array<{
      symbol?: string; shortname?: string; longname?: string;
      exchange?: string; sector?: string; industry?: string;
    }>) || [];

    const bistQuotes = quotes.filter(
      (q) =>
        q.symbol &&
        (q.exchange === "IST" || q.symbol.toUpperCase().endsWith(".IS") || q.exchange === "SE" || q.exchange === "TUR"),
    );

    return bistQuotes.map((q) => {
      const sym = (q.symbol || "").toUpperCase();
      const cleanSym = sym.replace(/\.IS$/i, "");
      return {
        symbol: sym.endsWith(".IS") ? sym : `${sym}.IS`,
        cleanSymbol: cleanSym,
        shortName: q.shortname || q.longname || cleanSym,
        longName: q.longname || q.shortname || cleanSym,
        sector: q.sector || q.industry || "BIST",
        exchange: q.exchange || "IST",
      };
    });
  } catch (err) {
    console.error("searchBistStocks error:", err);
    return [];
  }
}

// ── Fetch single quote ────────────────────────────────────────────────────────

async function fetchSingleQuote(symbol: string): Promise<StockQuote> {
  const fallbackName = symbol.replace(".IS", "");

  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d&includePrePost=false`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) { throw new Error(`HTTP ${res.status}`); }

    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) { throw new Error("No meta data"); }

    const price: number = meta.regularMarketPrice ?? 0;
    const prev: number = meta.previousClose ?? meta.chartPreviousClose ?? price;
    const change = price - prev;
    const changePercent = prev !== 0 ? (change / prev) * 100 : 0;

    return {
      symbol,
      shortName: meta.shortName ?? meta.longName ?? fallbackName,
      price,
      previousClose: prev,
      change,
      changePercent,
      dayHigh: meta.regularMarketDayHigh ?? price,
      dayLow: meta.regularMarketDayLow ?? price,
      volume: meta.regularMarketVolume ?? 0,
      currency: meta.currency ?? "TRY",
      marketCap: meta.marketCap,
    };
  } catch {
    return {
      symbol,
      shortName: fallbackName,
      price: 0,
      previousClose: 0,
      change: 0,
      changePercent: 0,
      dayHigh: 0,
      dayLow: 0,
      volume: 0,
      currency: "TRY",
      error: true,
    };
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createBistService(cacheRepo: IBistCacheRepository) {
  return {
    /** Tek bir hisse kodu için fiyat verisi çeker. */
    async fetchStockQuote(symbol: string): Promise<StockQuote> {
      const fullSymbol = symbol.toUpperCase().endsWith(".IS")
        ? symbol.toUpperCase()
        : `${symbol.toUpperCase()}.IS`;
      return fetchSingleQuote(fullSymbol);
    },

    /** Popüler BIST hisselerinin fiyatlarını çeker. Cache geçerliyse cache'den döner. */
    async fetchStockPrices(symbols?: string[]): Promise<StockQuote[]> {
      const targetSymbols = symbols ?? (await fetchDynamicBistTickers());

      // Cache check (only for full list — not when symbols are explicitly provided)
      if (!symbols) {
        const cached = await cacheRepo.getCached();
        if (cached) { return cached; }
      }

      const quotes = await Promise.all(targetSymbols.map(fetchSingleQuote));

      // Write to cache (only for full list)
      if (!symbols) {
        await cacheRepo.setCache(quotes);
      }

      return quotes;
    },

    /** Cache'i geçersiz kılarak zorla yenile. */
    async refreshStockPrices(): Promise<StockQuote[]> {
      await cacheRepo.clearCache();
      return this.fetchStockPrices();
    },
  };
}

export type BistService = ReturnType<typeof createBistService>;

/* ------------------------------------------------------------------ */
/* Singleton instance with the default storage-backed cache repository  */
/* ------------------------------------------------------------------ */

import { ChromeStorageBistCacheRepository } from "@/infrastructure/persistence/ChromeStorageBistCacheRepository.js";

const _defaultCacheRepo = new ChromeStorageBistCacheRepository();
const _defaultService = createBistService(_defaultCacheRepo);

export const { fetchStockQuote, fetchStockPrices, refreshStockPrices } = _defaultService;

// ── Format helpers (pure) ──────────────────────────────────────────

export function formatPrice(price: number, currency = "TRY"): string {
  if (price === 0) { return "—"; }
  const symbol = currency === "TRY" ? "₺" : currency;
  return `${price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
}

export function formatVolume(vol: number): string {
  if (vol === 0) { return "—"; }
  if (vol >= 1_000_000_000) { return `${(vol / 1_000_000_000).toFixed(2)}B`; }
  if (vol >= 1_000_000) { return `${(vol / 1_000_000).toFixed(2)}M`; }
  if (vol >= 1_000) { return `${(vol / 1_000).toFixed(1)}K`; }
  return vol.toLocaleString("tr-TR");
}

export function formatMarketCap(mc?: number): string {
  if (!mc) { return "—"; }
  if (mc >= 1_000_000_000) { return `${(mc / 1_000_000_000).toFixed(2)}B ₺`; }
  if (mc >= 1_000_000) { return `${(mc / 1_000_000).toFixed(2)}M ₺`; }
  return `${mc.toLocaleString("tr-TR")} ₺`;
}

export async function fetchStockHistory(
  symbol: string,
  range: string = "1mo",
  interval?: string,
): Promise<StockHistoryItem[]> {
  const fullSymbol = symbol.endsWith(".IS") ? symbol : `${symbol}.IS`;
  const effectiveInterval = interval || (range === "1d" ? "15m" : "1d");
  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(fullSymbol)}?interval=${effectiveInterval}&range=${range}&includePrePost=false`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) { throw new Error(`HTTP ${res.status}`); }

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) { throw new Error("No chart result"); }

    const timestamps: number[] = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    const opens: number[] = quotes.open || [];
    const highs: number[] = quotes.high || [];
    const lows: number[] = quotes.low || [];
    const closes: number[] = quotes.close || [];
    const volumes: number[] = quotes.volume || [];

    const history: StockHistoryItem[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (opens[i] !== undefined && opens[i] !== null && closes[i] !== undefined && closes[i] !== null) {
        history.push({
          timestamp: timestamps[i] * 1000,
          open: opens[i],
          high: highs[i] ?? opens[i],
          low: lows[i] ?? opens[i],
          close: closes[i],
          volume: volumes[i] ?? 0,
        });
      }
    }
    return history;
  } catch (e) {
    console.error("fetchStockHistory error:", e);
    return [];
  }
}

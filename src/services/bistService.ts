/**
 * bistService.ts
 * BIST (Borsa İstanbul) hisse fiyat servisi.
 * Yahoo Finance'in unofficial v8/chart endpoint'ini kullanır.
 * Veriler 5 dakika chrome.storage.local'da cache'lenir.
 */

export interface StockQuote {
  symbol: string;   // THYAO.IS
  shortName: string; // Türk Hava Yolları
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  currency: string;
  marketCap?: number;
  error?: boolean;
}

// ── Popüler BIST hisseleri ──────────────────────────────────────────────────
export const POPULAR_BIST_STOCKS: { symbol: string; displayName: string; sector: string }[] = [
  { symbol: "THYAO.IS", displayName: "Türk Hava Yolları", sector: "Havacılık" },
  { symbol: "AKBNK.IS", displayName: "Akbank", sector: "Bankacılık" },
  { symbol: "GARAN.IS", displayName: "Garanti BBVA", sector: "Bankacılık" },
  { symbol: "EREGL.IS", displayName: "Ereğli Demir Çelik", sector: "Metal" },
  { symbol: "KCHOL.IS", displayName: "Koç Holding", sector: "Holding" },
  { symbol: "SASA.IS",  displayName: "Sasa Polyester", sector: "Kimya" },
  { symbol: "TUPRS.IS", displayName: "Tüpraş", sector: "Enerji" },
  { symbol: "BIMAS.IS", displayName: "BİM Mağazalar", sector: "Perakende" },
  { symbol: "ASELS.IS", displayName: "Aselsan", sector: "Savunma" },
  { symbol: "FROTO.IS", displayName: "Ford Otosan", sector: "Otomotiv" },
  { symbol: "PGSUS.IS", displayName: "Pegasus Hava Yolları", sector: "Havacılık" },
  { symbol: "ISCTR.IS", displayName: "İş Bankası C", sector: "Bankacılık" },
  { symbol: "SAHOL.IS", displayName: "Sabancı Holding", sector: "Holding" },
  { symbol: "TCELL.IS", displayName: "Turkcell", sector: "Telekom" },
  { symbol: "KOZAL.IS", displayName: "Koza Altın", sector: "Madencilik" },
];

const CACHE_KEY = "bistStockCache";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 dakika

interface StockCache {
  timestamp: number;
  data: StockQuote[];
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

async function getCached(): Promise<StockQuote[] | null> {
  try {
    const result = await chrome.storage.local.get(CACHE_KEY);
    const cached = result[CACHE_KEY] as StockCache | undefined;
    if (!cached) return null;
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) return null;
    return cached.data;
  } catch {
    return null;
  }
}

async function setCache(data: StockQuote[]): Promise<void> {
  try {
    const payload: StockCache = { timestamp: Date.now(), data };
    await chrome.storage.local.set({ [CACHE_KEY]: payload });
  } catch {
    // Storage yazma hatası — sessizce geç
  }
}

// ── Fetch single quote ────────────────────────────────────────────────────────

async function fetchSingleQuote(symbol: string): Promise<StockQuote> {
  const displayMeta = POPULAR_BIST_STOCKS.find((s) => s.symbol === symbol);
  const fallbackName = displayMeta?.displayName ?? symbol.replace(".IS", "");

  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d&includePrePost=false`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) throw new Error("No meta data");

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

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Popüler BIST hisselerinin fiyatlarını çeker.
 * Cache geçerliyse doğrudan cache'den döner.
 */
export async function fetchStockPrices(
  symbols?: string[],
): Promise<StockQuote[]> {
  const targetSymbols = symbols ?? POPULAR_BIST_STOCKS.map((s) => s.symbol);

  // Cache kontrolü (sadece tam liste için)
  if (!symbols) {
    const cached = await getCached();
    if (cached) return cached;
  }

  // Paralel fetch (her hisse ayrı istek — rate limit riski az)
  const quotes = await Promise.all(targetSymbols.map(fetchSingleQuote));

  // Cache'e yaz (tam liste için)
  if (!symbols) {
    await setCache(quotes);
  }

  return quotes;
}

/**
 * Cache'i geçersiz kılarak zorla yenile.
 */
export async function refreshStockPrices(): Promise<StockQuote[]> {
  try {
    await chrome.storage.local.remove(CACHE_KEY);
  } catch {
    // ignore
  }
  return fetchStockPrices();
}

// ── Format helpers (UI tarafında da kullanılabilir) ────────────────────────────

export function formatPrice(price: number, currency = "TRY"): string {
  if (price === 0) return "—";
  const symbol = currency === "TRY" ? "₺" : currency;
  return `${price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
}

export function formatVolume(vol: number): string {
  if (vol === 0) return "—";
  if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(2)}B`;
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
  return vol.toLocaleString("tr-TR");
}

export function formatMarketCap(mc?: number): string {
  if (!mc) return "—";
  if (mc >= 1_000_000_000) return `${(mc / 1_000_000_000).toFixed(2)}B ₺`;
  if (mc >= 1_000_000) return `${(mc / 1_000_000).toFixed(2)}M ₺`;
  return `${mc.toLocaleString("tr-TR")} ₺`;
}

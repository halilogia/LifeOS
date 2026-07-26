/**
 * bistService.ts
 * BIST (Borsa İstanbul) hisse fiyat servisi.
 * Yahoo Finance'in unofficial v8/chart endpoint'ini kullanır.
 * Veriler 5 dakika chrome.storage.local'da cache'lenir.
 */

export interface StockQuote {
  symbol: string; // THYAO.IS
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
export const POPULAR_BIST_STOCKS: {
  symbol: string;
  displayName: string;
  sector: string;
}[] = [
  { symbol: "THYAO.IS", displayName: "Türk Hava Yolları", sector: "Havacılık" },
  { symbol: "AKBNK.IS", displayName: "Akbank", sector: "Bankacılık" },
  { symbol: "GARAN.IS", displayName: "Garanti BBVA", sector: "Bankacılık" },
  { symbol: "EREGL.IS", displayName: "Ereğli Demir Çelik", sector: "Metal" },
  { symbol: "KCHOL.IS", displayName: "Koç Holding", sector: "Holding" },
  { symbol: "SASA.IS", displayName: "Sasa Polyester", sector: "Kimya" },
  { symbol: "TUPRS.IS", displayName: "Tüpraş", sector: "Enerji" },
  { symbol: "BIMAS.IS", displayName: "BİM Mağazalar", sector: "Perakende" },
  { symbol: "ASELS.IS", displayName: "Aselsan", sector: "Savunma" },
  { symbol: "FROTO.IS", displayName: "Ford Otosan", sector: "Otomotiv" },
  {
    symbol: "PGSUS.IS",
    displayName: "Pegasus Hava Yolları",
    sector: "Havacılık",
  },
  { symbol: "ISCTR.IS", displayName: "İş Bankası C", sector: "Bankacılık" },
  { symbol: "SAHOL.IS", displayName: "Sabancı Holding", sector: "Holding" },
  { symbol: "TCELL.IS", displayName: "Turkcell", sector: "Telekom" },
  { symbol: "SISE.IS", displayName: "Şişecam", sector: "Cam & Sanayi" },
  {
    symbol: "YKBNK.IS",
    displayName: "Yapı Kredi Bankası",
    sector: "Bankacılık",
  },
  { symbol: "HEKTS.IS", displayName: "Hektaş", sector: "Tarım & Kimya" },
  { symbol: "SOKM.IS", displayName: "Şok Marketler", sector: "Perakende" },
  { symbol: "VAKBN.IS", displayName: "VakıfBank", sector: "Bankacılık" },
  { symbol: "HALKB.IS", displayName: "Halkbank", sector: "Bankacılık" },
  { symbol: "DOAS.IS", displayName: "Doğuş Otomotiv", sector: "Otomotiv" },
  { symbol: "ENKAI.IS", displayName: "Enka İnşaat", sector: "İnşaat" },
  { symbol: "GUBRF.IS", displayName: "Gübre Fabrikaları", sector: "Kimya" },
  { symbol: "OYAKC.IS", displayName: "Oyak Çimento", sector: "Çimento" },
  { symbol: "KORDS.IS", displayName: "Kordsa Teknik", sector: "Tekstil" },
  { symbol: "ALARK.IS", displayName: "Alarko Holding", sector: "Holding" },
  { symbol: "ASTOR.IS", displayName: "Astor Enerji", sector: "Enerji" },
  {
    symbol: "KONTR.IS",
    displayName: "Kontrolmatik Teknoloji",
    sector: "Teknoloji",
  },
  { symbol: "REEDR.IS", displayName: "Reeder Teknoloji", sector: "Teknoloji" },
  { symbol: "ODAS.IS", displayName: "Odaş Elektrik", sector: "Enerji" },
  { symbol: "PETKM.IS", displayName: "Petkim", sector: "Petrokimya" },
  { symbol: "MAVI.IS", displayName: "Mavi Giyim", sector: "Perakende" },
  { symbol: "TAVHL.IS", displayName: "TAV Havalimanları", sector: "Havacılık" },
  { symbol: "TOASO.IS", displayName: "Tofaş Oto", sector: "Otomotiv" },
  { symbol: "EUPWR.IS", displayName: "Europower Enerji", sector: "Enerji" },
  { symbol: "SMRTG.IS", displayName: "Smart Güneş Enerjisi", sector: "Enerji" },
  { symbol: "MIATK.IS", displayName: "Mia Teknoloji", sector: "Teknoloji" },
  { symbol: "BRSAN.IS", displayName: "Borusan Mannesmann", sector: "Metal" },
  { symbol: "MHRGY.IS", displayName: "MHR Gayrimenkul", sector: "GYO" },
  { symbol: "TABGD.IS", displayName: "TAB Gıda", sector: "Gıda" },
  { symbol: "TARKM.IS", displayName: "Tarkim Bitki Koruma", sector: "Tarım" },
  { symbol: "ENJSA.IS", displayName: "Enerjisa Enerji", sector: "Enerji" },
  { symbol: "KCAER.IS", displayName: "Kocaer Çelik", sector: "Metal" },
  { symbol: "TURSG.IS", displayName: "Türkiye Sigorta", sector: "Sigorta" },
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
    if (!cached) {
      return null;
    }
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      return null;
    }
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

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) {
      throw new Error("No meta data");
    }

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
 * Tek bir hisse kodu için fiyat verisi çeker.
 * ".IS" soneki yoksa otomatik ekler.
 */
export async function fetchStockQuote(symbol: string): Promise<StockQuote> {
  const fullSymbol = symbol.toUpperCase().endsWith(".IS")
    ? symbol.toUpperCase()
    : `${symbol.toUpperCase()}.IS`;
  return fetchSingleQuote(fullSymbol);
}

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
    if (cached) {
      return cached;
    }
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
  if (price === 0) {
    return "—";
  }
  const symbol = currency === "TRY" ? "₺" : currency;
  return `${price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
}

export function formatVolume(vol: number): string {
  if (vol === 0) {
    return "—";
  }
  if (vol >= 1_000_000_000) {
    return `${(vol / 1_000_000_000).toFixed(2)}B`;
  }
  if (vol >= 1_000_000) {
    return `${(vol / 1_000_000).toFixed(2)}M`;
  }
  if (vol >= 1_000) {
    return `${(vol / 1_000).toFixed(1)}K`;
  }
  return vol.toLocaleString("tr-TR");
}

export function formatMarketCap(mc?: number): string {
  if (!mc) {
    return "—";
  }
  if (mc >= 1_000_000_000) {
    return `${(mc / 1_000_000_000).toFixed(2)}B ₺`;
  }
  if (mc >= 1_000_000) {
    return `${(mc / 1_000_000).toFixed(2)}M ₺`;
  }
  return `${mc.toLocaleString("tr-TR")} ₺`;
}

export interface StockHistoryItem {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function fetchStockHistory(
  symbol: string,
  range: string = "1mo",
  interval: string = "1d",
): Promise<StockHistoryItem[]> {
  const fullSymbol = symbol.endsWith(".IS") ? symbol : `${symbol}.IS`;
  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(fullSymbol)}?interval=${interval}&range=${range}&includePrePost=false`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) {
      throw new Error("No chart result");
    }

    const timestamps: number[] = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    const opens: number[] = quotes.open || [];
    const highs: number[] = quotes.high || [];
    const lows: number[] = quotes.low || [];
    const closes: number[] = quotes.close || [];
    const volumes: number[] = quotes.volume || [];

    const history: StockHistoryItem[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (
        opens[i] !== undefined &&
        opens[i] !== null &&
        closes[i] !== undefined &&
        closes[i] !== null
      ) {
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

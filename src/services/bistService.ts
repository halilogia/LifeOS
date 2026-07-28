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

export interface BISTSearchResult {
  symbol: string;
  cleanSymbol: string;
  shortName: string;
  longName: string;
  sector?: string;
  exchange: string;
}

// ── Default BIST Ticker symbols for live discovery (NO hardcoded names) ───
export const POPULAR_BIST_TICKERS = [
  "THYAO.IS", "GARAN.IS", "AKBNK.IS", "EREGL.IS", "KCHOL.IS", "SASA.IS", "TUPRS.IS", "BIMAS.IS",
  "ASELS.IS", "FROTO.IS", "PGSUS.IS", "ISCTR.IS", "SAHOL.IS", "TCELL.IS", "SISE.IS", "YKBNK.IS",
  "HEKTS.IS", "SOKM.IS", "VAKBN.IS", "HALKB.IS", "DOAS.IS", "KRDMD.IS", "ASTOR.IS", "KONTR.IS",
  "REEDR.IS", "ODAS.IS", "PETKM.IS", "MAVI.IS", "TAVHL.IS", "TOASO.IS", "EUPWR.IS", "SMRTG.IS",
  "MIATK.IS", "BRSAN.IS", "ENJSA.IS", "KCAER.IS", "AEFES.IS", "AGHOL.IS", "AHGAZ.IS", "AKCNS.IS",
  "AKSA.IS", "AKSEN.IS", "ALARK.IS", "ALFAS.IS", "ALTNY.IS", "ARCLK.IS", "BERA.IS", "BRYAT.IS",
  "CANTE.IS", "CCOLA.IS", "CIMSA.IS", "CWENE.IS", "DOHOL.IS", "ECILC.IS", "EGEEN.IS", "EKGYO.IS",
  "ENKAI.IS", "GESAN.IS", "GUBRF.IS", "ISMEN.IS", "KORDS.IS", "KOZAL.IS", "KOZAA.IS", "MGROS.IS",
  "OTKAR.IS", "OYAKC.IS", "SKBNK.IS", "TABGD.IS", "TKFEN.IS", "TSKB.IS", "TTKOM.IS", "TTRAK.IS",
  "ULKER.IS", "VESBE.IS", "VESTL.IS", "YEOTK.IS", "YYLGD.IS", "ADEL.IS", "AGROT.IS", "AKFGY.IS",
  "ALBRK.IS", "ALCAR.IS", "ANELE.IS", "ANHYT.IS", "ANSGR.IS", "ARDYZ.IS", "ARENA.IS", "ARSAN.IS",
  "ASGYO.IS", "ATAKP.IS", "AVPGY.IS", "AYDEM.IS", "BAGFS.IS", "BANVT.IS", "BARMA.IS", "BASGZ.IS",
  "BEGYO.IS", "BFREN.IS", "BIENY.IS", "BIOEN.IS", "BIZIM.IS", "BJKAS.IS", "BOBET.IS", "BORLS.IS",
  "BOSSA.IS", "BSOKE.IS", "BTCIM.IS", "BUCIM.IS", "BYDNR.IS", "CATES.IS", "CELHA.IS", "CEMAS.IS",
  "CEMTS.IS", "CONSE.IS", "CVKMD.IS", "DAPGM.IS", "DARDL.IS", "DGATE.IS", "DGNMO.IS", "DMRGD.IS",
  "DNRGY.IS", "DOBUR.IS", "DURDO.IS", "DYOBY.IS", "EBEBK.IS", "ECGYO.IS", "ECZYT.IS", "EDATA.IS",
  "EGGUB.IS", "EGPRO.IS", "EGSER.IS", "EKOS.IS", "EKSUN.IS", "ELITE.IS", "EMKEL.IS", "ENSRI.IS",
  "ERCB.IS", "ESEN.IS", "ESCAR.IS", "EYGYO.IS", "FADE.IS", "FENER.IS", "FMIZP.IS", "FONET.IS",
  "FORTE.IS", "FZLGY.IS", "GARFA.IS", "GEDIK.IS", "GENIL.IS", "GEREL.IS", "GIPTA.IS", "GLYHO.IS",
  "GOKNR.IS", "GOLTS.IS", "GOODY.IS", "GOZDE.IS", "GRSEL.IS", "GSDHO.IS", "GSRAY.IS", "GWIND.IS",
  "HATSN.IS", "HUNER.IS", "HURGZ.IS", "INGRM.IS", "INVEO.IS", "INVES.IS", "IPEKE.IS", "ISDMR.IS",
  "ISFIN.IS", "ISGYO.IS", "IZENR.IS", "IZMDC.IS", "JANTS.IS", "KATEK.IS", "KFEIN.IS", "KLGYO.IS",
  "KLMSN.IS", "KMPUR.IS", "KNFRT.IS", "KONYA.IS", "KRPLS.IS", "KRTEK.IS", "KRVGD.IS", "KTLEV.IS",
  "KZBGY.IS", "KZGYO.IS", "LIDER.IS", "LKMNH.IS", "LMKDC.IS", "LOGO.IS", "LRVGY.IS", "MACKO.IS",
  "MAGEN.IS", "MAKIM.IS", "MANAS.IS", "MARTI.IS", "MEDTR.IS", "MHRGY.IS", "MOBTL.IS", "MPARK.IS",
  "MTRKS.IS", "NATEN.IS", "NETAS.IS", "NTGAZ.IS", "NTHOL.IS", "OBAMS.IS", "OFSYM.IS", "ONCSM.IS",
  "OSMEN.IS", "OYYAT.IS", "OZKGY.IS", "PASEU.IS", "PENTA.IS", "PETUN.IS", "PKART.IS", "PLTUR.IS",
  "POLHO.IS", "POLTK.IS", "PRKME.IS", "PSGYO.IS", "QUAGR.IS", "RALYH.IS", "RNPOL.IS", "RTALB.IS",
  "RUBNS.IS", "RYGYO.IS", "RYSAS.IS", "SAMAT.IS", "SARKY.IS", "SAYAS.IS", "SDTTR.IS", "SEGMN.IS",
  "SELEC.IS", "SILVR.IS", "SKMD.IS", "SMART.IS", "SNAAM.IS", "SOKE.IS", "SRVGY.IS", "SUNTK.IS",
  "SURGY.IS", "SUWEN.IS", "TARKM.IS", "TATEN.IS", "TATGD.IS", "TEKTU.IS", "TERA.IS", "TKNSA.IS",
  "TMSN.IS", "TNZTP.IS", "TRCAS.IS", "TRGYO.IS", "TRILC.IS", "TSPOR.IS", "TUCLK.IS", "TUKAS.IS",
  "TUREX.IS", "TURSG.IS", "ULUFA.IS", "ULUSE.IS", "UNLU.IS", "USAK.IS", "VAKFN.IS", "VAKKO.IS",
  "VBTYZ.IS", "VERTU.IS", "VERUS.IS", "VKGYO.IS", "YATAS.IS", "YGYO.IS", "YUNSA.IS", "ZOREN.IS",
  "ZRGYO.IS",
];

/**
 * Yahoo Finance Canlı Arama API'si.
 * Hiçbir hisse adı veya bilgisi manuel yazılmaz, doğrudan Borsa İstanbul / Yahoo veritabanından çekilir.
 */
export async function searchBistStocks(query: string): Promise<BISTSearchResult[]> {
  if (!query || query.trim().length === 0) return [];

  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query.trim())}&quotesCount=15&newsCount=0`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return [];

    const json = await res.json();
    const quotes = (json?.quotes as Array<{
      symbol?: string;
      shortname?: string;
      longname?: string;
      exchange?: string;
      sector?: string;
      industry?: string;
    }>) || [];

    // BIST (Borsa İstanbul - IST exchange veya .IS uzantılı) filtreleme
    const bistQuotes = quotes.filter(
      (q) =>
        q.symbol &&
        (q.exchange === "IST" ||
          q.symbol.toUpperCase().endsWith(".IS") ||
          q.exchange === "SE" ||
          q.exchange === "TUR")
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
  const fallbackName = symbol.replace(".IS", "");

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
  const targetSymbols = symbols ?? POPULAR_BIST_TICKERS;

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
  interval?: string,
): Promise<StockHistoryItem[]> {
  const fullSymbol = symbol.endsWith(".IS") ? symbol : `${symbol}.IS`;
  const effectiveInterval = interval ? interval : range === "1d" ? "15m" : "1d";
  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(fullSymbol)}?interval=${effectiveInterval}&range=${range}&includePrePost=false`;
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

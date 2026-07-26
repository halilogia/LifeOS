/**
 * ipoService.ts
 * Halka Arz (IPO) veri servisi.
 * halkarz.com sitesini tarayarak gerçek zamanlı aktif ve tamamlanmış halka arzları çeker.
 * Hata durumunda statik fallback verisine döner.
 */

export interface IPOEntry {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  startDate: string; // ISO yyyy-mm-dd veya tarih aralığı
  endDate: string;
  priceRange: string;
  lotSize: number;
  status: "active" | "upcoming" | "completed" | "cancelled";
  kapUrl?: string;
}

// ── Fallback static data ─────────────────────────────────────────────────────
// Güncel veriler çekilemezse bu liste gösterilir.
const FALLBACK_IPOS: IPOEntry[] = [
  {
    id: "fal-01",
    name: "Yıldız Holding",
    ticker: "YLDIZ",
    sector: "Gıda & İçecek",
    startDate: "2026-07-10",
    endDate: "2026-07-18",
    priceRange: "18,50 - 21,00 ₺",
    lotSize: 1,
    status: "active",
    kapUrl: "https://www.kap.org.tr/tr/bildirim-sorgu",
  },
  {
    id: "fal-02",
    name: "Türkiye Sigorta",
    ticker: "TURSG",
    sector: "Sigortacılık",
    startDate: "2026-07-14",
    endDate: "2026-07-21",
    priceRange: "12,00 - 14,50 ₺",
    lotSize: 1,
    status: "active",
    kapUrl: "https://www.kap.org.tr/tr/bildirim-sorgu",
  },
  {
    id: "fal-03",
    name: "Koç Fintekh",
    ticker: "KOCFT",
    sector: "Fintek",
    startDate: "2026-07-22",
    endDate: "2026-07-28",
    priceRange: "Yakında açıklanacak",
    lotSize: 1,
    status: "upcoming",
    kapUrl: "https://www.kap.org.tr/tr/bildirim-sorgu",
  },
  {
    id: "fal-04",
    name: "Pegasus Havacılık Teknoloji",
    ticker: "PGSTH",
    sector: "Teknoloji",
    startDate: "2026-06-25",
    endDate: "2026-07-02",
    priceRange: "45,00 ₺",
    lotSize: 1,
    status: "completed",
    kapUrl: "https://www.kap.org.tr/tr/bildirim-sorgu",
  },
  {
    id: "fal-05",
    name: "Enerjisa Enerji Çözümleri",
    ticker: "ENRJC",
    sector: "Enerji",
    startDate: "2026-06-28",
    endDate: "2026-07-05",
    priceRange: "32,00 ₺",
    lotSize: 1,
    status: "completed",
    kapUrl: "https://www.kap.org.tr/tr/bildirim-sorgu",
  },
  {
    id: "fal-06",
    name: "Global Liman İşletmeleri",
    ticker: "GLBMD",
    sector: "Lojistik",
    startDate: "2026-07-01",
    endDate: "2026-07-08",
    priceRange: "28,50 ₺",
    lotSize: 1,
    status: "completed",
    kapUrl: "https://www.kap.org.tr/tr/bildirim-sorgu",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function isWithinLastDays(dateStr: string, days: number): boolean {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return true;
    } // Geçersiz tarih formatında son günlerdeymiş gibi gösterelim
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return d >= cutoff && d <= new Date();
  } catch {
    return false;
  }
}

function parseHalkarzDate(dateStr: string): {
  start: Date | null;
  end: Date | null;
  status: IPOEntry["status"];
} {
  if (
    !dateStr ||
    dateStr.includes("Hazırlanıyor") ||
    dateStr.includes("Taslak")
  ) {
    return { start: null, end: null, status: "upcoming" };
  }

  // Example: "8-9-10 Temmuz 2026" or "1-2 Temmuz 2026" or "30 Haziran, 1 Temmuz 2026"
  const yearMatch = dateStr.match(/\d{4}/);
  const year = yearMatch
    ? parseInt(yearMatch[0], 10)
    : new Date().getFullYear();

  const monthsTr: Record<string, number> = {
    ocak: 0,
    şubat: 1,
    mart: 2,
    nisan: 3,
    mayıs: 4,
    haziran: 5,
    temmuz: 6,
    ağustos: 7,
    eylül: 8,
    ekim: 9,
    kasım: 10,
    aralık: 11,
  };

  let monthIndex = 0;
  for (const m in monthsTr) {
    if (dateStr.toLowerCase().includes(m)) {
      monthIndex = monthsTr[m];
      break;
    }
  }

  const numbers = dateStr.match(/\d+/g);
  if (!numbers || numbers.length === 0) {
    return { start: null, end: null, status: "completed" };
  }

  const days = numbers
    .map((n) => parseInt(n, 10))
    .filter((n) => n !== year && n < 32);
  if (days.length === 0) {
    return { start: null, end: null, status: "completed" };
  }

  const startDay = days[0];
  const endDay = days[days.length - 1];

  const startDate = new Date(year, monthIndex, startDay);
  const endDate = new Date(year, monthIndex, endDay, 23, 59, 59);

  const now = new Date();
  if (now < startDate) {
    return { start: startDate, end: endDate, status: "upcoming" };
  } else if (now >= startDate && now <= endDate) {
    return { start: startDate, end: endDate, status: "active" };
  } else {
    return { start: startDate, end: endDate, status: "completed" };
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Tüm halka arz verilerini çeker.
 * halkarz.com anasayfasından makaleleri ayrıştırır; başarısız olursa statik fallback döner.
 */
export async function fetchAllIPOs(): Promise<{
  data: IPOEntry[];
  isFallback: boolean;
}> {
  try {
    const res = await fetch("https://halkarz.com", {
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const html = await res.text();
      const articleRegex = /<article class="index-list">([\s\S]*?)<\/article>/g;
      let match;
      const parsed: IPOEntry[] = [];
      let index = 0;

      while ((match = articleRegex.exec(html)) !== null) {
        const content = match[1];

        // Extract Company Name
        const nameMatch = content.match(
          /<h3 class="il-halka-arz-sirket"><a href="[^"]*" title="([^"]*)">/i,
        );
        const name = nameMatch ? nameMatch[1] : "";
        if (!name) {
          continue;
        }

        // Extract Url
        const urlMatch = content.match(/href="([^"]*)"/i);
        const url = urlMatch ? urlMatch[1] : "https://halkarz.com";

        // Extract Ticker / Code
        const tickerMatch = content.match(
          /<span class="il-bist-kod">([\s\S]*?)<\/span>/i,
        );
        const ticker = tickerMatch
          ? tickerMatch[1].replace(/<[^>]*>/g, "").trim()
          : "";

        // Extract Dates
        const dateMatch =
          content.match(/<time datetime="[^"]*" title="([^"]*)"/i) ||
          content.match(/<time[^>]*>([\s\S]*?)<\/time>/i);
        const dateRaw = dateMatch
          ? dateMatch[1].replace(/<[^>]*>/g, "").trim()
          : "";

        const parsedDate = parseHalkarzDate(dateRaw);
        const formatDateStr = (d: Date | null) =>
          d ? d.toISOString().split("T")[0] : "";

        parsed.push({
          id: `ha-${ticker || index}`,
          name,
          ticker: ticker || "—",
          sector: "Halka Arz",
          startDate: formatDateStr(parsedDate.start) || dateRaw,
          endDate: formatDateStr(parsedDate.end) || dateRaw,
          priceRange: "Detaylar için siteyi ziyaret edin",
          lotSize: 1,
          status: parsedDate.status,
          kapUrl: url,
        });
        index++;
      }

      if (parsed.length > 0) {
        return { data: parsed, isFallback: false };
      }
    }
  } catch (e) {
    console.error("Failed to fetch from halkarz.com:", e);
  }

  return { data: FALLBACK_IPOS, isFallback: true };
}

/**
 * Aktif ve yakın gelecekteki halka arzları döner.
 */
export async function fetchActiveIPOs(): Promise<{
  data: IPOEntry[];
  isFallback: boolean;
}> {
  const result = await fetchAllIPOs();
  return {
    data: result.data.filter(
      (ipo) => ipo.status === "active" || ipo.status === "upcoming",
    ),
    isFallback: result.isFallback,
  };
}

/**
 * Son `days` gün içinde tamamlanmış halka arzları döner.
 */
export async function fetchIPOHistory(days = 30): Promise<{
  data: IPOEntry[];
  isFallback: boolean;
}> {
  const result = await fetchAllIPOs();
  const history = result.data.filter(
    (ipo) => ipo.status === "completed" && isWithinLastDays(ipo.endDate, days),
  );
  return { data: history, isFallback: result.isFallback };
}

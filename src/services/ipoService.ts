/**
 * ipoService.ts
 * Halka Arz (IPO) veri servisi.
 * Birden fazla ücretsiz endpoint'i dener; hepsi başarısız olursa
 * demo / güncel-ish statik veri döner.
 */

export interface IPOEntry {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  startDate: string; // ISO yyyy-mm-dd
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
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return d >= cutoff && d <= new Date();
  } catch {
    return false;
  }
}

function parseIsyatirimResponse(html: string): IPOEntry[] | null {
  // İş Yatırım'ın HTML'inden table satırlarını parse etmeye çalışır.
  // Tarayıcı ortamında DOMParser kullanılabilir.
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const rows = doc.querySelectorAll("table tbody tr");
    if (rows.length === 0) return null;

    const results: IPOEntry[] = [];
    rows.forEach((row, idx) => {
      const cells = row.querySelectorAll("td");
      if (cells.length < 5) return;
      const name = cells[0]?.textContent?.trim() ?? "";
      const ticker = cells[1]?.textContent?.trim() ?? "";
      const startDate = cells[2]?.textContent?.trim() ?? "";
      const endDate = cells[3]?.textContent?.trim() ?? "";
      const price = cells[4]?.textContent?.trim() ?? "";

      if (!name) return;

      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      let status: IPOEntry["status"] = "completed";
      if (start > now) status = "upcoming";
      else if (end >= now) status = "active";

      results.push({
        id: `isy-${idx}`,
        name,
        ticker,
        sector: cells[5]?.textContent?.trim() ?? "—",
        startDate,
        endDate,
        priceRange: price,
        lotSize: 1,
        status,
        kapUrl: "https://www.kap.org.tr/tr/bildirim-sorgu",
      });
    });
    return results.length > 0 ? results : null;
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Tüm halka arz verilerini çeker.
 * Önce İş Yatırım'dan çekmeye çalışır; başarısız olursa statik fallback döner.
 * isFallback=true ise veri statik demo datadan gelmiştir.
 */
export async function fetchAllIPOs(): Promise<{
  data: IPOEntry[];
  isFallback: boolean;
}> {
  try {
    // İsyatirim halka arz takvimi sayfasını proxy olmadan fetch et.
    // Chrome extension'larda same-origin kısıtı yoktur (manifest host_permissions).
    const res = await fetch(
      "https://www.isyatirim.com.tr/tr-tr/analiz/halka-arz-takvimi",
      { signal: AbortSignal.timeout(8000) },
    );
    if (res.ok) {
      const html = await res.text();
      const parsed = parseIsyatirimResponse(html);
      if (parsed && parsed.length > 0) {
        return { data: parsed, isFallback: false };
      }
    }
  } catch {
    // Network hatası veya CORS — fallback'e geç
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
    (ipo) =>
      ipo.status === "completed" &&
      isWithinLastDays(ipo.endDate, days),
  );
  return { data: history, isFallback: result.isFallback };
}

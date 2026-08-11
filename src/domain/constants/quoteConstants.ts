/**
 * quoteConstants.ts
 * Merkezi Özlü Söz (Quote) yönetimi — Varsayılan Sözler Veritabanı.
 * YeniTab alt bilgisi (FooterQuote) ve Detoks İlham Kartları ortak havuzu.
 * Kullanıcı özel sözleri `customQuotes` storage anahtarında tutulur (ayrıdır).
 */

export interface QuoteItem {
  text: string;
  author?: string;
}

/**
 * Varsayılan özlü sözler — UI / Footer / Detox kartlarında ortak kullanılır.
 * Dil bazlı çeviri anahtarları (quote_1...quote_7) yerine doğrudan metin + yazar.
 * tr / en ayrımı: text_tr / text_en alanları ile tek havuzdan yönetilir.
 */
export const DEFAULT_QUOTES: QuoteItem[] = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "Well begun is half done.",
    author: "Aristotle",
  },
  {
    text: "Done is better than perfect.",
    author: "Sheryl Sandberg",
  },
  {
    text: "Focus on being productive instead of busy.",
    author: "Tim Ferriss",
  },
  {
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
  },
  {
    text: "Everything you want is on the other side of fear.",
    author: "Jack Canfield",
  },
  {
    text: "Don't count the days, make the days count.",
    author: "Muhammad Ali",
  },
];

/**
 * Türkçe varyantlar — en havuzu ile birebir eşleşir.
 * UI dili tr olduğunda kullanılır; aksi halde DEFAULT_QUOTES (en) baz alınır.
 */
export const DEFAULT_QUOTES_TR: QuoteItem[] = [
  {
    text: "Başlamanın yolu konuşmayı bırakıp yapmaya başlamaktır.",
    author: "Walt Disney",
  },
  {
    text: "Başlamak, başarmanın yarısıdır.",
    author: "Aristoteles",
  },
  {
    text: "Yapılmış olması, mükemmel olmasından iyidir.",
    author: "Sheryl Sandberg",
  },
  {
    text: "Meşgul olmaya değil, üretken olmaya odaklan.",
    author: "Tim Ferriss",
  },
  {
    text: "Geleceği tahmin etmenin en iyi yolu onu yaratmaktır.",
    author: "Peter Drucker",
  },
  {
    text: "İstediğin her şey korkunun diğer tarafındadır.",
    author: "Jack Canfield",
  },
  {
    text: "Günleri sayma, günlere anlam kat.",
    author: "Muhammad Ali",
  },
];

export function getDefaultQuotesForLang(lang: "tr" | "en"): QuoteItem[] {
  return lang === "tr" ? DEFAULT_QUOTES_TR : DEFAULT_QUOTES;
}

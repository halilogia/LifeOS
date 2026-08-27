import { logger } from "@/utils/logger.js";
import type { ClarificationRequest } from "@/services/aichat/types.js";

/**
 * aiCommandParser.ts
 * Natural language command parser and JSON response cleaner/parser for AI Chat.
 * Clean Architecture - Utility Module.
 */

export const monthsMap: Record<string, number> = {
  ocak: 1,
  şubat: 2,
  mart: 3,
  nisan: 4,
  mayıs: 5,
  haziran: 6,
  temmuz: 7,
  ağustos: 8,
  eylül: 9,
  ekim: 10,
  kasım: 11,
  aralık: 12,
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

// Build comprehensive BIST Aliases dictionary dynamically from popular stocks dataset
export const BIST_ALIASES: Record<
  string,
  { symbol: string; displayName: string }
> = {
  kardemir: { symbol: "KRDMD.IS", displayName: "Kardemir D" },
  "kardemir d": { symbol: "KRDMD.IS", displayName: "Kardemir D" },
  krdmd: { symbol: "KRDMD.IS", displayName: "Kardemir D" },
  thy: { symbol: "THYAO.IS", displayName: "Türk Hava Yolları" },
  "türk hava yolları": { symbol: "THYAO.IS", displayName: "Türk Hava Yolları" },
  ereğli: { symbol: "EREGL.IS", displayName: "Ereğli Demir Çelik" },
  aselsan: { symbol: "ASELS.IS", displayName: "Aselsan" },
  tüpraş: { symbol: "TUPRS.IS", displayName: "Tüpraş" },
  ford: { symbol: "FROTO.IS", displayName: "Ford Otosan" },
  garanti: { symbol: "GARAN.IS", displayName: "Garanti BBVA" },
  işbank: { symbol: "ISCTR.IS", displayName: "İş Bankası C" },
};

export interface LocalParsedResult {
  parsed: boolean;
  action?: "create_task" | "add_note" | "add_stock" | "ask_stock";
  text?: string;
  date?: string;
  note_type?: "note" | "diary" | "cornell";
  content?: string;
  stock?: {
    symbol: string;
    displayName: string;
    buyPrice: number;
    lotCount: number;
  };
  stockQuery?: {
    symbol: string;
    question?: string;
  };
}

/**
 * Local Rule-Based Command Parser (Turkish & English fallback)
 */
export function parseLocalCommand(query: string): LocalParsedResult {
  const textLower = query.toLowerCase().trim();
  const today = new Date();

  // 0a. Stock Analysis Query (e.g. "THYAO analiz et", "THYAO alınır mı", "garanti yorumla")
  const stockAnalysisPatterns = [
    /(\b[A-ZÇĞİÖŞÜ]{3,6}\b)\s*(?:analiz\s*et|yorumla|alınır\s*mı|satılır\s*mı|değerlendir|nasıl|durumu\s*nasıl)/i,
    /(?:analiz\s*et|yorumla|değerlendir)\s+(\b[A-ZÇĞİÖŞÜ]{3,6}\b)/i,
  ];
  for (const pattern of stockAnalysisPatterns) {
    const match = query.match(pattern);
    if (match) {
      const symbol = match[1].toUpperCase();
      // Check alias dictionary
      let foundSymbol = symbol;
      const question = query;
      for (const key of Object.keys(BIST_ALIASES)) {
        if (textLower.includes(key)) {
          foundSymbol = BIST_ALIASES[key].symbol.replace(".IS", "");
          break;
        }
      }
      return {
        parsed: true,
        action: "ask_stock",
        stockQuery: {
          symbol: foundSymbol,
          question,
        },
      };
    }
  }
  // Check for Turkish alias pattern: "thy alınır mı", "garanti nasıl"
  for (const key of Object.keys(BIST_ALIASES)) {
    if (
      textLower.includes(key) &&
      (textLower.includes("alınır") ||
        textLower.includes("nasıl") ||
        textLower.includes("yorum") ||
        textLower.includes("analiz") ||
        textLower.includes("durum"))
    ) {
      return {
        parsed: true,
        action: "ask_stock",
        stockQuery: {
          symbol: BIST_ALIASES[key].symbol.replace(".IS", ""),
          question: query,
        },
      };
    }
  }

  // 0. Dynamic Stock Buy Command (e.g. "20 lot Kardemir 28.50 TL'den aldım" or "100 lot MIATK 45 TL'den aldım")
  if (
    textLower.includes("lot") ||
    textLower.includes("hisse") ||
    textLower.includes("portföye ekle")
  ) {
    const lotMatch = textLower.match(/(\d+)\s*lot/);
    const priceMatch = textLower.match(/(\d+(?:[.,]\d+)?)\s*(?:tl|₺|lira)/);

    let foundSymbol: string | null = null;
    let foundDisplayName: string | null = null;

    // Check alias dictionary
    for (const key of Object.keys(BIST_ALIASES)) {
      if (textLower.includes(key)) {
        foundSymbol = BIST_ALIASES[key].symbol;
        foundDisplayName = BIST_ALIASES[key].displayName;
        break;
      }
    }

    // Dynamic uppercase BIST ticker extraction (e.g. MIATK, REEDR, ASTOR, KONTR)
    if (!foundSymbol) {
      const tickerMatch = query.match(/\b([A-ZÇĞİÖŞÜ]{3,6})\b/i);
      if (tickerMatch) {
        const potentialTicker = tickerMatch[1].toUpperCase();
        foundSymbol = potentialTicker + ".IS";
        foundDisplayName = potentialTicker;
      }
    }

    if (foundSymbol && (lotMatch || priceMatch)) {
      const lotCount = lotMatch ? parseInt(lotMatch[1], 10) : 1;
      const buyPrice = priceMatch
        ? parseFloat(priceMatch[1].replace(",", "."))
        : 0;

      return {
        parsed: true,
        action: "add_stock",
        stock: {
          symbol: foundSymbol,
          displayName: foundDisplayName || foundSymbol.replace(".IS", ""),
          buyPrice,
          lotCount,
        },
      };
    }
  }

  // Check notes first
  if (
    textLower.includes("günlük ekle") ||
    textLower.includes("günlük yazısı ekle") ||
    textLower.includes("günlük oluştur") ||
    textLower.includes("günlük eklermisin")
  ) {
    const match = query.match(
      /(?:günlük ekle|günlük yazısı ekle|günlük oluştur|günlük eklermisin)\s*[:-]?\s*(.+)$/i,
    );
    if (match) {
      return {
        parsed: true,
        action: "add_note",
        note_type: "diary",
        content: match[1].trim(),
      };
    }
  }
  if (
    textLower.includes("ders notu ekle") ||
    textLower.includes("cornell ders notu ekle") ||
    textLower.includes("ders notu oluştur") ||
    textLower.includes("ders notu eklermisin") ||
    textLower.includes("cornell notu ekle")
  ) {
    const match = query.match(
      /(?:ders notu ekle|cornell ders notu ekle|ders notu oluştur|ders notu eklermisin|cornell notu ekle)\s*[:-]?\s*(.+)$/i,
    );
    if (match) {
      return {
        parsed: true,
        action: "add_note",
        note_type: "cornell",
        content: match[1].trim(),
      };
    }
  }
  if (
    textLower.includes("not ekle") ||
    textLower.includes("not oluştur") ||
    textLower.includes("not eklermisin")
  ) {
    const match = query.match(
      /(?:not ekle|not oluştur|not eklermisin)\s*[:-]?\s*(.+)$/i,
    );
    if (match) {
      return {
        parsed: true,
        action: "add_note",
        note_type: "note",
        content: match[1].trim(),
      };
    }
  }

  // 1. Check for "yarın" / "tomorrow"
  if (textLower.startsWith("yarın") || textLower.includes(" yarın")) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    let cleaned = query
      .replace(/yarın/gi, "")
      .replace(/için/gi, "")
      .replace(/(görev|task)?\s*(oluştur|ekle|yaz)/gi, "")
      .trim();
    cleaned = cleaned.replace(/^[:\-,\s]+/, "").trim();

    return {
      parsed: true,
      action: "create_task",
      text: cleaned || "Görev",
      date: dateStr,
    };
  }

  if (textLower.startsWith("tomorrow") || textLower.includes(" tomorrow")) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    let cleaned = query
      .replace(/tomorrow/gi, "")
      .replace(/for/gi, "")
      .replace(/(task|todo)?\s*(create|add|write)/gi, "")
      .trim();
    cleaned = cleaned.replace(/^[:,\s-]+/, "").trim();

    return {
      parsed: true,
      action: "create_task",
      text: cleaned || "Task",
      date: dateStr,
    };
  }

  // 2. Check for "ayın X'ine" / "ayın Xine"
  const ayinMatch = textLower.match(
    /(?:ayın\s+)?(\d+)(?:'sine|'sine\s+|sine|sine\s+|'ine|ine|'na|na|a|e)?\s+(?:görev|task)?\s*(?:oluştur|ekle|yaz)\s*[:-]?\s*(.+)$/i,
  );
  if (ayinMatch) {
    const dayNum = parseInt(ayinMatch[1], 10);
    const taskText = ayinMatch[2].trim();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(dayNum).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    return {
      parsed: true,
      action: "create_task",
      text: taskText,
      date: dateStr,
    };
  }

  // 3. Check for specific date (e.g., "25 temmuz")
  const trDateMatch = textLower.match(
    /(\d+)\s+([a-zA-Zçıöşğüİ]+)\s*(?:için)?\s+(?:görev|task)?\s*(?:oluştur|ekle|yaz)\s*[:-]?\s*(.+)$/i,
  );
  if (trDateMatch) {
    const dayNum = parseInt(trDateMatch[1], 10);
    const monthName = trDateMatch[2].toLowerCase();
    const taskText = trDateMatch[3].trim();

    if (monthsMap[monthName]) {
      const monthNum = String(monthsMap[monthName]).padStart(2, "0");
      const year = today.getFullYear();
      const day = String(dayNum).padStart(2, "0");
      const dateStr = `${year}-${monthNum}-${day}`;
      return {
        parsed: true,
        action: "create_task",
        text: taskText,
        date: dateStr,
      };
    }
  }

  const enDateMatch = textLower.match(
    /(?:create|add)\s+task\s+for\s+([a-zA-Z]+)\s+(\d+)\s*[:-]?\s*(.+)$/i,
  );
  if (enDateMatch) {
    const monthName = enDateMatch[1].toLowerCase();
    const dayNum = parseInt(enDateMatch[2], 10);
    const taskText = enDateMatch[3].trim();

    if (monthsMap[monthName]) {
      const monthNum = String(monthsMap[monthName]).padStart(2, "0");
      const year = today.getFullYear();
      const day = String(dayNum).padStart(2, "0");
      const dateStr = `${year}-${monthNum}-${day}`;
      return {
        parsed: true,
        action: "create_task",
        text: taskText,
        date: dateStr,
      };
    }
  }

  // 4. Default generic command
  if (
    textLower.startsWith("görev ekle") ||
    textLower.startsWith("task ekle") ||
    textLower.startsWith("görev oluştur")
  ) {
    let cleaned = query
      .replace(/görev ekle/gi, "")
      .replace(/task ekle/gi, "")
      .replace(/görev oluştur/gi, "")
      .trim();
    cleaned = cleaned.replace(/^[:\-,\s]+/, "").trim();
    return { parsed: true, action: "create_task", text: cleaned };
  }

  return { parsed: false };
}

/**
 * Normalizes and parses raw JSON string from AI response.
 */
export function cleanAndParseJSON(text: string): unknown {
  let cleaned = text.trim();

  // 1. Remove think blocks entirely
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // 2. Normalize smart quotes and typical invalid characters
  cleaned = cleaned
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");

  // 3. Find first brace or bracket
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");

  let isObject = false;
  let startIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    isObject = true;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    isObject = false;
  }

  if (startIdx === -1) {
    return { reply: cleaned, action: "none", params: null };
  }

  const openChar = isObject ? "{" : "[";
  const closeChar = isObject ? "}" : "]";

  let braceCount = 0;
  let endIdx = -1;
  let inString = false;
  let escape = false;

  for (let i = startIdx; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === openChar) {
        braceCount++;
      } else if (char === closeChar) {
        braceCount--;
        if (braceCount === 0) {
          endIdx = i;
          break;
        }
      }
    }
  }

  if (endIdx !== -1) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    try {
      const patched = cleaned
        .replace(/,\s*([\]}])/g, "$1")
        .replace(/(["\d])\s*\n\s*"/g, '$1,\n"');
      return JSON.parse(patched);
    } catch {
      logger.warn(
        "[cleanAndParseJSON Fallback] JSON parsing failed twice. Raw text was:",
        text,
      );
      return {
        reply: text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim(),
        action: "none",
        params: null,
      };
    }
  }
}

/**
 * Extracts think reasoning blocks and parses AI payload including clarifications.
 */
export function parseAIResponse(rawText: string): {
  reply: string;
  action: string;
  params: Record<string, unknown> | null;
  thinking: string;
  clarification?: ClarificationRequest;
} {
  let thinking = "";

  const thinkRegex = /<think>([\s\S]*?)<\/think>/i;
  const thinkMatch = rawText.match(thinkRegex);
  if (thinkMatch) {
    thinking = thinkMatch[1].trim();
  }

  try {
    const parsed = cleanAndParseJSON(rawText) as {
      reply?: string;
      action?: string;
      params?: Record<string, unknown> | null;
      question?: string;
      options?: Array<string | { label: string; value: string; description?: string }>;
      allowFreeText?: boolean;
      context?: string;
    };

    const action = parsed.action || "none";
    let clarification: ClarificationRequest | undefined = undefined;

    if (action === "clarification") {
      const q =
        (parsed.params?.question as string) ||
        parsed.question ||
        parsed.reply ||
        "Lütfen seçiminizi yapın:";
      const opts = (parsed.params?.options || parsed.options || []) as Array<
        string | { label: string; value: string; description?: string }
      >;
      const allowFreeText =
        parsed.params?.allowFreeText !== undefined
          ? Boolean(parsed.params.allowFreeText)
          : parsed.allowFreeText !== undefined
            ? Boolean(parsed.allowFreeText)
            : true;
      const context =
        (parsed.params?.context as string) || parsed.context || undefined;

      clarification = {
        id: `clarify_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        question: q,
        options: opts,
        allowFreeText,
        context,
        resolved: false,
      };
    }

    return {
      reply: parsed.reply || (clarification ? clarification.question : ""),
      action,
      params: parsed.params || null,
      thinking,
      clarification,
    };
  } catch {
    const reply = rawText.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    return {
      reply,
      action: "none",
      params: null,
      thinking,
    };
  }
}

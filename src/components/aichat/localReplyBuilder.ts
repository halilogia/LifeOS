/**
 * localReplyBuilder.ts
 * AI yokken / hata durumunda yerel komut ayrıştırıcıdan yanıt üretir.
 * useAiChatMessages'tan çıkarıldı (offline + catch-fallback ortak mantık).
 */
import type { Todo } from "@/types/types.js";
import type { Language } from "@/types/types.js";
import { parseLocalCommand } from "@/utils/aiCommandParser.js";
import { handleAddNoteFromAI } from "@/services/aichat/index.js";
import { ChromeStorageStockRepository } from "@/infrastructure/persistence/repositories/ChromeStorageStockRepository.js";
import type { StockPortfolioItem } from "@/types/stock.js";
import { fetchStockQuote } from "@/services/bistService.js";
import { analyzeStockWithAI } from "@/services/stock/stockAiService.js";

export interface LocalReplyContext {
  t: Record<string, string>;
  lang: Language;
  onAddTodo: (
    text: string,
    repeat: Todo["repeat"],
    dueDate?: string,
  ) => Promise<void>;
  onManualSync: () => Promise<void>;
}

/**
 * Yerel komut ayrıştırıcıyı çalıştırır ve kullanıcıya gösterilecek yanıt metnini üretir.
 * @returns reply metni (boş değilse mesaj eklenir)
 * @param fallback true = hata sonrası fallback metinleri (aichat_fallback_*), false = normal offline metinleri
 */
export async function buildLocalReply(
  query: string,
  ctx: LocalReplyContext,
  fallback = false,
): Promise<string> {
  const { t, lang, onAddTodo, onManualSync } = ctx;
  const localParsed = parseLocalCommand(query);
  let replyText = "";

  if (!localParsed.parsed) {
    return replyText;
  }

  if (localParsed.action === "add_note" && localParsed.content) {
    const type = localParsed.note_type || "note";
    await handleAddNoteFromAI(type, localParsed.content, lang);
    const typeLabel =
      type === "diary"
        ? t.aichat_type_label_diary
        : type === "cornell"
          ? t.aichat_type_label_cornell
          : t.aichat_type_label_note;
    replyText = fallback
      ? t.aichat_fallback_added_note.replace("{type_label}", typeLabel)
      : t.aichat_added_note_success.replace("{type_label}", typeLabel);
  } else if (localParsed.action === "create_task" && localParsed.text) {
    const dueDateFormatted = localParsed.date ? ` (${localParsed.date})` : "";
    await onAddTodo(localParsed.text, "none", localParsed.date);
    await onManualSync();
    if (fallback) {
      replyText = t.aichat_fallback_added_task
        .replace("{task_text}", localParsed.text)
        .replace("{date_part}", dueDateFormatted);
    } else {
      replyText = t.aichat_added_task_success
        .replace("{task_text}", localParsed.text)
        .replace("{date_part}", dueDateFormatted);
    }
  } else if (localParsed.action === "add_stock" && localParsed.stock) {
    const { symbol, displayName, buyPrice, lotCount } = localParsed.stock;
    const stockRepo = new ChromeStorageStockRepository();
    const currentPortfolio = await stockRepo.getPortfolio();
    const newStock: StockPortfolioItem = {
      id: `stock-${Date.now()}`,
      symbol,
      displayName,
      buyPrice,
      lotCount,
      buyDate: new Date().toISOString().split("T")[0],
    };
    await stockRepo.savePortfolio([...currentPortfolio, newStock]);
    replyText = t.aichat_added_stock_success
      .replace("{lot_count}", String(lotCount))
      .replace("{display_name}", displayName)
      .replace("{symbol}", symbol.replace(".IS", ""))
      .replace("{price}", buyPrice.toFixed(2));
  } else if (localParsed.action === "ask_stock" && localParsed.stockQuery) {
    const { symbol, question } = localParsed.stockQuery;
    if (fallback) {
      try {
        const quote = await fetchStockQuote(symbol);
        replyText = await analyzeStockWithAI({
          symbol,
          quote,
          userQuestion: question,
        });
      } catch {
        const q = await fetchStockQuote(symbol).catch(() => null);
        const price = q?.price ?? 0;
        const change = q?.changePercent ?? 0;
        replyText = `🔍 **${symbol.replace(".IS", "")}** ${change >= 0 ? "📈" : "📉"}\n\nCanlı Fiyat: **₺${price}**\nDeğişim: %${change.toFixed(2)}`;
      }
    } else {
      try {
        const quote = await fetchStockQuote(symbol);
        replyText = await analyzeStockWithAI({
          symbol,
          quote,
          userQuestion: question,
        });
      } catch {
        const quote2 = await fetchStockQuote(symbol).catch(() => null);
        const price = quote2?.price ?? 0;
        const change = quote2?.changePercent ?? 0;
        replyText = `🔍 **${symbol.replace(".IS", "")}** ${change >= 0 ? "📈" : "📉"}\n\nCanlı Fiyat: **₺${price}**\nDeğişim: %${change.toFixed(2)}\n\n⚠️ AI analizi şu an kullanılamıyor.`;
      }
    }
  }

  return replyText;
}

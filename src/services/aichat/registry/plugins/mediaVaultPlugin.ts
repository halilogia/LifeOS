/**
 * mediaVaultPlugin.ts
 * AI Media Vault Plugin (Books, Movies, TV, Games, Quotes & Progress).
 * Clean Architecture - AI Service Layer.
 */

import type { AiFeaturePlugin } from "../types.js";
import {
  handleAddMediaFromAI,
  handleBatchAddMediaFromAI,
  handleAddMediaQuoteFromAI,
  handleUpdateMediaProgressFromAI,
} from "@/services/aichat/actionExecutor.js";
import { logger } from "@/utils/logger.js";

export const mediaVaultPlugin: AiFeaturePlugin = {
  id: "media_vault",
  name: "Media Vault (Kitap, Film, Dizi, Oyun)",
  description: "Manages books, movies, series, games, reading progress, and book quotes.",

  getContextSnapshot: async (ctx) => {
    try {
      if (!ctx.mediaRepo) return null;

      const mediaItems = await ctx.mediaRepo.getItems();
      if (mediaItems.length === 0) return null;

      const inProgressBooks = mediaItems
        .filter((m) => m.type === "book" && m.status === "in_progress")
        .slice(0, 5)
        .map((b) => {
          const current = b.bookProgress?.currentPage ?? 0;
          const total = b.bookProgress?.totalPages ?? 0;
          const creator = b.creator ? ` (${b.creator})` : "";
          const progressStr =
            total > 0
              ? ` - ${current}/${total} sayfa (%${Math.round((current / total) * 100)})`
              : "";
          return `  • ${b.title}${creator}${progressStr}`;
        });

      const completedBooks = mediaItems.filter(
        (m) => m.type === "book" && m.status === "completed",
      ).length;

      const lines: string[] = [];
      if (inProgressBooks.length > 0) {
        lines.push(`[Aktif Okunan Kitaplar]\n${inProgressBooks.join("\n")}`);
      }

      lines.push(
        `[Media Vault Özeti] Toplam ${mediaItems.length} kayıtlı eser (${completedBooks} bitirilen kitap, ${inProgressBooks.length} aktif okunan).`,
      );

      return lines.join("\n");
    } catch (err) {
      logger.warn("[mediaVaultPlugin] Error building snapshot:", err);
      return null;
    }
  },

  actions: [
    {
      name: "add_media",
      description: "Adds or updates an item in Media Vault (Books, Movies, TV Series, Video Games).",
      parametersExample: {
        type: "book",
        title: "1984",
        creator: "George Orwell",
        status: "in_progress",
        currentPage: 50,
        totalPages: 328,
        rating: 9,
      },
      execute: async (params, ctx) => {
        if (!ctx.mediaRepo) {
          return { success: false, message: "Media repository not available" };
        }
        await handleAddMediaFromAI(params, ctx.mediaRepo);
        return { success: true, message: `Eser eklendi: "${params.title}"` };
      },
    },
    {
      name: "batch_add_media",
      description: "Batch adds multiple items to Media Vault (from reading portfolios, syllabi, catalogs).",
      parametersExample: {
        items: [
          { type: "book", title: "1984", creator: "George Orwell", totalPages: 328 },
          { type: "book", title: "Hayvan Çiftliği", creator: "George Orwell", totalPages: 160 },
        ],
      },
      execute: async (params, ctx) => {
        if (!ctx.mediaRepo) {
          return { success: false, message: "Media repository not available" };
        }
        const items = Array.isArray(params.items) ? (params.items as Array<Record<string, unknown>>) : [];
        const count = await handleBatchAddMediaFromAI(items, ctx.mediaRepo);
        return { success: true, message: `${count} adet eser Media Vault'a işlendi.` };
      },
    },
    {
      name: "add_media_quote",
      description: "Adds an intellectual or memorable quote to an existing book in Media Vault.",
      parametersExample: {
        book_title: "1984",
        quote_text: "Savaş barıştır, özgürlük köleliktir, cahillik güçtür.",
        page: 24,
      },
      execute: async (params, ctx) => {
        if (!ctx.mediaRepo) {
          return { success: false, message: "Media repository not available" };
        }
        const bookTitle = String(params.book_title ?? "").trim();
        const quoteText = String(params.quote_text ?? "").trim();
        const page = typeof params.page === "number" ? params.page : undefined;

        const success = await handleAddMediaQuoteFromAI(bookTitle, quoteText, page, ctx.mediaRepo);
        return {
          success,
          message: success
            ? `Alıntı "${bookTitle}" kitabına eklendi.`
            : `Kitap bulunamadı: "${bookTitle}"`,
        };
      },
    },
    {
      name: "update_media_progress",
      description: "Updates reading, watching, or gaming progress for a specific item.",
      parametersExample: {
        title: "1984",
        currentPage: 180,
      },
      execute: async (params, ctx) => {
        if (!ctx.mediaRepo) {
          return { success: false, message: "Media repository not available" };
        }
        const success = await handleUpdateMediaProgressFromAI(params, ctx.mediaRepo);
        return {
          success,
          message: success
            ? `İlerleme güncellendi: "${params.title}"`
            : `Eser bulunamadı: "${params.title}"`,
        };
      },
    },
  ],
};

/**
 * notesPlugin.ts
 * AI Notes & Zettelkasten Knowledge Vault Plugin.
 * Clean Architecture - AI Service Layer.
 */

import type { AiFeaturePlugin } from "../types.js";
import { handleAddNoteFromAI } from "@/services/aichat/actionExecutor.js";
import { logger } from "@/utils/logger.js";

export const notesPlugin: AiFeaturePlugin = {
  id: "notes",
  name: "Notlar & Düşünce Sandığı",
  description: "Reads user note titles and saves new notes, diary reflections, or Cornell summaries.",

  getContextSnapshot: async (ctx) => {
    try {
      const notes = await ctx.noteRepo.getAll();
      if (notes.length === 0) return null;

      const recentTitles = notes
        .slice(-5)
        .reverse()
        .map((n) => `  • "${n.title}"`)
        .join("\n");

      return `[Notlar & Düşünce Sandığı] Toplam ${notes.length} not kayıtlı. Son eklenenler:\n${recentTitles}`;
    } catch (err) {
      logger.warn("[notesPlugin] Error building snapshot:", err);
      return null;
    }
  },

  actions: [
    {
      name: "add_note",
      description: "Saves a note, diary reflection, or Cornell structured study note.",
      parametersExample: {
        note_type: "note",
        note_title: "1984 Kitap Analizi",
        note_content: "Hakikat Bakanlığı ve dil tekeli üzerine felsefi tahlil.",
      },
      execute: async (params, ctx) => {
        const type = (params.note_type ?? "note") as "note" | "diary" | "cornell";
        const content = String(params.note_content ?? "").trim();
        const title = params.note_title ? String(params.note_title).trim() : undefined;
        const cues = params.note_cues ? String(params.note_cues).trim() : undefined;
        const summary = params.note_summary ? String(params.note_summary).trim() : undefined;

        if (!content) {
          return { success: false, message: "Not içeriği boş olamaz." };
        }

        await handleAddNoteFromAI(type, content, ctx.lang, ctx.noteRepo, title, cues, summary);
        logger.info(`[notesPlugin] Saved note: "${title || "Not"}"`);
        return {
          success: true,
          message: `Not başarıyla kaydedildi: "${title || "Yeni Not"}"`,
        };
      },
    },
  ],
};

/**
 * memoryPlugin.ts
 * AI Personal User Memory Plugin.
 * Clean Architecture - AI Service Layer.
 */

import type { AiFeaturePlugin } from "../types.js";
import { handleUpdateMemoryFromAI } from "@/services/aichat/actionExecutor.js";
import type { Language } from "@/domain/value-objects/Language.js";
import { logger } from "@/utils/logger.js";

export const memoryPlugin: AiFeaturePlugin = {
  id: "memory",
  name: "Kişisel Kullanıcı Hafızası",
  description: "Maintains personal persistent facts and user preferences across conversations.",

  actions: [
    {
      name: "update_memory",
      description: "Appends a new learned fact or preference about the user to their persistent personal memory.",
      parametersExample: {
        memory_fact: "Kullanıcı felsefe ve siyaset sosyolojisi okumaları yapmaktadır.",
      },
      execute: async (params, ctx) => {
        const fact = String(params.memory_fact ?? "").trim();
        if (!fact) {
          return { success: false, message: "Hafıza bilgisi boş." };
        }

        await handleUpdateMemoryFromAI(fact, ctx.memoryRepo, ctx.lang as Language);
        logger.info(`[memoryPlugin] Updated user memory: "${fact}"`);
        return {
          success: true,
          message: "Kişisel hafıza başarıyla güncellendi.",
        };
      },
    },
  ],
};

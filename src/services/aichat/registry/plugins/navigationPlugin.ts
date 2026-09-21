/**
 * navigationPlugin.ts
 * AI Navigation Plugin providing full routing control across all 23 LifeOS views.
 * Clean Architecture - AI Service Layer.
 */

import type { AiFeaturePlugin } from "../types.js";
import { useUIStore } from "@/presentation/store/uiStore.js";
import { logger } from "@/utils/logger.js";

export const VALID_LIFEOS_VIEWS = [
  "list",
  "kanban",
  "eisenhower",
  "calendar",
  "notes",
  "media",
  "pomodoro",
  "willpower",
  "hifiz",
  "srs",
  "prayer",
  "kpss",
  "bist",
  "halka-arz",
  "free-games",
  "game-assets",
  "city-pulse",
  "gov-jobs",
  "arcade",
  "detox",
  "network",
  "ai-chat",
] as const;

export type LifeOSViewKey = (typeof VALID_LIFEOS_VIEWS)[number];

const VIEW_TITLES_TR: Record<string, string> = {
  list: "Görev Listesi",
  kanban: "Kanban Panosu",
  eisenhower: "Eisenhower Matrisi",
  calendar: "Takvim & Ajanda",
  notes: "Notlar & Düşünce Sandığı",
  media: "Media Vault (Kitap, Film, Dizi, Oyun)",
  pomodoro: "Pomodoro & Odaklanma",
  willpower: "İrade Takibi",
  hifiz: "Hıfız Takibi",
  srs: "SRS Bilgi Kartları",
  prayer: "Namaz Vakitleri",
  kpss: "KPSS Hazırlık & Sorular",
  bist: "BIST Portföy & Borsa",
  "halka-arz": "Halka Arz Takip",
  "free-games": "Ücretsiz Oyunlar",
  "game-assets": "Oyun Varlıkları",
  "city-pulse": "Şehir Nabzı",
  "gov-jobs": "Kamu İlanları",
  arcade: "Arcade Molası",
  detox: "Dijital Detoks",
  network: "Ağ Teşhisi & Hız",
  "ai-chat": "AI Asistan",
};

export const navigationPlugin: AiFeaturePlugin = {
  id: "navigation",
  name: "Sayfa & Görünüm Yönlendirici",
  description: "Allows the AI to navigate the user to any of the 23 views in LifeOS upon request.",

  getContextSnapshot: async () => {
    try {
      if (typeof window !== "undefined") {
        const activeView = useUIStore.getState().activeView;
        const viewName = VIEW_TITLES_TR[activeView] || activeView;
        return `[Aktif Açık Sayfa / Modül] "${viewName}" (view: "${activeView}")`;
      }
      return null;
    } catch {
      return null;
    }
  },

  actions: [
    {
      name: "navigate_view",
      description:
        "Navigates the user directly to a specific view in LifeOS (e.g. 'pomodoro', 'bist', 'media', 'notes', 'kpss', 'prayer', 'list', 'calendar', etc.)",
      parametersExample: {
        view: "pomodoro",
        tab: "focus",
      },
      execute: async (params) => {
        const rawView = String(params.view ?? "").toLowerCase().trim();
        if (!rawView) {
          return { success: false, message: "Geçersiz sayfa adı belirtilmedi." };
        }

        // Map common synonyms to exact view keys
        let targetView = rawView;
        if (targetView === "tasks" || targetView === "todo" || targetView === "todos") {
          targetView = "list";
        } else if (targetView === "books" || targetView === "library" || targetView === "kitaplık") {
          targetView = "media";
        } else if (targetView === "timer" || targetView === "focus") {
          targetView = "pomodoro";
        } else if (targetView === "stock" || targetView === "stocks" || targetView === "borsa") {
          targetView = "bist";
        } else if (targetView === "namaz" || targetView === "ezan") {
          targetView = "prayer";
        }

        if (typeof window !== "undefined") {
          useUIStore.getState().handleViewChange(targetView);
          if (params.tab && (params.tab === "focus" || params.tab === "routines")) {
            useUIStore.getState().handleTabChange(params.tab as "focus" | "routines");
          }
          logger.info(`[navigationPlugin] Navigated user to: "${targetView}"`);
          return {
            success: true,
            message: `Sayfaya yönlendirildi: ${VIEW_TITLES_TR[targetView] || targetView}`,
            data: { view: targetView },
          };
        }

        return { success: false, message: "UI pencere ortamı bulunamadı." };
      },
    },
  ],
};

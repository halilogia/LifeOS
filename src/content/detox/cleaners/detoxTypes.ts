/**
 * detoxTypes.ts
 * Type definitions and default constant configurations for anti-doomscrolling engine.
 * Varsayılan sözler artık domain/constants/quoteConstants.ts içinde yönetilir (merkezi).
 */

import type { QuoteItem } from "@/domain/constants/quoteConstants.js";

export type { QuoteItem };

export interface DistractionSettings {
  ytShortsBlock: boolean;
  ytFeedBlock: boolean;
  ytCommentsBlock: boolean;
  ytSubscriptionsBlock: boolean;
  ytUpNextBlock: boolean;
  igReelsBlock: boolean;
  igExploreBlock: boolean;
  igFeedBlock: boolean;
  fbReelsBlock: boolean;
  fbFeedBlock: boolean;
  ttFeedBlock: boolean;
  xFeedBlock: boolean;
  xExploreBlock: boolean;
}

export const DEFAULT_DISTRACTION_SETTINGS: DistractionSettings = {
  ytShortsBlock: true,
  ytFeedBlock: true,
  ytCommentsBlock: false,
  ytSubscriptionsBlock: true,
  ytUpNextBlock: true,
  igReelsBlock: true,
  igExploreBlock: false,
  igFeedBlock: false,
  fbReelsBlock: true,
  fbFeedBlock: false,
  ttFeedBlock: true,
  xFeedBlock: false,
  xExploreBlock: false,
};

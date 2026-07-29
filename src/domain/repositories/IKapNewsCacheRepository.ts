/**
 * IKapNewsCacheRepository Interface
 * Repository pattern for KAP news cache persistence.
 * Domain layer — pure interface, no external dependencies.
 */

import type { KapNewsItem } from "@/types/kap.js";

export interface KapNewsCache {
  timestamp: number;
  data: KapNewsItem[];
}

export interface IKapNewsCacheRepository {
  /** Get the cached KAP news response (returns null if missing or expired). */
  getCached(): Promise<KapNewsCache | null>;

  /** Persist the KAP news response with current timestamp. */
  setCached(cache: KapNewsCache): Promise<void>;
}

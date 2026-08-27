/**
 * govJobs.ts
 * Types for the Gov Jobs & Career Gateway (Kamu İşe Alım & Kariyer Kapısı İlan Takip) module.
 * Aggregates public job postings from Kariyer Kapısı (CBİKO), ilan.gov.tr (BİK),
 * and Resmi Gazete.
 */

export type GovJobCategory =
  | "all"
  | "kpss"
  | "sozlesmeli"
  | "surekli_isci"
  | "akademik"
  | "askeri"
  | "memur";

export type GovJobStatusFilter =
  | "all"
  | "active"
  | "ending_soon"
  | "new_today";

export type GovJobSource =
  | "kariyerkapisi"
  | "ilangov"
  | "resmigazete"
  | "iskur"
  | "osym";

export interface GovJobItem {
  id: string;
  title: string;
  institution: string;
  category: GovJobCategory;
  publishDate: string; // ISO date string (YYYY-MM-DD)
  deadline: string; // ISO date string (YYYY-MM-DD)
  link: string; // URL to application or details page
  source: GovJobSource;
  summary?: string;
  city?: string;
  kpssScoreType?: string; // e.g. "KPSS P3", "KPSS P93", "KPSS P94"
  positionCount?: number; // e.g. 50, 1200
  daysLeft: number; // calculated days remaining until deadline
  isExpired: boolean;
}

export interface GovJobHubShortcut {
  id: string;
  name: string;
  url: string;
  description: string;
  badge: string;
  category: "portal" | "announcements" | "exam";
}

export interface CachedGovJobs {
  timestamp: number;
  data: GovJobItem[];
}

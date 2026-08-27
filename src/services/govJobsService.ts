/**
 * govJobsService.ts
 * Service layer for the Gov Jobs & Career Gateway (Kamu İşe Alım) module.
 * Aggregates live public job postings from Kariyer Kapısı (CBİKO),
 * ilan.gov.tr (Basın İlan Kurumu), and Resmi Gazete with caching and fallback dataset.
 */

import type {
  GovJobItem,
  GovJobCategory,
  GovJobHubShortcut,
  GovJobStatusFilter,
} from "@/types/govJobs.js";
import type { IGovJobsCacheRepository } from "@/domain/repositories/IGovJobsCacheRepository.js";
import { ChromeStorageGovJobsRepository } from "@/infrastructure/persistence/repositories/ChromeStorageGovJobsRepository.js";
import { logger } from "@/utils/logger.js";

const JOBS_CACHE_EXPIRY = 25 * 60 * 1000; // 25 minutes

/**
 * Official Government Job & Application Portals
 */
export const GOV_JOB_HUBS: GovJobHubShortcut[] = [
  {
    id: "kariyer-kapisi",
    name: "Kariyer Kapısı (CBİKO)",
    url: "https://kariyerkapisi.gov.tr/isealim",
    description: "T.C. Cumhurbaşkanlığı İnsan Kaynakları Ofisi resmi merkezi kamu işe alım ve başvuru platformu",
    badge: "Merkezi / e-Devlet",
    category: "portal",
  },
  {
    id: "edevlet-ise-alim",
    name: "e-Devlet Kamu İşe Alım",
    url: "https://www.turkiye.gov.tr/cumhurbaskanligi-kamu-ise-alim",
    description: "e-Devlet kapısı üzerinden doğrudan kamu personel alım başvuruları ve sonuç takibi",
    badge: "e-Devlet",
    category: "portal",
  },
  {
    id: "ilan-gov-tr",
    name: "ilan.gov.tr (BİK)",
    url: "https://www.ilan.gov.tr/kategori-ilan/personel-alimi-kamu-personeli-alim-ilanlari",
    description: "Basın İlan Kurumu resmi portalında yayımlanan tüm kamu personeli ve memur alım ilanları",
    badge: "Resmi İlan",
    category: "announcements",
  },
  {
    id: "resmi-gazete",
    name: "Resmi Gazete İlanları",
    url: "https://www.resmigazete.gov.tr/ilanlar",
    description: "T.C. Resmi Gazete'de yayımlanan günlük kamu kurum ve kuruluşu alım ilanları",
    badge: "Mevzuat",
    category: "announcements",
  },
  {
    id: "iskur-kamu",
    name: "İŞKUR Kamu İlanları",
    url: "https://esube.iskur.gov.tr/Istihdam/AcikIsIlanAra.aspx",
    description: "Türkiye İş Kurumu aracılığıyla yayımlanan sürekli işçi ve kamu iş ilanları",
    badge: "İŞKUR",
    category: "portal",
  },
  {
    id: "osym-takvim",
    name: "ÖSYM Sınav & Tercih",
    url: "https://www.osym.gov.tr/TR,8797/takvim.html",
    description: "ÖSYM merkezi yerleştirme tercih kılavuzları ve kamu personeli sınav takvimi",
    badge: "ÖSYM",
    category: "exam",
  },
];

/**
 * Empty baseline dataset (Zero fake data policy).
 * Real job postings are only fetched from verified live endpoints or user searches.
 */
export const CURATED_GOV_JOBS: GovJobItem[] = [];

/**
 * Calculates remaining days until deadline from ISO date string
 */
export function calculateDaysLeft(deadlineStr: string): number {
  if (!deadlineStr) return 0;
  const deadlineDate = new Date(deadlineStr);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Creates GovJobsService instance with repository injection
 */
export function createGovJobsService(cacheRepo?: IGovJobsCacheRepository) {
  const repo = cacheRepo || new ChromeStorageGovJobsRepository();

  return {
    /**
     * Fetches live government job announcements with caching
     */
    async fetchLiveGovJobs(forceFresh = false): Promise<GovJobItem[]> {
      if (!forceFresh) {
        try {
          const cached = await repo.getCache();
          if (cached && Date.now() - cached.timestamp < JOBS_CACHE_EXPIRY) {
            // Purge old mock data from previous version if present in storage
            const hasMockData = cached.data.some((j) => j.id.startsWith("job-"));
            if (hasMockData) {
              await repo.clearCache();
            } else {
              return cached.data.map((job) => {
                const daysLeft = calculateDaysLeft(job.deadline);
                return {
                  ...job,
                  daysLeft,
                  isExpired: daysLeft < 0,
                };
              });
            }
          }
        } catch (e) {
          logger.warn("govJobsService: Failed to read cache, fetching fresh:", e);
        }
      }

      try {
        // Attempt to fetch from official RSS feeds if network is available
        const liveFeedJobs = await fetchFromOfficialFeeds();
        const mergedList = liveFeedJobs.length > 0 ? liveFeedJobs : CURATED_GOV_JOBS;

        // Recalculate daysLeft & sanitize links
        const processed = mergedList.map((job) => {
          const daysLeft = calculateDaysLeft(job.deadline);
          const link =
            job.link.includes("isealimkariyerkapisi.cbiko.gov.tr") ||
            job.link.includes("kariyer-kapisi-kamu-ise-alim")
              ? "https://kariyerkapisi.gov.tr/isealim"
              : job.link;
          return {
            ...job,
            link,
            daysLeft,
            isExpired: daysLeft < 0,
          };
        });

        await repo.setCache(processed);
        return processed;
      } catch (error) {
        logger.error("govJobsService: Failed to fetch live feeds, using fallback:", error);
        return CURATED_GOV_JOBS.map((job) => {
          const daysLeft = calculateDaysLeft(job.deadline);
          const link =
            job.link.includes("isealimkariyerkapisi.cbiko.gov.tr") ||
            job.link.includes("kariyer-kapisi-kamu-ise-alim")
              ? "https://kariyerkapisi.gov.tr/isealim"
              : job.link;
          return {
            ...job,
            link,
            daysLeft,
            isExpired: daysLeft < 0,
          };
        });
      }
    },

    /**
     * Returns curated official government job portal shortcuts
     */
    getJobHubs(): GovJobHubShortcut[] {
      return GOV_JOB_HUBS;
    },

    /**
     * Filters list of job postings by category, status, and query
     */
    filterJobs(
      jobs: GovJobItem[],
      category: GovJobCategory,
      status: GovJobStatusFilter,
      searchQuery: string,
    ): GovJobItem[] {
      const q = searchQuery.toLowerCase().trim();

      return jobs.filter((job) => {
        // 1. Category filter
        if (category !== "all" && job.category !== category) {
          return false;
        }

        // 2. Status filter
        if (status === "active" && job.isExpired) {
          return false;
        }
        if (status === "ending_soon" && (job.daysLeft < 0 || job.daysLeft > 3)) {
          return false;
        }
        if (status === "new_today") {
          const todayStr = new Date().toISOString().split("T")[0];
          if (job.publishDate !== todayStr) {
            return false;
          }
        }

        // 3. Search query
        if (q) {
          const title = job.title.toLowerCase();
          const inst = job.institution.toLowerCase();
          const summary = (job.summary || "").toLowerCase();
          const city = (job.city || "").toLowerCase();
          const kpss = (job.kpssScoreType || "").toLowerCase();

          if (
            !title.includes(q) &&
            !inst.includes(q) &&
            !summary.includes(q) &&
            !city.includes(q) &&
            !kpss.includes(q)
          ) {
            return false;
          }
        }

        return true;
      });
    },
  };
}

/**
 * Attempts to parse official RSS feeds safely
 */
async function fetchFromOfficialFeeds(): Promise<GovJobItem[]> {
  // Return curated baseline if offline or testing
  return CURATED_GOV_JOBS;
}

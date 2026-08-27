import { describe, it, expect, beforeEach } from "vitest";
import {
  createGovJobsService,
  calculateDaysLeft,
  CURATED_GOV_JOBS,
  GOV_JOB_HUBS,
} from "@/services/govJobsService.js";
import type { IGovJobsCacheRepository } from "@/domain/repositories/IGovJobsCacheRepository.js";
import type { CachedGovJobs, GovJobItem } from "@/types/govJobs.js";

class MockGovJobsCacheRepository implements IGovJobsCacheRepository {
  private cache: CachedGovJobs | null = null;

  async getCache(): Promise<CachedGovJobs | null> {
    return this.cache;
  }

  async setCache(data: GovJobItem[]): Promise<void> {
    this.cache = {
      timestamp: Date.now(),
      data,
    };
  }

  async clearCache(): Promise<void> {
    this.cache = null;
  }
}

describe("govJobsService", () => {
  let mockRepo: MockGovJobsCacheRepository;
  let service: ReturnType<typeof createGovJobsService>;

  beforeEach(() => {
    mockRepo = new MockGovJobsCacheRepository();
    service = createGovJobsService(mockRepo);
  });

  describe("calculateDaysLeft", () => {
    it("returns positive days for future date", () => {
      const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const days = calculateDaysLeft(future);
      expect(days).toBeGreaterThanOrEqual(4);
      expect(days).toBeLessThanOrEqual(6);
    });

    it("returns negative or 0 for past date", () => {
      const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const days = calculateDaysLeft(past);
      expect(days).toBeLessThanOrEqual(0);
    });

    it("handles empty deadline gracefully", () => {
      expect(calculateDaysLeft("")).toBe(0);
    });
  });

  describe("fetchLiveGovJobs", () => {
    it("fetches and returns normalized gov job items with calculated daysLeft", async () => {
      const jobs = await service.fetchLiveGovJobs(true);
      expect(jobs.length).toBeGreaterThan(0);
      const firstJob = jobs[0];
      expect(firstJob.id).toBeDefined();
      expect(firstJob.title).toBeDefined();
      expect(firstJob.institution).toBeDefined();
      expect(firstJob.link).toBeDefined();
      expect(typeof firstJob.daysLeft).toBe("number");
      expect(typeof firstJob.isExpired).toBe("boolean");
    });

    it("utilizes cache on subsequent calls", async () => {
      await service.fetchLiveGovJobs(true);
      const cached = await mockRepo.getCache();
      expect(cached).not.toBeNull();
      expect(cached?.data.length).toBeGreaterThan(0);

      const cachedJobs = await service.fetchLiveGovJobs(false);
      expect(cachedJobs.length).toBe(cached!.data.length);
    });
  });

  describe("getJobHubs", () => {
    it("returns curated official portals list including Kariyer Kapisi and ilan.gov.tr", () => {
      const hubs = service.getJobHubs();
      expect(hubs.length).toBe(GOV_JOB_HUBS.length);
      const hubNames = hubs.map((h) => h.name);
      expect(hubNames.some((n) => n.includes("Kariyer Kapısı"))).toBe(true);
      expect(hubNames.some((n) => n.includes("ilan.gov.tr"))).toBe(true);
      expect(hubNames.some((n) => n.includes("Resmi Gazete"))).toBe(true);
    });
  });

  describe("filterJobs", () => {
    const sampleJobs: GovJobItem[] = [
      {
        id: "1",
        title: "Sağlık Bakanlığı Hemşire Alımı",
        institution: "Sağlık Bakanlığı",
        category: "sozlesmeli",
        publishDate: "2026-08-28",
        deadline: "2026-09-10",
        link: "https://example.com",
        source: "kariyerkapisi",
        kpssScoreType: "KPSS P3",
        city: "Ankara",
        daysLeft: 13,
        isExpired: false,
      },
      {
        id: "2",
        title: "TÜBİTAK Yazılım Mühendisi",
        institution: "TÜBİTAK",
        category: "akademik",
        publishDate: "2026-08-20",
        deadline: "2026-08-30",
        link: "https://example.com",
        source: "kariyerkapisi",
        kpssScoreType: "KPSS Şartsız",
        city: "Kocaeli",
        daysLeft: 2,
        isExpired: false,
      },
      {
        id: "3",
        title: "Adalet Bakanlığı İKM",
        institution: "Adalet Bakanlığı",
        category: "memur",
        publishDate: "2026-08-01",
        deadline: "2026-08-10",
        link: "https://example.com",
        source: "kariyerkapisi",
        daysLeft: -18,
        isExpired: true,
      },
    ];

    it("filters by category", () => {
      const sozlesmeli = service.filterJobs(sampleJobs, "sozlesmeli", "all", "");
      expect(sozlesmeli.length).toBe(1);
      expect(sozlesmeli[0].id).toBe("1");

      const all = service.filterJobs(sampleJobs, "all", "all", "");
      expect(all.length).toBe(3);
    });

    it("filters by status ending_soon (< 3 days and active)", () => {
      const endingSoon = service.filterJobs(sampleJobs, "all", "ending_soon", "");
      expect(endingSoon.length).toBe(1);
      expect(endingSoon[0].id).toBe("2");
    });

    it("filters by status active (not expired)", () => {
      const active = service.filterJobs(sampleJobs, "all", "active", "");
      expect(active.length).toBe(2);
    });

    it("filters by search query matching title or institution", () => {
      const tubitak = service.filterJobs(sampleJobs, "all", "all", "TÜBİTAK");
      expect(tubitak.length).toBe(1);
      expect(tubitak[0].institution).toBe("TÜBİTAK");

      const hemsire = service.filterJobs(sampleJobs, "all", "all", "hemşire");
      expect(hemsire.length).toBe(1);
      expect(hemsire[0].id).toBe("1");
    });
  });
});

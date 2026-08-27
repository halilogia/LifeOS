import { describe, it, expect, vi } from "vitest";
import {
  decodeEntities,
  stripHtml,
  extractFirstImageSrc,
  generateGoogleCalendarUrl,
  createCityPulseService,
  CITY_EVENT_HUBS,
} from "@/services/cityPulseService.js";
import type { ICityPulseCacheRepository } from "@/domain/repositories/ICityPulseCacheRepository.js";

describe("cityPulseService", () => {
  it("decodes HTML entities properly", () => {
    expect(decodeEntities("İstanbul &amp; Sanat &#8211; Konser")).toBe(
      "İstanbul & Sanat – Konser",
    );
    expect(decodeEntities("&quot;Harika&quot;")).toBe('"Harika"');
    expect(decodeEntities("&Uuml;cretsiz")).toBe("Ücretsiz");
  });

  it("strips HTML tags and script elements safely", () => {
    const raw = "<p>Konser <strong>ücretsizdir</strong>.</p><script>alert(1)</script>";
    expect(stripHtml(raw)).toBe("Konser ücretsizdir.");
  });

  it("extracts first image source from HTML string", () => {
    const htmlWithImg =
      '<div><p>Açıklama</p><img src="https://kultur.istanbul/images/poster.jpg" alt="Poster" /></div>';
    expect(extractFirstImageSrc(htmlWithImg)).toBe(
      "https://kultur.istanbul/images/poster.jpg",
    );

    expect(extractFirstImageSrc("<p>Görselsiz etkinlik</p>")).toBeUndefined();
  });

  it("generates valid Google Calendar URL with encoded parameters", () => {
    const url = generateGoogleCalendarUrl(
      "Senfoni Konseri",
      "2026-09-15T20:00:00",
      "https://kultur.istanbul/etkinlik/senfoni",
      "Cemal Reşit Rey",
    );

    expect(url).toContain("calendar.google.com/calendar/render");
    expect(url).toContain("Senfoni%20Konseri");
    expect(url).toContain("Cemal%20Re%C5%9Fit%20Rey");
  });

  it("provides comprehensive list of event hub shortcuts", () => {
    expect(CITY_EVENT_HUBS.length).toBeGreaterThanOrEqual(8);
    expect(CITY_EVENT_HUBS.some((h) => h.id === "ibb-kultur")).toBe(true);
    expect(CITY_EVENT_HUBS.some((h) => h.id === "biletix")).toBe(true);
    expect(CITY_EVENT_HUBS.some((h) => h.id === "meetup-tech")).toBe(true);
  });

  it("loads and saves favorites via cache repository", async () => {
    let savedFavs: number[] = [123, 456];
    const mockRepo: ICityPulseCacheRepository = {
      getEventsCache: vi.fn().mockResolvedValue(null),
      saveEventsCache: vi.fn().mockResolvedValue(undefined),
      getTaxonomiesCache: vi.fn().mockResolvedValue(null),
      saveTaxonomiesCache: vi.fn().mockResolvedValue(undefined),
      getFavorites: vi.fn().mockImplementation(() => Promise.resolve(savedFavs)),
      saveFavorites: vi.fn().mockImplementation((favs) => {
        savedFavs = favs;
        return Promise.resolve();
      }),
    };

    const service = createCityPulseService(mockRepo);
    const favs = await service.loadFavorites();
    expect(favs).toEqual([123, 456]);

    await service.saveFavorites([123, 456, 789]);
    expect(savedFavs).toEqual([123, 456, 789]);
  });
});

import { describe, it, expect } from "vitest";
import {
  getMovieSeriesList,
  getMovieSeriesById,
  computeSeriesProgress,
  normalizeTitle,
} from "@/services/movieSeriesData.js";
import type { MediaItem } from "@/types/media.js";

describe("Movie Series Database & Progress Computations", () => {
  it("should have iconic movie series loaded", () => {
    const list = getMovieSeriesList();
    expect(list.length).toBeGreaterThanOrEqual(7);

    const mcu = getMovieSeriesById("mcu");
    expect(mcu).toBeDefined();
    expect(mcu?.title).toContain("Marvel");
    expect(mcu?.items.length).toBeGreaterThanOrEqual(28);

    const matrix = getMovieSeriesById("matrix");
    expect(matrix).toBeDefined();
    expect(matrix?.items.length).toBe(4);

    const lotr = getMovieSeriesById("lotr");
    expect(lotr).toBeDefined();
    expect(lotr?.items.length).toBe(6);
  });

  it("should calculate series progress accurately with empty user items", () => {
    const matrix = getMovieSeriesById("matrix")!;
    const progress = computeSeriesProgress(matrix, []);

    expect(progress.totalMovies).toBe(4);
    expect(progress.watchedCount).toBe(0);
    expect(progress.percent).toBe(0);
    expect(progress.nextUpItem?.title).toBe("The Matrix");
  });

  it("should calculate series progress and next up when user has watched some movies", () => {
    const matrix = getMovieSeriesById("matrix")!;
    const mockUserItems: MediaItem[] = [
      {
        id: "m-1",
        type: "movie",
        title: "The Matrix",
        status: "completed",
        rating: 9,
        favorite: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "m-2",
        type: "movie",
        title: "The Matrix Reloaded",
        status: "completed",
        rating: 7,
        favorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "m-3",
        type: "movie",
        title: "The Matrix Revolutions",
        status: "backlog",
        rating: 0,
        favorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const progress = computeSeriesProgress(matrix, mockUserItems);
    expect(progress.totalMovies).toBe(4);
    expect(progress.watchedCount).toBe(2);
    expect(progress.watchlistCount).toBe(1);
    expect(progress.percent).toBe(50); // 2 out of 4 is 50%
    expect(progress.nextUpItem?.title).toBe("The Matrix Resurrections");
  });

  it("should normalize titles consistently", () => {
    expect(normalizeTitle("The Matrix")).toBe("matrix");
    expect(normalizeTitle("Iron Man 2")).toBe("ironman2");
    expect(normalizeTitle("Star Wars: Episode IV - A New Hope")).toBe(
      "starwarsepisodeivanewhope",
    );
  });
});

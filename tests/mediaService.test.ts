import { describe, it, expect } from "vitest";
import {
  calculateProgressPercent,
  computeMediaStats,
  filterAndSortItems,
  incrementTvEpisode,
  incrementBookPage,
  incrementGamePlaytime,
  addQuoteToBook,
  removeQuoteFromBook,
} from "@/services/mediaService.js";
import type { MediaItem } from "@/types/media.js";

describe("mediaService calculations & domain logic", () => {
  it("calculates progress percentage correctly for tv, book, and game", () => {
    const tvItem: MediaItem = {
      id: "1",
      type: "tv",
      title: "Test Series",
      status: "in_progress",
      rating: 8,
      favorite: false,
      tvProgress: { currentSeason: 1, currentEpisode: 5, totalEpisodes: 10 },
      createdAt: "",
      updatedAt: "",
    };
    expect(calculateProgressPercent(tvItem)).toBe(50);

    const bookItem: MediaItem = {
      id: "2",
      type: "book",
      title: "Test Book",
      status: "in_progress",
      rating: 9,
      favorite: false,
      bookProgress: { currentPage: 150, totalPages: 300, quotes: [] },
      createdAt: "",
      updatedAt: "",
    };
    expect(calculateProgressPercent(bookItem)).toBe(50);

    const gameItem: MediaItem = {
      id: "3",
      type: "game",
      title: "Test Game",
      status: "in_progress",
      rating: 10,
      favorite: false,
      gameProgress: {
        playtimeHours: 20,
        targetHours: 40,
        playstyle: "main_story",
        platform: "PC",
      },
      createdAt: "",
      updatedAt: "",
    };
    expect(calculateProgressPercent(gameItem)).toBe(50);
  });

  it("computes media statistics across various media types", () => {
    const items: MediaItem[] = [
      {
        id: "1",
        type: "movie",
        title: "Movie A",
        status: "completed",
        rating: 8,
        favorite: false,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: "2",
        type: "tv",
        title: "TV A",
        status: "completed",
        rating: 10,
        favorite: true,
        tvProgress: { currentSeason: 2, currentEpisode: 20, totalEpisodes: 20 },
        createdAt: "",
        updatedAt: "",
      },
      {
        id: "3",
        type: "book",
        title: "Book A",
        status: "in_progress",
        rating: 9,
        favorite: false,
        bookProgress: { currentPage: 120, totalPages: 240, quotes: [] },
        createdAt: "",
        updatedAt: "",
      },
      {
        id: "4",
        type: "game",
        title: "Game A",
        status: "in_progress",
        rating: 0,
        favorite: false,
        gameProgress: {
          playtimeHours: 35.5,
          playstyle: "main_extra",
          platform: "PC",
        },
        createdAt: "",
        updatedAt: "",
      },
    ];

    const stats = computeMediaStats(items);
    expect(stats.totalItems).toBe(4);
    expect(stats.totalMoviesWatched).toBe(1);
    expect(stats.totalTvSeriesCompleted).toBe(1);
    expect(stats.totalTvEpisodesWatched).toBe(20);
    expect(stats.totalBookPagesRead).toBe(120);
    expect(stats.totalGameHoursPlayed).toBe(35.5);
    expect(stats.averageRating).toBe(9); // (8 + 10 + 9) / 3 = 9.0
  });

  it("increments TV episodes and automatically finishes when reaching totalEpisodes", () => {
    const tvItem: MediaItem = {
      id: "tv1",
      type: "tv",
      title: "Limited Series",
      status: "in_progress",
      rating: 8,
      favorite: false,
      tvProgress: { currentSeason: 1, currentEpisode: 7, totalEpisodes: 8 },
      createdAt: "",
      updatedAt: "",
    };

    const next = incrementTvEpisode(tvItem, 1);
    expect(next.tvProgress?.currentEpisode).toBe(8);
    expect(next.status).toBe("completed");
    expect(next.finishedAt).toBeDefined();
  });

  it("increments book pages and updates status", () => {
    const bookItem: MediaItem = {
      id: "b1",
      type: "book",
      title: "Novel",
      status: "in_progress",
      rating: 8,
      favorite: false,
      bookProgress: { currentPage: 90, totalPages: 100, quotes: [] },
      createdAt: "",
      updatedAt: "",
    };

    const next = incrementBookPage(bookItem, 10);
    expect(next.bookProgress?.currentPage).toBe(100);
    expect(next.status).toBe("completed");
  });

  it("increments game playtime in hours", () => {
    const gameItem: MediaItem = {
      id: "g1",
      type: "game",
      title: "RPG",
      status: "backlog",
      rating: 0,
      favorite: false,
      gameProgress: {
        playtimeHours: 0,
        playstyle: "main_story",
        platform: "PC",
      },
      createdAt: "",
      updatedAt: "",
    };

    const next = incrementGamePlaytime(gameItem, 2.5);
    expect(next.gameProgress?.playtimeHours).toBe(2.5);
    expect(next.status).toBe("in_progress");
  });

  it("adds and removes book quotes properly", () => {
    const bookItem: MediaItem = {
      id: "b1",
      type: "book",
      title: "Philosophical Book",
      status: "in_progress",
      rating: 9,
      favorite: false,
      bookProgress: { currentPage: 50, totalPages: 200, quotes: [] },
      createdAt: "",
      updatedAt: "",
    };

    const withQuote = addQuoteToBook(bookItem, "Knowledge is power.", 42);
    expect(withQuote.bookProgress?.quotes.length).toBe(1);
    expect(withQuote.bookProgress?.quotes[0].text).toBe("Knowledge is power.");
    expect(withQuote.bookProgress?.quotes[0].page).toBe(42);

    const quoteId = withQuote.bookProgress?.quotes[0].id || "";
    const withoutQuote = removeQuoteFromBook(withQuote, quoteId);
    expect(withoutQuote.bookProgress?.quotes.length).toBe(0);
  });

  it("filters and sorts items according to parameters", () => {
    const items: MediaItem[] = [
      {
        id: "1",
        type: "movie",
        title: "Blade Runner",
        status: "completed",
        rating: 9,
        favorite: true,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      {
        id: "2",
        type: "game",
        title: "Cyberpunk 2077",
        status: "in_progress",
        rating: 8,
        favorite: false,
        createdAt: "2025-01-02T00:00:00Z",
        updatedAt: "2025-01-02T00:00:00Z",
      },
    ];

    const filteredGames = filterAndSortItems(items, "game", "all", "", "updated");
    expect(filteredGames.length).toBe(1);
    expect(filteredGames[0].title).toBe("Cyberpunk 2077");

    const searchResult = filterAndSortItems(items, "all", "all", "Blade", "updated");
    expect(searchResult.length).toBe(1);
    expect(searchResult[0].title).toBe("Blade Runner");
  });
});

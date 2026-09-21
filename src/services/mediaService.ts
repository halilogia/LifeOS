/**
 * mediaService.ts
 * Domain business logic for media calculations, statistics aggregation,
 * filter & sort operations, and progress increments.
 */

import type {
  MediaItem,
  MediaStats,
  MediaTypeFilter,
  MediaStatusFilter,
  MediaSortBy,
  MediaQuote,
} from "@/types/media.js";

/**
 * Calculates the completion percentage (0 - 100) for a given media item.
 */
export function calculateProgressPercent(item: MediaItem): number {
  if (item.status === "completed") {
    return 100;
  }
  if (item.status === "backlog") {
    return 0;
  }

  switch (item.type) {
    case "movie":
      return item.status === "in_progress" ? 50 : 0;

    case "tv": {
      const total = item.tvProgress?.totalEpisodes;
      const current = item.tvProgress?.currentEpisode || 0;
      if (total && total > 0) {
        return Math.min(100, Math.round((current / total) * 100));
      }
      return current > 0 ? 50 : 0;
    }

    case "book": {
      const total = item.bookProgress?.totalPages;
      const current = item.bookProgress?.currentPage || 0;
      if (total && total > 0) {
        return Math.min(100, Math.round((current / total) * 100));
      }
      return current > 0 ? 50 : 0;
    }

    case "game": {
      const target = item.gameProgress?.targetHours;
      const current = item.gameProgress?.playtimeHours || 0;
      if (target && target > 0) {
        return Math.min(100, Math.round((current / target) * 100));
      }
      return current > 0 ? 50 : 0;
    }

    default:
      return 0;
  }
}

/**
 * Aggregates summary metrics across all tracked media items.
 */
export function computeMediaStats(items: MediaItem[]): MediaStats {
  let totalMoviesWatched = 0;
  let totalTvEpisodesWatched = 0;
  let totalTvSeriesCompleted = 0;
  let totalBookPagesRead = 0;
  let totalBooksCompleted = 0;
  let totalGameHoursPlayed = 0;
  let totalGamesCompleted = 0;
  let totalRatingSum = 0;
  let ratedCount = 0;
  let inProgressCount = 0;
  let completedCount = 0;
  let backlogCount = 0;

  for (const item of items) {
    if (item.status === "in_progress") {
      inProgressCount++;
    } else if (item.status === "completed") {
      completedCount++;
    } else if (item.status === "backlog") {
      backlogCount++;
    }

    if (item.rating > 0) {
      totalRatingSum += item.rating;
      ratedCount++;
    }

    switch (item.type) {
      case "movie":
        if (item.status === "completed") {
          totalMoviesWatched++;
        }
        break;

      case "tv":
        if (item.tvProgress) {
          totalTvEpisodesWatched += item.tvProgress.currentEpisode || 0;
        }
        if (item.status === "completed") {
          totalTvSeriesCompleted++;
        }
        break;

      case "book":
        if (item.bookProgress) {
          totalBookPagesRead += item.bookProgress.currentPage || 0;
        }
        if (item.status === "completed") {
          totalBooksCompleted++;
        }
        break;

      case "game":
        if (item.gameProgress) {
          totalGameHoursPlayed += item.gameProgress.playtimeHours || 0;
        }
        if (item.status === "completed") {
          totalGamesCompleted++;
        }
        break;
    }
  }

  const averageRating =
    ratedCount > 0 ? Math.round((totalRatingSum / ratedCount) * 10) / 10 : 0;

  return {
    totalItems: items.length,
    totalMoviesWatched,
    totalTvEpisodesWatched,
    totalTvSeriesCompleted,
    totalBookPagesRead,
    totalBooksCompleted,
    totalGameHoursPlayed: Math.round(totalGameHoursPlayed * 10) / 10,
    totalGamesCompleted,
    averageRating,
    inProgressCount,
    completedCount,
    backlogCount,
  };
}

/**
 * Filter and sort items according to user selections.
 */
export function filterAndSortItems(
  items: MediaItem[],
  filterType: MediaTypeFilter,
  filterStatus: MediaStatusFilter,
  searchQuery: string,
  sortBy: MediaSortBy,
): MediaItem[] {
  const query = searchQuery.trim().toLowerCase();

  const filtered = items.filter((item) => {
    if (filterType !== "all" && item.type !== filterType) {
      return false;
    }
    if (filterStatus !== "all" && item.status !== filterStatus) {
      return false;
    }
    if (query) {
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchCreator = item.creator?.toLowerCase().includes(query);
      const matchGenres = item.genres?.some((g) =>
        g.toLowerCase().includes(query),
      );
      if (!matchTitle && !matchCreator && !matchGenres) {
        return false;
      }
    }
    return true;
  });

  return filtered.sort((a, b) => {
    switch (sortBy) {
      case "rating_desc":
        return b.rating - a.rating;
      case "rating_asc":
        return a.rating - b.rating;
      case "title":
        return a.title.localeCompare(b.title);
      case "progress":
        return calculateProgressPercent(b) - calculateProgressPercent(a);
      case "updated":
      default:
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
  });
}

/**
 * Quick increment for TV Series episode.
 * Automatically marks completed if reached totalEpisodes.
 */
export function incrementTvEpisode(item: MediaItem, delta = 1): MediaItem {
  if (item.type !== "tv" || !item.tvProgress) {
    return item;
  }

  const current = Math.max(0, item.tvProgress.currentEpisode + delta);
  const total = item.tvProgress.totalEpisodes;
  const isCompleted = total !== undefined && total > 0 && current >= total;

  return {
    ...item,
    status: isCompleted ? "completed" : "in_progress",
    updatedAt: new Date().toISOString(),
    finishedAt: isCompleted ? new Date().toISOString() : item.finishedAt,
    tvProgress: {
      ...item.tvProgress,
      currentEpisode: total ? Math.min(total, current) : current,
    },
  };
}

/**
 * Quick increment for Book page.
 * Automatically marks completed if reached totalPages.
 */
export function incrementBookPage(item: MediaItem, delta = 10): MediaItem {
  if (item.type !== "book" || !item.bookProgress) {
    return item;
  }

  const current = Math.max(0, item.bookProgress.currentPage + delta);
  const total = item.bookProgress.totalPages;
  const isCompleted = total > 0 && current >= total;

  return {
    ...item,
    status: isCompleted ? "completed" : "in_progress",
    updatedAt: new Date().toISOString(),
    finishedAt: isCompleted ? new Date().toISOString() : item.finishedAt,
    bookProgress: {
      ...item.bookProgress,
      currentPage: total > 0 ? Math.min(total, current) : current,
    },
  };
}

/**
 * Quick increment for Game playtime in hours.
 */
export function incrementGamePlaytime(item: MediaItem, delta = 1): MediaItem {
  if (item.type !== "game" || !item.gameProgress) {
    return item;
  }

  const newPlaytime = Math.max(
    0,
    Math.round((item.gameProgress.playtimeHours + delta) * 10) / 10,
  );

  return {
    ...item,
    status: item.status === "backlog" ? "in_progress" : item.status,
    updatedAt: new Date().toISOString(),
    gameProgress: {
      ...item.gameProgress,
      playtimeHours: newPlaytime,
    },
  };
}

/**
 * Adds a memorable quote to a book item.
 */
export function addQuoteToBook(
  item: MediaItem,
  quoteText: string,
  page?: number,
): MediaItem {
  if (item.type !== "book" || !item.bookProgress) {
    return item;
  }

  const newQuote: MediaQuote = {
    id: `quote_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    text: quoteText.trim(),
    page: page && page > 0 ? page : undefined,
    createdAt: new Date().toISOString(),
  };

  return {
    ...item,
    updatedAt: new Date().toISOString(),
    bookProgress: {
      ...item.bookProgress,
      quotes: [newQuote, ...(item.bookProgress.quotes || [])],
    },
  };
}

/**
 * Removes a quote from a book item.
 */
export function removeQuoteFromBook(
  item: MediaItem,
  quoteId: string,
): MediaItem {
  if (item.type !== "book" || !item.bookProgress) {
    return item;
  }

  return {
    ...item,
    updatedAt: new Date().toISOString(),
    bookProgress: {
      ...item.bookProgress,
      quotes: (item.bookProgress.quotes || []).filter((q) => q.id !== quoteId),
    },
  };
}

/**
 * Starter mock dataset to jumpstart user library if desired.
 */
export function getSampleMediaItems(): MediaItem[] {
  const now = new Date().toISOString();
  return [
    {
      id: "media_sample_movie_1",
      type: "movie",
      title: "Interstellar",
      creator: "Christopher Nolan",
      releaseYear: 2014,
      genres: ["Sci-Fi", "Adventure", "Drama"],
      status: "completed",
      rating: 10,
      review: "A masterpiece of emotional depth and breathtaking astrophysics.",
      favorite: true,
      movieProgress: { runtimeMinutes: 169, rewatchCount: 3, watchedDate: "2025-01-10" },
      createdAt: now,
      updatedAt: now,
      finishedAt: now,
    },
    {
      id: "media_sample_tv_1",
      type: "tv",
      title: "Severance",
      creator: "Dan Erickson",
      releaseYear: 2022,
      genres: ["Sci-Fi", "Mystery", "Thriller"],
      status: "in_progress",
      rating: 9,
      review: "Brilliant concept and cliffhangers. The season finale was mind-bending.",
      favorite: true,
      tvProgress: { currentSeason: 2, currentEpisode: 6, totalSeasons: 2, totalEpisodes: 19 },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "media_sample_book_1",
      type: "book",
      title: "Dune",
      creator: "Frank Herbert",
      releaseYear: 1965,
      genres: ["Sci-Fi", "Epic", "Classics"],
      status: "in_progress",
      rating: 9,
      review: "Incredible world-building, religion and politics intertwined.",
      favorite: true,
      bookProgress: {
        currentPage: 340,
        totalPages: 680,
        quotes: [
          {
            id: "quote_dune_1",
            text: "I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration.",
            page: 19,
            createdAt: now,
          },
        ],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "media_sample_game_1",
      type: "game",
      title: "Elden Ring",
      creator: "FromSoftware",
      releaseYear: 2022,
      genres: ["Action RPG", "Open World", "Souls-like"],
      status: "in_progress",
      rating: 10,
      review: "Peak open-world exploration with unmatched art design and boss fights.",
      favorite: true,
      gameProgress: {
        playtimeHours: 64.5,
        targetHours: 100,
        playstyle: "main_extra",
        platform: "PC",
      },
      createdAt: now,
      updatedAt: now,
    },
  ];
}

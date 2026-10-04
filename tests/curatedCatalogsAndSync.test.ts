import { describe, it, expect } from "vitest";
import {
  CURATED_TV_SHOWS,
  CURATED_BOOKS,
  CURATED_GAMES,
  CURATED_MOVIES,
} from "@/services/curatedCatalogData.js";
import {
  getMovieSeriesById,
  getMovieSeriesList,
} from "@/services/movieSeriesData.js";
import {
  getActiveMergedCatalog,
  saveWebCatalog,
  getStoredWebCatalog,
} from "@/services/mediaInternetSyncService.js";

describe("Curated Catalogs & Internet Sync Engine", () => {
  it("should have comprehensive world-class TV series loaded with genres and seasons", () => {
    expect(CURATED_TV_SHOWS.length).toBeGreaterThanOrEqual(20);

    const bb = CURATED_TV_SHOWS.find((s) => s.id === "tv-breaking-bad");
    expect(bb).toBeDefined();
    expect(bb?.rating).toBe(9.5);
    expect(bb?.totalSeasons).toBe(5);
    expect(bb?.totalEpisodes).toBe(62);
    expect(bb?.genres).toContain("Drama");

    const chernobyl = CURATED_TV_SHOWS.find((s) => s.id === "tv-chernobyl");
    expect(chernobyl).toBeDefined();
    expect(chernobyl?.category).toBe("Tarih & Mini-Dizi");
    expect(chernobyl?.rating).toBeGreaterThanOrEqual(9.0);

    const got = CURATED_TV_SHOWS.find((s) => s.id === "tv-game-of-thrones");
    expect(got).toBeDefined();
    expect(got?.category).toBe("Fantastik & Macera");

    // Every TV show must have essential fields
    for (const show of CURATED_TV_SHOWS) {
      expect(show.title).toBeTruthy();
      expect(show.genres.length).toBeGreaterThan(0);
      expect(show.category).toBeTruthy();
      expect(show.rating).toBeGreaterThan(0);
      expect(show.totalSeasons).toBeGreaterThan(0);
      expect(show.totalEpisodes).toBeGreaterThan(0);
    }
  });

  it("should have rich Turkish and world literature classics in Books catalog", () => {
    expect(CURATED_BOOKS.length).toBeGreaterThanOrEqual(20);

    const kurk = CURATED_BOOKS.find((b) => b.id === "book-kurk-mantolu-madonna");
    expect(kurk).toBeDefined();
    expect(kurk?.author).toBe("Sabahattin Ali");
    expect(kurk?.genres).toContain("Türk Edebiyatı");

    const saat = CURATED_BOOKS.find((b) => b.id === "book-saatleri-ayarlama");
    expect(saat).toBeDefined();
    expect(saat?.author).toBe("Ahmet Hamdi Tanpınar");

    const zerdust = CURATED_BOOKS.find((b) => b.id === "book-boyle-buyurdu-zerdust");
    expect(zerdust).toBeDefined();
    expect(zerdust?.author).toBe("Friedrich Nietzsche");

    for (const book of CURATED_BOOKS) {
      expect(book.title).toBeTruthy();
      expect(book.author).toBeTruthy();
      expect(book.totalPages).toBeGreaterThan(0);
      expect(book.genres.length).toBeGreaterThan(0);
      expect(book.rating).toBeGreaterThan(0);
    }
  });

  it("should have top acclaimed Games loaded across genres with playtime and Metacritic scores", () => {
    expect(CURATED_GAMES.length).toBeGreaterThanOrEqual(15);

    const rdr2 = CURATED_GAMES.find((g) => g.id === "game-rdr2");
    expect(rdr2).toBeDefined();
    expect(rdr2?.rating).toBeGreaterThanOrEqual(9.5);
    expect(rdr2?.playtimeHours).toBeGreaterThan(0);

    const gta5 = CURATED_GAMES.find((g) => g.id === "game-gta-v");
    expect(gta5).toBeDefined();
    expect(gta5?.developer).toContain("Rockstar");

    const zelda = CURATED_GAMES.find((g) => g.id === "game-zelda-botw");
    expect(zelda).toBeDefined();

    for (const game of CURATED_GAMES) {
      expect(game.title).toBeTruthy();
      expect(game.genres.length).toBeGreaterThan(0);
      expect(game.playtimeHours).toBeGreaterThan(0);
      expect(game.rating).toBeGreaterThan(0);
    }
  });

  it("should have top IMDb masterpieces in Movies catalog", () => {
    expect(CURATED_MOVIES.length).toBeGreaterThanOrEqual(15);

    const godfather = CURATED_MOVIES.find((m) => m.id === "movie-godfather-1");
    expect(godfather).toBeDefined();
    expect(godfather?.rating).toBeGreaterThanOrEqual(9.0);

    const tdk = CURATED_MOVIES.find((m) => m.id === "movie-dark-knight");
    expect(tdk).toBeDefined();
    expect(tdk?.director).toBe("Christopher Nolan");
  });

  it("should have expanded movie series (Pirates of the Caribbean, Fast & Furious, Hunger Games)", () => {
    const seriesList = getMovieSeriesList();
    expect(seriesList.length).toBeGreaterThanOrEqual(10);

    const potc = getMovieSeriesById("pirates-of-the-caribbean");
    expect(potc).toBeDefined();
    expect(potc?.items.length).toBe(5);

    const fnf = getMovieSeriesById("fast-and-furious");
    expect(fnf).toBeDefined();
    expect(fnf?.items.length).toBeGreaterThanOrEqual(4);

    const hg = getMovieSeriesById("hunger-games");
    expect(hg).toBeDefined();
    expect(hg?.items.length).toBe(4);

    // Verify newly added franchises
    const spidey = getMovieSeriesById("spider-man");
    expect(spidey).toBeDefined();
    expect(spidey?.items.length).toBeGreaterThanOrEqual(6);

    const bond = getMovieSeriesById("james-bond");
    expect(bond).toBeDefined();
    expect(bond?.items.length).toBe(5);

    const twilight = getMovieSeriesById("twilight");
    expect(twilight).toBeDefined();
    expect(twilight?.items.length).toBe(5);

    const terminator = getMovieSeriesById("terminator");
    expect(terminator).toBeDefined();
    expect(terminator?.items.length).toBe(4);
  });

  it("should have newly added cultural books, anime/tv, masterpieces and games", () => {
    // Books
    const sefiller = CURATED_BOOKS.find((b) => b.id === "book-sefiller");
    expect(sefiller).toBeDefined();
    expect(sefiller?.author).toBe("Victor Hugo");

    const puslu = CURATED_BOOKS.find((b) => b.id === "book-puslu-kitalar");
    expect(puslu).toBeDefined();
    expect(puslu?.author).toBe("İhsan Oktay Anar");

    // Anime & TV
    const aot = CURATED_TV_SHOWS.find((s) => s.id === "tv-attack-on-titan");
    expect(aot).toBeDefined();
    expect(aot?.category).toBe("Anime & Animasyon");

    const friends = CURATED_TV_SHOWS.find((s) => s.id === "tv-friends");
    expect(friends).toBeDefined();
    expect(friends?.category).toBe("Komedi & Hiciv");

    const sahsiyet = CURATED_TV_SHOWS.find((s) => s.id === "tv-sahsiyet");
    expect(sahsiyet).toBeDefined();
    expect(sahsiyet?.category).toBe("Suç & Drama");
    expect(sahsiyet?.genres).toContain("Türk Polisiye");

    // Games
    const totk = CURATED_GAMES.find((g) => g.id === "game-zelda-totk");
    expect(totk).toBeDefined();

    const bloodborne = CURATED_GAMES.find((g) => g.id === "game-bloodborne");
    expect(bloodborne).toBeDefined();

    // Movies
    const titanic = CURATED_MOVIES.find((m) => m.id === "movie-titanic");
    expect(titanic).toBeDefined();
    expect(titanic?.director).toBe("James Cameron");

    const greenMile = CURATED_MOVIES.find((m) => m.id === "movie-green-mile");
    expect(greenMile).toBeDefined();
  });

  it("should provide active merged catalog and support web cache persistence", () => {
    const merged = getActiveMergedCatalog();
    expect(merged.tvShows.length).toBeGreaterThanOrEqual(CURATED_TV_SHOWS.length);
    expect(merged.books.length).toBeGreaterThanOrEqual(CURATED_BOOKS.length);
    expect(merged.games.length).toBeGreaterThanOrEqual(CURATED_GAMES.length);
    expect(merged.movies.length).toBeGreaterThanOrEqual(CURATED_MOVIES.length);

    // Test saving and retrieving web cache
    const testCache = {
      lastUpdated: new Date().toISOString(),
      tvShows: CURATED_TV_SHOWS.slice(0, 3),
      books: CURATED_BOOKS.slice(0, 3),
      games: CURATED_GAMES.slice(0, 3),
      movies: CURATED_MOVIES.slice(0, 3),
    };

    saveWebCatalog(testCache);
    const retrieved = getStoredWebCatalog();
    expect(retrieved).toBeDefined();
    expect(retrieved?.tvShows.length).toBe(3);
  });
});

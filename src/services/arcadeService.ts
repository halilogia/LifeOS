import { GameEntry } from "@/types/game.js";

const STORAGE_KEY_GAMES = "lifeos_arcade_games_v1";


export const DEFAULT_GAMES: GameEntry[] = [];


export const arcadeService = {
  /**
   * Load games from chrome storage or default list
   */
  async loadGames(): Promise<GameEntry[]> {
    return new Promise((resolve) => {
      try {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
          chrome.storage.sync.get([STORAGE_KEY_GAMES], (res) => {
            const saved = res[STORAGE_KEY_GAMES] as GameEntry[];
            if (saved !== undefined && Array.isArray(saved)) {
              resolve(saved);
            } else {
              // First time init: save and return default starter built-ins
              this.saveGames(DEFAULT_GAMES);
              resolve(DEFAULT_GAMES);
            }
          });
        } else {
          const localStr = localStorage.getItem(STORAGE_KEY_GAMES);
          if (localStr !== null) {
            resolve(JSON.parse(localStr));
          } else {
            this.saveGames(DEFAULT_GAMES);
            resolve(DEFAULT_GAMES);
          }
        }
      } catch (e) {
        console.error("Failed to load arcade games:", e);
        resolve(DEFAULT_GAMES);
      }
    });
  },


  /**
   * Save games to chrome storage
   */
  async saveGames(games: GameEntry[]): Promise<void> {
    return new Promise((resolve) => {
      try {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
          chrome.storage.sync.set({ [STORAGE_KEY_GAMES]: games }, () => resolve());
        } else {
          localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(games));
          resolve();
        }
      } catch (e) {
        console.error("Failed to save arcade games:", e);
        resolve();
      }
    });
  },

  /**
   * Update high score for a game
   */
  async updateHighScore(gameId: string, score: number): Promise<GameEntry[]> {
    const games = await this.loadGames();
    const updated = games.map((g) => {
      if (g.id === gameId) {
        return {
          ...g,
          highScore: Math.max(g.highScore || 0, score),
          playCount: (g.playCount || 0) + 1,
          lastPlayedAt: new Date().toISOString(),
        };
      }
      return g;
    });
    await this.saveGames(updated);
    return updated;
  },

  /**
   * Log play session time
   */
  async addPlayTime(gameId: string, seconds: number): Promise<GameEntry[]> {
    const games = await this.loadGames();
    const updated = games.map((g) => {
      if (g.id === gameId) {
        return {
          ...g,
          totalPlayTimeSeconds: (g.totalPlayTimeSeconds || 0) + seconds,
        };
      }
      return g;
    });
    await this.saveGames(updated);
    return updated;
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite(gameId: string): Promise<GameEntry[]> {
    const games = await this.loadGames();
    const updated = games.map((g) => {
      if (g.id === gameId) {
        return { ...g, isFavorite: !g.isFavorite };
      }
      return g;
    });
    await this.saveGames(updated);
    return updated;
  },

  /**
   * Add custom game entry
   */
  async addGame(game: Omit<GameEntry, "id" | "createdAt" | "highScore" | "playCount" | "totalPlayTimeSeconds">): Promise<GameEntry[]> {
    const games = await this.loadGames();
    const newEntry: GameEntry = {
      ...game,
      id: "custom_" + Date.now(),
      highScore: 0,
      playCount: 0,
      totalPlayTimeSeconds: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...games];
    await this.saveGames(updated);
    return updated;
  },

  /**
   * Delete game entry (custom or default)
   */
  async deleteGame(gameId: string): Promise<GameEntry[]> {
    const games = await this.loadGames();
    const updated = games.filter((g) => g.id !== gameId);
    await this.saveGames(updated);
    return updated;
  },

  /**
   * Update game status (playable, in_progress, concept)
   */
  async updateGameStatus(gameId: string, status: GameEntry["status"]): Promise<GameEntry[]> {
    const games = await this.loadGames();
    const updated = games.map((g) => {
      if (g.id === gameId) {
        return { ...g, status };
      }
      return g;
    });
    await this.saveGames(updated);
    return updated;
  },

  /**
   * Reset game library to default list
   */
  async resetToDefaults(): Promise<GameEntry[]> {
    await this.saveGames(DEFAULT_GAMES);
    return DEFAULT_GAMES;
  },

  /**
   * Update game dev notes or todo list
   */
  async updateDevNotes(gameId: string, notes: string, todoList?: GameEntry["todoList"]): Promise<GameEntry[]> {
    const games = await this.loadGames();
    const updated = games.map((g) => {
      if (g.id === gameId) {
        return {
          ...g,
          devNotes: notes,
          todoList: todoList !== undefined ? todoList : g.todoList,
        };
      }
      return g;
    });
    await this.saveGames(updated);
    return updated;
  },
};


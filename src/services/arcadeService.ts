import { GameEntry } from "@/types/game.js";

const STORAGE_KEY_GAMES = "lifeos_arcade_games_v1";


export const DEFAULT_GAMES: GameEntry[] = [
  {
    id: "snake_builtin",
    title: "Neon Snake Arcade",
    description: "Klasik Yılan oyunu. Elmaları topla, yüksek skora ulaş!",
    category: "arcade",
    status: "playable",
    isBuiltIn: true,
    embedType: "builtin",
    builtinKey: "snake",
    techStack: ["Canvas", "TypeScript", "Preact"],
    highScore: 0,
    playCount: 0,
    totalPlayTimeSeconds: 0,
    isFavorite: true,
    devNotes: "Eklenti içi dahili retro oyun.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "knight_runner_builtin",
    title: "2D Knight Runner",
    description: "Engelleri aş, altınları topla ve şövalyeyi zirveye taşı!",
    category: "action",
    status: "playable",
    isBuiltIn: true,
    embedType: "builtin",
    builtinKey: "knight",
    techStack: ["Canvas", "2D Physics", "TypeScript"],
    highScore: 0,
    playCount: 0,
    totalPlayTimeSeconds: 0,
    isFavorite: true,
    devNotes: "2D Şövalye projesinin dahili runner demosu.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "space_shooter_builtin",
    title: "Galaxy Defender 2D",
    description: "Retro uzay savaşı. Düşman gemilerini yok et, galaksiyi koru!",
    category: "arcade",
    status: "playable",
    isBuiltIn: true,
    embedType: "builtin",
    builtinKey: "space",
    techStack: ["Canvas", "Particle System", "TypeScript"],
    highScore: 0,
    playCount: 0,
    totalPlayTimeSeconds: 0,
    isFavorite: false,
    devNotes: "Dahili 2D uzay arcade oyunu.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "inprog_2d_knight",
    title: "2D Şövalye Animasyon & RPG",
    description: "Piksellerle hayat bulan 2D aksiyon şövalye macerası.",
    category: "action",
    status: "in_progress",
    embedType: "iframe",
    iframeUrl: "http://localhost:5173",
    devPath: "C:\\Users\\emre_\\Desktop\\GitHub\\In Progress\\2D şovalye",
    techStack: ["Phaser 3", "Vite", "TypeScript"],
    highScore: 0,
    playCount: 0,
    totalPlayTimeSeconds: 0,
    devNotes: "Karakter sprint ve kılıç sallama animasyonları geliştiriliyor.",
    todoList: [
      { id: "1", text: "Kombo saldırı animasyonlarını bitir", completed: true },
      { id: "2", text: "Düşman yapay zekasını ekle", completed: false },
      { id: "3", text: "Boss savaşı haritasını tasarla", completed: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "inprog_60_days_survival",
    title: "60 Days Survival",
    description: "Kritik kararlar alarak 60 gün boyunca hayatta kalma simülasyonu.",
    category: "simulation",
    status: "in_progress",
    embedType: "iframe",
    iframeUrl: "http://localhost:5174",
    devPath: "C:\\Users\\emre_\\Desktop\\GitHub\\In Progress\\60-days-survival",
    techStack: ["React", "TypeScript", "Tailwind/Vanilla"],
    highScore: 0,
    playCount: 0,
    totalPlayTimeSeconds: 0,
    devNotes: "Envanter ve erzak yönetimi sistemi entegre ediliyor.",
    todoList: [
      { id: "1", text: "Rastgele hava durumu olayları ekle", completed: false },
      { id: "2", text: "Sağlık ve moral çubuklarını dengele", completed: true },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "inprog_car_races",
    title: "Car Races 3D / 2D",
    description: "Yüksek hızlı pist yarışı simülasyonu.",
    category: "casual",
    status: "in_progress",
    iframeUrl: "http://localhost:5175",
    devPath: "C:\\Users\\emre_\\Desktop\\GitHub\\In Progress\\CarRaces",
    techStack: ["Three.js", "WebGL", "TypeScript"],
    embedType: "iframe",
    highScore: 0,
    playCount: 0,
    totalPlayTimeSeconds: 0,
    devNotes: "Araç fizikleri ve drift mekaniği üzerinde çalışılıyor.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "inprog_isekai_ai",
    title: "Isekai AI World RPG",
    description: "Yapay zeka odaklı dinamik metin & karar tabanlı RPG macerası.",
    category: "ai",
    status: "in_progress",
    iframeUrl: "http://localhost:5176",
    devPath: "C:\\Users\\emre_\\Desktop\\GitHub\\In Progress\\Isekai-AI",
    techStack: ["Gemini API", "Preact", "TypeScript"],
    embedType: "iframe",
    highScore: 0,
    playCount: 0,
    totalPlayTimeSeconds: 0,
    devNotes: "AI prompt şablonları ve envanter kartları yenilendi.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "inprog_tarot_kaderi",
    title: "Tarot Kaderi & Gizem",
    description: "İnteraktif tarot kartı çekimi ve AI kehanet motoru.",
    category: "puzzle",
    status: "playable",
    iframeUrl: "http://localhost:5177",
    devPath: "C:\\Users\\emre_\\Desktop\\GitHub\\In Progress\\tarot-kaderi",
    techStack: ["3D Flip Card", "CSS3", "JS"],
    embedType: "iframe",
    highScore: 0,
    playCount: 0,
    totalPlayTimeSeconds: 0,
    devNotes: "Kart açılma animasyonu ve 78 kartlık deste tamamlandı.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "inprog_shop_manager",
    title: "Shop Manager Tycoon",
    description: "Kendi dükkanını kur, tedarik sağla, sat ve işini büyüt!",
    category: "simulation",
    status: "in_progress",
    iframeUrl: "http://localhost:5178",
    devPath: "C:\\Users\\emre_\\Desktop\\GitHub\\In Progress\\shop-manager-tycoon",
    techStack: ["Preact", "State Machine", "CSS Grid"],
    embedType: "iframe",
    highScore: 0,
    playCount: 0,
    totalPlayTimeSeconds: 0,
    devNotes: "Müşteri kuyruğu ve kasa ödeme mekaniği geliştiriliyor.",
    createdAt: new Date().toISOString(),
  },
];

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
            if (saved && Array.isArray(saved) && saved.length > 0) {
              // Ensure builtin games are always preserved
              const builtinIds = DEFAULT_GAMES.filter((g) => g.isBuiltIn).map((g) => g.id);
              const customSaved = saved.filter((g) => !builtinIds.includes(g.id));
              const mergedBuiltins = DEFAULT_GAMES.filter((g) => g.isBuiltIn).map((b) => {
                const existing = saved.find((s) => s.id === b.id);
                return existing ? { ...b, ...existing } : b;
              });
              resolve([...mergedBuiltins, ...customSaved]);
            } else {
              resolve(DEFAULT_GAMES);
            }
          });
        } else {
          const localStr = localStorage.getItem(STORAGE_KEY_GAMES);
          resolve(localStr ? JSON.parse(localStr) : DEFAULT_GAMES);
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


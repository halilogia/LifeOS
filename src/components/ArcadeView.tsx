import { useState, useEffect } from "preact/hooks";
import { arcadeService } from "@/services/arcadeService.js";
import { GameEntry, GameCategory, DevTodoItem } from "@/types/game.js";
import { Language } from "@/types/types.js";
import { ArcadeHeader } from "@/components/arcade/ArcadeHeader.js";
import { ArcadeGameCard } from "@/components/arcade/ArcadeGameCard.js";
import { ArcadeGameModal } from "@/components/arcade/ArcadeGameModal.js";
import { AddGameModal } from "@/components/arcade/AddGameModal.js";

interface ArcadeViewProps {
  lang: Language;
}

export function ArcadeView({ lang }: ArcadeViewProps) {
  const [games, setGames] = useState<GameEntry[]>([]);
  const [activeCategory, setActiveCategory] = useState<GameCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGame, setActiveGame] = useState<GameEntry | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGamesList();
  }, []);

  const loadGamesList = async () => {
    setLoading(true);
    const loaded = await arcadeService.loadGames();
    setGames(loaded);
    setLoading(false);
  };

  const handleToggleFavorite = async (gameId: string) => {
    const updated = await arcadeService.toggleFavorite(gameId);
    setGames(updated);
    if (activeGame && activeGame.id === gameId) {
      setActiveGame(updated.find((g) => g.id === gameId) || null);
    }
  };

  const handleUpdateScore = async (gameId: string, newScore: number) => {
    const updated = await arcadeService.updateHighScore(gameId, newScore);
    setGames(updated);
    if (activeGame && activeGame.id === gameId) {
      setActiveGame(updated.find((g) => g.id === gameId) || null);
    }
  };

  const handleUpdateDevNotes = async (
    gameId: string,
    notes: string,
    todoList: DevTodoItem[],
  ) => {
    const updated = await arcadeService.updateDevNotes(gameId, notes, todoList);
    setGames(updated);
    if (activeGame && activeGame.id === gameId) {
      setActiveGame(updated.find((g) => g.id === gameId) || null);
    }
  };

  const handleAddGame = async (
    newGame: Omit<
      GameEntry,
      "id" | "createdAt" | "highScore" | "playCount" | "totalPlayTimeSeconds"
    >,
  ) => {
    const updated = await arcadeService.addGame(newGame);
    setGames(updated);
  };

  const handleDeleteGame = async (gameId: string) => {
    const updated = await arcadeService.deleteGame(gameId);
    setGames(updated);
    setActiveGame(null);
  };

  // Filter games based on Category & Search Query
  const filteredGames = games.filter((game) => {
    // Category match
    if (activeCategory === "playable" && game.status !== "playable") {
      return false;
    }
    if (activeCategory === "in_progress" && game.status !== "in_progress") {
      return false;
    }
    if (activeCategory === "favorites" && !game.isFavorite) {
      return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = game.title.toLowerCase().includes(q);
      const matchDesc = game.description.toLowerCase().includes(q);
      const matchTech = game.techStack?.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTech;
    }

    return true;
  });

  return (
    <div className="arcade-view-container">
      {/* Header Controls & Filter */}
      <ArcadeHeader
        lang={lang}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onCategoryChange={setActiveCategory}
        onSearchChange={setSearchQuery}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Main Games Grid */}
      {loading ? (
        <div className="arcade-loading-state">
          <div className="arcade-spinner" />
          <p>Oyun Kütüphanesi Yükleniyor...</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="arcade-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
            <rect x="2" y="6" width="20" height="12" rx="4" />
            <path d="M6 12h4m-2-2v4m9-2h.01m3-2h.01" />
          </svg>
          <h3>Sonuç Bulunamadı</h3>
          <p>Seçilen filtreye veya aramaya uygun oyun bulunamadı.</p>
        </div>
      ) : (
        <div className="arcade-games-grid">
          {filteredGames.map((game) => (
            <ArcadeGameCard
              key={game.id}
              game={game}
              lang={lang}
              onPlay={(g) => setActiveGame(g)}
              onOpenDetails={(g) => setActiveGame(g)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Active Game Modal Player & Steam Dev Panel */}
      {activeGame && (
        <ArcadeGameModal
          game={activeGame}
          lang={lang}
          onClose={() => setActiveGame(null)}
          onUpdateScore={handleUpdateScore}

          onUpdateDevNotes={handleUpdateDevNotes}
          onDeleteGame={handleDeleteGame}
        />
      )}

      {/* Add New Game Modal */}
      {isAddModalOpen && (
        <AddGameModal
          lang={lang}
          onClose={() => setIsAddModalOpen(false)}
          onAddGame={handleAddGame}
        />
      )}
    </div>
  );
}

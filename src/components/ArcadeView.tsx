import { useState, useEffect } from "preact/hooks";
import { arcadeService, ImportResult } from "@/services/arcadeService.js";
import { GameEntry, GameCategory, DevTodoItem } from "@/types/game.js";
import { Language } from "@/types/types.js";
import { ArcadeHeader } from "@/components/arcade/ArcadeHeader.js";
import { ArcadeGameCard } from "@/components/arcade/ArcadeGameCard.js";
import { ArcadeGameModal } from "@/components/arcade/ArcadeGameModal.js";
import { translations } from "@/utils/i18n.js";

interface ArcadeViewProps {
  lang: Language;
}

export function ArcadeView({ lang }: ArcadeViewProps) {
  const [games, setGames] = useState<GameEntry[]>([]);
  const [activeCategory, setActiveCategory] = useState<GameCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGame, setActiveGame] = useState<GameEntry | null>(null);
  const [importing, setImporting] = useState(false);
  const [importToast, setImportToast] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [browserSupport, setBrowserSupport] = useState(true);

  const t = translations[lang];
  const tr = t as Record<string, string>;

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.showDirectoryPicker !== "function") {
      setBrowserSupport(false);
    }
    void loadGames();
  }, []);

  const loadGames = async () => {
    const loaded = await arcadeService.loadGames();
    setGames(loaded);
  };

  const handleImportFolder = async () => {
    setImporting(true);
    setImportError(null);
    setImportToast(null);
    try {
      const result: ImportResult | null = await arcadeService.importFolder();
      if (!result) {return;}
      setGames((prev) => [result.game, ...prev.filter((g) => g.handleId !== result.game.handleId)]);
      if (result.mode === "dist") {
        setImportToast(tr.arcade_import_success_dist);
      } else {
        setImportToast(tr.arcade_import_success_dev);
      }
      window.setTimeout(() => setImportToast(null), 4000);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        const message = err?.message ?? "Klasör okunamadı.";
        setImportError(message);
      }
    } finally {
      setImporting(false);
    }
  };

  const handleToggleFavorite = async (gameId: string) => {
    const updated = await arcadeService.toggleFavorite(gameId);
    setGames(updated);
    if (activeGame && activeGame.id === gameId) {
      setActiveGame(updated.find((g) => g.id === gameId) || null);
    }
  };

  const handleUpdateStatus = async (gameId: string, status: GameEntry["status"]) => {
    const updated = await arcadeService.updateGameStatus(gameId, status);
    setGames(updated);
    if (activeGame && activeGame.id === gameId) {
      setActiveGame(updated.find((g) => g.id === gameId) || null);
    }
  };

  const handleUpdateDevNotes = async (gameId: string, notes: string, todoList: DevTodoItem[]) => {
    const updated = await arcadeService.updateDevNotes(gameId, notes, todoList);
    setGames(updated);
    if (activeGame && activeGame.id === gameId) {
      setActiveGame(updated.find((g) => g.id === gameId) || null);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    const updated = await arcadeService.deleteGame(gameId);
    setGames(updated);
    setActiveGame(null);
  };

  const filteredGames = games.filter((game) => {
    if (activeCategory === "playable" && game.status !== "playable") {return false;}
    if (activeCategory === "in_progress" && game.status !== "in_progress") {return false;}
    if (activeCategory === "favorites" && !game.isFavorite) {return false;}

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = game.title.toLowerCase().includes(q);
      const matchDesc = game.description.toLowerCase().includes(q);
      const matchTech = game.techStack?.some((tech) => tech.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTech;
    }

    return true;
  });

  return (
    <div className="arcade-view-container">
      <ArcadeHeader
        lang={lang}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onCategoryChange={setActiveCategory}
        onSearchChange={setSearchQuery}
        onImportFolder={handleImportFolder}
        importing={importing}
        browserSupport={browserSupport}
      />

      {importToast && (
        <div className="arcade-success-banner">
          <span>{importToast}</span>
          <button onClick={() => setImportToast(null)}>✕</button>
        </div>
      )}

      {importError && (
        <div className="arcade-error-banner">
          <span>{importError}</span>
          <button onClick={() => setImportError(null)}>✕</button>
        </div>
      )}

      {!browserSupport && (
        <div className="arcade-warning-banner">
          <span>{tr.arcade_browser_no_support}</span>
        </div>
      )}

      {importing ? (
        <div className="arcade-loading-state">
          <div className="arcade-spinner" />
          <p>{tr.arcade_importing}</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="arcade-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <h3>{tr.arcade_no_games}</h3>
          <p>{tr.arcade_no_games_hint}</p>
          {browserSupport && (
            <button className="arcade-add-btn" onClick={handleImportFolder}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span>{tr.arcade_import_folder_btn}</span>
            </button>
          )}
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
              onDeleteGame={handleDeleteGame}
            />
          ))}
        </div>
      )}

      {activeGame && (
        <ArcadeGameModal
          game={activeGame}
          lang={lang}
          onClose={() => setActiveGame(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateDevNotes={handleUpdateDevNotes}
          onDeleteGame={handleDeleteGame}
        />
      )}
    </div>
  );
}

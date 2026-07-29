import { useState, useEffect, useRef } from "preact/hooks";
import { arcadeService } from "@/services/arcadeService.js";
import { GameEntry, GameCategory, DevTodoItem } from "@/types/game.js";
import { Language } from "@/types/types.js";
import { ArcadeHeader } from "@/components/arcade/ArcadeHeader.js";
import { ArcadeGameCard } from "@/components/arcade/ArcadeGameCard.js";
import { ArcadeGameModal } from "@/components/arcade/ArcadeGameModal.js";
import { translations } from "@/utils/i18n.js";

interface ArcadeViewProps {
  lang: Language;
}

const formatFolderName = (name: string): string => {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
};

const detectCategory = (name: string): GameEntry["category"] => {
  const lower = name.toLowerCase();
  if (lower.includes("rpg") || lower.includes("adventure") || lower.includes("isekai") || lower.includes("quest")) return "rpg";
  if (lower.includes("sim") || lower.includes("manager") || lower.includes("survival") || lower.includes("tycoon") || lower.includes("market") || lower.includes("stardew")) return "simulation";
  if (lower.includes("ai") || lower.includes("focus")) return "ai";
  if (lower.includes("puzzle") || lower.includes("match") || lower.includes("tarot") || lower.includes("card")) return "puzzle";
  if (lower.includes("race") || lower.includes("moto") || lower.includes("runner") || lower.includes("wave")) return "casual";
  return "action";
};


const detectTechStack = (name: string): string[] => {
  const lower = name.toLowerCase();
  const stack: string[] = [];
  if (lower.includes("3d") || lower.includes("voxel") || lower.includes("webgl")) stack.push("Three.js");
  if (lower.includes("2d") || lower.includes("canvas") || lower.includes("phaser")) stack.push("Canvas / 2D");
  if (lower.includes("ai")) stack.push("Gemini API");
  if (stack.length === 0) stack.push("TypeScript", "Vite");
  return stack;
};

export function ArcadeView({ lang }: ArcadeViewProps) {
  const [games, setGames] = useState<GameEntry[]>([]);
  const [activeCategory, setActiveCategory] = useState<GameCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGame, setActiveGame] = useState<GameEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const t = translations[lang];
  const tr = t as Record<string, string>;

  const folderInputRef = useRef<HTMLInputElement>(null);

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

  const handleUpdateStatus = async (gameId: string, status: GameEntry["status"]) => {
    const updated = await arcadeService.updateGameStatus(gameId, status);
    setGames(updated);
    if (activeGame && activeGame.id === gameId) {
      setActiveGame(updated.find((g) => g.id === gameId) || null);
    }
  };

  const handleUpdateIframeUrl = async (gameId: string, url: string) => {
    const updated = await arcadeService.updateIframeUrl(gameId, url);
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

  const handleDeleteGame = async (gameId: string) => {
    const updated = await arcadeService.deleteGame(gameId);
    setGames(updated);
    setActiveGame(null);
  };

  // Folder Scan Trigger
  const handleScanFolderTrigger = async () => {
    setScanning(true);
    try {
      if ("showDirectoryPicker" in window) {
        const dirHandle = await (window as any).showDirectoryPicker({ mode: "read" });
        const scannedGames: GameEntry[] = [];
        let port = 5173;

        for await (const entry of dirHandle.values()) {
          if (entry.kind === "directory") {
            const folderName = entry.name;
            const title = formatFolderName(folderName);
            const devPath = `C:\\Users\\emre_\\Desktop\\GitHub\\In Progress\\${folderName}`;
            const id = `scan_${folderName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}`;

            scannedGames.push({
              id,
              title,
              description: `${folderName} yerel oyun geliştirme projesi.`,
              category: detectCategory(folderName),
              status: "in_progress",
              embedType: "iframe",
              iframeUrl: `http://localhost:${port++}`,
              devPath,
              techStack: detectTechStack(folderName),
              highScore: 0,
              playCount: 0,
              totalPlayTimeSeconds: 0,
              devNotes: "Klasör taraması ile otomatik eklendi.",
              isFavorite: false,
              createdAt: new Date().toISOString(),
            });
          }
        }

        if (scannedGames.length > 0) {
          const updated = await arcadeService.importScannedGames(scannedGames);
          setGames(updated);
        }
      } else {
        folderInputRef.current?.click();
      }
    } catch (err: any) {
      // If user cancelled showDirectoryPicker or if it throws permission error, fallback to file input
      if (err.name !== "AbortError") {
        folderInputRef.current?.click();
      }
    } finally {
      setScanning(false);
    }
  };

  // Fallback webkitdirectory Input Handler
  const handleFolderInputChange = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    setScanning(true);
    const folderSet = new Set<string>();
    const files = Array.from(input.files);

    files.forEach((file) => {
      const relPath = file.webkitRelativePath;
      if (relPath) {
        const parts = relPath.split("/");
        // If user picked "In Progress" folder, top subfolder is parts[1]
        // If user picked a single game folder, parts[0] is the folder name
        if (parts.length > 1) {
          folderSet.add(parts[1]);
        } else if (parts.length === 1) {
          folderSet.add(parts[0]);
        }
      }
    });

    const folderNames = Array.from(folderSet);
    let port = 5173;
    const scannedGames: GameEntry[] = folderNames.map((folderName) => {
      const title = formatFolderName(folderName);
      const devPath = `C:\\Users\\emre_\\Desktop\\GitHub\\In Progress\\${folderName}`;
      const id = `scan_${folderName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}`;

      return {
        id,
        title,
        description: `${folderName} yerel oyun geliştirme projesi.`,
        category: detectCategory(folderName),
        status: "in_progress",
        embedType: "iframe",
        iframeUrl: `http://localhost:${port++}`,
        devPath,
        techStack: detectTechStack(folderName),
        highScore: 0,
        playCount: 0,
        totalPlayTimeSeconds: 0,
        devNotes: "Klasör taraması ile otomatik eklendi.",
        isFavorite: false,
        createdAt: new Date().toISOString(),
      };
    });

    if (scannedGames.length > 0) {
      const updated = await arcadeService.importScannedGames(scannedGames);
      setGames(updated);
    }

    setScanning(false);
    input.value = "";
  };

  // Filter games based on Category & Search Query
  const filteredGames = games.filter((game) => {
    if (activeCategory === "playable" && game.status !== "playable") return false;
    if (activeCategory === "in_progress" && game.status !== "in_progress") return false;
    if (activeCategory === "favorites" && !game.isFavorite) return false;

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
      {/* Invisible Folder Picker Fallback Input */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        style={{ display: "none" }}
        onChange={handleFolderInputChange}
      />

      {/* Header Controls & Filter */}
      <ArcadeHeader
        lang={lang}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onCategoryChange={setActiveCategory}
        onSearchChange={setSearchQuery}
        onScanFolder={handleScanFolderTrigger}
      />

      {/* Main Games Grid */}
      {loading || scanning ? (
        <div className="arcade-loading-state">
          <div className="arcade-spinner" />
          <p>{scanning ? tr.arcade_scanning : tr.arcade_loading}</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="arcade-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <h3>{tr.arcade_no_games}</h3>
          <p>{tr.arcade_no_games_hint}</p>
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

      {/* Active Game Modal Player & Steam Dev Panel */}
      {activeGame && (
        <ArcadeGameModal
          game={activeGame}
          lang={lang}
          onClose={() => setActiveGame(null)}
          onUpdateScore={handleUpdateScore}
          onUpdateStatus={handleUpdateStatus}
          onUpdateIframeUrl={handleUpdateIframeUrl}
          onUpdateDevNotes={handleUpdateDevNotes}
          onDeleteGame={handleDeleteGame}

        />
      )}
    </div>
  );
}

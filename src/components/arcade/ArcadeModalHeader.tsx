import type { GameEntry } from "@/types/game.js";

interface ArcadeModalHeaderProps {
  tr: Record<string, string>;
  game: GameEntry;
  tab: "play" | "dev";
  onTabChange: (tab: "play" | "dev") => void;
  onClose: () => void;
}

export function ArcadeModalHeader({
  tr,
  game,
  tab,
  onTabChange,
  onClose,
}: ArcadeModalHeaderProps) {
  return (
    <>
      <div className="arcade-modal-header">
        <div className="arcade-modal-title-section">
          <div className="arcade-modal-badge">
            {game.category.toUpperCase()}
          </div>
          <h2>{game.title}</h2>
          <span className={`arcade-mode-badge ${game.mode}`}>
            {game.mode === "dist" ? tr.arcade_mode_dist : tr.arcade_mode_dev}
          </span>
        </div>
        <button
          className="arcade-modal-close"
          onClick={onClose}
          title={tr.arcade_close}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="arcade-modal-tabs">
        <button
          className={`arcade-tab-btn ${tab === "play" ? "active" : ""}`}
          onClick={() => onTabChange("play")}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={tab === "play" ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span>{tr.arcade_tab_play}</span>
        </button>
        <button
          className={`arcade-tab-btn ${tab === "dev" ? "active" : ""}`}
          onClick={() => onTabChange("dev")}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span>{tr.arcade_tab_dev}</span>
        </button>
      </div>
    </>
  );
}

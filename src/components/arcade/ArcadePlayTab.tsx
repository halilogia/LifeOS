import type { Ref } from "preact";
import type { GameEntry } from "@/types/game.js";
import type { GamePackage } from "@/services/arcade/index.js";

interface ArcadePlayTabProps {
  tr: Record<string, string>;
  game: GameEntry;
  gamePkg: GamePackage | null;
  loading: boolean;
  error: string | null;
  permissionNeeded: boolean;
  devCmdDisplay: string;
  devCmdCopied: boolean;
  sandboxUrl: string;
  iframeRef: Ref<HTMLIFrameElement>;
  onRequestPermission: () => void;
  onCopyCmd: () => void;
  onSandboxLoad: () => void;
}

export function ArcadePlayTab({
  tr,
  game,
  gamePkg,
  loading,
  error,
  permissionNeeded,
  devCmdDisplay,
  devCmdCopied,
  sandboxUrl,
  iframeRef,
  onRequestPermission,
  onCopyCmd,
  onSandboxLoad,
}: ArcadePlayTabProps) {
  return (
    <div className="arcade-play-panel">
      {game.mode === "dist" ? (
        <>
          {loading && (
            <div className="arcade-loading-state">
              <div className="arcade-spinner" />
              <p>{tr.arcade_loading}</p>
            </div>
          )}
          {error && !loading && (
            <div className="arcade-error-panel">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <h3>{tr.arcade_iframe_error}</h3>
              <p>{error}</p>
              {permissionNeeded && (
                <button
                  className="arcade-btn-primary"
                  onClick={onRequestPermission}
                >
                  {tr.arcade_grant_permission}
                </button>
              )}
              <p className="arcade-error-hint">{tr.arcade_iframe_error_hint}</p>
            </div>
          )}
          {gamePkg && !loading && !error && (
            <iframe
              ref={iframeRef}
              src={sandboxUrl}
              className="arcade-game-iframe"
              title={game.title}
              onLoad={onSandboxLoad}
            />
          )}
        </>
      ) : (
        <div className="arcade-dev-mode-panel">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="1.5"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <h3>{tr.arcade_dev_mode_title}</h3>
          <p>{tr.arcade_dev_mode_hint}</p>
          <div className="arcade-cmd-box">
            <code>{devCmdDisplay}</code>
            <button
              className={`arcade-copy-btn ${devCmdCopied ? "copied" : ""}`}
              onClick={onCopyCmd}
            >
              {devCmdCopied ? tr.arcade_cmd_copied : tr.arcade_copy_cmd}
            </button>
          </div>
          <p className="arcade-dev-mode-note">{tr.arcade_dev_mode_note}</p>
        </div>
      )}
    </div>
  );
}

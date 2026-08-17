import { useEffect, useState, useRef } from "preact/hooks";
import { GameEntry, DevTodoItem } from "@/types/game.js";
import { Language } from "@/types/types.js";
import { arcadeService, GamePackage } from "@/services/arcade/index.js";
import { translations } from "@/utils/i18n.js";
import { logger } from "@/utils/logger.js";
import { ArcadeModalHeader } from "./ArcadeModalHeader.js";
import { ArcadePlayTab } from "./ArcadePlayTab.js";
import { ArcadeDevTab } from "./ArcadeDevTab.js";
import { ConfirmModal } from "@/components/ConfirmModal.js";

interface ArcadeGameModalProps {
  game: GameEntry;
  lang: Language;
  onClose: () => void;
  onUpdateStatus: (gameId: string, status: GameEntry["status"]) => void;
  onUpdateDevNotes: (
    gameId: string,
    notes: string,
    todoList: DevTodoItem[],
    title?: string,
  ) => void;
  onDeleteGame: (gameId: string) => void;
}

type Tab = "play" | "dev";
type Toast = { kind: "info" | "error"; text: string } | null;

const STARTER_TODO: DevTodoItem[] = [];

export function ArcadeGameModal({
  game,
  lang,
  onClose,
  onUpdateStatus,
  onUpdateDevNotes,
  onDeleteGame,
}: ArcadeGameModalProps) {
  const [tab, setTab] = useState<Tab>(game.mode === "dist" ? "play" : "dev");
  const [gamePkg, setGamePkg] = useState<GamePackage | null>(null);
  const [loading, setLoading] = useState(game.mode === "dist");
  const [error, setError] = useState<string | null>(null);
  const [permissionNeeded, setPermissionNeeded] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [devCmdCopied, setDevCmdCopied] = useState(false);
  const [notes, setNotes] = useState(game.devNotes ?? "");
  const [title, setTitle] = useState(game.title ?? "");
  const [todoList, setTodoList] = useState<DevTodoItem[]>(
    game.todoList ?? STARTER_TODO,
  );
  const toastTimerRef = useRef<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const t = translations[lang];
  const tr = t as Record<string, string>;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sandboxUrl =
    typeof chrome !== "undefined" && chrome.runtime?.getURL
      ? chrome.runtime.getURL("sandbox.html")
      : "sandbox.html";

  // SECURITY: escape folderPath before embedding in shell command. The path
  // comes from chrome.fileSystem's display name and is not user-editable, but
  // it could still contain characters (e.g. a folder literally named `evil"$x`)
  // that would break the quoting or inject extra commands.
  const safeFolderPath = game.folderPath
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
  const devCmd = `cd "${safeFolderPath}" && npm run dev`;
  // Display a sanitized version for the user; never inject raw.
  const devCmdDisplay = `cd "${game.folderPath}" && npm run dev`;

  // Send gamePkg to sandbox iframe once it has fully loaded (onLoad callback).
  // messageSentRef ensures we only send once — after document.write() the iframe
  // fires a second load event which would re-trigger sandbox.js if we sent again.
  const messageSentRef = useRef(false);
  const handleSandboxLoad = () => {
    if (messageSentRef.current) {
      return;
    } // already sent once
    if (gamePkg && iframeRef.current?.contentWindow) {
      messageSentRef.current = true;
      iframeRef.current.contentWindow.postMessage(
        { type: "LOAD_GAME_PACKAGE", pkg: gamePkg },
        "*",
      );
    }
  };

  useEffect(() => {
    if (game.mode !== "dist") {
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      setPermissionNeeded(false);
      try {
        const hasAccess = await arcadeService.ensurePermissionForGame(game.id);
        if (!hasAccess) {
          if (!cancelled) {
            setPermissionNeeded(true);
            setError(tr.arcade_permission_needed);
          }
          return;
        }
        const pkg = await arcadeService.loadGamePackage(game);
        if (cancelled) {
          return;
        }
        if (pkg) {
          setGamePkg(pkg);
        } else {
          setError(tr.arcade_iframe_error);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? (err?.message ?? tr.arcade_iframe_error)
              : tr.arcade_iframe_error,
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [game.id, game.mode, game.entryHTMLPath]);

  const handleRequestPermission = async () => {
    setLoading(true);
    setError(null);
    try {
      const ok = await arcadeService.ensurePermissionForGame(game.id);
      if (!ok) {
        setError(tr.arcade_permission_denied);
        return;
      }
      const pkg = await arcadeService.loadGamePackage(game);
      if (pkg) {
        setGamePkg(pkg);
        setPermissionNeeded(false);
      } else {
        setError(tr.arcade_iframe_error);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? (err?.message ?? tr.arcade_iframe_error)
          : tr.arcade_iframe_error,
      );
    } finally {
      setLoading(false);
    }
  };

  const showToast = (next: Toast) => {
    setToast(next);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    if (next) {
      toastTimerRef.current = window.setTimeout(() => setToast(null), 2500);
    }
  };

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const handleSaveDevNotes = () => {
    onUpdateDevNotes(game.id, notes, todoList, title);
    showToast({ kind: "info", text: tr.arcade_dev_notes_saved });
  };

  const handleAddTodo = () => {
    const text = window.prompt(tr.arcade_todo_prompt);
    if (text && text.trim()) {
      setTodoList((prev) => [
        ...prev,
        { id: `todo_${Date.now()}`, text: text.trim(), completed: false },
      ]);
    }
  };

  const handleToggleTodo = (id: string) => {
    setTodoList((prev) =>
      prev.map((t_) =>
        t_.id === id ? { ...t_, completed: !t_.completed } : t_,
      ),
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodoList((prev) => prev.filter((t_) => t_.id !== id));
  };

  const handleDelete = () => {
    onDeleteGame(game.id);
    setConfirmDelete(false);
  };

  const handleRequestDelete = () => {
    setConfirmDelete(true);
  };

  const handleCopyCmd = async () => {
    try {
      // Copy sanitized command; the displayed version is identical for valid
      // folder names but would be safe even for adversarial inputs.
      await navigator.clipboard.writeText(devCmd);
      setDevCmdCopied(true);
      window.setTimeout(() => setDevCmdCopied(false), 2000);
    } catch (e) {
      logger.warn("Clipboard write failed:", e);
    }
  };

  return (
    <div className="arcade-modal-overlay" onClick={onClose}>
      <div
        className="arcade-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <ArcadeModalHeader
          tr={tr}
          game={game}
          tab={tab}
          onTabChange={setTab}
          onClose={onClose}
        />

        <div className="arcade-modal-body">
          {tab === "play" && (
            <ArcadePlayTab
              tr={tr}
              game={game}
              gamePkg={gamePkg}
              loading={loading}
              error={error}
              permissionNeeded={permissionNeeded}
              devCmdDisplay={devCmdDisplay}
              devCmdCopied={devCmdCopied}
              sandboxUrl={sandboxUrl}
              iframeRef={iframeRef}
              onRequestPermission={handleRequestPermission}
              onCopyCmd={handleCopyCmd}
              onSandboxLoad={handleSandboxLoad}
            />
          )}

          {tab === "dev" && (
            <ArcadeDevTab
              tr={tr}
              game={game}
              title={title}
              notes={notes}
              todoList={todoList}
              onTitleChange={setTitle}
              onNotesChange={setNotes}
              onStatusChange={onUpdateStatus}
              onAddTodo={handleAddTodo}
              onToggleTodo={handleToggleTodo}
              onDeleteTodo={handleDeleteTodo}
              onSave={handleSaveDevNotes}
              onDeleteGame={handleRequestDelete}
            />
          )}
        </div>

        <ConfirmModal
          isOpen={confirmDelete}
          message={tr.arcade_delete_confirm}
          lang={lang}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />

        {toast && (
          <div className={`arcade-toast ${toast.kind}`}>{toast.text}</div>
        )}
      </div>
    </div>
  );
}

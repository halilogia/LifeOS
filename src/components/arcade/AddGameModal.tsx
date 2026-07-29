import { useState } from "preact/hooks";
import { GameEntry, GameStatus } from "@/types/game.js";
import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";

interface AddGameModalProps {
  lang: Language;
  onClose: () => void;
  onAddGame: (game: Omit<GameEntry, "id" | "createdAt" | "highScore" | "playCount" | "totalPlayTimeSeconds">) => void;
}

export function AddGameModal({ lang, onClose, onAddGame }: AddGameModalProps) {
  const t = translations[lang];
  const tr = t as Record<string, string>;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GameEntry["category"]>("action");
  const [status, setStatus] = useState<GameStatus>("in_progress");
  const [iframeUrl, setIframeUrl] = useState("http://localhost:5173");
  const [devPath, setDevPath] = useState("C:\\Users\\emre_\\Desktop\\GitHub\\In Progress\\");
  const [techStackInput, setTechStackInput] = useState("TypeScript, Vite");
  const [devNotes, setDevNotes] = useState("");

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!title.trim()) {return;}

    const techStack = techStackInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    onAddGame({
      title: title.trim(),
      description: description.trim(),
      category,
      status,
      embedType: "iframe",
      iframeUrl: iframeUrl.trim() || undefined,
      devPath: devPath.trim(),
      techStack,
      devNotes: devNotes.trim(),
      isFavorite: false,
    });

    onClose();
  };

  return (
    <div className="arcade-modal-backdrop" onClick={onClose}>
      <div className="arcade-modal-content add-modal" onClick={(e) => e.stopPropagation()}>
        <div className="arcade-modal-header">
          <h3>{tr.arcade_add_game}</h3>
          <button className="arcade-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-game-form">
          <div className="form-group">
            <label>{tr.arcade_game_name} *</label>
            <input
              type="text"
              required
              placeholder={tr.arcade_game_name}
              value={title}
              onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
            />
          </div>

          <div className="form-group">
            <label>{tr.arcade_game_description}</label>
            <input
              type="text"
              placeholder={tr.arcade_game_description}
              value={description}
              onInput={(e) => setDescription((e.target as HTMLInputElement).value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{tr.arcade_game_category}</label>
              <select
                value={category}
                onChange={(e) => setCategory((e.target as HTMLSelectElement).value as any)}
              >
                <option value="action">Aksiyon</option>
                <option value="rpg">RPG</option>
                <option value="simulation">Simülasyon</option>
                <option value="puzzle">Bulmaca</option>
                <option value="arcade">Arcade</option>
                <option value="casual">Casual</option>
                <option value="ai">Yapay Zeka (AI)</option>
              </select>
            </div>

            <div className="form-group">
              <label>{tr.arcade_dev_status}</label>
              <select
                value={status}
                onChange={(e) => setStatus((e.target as HTMLSelectElement).value as any)}
              >
                <option value="in_progress">{tr.arcade_status_in_progress_text}</option>
                <option value="playable">{tr.arcade_status_playable_text}</option>
                <option value="concept">{tr.arcade_status_concept_text}</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>{tr.arcade_game_url}</label>
            <input
              type="text"
              placeholder="http://localhost:5173"
              value={iframeUrl}
              onInput={(e) => setIframeUrl((e.target as HTMLInputElement).value)}
            />
          </div>

          <div className="form-group">
            <label>{tr.arcade_in_progress_folder}</label>
            <input
              type="text"
              placeholder="C:\\Users\\emre_\\Desktop\\GitHub\\In Progress\\proje-adi"
              value={devPath}
              onInput={(e) => setDevPath((e.target as HTMLInputElement).value)}
            />
          </div>

          <div className="form-group">
            <label>{tr.arcade_technologies}</label>
            <input
              type="text"
              placeholder="Canvas, Phaser 3, TypeScript"
              value={techStackInput}
              onInput={(e) => setTechStackInput((e.target as HTMLInputElement).value)}
            />
          </div>

          <div className="form-group">
            <label>{tr.arcade_dev_notes}</label>
            <textarea
              rows={3}
              placeholder={tr.arcade_dev_notes_placeholder}
              value={devNotes}
              onInput={(e) => setDevNotes((e.target as HTMLTextAreaElement).value)}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              {tr.arcade_cancel_btn}
            </button>
            <button type="submit" className="arcade-btn-primary">
              {tr.arcade_save_to_library_btn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

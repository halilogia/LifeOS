import type { Language } from "@/types/types.js";
import type { MediaItem } from "@/types/media.js";
import { getTranslation } from "@/utils/i18n.js";
import { MediaCard } from "./MediaCard.js";

interface MediaGridProps {
  items: MediaItem[];
  lang: Language;
  onEdit: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onIncrement: (id: string, delta?: number) => void;
  onOpenQuotes: (item: MediaItem) => void;
  onAddClick: () => void;
}

export function MediaGrid({
  items,
  lang,
  onEdit,
  onDelete,
  onToggleFavorite,
  onIncrement,
  onOpenQuotes,
  onAddClick,
}: MediaGridProps) {
  const t = getTranslation(lang);

  if (items.length === 0) {
    return (
      <div className="media-empty-state">
        <div className="media-empty-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="2" y1="7" x2="7" y2="7" />
            <line x1="2" y1="17" x2="7" y2="17" />
            <line x1="17" y1="17" x2="22" y2="17" />
            <line x1="17" y1="7" x2="22" y2="7" />
          </svg>
        </div>
        <h3 className="media-empty-title">
          {t.media_empty_title || "No media items logged yet"}
        </h3>
        <p className="media-empty-desc">
          {t.media_empty_desc ||
            "Click 'Add Media' above to log your movies, TV series, books, or games."}
        </p>
        <button
          type="button"
          className="media-btn-primary"
          onClick={onAddClick}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>{t.media_btn_add || "Add Media"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="media-grid">
      {items.map((item) => (
        <MediaCard
          key={item.id}
          item={item}
          lang={lang}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          onIncrement={onIncrement}
          onOpenQuotes={onOpenQuotes}
        />
      ))}
    </div>
  );
}

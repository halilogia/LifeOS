import { useState } from "preact/hooks";
import type { Language } from "@/types/types.js";
import type {
  MediaItem,
  MediaType,
  MediaStatus,
  GamePlaystyle,
  GamePlatform,
} from "@/types/media.js";
import { getTranslation } from "@/utils/i18n.js";

interface MediaDetailModalProps {
  isOpen: boolean;
  item: MediaItem | null;
  defaultType: MediaType;
  lang: Language;
  onSave: (
    data: Omit<MediaItem, "id" | "createdAt" | "updatedAt"> & { id?: string },
  ) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export function MediaDetailModal({
  isOpen,
  item,
  defaultType,
  lang,
  onSave,
  onDelete,
  onClose,
}: MediaDetailModalProps) {
  if (!isOpen) {
    return null;
  }

  const t = getTranslation(lang);

  const [type, setType] = useState<MediaType>(item?.type || defaultType);
  const [title, setTitle] = useState(item?.title || "");
  const [creator, setCreator] = useState(item?.creator || "");
  const [releaseYear, setReleaseYear] = useState<string>(
    item?.releaseYear ? String(item.releaseYear) : "",
  );
  const [genres, setGenres] = useState<string>(
    item?.genres ? item.genres.join(", ") : "",
  );
  const [coverUrl, setCoverUrl] = useState(item?.coverUrl || "");
  const [rating, setRating] = useState<number>(item?.rating || 0);
  const [status, setStatus] = useState<MediaStatus>(
    item?.status || "in_progress",
  );
  const [review, setReview] = useState(item?.review || "");

  // TV Progress State
  const [tvSeason, setTvSeason] = useState<string>(
    item?.tvProgress?.currentSeason
      ? String(item.tvProgress.currentSeason)
      : "1",
  );
  const [tvEpisode, setTvEpisode] = useState<string>(
    item?.tvProgress?.currentEpisode
      ? String(item.tvProgress.currentEpisode)
      : "0",
  );
  const [tvTotalSeasons, setTvTotalSeasons] = useState<string>(
    item?.tvProgress?.totalSeasons ? String(item.tvProgress.totalSeasons) : "",
  );
  const [tvTotalEpisodes, setTvTotalEpisodes] = useState<string>(
    item?.tvProgress?.totalEpisodes
      ? String(item.tvProgress.totalEpisodes)
      : "",
  );

  // Book Progress State
  const [bookCurrentPage, setBookCurrentPage] = useState<string>(
    item?.bookProgress?.currentPage
      ? String(item.bookProgress.currentPage)
      : "0",
  );
  const [bookTotalPages, setBookTotalPages] = useState<string>(
    item?.bookProgress?.totalPages
      ? String(item.bookProgress.totalPages)
      : "300",
  );

  // Game Progress State
  const [gamePlaytime, setGamePlaytime] = useState<string>(
    item?.gameProgress?.playtimeHours
      ? String(item.gameProgress.playtimeHours)
      : "0",
  );
  const [gameTarget, setGameTarget] = useState<string>(
    item?.gameProgress?.targetHours
      ? String(item.gameProgress.targetHours)
      : "",
  );
  const [gamePlaystyle, setGamePlaystyle] = useState<GamePlaystyle>(
    item?.gameProgress?.playstyle || "main_story",
  );
  const [gamePlatform, setGamePlatform] = useState<GamePlatform>(
    item?.gameProgress?.platform || "PC",
  );

  // Movie Progress State
  const [movieRuntime, setMovieRuntime] = useState<string>(
    item?.movieProgress?.runtimeMinutes
      ? String(item.movieProgress.runtimeMinutes)
      : "",
  );
  const [movieRewatches, setMovieRewatches] = useState<string>(
    item?.movieProgress?.rewatchCount
      ? String(item.movieProgress.rewatchCount)
      : "0",
  );

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!title.trim()) {
      return;
    }

    const parsedGenres = genres
      .split(",")
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    const payload: Omit<MediaItem, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    } = {
      ...(item ? { id: item.id } : {}),
      type,
      title: title.trim(),
      creator: creator.trim() || undefined,
      releaseYear: releaseYear ? parseInt(releaseYear, 10) : undefined,
      genres: parsedGenres.length > 0 ? parsedGenres : undefined,
      coverUrl: coverUrl.trim() || undefined,
      rating,
      status,
      review: review.trim() || undefined,
      favorite: item?.favorite ?? false,
    };

    if (type === "tv") {
      payload.tvProgress = {
        currentSeason: parseInt(tvSeason, 10) || 1,
        currentEpisode: parseInt(tvEpisode, 10) || 0,
        totalSeasons: tvTotalSeasons ? parseInt(tvTotalSeasons, 10) : undefined,
        totalEpisodes: tvTotalEpisodes
          ? parseInt(tvTotalEpisodes, 10)
          : undefined,
      };
    } else if (type === "book") {
      payload.bookProgress = {
        currentPage: parseInt(bookCurrentPage, 10) || 0,
        totalPages: parseInt(bookTotalPages, 10) || 1,
        quotes: item?.bookProgress?.quotes || [],
      };
    } else if (type === "game") {
      payload.gameProgress = {
        playtimeHours: parseFloat(gamePlaytime) || 0,
        targetHours: gameTarget ? parseFloat(gameTarget) : undefined,
        playstyle: gamePlaystyle,
        platform: gamePlatform,
      };
    } else if (type === "movie") {
      payload.movieProgress = {
        runtimeMinutes: movieRuntime ? parseInt(movieRuntime, 10) : undefined,
        rewatchCount: parseInt(movieRewatches, 10) || 0,
      };
    }

    onSave(payload);
  };

  return (
    <div className="media-modal-overlay" onClick={onClose}>
      <div
        className="media-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="media-modal-header">
          <h2 className="media-modal-title">
            {item
              ? t.media_modal_title_edit || "Edit Media Item"
              : t.media_modal_title_add || "Add New Media Item"}
          </h2>
          <button
            type="button"
            className="media-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="media-modal-form">
          {/* Category Selector */}
          <div className="media-form-group">
            <label className="media-form-label">
              {t.media_modal_type || "Category"}
            </label>
            <div className="media-type-selector">
              {(["movie", "tv", "book", "game"] as MediaType[]).map((mType) => (
                <button
                  key={mType}
                  type="button"
                  className={`media-type-btn ${type === mType ? "active" : ""}`}
                  onClick={() => setType(mType)}
                >
                  {mType === "movie" && (t.media_tab_movie || "Movie")}
                  {mType === "tv" && (t.media_tab_tv || "TV Series")}
                  {mType === "book" && (t.media_tab_book || "Book")}
                  {mType === "game" && (t.media_tab_game || "Game")}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Creator Row */}
          <div className="media-form-row">
            <div className="media-form-group flex-2">
              <label className="media-form-label">
                {t.media_modal_field_title || "Title"} *
              </label>
              <input
                type="text"
                required
                className="media-form-input"
                value={title}
                placeholder="e.g. Interstellar, Severance, Dune..."
                onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
              />
            </div>

            <div className="media-form-group flex-1">
              <label className="media-form-label">
                {t.media_modal_field_creator || "Creator / Author"}
              </label>
              <input
                type="text"
                className="media-form-input"
                value={creator}
                placeholder="e.g. Director, Author, Studio"
                onInput={(e) =>
                  setCreator((e.target as HTMLInputElement).value)
                }
              />
            </div>
          </div>

          {/* Year, Genres & Cover Row */}
          <div className="media-form-row">
            <div className="media-form-group flex-1">
              <label className="media-form-label">
                {t.media_modal_field_year || "Release Year"}
              </label>
              <input
                type="number"
                className="media-form-input"
                value={releaseYear}
                placeholder="2024"
                onInput={(e) =>
                  setReleaseYear((e.target as HTMLInputElement).value)
                }
              />
            </div>

            <div className="media-form-group flex-2">
              <label className="media-form-label">
                {t.media_modal_field_genres || "Genres"}
              </label>
              <input
                type="text"
                className="media-form-input"
                value={genres}
                placeholder="Sci-Fi, Drama, Mystery"
                onInput={(e) => setGenres((e.target as HTMLInputElement).value)}
              />
            </div>
          </div>

          {/* Cover URL */}
          <div className="media-form-group">
            <label className="media-form-label">
              {t.media_modal_field_cover || "Cover Image URL (Optional)"}
            </label>
            <input
              type="url"
              className="media-form-input"
              value={coverUrl}
              placeholder="https://..."
              onInput={(e) => setCoverUrl((e.target as HTMLInputElement).value)}
            />
          </div>

          {/* Rating (1 - 10) & Status */}
          <div className="media-form-row">
            <div className="media-form-group flex-2">
              <label className="media-form-label">
                {t.media_modal_field_rating || "Your Rating (1 - 10)"}
              </label>
              <div className="media-rating-selector">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`media-rating-score-btn ${rating === num ? "active" : ""}`}
                    onClick={() => setRating(rating === num ? 0 : num)}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="media-form-group flex-1">
              <label className="media-form-label">
                {t.media_modal_field_status || "Status"}
              </label>
              <select
                className="media-form-select"
                value={status}
                onChange={(e) =>
                  setStatus(
                    (e.target as HTMLSelectElement).value as MediaStatus,
                  )
                }
              >
                <option value="in_progress">
                  {t.media_status_in_progress || "In Progress"}
                </option>
                <option value="completed">
                  {t.media_status_completed || "Completed"}
                </option>
                <option value="backlog">
                  {t.media_status_backlog || "Backlog / Watchlist"}
                </option>
                <option value="dropped">
                  {t.media_status_dropped || "Dropped"}
                </option>
              </select>
            </div>
          </div>

          {/* Dynamic Progress Section */}
          <div className="media-form-progress-box">
            {/* TV Details */}
            {type === "tv" && (
              <div className="media-form-row">
                <div className="media-form-group flex-1">
                  <label className="media-form-label">
                    {t.media_modal_field_tv_season || "Current Season"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="media-form-input"
                    value={tvSeason}
                    onInput={(e) =>
                      setTvSeason((e.target as HTMLInputElement).value)
                    }
                  />
                </div>
                <div className="media-form-group flex-1">
                  <label className="media-form-label">
                    {t.media_modal_field_tv_total_seasons || "Total Seasons"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="media-form-input"
                    value={tvTotalSeasons}
                    placeholder="e.g. 5"
                    onInput={(e) =>
                      setTvTotalSeasons((e.target as HTMLInputElement).value)
                    }
                  />
                </div>
                <div className="media-form-group flex-1">
                  <label className="media-form-label">
                    {t.media_modal_field_tv_episode || "Current Episode"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="media-form-input"
                    value={tvEpisode}
                    onInput={(e) =>
                      setTvEpisode((e.target as HTMLInputElement).value)
                    }
                  />
                </div>
                <div className="media-form-group flex-1">
                  <label className="media-form-label">
                    {t.media_modal_field_tv_total_episodes || "Total Episodes"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="media-form-input"
                    value={tvTotalEpisodes}
                    placeholder="e.g. 62"
                    onInput={(e) =>
                      setTvTotalEpisodes((e.target as HTMLInputElement).value)
                    }
                  />
                </div>
              </div>
            )}

            {/* Book Details */}
            {type === "book" && (
              <div className="media-form-row">
                <div className="media-form-group flex-1">
                  <label className="media-form-label">
                    {t.media_modal_field_book_current_page || "Current Page"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="media-form-input"
                    value={bookCurrentPage}
                    onInput={(e) =>
                      setBookCurrentPage((e.target as HTMLInputElement).value)
                    }
                  />
                </div>
                <div className="media-form-group flex-1">
                  <label className="media-form-label">
                    {t.media_modal_field_book_total_pages || "Total Pages"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="media-form-input"
                    value={bookTotalPages}
                    placeholder="e.g. 450"
                    onInput={(e) =>
                      setBookTotalPages((e.target as HTMLInputElement).value)
                    }
                  />
                </div>
              </div>
            )}

            {/* Game Details */}
            {type === "game" && (
              <div className="media-form-row">
                <div className="media-form-group flex-1">
                  <label className="media-form-label">
                    {t.media_modal_field_game_playtime || "Playtime (Hours)"}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    className="media-form-input"
                    value={gamePlaytime}
                    onInput={(e) =>
                      setGamePlaytime((e.target as HTMLInputElement).value)
                    }
                  />
                </div>
                <div className="media-form-group flex-1">
                  <label className="media-form-label">
                    {t.media_modal_field_game_target || "Target (HLTB Hours)"}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    className="media-form-input"
                    value={gameTarget}
                    placeholder="e.g. 50"
                    onInput={(e) =>
                      setGameTarget((e.target as HTMLInputElement).value)
                    }
                  />
                </div>
                <div className="media-form-group flex-1">
                  <label className="media-form-label">
                    {t.media_modal_field_game_playstyle || "Play Style"}
                  </label>
                  <select
                    className="media-form-select"
                    value={gamePlaystyle}
                    onChange={(e) =>
                      setGamePlaystyle(
                        (e.target as HTMLSelectElement).value as GamePlaystyle,
                      )
                    }
                  >
                    <option value="main_story">
                      {t.media_playstyle_main || "Main Story"}
                    </option>
                    <option value="main_extra">
                      {t.media_playstyle_extra || "Main + Extras"}
                    </option>
                    <option value="completionist">
                      {t.media_playstyle_completionist || "Completionist"}
                    </option>
                  </select>
                </div>
                <div className="media-form-group flex-1">
                  <label className="media-form-label">
                    {t.media_modal_field_game_platform || "Platform"}
                  </label>
                  <select
                    className="media-form-select"
                    value={gamePlatform}
                    onChange={(e) =>
                      setGamePlatform(
                        (e.target as HTMLSelectElement).value as GamePlatform,
                      )
                    }
                  >
                    <option value="PC">PC</option>
                    <option value="Steam Deck">Steam Deck</option>
                    <option value="PlayStation">PlayStation</option>
                    <option value="Xbox">Xbox</option>
                    <option value="Nintendo">Nintendo</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Movie Details */}
            {type === "movie" && (
              <div className="media-form-row">
                <div className="media-form-group flex-1">
                  <label className="media-form-label">
                    Runtime (Minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="media-form-input"
                    value={movieRuntime}
                    placeholder="120"
                    onInput={(e) =>
                      setMovieRuntime((e.target as HTMLInputElement).value)
                    }
                  />
                </div>
                <div className="media-form-group flex-1">
                  <label className="media-form-label">Rewatch Count</label>
                  <input
                    type="number"
                    min="0"
                    className="media-form-input"
                    value={movieRewatches}
                    onInput={(e) =>
                      setMovieRewatches((e.target as HTMLInputElement).value)
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Personal Review & Notes */}
          <div className="media-form-group">
            <label className="media-form-label">
              {t.media_modal_field_review || "Personal Review & Notes"}
            </label>
            <textarea
              rows={3}
              className="media-form-textarea"
              value={review}
              placeholder="Your thoughts, memorable moments, or rating justification..."
              onInput={(e) => setReview((e.target as HTMLInputElement).value)}
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="media-modal-footer">
            {item && onDelete && (
              <button
                type="button"
                className="media-btn-danger"
                onClick={() => {
                  if (
                    window.confirm(
                      t.media_card_delete_confirm ||
                        "Are you sure you want to delete this item?",
                    )
                  ) {
                    onDelete(item.id);
                  }
                }}
              >
                {t.media_modal_btn_delete || "Delete Item"}
              </button>
            )}

            <div className="media-modal-footer-right">
              <button
                type="button"
                className="media-btn-secondary"
                onClick={onClose}
              >
                {t.media_modal_btn_cancel || "Cancel"}
              </button>
              <button type="submit" className="media-btn-primary">
                {t.media_modal_btn_save || "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

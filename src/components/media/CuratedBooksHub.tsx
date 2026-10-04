import { useState, useMemo } from "preact/hooks";
import type { Language } from "@/types/types.js";
import type { MediaItem } from "@/types/media.js";
import { getTranslation } from "@/utils/i18n.js";
import { CURATED_BOOKS, CuratedBookItem } from "@/services/curatedCatalogData.js";
import { normalizeTitle } from "@/services/movieSeriesData.js";

interface CuratedBooksHubProps {
  lang: Language;
  userItems: MediaItem[];
  books?: CuratedBookItem[];
  onToggleBook: (
    book: CuratedBookItem,
    targetStatus: "completed" | "in_progress" | "backlog",
    rating?: number,
  ) => void;
  statusFilter?: string;
  searchQuery?: string;
}

export function CuratedBooksHub({
  lang,
  userItems,
  books = CURATED_BOOKS,
  onToggleBook,
  statusFilter = "all",
  searchQuery = "",
}: CuratedBooksHubProps) {
  const t = getTranslation(lang);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set(books.map((b) => b.category));
    return Array.from(set);
  }, [books]);

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return books.filter((book) => {
      // Category filter
      if (selectedCategory !== "all" && book.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (q) {
        const matchTitle = book.title.toLowerCase().includes(q);
        const matchAuthor = book.author.toLowerCase().includes(q);
        const matchGenre = book.genres.some((g) => g.toLowerCase().includes(q));
        if (!matchTitle && !matchAuthor && !matchGenre) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const bookNorm = normalizeTitle(book.title);
        const userItem = userItems.find(
          (u) => u.type === "book" && normalizeTitle(u.title) === bookNorm,
        );
        if (statusFilter === "completed" && userItem?.status !== "completed") return false;
        if (statusFilter === "in_progress" && userItem?.status !== "in_progress") return false;
        if (statusFilter === "backlog" && userItem?.status !== "backlog") return false;
      }

      return true;
    });
  }, [selectedCategory, searchQuery, statusFilter, userItems]);

  return (
    <section className="curated-catalog-section">
      {/* Header */}
      <div className="curated-catalog-header">
        <div className="curated-catalog-header-left">
          <div className="curated-catalog-badge book-badge">
            <span>📚 Edebiyat, Felsefe & Düşünce</span>
          </div>
          <h2 className="curated-catalog-title">
            {t.media_books_catalog_title || "Başyapıt Kitaplar & Düşünce Kütüphanesi"}
          </h2>
          <p className="curated-catalog-subtitle">
            {t.media_books_catalog_subtitle ||
              "Distopyadan felsefeye, klasiklerden bilim kurguya dünya edebiyatı. Okuduklarını tek tıkla işaretle ve puanla."}
          </p>
        </div>

        {/* Category Filter Chips */}
        <div className="curated-genre-chips">
          <button
            type="button"
            className={`curated-chip ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            Tümü ({CURATED_BOOKS.length})
          </button>
          {categories.map((cat) => {
            const count = CURATED_BOOKS.filter((b) => b.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                className={`curated-chip ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Books */}
      <div className="curated-catalog-grid">
        {filteredBooks.map((book) => {
          const bookNorm = normalizeTitle(book.title);
          const userItem = userItems.find(
            (u) => u.type === "book" && normalizeTitle(u.title) === bookNorm,
          );
          const isRead = userItem?.status === "completed";
          const isReading = userItem?.status === "in_progress";
          const isWishlist = userItem?.status === "backlog";
          const userRating = userItem?.rating;

          return (
            <div
              key={book.id}
              className={`curated-card book-card ${isRead ? "status-completed" : isReading ? "status-in-progress" : isWishlist ? "status-backlog" : ""}`}
            >
              <div className="curated-card-media">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="curated-card-cover"
                  loading="lazy"
                />
                <div className="curated-card-pills">
                  <span className="curated-rating-pill">★ {book.rating.toFixed(1)}</span>
                  <span className="curated-pages-pill">{book.totalPages} sf</span>
                </div>
              </div>

              <div className="curated-card-content">
                <div className="curated-card-header">
                  <span className="curated-category-tag">{book.category}</span>
                  <h3 className="curated-card-title">{book.title}</h3>
                  <p className="curated-card-creator">{book.author}</p>
                </div>

                <p className="curated-card-synopsis">{book.synopsis}</p>

                {/* Actions Row */}
                <div className="curated-card-actions">
                  <button
                    type="button"
                    className={`curated-action-btn btn-complete ${isRead ? "active" : ""}`}
                    onClick={() => onToggleBook(book, "completed")}
                  >
                    <span>{isRead ? "✓ Okundu" : "Okundu"}</span>
                  </button>

                  <button
                    type="button"
                    className={`curated-action-btn btn-progress ${isReading ? "active" : ""}`}
                    onClick={() => onToggleBook(book, "in_progress")}
                  >
                    <span>{isReading ? "📖 Okunuyor" : "Okunuyor"}</span>
                  </button>

                  <button
                    type="button"
                    className={`curated-action-btn btn-backlog ${isWishlist ? "active" : ""}`}
                    onClick={() => onToggleBook(book, "backlog")}
                  >
                    <span>{isWishlist ? "★ Listemde" : "＋ Listeme Ekle"}</span>
                  </button>
                </div>

                {/* Rating Dropdown (if read or evaluated) */}
                {isRead && (
                  <div className="curated-rating-row">
                    <span className="rating-label">Puanınız:</span>
                    <select
                      className="curated-rating-select"
                      value={userRating || ""}
                      onChange={(e) => {
                        const val = Number((e.target as HTMLSelectElement).value);
                        onToggleBook(book, "completed", val);
                      }}
                    >
                      <option value="">Puan Seç</option>
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          ★ {r}/10
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

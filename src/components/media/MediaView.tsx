import { useEffect } from "preact/hooks";
import type { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { useMediaStore } from "@/presentation/store/mediaStore.js";
import { MediaStatsOverview } from "./MediaStatsOverview.js";
import { MediaToolbar } from "./MediaToolbar.js";
import { MediaGrid } from "./MediaGrid.js";
import { MediaDetailModal } from "./MediaDetailModal.js";
import { MediaQuotesModal } from "./MediaQuotesModal.js";
import { logger } from "@/utils/logger.js";

interface MediaViewProps {
  lang: Language;
}

export function MediaView({ lang }: MediaViewProps) {
  const t = getTranslation(lang);

  const items = useMediaStore((s) => s.items);
  const filteredItems = useMediaStore((s) => s.filteredItems);
  const stats = useMediaStore((s) => s.stats);
  const activeTypeFilter = useMediaStore((s) => s.activeTypeFilter);
  const activeStatusFilter = useMediaStore((s) => s.activeStatusFilter);
  const searchQuery = useMediaStore((s) => s.searchQuery);
  const sortBy = useMediaStore((s) => s.sortBy);

  const isDetailModalOpen = useMediaStore((s) => s.isDetailModalOpen);
  const selectedItemForEdit = useMediaStore((s) => s.selectedItemForEdit);
  const defaultModalType = useMediaStore((s) => s.defaultModalType);
  const isQuotesModalOpen = useMediaStore((s) => s.isQuotesModalOpen);
  const selectedBookForQuotes = useMediaStore((s) => s.selectedBookForQuotes);

  const loadItems = useMediaStore((s) => s.loadItems);
  const addItem = useMediaStore((s) => s.addItem);
  const updateItem = useMediaStore((s) => s.updateItem);
  const deleteItem = useMediaStore((s) => s.deleteItem);
  const toggleFavorite = useMediaStore((s) => s.toggleFavorite);
  const incrementProgress = useMediaStore((s) => s.incrementProgress);
  const addQuote = useMediaStore((s) => s.addQuote);
  const removeQuote = useMediaStore((s) => s.removeQuote);

  const setTypeFilter = useMediaStore((s) => s.setTypeFilter);
  const setStatusFilter = useMediaStore((s) => s.setStatusFilter);
  const setSearchQuery = useMediaStore((s) => s.setSearchQuery);
  const setSortBy = useMediaStore((s) => s.setSortBy);

  const openCreateModal = useMediaStore((s) => s.openCreateModal);
  const openEditModal = useMediaStore((s) => s.openEditModal);
  const closeDetailModal = useMediaStore((s) => s.closeDetailModal);
  const openQuotesModal = useMediaStore((s) => s.openQuotesModal);
  const closeQuotesModal = useMediaStore((s) => s.closeQuotesModal);
  const loadSampleData = useMediaStore((s) => s.loadSampleData);
  const exportBackup = useMediaStore((s) => s.exportBackup);
  const importBackup = useMediaStore((s) => s.importBackup);

  useEffect(() => {
    void loadItems();
  }, []);

  const handleExport = () => {
    try {
      const jsonStr = exportBackup();
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `lifeos_media_library_${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      logger.error("[MediaView] handleExport error:", err);
    }
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const res = await importBackup(text);
      if (res.success) {
        alert(
          `${t.media_import_success || "Media items imported successfully."} (${res.count || 0})`,
        );
      } else {
        alert(
          `${t.media_import_failed || "Failed to import JSON file."}: ${res.error || ""}`,
        );
      }
    } catch (err) {
      logger.error("[MediaView] handleImport error:", err);
      alert(t.media_import_failed || "Failed to import JSON file.");
    }
  };

  return (
    <div id="media-view" className="media-view-container">
      {/* Top Header */}
      <header className="media-header">
        <div className="media-header-title-row">
          <div className="media-header-left">
            <div className="media-header-icon-box">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
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
            <div>
              <h1 className="media-header-title">
                {t.media_title || "Media & Library Hub"}
              </h1>
              <p className="media-header-subtitle">
                {t.media_subtitle ||
                  "Rate and track movies, TV series, books, and games with rich progress metrics"}
              </p>
            </div>
          </div>
        </div>

        {/* Global Statistics Overview */}
        <MediaStatsOverview stats={stats} lang={lang} />
      </header>

      {/* Filter & Toolbar */}
      <MediaToolbar
        lang={lang}
        activeTypeFilter={activeTypeFilter}
        activeStatusFilter={activeStatusFilter}
        searchQuery={searchQuery}
        sortBy={sortBy}
        onTypeChange={setTypeFilter}
        onStatusChange={setStatusFilter}
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
        onAddClick={() =>
          openCreateModal(activeTypeFilter === "all" ? "movie" : activeTypeFilter)
        }
        onLoadSamples={loadSampleData}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Grid of Cards */}
      <main className="media-content-main">
        <MediaGrid
          items={filteredItems}
          lang={lang}
          onEdit={openEditModal}
          onDelete={deleteItem}
          onToggleFavorite={toggleFavorite}
          onIncrement={incrementProgress}
          onOpenQuotes={openQuotesModal}
          onAddClick={() =>
            openCreateModal(
              activeTypeFilter === "all" ? "movie" : activeTypeFilter,
            )
          }
        />
      </main>

      {/* Add / Edit Detail Modal */}
      <MediaDetailModal
        isOpen={isDetailModalOpen}
        item={selectedItemForEdit}
        defaultType={defaultModalType}
        lang={lang}
        onSave={(data) => {
          if (data.id) {
            const existing = items.find((i) => i.id === data.id);
            if (existing) {
              void updateItem({
                ...existing,
                ...data,
                id: data.id,
              });
            }
          } else {
            void addItem(data);
          }
        }}
        onDelete={deleteItem}
        onClose={closeDetailModal}
      />

      {/* Book Quotes Modal (1000Kitap style) */}
      <MediaQuotesModal
        isOpen={isQuotesModalOpen}
        book={selectedBookForQuotes}
        lang={lang}
        onAddQuote={addQuote}
        onRemoveQuote={removeQuote}
        onClose={closeQuotesModal}
      />
    </div>
  );
}

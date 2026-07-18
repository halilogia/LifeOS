import { HifizItem } from "@/types/types.js";

interface HifizMushafModalProps {
  activeMushafItem: HifizItem;
  currentPageIndex: number;
  onCloseMushaf: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function HifizMushafModal({
  activeMushafItem,
  currentPageIndex,
  onCloseMushaf,
  onPrevPage,
  onNextPage,
}: HifizMushafModalProps) {
  return (
    <div className="settings-panel active" onClick={onCloseMushaf}>
      <div
        className="hifiz-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="settings-header">
          <h3 id="hifiz-image-title">{activeMushafItem.title}</h3>
          <div
            style={{
              display: "flex",
              gap: "15px",
              alignItems: "center",
              marginRight: "10px",
            }}
          >
            <span
              id="hifiz-page-info"
              style={{
                fontSize: "0.95rem",
                color: "var(--text-secondary)",
                fontWeight: 600,
                background: "rgba(255,255,255,0.05)",
                padding: "4px 10px",
                borderRadius: "8px",
              }}
            >
              {currentPageIndex + 1} / {activeMushafItem.pages ? activeMushafItem.pages.length : 0}
            </span>
            <button
              className="close-btn"
              onClick={onCloseMushaf}
              style={{ margin: 0, fontSize: "1.8rem" }}
            >
              &times;
            </button>
          </div>
        </header>
        <div className="hifiz-image-body">
          <button
            id="hifiz-prev-page"
            className="hifiz-nav-btn"
            disabled={currentPageIndex === 0}
            onClick={onPrevPage}
          >
            &lt;
          </button>
          <div className="hifiz-image-container">
            {activeMushafItem.pages && (
              <img
                id="hifiz-mushaf-img"
                src={`data/quran_images/sayfa_${String(activeMushafItem.pages[currentPageIndex]).padStart(3, "0")}.png`}
                alt="Mushaf Sayfası"
              />
            )}
          </div>
          <button
            id="hifiz-next-page"
            className="hifiz-nav-btn"
            disabled={
              !activeMushafItem.pages || currentPageIndex === activeMushafItem.pages.length - 1
            }
            onClick={onNextPage}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

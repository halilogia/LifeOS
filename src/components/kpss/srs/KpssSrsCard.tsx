import { WordReviewData, ReviewQuality } from "@/types/word.js";
import { KpssFlashcard } from "@/services/kpss/kpssService.js";

interface KpssSrsCardProps {
  t: Record<string, string>;
  srsLoading: boolean;
  srsQueue: WordReviewData[];
  srsIndex: number;
  srsFlipped: boolean;
  srsFadeState: "normal" | "slide-out";
  onFlipChange: (flipped: boolean) => void;
  onReviewQuality: (quality: ReviewQuality) => void;
  flashcardsUniverse: KpssFlashcard[];
  onReloadQueue: () => void;
}

export function KpssSrsCard({
  t,
  srsLoading,
  srsQueue,
  srsIndex,
  srsFlipped,
  srsFadeState,
  onFlipChange,
  onReviewQuality,
  flashcardsUniverse,
  onReloadQueue,
}: KpssSrsCardProps) {
  if (srsLoading) {
    return (
      <div
        className="ha-loading"
        style={{
          minHeight: "260px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        <div className="ha-spinner" />
        <span style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>
          {t.kpss_srs_preparing}
        </span>
      </div>
    );
  }

  if (srsQueue.length === 0 || srsIndex >= srsQueue.length) {
    return (
      <div
        className="srs-finished"
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid var(--card-border)",
          borderRadius: "16px",
          padding: "40px",
          textAlign: "center",
          backdropFilter: "blur(12px)",
          width: "100%",
          maxWidth: "550px",
          margin: "0 auto",
        }}
      >
        <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🎉</div>
        <h3
          style={{
            fontSize: "1.6rem",
            color: "var(--accent-color)",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          {t.kpss_srs_great_job}
        </h3>
        <p
          style={{
            opacity: 0.8,
            fontSize: "0.95rem",
            marginBottom: "24px",
            color: "var(--text-secondary)",
          }}
        >
          {t.kpss_srs_all_done}
        </p>
        <button
          className="settings-add-btn"
          onClick={onReloadQueue}
          style={{ padding: "10px 24px" }}
        >
          {t.kpss_srs_reload}
        </button>
      </div>
    );
  }

  const currentReview = srsQueue[srsIndex];
  const card = flashcardsUniverse.find((c) => c.id === currentReview.wordId);
  if (!card) {
    return null;
  }

  return (
    <div
      className="kpss-srs-active-section"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "550px",
          fontSize: "0.85rem",
          opacity: 0.6,
        }}
      >
        <span>{card.category}</span>
        <span>
          {`${t.kpss_srs_card_label} ${srsIndex + 1} / ${srsQueue.length}`}
        </span>
      </div>

      <div
        className="flashcard-container"
        style={{ width: "100%", maxWidth: "550px", height: "260px" }}
      >
        <div
          className={`flashcard-inner ${srsFlipped ? "flipped" : ""} ${srsFadeState === "slide-out" ? "fade-out" : ""}`}
          onClick={() => onFlipChange(!srsFlipped)}
        >
          <div
            className="flashcard-side flashcard-front"
            style={{ boxSizing: "border-box", padding: "30px" }}
          >
            <p
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                lineHeight: 1.5,
                color: "var(--text-primary)",
              }}
            >
              {card.question}
            </p>
          </div>
          <div
            className="flashcard-side flashcard-back"
            style={{
              boxSizing: "border-box",
              padding: "24px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontSize: "1.15rem",
                fontWeight: "700",
                color: "var(--accent-color)",
                marginBottom: "10px",
                lineHeight: 1.4,
              }}
            >
              {card.answer}
            </p>
            {card.hint && (
              <p
                style={{
                  fontSize: "0.82rem",
                  opacity: 0.7,
                  fontStyle: "italic",
                  color: "var(--text-secondary)",
                  lineHeight: 1.3,
                  marginTop: "6px",
                }}
              >
                {card.hint}
              </p>
            )}
          </div>
        </div>
      </div>

      {srsFlipped && (
        <div
          className="srs-actions"
          style={{
            display: "flex",
            gap: "12px",
            width: "100%",
            maxWidth: "550px",
            marginTop: "10px",
          }}
        >
          <button
            className="srs-btn srs-btn-hard"
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              cursor: "pointer",
            }}
            onClick={() => onReviewQuality("hard")}
          >
            {t.kpss_srs_hard}
          </button>
          <button
            className="srs-btn srs-btn-medium"
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              cursor: "pointer",
            }}
            onClick={() => onReviewQuality("medium")}
          >
            {t.kpss_srs_medium}
          </button>
          <button
            className="srs-btn srs-btn-easy"
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              cursor: "pointer",
            }}
            onClick={() => onReviewQuality("easy")}
          >
            {t.kpss_srs_easy}
          </button>
        </div>
      )}
    </div>
  );
}

import { Language } from "@/types/types.js";
import { WordReviewData, ReviewQuality } from "@/types/word.js";
import { KpssFlashcard } from "@/services/kpssService.js";

interface KpssSrsCardProps {
  lang: Language;
  srsLoading: boolean;
  srsQueue: WordReviewData[];
  srsIndex: number;
  srsFlipped: boolean;
  srsFadeState: "normal" | "slide-out";
  onFlipChange: (flipped: boolean) => void;
  onReviewQuality: (quality: ReviewQuality) => void;
  kpssDummyFlashcards: KpssFlashcard[];
  onReloadQueue: () => void;
}

export function KpssSrsCard({
  lang,
  srsLoading,
  srsQueue,
  srsIndex,
  srsFlipped,
  srsFadeState,
  onFlipChange,
  onReviewQuality,
  kpssDummyFlashcards,
  onReloadQueue,
}: KpssSrsCardProps) {
  if (srsLoading) {
    return (
      <div className="ha-loading" style={{ minHeight: "260px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
        <div className="ha-spinner" />
        <span style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>
          {lang === "tr" ? "Tekrar kartları hazırlanıyor..." : "Preparing repetition cards..."}
        </span>
      </div>
    );
  }

  if (srsQueue.length === 0 || srsIndex >= srsQueue.length) {
    return (
      <div className="srs-finished" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--card-border)", borderRadius: "16px", padding: "40px", textAlign: "center", backdropFilter: "blur(12px)", width: "100%", maxWidth: "550px", margin: "0 auto" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🎉</div>
        <h3 style={{ fontSize: "1.6rem", color: "var(--accent-color)", fontWeight: 700, marginBottom: "8px" }}>
          {lang === "tr" ? "Harika İş!" : "Great Job!"}
        </h3>
        <p style={{ opacity: 0.8, fontSize: "0.95rem", marginBottom: "24px", color: "var(--text-secondary)" }}>
          {lang === "tr"
            ? "Bugünlük tüm KPSS tekrar kartlarını tamamladınız."
            : "You have reviewed all due KPSS repetition cards for today."}
        </p>
        <button
          className="settings-add-btn"
          onClick={onReloadQueue}
          style={{ padding: "10px 24px" }}
        >
          {lang === "tr" ? "Tekrar Yükle" : "Review Again"}
        </button>
      </div>
    );
  }

  const currentReview = srsQueue[srsIndex];
  const card = kpssDummyFlashcards.find((c) => c.id === currentReview.wordId);
  if (!card) {return null;}

  return (
    <div className="kpss-srs-active-section" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "550px", fontSize: "0.85rem", opacity: 0.6 }}>
        <span>{card.category}</span>
        <span>{lang === "tr" ? `Kart ${srsIndex + 1} / ${srsQueue.length}` : `Card ${srsIndex + 1} / ${srsQueue.length}`}</span>
      </div>

      <div className="flashcard-container" style={{ width: "100%", maxWidth: "550px", height: "260px" }}>
        <div
          className={`flashcard-inner ${srsFlipped ? "flipped" : ""} ${srsFadeState === "slide-out" ? "fade-out" : ""}`}
          onClick={() => onFlipChange(!srsFlipped)}
        >
          <div className="flashcard-side flashcard-front" style={{ boxSizing: "border-box", padding: "30px" }}>
            <p style={{ fontSize: "1.25rem", fontWeight: "600", lineHeight: 1.5, color: "var(--text-primary)" }}>
              {card.question}
            </p>
            <span style={{ fontSize: "0.8rem", opacity: 0.5, marginTop: "24px", display: "inline-block", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "20px" }}>
              💡 {lang === "tr" ? "Cevabı görmek için tıkla" : "Click to see answer"}
            </span>
          </div>
          <div className="flashcard-side flashcard-back" style={{ boxSizing: "border-box", padding: "30px" }}>
            <p style={{ fontSize: "1.45rem", fontWeight: "700", color: "var(--accent-color)", marginBottom: "12px" }}>
              {card.answer}
            </p>
            {card.hint && (
              <p style={{ fontSize: "0.9rem", opacity: 0.6, fontStyle: "italic", color: "var(--text-secondary)" }}>
                {lang === "tr" ? "İpucu: " : "Hint: "}{card.hint}
              </p>
            )}
          </div>
        </div>
      </div>

      {srsFlipped && (
        <div className="srs-actions" style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "550px", marginTop: "10px" }}>
          <button
            className="srs-btn srs-btn-hard"
            style={{ flex: 1, padding: "12px", borderRadius: "12px", cursor: "pointer" }}
            onClick={() => onReviewQuality("hard")}
          >
            {lang === "tr" ? "Zor" : "Hard"}
          </button>
          <button
            className="srs-btn srs-btn-medium"
            style={{ flex: 1, padding: "12px", borderRadius: "12px", cursor: "pointer" }}
            onClick={() => onReviewQuality("medium")}
          >
            {lang === "tr" ? "Orta" : "Medium"}
          </button>
          <button
            className="srs-btn srs-btn-easy"
            style={{ flex: 1, padding: "12px", borderRadius: "12px", cursor: "pointer" }}
            onClick={() => onReviewQuality("easy")}
          >
            {lang === "tr" ? "Kolay" : "Easy"}
          </button>
        </div>
      )}
    </div>
  );
}

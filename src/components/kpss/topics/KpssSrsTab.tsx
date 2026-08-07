import type {
  ReviewQuality,
  WordReviewData,
} from "@/domain/services/SrsService.js";
import type { KpssFlashcard } from "@/services/kpss/kpssService.js";
import { KpssSrsCard } from "@/components/kpss/srs/KpssSrsCard.js";

interface KpssSrsTabProps {
  t: Record<string, string>;
  srsLoading: boolean;
  srsGenerating: boolean;
  srsQueue: WordReviewData[];
  srsIndex: number;
  srsFlipped: boolean;
  srsFadeState: "normal" | "slide-out";
  flashcardsUniverse: KpssFlashcard[];
  onFlipChange: (flipped: boolean) => void;
  onReviewQuality: (quality: ReviewQuality) => void;
  onReloadQueue: () => void;
  onGenerateCards: () => void;
}

export function KpssSrsTab({
  t,
  srsLoading,
  srsGenerating,
  srsQueue,
  srsIndex,
  srsFlipped,
  srsFadeState,
  flashcardsUniverse,
  onFlipChange,
  onReviewQuality,
  onReloadQueue,
  onGenerateCards,
}: KpssSrsTabProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        width: "100%",
      }}
    >
      {srsGenerating && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
          }}
        >
          <div className="ha-spinner" style={{ width: 18, height: 18 }} />
          <span>{t.kpss_srs_generating || "AI is generating history cards..."}</span>
        </div>
      )}

      <KpssSrsCard
        t={t}
        srsLoading={srsLoading}
        srsQueue={srsQueue}
        srsIndex={srsIndex}
        srsFlipped={srsFlipped}
        srsFadeState={srsFadeState}
        onFlipChange={onFlipChange}
        onReviewQuality={onReviewQuality}
        flashcardsUniverse={flashcardsUniverse}
        onReloadQueue={onReloadQueue}
      />

      {/* Alt toolbar: AI kart üret + tekrar yükle */}
      <div className="srs-toolbar">
        <button
          className="srs-toolbar-btn srs-toolbar-btn-primary"
          onClick={onGenerateCards}
          disabled={srsGenerating}
        >
          {srsGenerating
            ? (t.kpss_srs_generating || "✨ Generating AI cards...")
            : (t.kpss_srs_generate || "✨ Generate AI Cards")}
        </button>

        <button
          className="srs-toolbar-btn srs-toolbar-btn-ghost"
          onClick={onReloadQueue}
        >
          {t.kpss_srs_reload || "🔄 Reload"}
        </button>
      </div>
    </div>
  );
}
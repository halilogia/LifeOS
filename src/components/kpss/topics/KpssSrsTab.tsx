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
  srsChapter: string;
  srsChapters: string[];
  onChapterChange: (chapter: string) => void;
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
  srsChapter,
  srsChapters,
  onChapterChange,
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
      {/* Ünite Seçici + AI Kart Üret Butonu */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {srsChapters.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              padding: "8px 12px",
            }}
          >
            <span
              style={{
                fontSize: "0.78rem",
                color: "#94a3b8",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {t.kpss_srs_source_all || "Chapter:"}
            </span>
            <select
              value={srsChapter}
              onChange={(e) =>
                onChapterChange((e.target as HTMLSelectElement).value)
              }
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "8px",
                padding: "6px 10px",
                color: "#e2e8f0",
                fontSize: "0.8rem",
                fontWeight: 600,
                outline: "none",
                cursor: "pointer",
                maxWidth: 260,
              }}
            >
              <option value="all">All Chapters</option>
              {srsChapters.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          className="settings-add-btn"
          onClick={onGenerateCards}
          disabled={srsGenerating}
          style={{ padding: "9px 18px", fontSize: "0.82rem" }}
        >
          {srsGenerating
            ? (t.kpss_srs_generating || "Generating AI cards...")
            : (t.kpss_srs_generate || "✨ Generate AI Cards (5)")}
        </button>
      </div>

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
    </div>
  );
}
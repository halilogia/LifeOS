import type {
  ReviewQuality,
  WordReviewData,
} from "@/domain/services/SrsService.js";
import type { KpssFlashcard } from "@/services/kpss/kpssService.js";
import { KpssSrsCard } from "@/components/kpss/srs/KpssSrsCard.js";

interface KpssSrsTabProps {
  t: Record<string, string>;
  srsSourceMode: "all" | "preset" | "notes";
  userNotesCount: number;
  srsLoading: boolean;
  srsQueue: WordReviewData[];
  srsIndex: number;
  srsFlipped: boolean;
  srsFadeState: "normal" | "slide-out";
  flashcardsUniverse: KpssFlashcard[];
  onSourceModeChange: (mode: "all" | "preset" | "notes") => void;
  onFlipChange: (flipped: boolean) => void;
  onReviewQuality: (quality: ReviewQuality) => void;
  onReloadQueue: () => void;
}

export function KpssSrsTab({
  t,
  srsSourceMode,
  userNotesCount,
  srsLoading,
  srsQueue,
  srsIndex,
  srsFlipped,
  srsFadeState,
  flashcardsUniverse,
  onSourceModeChange,
  onFlipChange,
  onReviewQuality,
  onReloadQueue,
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
      {/* SRS Source Selector Filter Bar */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          padding: "6px",
          backdropFilter: "blur(8px)",
        }}
      >
        <button
          type="button"
          onClick={() => onSourceModeChange("all")}
          style={{
            background: srsSourceMode === "all" ? "#2563eb" : "transparent",
            color: srsSourceMode === "all" ? "#ffffff" : "#94a3b8",
            border: "none",
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {t.kpss_srs_source_all || "Tüm Kartlar"}
        </button>

        <button
          type="button"
          onClick={() => onSourceModeChange("preset")}
          style={{
            background: srsSourceMode === "preset" ? "#2563eb" : "transparent",
            color: srsSourceMode === "preset" ? "#ffffff" : "#94a3b8",
            border: "none",
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {t.kpss_srs_source_preset || "Hazır Kartlar"}
        </button>

        <button
          type="button"
          onClick={() => onSourceModeChange("notes")}
          style={{
            background: srsSourceMode === "notes" ? "#7c3aed" : "transparent",
            color: srsSourceMode === "notes" ? "#ffffff" : "#94a3b8",
            border: "none",
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {t.kpss_srs_source_notes || "Sadece Benim Notlarım"} ({userNotesCount})
        </button>
      </div>

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

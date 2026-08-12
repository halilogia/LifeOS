/**
 * MapQuizTargetBar.tsx
 * Haritanın alt kısmında gösterilen interaktif konum hedef çubuğu.
 * Ekran görüntüsündeki gibi hedef ismi ("Ilgaz Dağı"), konu ikonu, PAS butonu ve istatistikleri içerir.
 */

import { GeoPin } from "@/domain/constants/TurkeyGeographyData.js";

interface MapQuizTargetBarProps {
  t: Record<string, string>;
  currentTarget: GeoPin | null;
  currentIndex: number;
  total: number;
  score: number;
  streak: number;
  onSkip: () => void;
  onHint: () => void;
  showHint: boolean;
  lastFeedback: { type: "correct" | "wrong"; text: string } | null;
}

export function MapQuizTargetBar({
  t,
  currentTarget,
  currentIndex,
  total,
  score,
  streak,
  onSkip,
  onHint,
  showHint,
  lastFeedback,
}: MapQuizTargetBarProps) {
  if (!currentTarget) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: "14px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 15,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        width: "calc(100% - 32px)",
        maxWidth: "520px",
        pointerEvents: "auto",
      }}
    >
      {/* Anlık Geri Bildirim Balonu */}
      {lastFeedback && (
        <div
          style={{
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "#ffffff",
            background:
              lastFeedback.type === "correct"
                ? "linear-gradient(135deg, #15803d 0%, #16a34a 100%)"
                : "linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
            animation: "mapFeedbackPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            backdropFilter: "blur(8px)",
          }}
        >
          {lastFeedback.type === "correct" ? "✓ " : "✕ "}
          {lastFeedback.text}
        </div>
      )}

      {/* Hedef Kartı & Butonlar */}
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          padding: "10px 16px",
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, rgba(28, 22, 16, 0.92) 0%, rgba(45, 36, 26, 0.94) 100%)",
          border: "1px solid rgba(244, 234, 215, 0.2)",
          boxShadow:
            "0 12px 32px rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Sol: İpucu Butonu */}
        <button
          type="button"
          onClick={onHint}
          disabled={showHint}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "8px 12px",
            borderRadius: "10px",
            border: "1px solid rgba(234, 179, 8, 0.4)",
            background: showHint
              ? "rgba(234, 179, 8, 0.25)"
              : "rgba(234, 179, 8, 0.1)",
            color: "#fef08a",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: showHint ? "default" : "pointer",
            transition: "all 0.15s ease",
          }}
          title={t.kpss_map_hint_tooltip || "Haritada konumu sarı renk ile parlat"}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
          </svg>
          {t.kpss_map_hint || "İpucu"}
        </button>

        {/* Orta: Hedef Lokasyon Adı */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: "0.68rem",
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: "#c99a3c",
              fontWeight: 800,
              marginBottom: "2px",
            }}
          >
            {t.kpss_map_find_target || "Haritada Konumunu Seçin"} ({currentIndex + 1} / {total})
          </div>
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.18rem",
              fontWeight: 800,
              color: "#ffffff",
              textShadow: "0 2px 8px rgba(0,0,0,0.6)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            {currentTarget.name}
          </div>
          {currentTarget.category && (
            <span
              style={{
                marginTop: "2px",
                fontSize: "0.6rem",
                padding: "1px 7px",
                borderRadius: "10px",
                background: "rgba(201, 154, 60, 0.15)",
                border: "1px solid rgba(201, 154, 60, 0.35)",
                color: "#c99a3c",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {currentTarget.category}
            </span>
          )}
        </div>

        {/* Sağ: PAS (Skip) Butonu */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Seri Göstergesi */}
          {streak > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                padding: "4px 8px",
                borderRadius: "8px",
                background: "rgba(249, 115, 22, 0.2)",
                border: "1px solid rgba(249, 115, 22, 0.4)",
                color: "#ffedd5",
                fontSize: "0.75rem",
                fontWeight: 800,
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
              {streak}
            </div>
          )}

          <button
            type="button"
            onClick={onSkip}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "8px 14px",
              borderRadius: "10px",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              background: "linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)",
              color: "#ffffff",
              fontSize: "0.82rem",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(185, 28, 28, 0.35)",
              transition: "transform 0.1s ease",
            }}
          >
            {t.kpss_map_pass || "PAS"}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="13 17 18 12 13 7" />
              <polyline points="6 17 11 12 6 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

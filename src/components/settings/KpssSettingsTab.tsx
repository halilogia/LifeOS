import { useState, useEffect } from "preact/hooks";
import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { getAutoTitleSetting, saveAutoTitleSetting } from "@/services/kpssWikiService.js";

interface KpssSettingsTabProps {
  lang: Language;
  kpssGoalType: "net" | "score";
  kpssTargetNet: number;
  kpssTargetScore: number;
  onKpssGoalTypeChange: (type: "net" | "score") => void;
  onKpssTargetNetChange: (val: number) => void;
  onKpssTargetScoreChange: (val: number) => void;
  onResetKpssData?: () => void;
}

export function KpssSettingsTab({
  lang,
  kpssGoalType,
  kpssTargetNet,
  kpssTargetScore,
  onKpssGoalTypeChange,
  onKpssTargetNetChange,
  onKpssTargetScoreChange,
  onResetKpssData,
}: KpssSettingsTabProps) {
  const t = getTranslation(lang);
  const [autoTitleEnabled, setAutoTitleEnabled] = useState(false);

  useEffect(() => {
    getAutoTitleSetting().then(setAutoTitleEnabled);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* KPSS Target Settings */}
      <div className="settings-group">
        <h3
          style={{
            margin: "0 0 12px 0",
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--text-secondary)",
            opacity: 0.8,
          }}
        >
          {t.settings_kpss_title}
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            background: "rgba(255,255,255,0.01)",
            border: "1px solid var(--card-border)",
            borderRadius: "10px",
            padding: "16px 14px",
          }}
        >
          {/* Goal Type Pill Selector */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{ fontSize: "0.85rem", color: "white", fontWeight: "600" }}
            >
              {t.settings_kpss_goal_type}
            </span>
            <div
              style={{
                display: "flex",
                gap: "2px",
                background: "rgba(255, 255, 255, 0.05)",
                padding: "2px",
                borderRadius: "6px",
                border: "1px solid var(--card-border)",
              }}
            >
              <button
                type="button"
                onClick={() => onKpssGoalTypeChange("net")}
                style={{
                  background:
                    kpssGoalType === "net"
                      ? "var(--accent-color)"
                      : "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "0.65rem",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "background 0.2s",
                }}
              >
                {t.settings_kpss_target_net_short}
              </button>
              <button
                type="button"
                onClick={() => onKpssGoalTypeChange("score")}
                style={{
                  background:
                    kpssGoalType === "score"
                      ? "var(--accent-color)"
                      : "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "0.65rem",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "background 0.2s",
                }}
              >
                {t.settings_kpss_target_score_short}
              </button>
            </div>
          </div>

          {/* Target Tuning Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{ fontSize: "0.85rem", color: "white", fontWeight: "600" }}
            >
              {kpssGoalType === "net"
                ? t.settings_kpss_target_net
                : t.settings_kpss_target_score}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid var(--card-border)",
                borderRadius: "8px",
                overflow: "hidden",
                height: "30px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (kpssGoalType === "net") {
                    onKpssTargetNetChange(Math.max(10, kpssTargetNet - 1));
                  } else {
                    onKpssTargetScoreChange(Math.max(40, kpssTargetScore - 1));
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.6)",
                  padding: "0 10px",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                  userSelect: "none",
                }}
              >
                -
              </button>
              <input
                type="number"
                value={kpssGoalType === "net" ? kpssTargetNet : kpssTargetScore}
                readOnly
                style={{
                  width: "30px",
                  background: "none",
                  border: "none",
                  color: "white",
                  fontSize: "0.95rem",
                  padding: 0,
                  fontWeight: "700",
                  textAlign: "center",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (kpssGoalType === "net") {
                    onKpssTargetNetChange(Math.min(120, kpssTargetNet + 1));
                  } else {
                    onKpssTargetScoreChange(Math.min(100, kpssTargetScore + 1));
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.6)",
                  padding: "0 10px",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                  userSelect: "none",
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Premium Info Explanation Note */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              padding: "10px 12px",
              background: "rgba(139, 92, 246, 0.05)",
              border: "1px solid rgba(139, 92, 246, 0.15)",
              borderRadius: "8px",
              fontSize: "0.78rem",
              lineHeight: 1.4,
              color: "var(--text-secondary)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-color)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: "1px" }}
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>
              {lang === "tr"
                ? "KPSS GK-GY puan türlerinde 80 Puan alabilmek için ortalama sınav zorluğuna göre 70-75 Net yapılması yeterli olabilmektedir. Net ve Puan birebir eşit değildir, standart sapma formüllere dahildir."
                : "To score 80 Points in KPSS GK-GY, achieving around 70-75 Nets can be sufficient depending on average difficulty. Score and Net are not 1-to-1 equal due to standard deviation."}
            </span>
          </div>
        </div>
      </div>

      {/* Wiki Notları Ayarları */}
      <div className="settings-group">
        <h3
          style={{
            margin: "0 0 12px 0",
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--text-secondary)",
            opacity: 0.8,
          }}
        >
          {lang === "tr" ? "KPSS Ders Notları & Wiki" : "KPSS Study Notes & Wiki"}
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            background: "rgba(255,255,255,0.01)",
            border: "1px solid var(--card-border)",
            borderRadius: "10px",
            padding: "16px 14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "0.85rem", color: "white", fontWeight: "600" }}>
                {lang === "tr" ? "Otomatik İlk Kelime Başlığı" : "Auto First-Word Title"}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                {lang === "tr"
                  ? "Ders notu yazarken başlık alanı boş bırakılırsa sadece ilk kelimeyi otomatik başlık yapar."
                  : "If title field is left blank when creating a note, automatically uses the first word as the title."}
              </div>
            </div>

            <label
              style={{
                position: "relative",
                display: "inline-block",
                width: "44px",
                height: "22px",
                flexShrink: 0,
              }}
            >
              <input
                type="checkbox"
                checked={autoTitleEnabled}
                onChange={(e) => {
                  const checked = (e.target as HTMLInputElement).checked;
                  setAutoTitleEnabled(checked);
                  saveAutoTitleSetting(checked);
                }}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: autoTitleEnabled ? "var(--accent-color, #3b82f6)" : "rgba(255,255,255,0.15)",
                  transition: "0.3s",
                  borderRadius: "22px",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    content: '""',
                    height: "16px",
                    width: "16px",
                    left: autoTitleEnabled ? "24px" : "3px",
                    bottom: "3px",
                    backgroundColor: "white",
                    transition: "0.3s",
                    borderRadius: "50%",
                  }}
                />
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Reset KPSS Data Section */}
      <div className="settings-group">
        <h3
          style={{
            margin: "0 0 12px 0",
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--text-secondary)",
            opacity: 0.8,
          }}
        >
          {lang === "tr" ? "Veri Sıfırlama" : "Data Reset"}
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            background: "rgba(255,255,255,0.01)",
            border: "1px solid var(--card-border)",
            borderRadius: "10px",
            padding: "16px 14px",
          }}
        >
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {lang === "tr"
              ? "Tüm KPSS konu tamamlama verilerinizi, günlük soru/video istatistiklerinizi, SRS tekrar kartlarınızı ve çıkmış sınav test geçmişinizi sıfırlar."
              : "Resets all your KPSS topic progress, daily question/video stats, SRS flashcards, and past test quiz records."}
          </p>
          <button
            type="button"
            onClick={onResetKpssData}
            style={{
              alignSelf: "flex-start",
              padding: "10px 16px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              color: "#ef4444",
              fontWeight: "600",
              fontSize: "0.82rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(239, 68, 68, 0.25)";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(239, 68, 68, 0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(239, 68, 68, 0.12)";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(239, 68, 68, 0.3)";
            }}
          >
            {lang === "tr"
              ? "Tüm KPSS Verilerini Sıfırla"
              : "Reset All KPSS Data"}
          </button>
        </div>
      </div>
    </div>
  );
}

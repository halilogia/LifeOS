/**
 * KpssHeaderBar.tsx
 * KPSS Hazırlık başlığı ve alt sekme navigasyon barı.
 */

export type KpssTabId =
  | "progress"
  | "notes"
  | "srs"
  | "past-exams"
  | "map";

interface KpssHeaderBarProps {
  title: string;
  activeTab: KpssTabId;
  lang: string;
  t: Record<string, string>;
  onTabChange: (tab: KpssTabId) => void;
}

export function KpssHeaderBar({
  title,
  activeTab,
  lang,
  t,
  onTabChange,
}: KpssHeaderBarProps) {
  return (
    <>
      <header className="kpss-header">
        <h2>{title}</h2>
      </header>

      {/* Sub-Tab Navigation Header */}
      <div
        className="pomodoro-tab-header"
        style={{
          marginBottom: "0",
          display: "flex",
          justifyContent: "flex-start",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          className={`pomo-tab-link ${activeTab === "progress" ? "active" : ""}`}
          onClick={() => onTabChange("progress")}
        >
          {t.kpss_tab_progress}
        </button>
        <button
          className={`pomo-tab-link ${activeTab === "notes" ? "active" : ""}`}
          onClick={() => onTabChange("notes")}
        >
          {t.kpss_tab_notes}
        </button>
        <button
          className={`pomo-tab-link ${activeTab === "srs" ? "active" : ""}`}
          onClick={() => onTabChange("srs")}
        >
          {t.kpss_tab_srs}
        </button>
        <button
          className={`pomo-tab-link ${activeTab === "past-exams" ? "active" : ""}`}
          onClick={() => onTabChange("past-exams")}
        >
          {t.kpss_tab_past_exams}
        </button>
        <button
          className={`pomo-tab-link ${activeTab === "map" ? "active" : ""}`}
          onClick={() => onTabChange("map")}
        >
          {t.kpss_tab_map}
        </button>
      </div>
    </>
  );
}

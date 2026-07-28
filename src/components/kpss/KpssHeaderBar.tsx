/**
 * KpssHeaderBar.tsx
 * KPSS Hazırlık başlığı ve alt sekme navigasyon barı.
 */

interface KpssHeaderBarProps {
  title: string;
  activeTab: "progress" | "srs" | "past-exams" | "notes";
  lang: string;
  onTabChange: (tab: "progress" | "srs" | "past-exams" | "notes") => void;
}

export function KpssHeaderBar({
  title,
  activeTab,
  lang,
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
          {lang === "tr" ? "Konular & İlerleme" : "Topics & Progress"}
        </button>
        <button
          className={`pomo-tab-link ${activeTab === "notes" ? "active" : ""}`}
          onClick={() => onTabChange("notes")}
        >
          {lang === "tr"
            ? "KPSS Ders Notları"
            : "KPSS Notes"}
        </button>
        <button
          className={`pomo-tab-link ${activeTab === "srs" ? "active" : ""}`}
          onClick={() => onTabChange("srs")}
        >
          {lang === "tr"
            ? "KPSS Bilgi Kartları (SRS)"
            : "KPSS Flashcards (SRS)"}
        </button>
        <button
          className={`pomo-tab-link ${activeTab === "past-exams" ? "active" : ""}`}
          onClick={() => onTabChange("past-exams")}
        >
          {lang === "tr"
            ? "Çıkmış Sorular (2006-2021)"
            : "Past Questions (2006-2021)"}
        </button>
      </div>
    </>
  );
}

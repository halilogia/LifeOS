import { Language, KpssProgress } from "@/types/types.js";
import { KpssTopic } from "@/services/kpssService.js";

interface KpssTopicListProps {
  lang: Language;
  topics: KpssTopic[];
  kpssProgress: KpssProgress[];
  currentSubject: string;
  sortBy: "default" | "questions" | "status";
  onSortByChange: (val: "default" | "questions" | "status") => void;
  onToggleTopic: (topic: string) => void;
  onStartQuiz: (topic: string) => void;
  labels: Record<string, string>;
}

export function KpssTopicList({
  lang,
  topics,
  kpssProgress,
  currentSubject,
  sortBy,
  onSortByChange,
  onToggleTopic,
  onStartQuiz,
  labels,
}: KpssTopicListProps) {
  return (
    <div className="kpss-content">
      {/* Sort Options Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--card-border)", borderRadius: "10px", padding: "8px 12px", width: "100%" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>
          {lang === "tr" ? "Konu Dağılımı ve Çalışma Takibi" : "Topic Syllabus & Progress"}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="10" y1="6" x2="21" y2="6"></line>
              <line x1="10" y1="12" x2="21" y2="12"></line>
              <line x1="10" y1="18" x2="21" y2="18"></line>
              <path d="M4 6h1v4"></path>
              <path d="M4 10h2"></path>
              <path d="M6 6H4"></path>
            </svg>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "600" }}>
              {lang === "tr" ? "Sıralama:" : "Sort By:"}
            </span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange((e.target as HTMLSelectElement).value as any)}
            style={{
              background: "#161622",
              border: "1px solid var(--card-border)",
              borderRadius: "6px",
              color: "white",
              fontSize: "0.75rem",
              padding: "2px 8px",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="default">{lang === "tr" ? "Müfredat Sırası" : "Syllabus Order"}</option>
            <option value="questions">{lang === "tr" ? "Soru Sıklığı (Çoktan Aza)" : "Question Frequency"}</option>
            <option value="status">{lang === "tr" ? "Tamamlanma Durumu" : "Completion Status"}</option>
          </select>
        </div>
      </div>

      <div id="kpss-topic-list" className="kpss-topic-list">
        {topics.map((t) => {
          const progress = kpssProgress.find(
            (p) => p.subject === currentSubject && p.topic === t.title,
          );
          const status = progress ? progress.status : 0;
          return (
            <div
              key={t.title}
              className={`kpss-topic-card status-${status}`}
            >
              <div className="kpss-topic-main">
                <div
                  className={`kpss-checkbox ${status === 2 ? "checked" : status === 1 ? "working" : ""}`}
                  onClick={() => onToggleTopic(t.title)}
                  title={
                    status === 2
                      ? lang === "tr"
                        ? "Tamamlandı"
                        : "Completed"
                      : status === 1
                      ? lang === "tr"
                        ? "Çalışılıyor"
                        : "Working"
                      : lang === "tr"
                      ? "Başlanmadı"
                      : "Not Started"
                  }
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="kpss-topic-name" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{t.title}</span>
                  <span className="kpss-topic-q-badge" style={{ fontSize: "0.65rem", background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--card-border)", padding: "2px 6px", borderRadius: "4px", color: "var(--text-secondary)", fontWeight: "600" }}>
                    {t.questionsCount} {lang === "tr" ? "Soru" : "Q"}
                  </span>
                  {progress && progress.score !== undefined && (
                    <span className="kpss-topic-score-badge">%{progress.score}</span>
                  )}
                </span>

                {/* Seviye Tespit Sınavı button */}
                <button
                  className="kpss-quiz-trigger-btn"
                  onClick={() => onStartQuiz(t.title)}
                  title={lang === "tr" ? "Yapay Zekâ ile Test Çöz" : "Take AI Quiz"}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  <span>{lang === "tr" ? "Test Çöz" : "Quiz"}</span>
                </button>
              </div>
              <p className="kpss-topic-desc">{t.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

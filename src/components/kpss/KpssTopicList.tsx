import { Language, KpssProgress } from "@/types/types.js";
import { KpssTopic } from "@/services/kpssService.js";

interface KpssTopicListProps {
  lang: Language;
  topics: KpssTopic[];
  kpssProgress: KpssProgress[];
  currentSubject: string;
  sortBy: "default" | "questions" | "status";
  onSortByChange: (val: "default" | "questions" | "status") => void;
  onStartQuiz: (topic: string) => void;
  onShowDetail: (topic: { title: string; description: string }) => void;
  labels: Record<string, string>;
}

export function KpssTopicList({
  lang,
  topics,
  kpssProgress,
  currentSubject,
  sortBy,
  onSortByChange,
  onStartQuiz,
  onShowDetail,
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
              className="kpss-topic-item"
              data-status={status.toString()}
              onClick={() => onStartQuiz(t.title)}
              style={{ cursor: "pointer" }}
            >
              <div className="kpss-status-indicator">
                {status === 1 && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="white" style={{ opacity: 1, transform: "scale(1)" }}>
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                )}
                {status === 2 && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    style={{ opacity: 1, transform: "scale(1)" }}
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
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
                className="kpss-exam-btn"
                title={lang === "tr" ? "Seviye Tespit Sınavı Çöz" : "Solve Proficiency Test"}
                onClick={(e) => {
                  e.stopPropagation();
                  onStartQuiz(t.title);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </button>

              {/* Detail Info button */}
              <button
                className="kpss-info-btn"
                title="Detay"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowDetail({
                    title: t.title,
                    description: t.description,
                  });
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

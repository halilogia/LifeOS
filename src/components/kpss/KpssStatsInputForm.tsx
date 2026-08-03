interface KpssStatsInputFormProps {
  t: Record<string, string>;
  labels: Record<string, string>;
  questionsInput: string;
  videosInput: string;
  subjectInput: string;
  subjectsList: string[];
  onQuestionsInputChange: (val: string) => void;
  onVideosInputChange: (val: string) => void;
  onSubjectInputChange: (val: string) => void;
  onSaveStats: () => void;
  onResetStats: () => void;
}

export function KpssStatsInputForm({
  t,
  labels,
  questionsInput,
  videosInput,
  subjectInput,
  subjectsList,
  onQuestionsInputChange,
  onVideosInputChange,
  onSubjectInputChange,
  onSaveStats,
  onResetStats,
}: KpssStatsInputFormProps) {
  return (
    <div className="kpss-daily-input">
      <h3>{labels.stats_title}</h3>
      <div className="kpss-stats-inputs">
        <div className="kpss-input-group">
          <label htmlFor="kpss-questions-input">{labels.stat_questions}</label>
          <input
            type="number"
            id="kpss-questions-input"
            value={questionsInput}
            onInput={(e) =>
              onQuestionsInputChange((e.target as HTMLInputElement).value)
            }
            placeholder="0"
            min="0"
          />
        </div>
        <div className="kpss-input-group">
          <label htmlFor="kpss-videos-input">{t.kpss_videos_watched}</label>
          <input
            type="number"
            id="kpss-videos-input"
            value={videosInput}
            onInput={(e) =>
              onVideosInputChange((e.target as HTMLInputElement).value)
            }
            placeholder="0"
            min="0"
          />
        </div>
        <div className="kpss-input-group">
          <label htmlFor="kpss-subject-select">{labels.stat_subject}</label>
          <select
            id="kpss-subject-select"
            value={subjectInput}
            onChange={(e) =>
              onSubjectInputChange((e.target as HTMLSelectElement).value)
            }
          >
            {subjectsList.map((subKey) => (
              <option key={subKey} value={subKey}>
                {labels[subKey] || subKey}
              </option>
            ))}
          </select>
        </div>
        <div className="kpss-action-btns">
          <button id="kpss-save-stats-btn" onClick={onSaveStats}>
            {labels.save}
          </button>
          <button
            id="kpss-reset-stats-btn"
            className="secondary"
            onClick={onResetStats}
          >
            {labels.reset}
          </button>
        </div>
      </div>
    </div>
  );
}

import { Language, PomodoroLog } from "@/types/types.js";

interface PomoZenHistoryCardProps {
  lang: Language;
  searchQuery: string;
  onSearchQueryInput: (val: string) => void;
  filteredHistory: PomodoroLog[];
  t: any;
  renderZenElementSvg: (element: PomodoroLog["element"]) => any;
}

export function PomoZenHistoryCard({
  lang,
  searchQuery,
  onSearchQueryInput,
  filteredHistory,
  t,
  renderZenElementSvg,
}: PomoZenHistoryCardProps) {
  return (
    <div className="zen-history-card">
      <header className="zen-history-header">
        <h3>{t.zen_history_title}</h3>
        <input
          type="text"
          className="zen-search-input"
          placeholder={t.zen_history_search}
          value={searchQuery}
          onInput={(e) => onSearchQueryInput((e.target as HTMLInputElement).value)}
        />
      </header>
      <div className="zen-history-table-wrapper">
        <table className="zen-history-table">
          <thead>
            <tr>
              <th>{t.zen_history_col_date}</th>
              <th>{t.zen_history_col_duration}</th>
              <th>{t.zen_history_col_note}</th>
              <th>{t.zen_history_col_elem}</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colspan={4} className="empty-state">
                  {t.zen_history_empty}
                </td>
              </tr>
            ) : (
              filteredHistory.map((log) => (
                <tr key={log.id}>
                  <td>
                    {new Date(log.endTime).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    {Math.round(log.duration / 60)} {t.minutes_abbr}
                  </td>
                  <td>{log.note}</td>
                  <td style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "24px", height: "24px", display: "inline-block" }}>
                      {renderZenElementSvg(log.element)}
                    </span>
                    <span>{t[`zen_elem_${log.element}` as keyof typeof t] || log.element}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

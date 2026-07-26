import { Language } from "@/types/types.js";

interface HifizYeterliklerCardProps {
  lang: Language;
  yeterliklerPercent: number;
  yeterlikler: number[];
  YETERLIKLER_DATA: any[];
  onToggleYeterlik: (index: number) => void;
  onOpenYeterlikDetail: (item: any) => void;
}

export function HifizYeterliklerCard({
  lang,
  yeterliklerPercent,
  yeterlikler,
  YETERLIKLER_DATA,
  onToggleYeterlik,
  onOpenYeterlikDetail,
}: HifizYeterliklerCardProps) {
  return (
    <div id="yeterlikler-content" className="hifiz-sub-view active">
      <div className="hifiz-header">
        <h2>A. Aday Din Görevlisi (İmam-Hatip) Yeterlikleri</h2>
      </div>

      <div className="hifiz-overall-progress-container">
        <div className="hifiz-overall-info">
          <span>
            {lang === "tr" ? "Müfredat İlerlemesi" : "Checklist Progress"}
          </span>
          <span id="yeterlikler-overall-percent">{yeterliklerPercent}%</span>
        </div>
        <div className="hifiz-overall-bar">
          <div
            id="yeterlikler-overall-fill"
            className="hifiz-overall-fill"
            style={{ width: `${yeterliklerPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="yeterlikler-list">
        {YETERLIKLER_DATA.map((item, index) => {
          const isCompleted = yeterlikler.includes(index);
          return (
            <div
              key={index}
              className={`yeterlik-item ${isCompleted ? "completed" : ""}`}
              onClick={() => onToggleYeterlik(index)}
            >
              <div className="yeterlik-checkbox">
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
              <div className="yeterlik-text">{item.title}</div>
              <button
                className="yeterlik-info-btn"
                title="Detay"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenYeterlikDetail(item);
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

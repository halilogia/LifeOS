import { PageContext } from "@/content/agent/domAgentEngine.js";

type ChipType =
  | "summarize"
  | "key_takeaways"
  | "ask"
  | "extract"
  | "yt_summarize"
  | "yt_quiz";

interface SidePanelChipsProps {
  t: Record<string, string>;
  pageContext: PageContext | null;
  isYoutube: boolean;
  onChipClick: (type: ChipType) => void;
  onAutofill?: () => void;
  onCustomPrompt?: (prompt: string) => void;
}

export function SidePanelChips({
  t,
  pageContext: _pageContext,
  isYoutube,
  onChipClick,
}: SidePanelChipsProps) {
  return (
    <div className="sidepanel-chips">
      {isYoutube && (
        <>
          <button
            className="sidepanel-chip"
            onClick={() => onChipClick("yt_summarize")}
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "#ffffff",
              borderColor: "#8b5cf6",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
            <span>{t.summarize_video}</span>
          </button>
          <button
            className="sidepanel-chip"
            onClick={() => onChipClick("yt_quiz")}
            style={{
              background: "rgba(139, 92, 246, 0.15)",
              color: "#c084fc",
              borderColor: "rgba(139, 92, 246, 0.4)",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <span>{t.video_quiz}</span>
          </button>
        </>
      )}

      <button
        className="sidepanel-chip"
        onClick={() => onChipClick("summarize")}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        <span>{t.chip_summarize}</span>
      </button>

      <button
        className="sidepanel-chip"
        onClick={() => onChipClick("key_takeaways")}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4"></path>
          <path d="M12 8h.01"></path>
        </svg>
        <span>{t.chip_takeaways}</span>
      </button>

      <button className="sidepanel-chip" onClick={() => onChipClick("extract")}>
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
        <span>{t.chip_extract}</span>
      </button>

      <button className="sidepanel-chip" onClick={() => onChipClick("ask")}>
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span>{t.chip_ask}</span>
      </button>
    </div>
  );
}

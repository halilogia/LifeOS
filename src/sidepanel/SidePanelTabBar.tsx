import { PageContext } from "@/content/agent/domAgentEngine.js";

interface SidePanelTabBarProps {
  t: Record<string, string>;
  pageContext: PageContext | null;
  onRefresh: () => void;
}

export function SidePanelTabBar({
  t,
  pageContext,
  onRefresh,
}: SidePanelTabBarProps) {
  return (
    <div className="sidepanel-tab-status">
      <div className="sidepanel-tab-info">
        <span className="sidepanel-tab-title">
          {pageContext?.title || t.page_loading}
        </span>
        <span className="sidepanel-tab-url">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
          </svg>
          {pageContext?.domain || pageContext?.url || ""}
        </span>
      </div>
      <button
        className="sidepanel-refresh-btn"
        onClick={onRefresh}
        title={t.rescan_page}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="23 4 23 10 17 10"></polyline>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
      </button>
    </div>
  );
}

/**
 * PomoHeaderTabs.tsx
 * Pomodoro Sayaç ve Zen Bahçesi sekmeleri navigasyon barı.
 */

interface PomoHeaderTabsProps {
  activeTab: "timer" | "zen";
  pomoTabTimerLabel: string;
  pomoTabZenLabel: string;
  onTabChange: (tab: "timer" | "zen") => void;
}

export function PomoHeaderTabs({
  activeTab,
  pomoTabTimerLabel,
  pomoTabZenLabel,
  onTabChange,
}: PomoHeaderTabsProps) {
  return (
    <div className="pomodoro-tab-header">
      <button
        className={`pomo-tab-link ${activeTab === "timer" ? "active" : ""}`}
        onClick={() => onTabChange("timer")}
      >
        {pomoTabTimerLabel}
      </button>
      <button
        className={`pomo-tab-link ${activeTab === "zen" ? "active" : ""}`}
        onClick={() => onTabChange("zen")}
      >
        {pomoTabZenLabel}
      </button>
    </div>
  );
}

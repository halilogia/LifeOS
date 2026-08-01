import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { usePomodoro } from "@/presentation/hooks/usePomodoro.js";
import { PomoSidePanel } from "@/components/PomoSidePanel.js";
import { PomoTimerCard } from "@/components/pomodoro/PomoTimerCard.js";
import { PomoZenGardenCard } from "@/components/pomodoro/PomoZenGardenCard.js";
import { PomoZenHistoryCard } from "@/components/pomodoro/PomoZenHistoryCard.js";
import { PomoHeaderTabs } from "@/components/pomodoro/PomoHeaderTabs.js";
import { renderZenElementSvg } from "@/components/pomodoro/PomoZenElementSvgs.js";

interface PomodoroViewProps {
  lang: Language;
}

const MODE_LABELS = { focus: "FOCUS", short: "SHORT", long: "LONG" };
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 110;

export function PomodoroView({ lang }: PomodoroViewProps) {
  const t = getTranslation(lang);

  const {
    activeTab,
    setActiveTab,
    pomodoroHistory,
    showPlantModal,
    focusNote,
    setFocusNote,
    selectedElement,
    setSelectedElement,
    searchQuery,
    setSearchQuery,
    customTimes,
    pomoMode,
    pomoTimeLeft,
    pomoRunning,
    pomoTotalTime,
    swTime,
    swRunning,
    alarms,
    alarmInput,
    setAlarmInput,
    handlePomoModeChange,
    handleCustomTimeChange,
    handlePomoStart,
    handlePomoPause,
    handlePomoReset,
    handleSwStart,
    handleSwPause,
    handleSwReset,
    handleAddAlarm,
    handleToggleAlarm,
    handleDeleteAlarm,
    handlePlantElement,
  } = usePomodoro({ lang, t });

  // Format Helper: Seconds to MM:SS
  const formatTime = (timeInSecs: number) => {
    const mins = Math.floor(timeInSecs / 60);
    const secs = timeInSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate Progress Ring Offset
  const percent = pomoTimeLeft / pomoTotalTime;
  const progressOffset = CIRCLE_CIRCUMFERENCE * (1 - percent);

  const gridCells: preact.JSX.Element[] = [];
  for (let i = 0; i < 25; i++) {
    const log = pomodoroHistory.find((h) => h.position === i);
    gridCells.push(
      <div key={i} className="zen-grid-cell">
        {log ? (
          <>
            <div className={`zen-element-wrapper ${log.element}`}>
              {renderZenElementSvg(log.element)}
            </div>
            <div className="zen-tooltip">
              <span className="zen-tooltip-note">{log.note}</span>
              <span className="zen-tooltip-time">
                {new Date(log.endTime).toLocaleDateString(
                  lang === "tr" ? "tr-TR" : "en-US",
                )}
              </span>
              <span className="zen-tooltip-time">
                {Math.round(log.duration / 60)} {t.minutes_abbr}
              </span>
            </div>
          </>
        ) : (
          <span style={{ opacity: 0.1, fontSize: "0.65rem" }}>+</span>
        )}
      </div>,
    );
  }

  const filteredHistory = pomodoroHistory
    .filter((log) => {
      if (!searchQuery.trim()) {
        return true;
      }
      return log.note?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort(
      (a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime(),
    );

  return (
    <div id="pomodoro-view" className="view-content active">
      {/* Sub-Tab Navigation Header */}
      <PomoHeaderTabs
        activeTab={activeTab}
        pomoTabTimerLabel={t.pomo_tab_timer}
        pomoTabZenLabel={t.pomo_tab_zen}
        onTabChange={setActiveTab}
      />

      {activeTab === "timer" ? (
        <div className="pomodoro-dashboard">
          <PomoTimerCard
            lang={lang}
            pomoMode={pomoMode}
            pomoTimeLeft={pomoTimeLeft}
            pomoRunning={pomoRunning}
            customTimes={customTimes}
            progressOffset={progressOffset}
            CIRCLE_CIRCUMFERENCE={CIRCLE_CIRCUMFERENCE}
            MODE_LABELS={MODE_LABELS}
            formatTime={formatTime}
            onPomoReset={handlePomoReset}
            onPomoStart={handlePomoStart}
            onPomoPause={handlePomoPause}
            onPomoModeChange={handlePomoModeChange}
            onCustomTimeChange={handleCustomTimeChange}
          />

          {/* Side Panel: Stopwatch & Alarm */}
          <PomoSidePanel
            lang={lang}
            swTime={swTime}
            swRunning={swRunning}
            onSwStart={handleSwStart}
            onSwPause={handleSwPause}
            onSwReset={handleSwReset}
            alarms={alarms}
            alarmInput={alarmInput}
            onAlarmInput={setAlarmInput}
            onAddAlarm={handleAddAlarm}
            onToggleAlarm={handleToggleAlarm}
            onDeleteAlarm={handleDeleteAlarm}
          />
        </div>
      ) : (
        <div className="zen-garden-panel">
          <PomoZenGardenCard
            gridCells={gridCells}
            showPlantModal={showPlantModal}
            focusNote={focusNote}
            selectedElement={selectedElement}
            t={t}
            onSetFocusNote={setFocusNote}
            onSetSelectedElement={setSelectedElement}
            onPlantElement={handlePlantElement}
            renderZenElementSvg={renderZenElementSvg}
          />

          <PomoZenHistoryCard
            lang={lang}
            searchQuery={searchQuery}
            onSearchQueryInput={setSearchQuery}
            filteredHistory={filteredHistory}
            t={t}
            renderZenElementSvg={renderZenElementSvg}
          />
        </div>
      )}
    </div>
  );
}

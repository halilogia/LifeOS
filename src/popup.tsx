import { render } from "preact";
import { usePopup } from "./presentation/hooks/usePopup.js";
import { getTranslation } from "./utils/i18n.js";
import { PopupPomoTab } from "./components/popup/PopupPomoTab.js";
import { PopupDetoxTab } from "./components/popup/PopupDetoxTab.js";

function PopupApp() {
  const {
    popupTab,
    setPopupTab,
    lang,
    pomoState,
    swRunning,
    swTime,
    alarms,
    alarmInput,
    setAlarmInput,
    detoxEnabled,
    detoxBlockedSites,
    detoxEndTime,
    detoxDuration,
    setDetoxDuration,
    detoxTimeLeft,
    handlePomoTabChange,
    handlePomoPlayPause,
    handlePomoReset,
    handleSwPlayPause,
    handleSwReset,
    handleAddAlarm,
    handleToggleAlarm,
    handleDeleteAlarm,
    handleTogglePopupSite,
    handleEnableDetox,
    handleDisableDetox,
  } = usePopup();

  const t = getTranslation(lang);

  return (
    <div
      className="popup-container"
      style={{
        padding: "1rem",
        width: "330px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      {/* Header with App Tab Switchers */}
      <div className="popup-tabs">
        <button
          className={`popup-tab-btn ${popupTab === "pomo" ? "active" : ""}`}
          onClick={() => setPopupTab("pomo")}
        >
          {t.popup_pomo_alarms_title}
        </button>
        <button
          className={`popup-tab-btn ${popupTab === "detox" ? "active" : ""}`}
          onClick={() => setPopupTab("detox")}
        >
          {t.popup_detox_tab_title}
        </button>
      </div>

      {popupTab === "pomo" ? (
        <PopupPomoTab
          t={t}
          pomoState={pomoState}
          swRunning={swRunning}
          swTime={swTime}
          alarms={alarms}
          alarmInput={alarmInput}
          setAlarmInput={setAlarmInput}
          handlePomoTabChange={handlePomoTabChange}
          handlePomoPlayPause={handlePomoPlayPause}
          handlePomoReset={handlePomoReset}
          handleSwPlayPause={handleSwPlayPause}
          handleSwReset={handleSwReset}
          handleAddAlarm={handleAddAlarm}
          handleToggleAlarm={handleToggleAlarm}
          handleDeleteAlarm={handleDeleteAlarm}
        />
      ) : (
        <PopupDetoxTab
          t={t}
          lang={lang}
          detoxEnabled={detoxEnabled}
          detoxBlockedSites={detoxBlockedSites}
          detoxEndTime={detoxEndTime}
          detoxDuration={detoxDuration}
          detoxTimeLeft={detoxTimeLeft}
          setDetoxDuration={setDetoxDuration}
          handleTogglePopupSite={handleTogglePopupSite}
          handleEnableDetox={handleEnableDetox}
          handleDisableDetox={handleDisableDetox}
        />
      )}
    </div>
  );
}

const container = document.getElementById("popup-app");
if (container) {
  render(<PopupApp />, container);
}

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
      {/* Header with App Tab Switchers & Side Panel Trigger */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="popup-tabs" style={{ flex: 1 }}>
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
        <button
          onClick={() => {
            chrome.runtime.sendMessage({ type: "open_sidepanel" });
            window.close();
          }}
          title={lang === "tr" ? "Web AI Yan Panelini Aç" : "Open Web AI Side Panel"}
          style={{
            background: "rgba(139, 92, 246, 0.15)",
            border: "1px solid var(--accent-color)",
            color: "white",
            borderRadius: "8px",
            padding: "6px 10px",
            fontSize: "0.72rem",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginLeft: "8px",
            transition: "all 0.2s ease",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
          <span>{lang === "tr" ? "Copilot" : "Side Panel"}</span>
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

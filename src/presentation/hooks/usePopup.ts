import { useEffect } from "preact/hooks";
import { usePopupState } from "@/presentation/store/popupStore.js";

/**
 * Facade over usePopupState — all state + subscriptions + timers live in the store.
 * Consumer components are untouched.
 */
export function usePopup() {
  const popupTab = usePopupState((s) => s.popupTab);
  const setPopupTab = usePopupState((s) => s.setPopupTab);
  const lang = usePopupState((s) => s.lang);
  const pomoState = usePopupState((s) => s.pomoState);
  const swRunning = usePopupState((s) => s.swRunning);
  const swTime = usePopupState((s) => s.swTime);
  const alarms = usePopupState((s) => s.alarms);
  const alarmInput = usePopupState((s) => s.alarmInput);
  const setAlarmInput = usePopupState((s) => s.setAlarmInput);
  const detoxEnabled = usePopupState((s) => s.detoxEnabled);
  const detoxBlockedSites = usePopupState((s) => s.detoxBlockedSites);
  const detoxEndTime = usePopupState((s) => s.detoxEndTime);
  const detoxDuration = usePopupState((s) => s.detoxDuration);
  const setDetoxDuration = usePopupState((s) => s.setDetoxDuration);
  const detoxTimeLeft = usePopupState((s) => s.detoxTimeLeft);
  const handlePomoTabChange = usePopupState((s) => s.handlePomoTabChange);
  const handlePomoPlayPause = usePopupState((s) => s.handlePomoPlayPause);
  const handlePomoReset = usePopupState((s) => s.handlePomoReset);
  const handleSwPlayPause = usePopupState((s) => s.handleSwPlayPause);
  const handleSwReset = usePopupState((s) => s.handleSwReset);
  const handleAddAlarm = usePopupState((s) => s.handleAddAlarm);
  const handleToggleAlarm = usePopupState((s) => s.handleToggleAlarm);
  const handleDeleteAlarm = usePopupState((s) => s.handleDeleteAlarm);
  const handleTogglePopupSite = usePopupState((s) => s.handleTogglePopupSite);
  const handleEnableDetox = usePopupState((s) => s.handleEnableDetox);
  const handleDisableDetox = usePopupState((s) => s.handleDisableDetox);

  useEffect(() => {
    const cleanup = usePopupState.getState().init();
    return cleanup;
  }, []);

  return {
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
  };
}

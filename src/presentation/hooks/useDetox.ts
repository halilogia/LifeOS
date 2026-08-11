import { useEffect } from "preact/hooks";
import { useDetoxState } from "@/presentation/store/detoxStore.js";

/**
 * Facade over useDetoxState — all state + storage lives in the store.
 * Consumer components are untouched.
 */
export function useDetox() {
  const enabled = useDetoxState((s) => s.enabled);
  const setEnabled = useDetoxState((s) => s.setEnabled);
  const blockedSites = useDetoxState((s) => s.blockedSites);
  const setBlockedSites = useDetoxState((s) => s.setBlockedSites);
  const endTime = useDetoxState((s) => s.endTime);
  const setEndTime = useDetoxState((s) => s.setEndTime);
  const screenTimeStats = useDetoxState((s) => s.screenTimeStats);
  const distractionSettings = useDetoxState((s) => s.distractionSettings);
  const setDistractionSettings = useDetoxState((s) => s.setDistractionSettings);
  const saveBlockedSites = useDetoxState((s) => s.saveBlockedSites);
  const saveDistractionSettings = useDetoxState((s) => s.saveDistractionSettings);
  const enableDetox = useDetoxState((s) => s.enableDetox);
  const disableDetox = useDetoxState((s) => s.disableDetox);

  useEffect(() => {
    void useDetoxState.getState().loadConfig();
    void useDetoxState.getState().loadScreenTimeStats();
    const interval = setInterval(() => {
      void useDetoxState.getState().loadScreenTimeStats();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    enabled,
    setEnabled,
    blockedSites,
    setBlockedSites,
    endTime,
    setEndTime,
    screenTimeStats,
    distractionSettings,
    setDistractionSettings,
    saveBlockedSites,
    saveDistractionSettings,
    enableDetox,
    disableDetox,
  };
}

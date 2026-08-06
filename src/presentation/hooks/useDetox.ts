import { useState, useEffect, useCallback } from "preact/hooks";

export function useDetox() {
  const [enabled, setEnabled] = useState(false);
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [endTime, setEndTime] = useState(0);
  const [screenTimeStats, setScreenTimeStats] = useState<
    Record<string, number>
  >({});

  // Load config from storage
  useEffect(() => {
    chrome.storage.local.get(
      ["detox_enabled", "detox_blocked_sites", "detox_end_time"],
      (resData: {
        detox_enabled?: boolean;
        detox_blocked_sites?: string[];
        detox_end_time?: number;
      }) => {
        const isEnabled = resData.detox_enabled || false;
        const sites = resData.detox_blocked_sites || [];
        const end = resData.detox_end_time || 0;

        if (isEnabled && end !== -1 && end <= Date.now()) {
          // Time expired, disable
          chrome.storage.local.set({
            detox_enabled: false,
            detox_end_time: 0,
          });
          setEnabled(false);
          setBlockedSites(sites);
          setEndTime(0);
        } else {
          setEnabled(isEnabled);
          setBlockedSites(sites);
          setEndTime(end);
        }
      },
    );
  }, []);

  // Load screen time stats
  useEffect(() => {
    const loadStats = () => {
      const todayStr = new Date().toLocaleDateString("sv");
      chrome.storage.local.get(["screen_time_stats"], (res) => {
        const stats = res.screen_time_stats?.[todayStr] || {};
        setScreenTimeStats(stats as Record<string, number>);
      });
    };

    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const saveBlockedSites = useCallback((sites: string[]) => {
    chrome.storage.local.set({ detox_blocked_sites: sites });
  }, []);

  const enableDetox = useCallback((sites: string[], duration: number) => {
    const calculatedEndTime = duration === -1 ? -1 : Date.now() + duration;
    const settings = {
      detox_enabled: true,
      detox_blocked_sites: sites,
      detox_end_time: calculatedEndTime,
    };
    chrome.storage.local.set(settings, () => {
      setEnabled(true);
      setEndTime(calculatedEndTime);
    });
  }, []);

  const disableDetox = useCallback(() => {
    const settings = {
      detox_enabled: false,
      detox_end_time: 0,
    };
    chrome.storage.local.set(settings, () => {
      setEnabled(false);
      setEndTime(0);
    });
  }, []);

  return {
    enabled,
    setEnabled,
    blockedSites,
    setBlockedSites,
    endTime,
    setEndTime,
    screenTimeStats,
    saveBlockedSites,
    enableDetox,
    disableDetox,
  };
}

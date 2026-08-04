import { useState, useEffect } from "preact/hooks";
import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import { DetoxUsageCard } from "@/components/detox/DetoxUsageCard.js";
import { DetoxStatusCard } from "@/components/detox/DetoxStatusCard.js";
import { useDetox } from "@/presentation/hooks/useDetox.js";

interface DetoxViewProps {
  lang: Language;
}

const SUPPORTED_SITES = [
  { id: "x.com", label: "Twitter / X", domains: ["x.com", "twitter.com"] },
  { id: "instagram.com", label: "Instagram", domains: ["instagram.com"] },
  { id: "youtube.com", label: "YouTube", domains: ["youtube.com"] },
  { id: "tiktok.com", label: "TikTok", domains: ["tiktok.com"] },
  { id: "facebook.com", label: "Facebook", domains: ["facebook.com"] },
];

const DURATIONS = [
  { value: 15 * 60 * 1000, labelKey: "detox_duration_15m" },
  { value: 30 * 60 * 1000, labelKey: "detox_duration_30m" },
  { value: 60 * 60 * 1000, labelKey: "detox_duration_1h" },
  { value: 120 * 60 * 1000, labelKey: "detox_duration_2h" },
  { value: 240 * 60 * 1000, labelKey: "detox_duration_4h" },
  { value: -1, labelKey: "detox_duration_permanent" },
];

export function DetoxView({ lang }: DetoxViewProps) {
  const t = translations[lang];

  const {
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
  } = useDetox();

  const [selectedDuration, setSelectedDuration] = useState(30 * 60 * 1000); // 30m default
  const [timeLeft, setTimeLeft] = useState(0);
  const [customSiteInput, setCustomSiteInput] = useState("");
  const [showAllStats, setShowAllStats] = useState(false);

  // Tick local countdown timer if active
  useEffect(() => {
    let interval: number | null = null;

    if (enabled && endTime !== -1) {
      const calcTimeLeft = () => {
        const remaining = Math.max(
          0,
          Math.round((endTime - Date.now()) / 1000),
        );
        setTimeLeft(remaining);
        if (remaining === 0) {
          handleDisableDetox();
        }
      };

      calcTimeLeft();
      interval = window.setInterval(calcTimeLeft, 1000);
    } else {
      setTimeLeft(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [enabled, endTime]);

  const handleToggleSite = (siteDomains: string[]) => {
    setBlockedSites((prev) => {
      const exists = prev.includes(siteDomains[0]);
      let updated;
      if (exists) {
        updated = prev.filter((d) => !siteDomains.includes(d));
      } else {
        updated = [...prev, ...siteDomains];
      }
      if (enabled) {
        saveBlockedSites(updated);
      }
      return updated;
    });
  };

  const handleAddCustomSite = () => {
    let site = customSiteInput.trim().toLowerCase();
    if (!site) {
      return;
    }
    site = site.replace(/^(https?:\/\/)?(www\.)?/, "");
    if (!site) {
      return;
    }

    setBlockedSites((prev) => {
      if (prev.includes(site)) {
        return prev;
      }
      const updated = [...prev, site];
      saveBlockedSites(updated);
      return updated;
    });
    setCustomSiteInput("");
  };

  const handleRemoveCustomSite = (site: string) => {
    setBlockedSites((prev) => {
      const updated = prev.filter((s) => s !== site);
      saveBlockedSites(updated);
      return updated;
    });
  };

  const handleEnableDetox = async () => {
    if (blockedSites.length === 0) {
      alert(t.detox_no_sites_alert || "Lütfen en az bir site seçin.");
      return;
    }
    enableDetox(blockedSites, selectedDuration);
  };

  const handleDisableDetox = async () => {
    disableDetox();
    setTimeLeft(0);
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;

    let str = "";
    if (h > 0) {
      str += `${h.toString().padStart(2, "0")}:`;
    }
    str += `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return str;
  };

  const formatDurationText = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) {
      return t.detox_time_hours
        .replace("{h}", String(h))
        .replace("{m}", String(m));
    }
    if (m > 0) {
      return t.detox_time_minutes
        .replace("{m}", String(m))
        .replace("{s}", String(s));
    }
    return t.detox_time_seconds.replace("{s}", String(s));
  };

  // Screen time details calculations
  const totalScreenTimeSeconds = Object.values(screenTimeStats).reduce(
    (acc, val) => acc + val,
    0,
  );
  const sortedScreenTimeSites = Object.entries(screenTimeStats).sort(
    (a, b) => b[1] - a[1],
  );
  const visibleScreenTimeSites = showAllStats
    ? sortedScreenTimeSites
    : sortedScreenTimeSites.slice(0, 5);

  const defaultDomains = SUPPORTED_SITES.flatMap((s) => s.domains);
  const customBlockedSites = blockedSites.filter(
    (site) => !defaultDomains.includes(site),
  );
  return (
    <div id="detox-view" className="view-content active">
      <div className="detox-container">
        <DetoxUsageCard
          lang={lang}
          totalScreenTimeSeconds={totalScreenTimeSeconds}
          visibleScreenTimeSites={visibleScreenTimeSites}
          sortedScreenTimeSites={sortedScreenTimeSites}
          showAllStats={showAllStats}
          formatDurationText={formatDurationText}
          onToggleShowAllStats={() => setShowAllStats(!showAllStats)}
        />

        <DetoxStatusCard
          lang={lang}
          t={t}
          enabled={enabled}
          endTime={endTime}
          timeLeft={timeLeft}
          customSiteInput={customSiteInput}
          blockedSites={blockedSites}
          selectedDuration={selectedDuration}
          customBlockedSites={customBlockedSites}
          SUPPORTED_SITES={SUPPORTED_SITES}
          DURATIONS={DURATIONS}
          formatTime={formatTime}
          onDisableDetox={handleDisableDetox}
          onEnableDetox={handleEnableDetox}
          onToggleSite={handleToggleSite}
          onCustomSiteInput={setCustomSiteInput}
          onAddCustomSite={handleAddCustomSite}
          onRemoveCustomSite={handleRemoveCustomSite}
          onSelectedDurationChange={setSelectedDuration}
        />
      </div>
    </div>
  );
}

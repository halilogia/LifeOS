import { useState, useEffect } from "preact/hooks";
import { getTranslation } from "@/utils/i18n.js";

interface PopupVolumeTabProps {
  lang: "tr" | "en";
}

export function PopupVolumeTab({ lang }: PopupVolumeTabProps) {
  const t = getTranslation(lang);
  const [volumeLevel, setVolumeLevel] = useState<number>(100);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [tabTitle, setTabTitle] = useState<string>("");

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        const tId = tabs[0].id;
        setActiveTabId(tId);
        setTabTitle(tabs[0].title || "Aktif Sekme");

        const storageKey = `volume_tab_${tId}`;
        chrome.storage.local.get([storageKey], (res) => {
          if (res[storageKey] !== undefined) {
            setVolumeLevel(res[storageKey] as number);
          } else {
            setVolumeLevel(100);
          }
        });
      }
    });
  }, []);

  const handleVolumeChange = (newLevel: number) => {
    setVolumeLevel(newLevel);

    if (activeTabId !== null) {
      const storageKey = `volume_tab_${activeTabId}`;
      chrome.storage.local.set({ [storageKey]: newLevel });

      const multiplier = newLevel / 100;
      chrome.runtime.sendMessage({
        type: "set_volume_boost",
        tabId: activeTabId,
        volumeLevel: multiplier,
      });

      chrome.tabs.sendMessage(activeTabId, {
        type: "set_volume_boost",
        tabId: activeTabId,
        volumeLevel: multiplier,
      }).catch(() => {});
    }
  };

  const isDangerZone = volumeLevel > 300;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid var(--card-border)",
        borderRadius: "12px",
        padding: "12px",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      {/* Title Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
          <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "white" }}>
            {t.popup_volume_tab_title}
          </span>
        </div>
        <span
          style={{
            fontWeight: 800,
            fontSize: "0.9rem",
            color: isDangerZone ? "#ef4444" : "var(--accent-color)",
          }}
        >
          %{volumeLevel}
        </span>
      </div>

      {/* Active Tab Subtitle */}
      {tabTitle && (
        <div
          style={{
            fontSize: "0.7rem",
            color: "var(--text-secondary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            background: "rgba(255, 255, 255, 0.03)",
            padding: "4px 8px",
            borderRadius: "6px",
          }}
          title={tabTitle}
        >
          🎵 <strong>{t.popup_tab_label}</strong> {tabTitle}
        </div>
      )}

      {/* Safety Badge / Warning */}
      <div
        style={{
          padding: "8px 10px",
          borderRadius: "8px",
          fontSize: "0.72rem",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          lineHeight: "1.3",
          transition: "all 0.2s ease",
          background: isDangerZone ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.1)",
          border: isDangerZone ? "1px solid #ef4444" : "1px solid rgba(16, 185, 129, 0.3)",
          color: isDangerZone ? "#ef4444" : "#10b981",
        }}
      >
        <span>{isDangerZone ? "⚠️" : "🟢"}</span>
        <span>
          {isDangerZone ? t.popup_volume_warning : t.popup_volume_safe}
        </span>
      </div>

      {/* Volume Slider */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <input
          type="range"
          min="100"
          max="600"
          step="10"
          value={volumeLevel}
          onInput={(e) => handleVolumeChange(Number((e.target as HTMLInputElement).value))}
          style={{
            width: "100%",
            accentColor: isDangerZone ? "#ef4444" : "var(--accent-color)",
            cursor: "pointer",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-secondary)" }}>
          <span>%100 (Normal)</span>
          <span>%300 (Güvenli)</span>
          <span style={{ color: "#ef4444", fontWeight: 700 }}>%600 (Maks)</span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginTop: "2px" }}>
        <button
          onClick={() => handleVolumeChange(100)}
          style={{
            background: volumeLevel === 100 ? "var(--accent-color)" : "rgba(255,255,255,0.04)",
            border: "1px solid var(--card-border)",
            borderRadius: "6px",
            color: "white",
            padding: "5px 2px",
            fontSize: "0.7rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          %100
        </button>
        <button
          onClick={() => handleVolumeChange(200)}
          style={{
            background: volumeLevel === 200 ? "var(--accent-color)" : "rgba(255,255,255,0.04)",
            border: "1px solid var(--card-border)",
            borderRadius: "6px",
            color: "white",
            padding: "5px 2px",
            fontSize: "0.7rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          %200
        </button>
        <button
          onClick={() => handleVolumeChange(300)}
          style={{
            background: volumeLevel === 300 ? "var(--accent-color)" : "rgba(255,255,255,0.04)",
            border: "1px solid var(--card-border)",
            borderRadius: "6px",
            color: "white",
            padding: "5px 2px",
            fontSize: "0.7rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          %300
        </button>
        <button
          onClick={() => handleVolumeChange(500)}
          style={{
            background: volumeLevel === 500 ? "#ef4444" : "rgba(239,68,68,0.15)",
            border: "1px solid #ef4444",
            borderRadius: "6px",
            color: "white",
            padding: "5px 2px",
            fontSize: "0.7rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          %500 ⚠️
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect } from "preact/hooks";
import {
  getAutoTitleSetting,
  saveAutoTitleSetting,
} from "@/services/kpss/kpssWikiService.js";
import { KpssTargetSettingsGroup } from "./KpssTargetSettingsGroup.js";
import { KpssAutoTitleToggle } from "./KpssAutoTitleToggle.js";
import { KpssResetSection } from "./KpssResetSection.js";

interface KpssSettingsTabProps {
  t: Record<string, string>;
  kpssGoalType: "net" | "score";
  kpssTargetNet: number;
  kpssTargetScore: number;
  onKpssGoalTypeChange: (type: "net" | "score") => void;
  onKpssTargetNetChange: (val: number) => void;
  onKpssTargetScoreChange: (val: number) => void;
  onResetKpssData?: () => void;
}

export function KpssSettingsTab({
  t,
  kpssGoalType,
  kpssTargetNet,
  kpssTargetScore,
  onKpssGoalTypeChange,
  onKpssTargetNetChange,
  onKpssTargetScoreChange,
  onResetKpssData,
}: KpssSettingsTabProps) {
  const [autoTitleEnabled, setAutoTitleEnabled] = useState(false);

  useEffect(() => {
    getAutoTitleSetting().then(setAutoTitleEnabled);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* KPSS Target Settings */}
      <KpssTargetSettingsGroup
        t={t}
        kpssGoalType={kpssGoalType}
        kpssTargetNet={kpssTargetNet}
        kpssTargetScore={kpssTargetScore}
        onKpssGoalTypeChange={onKpssGoalTypeChange}
        onKpssTargetNetChange={onKpssTargetNetChange}
        onKpssTargetScoreChange={onKpssTargetScoreChange}
      />

      {/* Wiki Notları Ayarları */}
      <KpssAutoTitleToggle
        t={t}
        enabled={autoTitleEnabled}
        onToggle={(checked) => {
          setAutoTitleEnabled(checked);
          saveAutoTitleSetting(checked);
        }}
      />

      {/* Reset KPSS Data Section */}
      <KpssResetSection t={t} onReset={onResetKpssData ?? (() => {})} />
    </div>
  );
}

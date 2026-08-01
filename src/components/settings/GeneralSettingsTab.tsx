/**
 * GeneralSettingsTab.tsx
 * Genel Ayarlar sekmesi — AppSettingsGroup + ErrorReportSettingsTab kompozisyonu.
 * Dosya limiti: ≤400 satır (6.1) — toggle'lar AppSettingsGroup/BridgeToggles'ta.
 */

import { Language } from "@/types/types.js";
import { ErrorReportSettingsTab } from "@/components/settings/ErrorReportSettingsTab.js";
import { AppSettingsGroup } from "@/components/settings/AppSettingsGroup.js";

interface GeneralSettingsTabProps {
  lang: Language;
  t: Record<string, string>;
  onToggleLang: () => void;
  freeGamesNotificationsEnabled: boolean;
  onToggleFreeGamesNotifications: () => void;
  calendarNotificationsEnabled: boolean;
  onToggleCalendarNotifications: () => void;
  pomoBlockEnabled: boolean;
  onTogglePomoBlock: () => void;
  universalInfoBoxEnabled: boolean;
  onToggleUniversalInfoBox: () => void;
  universalInfoBoxHotkey: string;
  onUniversalInfoBoxHotkeyChange: (hotkey: string) => void;
  whatsappBridgeEnabled: boolean;
  onToggleWhatsappBridge: () => void;
  telegramBridgeEnabled: boolean;
  onToggleTelegramBridge: () => void;
  autoGroupTabsEnabled?: boolean;
  onToggleAutoGroupTabs?: () => void;
  onNotify?: (message: string) => void;
}

export function GeneralSettingsTab({
  lang,
  t,
  onToggleLang,
  freeGamesNotificationsEnabled,
  onToggleFreeGamesNotifications,
  calendarNotificationsEnabled,
  onToggleCalendarNotifications,
  pomoBlockEnabled,
  onTogglePomoBlock,
  universalInfoBoxEnabled,
  onToggleUniversalInfoBox,
  universalInfoBoxHotkey,
  onUniversalInfoBoxHotkeyChange,
  whatsappBridgeEnabled,
  onToggleWhatsappBridge,
  telegramBridgeEnabled,
  onToggleTelegramBridge,
  autoGroupTabsEnabled = true,
  onToggleAutoGroupTabs,
  onNotify,
}: GeneralSettingsTabProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <AppSettingsGroup
        lang={lang}
        t={t}
        onToggleLang={onToggleLang}
        freeGamesNotificationsEnabled={freeGamesNotificationsEnabled}
        onToggleFreeGamesNotifications={onToggleFreeGamesNotifications}
        calendarNotificationsEnabled={calendarNotificationsEnabled}
        onToggleCalendarNotifications={onToggleCalendarNotifications}
        pomoBlockEnabled={pomoBlockEnabled}
        onTogglePomoBlock={onTogglePomoBlock}
        universalInfoBoxEnabled={universalInfoBoxEnabled}
        onToggleUniversalInfoBox={onToggleUniversalInfoBox}
        universalInfoBoxHotkey={universalInfoBoxHotkey}
        onUniversalInfoBoxHotkeyChange={onUniversalInfoBoxHotkeyChange}
        whatsappBridgeEnabled={whatsappBridgeEnabled}
        onToggleWhatsappBridge={onToggleWhatsappBridge}
        telegramBridgeEnabled={telegramBridgeEnabled}
        onToggleTelegramBridge={onToggleTelegramBridge}
        autoGroupTabsEnabled={autoGroupTabsEnabled}
        onToggleAutoGroupTabs={onToggleAutoGroupTabs}
      />

      {/* Error Reporting Section */}
      {onNotify && <ErrorReportSettingsTab t={t} onNotify={onNotify} />}
    </div>
  );
}

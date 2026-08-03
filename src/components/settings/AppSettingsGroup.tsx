/**
 * AppSettingsGroup.tsx
 * Genel Ayarlar > Uygulama Ayarları grubu — tüm toggle/hotkey butonları.
 * GeneralSettingsTab dosya limitini aşmasın diye ayrı (6.1).
 * Tuval: BridgeToggles + AppToggleRow/AppHotkeySelect/AppShortcutRow parçaları.
 */

import { Language } from "@/types/types.js";
import { BridgeToggles } from "@/components/settings/BridgeToggles.js";
import { AppToggleRow } from "./AppToggleRow.js";
import { AppHotkeySelect } from "./AppHotkeySelect.js";
import { AppShortcutRow } from "./AppShortcutRow.js";

export interface AppSettingsGroupProps {
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
}

export function AppSettingsGroup({
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
}: AppSettingsGroupProps) {
  return (
    <div className="settings-group">
      <h3
        style={{
          margin: "0 0 12px 0",
          fontSize: "0.85rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--text-secondary)",
          opacity: 0.8,
        }}
      >
        {t.settings_app_settings_title}
      </h3>
      <div className="settings-actions">
        {/* Language Switch */}
        <AppToggleRow
          label={t.change_lang}
          icon="globe"
          enabled={true}
          enabledText={lang.toUpperCase()}
          disabledText={lang.toUpperCase()}
          onClick={onToggleLang}
        />

        {/* Free Games Notifications Toggle */}
        <AppToggleRow
          label={t.free_games_notifications_title}
          icon="bell"
          enabled={freeGamesNotificationsEnabled}
          enabledText={t.enabled}
          disabledText={t.disabled}
          onClick={onToggleFreeGamesNotifications}
        />

        {/* Calendar Tasks Notifications Toggle */}
        <AppToggleRow
          label={t.settings_notify_tasks}
          icon="calendar"
          enabled={calendarNotificationsEnabled}
          enabledText={t.enabled}
          disabledText={t.disabled}
          onClick={onToggleCalendarNotifications}
        />

        {/* Pomodoro Focus Block Toggle */}
        <AppToggleRow
          label={t.settings_pomo_blocker}
          icon="lock"
          enabled={pomoBlockEnabled}
          enabledText={t.enabled}
          disabledText={t.disabled}
          onClick={onTogglePomoBlock}
        />

        {/* Universal Info Box Toggle */}
        <AppToggleRow
          label={t.uib_title}
          icon="info"
          enabled={universalInfoBoxEnabled}
          enabledText={t.enabled}
          disabledText={t.disabled}
          onClick={onToggleUniversalInfoBox}
        />

        {/* WhatsApp & Telegram Köprü Toggle'ları */}
        <BridgeToggles
          t={t}
          whatsappBridgeEnabled={whatsappBridgeEnabled}
          onToggleWhatsappBridge={onToggleWhatsappBridge}
          telegramBridgeEnabled={telegramBridgeEnabled}
          onToggleTelegramBridge={onToggleTelegramBridge}
        />

        {/* Auto Tab Grouping Toggle */}
        {onToggleAutoGroupTabs && (
          <AppToggleRow
            label={t.settings_auto_group_tabs}
            icon="calendar"
            enabled={autoGroupTabsEnabled}
            enabledText={t.enabled}
            disabledText={t.disabled}
            onClick={onToggleAutoGroupTabs}
          />
        )}

        {/* Universal Info Box Hotkey Selection */}
        {universalInfoBoxEnabled && (
          <AppHotkeySelect
            t={t}
            value={universalInfoBoxHotkey}
            onChange={onUniversalInfoBoxHotkeyChange}
          />
        )}

        {/* Side Panel Copilot Hotkey Management */}
        <AppShortcutRow t={t} />
      </div>
    </div>
  );
}

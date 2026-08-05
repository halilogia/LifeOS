/**
 * AppSettingsGroup.tsx
 * Genel Ayarlar > kategorize edilmiş toggle/hotkey butonları.
 * Bölümler: Arayüz & Dil / Bildirimler / Odak Araçları / Entegrasyonlar.
 * Tuval: BridgeToggles + AppToggleRow/AppHotkeySelect/AppShortcutRow parçaları.
 */

import type { ComponentChildren } from "preact";
import { Language } from "@/types/types.js";
import { BridgeToggles } from "@/components/settings/BridgeToggles.js";
import { AppToggleRow } from "./AppToggleRow.js";
import { AppHotkeySelect } from "./AppHotkeySelect.js";
import { AppShortcutRow } from "./AppShortcutRow.js";
import { SettingsSection } from "./SettingsSection.js";

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

interface GroupCardProps {
  title: string;
  children: ComponentChildren;
}

function GroupCard({ title, children }: GroupCardProps) {
  return (
    <div className="settings-group">
      <SettingsSection title={title} />
      <div className="settings-actions">{children}</div>
    </div>
  );
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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Arayüz & Dil */}
      <GroupCard title={t.settings_category_ui}>
        <>
          <AppToggleRow
            label={t.change_lang}
            icon="globe"
            enabled={true}
            enabledText={lang.toUpperCase()}
            disabledText={lang.toUpperCase()}
            onClick={onToggleLang}
          />
          <AppShortcutRow t={t} />
        </>
      </GroupCard>

      {/* Bildirimler */}
      <GroupCard title={t.settings_category_notifications}>
        <AppToggleRow
          label={t.free_games_notifications_title}
          icon="bell"
          enabled={freeGamesNotificationsEnabled}
          enabledText={t.enabled}
          disabledText={t.disabled}
          onClick={onToggleFreeGamesNotifications}
        />
        <AppToggleRow
          label={t.settings_notify_tasks}
          icon="calendar"
          enabled={calendarNotificationsEnabled}
          enabledText={t.enabled}
          disabledText={t.disabled}
          onClick={onToggleCalendarNotifications}
        />
      </GroupCard>

      {/* Odak Araçları */}
      <GroupCard title={t.settings_category_focus}>
        <AppToggleRow
          label={t.settings_pomo_blocker}
          icon="lock"
          enabled={pomoBlockEnabled}
          enabledText={t.enabled}
          disabledText={t.disabled}
          onClick={onTogglePomoBlock}
        />
      </GroupCard>

      {/* Entegrasyonlar */}
      <GroupCard title={t.settings_category_integrations}>
        <AppToggleRow
          label={t.uib_title}
          icon="info"
          enabled={universalInfoBoxEnabled}
          enabledText={t.enabled}
          disabledText={t.disabled}
          onClick={onToggleUniversalInfoBox}
        />
        {universalInfoBoxEnabled && (
          <AppHotkeySelect
            t={t}
            value={universalInfoBoxHotkey}
            onChange={onUniversalInfoBoxHotkeyChange}
          />
        )}
        <BridgeToggles
          t={t}
          whatsappBridgeEnabled={whatsappBridgeEnabled}
          onToggleWhatsappBridge={onToggleWhatsappBridge}
          telegramBridgeEnabled={telegramBridgeEnabled}
          onToggleTelegramBridge={onToggleTelegramBridge}
        />
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
      </GroupCard>
    </div>
  );
}

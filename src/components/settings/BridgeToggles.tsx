/**
 * BridgeToggles.tsx
 * WhatsApp & Telegram AI köprü toggle'ları (Genel Ayarlar parçası).
 * Ayrı dosyada — GeneralSettingsTab dosya limitini aşmasın (6.1).
 */

interface BridgeTogglesProps {
  t: Record<string, string>;
  whatsappBridgeEnabled: boolean;
  onToggleWhatsappBridge: () => void;
  telegramBridgeEnabled: boolean;
  onToggleTelegramBridge: () => void;
}

export function BridgeToggles({
  t,
  whatsappBridgeEnabled,
  onToggleWhatsappBridge,
  telegramBridgeEnabled,
  onToggleTelegramBridge,
}: BridgeTogglesProps) {
  return (
    <>
      {/* WhatsApp Bridge Toggle */}
      <button
        className="settings-action-btn"
        onClick={onToggleWhatsappBridge}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        <span>{t.settings_whatsapp_bridge}</span>
        <span
          style={{
            marginLeft: "auto",
            fontWeight: 700,
            color: whatsappBridgeEnabled
              ? "var(--accent-color)"
              : "var(--text-secondary)",
          }}
        >
          {whatsappBridgeEnabled ? t.enabled : t.disabled}
        </span>
      </button>

      {/* Telegram Bridge Toggle */}
      <button
        className="settings-action-btn"
        onClick={onToggleTelegramBridge}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
        <span>{t.settings_telegram_bridge}</span>
        <span
          style={{
            marginLeft: "auto",
            fontWeight: 700,
            color: telegramBridgeEnabled
              ? "var(--accent-color)"
              : "var(--text-secondary)",
          }}
        >
          {telegramBridgeEnabled ? t.enabled : t.disabled}
        </span>
      </button>
    </>
  );
}

/**
 * SettingsSection.tsx
 * Reusable grouped settings section header.
 * Tutarlı grup başlığı — tüm ayar sekmelerinde standart görünüm.
 */
interface SettingsSectionProps {
  title: string;
}

export function SettingsSection({ title }: SettingsSectionProps) {
  return (
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
      {title}
    </h3>
  );
}

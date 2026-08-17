import { ComponentChildren } from "preact";

interface DetoxPlatformSectionProps {
  title: string;
  color: string;
  icon: ComponentChildren;
  children: ComponentChildren;
}

export function DetoxPlatformSection({
  title,
  color,
  icon,
  children,
}: DetoxPlatformSectionProps) {
  return (
    <div
      style={{
        background: "rgba(30, 41, 59, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        borderRadius: "12px",
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontWeight: 700,
          color,
          fontSize: "0.85rem",
        }}
      >
        {icon}
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {children}
      </div>
    </div>
  );
}

export function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div
      onClick={onChange}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "8px 10px",
        borderRadius: "10px",
        background: checked
          ? "rgba(59, 130, 246, 0.1)"
          : "rgba(15, 23, 42, 0.3)",
        border: checked
          ? "1px solid rgba(59, 130, 246, 0.25)"
          : "1px solid rgba(255, 255, 255, 0.04)",
        cursor: "pointer",
        userSelect: "none",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <span
        style={{
          fontSize: "0.78rem",
          color: checked ? "#f8fafc" : "#94a3b8",
          fontWeight: checked ? 600 : 400,
          transition: "color 0.2s ease",
        }}
      >
        {label}
      </span>

      {/* Custom Premium iOS Style Switch */}
      <div
        style={{
          position: "relative",
          width: "34px",
          height: "18px",
          borderRadius: "10px",
          background: checked
            ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            : "rgba(51, 65, 85, 0.8)",
          boxShadow: checked
            ? "0 0 10px rgba(59, 130, 246, 0.4)"
            : "inset 0 1px 3px rgba(0, 0, 0, 0.3)",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: checked ? "18px" : "2px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
}

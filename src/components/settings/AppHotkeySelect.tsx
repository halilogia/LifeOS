interface AppHotkeySelectProps {
  t: Record<string, string>;
  value: string;
  onChange: (val: string) => void;
}

export function AppHotkeySelect({
  t,
  value,
  onChange,
}: AppHotkeySelectProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 12px",
        background: "rgba(255, 255, 255, 0.03)",
        borderRadius: "6px",
        margin: "2px 0 6px 0",
      }}
    >
      <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
        {t.uib_hotkey}:
      </span>
      <select
        value={value}
        onChange={(e) => onChange((e.target as HTMLSelectElement).value)}
        style={{
          marginLeft: "auto",
          background: "#1e1e24",
          color: "#f1f5f9",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "4px",
          padding: "4px 8px",
          fontSize: "0.85rem",
          outline: "none",
          cursor: "pointer",
        }}
      >
        <option style={{ background: "#1e1e24", color: "#f1f5f9" }} value="none">
          {t.uib_hotkey_none}
        </option>
        <option style={{ background: "#1e1e24", color: "#f1f5f9" }} value="alt">
          {t.uib_hotkey_alt}
        </option>
        <option style={{ background: "#1e1e24", color: "#f1f5f9" }} value="ctrl">
          {t.uib_hotkey_ctrl}
        </option>
        <option style={{ background: "#1e1e24", color: "#f1f5f9" }} value="shift">
          {t.uib_hotkey_shift}
        </option>
      </select>
    </div>
  );
}

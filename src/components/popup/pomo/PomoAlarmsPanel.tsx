import type { AlarmItem } from "@/infrastructure/services/PomodoroManagerService.js";

interface PomoAlarmsPanelProps {
  t: Record<string, string>;
  alarms: AlarmItem[];
  alarmInput: string;
  onAlarmInputChange: (val: string) => void;
  onAddAlarm: () => void;
  onToggleAlarm: (id: string, enabled: boolean) => void;
  onDeleteAlarm: (id: string) => void;
}

export function PomoAlarmsPanel({
  t,
  alarms,
  alarmInput,
  onAlarmInputChange,
  onAddAlarm,
  onToggleAlarm,
  onDeleteAlarm,
}: PomoAlarmsPanelProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--card-border)",
        borderRadius: "16px",
        padding: "12px",
      }}
    >
      <span
        style={{
          fontSize: "0.65rem",
          color: "var(--text-secondary)",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {t.pomo_alarms}
      </span>

      {/* Quick entry form */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          alignItems: "center",
          width: "100%",
        }}
      >
        <input
          type="time"
          className="mini-alarm-input"
          style={{ flex: 1 }}
          value={alarmInput}
          onInput={(e) =>
            onAlarmInputChange((e.target as HTMLInputElement).value)
          }
        />
        <button
          className="popup-alarm-add-btn"
          onClick={onAddAlarm}
          title={t.pomo_alarms}
        >
          +
        </button>
      </div>

      {/* Alarms scroll list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          maxHeight: "120px",
          overflowY: "auto",
          paddingRight: "2px",
        }}
      >
        {alarms.length === 0 ? (
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--text-secondary)",
              textAlign: "center",
              padding: "10px 0",
            }}
          >
            {t.pomo_tab_alarms === "Alarms"
              ? "No alarms set"
              : "Kurulu alarm yok"}
          </div>
        ) : (
          alarms.map((alarm) => (
            <div
              key={alarm.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 10px",
                background: "rgba(255,255,255,0.01)",
                border: "1px solid var(--card-border)",
                borderRadius: "10px",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: alarm.enabled ? "white" : "var(--text-secondary)",
                }}
              >
                {alarm.time}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <label className="popup-switch">
                  <input
                    type="checkbox"
                    checked={alarm.enabled}
                    onChange={(e) =>
                      onToggleAlarm(
                        alarm.id,
                        (e.target as HTMLInputElement).checked,
                      )
                    }
                  />
                  <span className="popup-slider"></span>
                </label>
                <button
                  className="popup-alarm-delete-btn"
                  onClick={() => onDeleteAlarm(alarm.id)}
                  title={t.delete || "Sil"}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

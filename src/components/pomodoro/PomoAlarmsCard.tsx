/**
 * PomoAlarmsCard.tsx
 * Pomodoro yan panel alarm listesi kartı (telefon stili alarm satırları).
 */

import { AlarmItem } from "@/infrastructure/services/PomodoroManagerService.js";

interface PomoAlarmsCardProps {
  title: string;
  noAlarmsText: string;
  alarms: AlarmItem[];
  alarmInput: string;
  onAlarmInput: (val: string) => void;
  onAddAlarm: () => void;
  onToggleAlarm: (id: string, enabled: boolean) => void;
  onDeleteAlarm: (id: string) => void;
}

export function PomoAlarmsCard({
  title,
  noAlarmsText,
  alarms,
  alarmInput,
  onAlarmInput,
  onAddAlarm,
  onToggleAlarm,
  onDeleteAlarm,
}: PomoAlarmsCardProps) {
  return (
    <div
      className="mini-tool-card"
      id="alarm-mini"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        minHeight: "260px",
      }}
    >
      <div className="mini-tool-header">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span>{title}</span>
      </div>

      <div style={{ display: "flex", gap: "8px", width: "100%" }}>
        <input
          type="time"
          className="mini-alarm-input"
          style={{ flex: 1 }}
          value={alarmInput}
          onInput={(e) => onAlarmInput((e.target as HTMLInputElement).value)}
        />
        <button
          className="newtab-alarm-add-btn"
          onClick={onAddAlarm}
          title={title}
        >
          +
        </button>
      </div>

      <div
        className="alarms-list-container"
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxHeight: "180px",
          paddingRight: "4px",
        }}
      >
        {alarms.length === 0 ? (
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              textAlign: "center",
              marginTop: "1rem",
            }}
          >
            {noAlarmsText}
          </div>
        ) : (
          alarms.map((alarm) => (
            <div
              key={alarm.id}
              className="alarm-row-item"
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--card-border)",
                borderRadius: "12px",
                padding: "8px 12px",
                gap: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "700",
                  color: alarm.enabled
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                  flex: 1,
                }}
              >
                {alarm.time}
              </span>

              <label
                className="switch"
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: "34px",
                  height: "20px",
                  flexShrink: 0,
                }}
              >
                <input
                  type="checkbox"
                  checked={alarm.enabled}
                  onChange={(e) =>
                    onToggleAlarm(
                      alarm.id,
                      (e.target as HTMLInputElement).checked,
                    )
                  }
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  className="slider round"
                  style={{
                    position: "absolute",
                    cursor: "pointer",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: alarm.enabled
                      ? "var(--accent-color)"
                      : "rgba(255,255,255,0.1)",
                    transition: ".3s",
                    borderRadius: "34px",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      content: '""',
                      height: "14px",
                      width: "14px",
                      left: alarm.enabled ? "16px" : "3px",
                      bottom: "3px",
                      backgroundColor: "white",
                      transition: ".3s",
                      borderRadius: "50%",
                    }}
                  ></span>
                </span>
              </label>

              <button
                onClick={() => onDeleteAlarm(alarm.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px",
                  flexShrink: 0,
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.color = "var(--danger)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.color = "var(--text-secondary)")
                }
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

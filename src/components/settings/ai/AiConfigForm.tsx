interface AiConfigFormProps {
  t: Record<string, string>;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
  showKey: boolean;
  models: string[];
  filterText: string;
  filteredModels: string[];
  groupedModels: Record<string, { id: string; name: string }[]>;
  loadingModels: boolean;
  modelError: string;
  onToggleKey: () => void;
  onFilterChange: (v: string) => void;
  onConfigChange: (
    provider: string,
    key: string,
    model: string,
    endpoint?: string,
  ) => void;
  onFetchModels: () => void;
}

export function AiConfigForm({
  t,
  aiApiKey,
  aiModel,
  aiEndpoint,
  showKey,
  models,
  filterText,
  filteredModels,
  groupedModels,
  loadingModels,
  modelError,
  onToggleKey,
  onFilterChange,
  onConfigChange,
  onFetchModels,
}: AiConfigFormProps) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <label
          style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            fontWeight: 500,
          }}
        >
          {t.settings_ai_provider}:
        </label>
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: "600",
            color: "var(--accent-color)",
          }}
        >
          9Router Proxy (OpenAI Uyumlu)
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label
          style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            fontWeight: 500,
          }}
        >
          {t.settings_ai_key}:
        </label>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <input
            type={showKey ? "text" : "password"}
            value={aiApiKey}
            placeholder="9Router API Key (Örn: sk-72l... veya bos bırakın)"
            onInput={(e) =>
              onConfigChange(
                "openrouter",
                (e.target as HTMLInputElement).value,
                aiModel,
                aiEndpoint,
              )
            }
            style={{
              background: "rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "6px",
              padding: "8px 40px 8px 12px",
              color: "#f1f5f9",
              fontSize: "0.85rem",
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
          <button
            type="button"
            onClick={onToggleKey}
            style={{
              position: "absolute",
              right: "10px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              padding: "4px",
              opacity: 0.7,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.opacity = "0.7")
            }
            title={showKey ? t.settings_ai_hide : t.settings_ai_show}
          >
            {showKey ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label
          style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            fontWeight: 500,
          }}
        >
          {t.settings_ai_endpoint}
        </label>
        <input
          type="text"
          value={aiEndpoint}
          placeholder="http://localhost:20128/v1"
          onInput={(e) =>
            onConfigChange(
              "openrouter",
              aiApiKey,
              aiModel,
              (e.target as HTMLInputElement).value,
            )
          }
          style={{
            background: "rgba(0, 0, 0, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "6px",
            padding: "8px 12px",
            color: "#f1f5f9",
            fontSize: "0.85rem",
            outline: "none",
          }}
        />
        <span
          style={{
            fontSize: "0.72rem",
            color: "var(--text-secondary)",
            opacity: 0.6,
          }}
        >
          {t.settings_ai_endpoint_desc}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <label
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            {t.settings_ai_select_model}
          </label>
          <button
            type="button"
            onClick={onFetchModels}
            disabled={loadingModels}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "4px",
              padding: "2px 8px",
              color: "var(--accent-color)",
              fontSize: "0.72rem",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {loadingModels ? t.settings_ai_loading : t.settings_ai_fetch_models}
          </button>
        </div>

        {models.length > 0 && (
          <input
            type="text"
            value={filterText}
            placeholder={t.settings_ai_search_model}
            onInput={(e) =>
              onFilterChange((e.target as HTMLInputElement).value)
            }
            style={{
              background: "rgba(0, 0, 0, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "6px",
              padding: "6px 10px",
              color: "#f1f5f9",
              fontSize: "0.8rem",
              outline: "none",
              marginBottom: "4px",
            }}
          />
        )}

        {models.length > 0 ? (
          <select
            value={models.includes(aiModel) ? aiModel : ""}
            onChange={(e) => {
              const val = (e.target as HTMLSelectElement).value;
              if (val) {
                onConfigChange("openrouter", aiApiKey, val, aiEndpoint);
              }
            }}
            style={{
              background: "rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "6px",
              padding: "8px 12px",
              color: "#f1f5f9",
              fontSize: "0.85rem",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">
              -- {t.settings_ai_select_model_placeholder} --
            </option>
            {Object.keys(groupedModels).map((provider) => (
              <optgroup
                key={provider}
                label={provider}
                style={{
                  background: "#1e1e2e",
                  color: "var(--accent-color)",
                }}
              >
                {groupedModels[provider].map((m) => (
                  <option key={m.id} value={m.id} style={{ color: "#f1f5f9" }}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        ) : (
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              fontStyle: "italic",
              opacity: 0.7,
            }}
          >
            {modelError || t.settings_ai_models_auto_list}
          </span>
        )}

        <label
          style={{
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            fontWeight: 500,
            marginTop: "6px",
          }}
        >
          {t.settings_ai_active_id}
        </label>
        <input
          type="text"
          value={aiModel}
          placeholder="free"
          onInput={(e) =>
            onConfigChange(
              "openrouter",
              aiApiKey,
              (e.target as HTMLInputElement).value,
              aiEndpoint,
            )
          }
          style={{
            background: "rgba(0, 0, 0, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "6px",
            padding: "8px 12px",
            color: "#f1f5f9",
            fontSize: "0.85rem",
            outline: "none",
          }}
        />
        <span
          style={{
            fontSize: "0.72rem",
            color: "var(--text-secondary)",
            opacity: 0.6,
          }}
        >
          {t.settings_ai_active_id_desc}
        </span>
      </div>
    </>
  );
}

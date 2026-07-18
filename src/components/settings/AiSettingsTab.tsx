import { Language } from "@/types/types.js";

interface AiSettingsTabProps {
  t: any;
  lang: Language;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
  onUpdateAIConfig: (provider: string, key: string, model: string, endpoint?: string) => void;
}

export function AiSettingsTab({
  t,
  lang,
  aiApiKey,
  aiModel,
  aiEndpoint,
  onUpdateAIConfig,
}: AiSettingsTabProps) {
  return (
    <div className="settings-group">
      <h3>{t.settings_ai_title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>{t.settings_ai_provider}:</label>
          <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--accent-color)" }}>9Router Proxy (OpenAI Uyumlu)</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>{t.settings_ai_key}:</label>
          <input
            type="password"
            value={aiApiKey}
            placeholder="9Router API Key (Örn: sk-72l... veya bos bırakın)"
            onInput={(e) => onUpdateAIConfig("openrouter", (e.target as HTMLInputElement).value, aiModel, aiEndpoint)}
            style={{
              background: "rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "6px",
              padding: "8px 12px",
              color: "#f1f5f9",
              fontSize: "0.85rem",
              outline: "none"
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            {lang === "tr" ? "Özel API Adresi (Endpoint URL):" : "Custom API Endpoint URL:"}
          </label>
          <input
            type="text"
            value={aiEndpoint}
            placeholder="http://localhost:20128/v1"
            onInput={(e) => onUpdateAIConfig("openrouter", aiApiKey, aiModel, (e.target as HTMLInputElement).value)}
            style={{
              background: "rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "6px",
              padding: "8px 12px",
              color: "#f1f5f9",
              fontSize: "0.85rem",
              outline: "none"
            }}
          />
          <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", opacity: 0.6 }}>
            {lang === "tr" 
              ? "Örn: http://localhost:20128/v1 (9Router varsayılan adresi)" 
              : "e.g. http://localhost:20128/v1 (9Router default address)"}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>{t.settings_ai_model}:</label>
          <input
            type="text"
            value={aiModel}
            placeholder="free"
            onInput={(e) => onUpdateAIConfig("openrouter", aiApiKey, (e.target as HTMLInputElement).value, aiEndpoint)}
            style={{
              background: "rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "6px",
              padding: "8px 12px",
              color: "#f1f5f9",
              fontSize: "0.85rem",
              outline: "none"
            }}
          />
          <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", opacity: 0.6 }}>
            {lang === "tr"
              ? "Kullanmak istediğiniz model ID'si (Örn: free, meta-llama/llama-3-8b-instruct:free)"
              : "Model ID you wish to use (e.g. free, meta-llama/llama-3-8b-instruct:free)"}
          </span>
        </div>
      </div>
    </div>
  );
}

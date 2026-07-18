import { useState, useEffect } from "preact/hooks";
import { Language } from "@/types/types.js";

interface AiSettingsTabProps {
  t: any;
  lang: Language;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
  onUpdateAIConfig: (provider: string, key: string, model: string, endpoint?: string) => void;
  aiShowThinking: boolean;
  onUpdateAIShowThinking: (val: boolean) => void;
}

export function AiSettingsTab({
  t,
  lang,
  aiApiKey,
  aiModel,
  aiEndpoint,
  onUpdateAIConfig,
  aiShowThinking,
  onUpdateAIShowThinking,
}: AiSettingsTabProps) {
  const [showKey, setShowKey] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelError, setModelError] = useState("");

  const fetchModels = async () => {
    setLoadingModels(true);
    setModelError("");
    try {
      const baseUrl = aiEndpoint && aiEndpoint.trim() 
        ? aiEndpoint.trim().replace(/\/$/, "") 
        : "https://openrouter.ai/api/v1";
      const url = `${baseUrl}/models`;
      const headers: Record<string, string> = {};
      if (aiApiKey && aiApiKey.trim()) {
        headers["Authorization"] = `Bearer ${aiApiKey}`;
      }
      
      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        const list = data.data.map((m: any) => m.id).sort();
        setModels(list);
      } else {
        throw new Error("Invalid format");
      }
    } catch (err: any) {
      console.error("Failed to fetch models:", err);
      setModelError(lang === "tr" ? "Modeller yüklenemedi." : "Failed to load models.");
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [aiEndpoint, aiApiKey]);

  const [filterText, setFilterText] = useState("");

  const filteredModels = models.filter((modelId) =>
    modelId.toLowerCase().includes(filterText.toLowerCase())
  );

  const prefixMap: Record<string, string> = {
    "oc": "OpenCode (OC)",
    "cx": "OpenAI Codex (CX)",
    "gc": "GitHub Copilot (GC)",
    "mc": "MiMo Code (MC)",
    "kc": "Kilo Code (KC)",
    "openrouter": "OpenRouter",
    "ollama": "Ollama",
    "gemini": "Google Gemini",
    "gcli": "Gemini CLI",
    "other": lang === "tr" ? "9Router Kombinasyonları (Combos)" : "9Router Combos",
    "Other": lang === "tr" ? "9Router Kombinasyonları (Combos)" : "9Router Combos"
  };

  const groupedModels: Record<string, { id: string; name: string }[]> = {};
  filteredModels.forEach((modelId) => {
    const parts = modelId.split("/");
    let provider = "Other";
    let name = modelId;
    if (parts.length > 1) {
      provider = parts[0];
      name = parts.slice(1).join("/");
    }
    const providerKey = provider.toLowerCase();
    const providerLabel = prefixMap[providerKey] || (provider.charAt(0).toUpperCase() + provider.slice(1));
    if (!groupedModels[providerLabel]) {
      groupedModels[providerLabel] = [];
    }
    groupedModels[providerLabel].push({ id: modelId, name });
  });

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
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input
              type={showKey ? "text" : "password"}
              value={aiApiKey}
              placeholder="9Router API Key (Örn: sk-72l... veya bos bırakın)"
              onInput={(e) => onUpdateAIConfig("openrouter", (e.target as HTMLInputElement).value, aiModel, aiEndpoint)}
              style={{
                background: "rgba(0, 0, 0, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "6px",
                padding: "8px 40px 8px 12px",
                color: "#f1f5f9",
                fontSize: "0.85rem",
                outline: "none",
                width: "100%",
                boxSizing: "border-box"
              }}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
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
                transition: "opacity 0.2s"
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.7")}
              title={showKey ? (lang === "tr" ? "Gizle" : "Hide") : (lang === "tr" ? "Göster" : "Show")}
            >
              {showKey ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              {lang === "tr" ? "Model Seçin:" : "Select Model:"}
            </label>
            <button
              type="button"
              onClick={fetchModels}
              disabled={loadingModels}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "4px",
                padding: "2px 8px",
                color: "var(--accent-color)",
                fontSize: "0.72rem",
                cursor: "pointer",
                outline: "none"
              }}
            >
              {loadingModels 
                ? (lang === "tr" ? "Yükleniyor..." : "Loading...") 
                : (lang === "tr" ? "Modelleri Getir" : "Fetch Models")}
            </button>
          </div>

          {models.length > 0 && (
            <input
              type="text"
              value={filterText}
              placeholder={lang === "tr" ? "Model ara (Örn: deepseek)..." : "Search model (e.g. deepseek)..."}
              onInput={(e) => setFilterText((e.target as HTMLInputElement).value)}
              style={{
                background: "rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "6px",
                padding: "6px 10px",
                color: "#f1f5f9",
                fontSize: "0.8rem",
                outline: "none",
                marginBottom: "4px"
              }}
            />
          )}

          {models.length > 0 ? (
            <select
              value={models.includes(aiModel) ? aiModel : ""}
              onChange={(e) => {
                const val = (e.target as HTMLSelectElement).value;
                if (val) {
                  onUpdateAIConfig("openrouter", aiApiKey, val, aiEndpoint);
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
                cursor: "pointer"
              }}
            >
              <option value="">-- {lang === "tr" ? "Bir model seçin" : "Select a model"} --</option>
              {Object.keys(groupedModels).map((provider) => (
                <optgroup key={provider} label={provider} style={{ background: "#1e1e2e", color: "var(--accent-color)" }}>
                  {groupedModels[provider].map((m) => (
                    <option key={m.id} value={m.id} style={{ color: "#f1f5f9" }}>
                      {m.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          ) : (
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontStyle: "italic", opacity: 0.7 }}>
              {modelError || (lang === "tr" ? "Mevcut modeller otomatik listelenecektir." : "Available models will be listed automatically.")}
            </span>
          )}

          <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500, marginTop: "6px" }}>
            {lang === "tr" ? "Aktif / Özel Model Kimliği:" : "Active / Custom Model ID:"}
          </label>
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
              ? "Üstteki listeden model seçebilir veya buraya manuel olarak tam model ID'si yazabilirsiniz."
              : "You can select from the list above or manually type the full model ID here."}
          </span>
        </div>

        {/* Toggle Show Thinking Process */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            {lang === "tr" ? "Düşünme Sürecini (Thinking) Göster:" : "Show Thinking Process:"}
          </label>
          <button
            type="button"
            onClick={() => onUpdateAIShowThinking(!aiShowThinking)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              color: aiShowThinking ? "var(--accent-color)" : "var(--text-secondary)",
              fontSize: "0.85rem",
              padding: "4px 8px"
            }}
          >
            {aiShowThinking ? t.enabled : t.disabled}
          </button>
        </div>
      </div>
    </div>
  );
}

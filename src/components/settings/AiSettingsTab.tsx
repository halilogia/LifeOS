import { useState, useEffect } from "preact/hooks";
import { logger } from "@/utils/logger.js";

interface AiSettingsTabProps {
  t: Record<string, string>;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
  onUpdateAIConfig: (
    provider: string,
    key: string,
    model: string,
    endpoint?: string,
  ) => void;
  aiShowThinking: boolean;
  onUpdateAIShowThinking: (val: boolean) => void;
}

export function AiSettingsTab({
  t,
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
  const [userMemory, setUserMemory] = useState("");
  const [memorySavedSuccess, setMemorySavedSuccess] = useState(false);

  useEffect(() => {
    const loadMemory = () => {
      chrome.storage.sync.get(
        ["aiUserMemory"],
        (syncRes: Record<string, any>) => {
          if (syncRes && typeof syncRes.aiUserMemory === "string") {
            setUserMemory(syncRes.aiUserMemory);
          } else {
            const defaultMemory = `# Kişisel Hafıza & Kullanıcı Bağlamı (memory.md)\n\n- **İsim**: Halil Emre\n- **Rol / İlgiler**: Yazılım Geliştirme, Borsa İstanbul (BİST) ve Kişisel Verimlilik.\n- **AI İletişim Tercihi**: Sade, net, Türkçe, doğrudan sonuca odaklanan ifadeler.\n- **Kişisel Hedefler**: Günlük iş akışını ve yatırım takip alışkanlıklarını disiplinli yönetmek.`;
            setUserMemory(defaultMemory);
          }
        },
      );
    };

    loadMemory();

    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (
        areaName === "sync" &&
        changes.aiUserMemory &&
        typeof changes.aiUserMemory.newValue === "string"
      ) {
        setUserMemory(changes.aiUserMemory.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const handleSaveMemory = () => {
    chrome.storage.sync.set({ aiUserMemory: userMemory }, () => {
      setMemorySavedSuccess(true);
      setTimeout(() => setMemorySavedSuccess(false), 2500);
    });
  };

  const fetchModels = async () => {
    setLoadingModels(true);
    setModelError("");
    try {
      const baseUrl =
        aiEndpoint && aiEndpoint.trim()
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
        const list = (data.data as { id: string }[])
          .map((m: { id: string }) => m.id)
          .sort();
        setModels(list);
      } else {
        throw new Error("Invalid format");
      }
    } catch (err: unknown) {
      logger.error("Failed to fetch models:", err);
      setModelError(t.settings_ai_failed_models);
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [aiEndpoint, aiApiKey]);

  const [filterText, setFilterText] = useState("");

  const filteredModels = models.filter((modelId) =>
    modelId.toLowerCase().includes(filterText.toLowerCase()),
  );

  const prefixMap: Record<string, string> = {
    oc: "OpenCode (OC)",
    cx: "OpenAI Codex (CX)",
    gc: "GitHub Copilot (GC)",
    mc: "MiMo Code (MC)",
    kc: "Kilo Code (KC)",
    openrouter: "OpenRouter",
    ollama: "Ollama",
    gemini: "Google Gemini",
    gcli: "Gemini CLI",
    other: t.settings_ai_combos,
    Other: t.settings_ai_combos,
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
    const providerLabel =
      prefixMap[providerKey] ||
      provider.charAt(0).toUpperCase() + provider.slice(1);
    if (!groupedModels[providerLabel]) {
      groupedModels[providerLabel] = [];
    }
    groupedModels[providerLabel].push({ id: modelId, name });
  });

  return (
    <div className="settings-group">
      <h3>{t.settings_ai_title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                onUpdateAIConfig(
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
              onUpdateAIConfig(
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
                outline: "none",
              }}
            >
              {loadingModels
                ? t.settings_ai_loading
                : t.settings_ai_fetch_models}
            </button>
          </div>

          {models.length > 0 && (
            <input
              type="text"
              value={filterText}
              placeholder={t.settings_ai_search_model}
              onInput={(e) =>
                setFilterText((e.target as HTMLInputElement).value)
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
                    <option
                      key={m.id}
                      value={m.id}
                      style={{ color: "#f1f5f9" }}
                    >
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
              onUpdateAIConfig(
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

        {/* Toggle Show Thinking Process */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "8px",
            paddingTop: "8px",
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <label
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            {t.settings_ai_show_thinking}
          </label>
          <button
            type="button"
            onClick={() => onUpdateAIShowThinking(!aiShowThinking)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              color: aiShowThinking
                ? "var(--accent-color)"
                : "var(--text-secondary)",
              fontSize: "0.85rem",
              padding: "4px 8px",
            }}
          >
            {aiShowThinking ? t.enabled : t.disabled}
          </button>
        </div>

        {/* 🧠 Kişisel Hafıza & Kullanıcı Bağlamı (memory.md) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginTop: "16px",
            paddingTop: "14px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <label
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#f8fafc",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a78bfa"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>Kişisel AI Hafızası (memory.md)</span>
            </label>
            {memorySavedSuccess && (
              <span
                style={{
                  fontSize: "0.75rem",
                  background: "rgba(52, 211, 153, 0.15)",
                  border: "1px solid rgba(52, 211, 153, 0.4)",
                  color: "#34d399",
                  padding: "3px 10px",
                  borderRadius: "12px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                ✓ Hafıza Kaydedildi!
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              lineHeight: 1.4,
            }}
          >
            Yapay zeka asistanınızın sizi her sohbet seansında tanıması, kişisel
            tercihlerinizi, mesleğinizi ve hedeflerinizi hatırlaması için bu
            alana özel notlarınızı yazabilirsiniz.
          </span>
          <textarea
            value={userMemory}
            onInput={(e) =>
              setUserMemory((e.target as HTMLTextAreaElement).value)
            }
            rows={7}
            style={{
              width: "100%",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              borderRadius: "10px",
              padding: "10px 12px",
              color: "#f1f5f9",
              fontSize: "0.82rem",
              fontFamily: "Fira Code, monospace",
              lineHeight: 1.5,
              outline: "none",
              resize: "vertical",
            }}
            placeholder="# Kişisel Hafıza notlarınızı buraya yazın..."
          />
          <button
            type="button"
            onClick={handleSaveMemory}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "9px 18px",
              fontSize: "0.82rem",
              fontWeight: 600,
              borderRadius: "8px",
              color: "#ffffff",
              background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              width: "100%",
              marginTop: "4px",
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>Kişisel Hafızayı Kaydet (memory.md)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

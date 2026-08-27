import { useState, useEffect } from "preact/hooks";
import { logger } from "@/utils/logger.js";
import { AiConfigForm } from "@/components/settings/ai/AiConfigForm.js";
import { AiThinkingToggle } from "@/components/settings/ai/AiThinkingToggle.js";
import { AiMemoryEditor } from "@/components/settings/ai/AiMemoryEditor.js";
import { useAiUserMemory } from "@/presentation/hooks/useAiUserMemory.js";
import { fetchAvailableModels } from "@/services/aichat/modelFetcher.js";
import { SettingsSection } from "@/components/settings/SettingsSection.js";

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
  autoGroupTabsEnabled?: boolean;
  onToggleAutoGroupTabs?: () => void;
}

export function AiSettingsTab({
  t,
  aiApiKey,
  aiModel,
  aiEndpoint,
  onUpdateAIConfig,
  aiShowThinking,
  onUpdateAIShowThinking,
  autoGroupTabsEnabled = true,
  onToggleAutoGroupTabs,
}: AiSettingsTabProps) {
  const [showKey, setShowKey] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelError, setModelError] = useState("");
  const [memorySavedSuccess, setMemorySavedSuccess] = useState(false);

  const { userMemory, setUserMemory, saveMemory } = useAiUserMemory();

  const handleSaveMemory = () => {
    saveMemory(userMemory, () => {
      setMemorySavedSuccess(true);
      setTimeout(() => setMemorySavedSuccess(false), 2500);
    });
  };

  const fetchModels = async () => {
    setLoadingModels(true);
    setModelError("");
    try {
      const list = await fetchAvailableModels(aiEndpoint, aiApiKey);
      setModels(list);
    } catch (err: unknown) {
      logger.error("Failed to fetch models:", err);
      setModelError(t.settings_ai_failed_models);
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    void fetchModels();
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
      <SettingsSection title={t.settings_ai_title} />
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <AiConfigForm
          t={t}
          aiApiKey={aiApiKey}
          aiModel={aiModel}
          aiEndpoint={aiEndpoint}
          showKey={showKey}
          models={models}
          filterText={filterText}
          groupedModels={groupedModels}
          loadingModels={loadingModels}
          modelError={modelError}
          onToggleKey={() => setShowKey(!showKey)}
          onFilterChange={setFilterText}
          onConfigChange={onUpdateAIConfig}
          onFetchModels={() => void fetchModels()}
        />

        <AiThinkingToggle
          t={t}
          aiShowThinking={aiShowThinking}
          onToggle={() => onUpdateAIShowThinking(!aiShowThinking)}
        />

        {onToggleAutoGroupTabs && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "4px",
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
              {t.settings_auto_group_tabs}
            </label>
            <button
              type="button"
              onClick={onToggleAutoGroupTabs}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                color: autoGroupTabsEnabled
                  ? "var(--accent-color)"
                  : "var(--text-secondary)",
                fontSize: "0.85rem",
                padding: "4px 8px",
              }}
            >
              {autoGroupTabsEnabled ? t.enabled : t.disabled}
            </button>
          </div>
        )}

        <AiMemoryEditor
          t={t}
          userMemory={userMemory}
          memorySavedSuccess={memorySavedSuccess}
          onMemoryChange={setUserMemory}
          onSaveMemory={handleSaveMemory}
        />
      </div>
    </div>
  );
}

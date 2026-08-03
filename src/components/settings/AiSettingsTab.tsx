import { useState, useEffect } from "preact/hooks";
import { logger } from "@/utils/logger.js";
import { AiConfigForm } from "@/components/settings/ai/AiConfigForm.js";
import { AiThinkingToggle } from "@/components/settings/ai/AiThinkingToggle.js";
import { AiMemoryEditor } from "@/components/settings/ai/AiMemoryEditor.js";

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
      <h3>{t.settings_ai_title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <AiConfigForm
          t={t}
          aiApiKey={aiApiKey}
          aiModel={aiModel}
          aiEndpoint={aiEndpoint}
          showKey={showKey}
          models={models}
          filterText={filterText}
          filteredModels={filteredModels}
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

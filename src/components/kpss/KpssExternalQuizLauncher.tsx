/**
 * KpssExternalQuizLauncher.tsx
 * Harici AI servis seçim ekranı — Gemini, ChatGPT, Claude, Copilot kartları.
 * Soru sayısı seçici dahildir, prompt canlı olarak güncellenir.
 * Seçilen serviste KPSS quiz prompt'u hazır gönderilir ya da panoya kopyalanır.
 */

import { useState } from "preact/hooks";
import {
  ExternalAIService,
  buildKpssQuizPrompt,
  openExternalAIService,
} from "@/services/kpssExternalQuizService.js";
import { Language } from "@/types/types.js";

interface KpssExternalQuizLauncherProps {
  t: Record<string, string>;
  lang: Language;
  subjectKey: string;
  topicName: string;
  questionCount: number;
  onEnterResult: (count: number) => void;
  onBack: () => void;
}

interface ServiceDef {
  id: ExternalAIService;
  name: string;
  icon: preact.JSX.Element;
}

function GeminiIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gemini-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#4285f4" />
          <stop offset="100%" stop-color="#34a853" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 2 6 8 6 12s6 10 6 10 6-4 6-10S12 2 12 2z"
        fill="url(#gemini-grad)"
        opacity="0.9"
      />
      <path d="M12 2v20" stroke="white" stroke-width="1" opacity="0.3" />
      <path d="M2 12h20" stroke="white" stroke-width="1" opacity="0.3" />
    </svg>
  );
}

function ChatGPTIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="11" fill="#10a37f" />
      <path
        d="M7 9.5C7 8.12 8.12 7 9.5 7h5C15.88 7 17 8.12 17 9.5v2C17 12.88 15.88 14 14.5 14H13l-2.5 3V14H9.5C8.12 14 7 12.88 7 11.5v-2z"
        fill="white"
      />
    </svg>
  );
}

function ClaudeIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="11" fill="#d15b33" />
      <text
        x="12"
        y="16.5"
        text-anchor="middle"
        fill="white"
        font-size="12"
        font-weight="bold"
        font-family="serif"
      >
        C
      </text>
    </svg>
  );
}

function CopilotIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="11" fill="#0078d4" />
      <path
        d="M8 8h8v8H8V8z"
        fill="none"
        stroke="white"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <path
        d="M10 11h4M10 13h4"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
}

const SERVICES: ServiceDef[] = [
  { id: "gemini", name: "Gemini", icon: <GeminiIcon /> },
  { id: "chatgpt", name: "ChatGPT", icon: <ChatGPTIcon /> },
  { id: "claude", name: "Claude", icon: <ClaudeIcon /> },
  { id: "copilot", name: "Copilot", icon: <CopilotIcon /> },
];

const QUESTION_COUNTS = [5, 10, 15, 20, 25];

export function KpssExternalQuizLauncher({
  t,
  lang,
  subjectKey,
  topicName,
  questionCount,
  onEnterResult,
  onBack,
}: KpssExternalQuizLauncherProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<ExternalAIService | null>(null);
  const [selectedCount, setSelectedCount] = useState(questionCount);

  // Prompt, soru sayısı değiştikçe canlı güncellenir
  const prompt = buildKpssQuizPrompt(
    subjectKey,
    topicName,
    selectedCount,
    lang,
  );

  const handleServiceSelect = async (service: ExternalAIService) => {
    setIsLoading(service);
    try {
      await openExternalAIService(service, prompt);
      // Prompt her zaman panoya kopyalanır
      setToastMessage(t.kpss_external_quiz_clipboard_hint);
    } finally {
      setIsLoading(null);
    }
    setTimeout(() => setToastMessage(null), 6000);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setToastMessage(t.kpss_external_quiz_prompt_copied);
      setTimeout(() => setToastMessage(null), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <div class="kpss-external-launcher">
      <p class="kpss-external-launcher__title">{t.kpss_external_quiz_title}</p>
      <p class="kpss-external-launcher__desc">{t.kpss_external_quiz_desc}</p>

      {/* Soru sayısı seçici */}
      <div class="kpss-question-count-grid">
        {QUESTION_COUNTS.map((count) => (
          <button
            key={count}
            class={`kpss-qcount-btn ${selectedCount === count ? "active" : ""}`}
            onClick={() => setSelectedCount(count)}
          >
            {count} {t.kpss_quiz_questions}
          </button>
        ))}
      </div>

      {/* Servis kartları */}
      <div class="kpss-external-service-grid">
        {SERVICES.map((svc) => (
          <button
            key={svc.id}
            class="kpss-external-service-card"
            data-service={svc.id}
            disabled={isLoading !== null}
            onClick={() => handleServiceSelect(svc.id)}
          >
            <div class="kpss-external-service-card__icon">{svc.icon}</div>
            <span class="kpss-external-service-card__name">
              {isLoading === svc.id ? "..." : svc.name}
            </span>
          </button>
        ))}
      </div>

      {/* Prompt önizleme + kopyalama */}
      <div>
        <div class="kpss-external-prompt-preview">{prompt}</div>
        <button
          class="kpss-external-open-btn"
          style={{ marginTop: "8px" }}
          onClick={handleCopyPrompt}
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
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {t.kpss_external_quiz_copy_prompt}
        </button>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div class="kpss-external-toast kpss-external-toast--success">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Alt aksiyonlar */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button class="kpss-qcount-btn" style={{ flex: 1 }} onClick={onBack}>
          {t.kpss_external_quiz_back}
        </button>
        <button
          class="settings-add-btn"
          style={{ flex: 2, padding: "0 16px" }}
          onClick={() => onEnterResult(selectedCount)}
        >
          {t.kpss_external_quiz_enter_result}
        </button>
      </div>
    </div>
  );
}

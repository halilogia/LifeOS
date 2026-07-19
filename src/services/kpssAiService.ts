import { getKpssSystemPrompt } from "./kpssPrompts.js";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  solution: string;
  chart?: {
    type: "bar" | "line" | "geometry";
    title?: string;
    labels?: string[];
    values?: (number | string)[];
    shape?: "triangle" | "circle" | "parallel_lines";
    angles?: Record<string, string>;
    sides?: Record<string, string>;
  };
  map?: {
    highlightRegions?: string[];
    markers?: Array<{ x: number; y: number; label: string }>;
  };
}

import { Language } from "@/types/types.js";

export interface KpssAiConfig {
  aiProvider: string;
  aiModel: string;
  aiApiKey: string;
  aiEndpoint: string;
  lang: Language;
  SUBJECT_NAMES: Record<string, Record<string, string>>;
}

export const fetchQuestionsSubsetFromAI = async (
  subjectKey: string,
  topicName: string,
  count: number,
  config: KpssAiConfig,
  excludeQuestions: QuizQuestion[] = [],
  fewShotExamples: QuizQuestion[] = []
): Promise<QuizQuestion[]> => {
  const { aiProvider, aiModel, aiApiKey, aiEndpoint, lang, SUBJECT_NAMES } = config;
  const tStart = performance.now();
  console.log(`%c[AI Fetch - Start] Requesting ${count} questions for "${topicName}"`, "color: #a78bfa; font-weight: bold;");

  const subjectName = SUBJECT_NAMES[lang][subjectKey] || subjectKey;
  const systemPrompt = getKpssSystemPrompt(subjectKey, lang, fewShotExamples);

  let userPrompt = `${subjectName} dersinin '${topicName}' konusu hakkında tam ${count} adet soru içeren zorlayıcı bir KPSS seviye tespit testi oluştur.`;
  if (excludeQuestions.length > 0) {
    userPrompt += ` Üreteceğin sorular şu sorulardan tamamen farklı olmalıdır: ${JSON.stringify(excludeQuestions.map(q => q.question))}`;
  }

  let responseText = "";
  const tNetworkStart = performance.now();

  if (aiProvider === "ollama") {
    const baseUrl = aiEndpoint && aiEndpoint.trim() ? aiEndpoint.trim().replace(/\/$/, "") : "http://localhost:11434";
    const url = baseUrl.includes("/v1") ? `${baseUrl}/chat/completions` : `${baseUrl}/v1/chat/completions`;
    const modelName = aiModel || "llama3";
    const payload = {
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      stream: false,
      options: {
        temperature: 0.2
      }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const tNetworkEnd = performance.now();
    console.log(`[AI Fetch - Network] Ollama HTTP status ${res.status} in ${Math.round(tNetworkEnd - tNetworkStart)} ms`);

    if (!res.ok) {
      let errBody = "";
      try {
        errBody = await res.text();
      } catch (_) {}
      throw new Error(`HTTP error! status: ${res.status}: ${errBody || res.statusText}`);
    }

    const tReadStart = performance.now();
    const data = await res.json();
    const tReadEnd = performance.now();
    console.log(`[AI Fetch - Parse JSON Payload] Read body in ${Math.round(tReadEnd - tReadStart)} ms`);
    responseText = data.choices?.[0]?.message?.content || "";
  } else if (aiProvider === "openrouter") {
    const baseUrl = aiEndpoint && aiEndpoint.trim() ? aiEndpoint.trim().replace(/\/$/, "") : "https://openrouter.ai/api/v1";
    const url = `${baseUrl}/chat/completions`;
    const modelName = aiModel || "google/gemini-2.5-flash";
    const isLocal = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (aiApiKey && aiApiKey.trim()) {
      headers["Authorization"] = `Bearer ${aiApiKey}`;
    }

    if (!isLocal) {
      headers["HTTP-Referer"] = "https://github.com/halilogia/chrome-extension-todo";
      headers["X-Title"] = "ZenTodo Life OS Dashboard";
    }

    const payload = {
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      stream: false,
      temperature: 0.2
    };

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const tNetworkEnd = performance.now();
    console.log(`[AI Fetch - Network] 9Router/OpenRouter HTTP status ${res.status} in ${Math.round(tNetworkEnd - tNetworkStart)} ms`);

    if (!res.ok) {
      let errBody = "";
      try {
        errBody = await res.text();
      } catch (_) {}
      throw new Error(`HTTP error! status: ${res.status}: ${errBody || res.statusText}`);
    }

    const tReadStart = performance.now();
    const data = await res.json();
    const tReadEnd = performance.now();
    console.log(`[AI Fetch - Parse JSON Payload] Read body in ${Math.round(tReadEnd - tReadStart)} ms`);
    responseText = data.choices?.[0]?.message?.content || "";
  } else {
    // Gemini provider (default)
    const modelName = aiModel || "gemini-1.5-flash";
    const baseUrl = aiEndpoint && aiEndpoint.trim() ? aiEndpoint.trim().replace(/\/$/, "") : "https://generativelanguage.googleapis.com/v1beta";
    const url = `${baseUrl}/models/${modelName}:generateContent?key=${aiApiKey}`;
    const payload = {
      contents: [{
        parts: [{
          text: systemPrompt + "\n\n" + userPrompt
        }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const tNetworkEnd = performance.now();
    console.log(`[AI Fetch - Network] Gemini API HTTP status ${res.status} in ${Math.round(tNetworkEnd - tNetworkStart)} ms`);

    if (!res.ok) {
      let errBody = "";
      try {
        errBody = await res.text();
      } catch (_) {}
      throw new Error(`HTTP error! status: ${res.status}: ${errBody || res.statusText}`);
    }

    const tReadStart = performance.now();
    const data = await res.json();
    const tReadEnd = performance.now();
    console.log(`[AI Fetch - Parse JSON Payload] Read body in ${Math.round(tReadEnd - tReadStart)} ms`);
    responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  const tCleanStart = performance.now();
  let cleaned = responseText.trim();
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  cleaned = cleaned
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");

  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  
  let isObject = false;
  let startIdx = -1;
  
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    isObject = true;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    isObject = false;
  }
  
  if (startIdx !== -1) {
    const openChar = isObject ? "{" : "[";
    const closeChar = isObject ? "}" : "]";
    
    let braceCount = 0;
    let endIdx = -1;
    let inString = false;
    let escape = false;
    
    for (let i = startIdx; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === "\\") {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === openChar) {
          braceCount++;
        } else if (char === closeChar) {
          braceCount--;
          if (braceCount === 0) {
            endIdx = i;
            break;
          }
        }
      }
    }
    
    if (endIdx !== -1) {
      cleaned = cleaned.substring(startIdx, endIdx + 1);
    }
  }
  
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (firstErr) {
    try {
      const patched = cleaned
        .replace(/,\s*([\]}])/g, "$1")
        .replace(/(["\d])\s*\n\s*"/g, '$1,\n"');
      parsed = JSON.parse(patched);
    } catch (secErr) {
      console.warn("[KpssView JSON parse Fallback] Failed twice. Substring was:", cleaned);
      parsed = [];
    }
  }
  if (!Array.isArray(parsed) && typeof parsed === "object") {
    const keys = Object.keys(parsed);
    if (keys.length > 0 && Array.isArray(parsed[keys[0]])) {
      parsed = parsed[keys[0]];
    } else {
      throw new Error("Invalid JSON structure returned by AI.");
    }
  }

  const tCleanEnd = performance.now();
  console.log(`[AI Fetch - Clean & Parse] Extract JSON in ${Math.round(tCleanEnd - tCleanStart)} ms`);

  const tTotal = performance.now() - tStart;
  console.log(`%c[AI Fetch - Complete] Successfully loaded ${count} questions in ${Math.round(tTotal)} ms`, "color: #10b981; font-weight: bold;");

  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed as QuizQuestion[];
  }
  return [];
};

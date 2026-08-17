/**
 * sidePanelSpeech.ts
 * Web Speech API recognition helper for side panel chat voice input.
 */

import type { Language } from "@/types/types.js";

export function startSpeechRecognition({
  lang,
  onStart,
  onResult,
  onErrorOrEnd,
}: {
  lang: Language;
  onStart: () => void;
  onResult: (transcript: string) => void;
  onErrorOrEnd: () => void;
}): void {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onErrorOrEnd();
    return;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = lang === "tr" ? "tr-TR" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      onStart();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      onErrorOrEnd();
    };

    recognition.onerror = () => {
      onErrorOrEnd();
    };

    recognition.onend = () => {
      onErrorOrEnd();
    };

    recognition.start();
  } catch {
    onErrorOrEnd();
  }
}

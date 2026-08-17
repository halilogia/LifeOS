/**
 * useVoiceInput.ts
 * Ses tanıma girişi — toggleVoiceInput, isListening, transcript işleme.
 * Alt-hook — tuval (useSidePanelChat.ts) orkestrasyonu yapar.
 */

import { useState } from "preact/hooks";
import { Language } from "@/types/types.js";
import { startSpeechRecognition } from "./sidePanelSpeech.js";

export function useVoiceInput(
  lang: Language,
  t: Record<string, string>,
  setInputText: (v: string) => void,
  getInputText: () => string,
) {
  const [isListening, setIsListening] = useState(false);

  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    startSpeechRecognition({
      lang,
      onStart: () => setIsListening(true),
      onResult: (transcript: string) => {
        const current = getInputText();
        setInputText(current ? `${current} ${transcript}` : transcript);
      },
      onErrorOrEnd: () => setIsListening(false),
    });
  };

  return {
    isListening,
    toggleVoiceInput,
  };
}

/**
 * dom.d.ts
 * Clean Architecture - Global Window interface augmentations.
 * Declares browser vendor-prefixed APIs and LifeOS custom window properties
 * so the codebase avoids `(window as any)` casts.
 */

interface Window {
  /** Safari / older WebKit-prefixed AudioContext constructor */
  webkitAudioContext: typeof AudioContext;

  /** Browser SpeechRecognition API (Chrome) */
  SpeechRecognition: {
    new (): SpeechRecognition;
  };
  /** Browser SpeechRecognition API (WebKit prefix) */
  webkitSpeechRecognition: {
    new (): SpeechRecognition;
  };
}

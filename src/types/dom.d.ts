/**
 * dom.d.ts
 * Clean Architecture - Global Window interface augmentations.
 * Declares browser vendor-prefixed APIs and LifeOS custom window properties
 * so the codebase avoids `(window as any)` casts.
 */

interface Window {
  /** Safari / older WebKit-prefixed AudioContext constructor */
  webkitAudioContext: typeof AudioContext;

  /** LifeOS: persisted AudioContext reference for tab-level volume boosting */
  _lifeosAudioCtx?: AudioContext;
  /** LifeOS: persisted GainNode for tab-level volume boosting */
  _lifeosGainNode?: GainNode;
  /** LifeOS: tracks which media elements are already connected */
  _lifeosConnectedMap?: WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>;

  /** LifeOS: interval timer for LoFi chord progression */
  lofiTimer?: ReturnType<typeof setInterval> | null;

  /** Browser SpeechRecognition API (Chrome) */
  SpeechRecognition: {
    new (): SpeechRecognition;
  };
  /** Browser SpeechRecognition API (WebKit prefix) */
  webkitSpeechRecognition: {
    new (): SpeechRecognition;
  };
}

/**
 * volumeBooster.ts
 * Tab-specific, CSP-compliant Web Audio API Volume Booster.
 * Clean Architecture - Content Script Module.
 * Safely applies volume gain without injecting inline script strings.
 */

let contentAudioCtx: AudioContext | null = null;
let contentGainNode: GainNode | null = null;
let currentMultiplier = 1.0;
const connectedMediaSet = new WeakSet<HTMLMediaElement>();

function getOrCreateContentAudioContext(): AudioContext | null {
  if (!contentAudioCtx) {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtxClass) {
      return null;
    }
    contentAudioCtx = new AudioCtxClass();
    contentGainNode = contentAudioCtx.createGain();
    contentGainNode.connect(contentAudioCtx.destination);
  }
  if (contentAudioCtx && contentAudioCtx.state === "suspended") {
    const resumeOnGesture = () => {
      if (contentAudioCtx && contentAudioCtx.state === "suspended") {
        contentAudioCtx.resume().catch(() => {});
      }
    };
    window.addEventListener("pointerdown", resumeOnGesture, { once: true });
    window.addEventListener("keydown", resumeOnGesture, { once: true });
  }
  return contentAudioCtx;
}

function attachContentGainToElement(el: HTMLMediaElement): void {
  if (!el || connectedMediaSet.has(el)) {
    return;
  }
  const ctx = getOrCreateContentAudioContext();
  if (!ctx || !contentGainNode) {
    return;
  }

  try {
    const source = ctx.createMediaElementSource(el);
    source.connect(contentGainNode);
    connectedMediaSet.add(el);
    // Apply the current multiplier immediately after connecting, otherwise
    // the element keeps playing at unity gain until the next setVolumeBoostLevel.
    contentGainNode.gain.setValueAtTime(currentMultiplier, ctx.currentTime);
  } catch {
    // createMediaElementSource throws InvalidStateError if the element is
    // already routed through another AudioContext (e.g. another booster).
    // Mark it so we stop retrying on every setVolumeBoostLevel.
    connectedMediaSet.add(el);
  }
}

export function setVolumeBoostLevel(boostMultiplier: number): void {
  currentMultiplier = Number(boostMultiplier) || 1.0;
  const ctx = getOrCreateContentAudioContext();

  const mediaEls = Array.from(
    document.querySelectorAll("video, audio"),
  ) as HTMLMediaElement[];

  mediaEls.forEach((el) => {
    attachContentGainToElement(el);
  });

  if (contentGainNode && ctx) {
    try {
      contentGainNode.gain.setValueAtTime(currentMultiplier, ctx.currentTime);
    } catch {
      // gain set can throw when context is closed — ignore
    }
  }
}

export function initVolumeBoosterListener(): void {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "set_volume_boost") {
      const level =
        typeof message.volumeLevel === "number" ? message.volumeLevel : 1.0;
      setVolumeBoostLevel(level);
      sendResponse({ success: true, volumeLevel: level });
      return true;
    }
  });

  // Attach listeners to media play events
  const handleMediaEvent = (e: Event) => {
    const target = e.target as HTMLMediaElement;
    if (target && (target.tagName === "VIDEO" || target.tagName === "AUDIO")) {
      attachContentGainToElement(target);
    }
  };

  document.addEventListener("play", handleMediaEvent, true);
  document.addEventListener("playing", handleMediaEvent, true);
  document.addEventListener("loadedmetadata", handleMediaEvent, true);
}

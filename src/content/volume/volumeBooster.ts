/**
 * volumeBooster.ts
 * Tab-specific, CSP-compliant Web Audio API Volume Booster.
 * Clean Architecture - Content Script Module.
 * Safely applies volume gain without injecting inline script strings.
 *
 * Chrome Autoplay Policy fix:
 * AudioContext MUST NOT be created before a user gesture on the page,
 * otherwise Chrome logs "The AudioContext was not allowed to start" and
 * the context stays suspended. Creation is deferred to the first real
 * gesture (pointerdown / keydown / play) and skipped entirely when the
 * boost multiplier is unity (1.0) — no graph, no warning, no waste.
 */

let contentAudioCtx: AudioContext | null = null;
let contentGainNode: GainNode | null = null;
let currentMultiplier = 1.0;
let gestureSeen = false;
const connectedMediaSet = new WeakSet<HTMLMediaElement>();

function createContentAudioContext(): AudioContext | null {
  if (contentAudioCtx) {
    return contentAudioCtx;
  }
  const AudioCtxClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtxClass) {
    return null;
  }
  contentAudioCtx = new AudioCtxClass();
  contentGainNode = contentAudioCtx.createGain();
  contentGainNode.connect(contentAudioCtx.destination);
  return contentAudioCtx;
}

/**
 * Creates the AudioContext ONLY after a user gesture has been seen.
 * Called from gesture listeners and the media `play` event (which in
 * practice always follows a gesture). Returns null when deferred so the
 * warning never fires.
 */
function ensureContentAudioContext(): AudioContext | null {
  if (contentAudioCtx) {
    return contentAudioCtx;
  }
  if (!gestureSeen) {
    return null;
  }
  const ctx = createContentAudioContext();
  if (ctx) {
    // Connect any media elements that appeared before the gesture.
    const mediaEls = Array.from(
      document.querySelectorAll("video, audio"),
    ) as HTMLMediaElement[];
    mediaEls.forEach((el) => {
      attachContentGainToElement(el);
    });
  }
  return ctx;
}

function attachContentGainToElement(el: HTMLMediaElement): void {
  if (!el || connectedMediaSet.has(el)) {
    return;
  }
  const ctx = ensureContentAudioContext();
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

  // Unity boost = no graph needed. Avoid creating an AudioContext
  // (Chrome Autoplay Policy warning + unnecessary resource usage).
  if (currentMultiplier === 1.0) {
    return;
  }

  const ctx = ensureContentAudioContext();
  if (!ctx) {
    return; // deferred until user gesture; gain applies on gesture
  }

  const mediaEls = Array.from(
    document.querySelectorAll("video, audio"),
  ) as HTMLMediaElement[];

  mediaEls.forEach((el) => {
    attachContentGainToElement(el);
  });

  if (contentGainNode) {
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

  // Mark the first real user gesture; only then may the AudioContext be
  // created (Chrome Autoplay Policy). Also resume a suspended context.
  const markGesture = () => {
    gestureSeen = true;
    if (contentAudioCtx && contentAudioCtx.state === "suspended") {
      contentAudioCtx.resume().catch(() => {});
    }
    ensureContentAudioContext();
  };
  window.addEventListener("pointerdown", markGesture, { once: true });
  window.addEventListener("keydown", markGesture, { once: true });
  window.addEventListener("touchstart", markGesture, { once: true });
}

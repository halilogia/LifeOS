/**
 * volumeBooster.ts
 * Tab-specific, CSP-compliant Web Audio API Volume Booster.
 * Clean Architecture - Content Script Module.
 * Safely applies volume gain without injecting inline script strings.
 *
 * Supports single-page apps and live streaming platforms (Kick, Twitch, YouTube, Spotify Web, etc.)
 * by searching through standard DOM, open Shadow DOMs, observing dynamic DOM mutations,
 * and handling AudioContext lifecycle across SPA navigations.
 */

let contentAudioCtx: AudioContext | null = null;
let contentGainNode: GainNode | null = null;
let currentMultiplier = 1.0;
const connectedMediaSet = new WeakSet<HTMLMediaElement>();
let mutationObserver: MutationObserver | null = null;

/**
 * Chrome autoplay policy refuses to start an AudioContext that was created
 * without a user gesture, and logs
 * "The AudioContext was not allowed to start" at construction time.
 * Resuming afterwards cannot undo that warning, so we never construct the
 * context until the first real gesture and replay any pending boost then.
 */
let hasUserGesture = false;

/** Recursively discovers all media elements across normal DOM and Shadow Roots. */
function findMediaElementsInRoot(root: ParentNode): HTMLMediaElement[] {
  const elements: HTMLMediaElement[] = [];
  try {
    const mediaList = Array.from(
      root.querySelectorAll<HTMLMediaElement>("video, audio"),
    );
    elements.push(...mediaList);

    const allElements = Array.from(root.querySelectorAll("*"));
    for (const el of allElements) {
      if (el.shadowRoot) {
        elements.push(...findMediaElementsInRoot(el.shadowRoot));
      }
    }
  } catch {
    // Ignore DOM access limitations
  }
  return elements;
}

/** Obtains or creates the AudioContext and resumes it if suspended. */
function getOrCreateAudioContext(): AudioContext | null {
  // Never construct before a user gesture: Chrome would start it suspended
  // and emit the autoplay warning. Callers re-run applyMultiplierToAllMedia()
  // on the first gesture, so nothing is permanently missed.
  if (!hasUserGesture) {
    return null;
  }

  if (!contentAudioCtx) {
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
  }

  if (contentAudioCtx.state === "suspended") {
    contentAudioCtx.resume().catch(() => {});
  }

  return contentAudioCtx;
}

/** Attaches the Web Audio gain node pipeline to an individual HTMLMediaElement. */
function attachMediaElement(el: HTMLMediaElement): void {
  if (!el || connectedMediaSet.has(el)) {
    return;
  }

  const ctx = getOrCreateAudioContext();
  if (!ctx || !contentGainNode) {
    return;
  }

  try {
    const source = ctx.createMediaElementSource(el);
    source.connect(contentGainNode);
    connectedMediaSet.add(el);
    contentGainNode.gain.setValueAtTime(currentMultiplier, ctx.currentTime);
  } catch {
    // If element is already routed by another node or throws CORS/InvalidStateError,
    // mark in set so we don't retry repeatedly.
    connectedMediaSet.add(el);
  }
}

/** Routes every media element on the page through the gain node. */
function applyMultiplierToAllMedia(): void {
  // At 100% there is nothing to boost — skip entirely so we never pay the
  // cost (or the autoplay warning) of wiring up an AudioContext.
  if (currentMultiplier === 1.0) {
    return;
  }

  const ctx = getOrCreateAudioContext();
  if (!ctx || !contentGainNode) {
    return;
  }

  // Find all video and audio elements on page (including inside shadow roots)
  const allMedia = findMediaElementsInRoot(document);
  for (const mediaEl of allMedia) {
    attachMediaElement(mediaEl);
  }

  try {
    contentGainNode.gain.setValueAtTime(currentMultiplier, ctx.currentTime);
  } catch {
    // Context may be closing or unavailable
  }
}

/** Applies volume boost multiplier to all current media elements. */
export function setVolumeBoostLevel(boostMultiplier: number): void {
  currentMultiplier = Number(boostMultiplier) || 1.0;
  applyMultiplierToAllMedia();
}

/** Initializes listeners for messages, media events, DOM mutations, and gestures. */
export function initVolumeBoosterListener(): void {
  // Listen for boost messages from popup / background
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "set_volume_boost") {
      const level =
        typeof message.volumeLevel === "number" ? message.volumeLevel : 1.0;
      setVolumeBoostLevel(level);
      sendResponse({ success: true, volumeLevel: level });
      return true;
    }
  });

  // Attach listeners to media playback events
  const handleMediaEvent = (e: Event) => {
    // Skip when no boost is active (mirrors the MutationObserver guard) or when
    // we are still waiting for the first gesture, so a suspended AudioContext
    // is never constructed and playback is left untouched.
    if (currentMultiplier === 1.0 || !hasUserGesture) {
      return;
    }
    const target = e.target as HTMLMediaElement;
    if (target && (target.tagName === "VIDEO" || target.tagName === "AUDIO")) {
      attachMediaElement(target);
    }
  };

  document.addEventListener("play", handleMediaEvent, true);
  document.addEventListener("playing", handleMediaEvent, true);
  document.addEventListener("loadeddata", handleMediaEvent, true);
  document.addEventListener("loadedmetadata", handleMediaEvent, true);
  document.addEventListener("canplay", handleMediaEvent, true);

  // Resume suspended audio context on any user interaction with the page.
  // The first interaction additionally unlocks AudioContext creation and
  // replays a boost that was requested before the gesture (the popup sends
  // set_volume_boost as soon as it opens).
  const handleUserGesture = () => {
    if (!hasUserGesture) {
      hasUserGesture = true;
      applyMultiplierToAllMedia();
      return;
    }
    if (contentAudioCtx && contentAudioCtx.state === "suspended") {
      contentAudioCtx.resume().catch(() => {});
    }
  };

  window.addEventListener("pointerdown", handleUserGesture, { passive: true });
  window.addEventListener("click", handleUserGesture, { passive: true });
  window.addEventListener("keydown", handleUserGesture, { passive: true });
  window.addEventListener("touchstart", handleUserGesture, { passive: true });

  // MutationObserver: automatically detect SPA player mounts (e.g. Kick/Twitch channel switches)
  if (typeof MutationObserver !== "undefined" && !mutationObserver) {
    mutationObserver = new MutationObserver((mutations) => {
      if (currentMultiplier === 1.0 || !hasUserGesture) {
        return;
      }
      for (const mutation of mutations) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as Element;
              if (el.tagName === "VIDEO" || el.tagName === "AUDIO") {
                attachMediaElement(el as HTMLMediaElement);
              } else {
                const subMedia = findMediaElementsInRoot(el);
                for (const m of subMedia) {
                  attachMediaElement(m);
                }
              }
            }
          }
        }
      }
    });

    if (document.documentElement) {
      mutationObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    }
  }
}

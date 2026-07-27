/**
 * volumeBooster.ts
 * Tab-specific, CORS-free Web Audio API Volume Booster.
 * Clean Architecture - Content Script Module.
 * Connects GainNode to active media elements in main-world.
 */

function injectMainWorldVolumeBooster(): void {
  if (document.getElementById("lifeos-volume-booster-script")) return;

  const script = document.createElement("script");
  script.id = "lifeos-volume-booster-script";
  script.textContent = `
    (function() {
      if (window._lifeosVolumeBoosterInitialized) return;
      window._lifeosVolumeBoosterInitialized = true;

      let audioCtx = null;
      let gainNode = null;
      let currentBoostMultiplier = 1.0;
      const connectedElements = new WeakSet();

      function getOrCreateAudioContext() {
        if (!audioCtx) {
          const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtxClass) return null;
          audioCtx = new AudioCtxClass();
          gainNode = audioCtx.createGain();
          gainNode.connect(audioCtx.destination);
        }
        if (audioCtx && audioCtx.state === "suspended") {
          audioCtx.resume().catch(() => {});
        }
        return audioCtx;
      }

      function attachGainToElement(el) {
        if (!el || connectedElements.has(el)) return;
        const ctx = getOrCreateAudioContext();
        if (!ctx || !gainNode) return;

        try {
          const source = ctx.createMediaElementSource(el);
          source.connect(gainNode);
          connectedElements.add(el);
        } catch(e) {
          // If already connected or restricted, ignore
        }
      }

      function setBoostLevel(multiplier) {
        currentBoostMultiplier = multiplier;
        getOrCreateAudioContext();

        const mediaEls = document.querySelectorAll("video, audio");
        mediaEls.forEach(el => attachGainToElement(el));

        if (gainNode) {
          gainNode.gain.value = multiplier;
        }
      }

      window.addEventListener("message", (e) => {
        if (e && e.data && e.data.type === "LIFEOS_SET_VOLUME_BOOST") {
          setBoostLevel(e.data.volumeLevel);
        }
      });

      // Observe video play/timeupdate events to automatically connect new videos (e.g. YouTube video change)
      const handleMediaEvent = (e) => {
        const target = e.target;
        if (target && (target.tagName === "VIDEO" || target.tagName === "AUDIO")) {
          attachGainToElement(target);
          if (gainNode) {
            gainNode.gain.value = currentBoostMultiplier;
          }
        }
      };

      document.addEventListener("play", handleMediaEvent, true);
      document.addEventListener("playing", handleMediaEvent, true);
      document.addEventListener("loadedmetadata", handleMediaEvent, true);
    })();
  `;

  (document.head || document.documentElement).appendChild(script);
}

export function setVolumeBoostLevel(boostMultiplier: number): void {
  injectMainWorldVolumeBooster();
  window.postMessage({ type: "LIFEOS_SET_VOLUME_BOOST", volumeLevel: boostMultiplier }, "*");
}

export function initVolumeBoosterListener(): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectMainWorldVolumeBooster);
  } else {
    injectMainWorldVolumeBooster();
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "set_volume_boost") {
      const level = typeof message.volumeLevel === "number" ? message.volumeLevel : 1.0;
      setVolumeBoostLevel(level);
      sendResponse({ success: true, volumeLevel: level });
      return true;
    }
  });
}

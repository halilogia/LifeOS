/**
 * mediaAndTabHandler.ts
 * Clean Architecture - Background Domain Handler for Tab Audio Boosters and Offscreen Ambient Sound engine playback.
 */

async function ensureOffscreenDocument(): Promise<void> {
  try {
    const hasDoc = await chrome.offscreen.hasDocument();
    if (!hasDoc) {
      await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
        justification: "Play persistent Pomodoro ambient background sounds",
      });
    }
  } catch {
    // Ignore error if offscreen document is already created
  }
}

/**
 * Handles runtime audio and tab media booster messages.
 * Returns true if message was handled asynchronously.
 */
export function handleMediaAndTabMessage(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void,
): boolean {
  if (
    message.type === "play_ambient_sound" ||
    message.type === "set_ambient_volume"
  ) {
    ensureOffscreenDocument().then(() => {
      chrome.runtime.sendMessage(message).catch(() => {
        // The offscreen document may not be ready yet.
      });
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === "open_sidepanel") {
    if (sender.tab?.id) {
      chrome.sidePanel.open({ tabId: sender.tab.id });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.sidePanel.open({ tabId: tabs[0].id });
        }
      });
    }
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "set_volume_boost" && message.tabId) {
    const targetTabId = message.tabId;
    const multiplier = Number(message.volumeLevel) || 1.0;

    chrome.scripting
      .executeScript({
        target: { tabId: targetTabId },
        world: "MAIN",
        func: (boostMultiplier: number) => {
          let audioCtx = (window as any)._lifeosAudioCtx;
          let gainNode = (window as any)._lifeosGainNode;

          if (!audioCtx) {
            const AudioCtxClass =
              window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtxClass) {return;}
            audioCtx = new AudioCtxClass();
            gainNode = audioCtx.createGain();
            gainNode.connect(audioCtx.destination);
            (window as any)._lifeosAudioCtx = audioCtx;
            (window as any)._lifeosGainNode = gainNode;
          }

          if (audioCtx.state === "suspended") {
            audioCtx.resume().catch(() => {});
          }

          const connectedMap =
            (window as any)._lifeosConnectedMap || new WeakMap();
          (window as any)._lifeosConnectedMap = connectedMap;

          const mediaEls = Array.from(
            document.querySelectorAll("video, audio"),
          ) as HTMLMediaElement[];

          mediaEls.forEach((el) => {
            if (!connectedMap.has(el)) {
              try {
                const source = audioCtx.createMediaElementSource(el);
                source.connect(gainNode);
                connectedMap.set(el, source);
              } catch (e) {}
            }
          });

          if (gainNode) {
            try {
              gainNode.gain.setValueAtTime(
                boostMultiplier,
                audioCtx.currentTime,
              );
            } catch (e) {}
          }
        },
        args: [multiplier],
      })
      .then(() => sendResponse({ success: true }))
      .catch((err) => {
        console.warn("[Background VolumeBoost] executeScript failed:", err);
        sendResponse({ success: false, error: String(err) });
      });

    return true;
  }

  return false;
}

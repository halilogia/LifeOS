import type { RuntimeMessage } from "./runtimeMessageHandler.js";

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
  message: RuntimeMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: Record<string, unknown>) => void,
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

  // set_volume_boost is handled by the content script (ISOLATED world) via
  // chrome.tabs.sendMessage — no MAIN-world executeScript here. A second
  // AudioContext+createMediaElementSource on the same element throws
  // InvalidStateError and silently breaks the boost.
  return false;
}

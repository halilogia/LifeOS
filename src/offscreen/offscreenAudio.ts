/**
 * offscreenAudio.ts
 * Chrome Extension Offscreen Audio Player.
 * Popup kapansa dahi arka planda kesintisiz Pomodoro ortam sesleri çalmaya devam eder.
 */

import {
  createAmbientAudioEngine,
  normalizeAmbientSoundType,
} from "@/services/ambientAudio/index.js";

const audioEngine = createAmbientAudioEngine();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "play_ambient_sound") {
    audioEngine.play(
      normalizeAmbientSoundType(message.soundType),
      message.volume ?? 0.5,
    );
    sendResponse?.({ success: true });
    return true;
  }

  if (message.type === "set_ambient_volume") {
    audioEngine.setVolume(message.volume ?? 0.5);
    sendResponse?.({ success: true });
    return true;
  }
});

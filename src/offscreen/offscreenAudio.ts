/**
 * offscreenAudio.ts
 * Chrome Extension Offscreen Audio Player.
 * Popup kapansa dahi arka planda kesintisiz Pomodoro ortam sesleri çalmaya devam eder.
 */

import {
  createAmbientAudioEngine,
  AmbientSoundType,
} from "@/services/ambientAudioService.js";

const audioEngine = createAmbientAudioEngine();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "play_ambient_sound") {
    const soundType: AmbientSoundType = message.soundType;
    const volume: number = message.volume ?? 0.5;

    if (soundType === "none") {
      audioEngine.stopAllSounds();
    } else if (soundType === "rain") {
      audioEngine.playRain(volume);
    } else if (soundType === "wind") {
      audioEngine.playWind(volume);
    } else if (
      soundType === "white_noise" ||
      (soundType as string) === "brown"
    ) {
      audioEngine.playHairdryer(volume);
    } else if (soundType === "lofi") {
      audioEngine.playLofi(volume);
    }
    sendResponse?.({ success: true });
    return true;
  }

  if (message.type === "set_ambient_volume") {
    audioEngine.setVolume(message.volume ?? 0.5);
    sendResponse?.({ success: true });
    return true;
  }
});

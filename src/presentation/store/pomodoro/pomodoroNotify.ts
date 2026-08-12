/**
 * pomodoroNotify.ts
 * Paylaşımlı bildirim yardımcısı — timer, alarm, stopwatch slice'ları kullanır.
 */

import { logger } from "@/utils/logger.js";

export function notify(msg: string) {
  try {
    const audio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    );
    audio.volume = 0.4;
    audio.play();
  } catch (e) {
    logger.error("[PomodoroView] notify audio failed:", e);
  }
  if (Notification.permission === "granted") {
    new Notification("Life OS", { body: msg });
  } else {
    Notification.requestPermission();
  }
}

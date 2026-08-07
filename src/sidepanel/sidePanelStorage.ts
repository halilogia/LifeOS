/**
 * sidePanelStorage.ts
 * Chrome storage persistence helper for side panel chat session histories.
 */

import { scheduleCloudBackup } from "@/utils/cloudBackup.js";
import type { ChatMessage } from "./ChatMessage.js";

export function loadChatSessionMessages(
  sessionKey: string,
): Promise<ChatMessage[]> {
  if (!sessionKey) {
    return Promise.resolve([]);
  }
  return new Promise((resolve) => {
    chrome.storage.local.get([sessionKey], (storeRes) => {
      const savedMsgs = storeRes[sessionKey];
      if (Array.isArray(savedMsgs)) {
        resolve(savedMsgs as ChatMessage[]);
      } else {
        resolve([]);
      }
    });
  });
}

export function saveChatSessionMessages(
  sessionKey: string,
  messages: ChatMessage[],
): void {
  if (sessionKey && messages.length > 0) {
    chrome.storage.local.set({ [sessionKey]: messages });
    scheduleCloudBackup();
  }
}

export function clearChatSessionMessages(sessionKey: string): void {
  if (sessionKey) {
    chrome.storage.local.remove([sessionKey]);
  }
}

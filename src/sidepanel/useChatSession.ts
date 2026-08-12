/**
 * useChatSession.ts
 * Chat oturum yönetimi — session key, mesajların yüklenmesi/kaydedilmesi/temizlenmesi.
 * Alt-hook — tuval (useSidePanelChat.ts) orkestrasyonu yapar.
 */

import { useState, useEffect, useRef } from "preact/hooks";
import { ChatMessage } from "./ChatMessage.js";
import {
  loadChatSessionMessages,
  saveChatSessionMessages,
  clearChatSessionMessages,
} from "./sidePanelStorage.js";

export function useChatSession() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeSessionKey, setActiveSessionKey] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (activeSessionKey) {
      saveChatSessionMessages(activeSessionKey, messages);
    }
  }, [messages, activeSessionKey]);

  const newChat = () => {
    setMessages([]);
    if (activeSessionKey) {
      clearChatSessionMessages(activeSessionKey);
    }
  };

  const loadSession = async (sessionKey: string) => {
    setActiveSessionKey(sessionKey);
    const saved = await loadChatSessionMessages(sessionKey);
    setMessages(saved);
  };

  return {
    messages,
    setMessages,
    activeSessionKey,
    setActiveSessionKey,
    messagesEndRef,
    newChat,
    loadSession,
  };
}

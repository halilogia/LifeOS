/**
 * useChatSession.ts
 * Advanced Chat Session & History management for Sidepanel Web Copilot.
 * Integrates with IChatSessionRepository, supports multi-tab sessions,
 * switching, auto-titling, renaming, deleting, and history drawer.
 */

import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import type { ChatMessage } from "./ChatMessage.js";
import type { ChatSession, ChatSessionMessage } from "@/services/aichat/types.js";
import {
  getChatSessionRepository,
  generateSessionTitle,
} from "@/services/aichat/chatSessionService.js";

function createNewSessionObj(
  domain?: string,
  url?: string,
  tabId?: number,
): ChatSession {
  const now = Date.now();
  return {
    id: `sidepanel_${now}_${Math.random().toString(36).slice(2, 7)}`,
    scope: "sidepanel",
    domain,
    url,
    tabId,
    title: "Yeni Sohbet",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function useChatSession() {
  const repo = getChatSessionRepository();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession>(() =>
    createNewSessionObj(),
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeSessionKey, setActiveSessionKey] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load all sidepanel sessions from repository
  const refreshSessions = useCallback(async () => {
    const all = await repo.getAllSessions("sidepanel");
    setSessions(all);
  }, [repo]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession.messages]);

  // Auto-save current session when messages change
  useEffect(() => {
    if (currentSession.messages.length > 0) {
      repo.saveSession(currentSession).then(() => {
        refreshSessions();
      });
    }
  }, [currentSession, repo, refreshSessions]);

  /** Starts a clean new chat session */
  const newChat = () => {
    const fresh = createNewSessionObj(
      currentSession.domain,
      currentSession.url,
      currentSession.tabId,
    );
    setCurrentSession(fresh);
  };

  /** Switches to a past saved session */
  const switchSession = (session: ChatSession) => {
    setCurrentSession(session);
  };

  /** Deletes a session by ID */
  const deleteSession = async (sessionId: string) => {
    await repo.deleteSession(sessionId);
    if (currentSession.id === sessionId) {
      newChat();
    }
    await refreshSessions();
  };

  /** Renames a session title */
  const renameSession = async (sessionId: string, newTitle: string) => {
    await repo.renameSession(sessionId, newTitle);
    if (currentSession.id === sessionId) {
      setCurrentSession((prev) => ({ ...prev, title: newTitle }));
    }
    await refreshSessions();
  };

  /** Sets messages and auto-updates title if it's the first message */
  const setMessages = (
    updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[]),
  ) => {
    setCurrentSession((prev) => {
      const prevMsgs = prev.messages as ChatMessage[];
      const nextMsgs =
        typeof updater === "function" ? updater(prevMsgs) : updater;

      let title = prev.title;
      // Auto-title on first user message
      if (
        (title === "Yeni Sohbet" || !title) &&
        nextMsgs.length > 0 &&
        nextMsgs[0].role === "user"
      ) {
        title = generateSessionTitle(nextMsgs[0].content);
      }

      return {
        ...prev,
        title,
        updatedAt: Date.now(),
        messages: nextMsgs as ChatSessionMessage[],
      };
    });
  };

  /** Called when tab context or domain changes to switch/load tab session */
  const loadSession = async (sessionKey: string) => {
    setActiveSessionKey(sessionKey);
    // Refresh sessions list
    const all = await repo.getAllSessions("sidepanel");
    setSessions(all);

    // Look for existing session associated with this sessionKey or domain
    const match = all.find(
      (s) => s.id === sessionKey || (s.url && sessionKey.includes(s.url)),
    );
    if (match) {
      setCurrentSession(match);
    }
  };

  return {
    messages: currentSession.messages as ChatMessage[],
    currentSession,
    currentSessionId: currentSession.id,
    sessions,
    isHistoryOpen,
    setIsHistoryOpen,
    activeSessionKey,
    setActiveSessionKey,
    messagesEndRef,
    newChat,
    switchSession,
    deleteSession,
    renameSession,
    loadSession,
    setMessages,
  };
}

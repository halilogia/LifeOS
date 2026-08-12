/**
 * useAgentBridge.ts
 * Sayfa bağlamı (page context) + agent durumu + sekme dinleyicileri.
 * Alt-hook — tuval (useSidePanelChat.ts) orkestrasyonu yapar.
 */

import { useState, useEffect } from "preact/hooks";
import { Language } from "@/types/types.js";
import { PageContext } from "@/content/agent/domAgentEngine.js";

export function useAgentBridge(
  t: Record<string, string>,
  onSessionKeyChanged: (sessionKey: string) => void,
  setLang: (lang: Language) => void,
) {
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [pageContext, setPageContext] = useState<PageContext | null>(null);
  const [activeSessionKey, setActiveSessionKey] = useState<string>("");

  const refreshPageContext = () => {
    setAgentStatus(t.page_scanning);
    try {
      chrome.runtime.sendMessage(
        { type: "get_active_tab_context" },
        (response) => {
          setAgentStatus(null);
          if (chrome.runtime.lastError || !response) {
            return;
          }
          if (response.context) {
            const newCtx: PageContext = response.context;
            setPageContext(newCtx);

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              const activeTab = tabs[0];
              const groupId =
                activeTab &&
                activeTab.groupId !== undefined &&
                activeTab.groupId !== -1
                  ? activeTab.groupId
                  : null;
              const domain = newCtx.domain || "default";
              const tabId = activeTab ? activeTab.id : 0;

              const sessionKey = groupId
                ? `copilot_chat_group_${groupId}`
                : `copilot_chat_domain_${domain}_${tabId}`;

              if (sessionKey !== activeSessionKey) {
                setActiveSessionKey(sessionKey);
                onSessionKeyChanged(sessionKey);
              }
            });
          }
        },
      );
    } catch {
      setAgentStatus(null);
    }
  };

  // Initialization: lang + autoGroupTabs + tab listeners
  useEffect(() => {
    chrome.storage.local.get(["lang", "autoGroupTabs"], (res) => {
      if (res.lang) {
        setLang(res.lang as Language);
      }
      if (res.autoGroupTabs !== false) {
        chrome.runtime.sendMessage({ type: "group_active_tab" });
      }
    });

    refreshPageContext();

    const tabActivatedListener = () => refreshPageContext();
    const tabUpdatedListener = (
      _tabId: number,
      changeInfo: { status?: string; title?: string; url?: string },
    ) => {
      if (
        changeInfo.status === "complete" ||
        changeInfo.title ||
        changeInfo.url
      ) {
        refreshPageContext();
      }
    };

    chrome.tabs.onActivated.addListener(tabActivatedListener);
    chrome.tabs.onUpdated.addListener(tabUpdatedListener);

    return () => {
      chrome.tabs.onActivated.removeListener(tabActivatedListener);
      chrome.tabs.onUpdated.removeListener(tabUpdatedListener);
    };
  }, []);

  return {
    agentStatus,
    setAgentStatus,
    pageContext,
    setPageContext,
    activeSessionKey,
    refreshPageContext,
  };
}

/**
 * SidePanelApp.tsx
 * Life OS Web Copilot — Side Panel UI orchestrator (tuval).
 * State & business logic lives in useSidePanelChat hook.
 * Presentational pieces: SidePanelHeader, SidePanelTabBar, SidePanelChips,
 * SidePanelMessages, SidePanelInputBar.
 */
import { useSidePanelChat } from "./useSidePanelChat.js";
import { SidePanelHeader } from "./SidePanelHeader.js";
import { SidePanelTabBar } from "./SidePanelTabBar.js";
import { SidePanelChips } from "./SidePanelChips.js";
import { SidePanelMessages } from "./SidePanelMessages.js";
import { SidePanelInputBar } from "./SidePanelInputBar.js";

export function SidePanelApp() {
  const {
    t,
    lang,
    messages,
    inputText,
    isProcessing,
    agentStatus,
    pageContext,
    isListening,
    isYoutube,
    messagesEndRef,
    setInputText,
    toggleVoiceInput,
    refreshPageContext,
    handleNewChat,
    handleSendMessage,
    handleChipClick,
  } = useSidePanelChat();

  return (
    <div className="sidepanel-container">
      {/* Header Bar */}
      <SidePanelHeader t={t} onNewChat={handleNewChat} />

      {/* Active Tab Status Bar */}
      <SidePanelTabBar
        t={t}
        pageContext={pageContext}
        onRefresh={refreshPageContext}
      />

      {/* Quick Action Chips with SVG Icons */}
      <SidePanelChips
        t={t}
        pageContext={pageContext}
        isYoutube={isYoutube}
        onChipClick={handleChipClick}
        onAutofill={() =>
          handleSendMessage(
            "Aktif sayfadaki formu benim memory.md kişisel bağlamımdaki verilerle (ad, soyad, e-posta, meslek vs.) doldur.",
          )
        }
      />

      {/* Messages Feed */}
      <SidePanelMessages
        t={t}
        lang={lang}
        messages={messages}
        agentStatus={agentStatus}
        messagesEndRef={messagesEndRef}
        onChipClick={handleChipClick}
      />

      {/* Input Container */}
      <SidePanelInputBar
        t={t}
        inputText={inputText}
        isProcessing={isProcessing}
        isListening={isListening}
        onInputChange={setInputText}
        onSend={() => handleSendMessage()}
        onToggleVoice={toggleVoiceInput}
      />
    </div>
  );
}

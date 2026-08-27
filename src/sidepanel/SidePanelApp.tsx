/**
 * SidePanelApp.tsx
 * Life OS Web Copilot — Side Panel UI orchestrator (tuval).
 * State & business logic lives in useSidePanelChat hook.
 * Presentational pieces: SidePanelHeader, SidePanelTabBar, SidePanelChips,
 * SidePanelMessages, SidePanelInputBar, SidePanelHistoryDrawer, ConfirmModal.
 */
import { useSidePanelChat } from "./useSidePanelChat.js";
import { SidePanelHeader } from "./SidePanelHeader.js";
import { SidePanelTabBar } from "./SidePanelTabBar.js";
import { SidePanelChips } from "./SidePanelChips.js";
import { SidePanelMessages } from "./SidePanelMessages.js";
import { SidePanelInputBar } from "./SidePanelInputBar.js";
import { SidePanelHistoryDrawer } from "./SidePanelHistoryDrawer.js";
import { ConfirmModal } from "@/components/ConfirmModal.js";

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
    attachments,
    enableWebSearch,
    sessions,
    currentSessionId,
    isHistoryOpen,
    deleteConfirmSessionId,
    messagesEndRef,
    setInputText,
    setIsHistoryOpen,
    setDeleteConfirmSessionId,
    toggleVoiceInput,
    refreshPageContext,
    handleNewChat,
    handleSendMessage,
    handleAddFiles,
    handleRemoveAttachment,
    handleToggleWebSearch,
    handleSwitchSession,
    handleRequestDeleteSession,
    handleConfirmDeleteSession,
    handleRenameSession,
    handleExportCurrentChat,
    handleResolveClarification,
    handleCancelClarification,
    messageQueue,
    handleRemoveQueuedMessage,
    handleClearQueue,
    handleChipClick,
  } = useSidePanelChat();

  return (
    <div className="sidepanel-container">
      {/* Slide-in Chat History Drawer */}
      <SidePanelHistoryDrawer
        isOpen={isHistoryOpen}
        sessions={sessions}
        currentSessionId={currentSessionId}
        t={t}
        onClose={() => setIsHistoryOpen(false)}
        onSelectSession={handleSwitchSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleRequestDeleteSession}
        onRenameSession={handleRenameSession}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmSessionId)}
        message={t.chat_history_delete_confirm || "Bu sohbeti silmek istediğinizden emin misiniz?"}
        lang={lang}
        onConfirm={handleConfirmDeleteSession}
        onCancel={() => setDeleteConfirmSessionId(null)}
      />

      {/* Header Bar */}
      <SidePanelHeader
        t={t}
        onNewChat={handleNewChat}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onExport={handleExportCurrentChat}
      />

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
        onResolveClarification={handleResolveClarification}
        onCancelClarification={handleCancelClarification}
      />

      {/* Input Container with Queued Messages */}
      <SidePanelInputBar
        t={t}
        inputText={inputText}
        isProcessing={isProcessing}
        isListening={isListening}
        attachments={attachments}
        enableWebSearch={enableWebSearch}
        queue={messageQueue}
        onInputChange={setInputText}
        onSend={() => handleSendMessage()}
        onToggleVoice={toggleVoiceInput}
        onAddFiles={handleAddFiles}
        onRemoveAttachment={handleRemoveAttachment}
        onToggleWebSearch={handleToggleWebSearch}
        onNewChat={handleNewChat}
        onExport={handleExportCurrentChat}
        onRemoveQueuedMessage={handleRemoveQueuedMessage}
        onClearQueue={handleClearQueue}
      />
    </div>
  );
}

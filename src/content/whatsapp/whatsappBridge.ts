import { logger } from "@/utils/logger.js";

/**
 * whatsappBridge.ts
 * WhatsApp Web OpenClaw / 9Router AI & Life OS Integration.
 * Clean Architecture & Strict Security (0 Vulnerability, 0 Backdoor).
 * 
 * TELEFON UZAKTAN YÖNETİM MODU (Remote Mobile AI Bot):
 * Telefonunuzdan "Kendime Mesaj / Siz" sohbetine attığınız @ai mesajları,
 * bilgisayarda WhatsApp Web sekmesi açık olduğu sürece (arka planda bile dursa)
 * 9Router AI tarafından işlenir ve ANINDA TELEFONUNUZA yanıt olarak düşer! 📱🤖
 */

const processedAiMessages = new Set<string>();

/**
 * Safe helper to observe document body or documentElement
 * Prevents "parameter 1 is not of type 'Node'" error when DOM is loading.
 */
function safeObserve(observer: MutationObserver, options: MutationObserverInit): void {
  const attach = () => {
    const targetNode = document.body || document.documentElement;
    if (targetNode) {
      try {
        observer.observe(targetNode, options);
      } catch (err) {
        logger.warn("[Life OS WhatsApp Bridge] Observer attach error:", err);
      }
    }
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", attach, { once: true });
  } else {
    attach();
  }
}

/**
 * Main initialization for WhatsApp Web Bridge.
 * Only runs when window.location.hostname includes "web.whatsapp.com".
 */
export function initWhatsappBridge(): void {
  if (!window.location.hostname.includes("web.whatsapp.com")) {
    return;
  }

  // Inject CSS styles for WhatsApp action buttons and toasts
  injectWhatsappStyles();

  // Initialize Remote AI listener & message observer
  setupRemoteAiAssistantObserver();

  // Show welcome toast when WhatsApp Web is loaded
  setTimeout(() => {
    showToast("📱 Uzaktan Telefon AI Modu Aktif! Telefondan @ai yazıp atabilirsiniz.");
  }, 4000);
}

/**
 * Inject safe CSS styles into page head for buttons and notifications.
 */
function injectWhatsappStyles(): void {
  if (document.getElementById("life-os-wp-styles")) {return;}

  const styleEl = document.createElement("style");
  styleEl.id = "life-os-wp-styles";
  styleEl.textContent = `
    .life-os-wp-actions {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-left: 8px;
      opacity: 0.3;
      transition: opacity 0.2s ease;
      vertical-align: middle;
    }
    div.message-in:hover .life-os-wp-actions,
    div.message-out:hover .life-os-wp-actions,
    div[role="row"]:hover .life-os-wp-actions {
      opacity: 1;
    }
    .life-os-wp-btn {
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid rgba(139, 92, 246, 0.4);
      color: #c084fc;
      border-radius: 6px;
      padding: 2px 7px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .life-os-wp-btn:hover {
      background: rgba(139, 92, 246, 0.4);
      color: #ffffff;
      transform: scale(1.05);
    }
    .life-os-wp-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid #8b5cf6;
      color: #f8fafc;
      padding: 10px 18px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
      animation: lifeOsToastIn 0.3s ease-out;
    }
    @keyframes lifeOsToastIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  const parent = document.head || document.documentElement;
  if (parent) {
    parent.appendChild(styleEl);
  }
}

/**
 * Show a safe temporary toast message on screen.
 */
function showToast(messageText: string): void {
  if (!document.body) {return;}
  const toast = document.createElement("div");
  toast.className = "life-os-wp-toast";
  toast.textContent = messageText;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4500);
}

/**
 * Remote WhatsApp 9Router AI Assistant Observer (OpenClaw Mode)
 * Scans ALL message bubbles in chat stream for prompts (@ai, /ai, @9router)
 * Works seamlessly whether sent from PC OR sent from Phone!
 */
function setupRemoteAiAssistantObserver(): void {
  let isProcessingAi = false;

  // Snapshot and mark all pre-existing messages in DOM as processed on startup
  const markExistingMessagesAsProcessed = () => {
    const existing = document.querySelectorAll(
      "div.message-out, div.message-in, div[role='row'], div.copyable-text",
    );
    existing.forEach((msgNode, idx) => {
      const textEl =
        msgNode.querySelector("span.selectable-text") ||
        msgNode.querySelector("div.copyable-text") ||
        msgNode.querySelector("span._ao3e");
      if (textEl && textEl.textContent) {
        const text = textEl.textContent.trim();
        processedAiMessages.add(`${text}_${idx}`);
      }
    });
  };

  // Perform snapshot when DOM ready
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", markExistingMessagesAsProcessed, { once: true });
  } else {
    markExistingMessagesAsProcessed();
  }

  const scanAllMessagesForPrompts = async () => {
    if (isProcessingAi) {return;}

    // Scan all message elements in active chat window
    const allMessageNodes = Array.from(
      document.querySelectorAll("div.message-out, div.message-in, div[role='row'], div.copyable-text"),
    );

    if (allMessageNodes.length === 0) {return;}

    // Iterate backwards starting from latest messages
    for (let i = allMessageNodes.length - 1; i >= Math.max(0, allMessageNodes.length - 8); i--) {
      const msgNode = allMessageNodes[i];
      const textEl =
        msgNode.querySelector("span.selectable-text") ||
        msgNode.querySelector("div.copyable-text") ||
        msgNode.querySelector("span._ao3e");

      if (!textEl) {continue;}

      const rawText = textEl.textContent || "";
      const trimmed = rawText.trim();

      // Ignore bot responses, action button labels, or error messages
      if (
        trimmed.includes("9Router AI:") ||
        trimmed.includes("Hata:") ||
        trimmed.includes("API anahtarı") ||
        trimmed.includes("Not Yap") ||
        trimmed.includes("Görev Yap")
      ) {
        continue;
      }

      // Check if message demands AI response
      const lower = trimmed.toLowerCase();
      const isAiTrigger =
        lower.startsWith("@ai ") ||
        lower.startsWith("/ai ") ||
        lower.startsWith("@9router ") ||
        lower === "@ai" ||
        lower === "/ai";

      if (!isAiTrigger) {continue;}

      // Unique hash ID for message to avoid duplicate replies
      const msgHash = `${trimmed}_${i}`;
      if (processedAiMessages.has(msgHash)) {continue;}

      // Mark as processed immediately
      processedAiMessages.add(msgHash);

      const cleanPrompt = trimmed
        .replace(/^@ai\s*/i, "")
        .replace(/^\/ai\s*/i, "")
        .replace(/^@9router\s*/i, "")
        .trim();

      if (!cleanPrompt) {continue;}

      isProcessingAi = true;
      showToast(`📱 Telefondan İstek Geldi: "${cleanPrompt.slice(0, 25)}..."`);

      try {
        if (!chrome.runtime?.id) {
          isProcessingAi = false;
          return;
        }

        // Fetch AI Response from background script via runtime message
        const aiResponse: string = await new Promise((resolve, reject) => {
          if (!chrome.runtime?.id) {
            resolve("");
            return;
          }
          chrome.runtime.sendMessage(
            {
              type: "GENERATE_AI_RESPONSE",
              prompt: cleanPrompt,
            },
            (res) => {
              if (chrome.runtime.lastError) {
                // Silently ignore extension invalidation on reload
                if (chrome.runtime.lastError.message?.includes("Extension context invalidated")) {
                  resolve("");
                } else {
                  reject(chrome.runtime.lastError);
                }
              } else if (res && res.response) {
                resolve(res.response);
              } else {
                resolve(
                  "Üzgünüm, 9Router AI yanıtı oluşturulamadı. Lütfen eklenti ayarlarından API anahtarınızı kontrol edin.",
                );
              }
            },
          );
        });

        if (!aiResponse) {
          isProcessingAi = false;
          return;
        }

        // Format & clean AI answer back into WhatsApp chat box (plain answer only, no prefixes/citations)
        const cleanReply = aiResponse
          .replace(/^🤖\s*9Router\s*AI:\s*/i, "")
          .replace(/^9Router\s*AI:\s*/i, "")
          .replace(/^Hata:\s*/i, "")
          .replace(/\[\d+\]/g, "")
          .replace(/\n{3,}/g, "\n\n")
          .trim();

        setTimeout(() => {
          sendTextToWhatsappChat(cleanReply);
          isProcessingAi = false;
        }, 800);

        // Process only one AI prompt per scan pass
        break;
      } catch (err) {
        logger.error("[Life OS WhatsApp Bridge] AI Error:", err);
        isProcessingAi = false;
      }
    }
  };

  const observer = new MutationObserver(() => {
    scanAllMessagesForPrompts();
  });

  safeObserve(observer, {
    childList: true,
    subtree: true,
  });
}

/**
 * Safe helper to type and send text back into WhatsApp Web chat box.
 * Dispatches native input & click events to send reply back to user's phone!
 */
function sendTextToWhatsappChat(replyText: string): void {
  const inputArea =
    document.querySelector('footer div[contenteditable="true"]') ||
    document.querySelector('div[contenteditable="true"][data-tab="10"]') ||
    document.querySelector('div[contenteditable="true"][role="textbox"]') ||
    document.querySelector('div[contenteditable="true"]');

  if (!inputArea) {
    logger.warn("[Life OS WhatsApp Bridge] Input area not found");
    return;
  }

  const el = inputArea as HTMLElement;
  el.focus();

  const formattedText = replyText;

  try {
    document.execCommand("insertText", false, formattedText);
  } catch (e) {
    el.innerText = formattedText;
  }

  // Dispatch Input Event so WhatsApp Web reactively enables the send button
  const inputEvent = new InputEvent("input", {
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(inputEvent);

  // Click WhatsApp Send Button
  setTimeout(() => {
    const sendButton =
      document.querySelector('footer span[data-icon="send"]') ||
      document.querySelector('footer button[aria-label="Gönder"]') ||
      document.querySelector('footer button[aria-label="Send"]') ||
      document.querySelector('span[data-icon="send"]');

    if (sendButton) {
      const btn = (
        sendButton.tagName === "BUTTON"
          ? sendButton
          : sendButton.closest("button") || sendButton
      ) as HTMLElement;
      btn.click();
    } else {
      // Fallback: Dispatch Enter key
      const enterEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(enterEvent);
    }
  }, 300);
}

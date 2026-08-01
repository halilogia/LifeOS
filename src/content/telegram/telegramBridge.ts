/**
 * telegramBridge.ts
 * Telegram Web bridge — @ai komutlarını AI'ya yönlendirir.
 * WhatsApp Web köprüsünün aynısı, Telegram Web DOM'u için uyarlanmıştır.
 *
 * KULLANIM: web.telegram.org'da herhangi bir sohbette "@ai sorunuz" yazın.
 * AI cevabı aynı sohbete otomatik yazılır.
 *
 * Clean Architecture & Strict Security (0 Vulnerability, 0 Backdoor).
 */
import { contentWarn, contentError } from "@/content/contentLogger.js";

const processedAiMessages = new Set<string>();

/**
 * Safe helper to observe document body or documentElement.
 */
function safeObserve(
  observer: MutationObserver,
  options: MutationObserverInit,
): void {
  const attach = () => {
    const targetNode = document.body || document.documentElement;
    if (targetNode) {
      try {
        observer.observe(targetNode, options);
      } catch (err) {
        contentWarn("[Life OS Telegram Bridge] Observer attach error:", err);
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
 * Main initialization for Telegram Web Bridge.
 * Only runs on web.telegram.org.
 */
export function initTelegramBridge(): void {
  if (!window.location.hostname.includes("web.telegram.org")) {
    return;
  }

  injectTelegramStyles();
  setupRemoteAiAssistantObserver();

  setTimeout(() => {
    showToast("📱 Telegram AI Aktif! Sohbete @ai yazıp gönderebilirsiniz.");
  }, 4000);
}

/**
 * Inject minimal styles for toast notifications on Telegram Web.
 */
function injectTelegramStyles(): void {
  if (document.getElementById("life-os-tg-styles")) {
    return;
  }

  const styleEl = document.createElement("style");
  styleEl.id = "life-os-tg-styles";
  styleEl.textContent = `
    .life-os-tg-toast {
      position: fixed;
      bottom: 70px;
      left: 50%;
      transform: translateX(-50%);
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
  if (!document.body) {
    return;
  }
  const toast = document.createElement("div");
  toast.className = "life-os-tg-toast";
  toast.textContent = messageText;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4500);
}

/**
 * Remote Telegram AI Assistant Observer.
 * Scans messages for @ai prefix and sends to background AI handler.
 */
function setupRemoteAiAssistantObserver(): void {
  let isProcessingAi = false;

  // Mark all pre-existing messages as processed on startup
  const markExistingMessagesAsProcessed = () => {
    const existing = document.querySelectorAll(
      ".Message, .bubble, .message, [class*='message'], [class*='bubble']",
    );
    existing.forEach((msgNode, idx) => {
      const textEl = msgNode.querySelector(
        ".text, .message-text, [class*='text'], .translatable-message, .i18n",
      );
      if (textEl && textEl.textContent) {
        const text = textEl.textContent.trim();
        processedAiMessages.add(`${text}_${idx}`);
      }
    });
  };

  if (document.readyState === "loading") {
    window.addEventListener(
      "DOMContentLoaded",
      markExistingMessagesAsProcessed,
      { once: true },
    );
  } else {
    markExistingMessagesAsProcessed();
  }

  const scanAllMessagesForPrompts = async () => {
    if (isProcessingAi) {
      return;
    }

    const allMessageNodes = Array.from(
      document.querySelectorAll(
        ".Message, .bubble, .message, [class*='message'], [class*='bubble']",
      ),
    );

    if (allMessageNodes.length === 0) {
      return;
    }

    for (
      let i = allMessageNodes.length - 1;
      i >= Math.max(0, allMessageNodes.length - 8);
      i--
    ) {
      const msgNode = allMessageNodes[i];
      const textEl = msgNode.querySelector(
        ".text, .message-text, [class*='text'], .translatable-message, .i18n",
      );

      if (!textEl) {
        continue;
      }

      const rawText = textEl.textContent || "";
      const trimmed = rawText.trim();

      // Ignore bot responses and our own messages
      if (
        trimmed.includes("🤖 AI:") ||
        trimmed.includes("Hata:") ||
        trimmed.includes("API anahtarı")
      ) {
        continue;
      }

      // Check if message demands AI response
      const lower = trimmed.toLowerCase();
      const isAiTrigger =
        lower.startsWith("@ai ") ||
        lower.startsWith("/ai ") ||
        lower === "@ai" ||
        lower === "/ai" ||
        lower.startsWith("@lifeos ");

      if (!isAiTrigger) {
        continue;
      }

      // Unique hash ID for message to avoid duplicates
      const msgHash = `${trimmed}_${i}`;
      if (processedAiMessages.has(msgHash)) {
        continue;
      }

      processedAiMessages.add(msgHash);

      const cleanPrompt = trimmed
        .replace(/^@ai\s*/i, "")
        .replace(/^\/ai\s*/i, "")
        .replace(/^@lifeos\s*/i, "")
        .trim();

      if (!cleanPrompt) {
        continue;
      }

      isProcessingAi = true;
      showToast(`📱 Telegram'dan İstek: "${cleanPrompt.slice(0, 25)}..."`);

      try {
        if (!chrome.runtime?.id) {
          isProcessingAi = false;
          return;
        }

        // Fetch AI Response from background script
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
                if (
                  chrome.runtime.lastError.message?.includes(
                    "Extension context invalidated",
                  )
                ) {
                  resolve("");
                } else {
                  reject(chrome.runtime.lastError);
                }
              } else if (res && res.response) {
                resolve(res.response);
              } else {
                resolve(
                  "Üzgünüm, AI yanıtı oluşturulamadı. Lütfen eklenti ayarlarından API anahtarınızı kontrol edin.",
                );
              }
            },
          );
        });

        if (!aiResponse) {
          isProcessingAi = false;
          return;
        }

        // Clean AI response
        const cleanReply = aiResponse
          .replace(/^🤖\s*9?Router\s*AI:\s*/i, "")
          .replace(/^9?Router\s*AI:\s*/i, "")
          .replace(/^Hata:\s*/i, "")
          .replace(/\[\d+\]/g, "")
          .replace(/\n{3,}/g, "\n\n")
          .trim();

        setTimeout(() => {
          sendTextToTelegramChat(cleanReply);
          isProcessingAi = false;
        }, 800);

        break;
      } catch (err) {
        contentError("[Life OS Telegram Bridge] AI Error:", err);
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
 * Find the Telegram Web message input area and send text.
 * Telegram Web uses a div[contenteditable="true"] as its input.
 */
function sendTextToTelegramChat(replyText: string): void {
  const inputArea =
    document.querySelector('div[contenteditable="true"][role="textbox"]') ||
    document.querySelector(
      '.input-message-container div[contenteditable="true"]',
    ) ||
    document.querySelector('div[contenteditable="true"]');

  if (!inputArea) {
    contentWarn("[Life OS Telegram Bridge] Input area not found");
    return;
  }

  const el = inputArea as HTMLElement;
  el.focus();

  // Clear existing content
  el.innerText = "";

  try {
    document.execCommand("insertText", false, replyText);
  } catch {
    el.innerText = replyText;
  }

  // Dispatch Input Event to trigger send button enable
  const inputEvent = new InputEvent("input", {
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(inputEvent);

  // Click send button or press Enter
  setTimeout(() => {
    const sendButton =
      document.querySelector('button[aria-label="Send"]') ||
      document.querySelector('button[aria-label="Gönder"]') ||
      document.querySelector(".send") ||
      document.querySelector('[class*="send"] button') ||
      document.querySelector('button[class*="send"]');

    if (sendButton) {
      (sendButton as HTMLElement).click();
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

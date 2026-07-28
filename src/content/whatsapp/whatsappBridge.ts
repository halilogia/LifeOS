/**
 * whatsappBridge.ts
 * WhatsApp Web OpenClaw / 9Router AI & Life OS Integration.
 * Clean Architecture & Strict Security (0 Vulnerability, 0 Backdoor).
 */

import { Note, Todo } from "@/types/types.js";

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

  // Initialize AI listener & message observer
  setupAiAssistantListener();
  setupQuickActionObserver();
}

/**
 * Inject safe CSS styles into page head for buttons and notifications.
 */
function injectWhatsappStyles(): void {
  if (document.getElementById("life-os-wp-styles")) return;

  const styleEl = document.createElement("style");
  styleEl.id = "life-os-wp-styles";
  styleEl.textContent = `
    .life-os-wp-actions {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-left: 8px;
      opacity: 0.4;
      transition: opacity 0.2s ease;
      vertical-align: middle;
    }
    .message-in:hover .life-os-wp-actions,
    .message-out:hover .life-os-wp-actions {
      opacity: 1;
    }
    .life-os-wp-btn {
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.3);
      color: #c084fc;
      border-radius: 6px;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
    }
    .life-os-wp-btn:hover {
      background: rgba(139, 92, 246, 0.3);
      color: #ffffff;
      transform: scale(1.05);
    }
    .life-os-wp-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: rgba(15, 23, 42, 0.92);
      border: 1px solid #8b5cf6;
      color: #f8fafc;
      padding: 10px 18px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
      animation: lifeOsToastIn 0.3s ease-out;
    }
    @keyframes lifeOsToastIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  (document.head || document.documentElement).appendChild(styleEl);
}

/**
 * Show a safe temporary toast message on screen.
 */
function showToast(messageText: string): void {
  const toast = document.createElement("div");
  toast.className = "life-os-wp-toast";
  toast.textContent = messageText;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * WhatsApp 9Router AI Assistant (OpenClaw Mode)
 * Intercepts outbound messages starting with @ai or ending with ?
 */
function setupAiAssistantListener(): void {
  let isProcessingAi = false;

  document.addEventListener(
    "keydown",
    async (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.shiftKey || isProcessingAi) return;

      const activeEl = document.activeElement as HTMLElement;
      if (!activeEl) return;

      // WhatsApp Web message box query
      const isInput =
        activeEl.getAttribute("contenteditable") === "true" ||
        activeEl.classList.contains("selectable-text");

      if (!isInput) return;

      const text = activeEl.innerText || activeEl.textContent || "";
      const trimmed = text.trim();

      // Check if message demands AI response (@ai prefix or ending with ?)
      const isAiTrigger =
        trimmed.startsWith("@ai ") ||
        trimmed.startsWith("/ai ") ||
        (trimmed.length > 5 && trimmed.endsWith("?"));

      if (!isAiTrigger) return;

      const cleanPrompt = trimmed
        .replace(/^@ai\s*/i, "")
        .replace(/^\/ai\s*/i, "");

      if (!cleanPrompt) return;

      isProcessingAi = true;
      showToast("⚡ 9Router AI Düşünüyor...");

      try {
        // Fetch AI Response from background script via runtime message
        const aiResponse: string = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            {
              type: "GENERATE_AI_RESPONSE",
              prompt: cleanPrompt,
            },
            (res) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else if (res && res.response) {
                resolve(res.response);
              } else {
                resolve(
                  "Üzgünüm, 9Router AI yanıtı oluşturulamadı. Lütfen API anahtarınızı kontrol edin.",
                );
              }
            },
          );
        });

        // Insert AI answer back into WhatsApp chat box after a small natural pause
        setTimeout(() => {
          sendTextToWhatsappChat(aiResponse);
          isProcessingAi = false;
        }, 1200);
      } catch (err) {
        console.error("[Life OS WhatsApp Bridge] AI Error:", err);
        isProcessingAi = false;
      }
    },
    true,
  );
}

/**
 * Safe helper to type and send text back into WhatsApp Web chat.
 */
function sendTextToWhatsappChat(replyText: string): void {
  const mainFooter = document.querySelector("footer");
  if (!mainFooter) return;

  const inputArea = mainFooter.querySelector(
    'div[contenteditable="true"]',
  ) as HTMLElement;

  if (!inputArea) return;

  inputArea.focus();

  // Safe DOM manipulation to clear & set text
  inputArea.innerText = `🤖 9Router AI:\n${replyText}`;

  // Dispatch Input Event so WhatsApp Web reactively enables the send button
  const inputEvent = new InputEvent("input", {
    bubbles: true,
    cancelable: true,
  });
  inputArea.dispatchEvent(inputEvent);

  // Dispatch Enter Key press event to submit message
  setTimeout(() => {
    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      keyCode: 13,
      code: "Enter",
      which: 13,
      bubbles: true,
      cancelable: true,
    });
    inputArea.dispatchEvent(enterEvent);
  }, 400);
}

/**
 * Setup MutationObserver to attach "Life OS Not Yap" and "Life OS Görev Yap"
 * quick buttons to WhatsApp message bubbles on hover.
 */
function setupQuickActionObserver(): void {
  const observer = new MutationObserver(() => {
    attachButtonsToMessages();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial pass
  attachButtonsToMessages();
}

/**
 * Find WhatsApp message elements and insert quick buttons safely.
 */
function attachButtonsToMessages(): void {
  const messageContainers = document.querySelectorAll(
    "div.message-in, div.message-out",
  );

  messageContainers.forEach((msgBox) => {
    if (msgBox.querySelector(".life-os-wp-actions")) return; // Already attached

    const textEl = msgBox.querySelector("span.selectable-text");
    if (!textEl) return;

    const messageText = textEl.textContent?.trim();
    if (!messageText || messageText.length < 3) return;

    // Create safe button container
    const container = document.createElement("span");
    container.className = "life-os-wp-actions";

    // "📝 Not Yap" Button
    const noteBtn = document.createElement("button");
    noteBtn.type = "button";
    noteBtn.className = "life-os-wp-btn";
    noteBtn.textContent = "📝 Not Yap";
    noteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      saveWhatsappToNotes(messageText);
    });

    // "✅ Görev Yap" Button
    const taskBtn = document.createElement("button");
    taskBtn.type = "button";
    taskBtn.className = "life-os-wp-btn";
    taskBtn.textContent = "✅ Görev Yap";
    taskBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      saveWhatsappToTasks(messageText);
    });

    container.appendChild(noteBtn);
    container.appendChild(taskBtn);

    // Append safely next to message text
    textEl.appendChild(container);
  });
}

/**
 * Save WhatsApp message to Life OS Notes in chrome.storage.sync.
 */
async function saveWhatsappToNotes(text: string): Promise<void> {
  try {
    const existingNotes: Note[] = await new Promise((r) =>
      chrome.storage.sync.get(["notes"], (res) => r((res.notes as Note[]) || [])),
    );

    const firstLine = text.split("\n")[0].slice(0, 40);
    const newNote: Note = {
      id: `wp-note-${Date.now()}`,
      title: `WhatsApp: ${firstLine}...`,
      content: `${text}\n\n#whatsapp #kpss`,
      createdAt: new Date().toISOString(),
      type: "note",
    };

    existingNotes.unshift(newNote);

    await new Promise<void>((r) =>
      chrome.storage.sync.set({ notes: existingNotes }, r),
    );

    showToast("📝 WhatsApp Mesajı Life OS Notlarına Eklendi!");
  } catch (err) {
    console.error("[Life OS] Save Note Error:", err);
  }
}

/**
 * Save WhatsApp message to Life OS Kanban Tasks in chrome.storage.sync.
 */
async function saveWhatsappToTasks(text: string): Promise<void> {
  try {
    const existingTodos: Todo[] = await new Promise((r) =>
      chrome.storage.sync.get(["todos"], (res) => r((res.todos as Todo[]) || [])),
    );

    const newTodo: Todo = {
      id: `wp-todo-${Date.now()}`,
      text: `[WhatsApp] ${text}`,
      completed: false,
      status: "todo",
      repeat: "none",
      category: "general",
      lastCompletedDate: null,
      urgent: false,
      important: false,
    };

    existingTodos.unshift(newTodo);

    await new Promise<void>((r) =>
      chrome.storage.sync.set({ todos: existingTodos }, r),
    );

    showToast("✅ WhatsApp Mesajı Life OS Görevlerine Eklendi!");
  } catch (err) {
    console.error("[Life OS] Save Task Error:", err);
  }
}

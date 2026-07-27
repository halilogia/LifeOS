/**
 * universalInfoBox.ts
 * Universal AI translation & inline web info box bubble.
 * Clean Architecture - Content Script Domain Module.
 */

let bubbleHost: HTMLDivElement | null = null;

export function initUniversalInfoBox(): void {
  chrome.storage.sync.get(
    ["universalInfoBoxEnabled", "universalInfoBoxHotkey"],
    (settings) => {
      const enabled = (settings.universalInfoBoxEnabled as boolean) ?? true;
      const hotkey = (settings.universalInfoBoxHotkey as string) || "none";

      if (!enabled) {
        return;
      }

      document.addEventListener("mouseup", (e) => {
        handleTextSelection(e, hotkey);
      });
      document.addEventListener("mousedown", (e) => {
        handleOutsideClick(e);
      });
    },
  );
}

function handleTextSelection(e: MouseEvent, hotkey: string): void {
  if (hotkey === "alt" && !e.altKey) {return;}
  if (hotkey === "ctrl" && !e.ctrlKey) {return;}
  if (hotkey === "shift" && !e.shiftKey) {return;}

  setTimeout(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      removeBubble();
      return;
    }

    const text = selection.toString().trim();

    if (!text || text.length <= 1 || text.length > 5000) {
      return;
    }

    if (bubbleHost && e.target && bubbleHost.contains(e.target as Node)) {
      return;
    }

    chrome.runtime.sendMessage(
      { type: "translate_text", text: text },
      (response: { translation?: string }) => {
        if (response && response.translation) {
          showTranslationBubble(response.translation, selection);
        }
      },
    );
  }, 10);
}

function handleOutsideClick(e: MouseEvent): void {
  if (bubbleHost) {
    const path = e.composedPath ? e.composedPath() : [];
    if (!path.includes(bubbleHost)) {
      removeBubble();
    }
  }
}

function removeBubble(): void {
  if (bubbleHost) {
    if (bubbleHost.parentNode) {
      bubbleHost.parentNode.removeChild(bubbleHost);
    }
    bubbleHost = null;
  }
}

function showTranslationBubble(translationText: string, selection: Selection): void {
  removeBubble();

  if (!document.body) {return;}

  bubbleHost = document.createElement("div");
  bubbleHost.style.position = "absolute";
  bubbleHost.style.zIndex = "2147483647";
  bubbleHost.style.pointerEvents = "auto";

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  const bubbleX = rect.left + rect.width / 2 + scrollLeft;

  const shadow = bubbleHost.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    .bubble-wrapper {
      position: relative;
      transform: translate(-50%, -100%);
      background: rgba(18, 18, 24, 0.85);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(139, 92, 246, 0.4);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      border-radius: 10px;
      padding: 10px 14px;
      width: max-content;
      max-width: 280px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #f1f5f9;
      font-size: 13px;
      line-height: 1.5;
      animation: bubbleFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .bubble-wrapper.below {
      transform: translate(-50%, 0);
      animation: bubbleFadeInBelow 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .bubble-header {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 4px;
      gap: 15px;
    }
    .bubble-title {
      color: #a78bfa;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin: 0;
    }
    .bubble-close {
      background: transparent;
      border: none;
      color: #64748b;
      font-size: 10px;
      cursor: pointer;
      padding: 2px;
      margin-left: auto;
      line-height: 1;
      transition: color 0.15s ease;
    }
    .bubble-close:hover {
      color: #ef4444;
    }
    .bubble-content {
      word-break: break-word;
      font-weight: 500;
    }
    @keyframes bubbleFadeIn {
      from {
        opacity: 0;
        transform: translate(-50%, -95%) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -100%) scale(1);
      }
    }
    @keyframes bubbleFadeInBelow {
      from {
        opacity: 0;
        transform: translate(-50%, 5%) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0) scale(1);
      }
    }
  `;

  const wrapper = document.createElement("div");
  wrapper.className = "bubble-wrapper";

  const header = document.createElement("div");
  header.className = "bubble-header";

  const title = document.createElement("h4");
  title.className = "bubble-title";
  title.textContent = "AI TRANSLATE";

  const closeBtn = document.createElement("button");
  closeBtn.className = "bubble-close";
  closeBtn.textContent = "✕";
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    removeBubble();
  });

  header.appendChild(title);
  header.appendChild(closeBtn);

  const content = document.createElement("div");
  content.className = "bubble-content";
  content.textContent = translationText;

  wrapper.appendChild(header);
  wrapper.appendChild(content);

  shadow.appendChild(style);
  shadow.appendChild(wrapper);

  bubbleHost.style.left = "-9999px";
  bubbleHost.style.top = "-9999px";
  document.body.appendChild(bubbleHost);

  const wrapperEl = shadow.querySelector(".bubble-wrapper");
  const wrapperHeight = wrapperEl
    ? wrapperEl.getBoundingClientRect().height
    : 60;

  const needsToRenderBelow = rect.top < wrapperHeight + 20;

  let bubbleY: number;
  if (needsToRenderBelow) {
    bubbleY = rect.bottom + 12 + scrollTop;
    if (wrapperEl) {
      wrapperEl.classList.add("below");
    }
  } else {
    bubbleY = rect.top - 12 + scrollTop;
  }

  bubbleHost.style.left = `${bubbleX}px`;
  bubbleHost.style.top = `${bubbleY}px`;
}

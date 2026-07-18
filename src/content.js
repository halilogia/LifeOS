(function () {
  const currentHost = window.location.hostname;

  // Hiding helper (immediately inject to prevent layout flash)
  const styleEl = document.createElement("style");
  styleEl.innerHTML = "html, body { display: none !important; }";
  document.documentElement.appendChild(styleEl);

  function checkScreenTimeLimits() {
    chrome.storage.sync.get(
      [
        "detox_enabled",
        "detox_blocked_sites",
        "detox_end_time",
        "custom_quotes",
        "lang",
        "pomoBlockEnabled",
        "detox_limits"
      ],
      (settings) => {
        chrome.storage.local.get(["pomodoro_timer_state", "screen_time_stats"], (localRes) => {
          const enabled = settings.detox_enabled || false;
          const blockedSites = settings.detox_blocked_sites || [];
          const endTime = settings.detox_end_time || 0;
          const lang = settings.lang || "tr";
          const pomoBlockEnabled = settings.pomoBlockEnabled ?? true;
          const pomoState = localRes.pomodoro_timer_state || {};

          // Verify if host matches blocked configurations
          const isBlockedHost = blockedSites.some((site) =>
            currentHost.includes(site),
          );
          const isTimeActive = endTime === -1 || endTime > Date.now();

          const isDetoxActive = enabled && isBlockedHost && isTimeActive;
          const isPomoActive = pomoBlockEnabled && isBlockedHost && pomoState.running && pomoState.mode === "focus";

          // Calculate daily limit
          const detoxLimits = settings.detox_limits || {};
          const limitDomain = Object.keys(detoxLimits).find((domain) => currentHost.includes(domain));
          const activeLimitMinutes = limitDomain ? detoxLimits[limitDomain] : 0;

          let isLimitExceeded = false;
          let remainingSeconds = 999999;
          if (activeLimitMinutes > 0 && limitDomain) {
            const todayStr = new Date().toLocaleDateString("sv");
            const dailyStats = localRes.screen_time_stats?.[todayStr] || {};
            const spentSeconds = dailyStats[limitDomain] || 0;
            const limitSeconds = activeLimitMinutes * 60;
            isLimitExceeded = spentSeconds >= limitSeconds;
            remainingSeconds = limitSeconds - spentSeconds;
          }

          if (isDetoxActive || isPomoActive || isLimitExceeded) {
            const targetEndTime = isPomoActive ? pomoState.endTime : (isLimitExceeded ? -1 : endTime);
            const isPomo = isPomoActive;
            const isLimitBlock = isLimitExceeded && !isDetoxActive && !isPomoActive;

            setupBlockPage(targetEndTime, settings.custom_quotes || [], lang, isPomo, isLimitBlock, activeLimitMinutes);
          } else {
            // Remove hiding stylesheet if not active
            if (styleEl.parentNode) {
              styleEl.parentNode.removeChild(styleEl);
            }

            // Check warning banner: if remaining time <= 5 minutes (300 seconds)
            if (activeLimitMinutes > 0 && remainingSeconds > 0 && remainingSeconds <= 300) {
              showTopWarningBanner(Math.ceil(remainingSeconds / 60), lang, limitDomain);
            } else {
              removeWarningBanner();
            }
          }
        });
      }
    );
  }

  // Real-time listener for Pomodoro timer start/stop, screen time, or settings changes
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && (changes["pomodoro_timer_state"] || changes["screen_time_stats"])) {
      checkScreenTimeLimits();
    }
    if (areaName === "sync" && (
      changes["detox_enabled"] || 
      changes["detox_blocked_sites"] || 
      changes["detox_end_time"] || 
      changes["pomoBlockEnabled"] ||
      changes["detox_limits"]
    )) {
      checkScreenTimeLimits();
    }
  });

  // On startup
  checkScreenTimeLimits();

  function showTopWarningBanner(minutesLeft, lang, domain) {
    if (sessionStorage.getItem("detox_warning_dismissed") === "true") {
      return;
    }
    
    let banner = null;
    let host = document.getElementById("detox-warning-banner-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "detox-warning-banner-host";
      host.style.position = "fixed";
      host.style.top = "16px";
      host.style.left = "50%";
      host.style.transform = "translateX(-50%)";
      host.style.zIndex = "2147483647";
      host.style.pointerEvents = "auto";
      document.body.appendChild(host);
      
      const shadow = host.attachShadow({ mode: "open" });
      
      const wrapper = document.createElement("div");
      wrapper.id = "detox-warning-banner";
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.gap = "12px";
      wrapper.style.background = "rgba(15, 15, 20, 0.85)";
      wrapper.style.backdropFilter = "blur(12px)";
      wrapper.style.webkitBackdropFilter = "blur(12px)";
      wrapper.style.border = "1px solid rgba(239, 68, 68, 0.4)";
      wrapper.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.5)";
      wrapper.style.borderRadius = "12px";
      wrapper.style.padding = "10px 18px";
      wrapper.style.color = "#fff";
      wrapper.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      wrapper.style.fontSize = "13px";
      wrapper.style.fontWeight = "600";
      
      const textSpan = document.createElement("span");
      textSpan.id = "detox-warning-text";
      
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "✕";
      closeBtn.style.background = "transparent";
      closeBtn.style.border = "none";
      closeBtn.style.color = "rgba(255, 255, 255, 0.6)";
      closeBtn.style.cursor = "pointer";
      closeBtn.style.fontSize = "12px";
      closeBtn.style.padding = "2px 6px";
      closeBtn.addEventListener("click", () => {
        sessionStorage.setItem("detox_warning_dismissed", "true");
        host.remove();
      });
      
      wrapper.appendChild(textSpan);
      wrapper.appendChild(closeBtn);
      shadow.appendChild(wrapper);
      
      banner = textSpan;
    } else if (host.shadowRoot) {
      banner = host.shadowRoot.getElementById("detox-warning-text");
    }
    
    if (banner) {
      const siteLabel = domain.replace(".com", "").toUpperCase();
      banner.textContent = lang === "tr"
        ? `⚠️ Sosyal Medya Limiti: ${siteLabel} için kalan süreniz ${minutesLeft} dakika.`
        : `⚠️ Social Media Limit: You have ${minutesLeft} minutes left for ${siteLabel}.`;
    }
  }

  function removeWarningBanner() {
    const host = document.getElementById("detox-warning-banner-host");
    if (host) {
      host.remove();
    }
  }

  function setupBlockPage(endTime, customQuotes, lang, isPomo, isLimitBlock, activeLimitMinutes) {
    // Remove temporary hiding style element
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }

    // Apply viewport styles
    const applyStyles = () => {
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.height = "100vh";
      document.body.style.width = "100vw";
      document.body.style.overflow = "hidden";
      document.body.style.background =
        "radial-gradient(circle at 50% 50%, #1e1b4b 0%, #0d0d12 100%)";
      document.body.style.color = "#f8fafc";
      document.body.style.fontFamily = "'Inter', sans-serif";
      document.body.style.display = "flex";
      document.body.style.alignItems = "center";
      document.body.style.justifyContent = "center";
    };

    applyStyles();

    // Load fonts
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    // Default quotes pool
    const defaultQuotes = {
      tr: [
        '"Başlamanın yolu konuşmayı bırakıp yapmaya başlamaktır."',
        '"Gelecek, bugünden ona hazırlananlara aittir."',
        '"Zorluklar, başarının değerini artıran süslerdir."',
        '"En büyük zaferimiz hiç düşmemek değil, her düştüğümüzde tekrar ayağa kalkabilmektir."',
      ],
      en: [
        '"The way to get started is to quit talking and begin doing."',
        '"The future belongs to those who prepare for it today."',
        '"Difficulties strengthen the mind, as labor does the body."',
        '"Our greatest glory is not in never falling, but in rising every time we fall."',
      ],
    };

    function escapeHtml(str) {
      if (!str) {
        return "";
      }
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    const quotesPool =
      customQuotes.length > 0
        ? customQuotes.map((q) => `"${escapeHtml(q.text)}"`)
        : defaultQuotes[lang];
    const randomQuote =
      quotesPool[Math.floor(Math.random() * quotesPool.length)];

    let titleText = (lang === "tr" ? "Odaklanma Zamanı!" : "Time to Focus!");
    let descText = (lang === "tr" ? "Bu web sitesi, sosyal medya detoksunuz kapsamında engellenmiştir." : "This website is currently blocked as part of your social media detox.");

    if (isPomo) {
      titleText = (lang === "tr" ? "Odaklanma Zamanı!" : "Focus Session!");
      descText = (lang === "tr" ? "Bu web sitesi, aktif Pomodoro odaklanma seansınız boyunca geçici olarak engellenmiştir." : "This website is temporarily blocked during your active Pomodoro focus session.");
    } else if (isLimitBlock) {
      titleText = (lang === "tr" ? "Günlük Limite Ulaştınız!" : "Daily Limit Reached!");
      descText = lang === "tr"
        ? `Bu web sitesi için günlük ${activeLimitMinutes} dakikalık kullanım limitinizi doldurdunuz. Kendinize zaman ayırın!`
        : `You have reached your daily ${activeLimitMinutes}-minute usage limit for this website. Take a break!`;
    }

    const buttonText =
      lang === "tr" ? "Kontrol Paneline Git" : "Go to Dashboard";
    const timeRemainingLabel = isPomo
      ? (lang === "tr" ? "Kalan Odak Süresi" : "Remaining Focus Time")
      : (lang === "tr" ? "Detoks Süresi" : "Detox Duration");
    const permanentLabel = isLimitBlock 
      ? (lang === "tr" ? "Günlük Limit Doldu" : "Daily Limit Expired") 
      : (lang === "tr" ? "Süresiz Blok" : "Permanent Block");

    const blockHtml = `
      <div id="detox-block-card" style="
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        padding: 3rem;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        animation: fadeInUp 0.8s ease-out;
      ">
        <!-- Shield Icon SVG -->
        <div style="
          width: 64px;
          height: 64px;
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        ">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <h1 style="font-size: 1.8rem; font-weight: 700; margin: 0; color: #f8fafc; font-family: 'Inter', sans-serif;">${titleText}</h1>
        <p style="font-size: 0.95rem; color: #94a3b8; line-height: 1.6; margin: 0; font-family: 'Inter', sans-serif;">${descText}</p>

        <!-- Quote -->
        <div style="
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          padding: 1rem;
          margin: 0.5rem 0;
          font-style: italic;
          font-size: 0.85rem;
          color: #94a3b8;
          border-left: 3px solid #8b5cf6;
          width: 100%;
          font-family: 'Inter', sans-serif;
        ">
          ${randomQuote}
        </div>

        <!-- Timer badge -->
        <div id="detox-timer-badge" style="
          font-size: 0.8rem;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 6px 14px;
          border-radius: 50px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Inter', sans-serif;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span id="detox-timer-text">--:--</span>
        </div>

        <!-- Back Button -->
        <a href="chrome://newtab" style="
          margin-top: 0.5rem;
          background: #8b5cf6;
          color: white;
          text-decoration: none;
          padding: 10px 24px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s ease;
          width: 100%;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          font-family: 'Inter', sans-serif;
        " onmouseover="this.style.background='#7c3aed'" onmouseout="this.style.background='#8b5cf6'">
          ${buttonText}
        </a>
      </div>
    `;

    // Animations Styles
    const animStyle = document.createElement("style");
    animStyle.innerHTML = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(animStyle);

    let timerInterval = null;

    const setupDOMAndTimer = () => {
      applyStyles();
      document.body.innerHTML = blockHtml;
      const timerText = document.getElementById("detox-timer-text");

      if (timerInterval) {
        clearInterval(timerInterval);
      }

      if (endTime === -1) {
        if (timerText) {
          timerText.textContent = permanentLabel;
        }
      } else {
        const updateTimer = () => {
          const remaining = endTime - Date.now();
          if (remaining <= 0) {
            window.location.reload();
            return;
          }

          const hrs = Math.floor(remaining / 3600000);
          const mins = Math.floor((remaining % 3600000) / 60000);
          const secs = Math.floor((remaining % 60000) / 1000);

          let timeString = "";
          if (hrs > 0) {
            timeString += `${hrs.toString().padStart(2, "0")}:`;
          }
          timeString += `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

          const currentTimerText = document.getElementById("detox-timer-text");
          if (currentTimerText) {
            currentTimerText.textContent = `${timeRemainingLabel}: ${timeString}`;
          }
        };

        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
      }
    };

    setupDOMAndTimer();

    // Lock page structure with MutationObserver to block Single-Page-App client-side rendering
    const observer = new MutationObserver(() => {
      if (!document.getElementById("detox-block-card")) {
        observer.disconnect();
        setupDOMAndTimer();
        observer.observe(document.body, { childList: true, subtree: true });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // --- Universal Info Box & Inline Web Translator Bubble ---
  let bubbleHost = null;

  function initUniversalInfoBox() {
    chrome.storage.sync.get(
      ["universalInfoBoxEnabled", "universalInfoBoxHotkey"],
      (settings) => {
        const enabled = settings.universalInfoBoxEnabled ?? true;
        const hotkey = settings.universalInfoBoxHotkey || "none";

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

  function handleTextSelection(e, hotkey) {
    if (hotkey === "alt" && !e.altKey) {
      return;
    }
    if (hotkey === "ctrl" && !e.ctrlKey) {
      return;
    }
    if (hotkey === "shift" && !e.shiftKey) {
      return;
    }

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

      if (bubbleHost && bubbleHost.contains(e.target)) {
        return;
      }

      chrome.runtime.sendMessage(
        { type: "translate_text", text: text },
        (response) => {
          if (response && response.translation) {
            showTranslationBubble(response.translation, selection);
          }
        },
      );
    }, 10);
  }

  function handleOutsideClick(e) {
    if (bubbleHost) {
      const path = e.composedPath ? e.composedPath() : [];
      if (!path.includes(bubbleHost)) {
        removeBubble();
      }
    }
  }

  function removeBubble() {
    if (bubbleHost) {
      if (bubbleHost.parentNode) {
        bubbleHost.parentNode.removeChild(bubbleHost);
      }
      bubbleHost = null;
    }
  }

  function showTranslationBubble(translationText, selection) {
    removeBubble();

    bubbleHost = document.createElement("div");
    bubbleHost.style.position = "absolute";
    bubbleHost.style.zIndex = "2147483647";
    bubbleHost.style.pointerEvents = "auto";

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

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

    // Render off-screen initially to measure bounds
    bubbleHost.style.left = "-9999px";
    bubbleHost.style.top = "-9999px";
    document.body.appendChild(bubbleHost);

    const wrapperEl = shadow.querySelector(".bubble-wrapper");
    const wrapperHeight = wrapperEl ? wrapperEl.getBoundingClientRect().height : 60;

    const needsToRenderBelow = rect.top < wrapperHeight + 20;

    let bubbleY;
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

  initUniversalInfoBox();
})();

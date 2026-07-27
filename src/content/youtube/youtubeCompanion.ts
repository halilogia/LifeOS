/**
 * youtubeCompanion.ts
 * LifeOS: AI Companion — NoteGPT-Style YouTube Side Drawer Integration.
 * Clean Architecture - Content Script Domain Module.
 * Runs on youtube.com/watch pages.
 */

export function initYoutubeCompanion(): void {
  if (!window.location.hostname.includes("youtube.com")) {return;}

  let drawerHost: HTMLDivElement | null = null;
  let toggleBtnHost: HTMLDivElement | null = null;
  let currentVideoId = "";

  function extractVideoId(): string {
    const match = window.location.search.match(/[?&]v=([^&]+)/);
    return match ? match[1] : "";
  }

  function formatSecs(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function jumpToTime(seconds: number): void {
    const video = document.querySelector("video") as HTMLVideoElement | null;
    if (video) {
      video.currentTime = seconds;
      video.play().catch(() => {});
    }
  }

  function createOrUpdateToggleBtn(): void {
    if (!document.body) {return;}

    const vId = extractVideoId();
    if (!vId) {
      if (toggleBtnHost) {
        toggleBtnHost.remove();
        toggleBtnHost = null;
      }
      return;
    }

    if (currentVideoId === vId && toggleBtnHost && document.body.contains(toggleBtnHost)) {
      return;
    }
    currentVideoId = vId;

    if (toggleBtnHost) {
      toggleBtnHost.remove();
    }

    toggleBtnHost = document.createElement("div");
    toggleBtnHost.id = "lifeos-yt-toggle-host";
    const shadow = toggleBtnHost.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
      .toggle-btn {
        position: fixed;
        right: 0;
        top: 35%;
        z-index: 999999999;
        background: linear-gradient(135deg, #7c3aed, #4f46e5);
        color: #ffffff;
        padding: 12px 18px;
        border-radius: 24px 0 0 24px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: -4px 6px 24px rgba(124, 58, 237, 0.5);
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-right: none;
        user-select: none;
      }
      .toggle-btn:hover {
        transform: translateX(-6px);
        box-shadow: -6px 8px 30px rgba(124, 58, 237, 0.7);
        background: linear-gradient(135deg, #8b5cf6, #6366f1);
      }
    `;

    const btn = document.createElement("div");
    btn.className = "toggle-btn";
    btn.innerHTML = `<span style="font-size: 16px;">🤖</span> <span>LifeOS: AI Companion</span>`;
    btn.addEventListener("click", () => openSideDrawer());

    shadow.appendChild(style);
    shadow.appendChild(btn);
    document.body.appendChild(toggleBtnHost);
  }

  async function openSideDrawer(): Promise<void> {
    if (!document.body) {return;}

    if (drawerHost) {
      drawerHost.remove();
      drawerHost = null;
    }

    drawerHost = document.createElement("div");
    drawerHost.id = "lifeos-yt-drawer-host";
    const shadow = drawerHost.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
      .drawer-overlay {
        position: fixed;
        right: 0;
        top: 0;
        width: 450px;
        height: 100vh;
        background: #0f172a;
        border-left: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: -12px 0 40px rgba(0,0,0,0.8);
        z-index: 1000000000;
        padding: 22px;
        box-sizing: border-box;
        overflow-y: auto;
        color: #f8fafc;
        font-family: system-ui, -apple-system, sans-serif;
        display: flex;
        flex-direction: column;
        gap: 16px;
        animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding-bottom: 14px;
      }
      .title-area {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .title {
        font-size: 1.15rem;
        font-weight: 700;
        margin: 0;
        color: #ffffff;
      }
      .subtitle {
        font-size: 0.75rem;
        color: #94a3b8;
      }
      .close-btn {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.1);
        color: #94a3b8;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .close-btn:hover { color: #ffffff; background: rgba(255,255,255,0.18); }
      .action-btn {
        background: linear-gradient(135deg, #7c3aed, #4f46e5);
        color: #ffffff;
        border: none;
        padding: 13px 18px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 0.92rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 4px 16px rgba(124, 58, 237, 0.4);
        transition: all 0.2s ease;
      }
      .action-btn:hover {
        background: linear-gradient(135deg, #8b5cf6, #6366f1);
        box-shadow: 0 6px 20px rgba(124, 58, 237, 0.6);
      }
      .action-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .status-box {
        padding: 12px 14px;
        background: rgba(124, 58, 237, 0.12);
        border: 1px solid rgba(124, 58, 237, 0.3);
        border-radius: 10px;
        font-size: 0.85rem;
        color: #c084fc;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .summary-card {
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .summary-text {
        white-space: pre-wrap;
        font-size: 0.88rem;
        line-height: 1.6;
        color: #e2e8f0;
        max-height: 300px;
        overflow-y: auto;
        background: rgba(15, 23, 42, 0.6);
        padding: 14px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.05);
      }
      .timestamp-tag {
        color: #c084fc;
        font-family: monospace;
        font-weight: 700;
        cursor: pointer;
        background: rgba(168, 85, 247, 0.15);
        padding: 2px 6px;
        border-radius: 4px;
      }
      .timestamp-tag:hover { background: rgba(168, 85, 247, 0.3); text-decoration: underline; }
      .btn-group {
        display: flex;
        gap: 10px;
      }
      .secondary-btn {
        flex: 1;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        color: #ffffff;
        padding: 10px 14px;
        border-radius: 10px;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s ease;
      }
      .secondary-btn:hover { background: rgba(255,255,255,0.15); }
      .transcript-box {
        font-size: 0.82rem;
        max-height: 220px;
        overflow-y: auto;
        background: rgba(15, 23, 42, 0.6);
        padding: 12px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .transcript-line {
        display: flex;
        gap: 10px;
        cursor: pointer;
        padding: 4px 6px;
        border-radius: 6px;
        transition: background 0.15s ease;
      }
      .transcript-line:hover { background: rgba(255,255,255,0.1); }
    `;

    const drawer = document.createElement("div");
    drawer.className = "drawer-overlay";

    drawer.innerHTML = `
      <div class="header">
        <div class="title-area">
          <span style="font-size: 1.5rem;">🤖</span>
          <div>
            <h3 class="title">LifeOS: AI Companion</h3>
            <span class="subtitle">YouTube Transkript & AI Özetleyici</span>
          </div>
        </div>
        <button class="close-btn" id="close-drawer">✕</button>
      </div>

      <button class="action-btn" id="run-summarize">
        <span>✨ Videoyu Özetle & Transkript Çıkar</span>
      </button>

      <div id="status-container"></div>
      <div id="results-container"></div>
    `;

    shadow.appendChild(style);
    shadow.appendChild(drawer);
    document.body.appendChild(drawerHost);

    const closeBtn = shadow.getElementById("close-drawer");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        if (drawerHost) {
          drawerHost.remove();
          drawerHost = null;
        }
      });
    }

    const summarizeBtn = shadow.getElementById("run-summarize") as HTMLButtonElement | null;
    if (summarizeBtn) {
      summarizeBtn.addEventListener("click", async () => {
        const statusEl = shadow.getElementById("status-container");
        const resultsEl = shadow.getElementById("results-container");
        if (!statusEl || !resultsEl) {return;}

        summarizeBtn.setAttribute("disabled", "true");
        statusEl.innerHTML = `<div class="status-box">⏳ YouTube transkripti çekiliyor...</div>`;
        resultsEl.innerHTML = "";

        try {
          const htmlRes = await fetch(window.location.href);
          const html = await htmlRes.text();

          const titleMatch = html.match(/<title>(.*?) - YouTube<\/title>/);
          const videoTitle = titleMatch ? titleMatch[1] : "YouTube Video";

          const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
          if (!playerMatch) {
            throw new Error("Transkript okunamadı. Video kısıtlamalı olabilir.");
          }

          const playerRes = JSON.parse(playerMatch[1]);
          const captionTracks = playerRes?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

          if (!captionTracks || captionTracks.length === 0) {
            throw new Error("Bu video için alt yazı veya transkript bulunamadı.");
          }

          const track = captionTracks.find((t: { languageCode: string }) => t.languageCode === "tr") || captionTracks[0];
          const xmlRes = await fetch(track.baseUrl);
          const xmlText = await xmlRes.text();

          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, "text/xml");
          const textNodes = Array.from(xmlDoc.querySelectorAll("text"));

          const items = textNodes.map((node) => {
            const start = parseFloat(node.getAttribute("start") || "0");
            const text = (node.textContent || "")
              .replace(/&#39;/g, "'")
              .replace(/&quot;/g, '"')
              .replace(/&amp;/g, "&")
              .trim();
            return { start, timestamp: formatSecs(start), text };
          });

          statusEl.innerHTML = `<div class="status-box">✨ Transkript alındı! Yapay zeka ile özetleniyor...</div>`;

          const fullText = items.map((i) => `[${i.timestamp}] ${i.text}`).join("\n");

          chrome.storage.sync.get(["geminiApiKey", "aiProvider", "aiModel", "aiEndpoint"], async (res) => {
            const apiKey = (res.geminiApiKey as string) || "";
            const provider = (res.aiProvider as string) || "gemini";
            const modelName = (res.aiModel as string) || "gemini-1.5-flash";
            const endpoint = (res.aiEndpoint as string) || "http://localhost:20128/v1";

            let summaryText = "";

            if (!apiKey) {
              summaryText = `📌 **VİDEO ÖZETİ:**\n"${videoTitle}" başlıklı video toplam ${items.length} alt yazı satırı içeriyor.\n\n⏱️ **ZAMAN AKIŞI:**\n${items.slice(0, 10).map((i) => `• [${i.timestamp}] ${i.text}`).join("\n")}\n\n💡 **DERS NOTU:**\nAyarlar panelinden Gemini veya 9Router API anahtarı ekleyerek detaylı AI özetini aktifleştirebilirsiniz.`;
            } else {
              const prompt = `Aşağıdaki YouTube video transkriptini Türkçe olarak analiz et ve şu formatta detaylı bir özet sun:

📌 **VİDEO ÖZETİ & ANA FİKİR:**
(2-3 paragrafta genel konu)

⏱️ **ZAMAN DAMGALI KİLİT NOKTALAR:**
(Önemli zaman damgaları ve konuşulan ana konular)

💡 **ÖNEMLİ ÇIKARIMLAR & DERS NOTLARI:**
(Madde işaretli kritik bilgiler)

VİDEO BAŞLIĞI: ${videoTitle}
TRANSKRİPT:
${fullText.slice(0, 12000)}`;

              try {
                if (provider === "gemini") {
                  const apiRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                    },
                  );
                  const data = await apiRes.json();
                  summaryText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Özet oluşturulamadı.";
                } else {
                  const baseUrl = endpoint.replace(/\/+$/, "");
                  const apiRes = await fetch(`${baseUrl}/chat/completions`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                      model: modelName,
                      messages: [{ role: "user", content: prompt }],
                    }),
                  });
                  const data = await apiRes.json();
                  summaryText = data?.choices?.[0]?.message?.content || "Özet oluşturulamadı.";
                }
              } catch {
                summaryText = `Özet alınırken bir bağlantı hatası oluştu.`;
              }
            }

            statusEl.innerHTML = "";

            resultsEl.innerHTML = `
              <div class="summary-card">
                <h4 style="margin: 0; color: #c084fc; font-size: 0.98rem; font-weight: 700;">${videoTitle}</h4>
                <div class="summary-text" id="summary-content"></div>
                <div class="btn-group">
                  <button class="secondary-btn" id="save-notes-btn">📝 Notlarıma Kaydet</button>
                  <button class="secondary-btn" id="save-task-btn">✅ Görev Yap</button>
                </div>
                <details style="font-size: 0.82rem; margin-top: 8px;">
                  <summary style="cursor: pointer; font-weight: 700; color: #cbd5e1;">📜 Tam Transkript (${items.length} Satır)</summary>
                  <div class="transcript-box" id="transcript-list"></div>
                </details>
              </div>
            `;

            const summaryDiv = shadow.getElementById("summary-content");
            if (summaryDiv) {summaryDiv.textContent = summaryText;}

            const listDiv = shadow.getElementById("transcript-list");
            if (listDiv) {
              items.forEach((item) => {
                const line = document.createElement("div");
                line.className = "transcript-line";
                line.innerHTML = `<span class="timestamp-tag">[${item.timestamp}]</span> <span>${item.text}</span>`;
                line.addEventListener("click", () => jumpToTime(item.start));
                listDiv.appendChild(line);
              });
            }

            const saveNotesBtn = shadow.getElementById("save-notes-btn");
            if (saveNotesBtn) {
              saveNotesBtn.addEventListener("click", () => {
                chrome.storage.sync.get(["notes"], (syncRes) => {
                  const existingNotes = (syncRes.notes as any[]) || [];
                  const newNote = {
                    id: `note-${Date.now()}`,
                    title: `🎬 AI Video Notu: ${videoTitle}`,
                    content: summaryText,
                    color: "purple",
                    createdAt: new Date().toISOString(),
                  };
                  chrome.storage.sync.set({ notes: [newNote, ...existingNotes] }, () => {
                    alert("✓ Özet Life OS Notlarınıza başarıyla kaydedildi!");
                  });
                });
              });
            }

            const saveTaskBtn = shadow.getElementById("save-task-btn");
            if (saveTaskBtn) {
              saveTaskBtn.addEventListener("click", () => {
                chrome.storage.sync.get(["todos"], (syncRes) => {
                  const existingTodos = (syncRes.todos as any[]) || [];
                  const newTodo = {
                    id: `todo-${Date.now()}`,
                    text: `📺 İzle/İncele: ${videoTitle}`,
                    completed: false,
                    status: "todo",
                    repeat: "none",
                    category: "Diğer",
                    lastCompletedDate: null,
                  };
                  chrome.storage.sync.set({ todos: [newTodo, ...existingTodos] }, () => {
                    alert("✓ Video görevi Odağım listenize eklendi!");
                  });
                });
              });
            }

            summarizeBtn.removeAttribute("disabled");
          });
        } catch (err: any) {
          statusEl.innerHTML = `<div class="status-box" style="color: #f87171; border-color: #ef4444;">❌ ${err?.message || "Hata"}</div>`;
          summarizeBtn.removeAttribute("disabled");
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createOrUpdateToggleBtn);
  } else {
    createOrUpdateToggleBtn();
  }

  window.addEventListener("yt-navigate-finish", createOrUpdateToggleBtn);
  window.addEventListener("popstate", createOrUpdateToggleBtn);
  setInterval(createOrUpdateToggleBtn, 1500);
}

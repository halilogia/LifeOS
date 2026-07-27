import { useState } from "preact/hooks";
import { Language, Todo } from "@/types/types.js";
import {
  extractYoutubeVideoId,
  fetchYoutubeTranscript,
  TranscriptItem,
} from "@/services/aiCompanionService.js";
import { ChromeStorageNoteRepository } from "@/infrastructure/persistence/ChromeStorageNoteRepository.js";
import { ChromeStorageTodoRepository } from "@/infrastructure/persistence/ChromeStorageTodoRepository.js";
import { Note } from "@/domain/repositories/INoteRepository.js";

interface AICompanionModalProps {
  lang: Language;
  onClose: () => void;
}

const noteRepo = new ChromeStorageNoteRepository();
const todoRepo = new ChromeStorageTodoRepository();

export function AICompanionModal({ lang: _lang, onClose }: AICompanionModalProps) {
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [summary, setSummary] = useState("");
  const [savedSuccessMsg, setSavedSuccessMsg] = useState("");

  const handleAnalyzeYoutube = async () => {
    if (!urlInput.trim()) {return;}
    const videoId = extractYoutubeVideoId(urlInput);
    if (!videoId) {
      setStatusMsg("Lütfen geçerli bir YouTube video linki girin.");
      return;
    }

    setLoading(true);
    setStatusMsg("YouTube transkripti çekiliyor...");
    setSavedSuccessMsg("");

    try {
      const { title, items } = await fetchYoutubeTranscript(videoId);
      setVideoTitle(title);
      setTranscript(items);
      setStatusMsg("Transkript başarıyla alındı! Yapay zeka ile özetleniyor...");

      // Transkript metnini birleştir
      const fullText = items.map((i) => `[${i.timestamp}] ${i.text}`).join("\n");

      // Gemini / AI İsteyi Yap
      const res = await chrome.storage.sync.get([
        "geminiApiKey",
        "aiProvider",
        "aiModel",
        "aiEndpoint",
      ]);

      const apiKey = (res.geminiApiKey as string) || "";
      const provider = (res.aiProvider as string) || "gemini";
      const modelName = (res.aiModel as string) || "gemini-1.5-flash";
      const endpoint = (res.aiEndpoint as string) || "http://localhost:20128/v1";

      const prompt = `Aşağıdaki YouTube video transkriptini Türkçe olarak analiz et ve şu formatta detaylı bir özet sun:

📌 **VİDEO ÖZETİ & ANA FİKİR:**
(2-3 paragrafta genel konu)

⏱️ **ZAMAN DAMGALI KİLİT NOKTALAR:**
(Önemli zaman damgaları ve konuşulan ana konular)

💡 **ÖNEMLİ ÇIKARIMLAR & DERS NOTLARI:**
(Madde işaretli kritik bilgiler)

VİDEO BAŞLIĞI: ${title}
TRANSKRİPT:
${fullText.slice(0, 12000)}`;

      if (provider === "local" || !apiKey) {
        // Mock veya Local Akıllı Özet
        setSummary(`📌 **VİDEO ÖZETİ:**
"${title}" başlıklı video toplam ${items.length} alt yazı satırı içeriyor.

⏱️ **ÖNE ÇIKAN ZAMAN AKIŞI:**
${items
  .slice(0, 8)
  .map((i) => `• [${i.timestamp}] ${i.text}`)
  .join("\n")}

💡 **DERS NOTU:**
Video odaklanma ve öğrenme amaçlı olarak transkripte edilmiştir. Notlarınıza ekleyebilirsiniz.`);
      } else {
        // Direct Gemini API Call
        let aiResultText = "";
        if (provider === "gemini") {
          const apiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
              }),
            },
          );
          const data = await apiRes.json();
          aiResultText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Özet oluşturulamadı.";
        } else {
          // OpenRouter / 9Router Custom Endpoint
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
          aiResultText =
            data?.choices?.[0]?.message?.content || "Özet oluşturulamadı.";
        }

        setSummary(aiResultText);
      }

      setStatusMsg("");
    } catch (err: any) {
      console.error(err);
      setStatusMsg(err?.message || "Video analizi sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToNotes = async () => {
    if (!summary) {return;}
    try {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: `🎬 AI Video Notu: ${videoTitle || "YouTube Özeti"}`,
        content: summary,
        color: "purple",
        createdAt: new Date().toISOString(),
      };
      const existing = await noteRepo.getAll();
      await noteRepo.saveAll([newNote, ...existing]);
      setSavedSuccessMsg("✓ Özet başarıyla Günlüğüm & Notlar alanına eklendi!");
    } catch (err) {
      console.error("Save to notes failed:", err);
    }
  };

  const handleSaveToTasks = async () => {
    if (!summary) {return;}
    try {
      const newTask: Todo = {
        id: `todo-${Date.now()}`,
        text: `📺 İzle/İncele: ${videoTitle || "YouTube Videosu"}`,
        completed: false,
        status: "todo",
        repeat: "none",
        category: "Diğer",
        lastCompletedDate: null,
      };
      const existing = await todoRepo.getAll();
      await todoRepo.saveAll([newTask, ...existing]);
      setSavedSuccessMsg("✓ Görev odağım listesine eklendi!");
    } catch (err) {
      console.error("Save to tasks failed:", err);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div
        className="modal-container"
        style={{
          maxWidth: "750px",
          width: "90%",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--card-border)",
            paddingBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.4rem" }}>🤖</span>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
                LifeOS: AI Companion
              </h3>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                YouTube Video Transkript & Akıllı Sayfa Özetleyici
              </span>
            </div>
          </div>
          <button className="stock-btn stock-btn-secondary" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* URL Input Bar */}
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            className="stock-input"
            style={{ flex: 1, padding: "10px 14px", fontSize: "0.9rem" }}
            placeholder="YouTube Video URL yapıştırın (Örn: https://www.youtube.com/watch?v=...)"
            value={urlInput}
            onInput={(e) => setUrlInput((e.target as HTMLInputElement).value)}
          />
          <button
            className="stock-btn stock-btn-primary"
            disabled={loading}
            onClick={handleAnalyzeYoutube}
          >
            {loading ? "Analiz Ediliyor..." : "✨ Özetle & Transkript Çıkar"}
          </button>
        </div>

        {statusMsg && (
          <div
            style={{
              padding: "10px",
              background: "rgba(124, 58, 237, 0.1)",
              border: "1px solid var(--accent-color)",
              borderRadius: "8px",
              fontSize: "0.85rem",
              color: "white",
            }}
          >
            {statusMsg}
          </div>
        )}

        {savedSuccessMsg && (
          <div
            style={{
              padding: "10px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid #10b981",
              borderRadius: "8px",
              fontSize: "0.85rem",
              color: "#34d399",
              fontWeight: 600,
            }}
          >
            {savedSuccessMsg}
          </div>
        )}

        {/* Results Area */}
        {summary && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              background: "rgba(15, 23, 42, 0.5)",
              border: "1px solid var(--card-border)",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--accent-color)" }}>
                {videoTitle || "AI Video Analizi"}
              </h4>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="stock-btn stock-btn-primary"
                  style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                  onClick={handleSaveToNotes}
                >
                  📝 Notlarıma Kaydet
                </button>
                <button
                  className="stock-btn stock-btn-secondary"
                  style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                  onClick={handleSaveToTasks}
                >
                  ✅ Görev Yap
                </button>
              </div>
            </div>

            {/* AI Summary View */}
            <div
              style={{
                whiteSpace: "pre-wrap",
                fontSize: "0.88rem",
                lineHeight: "1.6",
                color: "var(--text-primary)",
                maxHeight: "300px",
                overflowY: "auto",
                background: "rgba(0,0,0,0.2)",
                padding: "12px",
                borderRadius: "8px",
              }}
            >
              {summary}
            </div>

            {/* Transcript Preview */}
            {transcript.length > 0 && (
              <details style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <summary style={{ cursor: "pointer", fontWeight: 600 }}>
                  📜 Tam Transkripti Göster ({transcript.length} Satır)
                </summary>
                <div
                  style={{
                    maxHeight: "180px",
                    overflowY: "auto",
                    marginTop: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    padding: "8px",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "6px",
                  }}
                >
                  {transcript.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "10px" }}>
                      <span
                        style={{
                          color: "var(--accent-color)",
                          fontFamily: "monospace",
                        }}
                      >
                        [{item.timestamp}]
                      </span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

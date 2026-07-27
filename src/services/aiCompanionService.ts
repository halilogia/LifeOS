/**
 * aiCompanionService.ts
 * LifeOS: AI Companion Service.
 * Transkript çıkarma (YouTube), Web makalesi metin ayıklama ve AI Özetleme Servisi.
 */

export interface TranscriptItem {
  start: number; // saniye
  timestamp: string; // "01:25"
  text: string;
}

export interface CompanionSummaryResult {
  title: string;
  summary: string;
  keyHighlights: string[];
  actionItems: string[];
  rawTranscript?: TranscriptItem[];
}

/**
 * YouTube URL'sinden Video ID'sini çıkarır
 */
export function extractYoutubeVideoId(url: string): string | null {
  const regExp =
    /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v=]|&v=))([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[1].length === 11 ? match[1] : null;
}

/**
 * Saniyeyi "MM:SS" veya "HH:MM:SS" formatına çevirir
 */
export function formatSecondsToTimestamp(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  const pad = (num: number) => String(num).padStart(2, "0");

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * YouTube sayfasından / API'den alt yazıları ve transkripti çeker
 */
export async function fetchYoutubeTranscript(
  videoId: string,
): Promise<{ title: string; items: TranscriptItem[] }> {
  try {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(watchUrl);
    if (!res.ok) {
      throw new Error(`YouTube video page fetch failed: ${res.status}`);
    }

    const html = await res.text();

    // Video Başlığını Al
    const titleMatch =
      html.match(/<title>(.*?) - YouTube<\/title>/) ||
      html.match(/<meta name="title" content="(.*?)">/);
    const title = titleMatch ? titleMatch[1] : "YouTube Video";

    // ytInitialPlayerResponse içinden captionTracks bul
    const playerResponseMatch = html.match(
      /ytInitialPlayerResponse\s*=\s*({.+?});/,
    );
    if (!playerResponseMatch) {
      throw new Error(
        "YouTube player response not found or video is restricted.",
      );
    }

    const playerResponse = JSON.parse(playerResponseMatch[1]);
    const captionTracks =
      playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!captionTracks || captionTracks.length === 0) {
      throw new Error(
        "Bu video için otomatik veya eklenmiş alt yazı/transkript bulunamadı.",
      );
    }

    // Türkçe (tr) veya varsayılan ilk alt yazıyı seç
    const track =
      captionTracks.find((t: any) => t.languageCode === "tr") ||
      captionTracks.find((t: any) => t.languageCode === "en") ||
      captionTracks[0];

    const xmlRes = await fetch(track.baseUrl);
    if (!xmlRes.ok) {
      throw new Error("Transkript detayı alınamadı.");
    }

    const xmlText = await xmlRes.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const textNodes = Array.from(xmlDoc.querySelectorAll("text"));

    const items: TranscriptItem[] = textNodes.map((node) => {
      const start = parseFloat(node.getAttribute("start") || "0");
      const text = node.textContent
        ? node.textContent
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, "&")
        : "";

      return {
        start,
        timestamp: formatSecondsToTimestamp(start),
        text: text.trim(),
      };
    });

    return { title, items };
  } catch (error) {
    console.error("fetchYoutubeTranscript error:", error);
    throw error;
  }
}

/**
 * Web sayfasındaki metni temizler
 */
export function extractCleanWebText(rawHtmlOrText: string): string {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = rawHtmlOrText;

  // Gürültülü elemanları kaldır
  const removeSelectors = [
    "script",
    "style",
    "nav",
    "footer",
    "header",
    "iframe",
    "svg",
    ".ad",
    ".ads",
    ".sidebar",
  ];
  removeSelectors.forEach((sel) => {
    tempDiv.querySelectorAll(sel).forEach((el) => el.remove());
  });

  return (tempDiv.textContent || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 15000); // Max 15k karakter
}

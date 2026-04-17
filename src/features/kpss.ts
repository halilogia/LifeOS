import { elements } from "../ui/dom.js";
import { storage } from "../core/storage.js";
// import { KpssProgress } from "../types/types.js"; // Unused import causing lint error

const kpssData: Record<string, string[]> = {
  turkce: [
    "Sözcükte Anlam",
    "Cümlede Anlam",
    "Paragraf Yapısı ve Anlamı",
    "Anlatım Teknikleri",
    "Ses Bilgisi",
    "Sözcükte Yapı",
    "Sözcük Türleri (İsim, Sıfat, Zamir...)",
    "Cümlenin Ögeleri",
    "Cümle Türleri",
    "Yazım Kuralları",
    "Noktalama İşaretleri",
    "Anlatım Bozuklukları",
    "Sözel Mantık",
    "Söz Sanatları",
  ],
  matematik: [
    "Temel Kavramlar",
    "Tek / Çift Sayılar",
    "Ardışık Sayılar",
    "Sayı Basamakları",
    "Bölünebilme Kuralları",
    "Faktöriyel / Asal Sayılar",
    "Basit Eşitsizlikler",
    "Mutlak Değer",
    "Rasyonel Sayılar",
    "Üslü / Köklü Sayılar",
    "Çarpanlara Ayırma",
    "1. Dereceden Denklemler",
    "Oran Orantı",
    "Sayı / Kesir Problemleri",
    "Yaş / Hareket Problemleri",
    "Yüzde / Kar / Zarar / Karışım",
    "İşçi Problemleri",
    "Grafik / Tablo Yorumlama",
    "Kümeler / Fonksiyonlar / İşlem",
    "Permütasyon / Kombinasyon / Olasılık",
    "İstatistik",
    "Sayısal Mantık",
  ],
  geometri: [
    "Geometrik Kavramlar ve Açılar",
    "Doğruda ve Üçgende Açılar",
    "Özel Üçgenler",
    "Açıortay / Kenarortay",
    "Üçgende Alan / Benzerlik",
    "Çokgenler ve Dörtgenler",
    "Çember ve Daire",
    "Analitik Geometri",
    "Katı Cisimler",
  ],
  tarih: [
    "Tarih Bilimi ve Kronoloji",
    "İslamiyet Öncesi Türk Tarihi",
    "İlk Türk İslam Devletleri",
    "Anadolu Selçuklu ve Beylikler",
    "Osmanlı Kültür ve Medeniyeti",
    "Osmanlı Siyaseti (Kuruluş-Dağılma)",
    "20. Yüzyılda Osmanlı",
    "Kurtuluş Savaşı Hazırlık",
    "I. TBMM ve Ayaklanmalar",
    "Kurtuluş Savaşı Cepheler",
    "Cumhuriyet ve İnkılaplar",
    "Atatürk İlkeleri",
    "Atatürk Dönemi Politika",
    "Çağdaş Türk ve Dünya Tarihi",
  ],
  cografya: [
    "Harita Bilgisi",
    "Türkiye’nin Coğrafi Konumu",
    "Türkiye’nin İklimi / Bitki Örtüsü",
    "Türkiye’nin Fiziki Özellikleri",
    "Nüfus ve Yerleşme",
    "Doğal Afetler",
    "Tarım / Hayvancılık",
    "Madenler / Enerji Kaynakları",
    "Sanayi ve Endüstri",
    "Ulaşım / Ticaret / Turizm",
    "Bölgeler Coğrafyası",
  ],
  vatandaslik: [
    "Temel Hukuk Kavramları",
    "Anayasa Hukuku ve Devlet Yapısı",
    "Türk Anayasa Tarihi",
    "Temel Hak ve Ödevler",
    "Yasama / Yürütme / Yargı",
    "İdare Hukuku",
    "Seçim ve Siyasi Partiler",
    "Uluslararası Örgütler",
    "Bilim ve Teknoloji Gelişmeleri",
    "Güncel Olaylar",
  ],
};

let currentSubject = "turkce";

export async function initKpss() {
  const container = elements.kpssTopicList();
  if (!container) {
    return;
  }

  // Subject buttons
  elements.kpssSubjectBtns().forEach((btn) => {
    btn.onclick = () => {
      elements.kpssSubjectBtns().forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentSubject = btn.dataset.subject || "turkce";
      renderKpssTopics();
    };
  });

  await renderKpssTopics();
}

async function renderKpssTopics() {
  const container = elements.kpssTopicList();
  if (!container) {
    return;
  }

  const progressList = await storage.getKpssProgress();
  const topics = kpssData[currentSubject] || [];

  container.innerHTML = "";

  topics.forEach((topic) => {
    const progress = progressList.find(
      (p) => p.subject === currentSubject && p.topic === topic,
    );
    const status = progress ? progress.status : 0;

    const item = document.createElement("div");
    item.className = "kpss-topic-item";
    item.setAttribute("data-status", status.toString());

    item.innerHTML = `
      <div class="kpss-status-indicator">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <span class="kpss-topic-name">${topic}</span>
    `;

    item.onclick = async () => {
      const currentStatus = parseInt(item.getAttribute("data-status") || "0");
      const nextStatus: 0 | 1 | 2 = ((currentStatus + 1) % 3) as 0 | 1 | 2;

      item.setAttribute("data-status", nextStatus.toString());
      await updateTopicStatus(currentSubject, topic, nextStatus);
      updateProgress(topics.length);
    };

    container.appendChild(item);
  });

  updateProgress(topics.length);
}

async function updateTopicStatus(
  subject: string,
  topic: string,
  status: 0 | 1 | 2,
) {
  const progressList = await storage.getKpssProgress();
  const index = progressList.findIndex(
    (p) => p.subject === subject && p.topic === topic,
  );

  if (index !== -1) {
    if (status === 0) {
      progressList.splice(index, 1);
    } else {
      progressList[index].status = status;
    }
  } else if (status !== 0) {
    progressList.push({ subject, topic, status });
  }

  await storage.setKpssProgress(progressList);
}

async function updateProgress(totalTopics: number) {
  const progressList = await storage.getKpssProgress();
  const subjectProgress = progressList.filter(
    (p) => p.subject === currentSubject && p.status === 2,
  );
  const percentage =
    totalTopics > 0
      ? Math.round((subjectProgress.length / totalTopics) * 100)
      : 0;

  const subjectNames: Record<string, string> = {
    turkce: "Türkçe",
    matematik: "Matematik",
    geometri: "Geometri",
    tarih: "Tarih",
    cografya: "Coğrafya",
    vatandaslik: "Vatandaşlık",
  };

  const titleEl = elements.kpssSubjectTitle();
  const textEl = elements.kpssProgressText();
  const fillEl = elements.kpssProgressFill();

  if (titleEl) {
    titleEl.textContent = subjectNames[currentSubject] || currentSubject;
  }
  if (textEl) {
    textEl.textContent = `%${percentage} tamamlandı`;
  }
  if (fillEl) {
    fillEl.style.width = `${percentage}%`;
  }
}

import { elements } from "../ui/dom.js";
import { storage } from "../core/storage.js";
// import { KpssProgress } from "../types/types.js"; // Unused import causing lint error

const kpssData: Record<string, string[]> = {
  turkce: [
    "Paragrafta Anlam",
    "Sözel Mantık",
    "Cümlede Anlam",
    "Sözcükte Anlam",
    "Yazım Kuralları",
    "Noktalama İşaretleri",
    "Dil Bilgisi Ses Olayları",
    "Sözcük Türleri",
    "Sözcükte Yapı",
    "Cümlenin Ögeleri",
    "Anlatım Bozuklukları",
    "Paragrafta Anlatım Biçimleri",
    "Cümle Türleri",
  ],
  matematik: [
    "Problemler",
    "Sayısal Mantık",
    "Olasılık",
    "Rasyonel Sayılar - Ondalıklı Sayılar",
    "Temel Kavramlar",
    "Üslü Sayılar",
    "Köklü Sayılar",
    "Çarpanlara Ayırma",
    "Basit Eşitsizlikler",
    "Mutlak Değer",
    "Oran - Orantı",
    "Denklem Çözme",
    "Kümeler",
    "Fonksiyonlar",
    "İşlem",
    "Permütasyon / Kombinasyon",
  ],
  geometri: [
    "Geometrik Kavramlar ve Açılar",
    "Çokgenler ve Dörtgenler",
    "Çember ve Daire",
    "Analitik Geometri",
    "Katı Cisimler",
  ],
  tarih: [
    "Osmanlı Devleti Kültür ve Uygarlık",
    "İnkılap Tarihi",
    "20. Yüzyıl Osmanlı Devleti",
    "Osmanlı Devleti Siyaseti",
    "Çağdaş Türk ve Dünya Tarihi",
    "Atatürk Dönemi İç ve Dış Politikalar",
    "Atatürk’ün İlke ve İnkılapları",
    "Kurtuluş Savaşı",
    "İlk Türk İslam Devletlerinde Kültür ve Uygarlık",
    "İslamiyet Öncesi Türk Tarihi (İlk ve Orta Çağda Türk Dünyası)",
    "İslamiyet Öncesi Türk Devletlerinde Kültür ve Uygarlık",
    "İlk Türk İslam Devletleri (Türklerin İslamiyeti Kabulü)",
  ],
  cografya: [
    "Türkiye’nin Fiziki Özellikleri",
    "Madenler ve Enerji Kaynakları",
    "Türkiye’nin İklimi ve Bitki Örtüsü",
    "Türkiye’de Nüfus ve Yerleşme",
    "Turizm",
    "Sanayi ve Endüstri",
    "Tarım",
    "Ulaşım",
    "Türkiye’nin Coğrafi Konumu",
    "Bölgeler Coğrafyası",
    "Ticaret",
    "Hayvancılık",
  ],
  vatandaslik: [
    "Anayasal Kavramlar",
    "Temel Hukuk Kavramları",
    "İdare Hukuku",
    "Yasama",
    "Yürütme",
    "Yargı",
    "Temel Hak ve Ödevler",
    "Türk Anayasa Tarihi",
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

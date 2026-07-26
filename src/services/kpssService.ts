/**
 * kpssService
 * Service layer for KPSS study tracker functionality.
 * Uses chrome.storage.sync directly instead of legacy core/storage.
 */

import type { KpssProgress, KpssDailyStats } from "../types/types.js";

export interface KpssTopic {
  title: string;
  description: string;
  questionsCount: number;
}

const KPSS_PROGRESS_KEY = "kpssProgress";
const KPSS_DAILY_STATS_KEY = "kpssDailyStats";

function getKpssProgressFromStorage(): Promise<KpssProgress[]> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([KPSS_PROGRESS_KEY], (result) => {
      resolve((result[KPSS_PROGRESS_KEY] as KpssProgress[]) || []);
    });
  });
}

function setKpssProgressToStorage(progressList: KpssProgress[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [KPSS_PROGRESS_KEY]: progressList }, resolve);
  });
}

function getKpssDailyStatsFromStorage(): Promise<KpssDailyStats[]> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([KPSS_DAILY_STATS_KEY], (result) => {
      resolve((result[KPSS_DAILY_STATS_KEY] as KpssDailyStats[]) || []);
    });
  });
}

function setKpssDailyStatsToStorage(stats: KpssDailyStats[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [KPSS_DAILY_STATS_KEY]: stats }, resolve);
  });
}

export const kpssData: Record<string, KpssTopic[]> = {
  turkce: [
    {
      title: "Sözcükte Anlam",
      description:
        "Gerçek anlam, yan anlam, mecaz anlam, eş ve zıt anlamlı kelimeler, deyimler ve atasözleri konularını kapsar.",
      questionsCount: 1.0,
    },
    {
      title: "Cümlede Anlam",
      description:
        "Öznel-nesnel yargılar, neden-sonuç, amaç-sonuç, koşul cümleleri ve cümle yorumlama.",
      questionsCount: 2.0,
    },
    {
      title: "Paragraf Yapısı ve Anlamı",
      description:
        "Ana düşünce, yardımcı düşünceler, paragrafın yapısı (giriş, gelişme, sonuç) ve akışı bozan cümleler.",
      questionsCount: 17.0,
    },
    {
      title: "Anlatım Teknikleri",
      description:
        "Öyküleme, betimleme, açıklama, tartışma yöntemleri ve düşünceyi geliştirme yolları.",
      questionsCount: 1.0,
    },
    {
      title: "Ses Bilgisi",
      description:
        "Ünlü ve ünsüz düşmesi, türemesi, benzeşmesi, yumuşaması gibi dil bilgisi ses kuralları.",
      questionsCount: 1.0,
    },
    {
      title: "Sözcükte Yapı",
      description:
        "Kök, gövde, yapım ve çekim ekleri, basit, türemiş ve birleşik sözcük yapıları.",
      questionsCount: 0.5,
    },
    {
      title: "Sözcük Türleri (İsim, Sıfat, Zamir...)",
      description:
        "İsim, sıfat, zamir, zarf, edat, bağlaç, ünlem ve fiillerin özellikleri.",
      questionsCount: 0.5,
    },
    {
      title: "Fiilimsiler ve Fiilde Çatı",
      description:
        "İsim-fiil, sıfat-fiil, zarf-fiil özellikleri ve etken, edilgen, geçişli, geçişsiz fiil çatıları.",
      questionsCount: 0.5,
    },
    {
      title: "Cümlenin Ögeleri",
      description:
        "Özne, yüklem, nesne, dolaylı tümleç ve zarf tümleci bulma yöntemleri.",
      questionsCount: 0.5,
    },
    {
      title: "Cümle Türleri",
      description:
        "Yüklemin türü, yeri, anlamı ve yapısı (basit, birleşik, sıralı, bağlı) yönünden cümle çeşitleri; Karma Dil Bilgisi sorularında sıkça çıkar.",
      questionsCount: 0.5,
    },
    {
      title: "Yazım Kuralları",
      description:
        "Büyük harflerin kullanımı, sayıların yazımı, birleşik sözcüklerin yazımı ve kısaltmalar.",
      questionsCount: 1.0,
    },
    {
      title: "Noktalama İşaretleri",
      description:
        "Nokta, virgül, noktalı virgül ve diğer işaretlerin doğru kullanım alanları.",
      questionsCount: 1.0,
    },
    {
      title: "Anlatım Bozuklukları",
      description:
        "Anlamsal ve yapısal anlatım bozuklukları, gereksiz sözcük kullanımı ve mantık hataları.",
      questionsCount: 0.5,
    },
    {
      title: "Sözel Mantık",
      description:
        "Verilen bilgiler ışığında akıl yürütme, tablolama ve çıkarım yapma soruları.",
      questionsCount: 3.0,
    },
  ],
  matematik: [
    {
      title: "Temel Kavramlar",
      description:
        "Rakamlar, sayılar, tam sayılar, doğal sayılar ve temel aritmetik işlemler.",
      questionsCount: 1.0,
    },
    {
      title: "Tek / Çift Sayılar",
      description:
        "Sayıların teklik ve çiftlik özellikleri ve bu sayılarla yapılan işlemlerin kuralları.",
      questionsCount: 1.0,
    },
    {
      title: "Ardışık Sayılar",
      description:
        "Belli bir kurala göre ardı ardına gelen sayı dizileri ve bunların toplam formülleri.",
      questionsCount: 1.0,
    },
    {
      title: "Sayı Basamakları",
      description: "Çözümleme, basamak değeri ve basamaklar arası işlemler.",
      questionsCount: 0.5,
    },
    {
      title: "Bölünebilme Kuralları",
      description:
        "2, 3, 4, 5, 8, 9, 10 ve 11 ile bölünebilme kuralları ve kalan bulma.",
      questionsCount: 0.5,
    },
    {
      title: "EBOB - EKOK",
      description:
        "En büyük ortak bölen, en küçük ortak kat bulma formülleri ve EBOB-EKOK problemleri.",
      questionsCount: 0.5,
    },
    {
      title: "Faktöriyel / Asal Sayılar",
      description:
        "Faktöriyel kavramı, asal sayılar ve aralarında asal sayılar özellikleri.",
      questionsCount: 0.5,
    },
    {
      title: "Basit Eşitsizlikler",
      description:
        "Büyüklük-küçüklük bağıntıları ve eşitsizliklerin çözüm kümeleri.",
      questionsCount: 0.5,
    },
    {
      title: "Mutlak Değer",
      description:
        "Bir sayının başlangıç noktasına uzaklığı ve mutlak değerli denklem/eşitsizlikler.",
      questionsCount: 1.0,
    },
    {
      title: "Rasyonel Sayılar",
      description:
        "Kesirler, ondalık gösterimler ve rasyonel sayılarda dört işlem.",
      questionsCount: 1.0,
    },
    {
      title: "Üslü / Köklü Sayılar",
      description:
        "Üslü ifadeler, köklü ifadeler ve bu ifadelerle yapılan temel matematiksel işlemler.",
      questionsCount: 2.0,
    },
    {
      title: "Çarpanlara Ayırma",
      description:
        "Özdeşlikler, ortak çarpan parantezine alma ve sadeleştirme yöntemleri.",
      questionsCount: 0.5,
    },
    {
      title: "1. Dereceden Denklemler",
      description: "Bilinmeyenli denklemler ve çözüm yolları.",
      questionsCount: 0.5,
    },
    {
      title: "Oran Orantı",
      description:
        "Doğru orantı, ters orantı, bileşik orantı ve ortalama kavramları.",
      questionsCount: 0.5,
    },
    {
      title: "Sayı / Kesir Problemleri",
      description:
        "Muhakeme yeteneğini ölçen sayısal ve kesirli problem türleri.",
      questionsCount: 4.0,
    },
    {
      title: "Yaş / Hareket Problemleri",
      description:
        "Yaş hesaplama ve hız-zaman-yol ilişkisi üzerine kurulu problemler.",
      questionsCount: 2.0,
    },
    {
      title: "Yüzde / Kar / Zarar / Karışım",
      description:
        "Yüzde hesaplamaları, ticari kar-zarar ve madde karışım problemleri.",
      questionsCount: 2.0,
    },
    {
      title: "Grafik ve Tablo Problemleri",
      description:
        "Daire, sütun ve çizgi grafikleri ile tabloları okuma, analiz etme ve yorumlama.",
      questionsCount: 2.0,
    },
    {
      title: "İstatistik",
      description:
        "Mod, medyan, açıklık ve standart sapma gibi temel istatistiksel veriler.",
      questionsCount: 0.5,
    },
    {
      title: "Kümeler",
      description:
        "Kümelerde temel kavramlar, birleşim, kesişim, fark işlemleri ve küme problemleri.",
      questionsCount: 1.0,
    },
    {
      title: "Fonksiyonlar",
      description:
        "Fonksiyon tanımı, çeşitleri, bileşke ve ters fonksiyon işlemleri.",
      questionsCount: 1.0,
    },
    {
      title: "Permütasyon / Kombinasyon / Olasılık",
      description:
        "Sıralama (permütasyon), seçme (kombinasyon) ve olasılık hesabı kuralları.",
      questionsCount: 1.0,
    },
    {
      title: "Modüler Aritmetik / İşlem",
      description:
        "Özel tanımlı işlemler, modül bulma ve periyodik tekrar eden problemler.",
      questionsCount: 0.5,
    },
    {
      title: "Sayısal Mantık",
      description:
        "Şekil yeteneği, sayı dizileri ve mantıksal çıkarım soruları.",
      questionsCount: 2.0,
    },
  ],
  geometri: [
    {
      title: "Geometrik Kavramlar ve Açılar",
      description: "Nokta, doğru, düzlem kavramları ve temel açı çeşitleri.",
      questionsCount: 0.2,
    },
    {
      title: "Doğruda ve Üçgende Açılar",
      description:
        "Paralel doğrular arası açılar ve üçgenin iç/dış açılarının özellikleri.",
      questionsCount: 0.3,
    },
    {
      title: "Özel Üçgenler",
      description:
        "Dik üçgen, ikizkenar üçgen ve eşkenar üçgenin kendine has özellikleri ve Pisagor teoremi.",
      questionsCount: 0.5,
    },
    {
      title: "Açıortay / Kenarortay",
      description: "Üçgende iç ve dış açıortay ile kenarortay teoremleri.",
      questionsCount: 0.2,
    },
    {
      title: "Üçgende Alan / Benzerlik",
      description:
        "Üçgenin alan formülleri ve üçgenler arasındaki benzerlik oranları.",
      questionsCount: 0.4,
    },
    {
      title: "Çokgenler ve Dörtgenler",
      description:
        "Kare, dikdörtgen, paralelkenar ve yamuk gibi geometrik şekillerin özellikleri.",
      questionsCount: 0.5,
    },
    {
      title: "Çember ve Daire",
      description:
        "Çemberde açılar, uzunluk ve dairenin alan/çevre hesaplamaları.",
      questionsCount: 0.4,
    },
    {
      title: "Analitik Geometri",
      description:
        "Koordinat sistemi, doğru denklemleri ve nokta-doğru ilişkileri.",
      questionsCount: 0.3,
    },
    {
      title: "Katı Cisimler",
      description:
        "Prizmalar, silindir, piramit ve küre gibi üç boyutlu şekillerin hacim ve alanları.",
      questionsCount: 0.2,
    },
  ],
  tarih: [
    {
      title: "İslamiyet Öncesi Türk Tarihi",
      description:
        "Orta Asya Türk devletleri (Hunlar, Göktürkler, Uygurlar) ve göç hareketleri.",
      questionsCount: 1.0,
    },
    {
      title: "İlk Türk İslam Devletleri",
      description:
        "Karahanlılar, Gazneliler ve Selçuklular dönemi siyasi ve kültürel gelişmeler.",
      questionsCount: 2.0,
    },
    {
      title: "Anadolu Selçuklu ve Beylikler",
      description:
        "Anadolu'nun türkleşmesi, Selçuklu devleti ve II. Beylikler dönemi.",
      questionsCount: 1.0,
    },
    {
      title: "Osmanlı Kültür ve Medeniyeti",
      description:
        "Devlet yönetimi, ordu, eğitim ve toplumsal yapı gibi Osmanlı kurumları.",
      questionsCount: 3.0,
    },
    {
      title: "Osmanlı Siyaseti (Kuruluş-Dağılma)",
      description:
        "Padişahlar dönemi fetihler, antlaşmalar ve devletin siyasi gelişimi.",
      questionsCount: 3.0,
    },
    {
      title: "20. Yüzyılda Osmanlı",
      description:
        "Trablusgarp Savaşı, Balkan Savaşları ve I. Dünya Savaşı süreci.",
      questionsCount: 2.0,
    },
    {
      title: "Kurtuluş Savaşı Hazırlık",
      description:
        "Genelgeler, kongreler ve Milli Mücadele'nin teşkilatlanma aşaması.",
      questionsCount: 3.0,
    },
    {
      title: "I. TBMM ve Ayaklanmalar",
      description:
        "Meclisin açılışı, kabul edilen kanunlar ve iç isyanlara karşı önlemler.",
      questionsCount: 1.0,
    },
    {
      title: "Kurtuluş Savaşı Cepheler",
      description:
        "Doğu, Güney ve Batı cepheleri; düzenli ordunun savaşları (Sakarya, Büyük Taarruz).",
      questionsCount: 3.0,
    },
    {
      title: "Cumhuriyet ve İnkılaplar",
      description:
        "Siyasi, sosyal ve hukuk alanında yapılan modernleşme adımları.",
      questionsCount: 4.0,
    },
    {
      title: "Atatürk İlkeleri",
      description:
        "Cumhuriyetçilik, Milliyetçilik, Halkçılık, Laiklik, Devletçilik, İnkılapçılık.",
      questionsCount: 1.0,
    },
    {
      title: "Atatürk Dönemi Politika",
      description:
        "İç politika gelişmeleri ve yurtta sulh cihanda sulh temelli dış politika.",
      questionsCount: 1.0,
    },
    {
      title: "Çağdaş Türk ve Dünya Tarihi",
      description:
        "II. Dünya Savaşı sonrası Türkiye ve dünyadaki önemli gelişmeler.",
      questionsCount: 2.0,
    },
  ],
  cografya: [
    {
      title: "Türkiye'nin Coğrafi Konumu",
      description:
        "Matematiksel ve özel konum, yerel saat farkları ve kuşak özellikleri.",
      questionsCount: 1.0,
    },
    {
      title: "Türkiye'nin Fiziki Özellikleri",
      description:
        "Dağlar, ovalar, platolar, akarsular ve yer şekillerinin oluşum süreçleri.",
      questionsCount: 3.0,
    },
    {
      title: "Türkiye'nin Toprak, Su ve Doğal Varlıkları",
      description:
        "Toprak tipleri, akarsu rejimleri, göller, yer altı suları ve doğal çevre özellikleri.",
      questionsCount: 1.0,
    },
    {
      title: "Türkiye'nin İklimi / Bitki Örtüsü",
      description:
        "Sıcaklık, basınç ve rüzgarların Türkiye üzerindeki etkileri ve bitki türleri.",
      questionsCount: 2.0,
    },
    {
      title: "Nüfus ve Yerleşme",
      description:
        "Nüfus sayımları, göçler, yerleşme tipleri ve nüfusun dağılışı.",
      questionsCount: 3.0,
    },
    {
      title: "Doğal Afetler",
      description:
        "Deprem, heyelan, erozyon ve sel gibi olayların nedenleri ve sonuçları.",
      questionsCount: 0.5,
    },
    {
      title: "Tarım / Hayvancılık",
      description:
        "Yetiştirilen tarım ürünleri ve bölgelere göre hayvancılık faaliyetleri.",
      questionsCount: 2.5,
    },
    {
      title: "Madenler / Enerji Kaynakları",
      description:
        "Yeraltı zenginlikleri, yenilenebilir ve yenilenemez enerji kaynakları.",
      questionsCount: 2.0,
    },
    {
      title: "Sanayi ve Endüstri",
      description: "Sanayi kollarının dağılışı, hammadde ve pazar ilişkileri.",
      questionsCount: 1.5,
    },
    {
      title: "Ulaşım / Ticaret / Turizm",
      description:
        "Türkiye'nin iç ve dış ticareti, ulaşım ağları ve önemli turizm merkezleri.",
      questionsCount: 1.0,
    },
    {
      title: "Bölgesel Kalkınma Projeleri",
      description:
        "GAP, DAP, KOP, DOKAP, ZBK gibi bölgesel kalkınma projelerinin kapsamı ve amaçları.",
      questionsCount: 0.5,
    },
  ],
  vatandaslik: [
    {
      title: "Temel Hukuk Kavramları",
      description: "Hukuk kuralları, haklar, ehliyetler ve yaptırım türleri.",
      questionsCount: 2.5,
    },
    {
      title: "Anayasa Hukuku ve Devlet Yapısı",
      description: "Devletin temel nitelikleri ve anayasal ilkeler.",
      questionsCount: 1.0,
    },
    {
      title: "Türk Anayasa Tarihi",
      description: "1921, 1924, 1961 ve 1982 anayasalarının temel özellikleri.",
      questionsCount: 0.5,
    },
    {
      title: "Temel Hak ve Ödevler",
      description: "Kişisel, sosyal ve siyasi hakların kapsamı ve güvenceleri.",
      questionsCount: 0.5,
    },
    {
      title: "Yasama / Yürütme / Yargı",
      description:
        "TBMM, Cumhurbaşkanlığı ve mahkemelerin görev, yetki ve işleyişleri.",
      questionsCount: 3.0,
    },
    {
      title: "İdare Hukuku",
      description:
        "Merkezden ve yerinden yönetim kuruluşları ve kamu görevlileri.",
      questionsCount: 2.0,
    },
    {
      title: "Seçim ve Siyasi Partiler",
      description: "Seçim sistemleri, partilerin kurulması ve siyasi katılım.",
      questionsCount: 0.5,
    },
    {
      title: "Uluslararası Örgütler",
      description:
        "BM, NATO, AB ve Türkiye'nin üye olduğu diğer uluslararası kuruluşlar.",
      questionsCount: 1.0,
    },
    {
      title: "Bilim ve Teknoloji Gelişmeleri",
      description: "Son yıllardaki bilimsel keşifler ve teknolojik yenilikler.",
      questionsCount: 2.0,
    },
    {
      title: "Güncel Olaylar",
      description:
        "Yılın önemli haberleri, kültürel başarılar ve güncel tartışmalar.",
      questionsCount: 2.0,
    },
  ],
};

export const kpssService = {
  /**
   * Retrieves user's KPSS topic checkmark progress.
   */
  getKpssProgress(): Promise<KpssProgress[]> {
    return getKpssProgressFromStorage();
  },

  /**
   * Sets the complete list of KPSS topic progress.
   */
  setKpssProgress(progressList: KpssProgress[]): Promise<void> {
    return setKpssProgressToStorage(progressList);
  },

  /**
   * Retrieves question history records.
   */
  getKpssDailyStats(): Promise<KpssDailyStats[]> {
    return getKpssDailyStatsFromStorage();
  },

  /**
   * Sets question history records.
   */
  setKpssDailyStats(stats: KpssDailyStats[]): Promise<void> {
    return setKpssDailyStatsToStorage(stats);
  },

  /**
   * Toggles the status of a specific subject topic.
   */
  async updateTopicStatus(
    subject: string,
    topic: string,
    status: 0 | 1 | 2,
    score?: number,
  ): Promise<void> {
    const progressList = await this.getKpssProgress();
    const index = progressList.findIndex(
      (p) => p.subject === subject && p.topic === topic,
    );

    if (index !== -1) {
      if (status === 0 && score === undefined) {
        progressList.splice(index, 1);
      } else {
        progressList[index].status = status;
        if (score !== undefined) {
          progressList[index].score = score;
        }
      }
    } else {
      progressList.push({ subject, topic, status, score });
    }

    await this.setKpssProgress(progressList);
  },

  /**
   * Appends or updates a day's KPSS question and video count stats.
   */
  async saveKpssDailyStats(
    questions: number,
    videos: number,
    subject: string,
  ): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    const stats = await this.getKpssDailyStats();

    const existingIdx = stats.findIndex((s) => s.date === today);
    if (existingIdx !== -1) {
      stats[existingIdx].questions += questions;
      stats[existingIdx].videos = (stats[existingIdx].videos || 0) + videos;
      stats[existingIdx].subject = subject;
    } else {
      stats.push({ date: today, questions, videos, subject });
    }

    // Keep only last 30 days
    if (stats.length > 30) {
      stats.shift();
    }

    await this.setKpssDailyStats(stats);
  },

  /**
   * Retrieves dynamic progress percentage for a subject.
   */
  async getSubjectProgressPercentage(
    subject: string,
    totalTopics: number,
  ): Promise<number> {
    const progressList = await this.getKpssProgress();
    const subjectProgress = progressList.filter(
      (p) => p.subject === subject && p.status === 2,
    );
    return totalTopics > 0
      ? Math.round((subjectProgress.length / totalTopics) * 100)
      : 0;
  },
};

export interface KpssFlashcard {
  id: string;
  question: string;
  answer: string;
  hint: string;
  category: string;
}

export const kpssDummyFlashcards: KpssFlashcard[] = [
  {
    id: "kpss_f1",
    question:
      "İlk Türk devletlerinde hükümdarın egemenlik yetkisini tanrısal kaynaklı almasına ne ad verilir?",
    answer: "Kut İnancı",
    hint: "K harfi ile başlar.",
    category: "Tarih",
  },
  {
    id: "kpss_f2",
    question:
      "Osmanlı Devleti'nde padişahın mutlak otoritesini sınırlandıran ilk yazılı belge hangisidir?",
    answer: "Sened-i İttifak (1808)",
    hint: "II. Mahmut dönemi, Ayanlar ile yapılmıştır.",
    category: "Tarih",
  },
  {
    id: "kpss_f3",
    question:
      "Türkiye'nin en yüksek zirvesi olan Ağrı Dağı hangi dağ oluşum türüne (orojenez) örnektir?",
    answer: "Volkanik Dağ",
    hint: "Magmanın yeryüzüne çıkıp soğumasıyla oluşmuştur.",
    category: "Coğrafya",
  },
  {
    id: "kpss_f4",
    question:
      "Osmanlı Devleti ile Rusya arasında yapılan ve Osmanlı'nın ilk kez savaş tazminatı ödediği antlaşma hangisidir?",
    answer: "Küçük Kaynarca Antlaşması (1774)",
    hint: "Kırım'ın bağımsız olduğu antlaşmadır.",
    category: "Tarih",
  },
  {
    id: "kpss_f5",
    question:
      "1982 Anayasası'na göre TBMM milletvekili genel seçimleri kaç yılda bir yapılır?",
    answer: "5 yılda bir",
    hint: "Cumhurbaşkanlığı seçimleri ile aynı gün yapılır.",
    category: "Vatandaşlık",
  },
  {
    id: "kpss_f6",
    question:
      "Türkiye'de doğup Gürcistan topraklarından Karadeniz'e dökülen, en hızlı akışa sahip nehir hangisidir?",
    answer: "Çoruh Nehri",
    hint: "Doğu Karadeniz bölümündedir.",
    category: "Coğrafya",
  },
  {
    id: "kpss_f7",
    question:
      "Kurtuluş Savaşı cepheler dönemini kapatan ve Mudanya Ateşkes Antlaşması'na zemin hazırlayan son askeri zafer hangisidir?",
    answer: "Büyük Taarruz (Başkomutanlık Meydan Muharebesi)",
    hint: "Ordular ilk hedefiniz Akdeniz'dir emrinin verildiği savaş.",
    category: "Tarih",
  },
  {
    id: "kpss_f8",
    question:
      "Anayasa Mahkemesi üye sayısı 2017 anayasa değişikliği ile kaç olarak belirlenmiştir?",
    answer: "15 Üye",
    hint: "Üyelerin bir kısmını Cumhurbaşkanı, bir kısmını TBMM seçer.",
    category: "Vatandaşlık",
  },
  {
    id: "kpss_f9",
    question:
      "Ülkemizde rüzgar erozyonunun ve rüzgar şekillerinin en fazla görüldüğü coğrafi bölge hangisidir?",
    answer: "İç Anadolu Bölgesi",
    hint: "Kuraklık ve bitki örtüsünün cılız olması etkilidir.",
    category: "Coğrafya",
  },
  {
    id: "kpss_f10",
    question:
      "Milli Mücadele'nin gerekçesi, amacı ve yönteminin ilk kez belirtildiği ihtilal belgesi niteliğindeki genelge hangisidir?",
    answer: "Amasya Genelgesi (1919)",
    hint: "Mustafa Kemal, Rauf Orbay, Ali Fuat Cebesoy gibi isimlerin imzası bulunur.",
    category: "Tarih",
  },
];

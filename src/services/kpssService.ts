/* eslint-disable max-lines */
import { storage } from "@/core/storage.js";
import { KpssProgress, KpssDailyStats } from "@/types/types.js";

export interface KpssTopic {
  title: string;
  description: string;
}

export const kpssData: Record<string, KpssTopic[]> = {
  turkce: [
    {
      title: "Sözcükte Anlam",
      description:
        "Gerçek anlam, yan anlam, mecaz anlam, eş ve zıt anlamlı kelimeler, deyimler ve atasözleri konularını kapsar.",
    },
    {
      title: "Cümlede Anlam",
      description:
        "Öznel-nesnel yargılar, neden-sonuç, amaç-sonuç, koşul cümleleri ve cümle yorumlama.",
    },
    {
      title: "Paragraf Yapısı ve Anlamı",
      description:
        "Ana düşünce, yardımcı düşünceler, paragrafın yapısı (giriş, gelişme, sonuç) ve akışı bozan cümleler.",
    },
    {
      title: "Anlatım Teknikleri",
      description:
        "Öyküleme, betimleme, açıklama, tartışma yöntemleri ve düşünceyi geliştirme yolları.",
    },
    {
      title: "Ses Bilgisi",
      description:
        "Ünlü ve ünsüz düşmesi, türemesi, benzeşmesi, yumuşaması gibi dil bilgisi ses kuralları.",
    },
    {
      title: "Sözcükte Yapı",
      description:
        "Kök, gövde, yapım ve çekim ekleri, basit, türemiş ve birleşik sözcük yapıları.",
    },
    {
      title: "Sözcük Türleri (İsim, Sıfat, Zamir...)",
      description:
        "İsim, sıfat, zamir, zarf, edat, bağlaç, ünlem ve fiillerin özellikleri.",
    },
    {
      title: "Cümlenin Ögeleri",
      description:
        "Özne, yüklem, nesne, dolaylı tümleç ve zarf tümleci bulma yöntemleri.",
    },
    {
      title: "Cümle Türleri",
      description:
        "Yapısına (basit, birleşik, sıralı, bağlı) ve anlamına göre cümle çeşitleri.",
    },
    {
      title: "Yazım Kuralları",
      description:
        "Büyük harflerin kullanımı, sayıların yazımı, birleşik sözcüklerin yazımı ve kısaltmalar.",
    },
    {
      title: "Noktalama İşaretleri",
      description:
        "Nokta, virgül, noktalı virgül ve diğer işaretlerin doğru kullanım alanları.",
    },
    {
      title: "Anlatım Bozuklukları",
      description:
        "Anlamsal ve yapısal anlatım bozuklukları, gereksiz sözcük kullanımı ve mantık hataları.",
    },
    {
      title: "Sözel Mantık",
      description:
        "Verilen bilgiler ışığında akıl yürütme, tablolama ve çıkarım yapma soruları.",
    },
  ],
  matematik: [
    {
      title: "Temel Kavramlar",
      description:
        "Rakamlar, sayılar, tam sayılar, doğal sayılar ve temel aritmetik işlemler.",
    },
    {
      title: "Tek / Çift Sayılar",
      description:
        "Sayıların teklik ve çiftlik özellikleri ve bu sayılarla yapılan işlemlerin kuralları.",
    },
    {
      title: "Ardışık Sayılar",
      description:
        "Belli bir kurala göre ardı ardına gelen sayı dizileri ve bunların toplam formülleri.",
    },
    {
      title: "Sayı Basamakları",
      description: "Çözümleme, basamak değeri ve basamaklar arası işlemler.",
    },
    {
      title: "Bölünebilme Kuralları",
      description:
        "2, 3, 4, 5, 8, 9, 10 ve 11 ile bölünebilme kuralları ve kalan bulma.",
    },
    {
      title: "Faktöriyel / Asal Sayılar",
      description:
        "Faktöriyel kavramı, asal sayılar ve aralarında asal sayılar özellikleri.",
    },
    {
      title: "Basit Eşitsizlikler",
      description:
        "Büyüklük-küçüklük bağıntıları ve eşitsizliklerin çözüm kümeleri.",
    },
    {
      title: "Mutlak Değer",
      description:
        "Bir sayının başlangıç noktasına uzaklığı ve mutlak değerli denklem/eşitsizlikler.",
    },
    {
      title: "Rasyonel Sayılar",
      description:
        "Kesirler, ondalık gösterimler ve rasyonel sayılarda dört işlem.",
    },
    {
      title: "Üslü / Köklü Sayılar",
      description:
        "Üslü ifadeler, köklü ifadeler ve bu ifadelerle yapılan temel matematiksel işlemler.",
    },
    {
      title: "Çarpanlara Ayırma",
      description:
        "Özdeşlikler, ortak çarpan parantezine alma ve sadeleştirme yöntemleri.",
    },
    {
      title: "1. Dereceden Denklemler",
      description: "Bilinmeyenli denklemler ve çözüm yolları.",
    },
    {
      title: "Oran Orantı",
      description:
        "Doğru orantı, ters orantı, bileşik orantı ve ortalama kavramları.",
    },
    {
      title: "Sayı / Kesir Problemleri",
      description:
        "Muhakeme yeteneğini ölçen sayısal ve kesirli problem türleri.",
    },
    {
      title: "Yaş / Hareket Problemleri",
      description:
        "Yaş hesaplama ve hız-zaman-yol ilişkisi üzerine kurulu problemler.",
    },
    {
      title: "Yüzde / Kar / Zarar / Karışım",
      description:
        "Yüzde hesaplamaları, ticari kar-zarar ve madde karışım problemleri.",
    },
    {
      title: "İstatistik",
      description:
        "Mod, medyan, açıklık ve standart sapma gibi temel istatistiksel veriler.",
    },
    {
      title: "Sayısal Mantık",
      description:
        "Şekil yeteneği, sayı dizileri ve mantıksal çıkarım soruları.",
    },
  ],
  geometri: [
    {
      title: "Geometrik Kavramlar ve Açılar",
      description: "Nokta, doğru, düzlem kavramları ve temel açı çeşitleri.",
    },
    {
      title: "Doğruda ve Üçgende Açılar",
      description:
        "Paralel doğrular arası açılar ve üçgenin iç/dış açılarının özellikleri.",
    },
    {
      title: "Özel Üçgenler",
      description:
        "Dik üçgen, ikizkenar üçgen ve eşkenar üçgenin kendine has özellikleri ve Pisagor teoremi.",
    },
    {
      title: "Açıortay / Kenarortay",
      description: "Üçgende iç ve dış açıortay ile kenarortay teoremleri.",
    },
    {
      title: "Üçgende Alan / Benzerlik",
      description:
        "Üçgenin alan formülleri ve üçgenler arasındaki benzerlik oranları.",
    },
    {
      title: "Çokgenler ve Dörtgenler",
      description:
        "Kare, dikdörtgen, paralelkenar ve yamuk gibi geometrik şekillerin özellikleri.",
    },
    {
      title: "Çember ve Daire",
      description:
        "Çemberde açılar, uzunluk ve dairenin alan/çevre hesaplamaları.",
    },
    {
      title: "Analitik Geometri",
      description:
        "Koordinat sistemi, doğru denklemleri ve nokta-doğru ilişkileri.",
    },
    {
      title: "Katı Cisimler",
      description:
        "Prizmalar, silindir, piramit ve küre gibi üç boyutlu şekillerin hacim ve alanları.",
    },
  ],
  tarih: [
    {
      title: "Tarih Bilimi ve Kronoloji",
      description:
        "Tarih araştırmaları, takvimler ve ana tarihi dönemlerin sınıflandırılması.",
    },
    {
      title: "İslamiyet Öncesi Türk Tarihi",
      description:
        "Orta Asya Türk devletleri (Hunlar, Göktürkler, Uygurlar) ve göç hareketleri.",
    },
    {
      title: "İlk Türk İslam Devletleri",
      description:
        "Karahanlılar, Gazneliler ve Selçuklular dönemi siyasi ve kültürel gelişmeler.",
    },
    {
      title: "Anadolu Selçuklu ve Beylikler",
      description:
        "Anadolu'nun türkleşmesi, Selçuklu devleti ve II. Beylikler dönemi.",
    },
    {
      title: "Osmanlı Kültür ve Medeniyeti",
      description:
        "Devlet yönetimi, ordu, eğitim ve toplumsal yapı gibi Osmanlı kurumları.",
    },
    {
      title: "Osmanlı Siyaseti (Kuruluş-Dağılma)",
      description:
        "Padişahlar dönemi fetihler, antlaşmalar ve devletin siyasi gelişimi.",
    },
    {
      title: "20. Yüzyılda Osmanlı",
      description:
        "Trablusgarp Savaşı, Balkan Savaşları ve I. Dünya Savaşı süreci.",
    },
    {
      title: "Kurtuluş Savaşı Hazırlık",
      description:
        "Genelgeler, kongreler ve Milli Mücadele'nin teşkilatlanma aşaması.",
    },
    {
      title: "I. TBMM ve Ayaklanmalar",
      description:
        "Meclisin açılışı, kabul edilen kanunlar ve iç isyanlara karşı önlemler.",
    },
    {
      title: "Kurtuluş Savaşı Cepheler",
      description:
        "Doğu, Güney ve Batı cepheleri; düzenli ordunun savaşları (Sakarya, Büyük Taarruz).",
    },
    {
      title: "Cumhuriyet ve İnkılaplar",
      description:
        "Siyasi, sosyal ve hukuk alanında yapılan modernleşme adımları.",
    },
    {
      title: "Atatürk İlkeleri",
      description:
        "Cumhuriyetçilik, Milliyetçilik, Halkçılık, Laiklik, Devletçilik, İnkılapçılık.",
    },
    {
      title: "Atatürk Dönemi Politika",
      description:
        "İç politika gelişmeleri ve yurtta sulh cihanda sulh temelli dış politika.",
    },
    {
      title: "Çağdaş Türk ve Dünya Tarihi",
      description:
        "II. Dünya Savaşı sonrası Türkiye ve dünyadaki önemli gelişmeler.",
    },
  ],
  cografya: [
    {
      title: "Harita Bilgisi",
      description: "Ölçekler, projeksiyonlar ve harita okuma teknikleri.",
    },
    {
      title: "Türkiye’nin Coğrafi Konumu",
      description:
        "Matematiksel ve özel konum, yerel saat farkları ve kuşak özellikleri.",
    },
    {
      title: "Türkiye’nin İklimi / Bitki Örtüsü",
      description:
        "Sıcaklık, basınç ve rüzgarların Türkiye üzerindeki etkileri ve bitki türleri.",
    },
    {
      title: "Türkiye’nin Fiziki Özellikleri",
      description:
        "Dağlar, ovalar, platolar, akarsular ve yer şekillerinin oluşum süreçleri.",
    },
    {
      title: "Nüfus ve Yerleşme",
      description:
        "Nüfus sayımları, göçler, yerleşme tipleri ve nüfusun dağılışı.",
    },
    {
      title: "Doğal Afetler",
      description:
        "Deprem, heyelan, erozyon ve sel gibi olayların nedenleri ve sonuçları.",
    },
    {
      title: "Tarım / Hayvancılık",
      description:
        "Yetiştirilen tarım ürünleri ve bölgelere göre hayvancılık faaliyetleri.",
    },
    {
      title: "Madenler / Enerji Kaynakları",
      description:
        "Yeraltı zenginlikleri, yenilenebilir ve yenilenemez energy kaynakları.",
    },
    {
      title: "Sanayi ve Endüstri",
      description: "Sanayi kollarının dağılışı, hammadde ve pazar ilişkileri.",
    },
    {
      title: "Ulaşım / Ticaret / Turizm",
      description:
        "Türkiye'nin iç ve dış ticareti, ulaşım ağları ve önemli turizm merkezleri.",
    },
    {
      title: "Bölgeler Coğrafyası",
      description:
        "Türkiye'nin 7 bölgesinin kendine has fiziki ve beşeri özellikleri.",
    },
  ],
  vatandaslik: [
    {
      title: "Temel Hukuk Kavramları",
      description: "Hukuk kuralları, haklar, ehliyetler ve yaptırım türleri.",
    },
    {
      title: "Anayasa Hukuku ve Devlet Yapısı",
      description: "Devletin temel nitelikleri ve anayasal ilkeler.",
    },
    {
      title: "Türk Anayasa Tarihi",
      description: "1921, 1924, 1961 ve 1982 anayasalarının temel özellikleri.",
    },
    {
      title: "Temel Hak ve Ödevler",
      description: "Kişisel, sosyal ve siyasi hakların kapsamı ve güvenceleri.",
    },
    {
      title: "Yasama / Yürütme / Yargı",
      description:
        "TBMM, Cumhurbaşkanlığı ve mahkemelerin görev, yetki ve işleyişleri.",
    },
    {
      title: "İdare Hukuku",
      description:
        "Merkezden ve yerinden yönetim kuruluşları ve kamu görevlileri.",
    },
    {
      title: "Seçim ve Siyasi Partiler",
      description: "Seçim sistemleri, partilerin kurulması ve siyasi katılım.",
    },
    {
      title: "Uluslararası Örgütler",
      description:
        "BM, NATO, AB ve Türkiye'nin üye olduğu diğer uluslararası kuruluşlar.",
    },
    {
      title: "Bilim ve Teknoloji Gelişmeleri",
      description: "Son yıllardaki bilimsel keşifler ve teknolojik yenilikler.",
    },
    {
      title: "Güncel Olaylar",
      description:
        "Yılın önemli haberleri, kültürel başarılar ve güncel tartışmalar.",
    },
  ],
};

export const kpssService = {
  /**
   * Retrieves user's KPSS topic checkmark progress.
   */
  getKpssProgress(): Promise<KpssProgress[]> {
    return storage.getKpssProgress();
  },

  /**
   * Sets the complete list of KPSS topic progress.
   */
  setKpssProgress(progressList: KpssProgress[]): Promise<void> {
    return storage.setKpssProgress(progressList);
  },

  /**
   * Retrieves question history records.
   */
  getKpssDailyStats(): Promise<KpssDailyStats[]> {
    return storage.getKpssDailyStats();
  },

  /**
   * Sets question history records.
   */
  setKpssDailyStats(stats: KpssDailyStats[]): Promise<void> {
    return storage.setKpssDailyStats(stats);
  },

  /**
   * Toggles the status of a specific subject topic.
   */
  async updateTopicStatus(
    subject: string,
    topic: string,
    status: 0 | 1 | 2
  ): Promise<void> {
    const progressList = await this.getKpssProgress();
    const index = progressList.findIndex(
      (p) => p.subject === subject && p.topic === topic
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

    await this.setKpssProgress(progressList);
  },

  /**
   * Appends or updates a day's KPSS question count stats.
   */
  async saveKpssDailyStats(questions: number, subject: string): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    const stats = await this.getKpssDailyStats();

    const existingIdx = stats.findIndex((s) => s.date === today);
    if (existingIdx !== -1) {
      stats[existingIdx].questions += questions;
      stats[existingIdx].subject = subject;
    } else {
      stats.push({ date: today, questions, subject });
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
  async getSubjectProgressPercentage(subject: string, totalTopics: number): Promise<number> {
    const progressList = await this.getKpssProgress();
    const subjectProgress = progressList.filter(
      (p) => p.subject === subject && p.status === 2
    );
    return totalTopics > 0 ? Math.round((subjectProgress.length / totalTopics) * 100) : 0;
  }
};

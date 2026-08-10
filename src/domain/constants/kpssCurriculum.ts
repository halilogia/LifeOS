/**
 * kpssCurriculum.ts
 * Static KPSS exam subjects & curriculum topic breakdown dataset.
 * Data source: archives/ders_konu_analizi.xlsx (2019-2025 KPSS Lisans ortalamaları)
 */

export interface KpssTopic {
  title: string;
  description: string;
  questionsCount: number;
  /** Kitaptaki bölüm başlıklarından türetilmiş alt konular (bilgilendirme amaçlı) */
  subtopics?: string[];
}

export const kpssData: Record<string, KpssTopic[]> = {
  turkce: [
    {
      title: "Sözcükte Anlam",
      description:
        "Gerçek anlam, yan anlam, mecaz anlam, eş ve zıt anlamlı kelimeler, deyimler ve atasözleri konularını kapsar.",
      questionsCount: 1.17,
    },
    {
      title: "Cümlede Anlam",
      description:
        "Öznel-nesnel yargılar, neden-sonuç, amaç-sonuç, koşul cümleleri ve cümle yorumlama.",
      questionsCount: 1.67,
    },
    {
      title: "Paragraf",
      description:
        "Ana düşünce, yardımcı düşünceler, paragrafın yapısı (giriş, gelişme, sonuç) ve akışı bozan cümleler.",
      questionsCount: 15.0,
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
      questionsCount: 1.17,
    },
    {
      title: "Sözcük Türleri",
      description:
        "İsim, sıfat, zamir, zarf, edat, bağlaç, ünlem ve fiillerin özellikleri.",
      questionsCount: 1.67,
    },
    {
      title: "Cümlenin Ögeleri",
      description:
        "Özne, yüklem, nesne, dolaylı tümleç ve zarf tümleci bulma yöntemleri.",
      questionsCount: 1.17,
    },
    {
      title: "Cümle Türleri",
      description:
        "Yüklemin türü, yeri, anlamı ve yapısı (basit, birleşik, sıralı, bağlı) yönünden cümle çeşitleri; Karma Dil Bilgisi sorularında sıkça çıkar.",
      questionsCount: 0.17,
    },
    {
      title: "Yazım Kuralları",
      description:
        "Büyük harflerin kullanımı, sayıların yazımı, birleşik sözcüklerin yazımı ve kısaltmalar.",
      questionsCount: 1.17,
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
      questionsCount: 0.67,
    },
    {
      title: "Sözel Mantık",
      description:
        "Verilen bilgiler ışığında akıl yürütme, tablolama ve çıkarım yapma soruları.",
      questionsCount: 4.0,
    },
  ],
  matematik: [
    {
      title: "Temel Kavramlar",
      description:
        "Rakamlar, sayılar, tam sayılar, doğal sayılar ve temel aritmetik işlemler.",
      questionsCount: 0.43,
    },
    {
      title: "Tek / Çift Sayılar",
      description:
        "Sayıların teklik ve çiftlik özellikleri ve bu sayılarla yapılan işlemlerin kuralları.",
      questionsCount: 0.86,
    },
    {
      title: "Ardışık Sayılar",
      description:
        "Belli bir kurala göre ardı ardına gelen sayı dizileri ve bunların toplam formülleri.",
      questionsCount: 0.43,
    },
    {
      title: "Sayı Basamakları",
      description: "Çözümleme, basamak değeri ve basamaklar arası işlemler.",
      questionsCount: 0.43,
    },
    {
      title: "Dört İşlem",
      description:
        "Toplama, çıkarma, çarpma ve bölme işlemlerinde işlem önceliği ve stratejileri.",
      questionsCount: 0.57,
    },
    {
      title: "Bölünebilme Kuralları",
      description:
        "2, 3, 4, 5, 8, 9, 10 ve 11 ile bölünebilme kuralları ve kalan bulma.",
      questionsCount: 0.86,
    },
    {
      title: "Faktöriyel",
      description:
        "Faktöriyel kavramı, faktöriyelli işlemler ve sondan kaç basamağın sıfır olduğunu bulma.",
      questionsCount: 0.14,
    },
    {
      title: "Asal Sayılar",
      description:
        "Asal sayılar, aralarında asal sayılar, asal çarpanlara ayırma ve bölen sayısı.",
      questionsCount: 0.29,
    },
    {
      title: "OBEB - OKEK",
      description:
        "En büyük ortak bölen, en küçük ortak kat bulma formülleri ve OBEB-OKEK problemleri.",
      questionsCount: 0.0,
    },
    {
      title: "Basit Eşitsizlikler",
      description:
        "Büyüklük-küçüklük bağıntıları ve eşitsizliklerin çözüm kümeleri.",
      questionsCount: 1.29,
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
      questionsCount: 1.57,
    },
    {
      title: "Üslü Sayılar",
      description:
        "Üslü ifadeler, üslü sayılarda dört işlem ve üslü denklemler.",
      questionsCount: 2.14,
    },
    {
      title: "Köklü Sayılar",
      description:
        "Köklü ifadeler, kök dışına çıkarma, payda rasyonelleştirme ve köklü denklemler.",
      questionsCount: 1.0,
    },
    {
      title: "Çarpanlara Ayırma",
      description:
        "Özdeşlikler, ortak çarpan parantezine alma ve sadeleştirme yöntemleri.",
      questionsCount: 0.43,
    },
    {
      title: "1. Dereceden Denklemler",
      description: "Bilinmeyenli denklemler ve çözüm yolları.",
      questionsCount: 0.43,
    },
    {
      title: "Oran Orantı",
      description:
        "Doğru orantı, ters orantı, bileşik orantı ve ortalama kavramları.",
      questionsCount: 0.43,
    },
    {
      title: "Sayı Problemleri",
      description:
        "Denklem kurma becerisini ölçen klasik sayı problemleri ve muhakeme soruları.",
      questionsCount: 2.0,
    },
    {
      title: "Kesir Problemleri",
      description:
        "Kesirlerle ifade edilen parça-bütün ilişkisi ve problem çözümleri.",
      questionsCount: 0.43,
    },
    {
      title: "Yaş Problemleri",
      description:
        "Geçmiş ve gelecek yaş hesaplamaları ile kişilerin yaş farkı sabitliği.",
      questionsCount: 0.71,
    },
    {
      title: "Yüzde / Kâr / Zarar",
      description:
        "Yüzde hesaplamaları, ticari kâr-zarar ve alış-satış fiyatı problemleri.",
      questionsCount: 0.86,
    },
    {
      title: "Karışım Problemleri",
      description:
        "Madde miktarı değişmeyen karışım formülü ve saf madde oranı hesaplamaları.",
      questionsCount: 0.0,
    },
    {
      title: "Hareket Problemleri",
      description:
        "Yol, hız ve zaman arasındaki ilişki; karşılaşma ve yetişme problemleri.",
      questionsCount: 1.0,
    },
    {
      title: "İşçi Problemleri",
      description:
        "İş, işçi ve zaman ilişkisi; birlikte iş yapma ve havuz problemleri.",
      questionsCount: 0.0,
    },
    {
      title: "Grafik ve Tablo Problemleri",
      description:
        "Daire, sütun ve çizgi grafikleri ile tabloları okuma, analiz etme ve yorumlama.",
      questionsCount: 1.14,
    },
    {
      title: "Kümeler",
      description:
        "Kümelerde temel kavramlar, birleşim, kesişim, fark işlemleri ve küme problemleri.",
      questionsCount: 0.71,
    },
    {
      title: "Permütasyon / Kombinasyon / Olasılık",
      description:
        "Sıralama (permütasyon), seçme (kombinasyon) ve olasılık hesabı kuralları.",
      questionsCount: 1.29,
    },
    {
      title: "Fonksiyonlar",
      description:
        "Fonksiyon tanımı, çeşitleri, bileşke ve ters fonksiyon işlemleri.",
      questionsCount: 0.86,
    },
    {
      title: "İşlem",
      description:
        "Özel tanımlı işlemler ve işlem tablosu ile soru çözümleri.",
      questionsCount: 0.29,
    },
    {
      title: "Modüler Aritmetik",
      description:
        "Modül bulma, dönemsel tekrar eden işlemler ve modüler denklemler.",
      questionsCount: 0.0,
    },
    {
      title: "Sayısal Mantık",
      description:
        "Şekil yeteneği, sayı dizileri ve mantıksal çıkarım soruları.",
      questionsCount: 4.43,
    },
  ],
  geometri: [
    {
      title: "Geometrik Kavramlar ve Açılar",
      description:
        "Nokta, doğru, düzlem kavramları; paralel doğrular arası açı ilişkileri; üçgende iç/dış açılar, özel üçgenler (dik, ikizkenar, eşkenar), Pisagor teoremi; açıortay ve kenarortay teoremleri; üçgenin alan formülleri ve benzerlik oranları.",
      questionsCount: 1.14,
    },
    {
      title: "Çokgenler ve Dörtgenler",
      description:
        "Kare, dikdörtgen, paralelkenar ve yamuk gibi geometrik şekillerin özellikleri.",
      questionsCount: 1.14,
    },
    {
      title: "Çember ve Daire",
      description:
        "Çemberde açılar, uzunluk ve dairenin alan/çevre hesaplamaları.",
      questionsCount: 1.0,
    },
    {
      title: "Analitik Geometri",
      description:
        "Koordinat sistemi, doğru denklemleri ve nokta-doğru ilişkileri.",
      questionsCount: 0.71,
    },
    {
      title: "Katı Cisimler",
      description:
        "Prizmalar, silindir, piramit ve küre gibi üç boyutlu şekillerin hacim ve alanları.",
      questionsCount: 0.0,
    },
  ],
  tarih: [
    {
      title: "İslamiyet Öncesi Türk Tarihi",
      description:
        "Orta Asya Türk devletleri (Hunlar, Göktürkler, Uygurlar) ve göç hareketleri.",
      questionsCount: 0.17,
    },
    {
      title: "İslamiyet Öncesi Kültür ve Uygarlık",
      description:
        "İslamiyet öncesi Türk devletlerinde devlet yönetimi, ordu yapısı, toplumsal hayat, hukuk sistemi ve kültürel özellikler.",
      questionsCount: 1.0,
    },
    {
      title: "İlk Türk İslam Devletleri",
      description:
        "Karahanlılar, Gazneliler ve Selçuklular dönemi siyasi tarihi; devletlerin kuruluşu, yıkılışı ve mücadeleleri.",
      questionsCount: 1.0,
    },
    {
      title: "İlk Türk İslam Devletlerinde Kültür ve Uygarlık",
      description:
        "İlk Türk İslam devletlerinde devlet yönetimi, ordu, hukuk, eğitim, dil ve edebiyat, sanat ve mimari özellikleri.",
      questionsCount: 1.0,
    },
    {
      title: "Osmanlı Devleti Siyaseti",
      description:
        "Kuruluş, Yükselme, Duraklama ve Gerileme dönemlerinde padişahlar, fetihler, diplomatik antlaşmalar ve siyasi gelişmeler.",
      questionsCount: 3.0,
      subtopics: [
        "Osmanlı Kuruluş Dönemi (1299-1453)",
        "Osmanlı Yükselme / Klasik Çağ (1453-1579)",
        "Osmanlı Duraklama & Arayış Yılları (1579-1699)",
        "Osmanlı Gerileme & Islahatlar Dönemi (1700-1792)",
        "Osmanlı Devleti'nde Yenileşme ve Demokratikleşme Hareketleri",
      ],
    },
    {
      title: "Osmanlı Kültür ve Uygarlık",
      description:
        "Devlet yönetimi, Divan-ı Hümayun (Seyfiye, İlmiye, Kalemiye), Eyalet yapısı, Tımar sistemi, Ordu teşkilatı, Hukuk, Maliye ve Mimari.",
      questionsCount: 5.0,
      subtopics: [
        "Merkez Teşkilatı ve Divan-ı Hümayun (Seyfiye, İlmiye, Kalemiye)",
        "Taşra Teşkilatı ve Eyalet Yönetimi",
        "Toprak ve Tımar Sistemi",
        "Ordu Teşkilatı (Kapıkulu ve Tımarlı Sipahiler)",
        "Hukuk, Maliye, Eğitim ve Mimari Yapılar",
      ],
    },
    {
      title: "20. Yüzyılda Osmanlı",
      description:
        "I. ve II. Meşrutiyet, 31 Mart Vakası, Trablusgarp Savaşı, Balkan Savaşları, I. Dünya Savaşı ve Mondros Mütarekesi süreci.",
      questionsCount: 4.0,
      subtopics: [
        "I. ve II. Meşrutiyet & 31 Mart Vakası (1908-1909)",
        "Trablusgarp Savaşı ve Uşi Antlaşması (1911-1912)",
        "Balkan Savaşları (1912-1913)",
        "Birinci Dünya Savaşı ve Cepheler (1914-1918)",
        "Mondros Mütarekesi ve Sevr Antlaşması",
      ],
    },
    {
      title: "Kurtuluş Savaşı",
      description:
        "Genelgeler, kongreler, I. TBMM'nin açılışı ve ayaklanmalar; Doğu, Güney ve Batı cepheleri; düzenli ordunun savaşları (Sakarya, Büyük Taarruz).",
      questionsCount: 2.0,
      subtopics: [
        "Kurtuluş Savaşı Hazırlık Dönemi",
        "TBMM'nin Açılışı",
        "Kurtuluş Savaşı - Lozan Antlaşması",
      ],
    },
    {
      title: "İnkılap Tarihi",
      description:
        "Cumhuriyetin ilanı, siyasi, sosyal ve hukuk alanında yapılan modernleşme adımları ve Atatürk dönemi inkılaplarının tüm alanları.",
      questionsCount: 5.0,
      subtopics: [
        "Atatürk İnkılapları - Siyasi",
        "Atatürk İnkılapları - Ekonomik",
        "Atatürk İnkılapları - Eğitim",
        "Atatürk İnkılapları - Hukuki",
        "Atatürk İnkılapları - Toplumsal",
        "Atatürk İnkılapları - Kronolojik Gelişimi",
      ],
    },
    {
      title: "Atatürk Dönemi Politikalar",
      description:
        "İç politika gelişmeleri ve yurtta sulh cihanda sulh temelli dış politika.",
      questionsCount: 2.0,
      subtopics: [
        "Çok Partili Yaşama Geçiş Denemeleri",
        "Dış Politika",
      ],
    },
    {
      title: "Atatürk İlke ve İnkılapları",
      description:
        "Cumhuriyetçilik, Milliyetçilik, Halkçılık, Laiklik, Devletçilik, İnkılapçılık.",
      questionsCount: 2.0,
    },
    {
      title: "Çağdaş Türk ve Dünya Tarihi",
      description:
        "II. Dünya Savaşı sonrası Türkiye ve dünyadaki önemli gelişmeler.",
      questionsCount: 2.0,
      subtopics: ["Atatürk Sonrası Gelişmeler"],
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
      title: "İklim ve Bitki Örtüsü",
      description:
        "Sıcaklık, basınç ve rüzgarların Türkiye üzerindeki etkileri ve bitki türleri.",
      questionsCount: 1.5,
    },
    {
      title: "Fiziki Özellikler",
      description:
        "Dağlar, ovalar, platolar, akarsular ve yer şekillerinin oluşum süreçleri; toprak tipleri, akarsu rejimleri, göller, yer altı suları; deprem, heyelan, erozyon ve sel gibi doğal afetlerin nedenleri ve sonuçları.",
      questionsCount: 5.17,
      subtopics: ["Türkiye'nin Yeryüzü Şekilleri"],
    },
    {
      title: "Nüfus ve Yerleşme",
      description:
        "Nüfus sayımları, göçler, yerleşme tipleri ve nüfusun dağılışı.",
      questionsCount: 2.17,
    },
    {
      title: "Tarım",
      description:
        "Yetiştirilen tarım ürünleri ve bölgelere göre tarım faaliyetlerinin dağılışı.",
      questionsCount: 1.67,
    },
    {
      title: "Hayvancılık",
      description:
        "Bölgelere göre hayvancılık türleri, büyükbaş, küçükbaş ve kümes hayvancılığı faaliyetleri.",
      questionsCount: 0.83,
    },
    {
      title: "Madenler ve Enerji",
      description:
        "Yeraltı zenginlikleri, yenilenebilir ve yenilenemez enerji kaynakları.",
      questionsCount: 2.17,
      subtopics: ["Ormancılık"],
    },
    {
      title: "Sanayi ve Endüstri",
      description: "Sanayi kollarının dağılışı, hammadde ve pazar ilişkileri.",
      questionsCount: 1.0,
    },
    {
      title: "Ulaşım",
      description:
        "Türkiye'nin kara, deniz, hava ve demiryolu ulaşım ağları.",
      questionsCount: 0.83,
    },
    {
      title: "Ticaret",
      description:
        "Türkiye'nin iç ve dış ticareti, ihracat ve ithalat ürünlerinin dağılımı.",
      questionsCount: 0.17,
    },
    {
      title: "Turizm",
      description:
        "Türkiye'nin önemli turizm merkezleri ve turizm çeşitlerinin bölgesel dağılımı.",
      questionsCount: 1.33,
    },
    {
      title: "Bölgeler Coğrafyası",
      description:
        "Coğrafi bölgelerin fiziki, beşeri ve ekonomik özellikleri; GAP, DAP, KOP gibi bölgesel kalkınma projeleri.",
      questionsCount: 0.17,
    },
  ],
  vatandaslik: [
    {
      title: "Temel Hukuk Kavramları",
      description: "Hukuk kuralları, haklar, ehliyetler ve yaptırım türleri.",
      questionsCount: 2.5,
    },
    {
      title: "Anayasal Kavramlar",
      description: "Devletin temel nitelikleri ve anayasal ilkeler.",
      questionsCount: 0.17,
    },
    {
      title: "Türk Anayasa Tarihi",
      description: "1921, 1924, 1961 ve 1982 anayasalarının temel özellikleri.",
      questionsCount: 1.5,
    },
    {
      title: "Temel Hak ve Ödevler",
      description: "Kişisel, sosyal ve siyasi hakların kapsamı ve güvenceleri.",
      questionsCount: 0.5,
    },
    {
      title: "Yasama",
      description:
        "TBMM'nin kuruluşu, görev ve yetkileri ile kanun yapım süreci.",
      questionsCount: 0.67,
    },
    {
      title: "Yürütme",
      description:
        "Cumhurbaşkanlığı Hükümet Sistemi ve yürütme organının yapısı; Cumhurbaşkanı, yardımcıları ve bakanların görev ve yetkileri.",
      questionsCount: 1.17,
    },
    {
      title: "Yargı",
      description:
        "Anayasa Mahkemesi, Yargıtay, Danıştay ve diğer yargı organlarının yapısı ve işleyişi.",
      questionsCount: 0.83,
    },
    {
      title: "İdare Hukuku",
      description:
        "Merkezden ve yerinden yönetim kuruluşları ve kamu görevlileri.",
      questionsCount: 1.67,
    },
  ],
};

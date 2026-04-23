import { HifizItem } from "../types/types.js";

const DIYANET_BASE = "https://kuran.diyanet.gov.tr/mushaf";

export const INITIAL_HIFIZ_ITEMS: HifizItem[] = [
  // --- Özel Ayetler ---
  {
    id: "ayat-1",
    title: "Bakara Suresi 1-5 (Elif Lam Mim)",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [2],
    url: `${DIYANET_BASE}/bakara-suresi-2/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "ayat-2",
    title: "Ayet-el Kürsi (Bakara 255)",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [42],
    url: `${DIYANET_BASE}/bakara-suresi-2/ayet-255/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "ayat-3",
    title: "Amenerrasulü (Bakara 285-286)",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [49],
    url: `${DIYANET_BASE}/bakara-suresi-2/ayet-285/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "ayat-4",
    title: "Hüvallahüllezi (Haşr 20-24)",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [548],
    url: `${DIYANET_BASE}/hasr-suresi-59/ayet-22/diyanet-isleri-baskanligi-meali`,
  },

  // --- Büyük Sureler ---
  {
    id: "surah-1",
    title: "Yasin Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 6,
    pages: [440, 441, 442, 443, 444, 445],
    url: `${DIYANET_BASE}/yasin-suresi-36/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "surah-5",
    title: "Mülk Suresi (Tebareke)",
    category: "surahs",
    level: "basic",
    totalPages: 3,
    pages: [562, 563, 564],
    url: `${DIYANET_BASE}/mulk-suresi-67/ayet-1/diyanet-isleri-baskanligi-meali`,
  },

  // --- 30. Cüz (Amme) ---
  {
    id: "juz-78",
    title: "Nebe Suresi (Amme)",
    category: "surahs",
    level: "basic",
    totalPages: 2,
    pages: [582, 583],
    url: `${DIYANET_BASE}/nebe-suresi-78/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-93",
    title: "Duha Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [596],
    url: `${DIYANET_BASE}/duha-suresi-93/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-94",
    title: "İnşirah Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [596],
    url: `${DIYANET_BASE}/insirah-suresi-94/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-95",
    title: "Tin Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [596],
    url: `${DIYANET_BASE}/tin-suresi-95/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-96",
    title: "Alak Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [596, 597],
    url: `${DIYANET_BASE}/alak-suresi-96/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-97",
    title: "Kadir Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [597],
    url: `${DIYANET_BASE}/kadir-suresi-97/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-98",
    title: "Beyyine Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [597],
    url: `${DIYANET_BASE}/beyyine-suresi-98/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-99",
    title: "Zilzal Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [598],
    url: `${DIYANET_BASE}/zilzal-suresi-99/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-100",
    title: "Adiyat Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [598],
    url: `${DIYANET_BASE}/adiyat-suresi-100/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-101",
    title: "Karia Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [598],
    url: `${DIYANET_BASE}/karia-suresi-101/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-102",
    title: "Tekasür Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [599],
    url: `${DIYANET_BASE}/tekasur-suresi-102/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-103",
    title: "Asr Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [599],
    url: `${DIYANET_BASE}/asr-suresi-103/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-104",
    title: "Hümeze Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [599],
    url: `${DIYANET_BASE}/humeze-suresi-104/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-105",
    title: "Fil Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [600],
    url: `${DIYANET_BASE}/fil-suresi-105/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-106",
    title: "Kureyş Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [600],
    url: `${DIYANET_BASE}/kureys-suresi-106/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-107",
    title: "Maun Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [600],
    url: `${DIYANET_BASE}/maun-suresi-107/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-108",
    title: "Kevser Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [601],
    url: `${DIYANET_BASE}/kevser-suresi-108/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-109",
    title: "Kafirun Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [601],
    url: `${DIYANET_BASE}/kafirun-suresi-109/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-110",
    title: "Nasr Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [601],
    url: `${DIYANET_BASE}/nasr-suresi-110/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-111",
    title: "Tebbet Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [602],
    url: `${DIYANET_BASE}/tebbet-suresi-111/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-112",
    title: "İhlas Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [602],
    url: `${DIYANET_BASE}/ihlas-suresi-112/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-113",
    title: "Felak Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [602],
    url: `${DIYANET_BASE}/felak-suresi-113/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-114",
    title: "Nas Suresi",
    category: "surahs",
    level: "basic",
    totalPages: 1,
    pages: [603],
    url: `${DIYANET_BASE}/nas-suresi-114/ayet-1/diyanet-isleri-baskanligi-meali`,
  },

  // --- Dualar ---
  { id: "dua-2", title: "Yemek Duası", category: "duas", level: "basic", totalPages: 1 },
  { id: "dua-3", title: "Ezan Duası", category: "duas", level: "basic", totalPages: 1 },
  { id: "dua-5", title: "Vaaza Başlama Duası", category: "duas", level: "basic", totalPages: 1 },
  { id: "dua-13", title: "Cenaze Duaları", category: "duas", level: "basic", totalPages: 1 },
  { id: "dua-14", title: "Hutbe Duaları", category: "duas", level: "basic", totalPages: 1 },
  { id: "dua-19", title: "Kamet", category: "duas", level: "basic", totalPages: 1 },
  { id: "dua-20", title: "Salâ (Sala)", category: "duas", level: "basic", totalPages: 1 },
];

export const YETERLIKLER_DATA = [
  {
    title: "1. Kur’an-ı Kerim’i yüzüne okur.",
    description: "Kur'an-ı Kerim'i tecvit kurallarına uygun, akıcı ve doğru bir şekilde, mahreçlerine dikkat ederek yüzünden okuma becerisini ifade eder."
  },
  {
    title: "2. Yasin, Mülk, Nebe sureleriyle Duha’dan Nâs’a kadar olan sureleri, Bakara Suresi 1-5, 255, 285-286, Haşr Suresi 20-24. ayetleri ezbere okur.",
    description: "İmam-hatiplik için temel teşkil eden bu sure ve ayetlerin, ezberden, tecvit ve mahreç kurallarına tam uyum içerisinde okunabilmesi gerekliliğidir."
  },
  {
    title: "3. Fatiha ile Fil - Nas arası sûrelerin anlamlarını genel hatlarıyla bilir.",
    description: "Namazlarda en sık okunan bu surelerin kelime ve cümle anlamlarını, genel mesajlarını ve neden indirildiklerini (nüzul sebepleri) bilmeyi kapsar."
  },
  {
    title: "4. Temel tecvit kurallarını uygular.",
    description: "Medler, idgamlar, ihfa, izhar, iklab ve ra harfinin okunuşu gibi Kur'an-ı Kerim'i güzel okuma kurallarını uygulamalı olarak bilmek."
  },
  {
    title: "5. Kur'an-ı Kerim’le ilgili ayet, sûre, meal vb. temel kavramları bilir.",
    description: "Vahiy, mushaf, cüz, ayet, sure ve meal gibi Kur'an ilimlerine giriş niteliğindeki temel terimlerin tanımlarını bilmektir."
  },
  {
    title: "6. İtikat, ibadet, ahlak ve siyer ile ilgili temel kavramları bilir.",
    description: "Din hizmetlerinin temelini oluşturan inanç, amel, etik ve Hz. Peygamber’in hayatına dair temel terminolojiye hakimiyet."
  },
  {
    title: "7. İslam inanç, ibadet ve ahlakının temel esaslarını bilir.",
    description: "İmanın ve İslam’ın şartları, temel ahlaki prensipler ve bu esasların dayandığı temel deliller hakkında bilgi sahibi olmak."
  },
  {
    title: "8. İtikadî ve fıkhî mezhepleri sayar.",
    description: "Ehl-i Sünnet ve diğer mezheplerin (Hanefi, Şafii, Maturidi, Eş'ari vb.) temel ayırıcı özelliklerini ve kurucularını bilir."
  },
  {
    title: "9. Temel İslam Bilimlerinin ana konularını bilir.",
    description: "Tefsir, Hadis, Fıkıh, Kelam, Tasavvuf ve İslam Tarihi gibi ana disiplinlerin çalıştığı temel mevzuları kavramak."
  },
  {
    title: "10. Kur’an ve sünnetin İslam dinindeki yeri ve önemini bilir.",
    description: "İslam hukukunun ve yaşantısının ana kaynakları olan Kur’an ve Sünnet’in hiyerarşisi, birbirini tamamlaması ve dindeki otoritesini bilmek."
  },
  {
    title: "11. Hz. Peygamberin hayatını genel hatlarıyla bilir.",
    description: "Hz. Muhammed'in (sav) çocukluğu, gençliği, peygamberliği ve vefatına kadar olan dönemi, kazandığı önemli başarıları ve örnek kişiliği."
  },
  {
    title: "12. Hutbe ve vaaz dualarını bilir.",
    description: "Minberde veya kürsüde okunması gereken Arapça başlangıç ve bitiş dualarını, hamdele ve salveleleri ezbere ve doğru okumak."
  },
  {
    title: "13. Yapılması mutad olan duaları (cenaze, ezan, yemek vb.) bilir.",
    description: "Toplumun her kesiminde ihtiyaç duyulan yemek, ezan, cenaze telkini ve şükür dualarını usulüne uygun yapabilme becerisi."
  },
  {
    title: "14. Müslümanların bilim, kültür ve medeniyete katkılarını bilir.",
    description: "İslam medeniyetinin altın çağında bilim, sanat ve mimari alanında yapılan keşifler ve dünya medeniyetine yön veren Müslüman bilginler."
  },
  {
    title: "15. Ulusal ve uluslararası güncel dini gelişmeleri genel hatlarıyla bilir.",
    description: "Dini hayatı etkileyen güncel tartışmalar, fetvalar ve uluslararası platformlarda dini kurumların tutumları hakkında farkındalık."
  },
  {
    title: "16. Yaşayan dünya dinlerini genel hatlarıyla bilir.",
    description: "Yahudilik, Hristiyanlık, Budizm gibi dinlerin temel inanışlarını ve bu dinlerle İslam arasındaki benzerlik/farklılıkları ana hatlarıyla bilmek."
  },
  {
    title: "17. Türkiye’nin sosyo-kültürel ve dini özelliklerini bilir.",
    description: "Ülkemizin dini yapısı, geleneksel dini anlayışlar, vakıflar, dernekler ve halkın dini beklentileri hakkında bilgi."
  },
  {
    title: "18. Görevinin gerektirdiği temsil özelliklerini bilir.",
    description: "Bir din görevlisinin toplum önündeki duruşu, giyim-kuşamı, konuşma üslubu ve sergilemesi gereken örnek karakter özellikleridir."
  },
  {
    title: "19. Sesini ve nefesini doğru ve etkili kullanma becerisine sahiptir.",
    description: "Ezan, sala ve hutbe icrasında sesini koruyarak doğru tekniklerle nefes alma ve sesini en gür ve etkili tonda kullanma kabiliyeti."
  },
  {
    title: "20. Cami mûsikisinde uygulanan makamları tanır.",
    description: "Ezan ve salada kullanılan Hicaz, Rast, Segah, Saba ve Uşşak gibi temel makamların kulak dolgunluğuna ve teknik özelliklerine sahip olmak."
  },
  {
    title: "21. Cami musikisinin temel formlarından olan ezan, kamet ve salayı okur.",
    description: "Ezanın, kametin ve selanın kendi usul, adap ve makamlarına uygun olarak icra edilebilmesi becerisini ifade eder."
  },
  {
    title: "22. Diyanet İşleri Başkanlığının teşkilat yapısını ve görevlerini genel hatlarıyla bilir.",
    description: "Başkanlığın merkez, taşra ve yurt dışı teşkilat şeması ile 633 sayılı kanun çerçevesindeki yasal görevlerini bilmek."
  },
  {
    title: "23. Türkçeyi doğru ve etkili biçimde kullanır.",
    description: "İrşat faaliyetlerinde (hutbe, vaaz) dil bilgisi kurallarına uygun, açık, anlaşılır ve etkileyici bir hitabet diline sahip olmak."
  },
  {
    title: "24. Bilişim teknolojilerini kullanma becerisine sahiptir.",
    description: "İdari işlerde bilgisayar kullanımı, e-posta, Office programları ve kurumsal veri tabanlarını (DHYS vb.) kullanabilme yetisi."
  },
  {
    title: "25. Muhatapları ile iletişim kurma becerisine sahiptir.",
    description: "Cemaat, gençler ve toplumun her kesimiyle sağlıklı empati kurabilme, çatışmaları yönetme ve doğru iletişim dili kullanma yetkinliği."
  },
];

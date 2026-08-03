/**
 * TurkeyHistoryData.ts
 * KPSS Tarih Haritası verileri — kronolojik tarihsel olaylar + devlet sınırları.
 * Desen: TurkeyGeographyData.ts (GeoPin) ile aynı — tarih haritası aynı koordinat sistemini kullanır.
 * Kaynak: archives/anadolu_selcuklu_devleti.html (EVENTS verisi taşındı + genişletildi).
 */

export type HistoryEventCategory =
  | "war"
  | "treaty"
  | "trade"
  | "culture"
  | "organization";

export interface HistoryEvent {
  year: number;
  title: string;
  city: string;
  x: number;
  y: number;
  desc: string;
  category: HistoryEventCategory;
}

export type HistoryTopic =
  | "anadolu-selcuklu"
  | "buyuk-selcuklu"
  | "beylikler"
  | "osmanli-kurulus"
  | "hacli";

export interface HistoryTopicMeta {
  id: HistoryTopic;
  color: string;
  legendKey: string;
  titleKey: string;
  enabled: boolean;
  /** Bu konu için mavi renkle vurgulanacak sınır illeri */
  territoryProvinces: string[];
}

export const HISTORY_VIEWBOX = "0 0 1000.0 421.9991241865445";

/** Kategori renkleri — pin + lejant için */
export const HISTORY_CATEGORY_COLORS: Record<HistoryEventCategory, string> = {
  war: "#b5432f", // savaş — kızıl
  treaty: "#c99a3c", // antlaşma — altın
  trade: "#2f8f5b", // ticaret — yeşil
  culture: "#7c3aed", // kültür — mor
  organization: "#2563eb", // teşkilat — mavi
};

export const HISTORY_TOPICS: HistoryTopicMeta[] = [
  {
    id: "anadolu-selcuklu",
    color: "#b5432f",
    legendKey: "kpss_history_legend_selcuklu",
    titleKey: "kpss_history_title_selcuklu",
    enabled: true,
    territoryProvinces: [
      "Konya", "Ankara", "Kayseri", "Sivas", "Aksaray", "Niğde", "Nevşehir",
      "Kırşehir", "Yozgat", "Çorum", "Amasya", "Tokat", "Karaman", "Antalya",
      "Isparta", "Burdur", "Denizli", "Afyon", "Kütahya", "Uşak", "Eskişehir",
      "Bilecik", "Sinop", "Kastamonu", "Çankırı", "Bolu", "Düzce", "Zonguldak",
      "Bartın", "Karabük", "Kırıkkale", "Mersin", "Adana", "Osmaniye",
      "Kahramanmaraş", "Hatay", "Gaziantep", "Kilis", "Şanlıurfa", "Adıyaman",
      "Malatya", "Elazığ", "Tunceli", "Erzincan", "Erzurum", "Kars", "Ardahan",
      "Artvin", "Bayburt", "Gümüşhane", "Trabzon", "Giresun", "Ordu", "Samsun",
      "Diyarbakır", "Batman", "Siirt", "Bitlis", "Van", "Muş", "Bingöl",
      "Ağrı", "Iğdır", "Şırnak", "Mardin", "Hakkari",
    ],
  },
  {
    id: "buyuk-selcuklu",
    color: "#8c2a1f",
    legendKey: "kpss_history_legend_buyuk",
    titleKey: "kpss_history_title_buyuk",
    enabled: false,
    territoryProvinces: [],
  },
  {
    id: "beylikler",
    color: "#a3906a",
    legendKey: "kpss_history_legend_beylikler",
    titleKey: "kpss_history_title_beylikler",
    enabled: false,
    territoryProvinces: [],
  },
  {
    id: "osmanli-kurulus",
    color: "#c99a3c",
    legendKey: "kpss_history_legend_osmanli",
    titleKey: "kpss_history_title_osmanli",
    enabled: false,
    territoryProvinces: [],
  },
  {
    id: "hacli",
    color: "#6b6252",
    legendKey: "kpss_history_legend_hacli",
    titleKey: "kpss_history_title_hacli",
    enabled: false,
    territoryProvinces: [],
  },
];

/**
 * Anadolu Selçuklu Devleti — kronolojik olaylar.
 * Sadece savaş/fetih değil: antlaşma, ticaret, kültür, teşkilat kategorileri de var.
 */
export const ANADOLU_SELCUKLU_EVENTS: HistoryEvent[] = [
  {
    year: 1071,
    title: "Malazgirt Zaferi",
    city: "Malazgirt (Muş)",
    x: 880.5,
    y: 198.5,
    desc: "Sultan Alparslan, Bizans ordusunu yendi; Anadolu'nun kapıları Türklere açıldı.",
    category: "war",
  },
  {
    year: 1075,
    title: "Anadolu Selçuklu Devleti'nin kuruluşu",
    city: "İznik (Bursa)",
    x: 211.5,
    y: 112.3,
    desc: "Kutalmışoğlu Süleyman Şah, İznik'i başkent yaparak devleti kurdu. Devlet teşkilatı Bizans ve Büyük Selçuklu geleneklerinin senteziyle şekillendi.",
    category: "organization",
  },
  {
    year: 1081,
    title: "Çaka Bey'in donanması",
    city: "İzmir",
    x: 115.6,
    y: 283.4,
    desc: "Çaka Bey İzmir'de ilk Türk donanmasını kurdu; Ege adalarına seferler düzenledi. Anadolu'da denizciliğin öncüsü oldu.",
    category: "organization",
  },
  {
    year: 1097,
    title: "İznik'in kaybı, başkent Konya'ya taşınıyor",
    city: "Konya",
    x: 355.7,
    y: 283.9,
    desc: "I. Haçlı Seferi sonrası İznik elden çıktı; devlet merkezi Konya'ya taşındı. Konya bundan sonra Selçuklu'nun kalbi oldu.",
    category: "war",
  },
  {
    year: 1176,
    title: "Miryokefalon Zaferi",
    city: "Honaz (Denizli)",
    x: 178.6,
    y: 290.5,
    desc: "II. Kılıç Arslan, Bizans'ı ağır bir yenilgiye uğratarak Anadolu'nun Türk yurdu olduğunu kesinleştirdi. Bizans artık Anadolu'yu geri alamayacağını anladı.",
    category: "war",
  },
  {
    year: 1207,
    title: "Antalya'nın fethi — Akdeniz'e açılış",
    city: "Antalya",
    x: 276.4,
    y: 359.8,
    desc: "I. Gıyaseddin Keyhüsrev Antalya'yı aldı. Selçuklu ilk kez Akdeniz limanına kavuştu; uluslararası ticaret yolları Anadolu'ya yöneldi.",
    category: "trade",
  },
  {
    year: 1214,
    title: "Sinop'un fethi — Karadeniz'e açılış",
    city: "Sinop",
    x: 495,
    y: 5.3,
    desc: "I. İzzeddin Keykavus, Sinop'u alarak devleti Karadeniz'e açtı. Kırım ve Kafkasya ticaret yolları Selçuklu kontrolüne girdi.",
    category: "trade",
  },
  {
    year: 1219,
    title: "Venedik ile ticaret anlaşması",
    city: "Alanya (Antalya)",
    x: 330.4,
    y: 373.1,
    desc: "Selçuklu, Venedikli tüccarlara limanlarda imtiyazlar tanıdı. Bu anlaşma Akdeniz ticaretinde Selçuklu'nun etkinliğini artırdı.",
    category: "treaty",
  },
  {
    year: 1220,
    title: "Kervansaray dönemi — İpek Yolu",
    city: "Aksaray",
    x: 452,
    y: 235,
    desc: "Alaeddin Keykubad döneminde Konya-Aksaray-Kayseri-Sivas hattında dev kervansaraylar inşa edildi. İpek Yolu tüccarları güvenle Anadolu'dan geçti.",
    category: "culture",
  },
  {
    year: 1221,
    title: "Alanya'nın fethi",
    city: "Alanya (Antalya)",
    x: 330.4,
    y: 373.1,
    desc: "I. Alaeddin Keykubad, Alanya'yı alıp devleti Akdeniz'e açtı; en parlak dönem başladı. Alanya Kalesi donanmanın ana üssü oldu.",
    category: "war",
  },
  {
    year: 1223,
    title: "Kültür ve bilim — medreseler",
    city: "Kayseri",
    x: 518,
    y: 205,
    desc: "Keykubad döneminde Sivas, Kayseri, Konya'da medreseler açıldı. Hekim, astronom ve mutasavvıflar Anadolu'ya akın etti; Mevlana ve Sadreddin Konevi Konya'da yetişti.",
    category: "culture",
  },
  {
    year: 1230,
    title: "Yassıçemen Savaşı",
    city: "Erzincan",
    x: 682,
    y: 168,
    desc: "Alaeddin Keykubad, Harzemşah Celaleddin'i Yassıçemen'de yendi. Doğu Anadolu kesin olarak Selçuklu topraklarına katıldı.",
    category: "war",
  },
  {
    year: 1243,
    title: "Kösedağ Savaşı",
    city: "Kösedağ (Sivas civarı)",
    x: 648.6,
    y: 129.8,
    desc: "Moğollara yenilgi; devlet İlhanlılara bağımlı hale geldi, çöküş süreci başladı. Selçuklu vergi ödeyerek varlığını sürdürdü.",
    category: "war",
  },
  {
    year: 1246,
    title: "Divan teşkilatı ve ikta sistemi",
    city: "Konya",
    x: 355.7,
    y: 283.9,
    desc: "Moğol baskısı altında da olsa Selçuklu divanı (devlet konseyi), ikta (toprak) sistemi ve adalet örgütü işlemeye devam etti. Anadolu'da Türk devlet geleneği kökleşti.",
    category: "organization",
  },
  {
    year: 1308,
    title: "Devletin sona ermesi",
    city: "Konya",
    x: 355.7,
    y: 283.9,
    desc: "Son Selçuklu sultanının ölümüyle devlet fiilen sona erdi; Anadolu Beylikleri dönemi başladı. Selçuklu mirası (teşkilat, kültür, şehircilik) beyliklere ve Osmanlı'ya aktarıldı.",
    category: "organization",
  },
];

export const HISTORY_EVENTS: Record<HistoryTopic, HistoryEvent[]> = {
  "anadolu-selcuklu": ANADOLU_SELCUKLU_EVENTS,
  "buyuk-selcuklu": [],
  "beylikler": [],
  "osmanli-kurulus": [],
  "hacli": [],
};

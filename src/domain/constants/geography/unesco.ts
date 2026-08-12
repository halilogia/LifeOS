import type { GeoPin } from "./types.js";

/**
 * TURKEY_UNESCO — Birleştirilmiş, zenginleştirilmiş UNESCO Dünya Mirası veri seti.
 * unesco.ts + tourismUnesco.ts birleştirilmiş, çakışanlar tourismUnesco (açıklamalı) tercih edilmiştir.
 * Kategori: Ekonomik Coğrafya
 */
export const TURKEY_UNESCO: GeoPin[] = [
  // ── Tarihi Eserler ──
  {
    name: "Edirne Selimiye Camii",
    city: "Edirne",
    x: 60.0,
    y: 50.0,
    category: "Tarihi Eserler",
    description: "Mimar Sinan'ın ustalık eserim dediği, UNESCO Dünya Kültür Mirası listesindedir.",
  },
  {
    name: "Mahmut Bey Camii",
    city: "Kastamonu",
    x: 400.0,
    y: 55.0,
    category: "Tarihi Eserler",
  },
  {
    name: "Arslanhane Camii",
    city: "Ankara",
    x: 370.0,
    y: 180.0,
    category: "Tarihi Eserler",
  },
  {
    name: "Sivrihisar Camii",
    city: "Eskişehir",
    x: 260.0,
    y: 210.0,
    category: "Tarihi Eserler",
  },
  {
    name: "Afyon Ulu Camii",
    city: "Afyonkarahisar",
    x: 250.0,
    y: 240.0,
    category: "Tarihi Eserler",
  },
  {
    name: "Eşrefoğlu Camii",
    city: "Konya",
    x: 320.0,
    y: 270.0,
    category: "Tarihi Eserler",
  },
  {
    name: "Divriği Ulu Camii ve Darüşşifası (1985)",
    city: "Sivas (Divriği)",
    x: 650.0,
    y: 160.0,
    category: "Tarihi Eserler",
    description:
      "Mengücekliler dönemine ait, eşsiz taş işçiliği ve gölge kapı motifleriyle bilinen eserdir.",
    examTip: "Türkiye'nin UNESCO listesine giren İLK mimari kültürel eseridir.",
  },
  {
    name: "Diyarbakır Kalesi",
    city: "Diyarbakır",
    x: 740.0,
    y: 310.0,
    category: "Tarihi Eserler",
  },

  // ── Tarihi Alanlar ──
  {
    name: "İstanbul Tarihi Alanları",
    city: "İstanbul",
    x: 180.0,
    y: 60.0,
    category: "Tarihi Alanlar",
    description:
      "Hipodrom, Ayasofya, Sultanahmet Camii ve Topkapı Sarayı'nı içeren tarihi yarımadadır.",
  },
  {
    name: "Safranbolu",
    city: "Karabük",
    x: 380.0,
    y: 60.0,
    category: "Tarihi Alanlar",
  },
  {
    name: "Hattuşa - Hitit Başkenti (1986)",
    city: "Çorum (Boğazköy)",
    x: 480.0,
    y: 130.0,
    category: "Tarihi Alanlar",
    description:
      "Hitit İmparatorluğu'nun başkenti, Yazılıkaya açık hava tapınağı ve Kadeş Antlaşması metinlerinin evidir.",
    examTip: "Hitit medeniyetinin kalbidir; UNESCO Dünya Kültür Mirasıdır.",
  },
  {
    name: "Truva",
    city: "Çanakkale",
    x: 40.0,
    y: 130.0,
    category: "Tarihi Alanlar",
  },
  {
    name: "Bursa ve Cumalıkızık",
    city: "Bursa",
    x: 170.0,
    y: 120.0,
    category: "Tarihi Alanlar",
  },
  {
    name: "Gordion Antik Kenti (2023)",
    city: "Ankara (Polatlı)",
    x: 330.0,
    y: 150.0,
    category: "Tarihi Alanlar",
    description: "Frigya Krallığı'nın başkenti ve Kral Midas'ın tümülüsünün bulunduğu antik kenttir.",
    examTip: "Türkiye'nin UNESCO Dünya Miras Listesi'ne eklenen en son kültür miraslarındandır (2023).",
  },
  {
    name: "Bergama",
    city: "İzmir",
    x: 70.0,
    y: 200.0,
    category: "Tarihi Alanlar",
  },
  {
    name: "Efes Antik Kenti & Meryem Ana (2015)",
    city: "İzmir (Selçuk)",
    x: 120.0,
    y: 250.0,
    category: "Tarihi Alanlar",
    description:
      "Artemis Tapınağı, Celcus Kütüphanesi ve antik tiyatrosuyla dünyanın en görkemli antik liman kentidir.",
    examTip: "UNESCO mirasıdır. Menderes'in alüvyon dolguları nedeniyle liman özelliğini yitirmiştir.",
  },
  {
    name: "Aphrodisias",
    city: "Aydın",
    x: 100.0,
    y: 280.0,
    category: "Tarihi Alanlar",
  },
  {
    name: "Xanthos-Letoon",
    city: "Antalya/Muğla",
    x: 160.0,
    y: 360.0,
    category: "Tarihi Alanlar",
  },
  {
    name: "Çatalhöyük Neolitik Kenti (2012)",
    city: "Konya (Çumra)",
    x: 390.0,
    y: 270.0,
    category: "Tarihi Alanlar",
    description:
      "İnsanlığın ilk yerleşik hayata geçtiği, sokaksız bitişik evlerden oluşan Neolitik kenttir.",
    examTip: "İlk ev mimarisi ve toplu köy yaşamının dünyadaki en önemli kanıtıdır (UNESCO).",
  },
  {
    name: "Göbeklitepe Arkeolojik Alanı (2018)",
    city: "Şanlıurfa",
    x: 720.0,
    y: 310.0,
    category: "Tarihi Alanlar",
    description:
      "Tarihin sıfır noktası kabul edilen, dünyanın bilinen en eski tapınak kompleksidir (UNESCO).",
    examTip: "İnsanlık tarihinin ilk inanç ve tapınak merkezidir; UNESCO Dünya Kültür Mirası listesindedir.",
  },
  {
    name: "Nemrut Dağı Heykelleri (1987)",
    city: "Adıyaman (Kahta)",
    x: 670.0,
    y: 250.0,
    category: "Tarihi Alanlar",
    description:
      "Kommagene Krallığı'na ait dev tanrı heykelleri ve tümülüsün yer aldığı kutsal alandır.",
    examTip: "Güneşin doğuşu ve batışının izlendiği UNESCO kültür mirası dağımızdır.",
  },
  {
    name: "Arslantepe",
    city: "Malatya",
    x: 670.0,
    y: 240.0,
    category: "Tarihi Alanlar",
  },
  {
    name: "Ani Arkeolojik Alanı (2016)",
    city: "Kars",
    x: 910.0,
    y: 85.0,
    category: "Tarihi Alanlar",
    description:
      "Binbir Kiliseli Şehir olarak bilinen İpek Yolu üzerindeki surlarla çevrili antik kenttir.",
    examTip: "Türkiye-Ermenistan sınırında Arpaçay kenarında yer alan UNESCO mirasımızdır.",
  },

  // ── Karma Miras ──
  {
    name: "Göreme Milli Parkı & Kapadokya (1985)",
    city: "Nevşehir / Aksaray",
    x: 480.0,
    y: 230.0,
    category: "Karma Miras",
    description:
      "Volkanik tüf kayaların erozyonuyla oluşan peribacaları ve yeraltı şehirleri karma mirasıdır.",
    examTip: "Türkiye'nin UNESCO'daki ilk karma (Kültürel ve Doğal) miras alanıdır.",
  },
  {
    name: "Hierapolis-Pamukkale",
    city: "Denizli",
    x: 170.0,
    y: 290.0,
    category: "Karma Miras",
  },

  // ── Turizm / İnanç ──
  {
    name: "Sümela Manastırı",
    city: "Trabzon (Maçka)",
    x: 740.0,
    y: 80.0,
    category: "Tarihi Alanlar",
    description: "Karadağ yamaçlarındaki dik kayalıklara oyulmuş tarihi Rum Ortodoks manastırıdır.",
    examTip: "Doğu Karadeniz'in en çok ziyaret edilen kültür ve inanç turizmi merkezidir.",
  },
];

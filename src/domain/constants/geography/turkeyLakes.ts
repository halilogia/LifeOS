import type { GeoPin } from "./types.js";

export const TURKEY_LAKES: GeoPin[] = [
  // Tektonik — Yer kabuğu hareketleri (faylanma, çökme) sonucu oluşan çanaklarda biriken göllerdir.
  { name: "Tuz Gölü", city: "Konya/Aksaray", x: 404.5, y: 228.5, category: "Tektonik" },
  { name: "Sapanca Gölü", city: "Sakarya/Kocaeli", x: 240.0, y: 93.5, category: "Tektonik" },
  { name: "Manyas Gölü (Kuş Gölü)", city: "Balıkesir", x: 117.4, y: 127.3, category: "Tektonik" },
  { name: "Uluabat Gölü", city: "Bursa", x: 153.9, y: 127.3, category: "Tektonik" },
  { name: "Akşehir Gölü", city: "Konya/Afyon", x: 300.0, y: 252.0, category: "Tektonik" },
  { name: "Eber Gölü", city: "Afyonkarahisar", x: 285.0, y: 255.0, category: "Tektonik" },
  { name: "Hazar Gölü", city: "Elazığ", x: 717.7, y: 242.0, category: "Tektonik" },
  { name: "İznik Gölü", city: "Bursa", x: 200.9, y: 112.0, category: "Tektonik" },
  { name: "Nemrut Gölü", city: "Bitlis", x: 864.2, y: 231.8, category: "Tektonik" },
  { name: "Acıgöl", city: "Afyon/Denizli", x: 255.0, y: 265.0, category: "Tektonik" },
  { name: "Burdur Gölü", city: "Burdur", x: 237.4, y: 296.0, category: "Tektonik" },

  // Karstik Tektonik — Tektonik etkiyle açılan çukurların karstik erime ile genişlemesi sonucu oluşur.
  { name: "Eğirdir Gölü", city: "Isparta", x: 271.3, y: 272.4, category: "Karstik Tektonik" },
  { name: "Beyşehir Gölü", city: "Konya/Isparta", x: 305.4, y: 290.6, category: "Karstik Tektonik" },

  // Karstik — Kireç taşının (kalker) çözünmesiyle oluşan çukurlarda biriken göllerdir.
  { name: "Salda Gölü", city: "Burdur", x: 230.0, y: 285.0, category: "Karstik" },
  { name: "Avlan Gölü", city: "Antalya", x: 260.0, y: 380.0, category: "Karstik" },

  // Heyelan Set — Bir vadinin heyelanla tıkanması sonucu arkasında suların birikmesiyle oluşur.
  { name: "Tortum Gölü", city: "Erzurum", x: 750.0, y: 100.0, category: "Heyelan Set" },
  { name: "Sera Gölü", city: "Trabzon", x: 670.0, y: 80.0, category: "Heyelan Set" },
  { name: "Abant Gölü", city: "Bolu", x: 330.0, y: 90.0, category: "Heyelan Set" },
  { name: "Yedigöller", city: "Bolu", x: 360.0, y: 80.0, category: "Heyelan Set" },

  // Alüvyal Set — Akarsuyun getirdiği alüvyonların vadi önünü tıkamasıyla oluşur.
  { name: "Köyceğiz Gölü", city: "Muğla", x: 150.0, y: 340.0, category: "Alüvyal Set" },
  { name: "Mogan Gölü", city: "Ankara", x: 375.0, y: 190.0, category: "Alüvyal Set" },
  { name: "Eymir Gölü", city: "Ankara", x: 377.0, y: 192.0, category: "Alüvyal Set" },
  { name: "Marmara Gölü", city: "Manisa", x: 110.0, y: 215.0, category: "Alüvyal Set" },
  { name: "Bafa Gölü", city: "Muğla/Aydın", x: 125.0, y: 290.0, category: "Alüvyal Set" },

  // Kıyı Set (Lagün) — Deniz kıyısında kıyı okunun koyu kapatmasıyla oluşan lagünlerdir.
  { name: "Büyükçekmece Gölü", city: "İstanbul", x: 175.0, y: 65.0, category: "Kıyı Set" },
  { name: "Küçükçekmece Gölü", city: "İstanbul", x: 178.0, y: 68.0, category: "Kıyı Set" },
  { name: "Durusu (Terkos) Gölü", city: "İstanbul", x: 170.0, y: 55.0, category: "Kıyı Set" },

  // Volkanik Set — Volkanik lavların bir vadiyi kapatmasıyla oluşur.
  { name: "Çıldır Gölü", city: "Ardahan/Kars", x: 910.6, y: 71.3, category: "Volkanik Set" },
  { name: "Erçek Gölü", city: "Van", x: 915.0, y: 220.0, category: "Volkanik Set" },
  { name: "Haçlı Gölü", city: "Muş", x: 840.0, y: 220.0, category: "Volkanik Set" },
  { name: "Nazik Gölü", city: "Bitlis", x: 860.0, y: 215.0, category: "Volkanik Set" },
  { name: "Balık Gölü", city: "Ağrı", x: 920.0, y: 180.0, category: "Volkanik Set" },
  // Karma yapılı — Birden fazla yer şekillendirme sürecinin ortak etkisiyle oluşur.
  { name: "Van Gölü", city: "Van/Bitlis", x: 896.4, y: 234.0, category: "Karma" },
];

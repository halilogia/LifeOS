/**
 * curatedCatalogData.ts
 * Curated world-class catalog for Books, Games, and Standalone Movies.
 * Categorized by genres (Felsefe, Politika/Distopya, Klasikler, RPG, etc.)
 * with high-res artwork, ratings, pages, playtime, and synopsis.
 */

export interface CuratedBookItem {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  releaseYear: number;
  category: string;
  genres: string[];
  coverUrl: string;
  rating: number; // Goodreads / 10
  synopsis: string;
}

export interface CuratedGameItem {
  id: string;
  title: string;
  developer: string;
  releaseYear: number;
  playtimeHours: number;
  platform: "PC" | "PlayStation" | "Xbox" | "Nintendo" | "Steam Deck" | "Other";
  category: string;
  genres: string[];
  coverUrl: string;
  rating: number; // Metacritic / 10
  synopsis: string;
}

export interface CuratedMovieItem {
  id: string;
  title: string;
  originalTitle?: string;
  director: string;
  releaseYear: number;
  runtimeMinutes: number;
  genres: string[];
  coverUrl: string;
  rating: number; // IMDb
  synopsis: string;
}

/* ─────────────────────────────────────────────────────────────
   KİTAPLAR (CURATED BOOKS)
   ───────────────────────────────────────────────────────────── */
export const CURATED_BOOKS: CuratedBookItem[] = [
  // Distopya & Politika / Toplum
  {
    id: "book-1984",
    title: "1984",
    author: "George Orwell",
    totalPages: 328,
    releaseYear: 1949,
    category: "Politika & Distopya",
    genres: ["Distopya", "Politik", "Bilim Kurgu"],
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=500&q=80",
    rating: 8.9,
    synopsis: "Büyük Birader'in gözetimi altındaki Okyanusya'da Winston Smith'in hakikat ve özgürlük arayışı.",
  },
  {
    id: "book-hayvan-ciftligi",
    title: "Hayvan Çiftliği",
    author: "George Orwell",
    totalPages: 152,
    releaseYear: 1945,
    category: "Politika & Distopya",
    genres: ["Politik Hiciv", "Alegori", "Klasik"],
    coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=500&q=80",
    rating: 8.7,
    synopsis: "İnsan efendilerine isyan eden hayvanların eşitlik vaadiyle başlayıp yeni bir diktatörlüğe dönüşen hikayesi.",
  },
  {
    id: "book-cesur-yeni-dunya",
    title: "Cesur Yeni Dünya",
    author: "Aldous Huxley",
    totalPages: 272,
    releaseYear: 1932,
    category: "Politika & Distopya",
    genres: ["Distopya", "Bilim Kurgu", "Felsefi"],
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=80",
    rating: 8.6,
    synopsis: "Acı ve kederin yapay zevklerle yok edildiği, teknolojik ve biyolojik kast sistemine dayalı bir gelecek.",
  },
  {
    id: "book-fahrenheit-451",
    title: "Fahrenheit 451",
    author: "Ray Bradbury",
    totalPages: 208,
    releaseYear: 1953,
    category: "Politika & Distopya",
    genres: ["Distopya", "Bilim Kurgu"],
    coverUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=500&q=80",
    rating: 8.5,
    synopsis: "Kitapların yasaklandığı ve itfaiyecilerin kitap yaktığı bir dünyada Guy Montag'ın uyanışı.",
  },
  {
    id: "book-korluk",
    title: "Körlük",
    author: "José Saramago",
    totalPages: 336,
    releaseYear: 1995,
    category: "Politika & Distopya",
    genres: ["Dram", "Felsefi", "Alegori"],
    coverUrl: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=500&q=80",
    rating: 8.8,
    synopsis: "Bilinmeyen bir körlük salgınıyla medeniyetin ve ahlakın nasıl çöktüğünü anlatan Nobel ödüllü başyapıt.",
  },

  // Felsefe & Düşünce
  {
    id: "book-kendime-dusunceler",
    title: "Kendime Düşünceler",
    author: "Marcus Aurelius",
    totalPages: 180,
    releaseYear: 180,
    category: "Felsefe & Düşünce",
    genres: ["Felsefe", "Stoacılık", "Antik"],
    coverUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=500&q=80",
    rating: 9.0,
    synopsis: "Roma İmparatoru ve Stoacı filozofun iç huzur, disiplin ve doğayla uyum üzerine kişisel notları.",
  },
  {
    id: "book-sokratesin-savunmasi",
    title: "Sokrates'in Savunması",
    author: "Platon",
    totalPages: 96,
    releaseYear: -399,
    category: "Felsefe & Düşünce",
    genres: ["Felsefe", "Antik Yunan", "Ahlak"],
    coverUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=500&q=80",
    rating: 8.8,
    synopsis: "Sorgulanmamış bir hayatın yaşanmaya değer olmadığını savunan Sokrates'in Atina mahkemesindeki tarihi konuşması.",
  },
  {
    id: "book-boyle-buyurdu-zerdust",
    title: "Böyle Buyurdu Zerdüşt",
    author: "Friedrich Nietzsche",
    totalPages: 384,
    releaseYear: 1883,
    category: "Felsefe & Düşünce",
    genres: ["Felsefe", "Varoluşçuluk", "Üstinsan"],
    coverUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=500&q=80",
    rating: 8.7,
    synopsis: "Üstinsan, bengi dönüş ve geleneksel ahlakın aşılması üzerine yazılmış felsefi ve lirik zirve.",
  },
  {
    id: "book-insanin-anlam-arayisi",
    title: "İnsanın Anlam Arayışı",
    author: "Viktor E. Frankl",
    totalPages: 168,
    releaseYear: 1946,
    category: "Felsefe & Düşünce",
    genres: ["Psikoloji", "Felsefe", "Logoterapi"],
    coverUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=500&q=80",
    rating: 9.2,
    synopsis: "Toplama kamplarındaki insanlık trajedisinden doğan ve hayata anlam katma iradesini anlatan eser.",
  },

  // Dünya Klasikleri
  {
    id: "book-suc-ve-ceza",
    title: "Suç ve Ceza",
    author: "Fyodor Dostoyevski",
    totalPages: 688,
    releaseYear: 1866,
    category: "Klasikler & Edebiyat",
    genres: ["Klasik", "Psikolojik", "Dram"],
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80",
    rating: 9.3,
    synopsis: "Raskolnikov'un işlediği cinayetin ardından vicdanı, ahlakı ve kurtuluş arayışıyla verdiği devasa iç hesaplaşma.",
  },
  {
    id: "book-donusum",
    title: "Dönüşüm",
    author: "Franz Kafka",
    totalPages: 104,
    releaseYear: 1915,
    category: "Klasikler & Edebiyat",
    genres: ["Klasik", "Varoluşçuluk", "Modernist"],
    coverUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd3?auto=format&fit=crop&w=500&q=80",
    rating: 8.7,
    synopsis: "Gregor Samsa bir sabah devasa bir böceğe dönüşmüş olarak uyanır; yabancılaşma ve aile bağlarının sınavı başlar.",
  },
  {
    id: "book-yabanci",
    title: "Yabancı",
    author: "Albert Camus",
    totalPages: 112,
    releaseYear: 1942,
    category: "Klasikler & Edebiyat",
    genres: ["Absürdizm", "Klasik", "Felsefi"],
    coverUrl: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=500&q=80",
    rating: 8.8,
    synopsis: "Meursault'nun toplumun yapmacık ahlak kurallarına karşı sergilediği dürüstlük ve absürt kayıtsızlık.",
  },
  {
    id: "book-satranc",
    title: "Satranç",
    author: "Stefan Zweig",
    totalPages: 84,
    releaseYear: 1942,
    category: "Klasikler & Edebiyat",
    genres: ["Psikolojik", "Novella", "Klasik"],
    coverUrl: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=500&q=80",
    rating: 9.1,
    synopsis: "Gestapo tecridinde aklını sadece zihninde oynadığı satranç hamleleriyle koruyan Dr. B'nin gemideki büyük maçı.",
  },

  // Bilim Kurgu & Fantastik
  {
    id: "book-dune",
    title: "Dune",
    author: "Frank Herbert",
    totalPages: 712,
    releaseYear: 1965,
    category: "Bilim Kurgu & Fantastik",
    genres: ["Bilim Kurgu", "Uzay Operası", "Politik"],
    coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&q=80",
    rating: 9.2,
    synopsis: "Çöl gezegeni Arrakis'te baharat savaşı, kehanetler ve Paul Atreides'in mesihliğe yükselişi.",
  },
  {
    id: "book-vakif",
    title: "Vakıf",
    author: "Isaac Asimov",
    totalPages: 288,
    releaseYear: 1951,
    category: "Bilim Kurgu & Fantastik",
    genres: ["Bilim Kurgu", "Psikotarih", "Klasik"],
    coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80",
    rating: 8.9,
    synopsis: "Matematikçi Hari Seldon'ın galaktik imparatorluğun çöküşünü ve 30.000 yıllık karanlığı 1.000 yıla indirme planı.",
  },
  {
    id: "book-otostopcu",
    title: "Otostopçunun Galaksi Rehberi",
    author: "Douglas Adams",
    totalPages: 224,
    releaseYear: 1979,
    category: "Bilim Kurgu & Fantastik",
    genres: ["Bilim Kurgu", "Mizah", "Macera"],
    coverUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=500&q=80",
    rating: 8.8,
    synopsis: "Dünya yok edilmeden hemen önce dostu Ford Prefect ile uzaya kaçan Arthur Dent'in absürt yolculuğu.",
  },

  // Tarih & Popüler Bilim
  {
    id: "book-sapiens",
    title: "Sapiens: Hayvanlardan Tanrılara",
    author: "Yuval Noah Harari",
    totalPages: 412,
    releaseYear: 2011,
    category: "Tarih & Popüler Bilim",
    genres: ["Tarih", "Antropoloji", "Bilim"],
    coverUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=500&q=80",
    rating: 9.0,
    synopsis: "Önemsiz bir primat türü olan Homo sapiens'in gezegenin mutlak hakimi haline gelme serüveni.",
  },
  {
    id: "book-atomik-aliskanliklar",
    title: "Atomik Alışkanlıklar",
    author: "James Clear",
    totalPages: 352,
    releaseYear: 2018,
    category: "Psikoloji & Yaşam",
    genres: ["Kişisel Gelişim", "Psikoloji", "Üretkenlik"],
    coverUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=500&q=80",
    rating: 9.1,
    synopsis: "Küçük, %1'lik değişimlerin bileşik getiriyle nasıl hayat değiştiren dev sonuçlara dönüştüğü rehberi.",
  },
];

/* ─────────────────────────────────────────────────────────────
   OYUNLAR (CURATED TOP GAMES - SORTED BY ACCLAIM)
   ───────────────────────────────────────────────────────────── */
export const CURATED_GAMES: CuratedGameItem[] = [
  // RPG & Açık Dünya
  {
    id: "game-witcher-3",
    title: "The Witcher 3: Wild Hunt",
    developer: "CD PROJEKT RED",
    releaseYear: 2015,
    playtimeHours: 52,
    platform: "PC",
    category: "RPG & Açık Dünya",
    genres: ["Açık Dünya", "RPG", "Karanlık Fantazi"],
    coverUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80",
    rating: 9.3,
    synopsis: "Rivyalı Geralt, kehanet çocuğu Ciri'yi Vahşi Av'dan önce bulmak için savaşın harap ettiği kıtada arayışa çıkar.",
  },
  {
    id: "game-elden-ring",
    title: "Elden Ring",
    developer: "FromSoftware",
    releaseYear: 2022,
    playtimeHours: 60,
    platform: "PC",
    category: "RPG & Açık Dünya",
    genres: ["Souls-like", "Açık Dünya", "RPG"],
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80",
    rating: 9.6,
    synopsis: "Arada Kalan Topraklar'da Elden Yüzüğü'nün parçalarını toplayarak yeni Elden Lordu olma mücadelesi.",
  },
  {
    id: "game-baldurs-gate-3",
    title: "Baldur's Gate 3",
    developer: "Larian Studios",
    releaseYear: 2023,
    playtimeHours: 75,
    platform: "PC",
    category: "RPG & Açık Dünya",
    genres: ["cRPG", "Sıra Tabanlı", "Zengin Hikaye"],
    coverUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=500&q=80",
    rating: 9.6,
    synopsis: "Beynindeki Mind Flayer parazitinden kurtulmak isteyen bir grup maceracının Unutulmuş Diyarlar'daki kaderi.",
  },
  {
    id: "game-rdr2",
    title: "Red Dead Redemption 2",
    developer: "Rockstar Games",
    releaseYear: 2018,
    playtimeHours: 50,
    platform: "PlayStation",
    category: "RPG & Açık Dünya",
    genres: ["Açık Dünya", "Vahşi Batı", "Dram"],
    coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&q=80",
    rating: 9.7,
    synopsis: "Vahşi Batı çağının sonunda Van der Linde çetesinin sadık üyesi Arthur Morgan'ın kefaret ve hayatta kalma hikayesi.",
  },
  {
    id: "game-skyrim",
    title: "The Elder Scrolls V: Skyrim",
    developer: "Bethesda Game Studios",
    releaseYear: 2011,
    playtimeHours: 35,
    platform: "PC",
    category: "RPG & Açık Dünya",
    genres: ["Açık Dünya", "RPG", "Fantastik"],
    coverUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80",
    rating: 9.4,
    synopsis: "Ejderhaların geri döndüğü Skyrim topraklarında kadim güç Dragonborn olarak kaderine yürüyüş.",
  },
  {
    id: "game-cyberpunk-2077",
    title: "Cyberpunk 2077",
    developer: "CD PROJEKT RED",
    releaseYear: 2020,
    playtimeHours: 30,
    platform: "PC",
    category: "RPG & Açık Dünya",
    genres: ["Siberpunk", "Açık Dünya", "Aksiyon RPG"],
    coverUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=500&q=80",
    rating: 8.6,
    synopsis: "Night City'de ölümsüzlük çipini çalan kiralık haydut V ve kafasındaki asi rockçı Johnny Silverhand.",
  },

  // Aksiyon & Macera
  {
    id: "game-god-of-war",
    title: "God of War",
    developer: "Santa Monica Studio",
    releaseYear: 2018,
    playtimeHours: 21,
    platform: "PlayStation",
    category: "Aksiyon & Macera",
    genres: ["Aksiyon", "İskandinav Mitolojisi", "Duygusal"],
    coverUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=500&q=80",
    rating: 9.4,
    synopsis: "Kratos, oğlu Atreus ile İskandinav tanrılarının diyarında eşinin küllerini en yüksek zirveye ulaştırmak için savaşır.",
  },
  {
    id: "game-tlou-part-1",
    title: "The Last of Us Part I",
    developer: "Naughty Dog",
    releaseYear: 2013,
    playtimeHours: 15,
    platform: "PlayStation",
    category: "Aksiyon & Macera",
    genres: ["Hayatta Kalma", "Dram", "Kıyamet Sonrası"],
    coverUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=500&q=80",
    rating: 9.5,
    synopsis: "Mantar salgınıyla yok olmuş Amerika'da Joel, insanlığın tek umudu olan 14 yaşındaki Ellie'yi korumaya çalışır.",
  },
  {
    id: "game-sekiro",
    title: "Sekiro: Shadows Die Twice",
    developer: "FromSoftware",
    releaseYear: 2019,
    playtimeHours: 30,
    platform: "PC",
    category: "Aksiyon & Macera",
    genres: ["Aksiyon", "Samuray", "Zorlu"],
    coverUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80",
    rating: 9.1,
    synopsis: "Sengoku dönemi Japonya'sında Tek Kollu Kurt, kaçırılan genç efendisini kurtarmak ve intikam almak için kılıç kuşanır.",
  },

  // Strateji & Simülasyon
  {
    id: "game-civ-6",
    title: "Sid Meier's Civilization VI",
    developer: "Firaxis Games",
    releaseYear: 2016,
    playtimeHours: 40,
    platform: "PC",
    category: "Strateji & Taktik",
    genres: ["Sıra Tabanlı", "4X", "Tarihsel Strateji"],
    coverUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=500&q=80",
    rating: 8.8,
    synopsis: "Taş Devri'nden Uzay Çağı'na kadar kendi medeniyetini kurup zamana meydan okuma simülasyonu.",
  },
  {
    id: "game-aoe-2-de",
    title: "Age of Empires II: Definitive Edition",
    developer: "Forgotten Empires",
    releaseYear: 2019,
    playtimeHours: 35,
    platform: "PC",
    category: "Strateji & Taktik",
    genres: ["RTS", "Orta Çağ", "Gerçek Zamanlı"],
    coverUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80",
    rating: 9.0,
    synopsis: "Orta Çağ medeniyetleri, kale kuşatmaları ve efsanevi ordularla tüm zamanların en sevilen strateji başyapıtı.",
  },

  // Bağımsız / Indie Başyapıtlar
  {
    id: "game-hollow-knight",
    title: "Hollow Knight",
    developer: "Team Cherry",
    releaseYear: 2017,
    playtimeHours: 27,
    platform: "PC",
    category: "Indie Başyapıtlar",
    genres: ["Metroidvania", "Atmosferik", "2D"],
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80",
    rating: 9.0,
    synopsis: "Unutulmuş böcek krallığı Hallownest'in derinliklerine inerek kadim sırları çözen şövalyenin macerası.",
  },
  {
    id: "game-hades",
    title: "Hades",
    developer: "Supergiant Games",
    releaseYear: 2020,
    playtimeHours: 22,
    platform: "PC",
    category: "Indie Başyapıtlar",
    genres: ["Roguelike", "Aksiyon", "Mitoloji"],
    coverUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=500&q=80",
    rating: 9.3,
    synopsis: "Yeraltı Dünyası Prensi Zagreus, Olimpos tanrılarının lütuflarıyla babası Hades'in pençesinden kaçmaya çalışır.",
  },
  {
    id: "game-disco-elysium",
    title: "Disco Elysium - The Final Cut",
    developer: "ZA/UM",
    releaseYear: 2021,
    playtimeHours: 25,
    platform: "PC",
    category: "Indie Başyapıtlar",
    genres: ["cRPG", "Dedektiflik", "Felsefi"],
    coverUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=500&q=80",
    rating: 9.7,
    synopsis: "Hafızasını kaybetmiş bir dedektif, benzersiz bir zihin beceri sistemiyle cinayet soruşturmasını çözer.",
  },
];

/* ─────────────────────────────────────────────────────────────
   KÜLT FİLMLER (IMDb TOP / STANDALONE MASTERPIECES)
   ───────────────────────────────────────────────────────────── */
export const CURATED_MOVIES: CuratedMovieItem[] = [
  {
    id: "movie-shawshank",
    title: "Esaretin Bedeli",
    originalTitle: "The Shawshank Redemption",
    director: "Frank Darabont",
    releaseYear: 1994,
    runtimeMinutes: 142,
    genres: ["Dram", "Suç"],
    coverUrl: "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
    rating: 9.3,
    synopsis: "Haksız yere müebbet hapse mahkum edilen Andy Dufresne'in zekası ve umuduyla Shawshank'ta yazdığı efsane.",
  },
  {
    id: "movie-godfather",
    title: "Baba",
    originalTitle: "The Godfather",
    director: "Francis Ford Coppola",
    releaseYear: 1972,
    runtimeMinutes: 175,
    genres: ["Suç", "Dram"],
    coverUrl: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    rating: 9.2,
    synopsis: "Corleone mafya ailesinin reisi Don Vito'dan oğlu Michael'a geçen güç, sadakat ve intikam savaşı.",
  },
  {
    id: "movie-pulp-fiction",
    title: "Ucuz Roman",
    originalTitle: "Pulp Fiction",
    director: "Quentin Tarantino",
    releaseYear: 1994,
    runtimeMinutes: 154,
    genres: ["Suç", "Kara Mizah"],
    coverUrl: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    rating: 8.9,
    synopsis: "Los Angeles yeraltı dünyasında iki kiralık katil, bir boksör ve bir mafya patronunun kesişen sürreal hikayeleri.",
  },
  {
    id: "movie-interstellar",
    title: "Yıldızlararası",
    originalTitle: "Interstellar",
    director: "Christopher Nolan",
    releaseYear: 2014,
    runtimeMinutes: 169,
    genres: ["Bilim Kurgu", "Dram", "Macera"],
    coverUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    rating: 8.7,
    synopsis: "Yok olmanın eşiğindeki insanlık için yaşanabilir yeni bir gezegen aramak üzere solucan deliğinden geçen astronotlar.",
  },
  {
    id: "movie-inception",
    title: "Başlangıç",
    originalTitle: "Inception",
    director: "Christopher Nolan",
    releaseYear: 2010,
    runtimeMinutes: 148,
    genres: ["Bilim Kurgu", "Aksiyon", "Gerilim"],
    coverUrl: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    rating: 8.8,
    synopsis: "İnsanların rüyalarına girerek sırlarını çalan dahi hırsız Dom Cobb'un bu kez zihne fikir ekleme (inception) görevi.",
  },
  {
    id: "movie-fight-club",
    title: "Dövüş Kulübü",
    originalTitle: "Fight Club",
    director: "David Fincher",
    releaseYear: 1999,
    runtimeMinutes: 139,
    genres: ["Dram", "Gerilim"],
    coverUrl: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    rating: 8.8,
    synopsis: "Uykusuzluk çeken bir büro çalışanının karizmatik sabun satıcısı Tyler Durden ile kurduğu gizli yeraltı kulübü.",
  },
  {
    id: "movie-12-angry-men",
    title: "12 Öfkeli Adam",
    originalTitle: "12 Angry Men",
    director: "Sidney Lumet",
    releaseYear: 1957,
    runtimeMinutes: 96,
    genres: ["Dram", "Mahkeme"],
    coverUrl: "https://image.tmdb.org/t/p/w500/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg",
    rating: 9.0,
    synopsis: "Bir gencin cinayet davasında 12 jüri üyesinin tek bir odada önyargı, adalet ve vicdanla verdiği amansız tartışma.",
  },
  {
    id: "movie-parasite",
    title: "Parazit",
    originalTitle: "Parasite (Gisaengchung)",
    director: "Bong Joon-ho",
    releaseYear: 2019,
    runtimeMinutes: 132,
    genres: ["Gerilim", "Kara Komedi", "Dram"],
    coverUrl: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    rating: 8.5,
    synopsis: "Yoksul Kim ailesinin zengin Park ailesinin evine birer birer sızmasıyla başlayan öngörülemez sınıf çatışması.",
  },
];

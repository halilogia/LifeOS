/**
 * kpssFlashcards.ts
 * Static KPSS memorization flashcards dataset.
 */

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

import { HifizItem } from "./types.js";

const DIYANET_BASE = "https://kuran.diyanet.gov.tr/mushaf";

export const INITIAL_HIFIZ_ITEMS: HifizItem[] = [
  // --- Özel Ayetler ---
  {
    id: "ayat-1",
    title: "Bakara Suresi 1-5 (Elif Lam Mim)",
    category: "ayat",
    url: `${DIYANET_BASE}/bakara-suresi-2/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "ayat-2",
    title: "Ayet-el Kürsi (Bakara 255)",
    category: "ayat",
    url: `${DIYANET_BASE}/bakara-suresi-2/ayet-255/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "ayat-3",
    title: "Amenerrasulü (Bakara 285-286)",
    category: "ayat",
    url: `${DIYANET_BASE}/bakara-suresi-2/ayet-285/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "ayat-4",
    title: "Hüvallahüllezi (Haşr 20-24)",
    category: "ayat",
    url: `${DIYANET_BASE}/hasr-suresi-59/ayet-22/diyanet-isleri-baskanligi-meali`,
  },

  // --- Büyük Sureler ---
  {
    id: "surah-1",
    title: "Yasin Suresi",
    category: "surahs",
    url: `${DIYANET_BASE}/yasin-suresi-36/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "surah-2",
    title: "Fetih Suresi",
    category: "surahs",
    url: `${DIYANET_BASE}/fetih-suresi-48/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "surah-3",
    title: "Hucurat Suresi",
    category: "surahs",
    url: `${DIYANET_BASE}/hucurat-suresi-49/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "surah-4",
    title: "Rahman Suresi",
    category: "surahs",
    url: `${DIYANET_BASE}/rahman-suresi-55/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "surah-5",
    title: "Mülk Suresi (Tebareke)",
    category: "surahs",
    url: `${DIYANET_BASE}/mulk-suresi-67/ayet-1/diyanet-isleri-baskanligi-meali`,
  },

  // --- Dualar ---
  { id: "dua-1", title: "Hatim Duası", category: "duas" },
  { id: "dua-2", title: "Yemek Duası", category: "duas" },
  { id: "dua-3", title: "Ezan Duası", category: "duas" },
  { id: "dua-4", title: "İftar Duası", category: "duas" },
  { id: "dua-5", title: "Vaaza Başlama Duası", category: "duas" },
  { id: "dua-6", title: "Kuran-ı Kerim'e Başlama Duası", category: "duas" },
  {
    id: "dua-7",
    title: "Sübhaneke",
    category: "duas",
    description: "Namaz Duası",
  },
  {
    id: "dua-8",
    title: "Ettehiyyatü",
    category: "duas",
    description: "Namaz Duası",
  },
  {
    id: "dua-9",
    title: "Allahümme Salli & Barik",
    category: "duas",
    description: "Namaz Duası",
  },
  {
    id: "dua-10",
    title: "Rabbena Atina & Rabbenağfirli",
    category: "duas",
    description: "Namaz Duası",
  },
  {
    id: "dua-11",
    title: "Kunut Duaları (1 ve 2)",
    category: "duas",
    description: "Namaz Duası",
  },
  { id: "dua-12", title: "Tevbe İstiğfar Duası", category: "duas" },
  { id: "dua-13", title: "Cenaze Duaları", category: "duas" },
  { id: "dua-14", title: "Hutbe Duaları", category: "duas" },
  { id: "dua-15", title: "Nikah Duası", category: "duas" },
  { id: "dua-16", title: "Telkin Duası", category: "duas" },
  { id: "dua-17", title: "Açılış Duası", category: "duas" },
  { id: "dua-18", title: "Yağmur Duası", category: "duas" },

  // --- 30. Cüz (Amme) ---
  {
    id: "juz-78",
    title: "Nebe Suresi (Amme)",
    category: "juz30",
    url: `${DIYANET_BASE}/nebe-suresi-78/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-79",
    title: "Naziat Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/naziat-suresi-79/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-80",
    title: "Abese Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/abese-suresi-80/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-81",
    title: "Tekvir Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/tekvir-suresi-81/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-82",
    title: "İnfitar Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/infitar-suresi-82/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-87",
    title: "A'la Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/ala-suresi-87/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-89",
    title: "Fecr Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/fecr-suresi-89/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-90",
    title: "Beled Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/beled-suresi-90/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-91",
    title: "Şems Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/sems-suresi-91/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-93",
    title: "Duha Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/duha-suresi-93/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-94",
    title: "İnşirah Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/insirah-suresi-94/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-95",
    title: "Tin Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/tin-suresi-95/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-97",
    title: "Kadir Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/kadir-suresi-97/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-100",
    title: "Adiyat Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/adiyat-suresi-100/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-103",
    title: "Asr Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/asr-suresi-103/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-105",
    title: "Fil Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/fil-suresi-105/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-106",
    title: "Kureyş Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/kureys-suresi-106/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-107",
    title: "Maun Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/maun-suresi-107/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-108",
    title: "Kevser Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/kevser-suresi-108/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-109",
    title: "Kafirun Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/kafirun-suresi-109/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-110",
    title: "Nasr Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/nasr-suresi-110/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-111",
    title: "Tebbet Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/tebbet-suresi-111/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-112",
    title: "İhlas Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/ihlas-suresi-112/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-113",
    title: "Felak Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/felak-suresi-113/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
  {
    id: "juz-114",
    title: "Nas Suresi",
    category: "juz30",
    url: `${DIYANET_BASE}/nas-suresi-114/ayet-1/diyanet-isleri-baskanligi-meali`,
  },
];

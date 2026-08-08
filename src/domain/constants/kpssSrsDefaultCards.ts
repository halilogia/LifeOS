import type { KpssFlashcard } from "@/services/kpss/kpssService.js";

/**
 * Fallback kartları: AI yapılandırması yokken / AI çağrısı başarısız olunca
 * SRS'nin boş kalmaması için kullanılan yerleşik 5 tarih flashcard'ı.
 * Kronolojik olarak doğru KPSS Tarih konularından seçilmiştir.
 */
export const DEFAULT_KPSS_HISTORY_CARDS: KpssFlashcard[] = [
  {
    id: "kpss_default_1",
    question:
      "İlk Türk devletlerinde hükümdara yönetme yetkisinin Tanrı tarafından verildiğine inanılan anlayış ve veraset sistemindeki etkisi nedir?",
    answer:
      "Kut Anlayışı. Kan yoluyla babadan oğula geçtiği için hanedan üyelerinin tümünün tahtta hakkı kabul edilmiş ve sık sık taht kavgalarına yol açmıştır.",
    hint: "Kut anlayışı → Ülke hanedanın ortak malıdır.",
    category: "İslamiyet Öncesi Türk Tarihi",
  },
  {
    id: "kpss_default_2",
    question:
      "Osmanlı Divan-ı Hümayun'unda fethedilen toprakların kaydını tutan (Tahrir Defterleri) ve belgelere padişahın tuğrasını çeken görevli kimdir?",
    answer:
      "Nişancı. Tapu kadastro işlerini yürütür ve resmî yazışmalara padişahın tuğrasını çekerdi.",
    hint: "Tuğra + Tahrir Defterleri = Nişancı",
    category: "Osmanlı Kültür ve Medeniyeti",
  },
  {
    id: "kpss_default_3",
    question:
      "Kurtuluş Savaşı'nın gerekçesi, amacı ve yönteminin ilk kez ihtilalci bir dille beyan edildiği belge hangisidir?",
    answer:
      "Amasya Genelgesi (22 Haziran 1919). 'Vatanın bütünlüğü milletin bağımsızlığı tehlikededir' (Gerekçe), 'Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır' (Amaç ve Yöntem).",
    hint: "Amacı, gerekçesi ve yöntemi ilk kez açıklandı.",
    category: "Millî Mücadele Hazırlık",
  },
  {
    id: "kpss_default_4",
    question:
      "Kurtuluş Savaşı'nın askeri safhasını sona erdiren ve Doğu Trakya, İstanbul ile Boğazlar'ın savaş yapılmadan kurtarılmasını sağlayan anlaşma hangisidir?",
    answer:
      "Mudanya Ateşkes Antlaşması (11 Ekim 1922). TBMM adına İsmet Paşa katılmış, Doğu Trakya ve İstanbul diplomatik zaferle kurtarılmıştır.",
    hint: "Savaşılmadan diplomatik yolla kurtarılan Doğu Trakya.",
    category: "Kurtuluş Savaşı Cepheler",
  },
  {
    id: "kpss_default_5",
    question:
      "Türk Hukuk sistemini çağdaşlaştıran, din/mezhep farkı gözetmeksizin kadın-erkek eşitliğini ve resmi nikah zorunluluğunu getiren inkılap hangisidir?",
    answer:
      "17 Şubat 1926 Türk Medeni Kanunu. İsviçre'den uyarlanmış; kadına mirasta ve şahitlikte eşitlik, boşanma ve velayet hakkı tanınmıştır (Siyasi hak içermez!).",
    hint: "1926 Medeni Kanun — Kadına toplumsal ve ekonomik eşitlik getirdi.",
    category: "Atatürk İnkılapları",
  },
];

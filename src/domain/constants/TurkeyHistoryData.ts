/**
 * TurkeyHistoryData.ts
 * KPSS Tarih Haritası — Anadolu Selçuklu ünitesi.
 * Kaynak: kullanıcının archives/anadolu_selcuklu_devleti (1).html dosyası (geliştirilmiş hali).
 * 3 görüntüleme modu:
 *  - territory: her olay kendi döneminin sınır illerini boyar (birikimli)
 *  - points: nokta + etiket (ekonomi/kültür merkezleri)
 *  - diagram: hiyerarşi şeması (devlet teşkilatı)
 */

export type HistoryMode = "territory" | "points" | "diagram";

export interface HistoryEvent {
  year?: number;
  title: string;
  city?: string;
  desc: string;
  tag?: string;
  /** territory modunda bu olayın boyanacağı iller */
  territory?: string[];
  color?: string;
  x: number;
  y: number;
}

export interface HistoryDiagramNode {
  id: string;
  label: string;
  x: number;
  y: number;
  parent?: string;
  tag?: string;
  desc: string;
}

export interface HistoryLegendRow {
  c: string;
  l: string;
}

export interface HistoryUnit {
  id: string;
  navLabel: string;
  mode: HistoryMode;
  title: string;
  subtitle: string;
  showYear: boolean;
  color: string;
  legend: HistoryLegendRow[] | null;
  events?: HistoryEvent[];
  nodes?: HistoryDiagramNode[];
}

export const HISTORY_VIEWBOX = "0 0 1000.0 421.9991241865445";

/** Varsayılan il rengi (parşömen) */
export const HISTORY_PROVINCE_FILL = "#d8cba7";
export const HISTORY_PROVINCE_STROKE = "#a3906a";

export const HISTORY_UNITS: HistoryUnit[] = [
  {
    id: "anadolu-selcuklu",
    navLabel: "Siyasi Olaylar & Toprak",
    mode: "territory",
    title: "Anadolu Selçuklu Devleti: Kuruluştan Yıkılışa",
    subtitle: "10 kilit olay · 1071-1308 · sırasıyla oynat",
    showYear: true,
    color: "#1f5f7a",
    legend: [
      { c: "#1f5f7a", l: "Anadolu Selçuklu toprağı" },
    ],
    events: [
      {
        year: 1071,
        title: "Malazgirt Zaferi",
        city: "Malazgirt (Muş)",
        desc: "Sultan Alparslan, Bizans ordusunu yendi; Anadolu'nun kapıları Türklere açıldı.",
        tag: "Öncül Olay",
        territory: [],
        x: 880.5,
        y: 198.5,
      },
      {
        year: 1075,
        title: "Anadolu Selçuklu Devleti'nin kuruluşu",
        city: "İznik (Bursa)",
        desc: "Kutalmışoğlu Süleyman Şah, İznik'i başkent yaparak devleti kurdu.",
        tag: "Kuruluş",
        territory: ["Bilecik", "Bursa", "Kocaeli", "Sakarya", "Yalova", "Eskişehir"],
        color: "#1f5f7a",
        x: 211.5,
        y: 112.3,
      },
      {
        year: 1097,
        title: "İznik'in kaybı, başkent Konya'ya taşınıyor",
        city: "Konya",
        desc: "I. Haçlı Seferi sonrası İznik elden çıktı; devlet merkezi Konya'ya taşındı.",
        tag: "Başkent Değişimi",
        territory: ["Konya", "Karaman", "Aksaray", "Ankara", "Kırşehir", "Kırıkkale", "Nevşehir", "Niğde", "Kayseri", "Yozgat", "Çankırı"],
        color: "#1f5f7a",
        x: 355.7,
        y: 283.9,
      },
      {
        year: 1176,
        title: "Miryokefalon Zaferi",
        city: "Honaz (Denizli)",
        desc: "II. Kılıç Arslan, Bizans'ı ağır bir yenilgiye uğratarak Anadolu'nun Türk yurdu olduğunu kesinleştirdi.",
        tag: "Zafer / Güçlenme",
        territory: ["Denizli", "Uşak", "Afyon", "Kütahya", "Isparta", "Burdur"],
        color: "#1f5f7a",
        x: 178.6,
        y: 290.5,
      },
      {
        year: 1186,
        title: "Ülkenin 11 oğula paylaştırılması",
        city: "Konya",
        desc: "II. Kılıç Arslan ülkeyi oğulları arasında paylaştırdı; taht kavgaları ve iç karışıklık dönemi başladı.",
        tag: "İç Karışıklık",
        territory: [],
        color: null as unknown as string,
        x: 355.7,
        y: 283.9,
      },
      {
        year: 1214,
        title: "Sinop'un fethi",
        city: "Sinop",
        desc: "I. İzzeddin Keykavus, Sinop'u alarak devleti Karadeniz'e açtı.",
        tag: "Fetih",
        territory: ["Sinop", "Kastamonu", "Çorum", "Amasya", "Tokat", "Samsun"],
        color: "#1f5f7a",
        x: 495,
        y: 5.3,
      },
      {
        year: 1221,
        title: "Alanya'nın fethi",
        city: "Alanya (Antalya)",
        desc: "I. Alaeddin Keykubad, Alanya'yı alıp devleti Akdeniz'e açtı; en parlak dönem başladı.",
        tag: "Fetih",
        territory: ["Antalya", "Mersin"],
        color: "#1f5f7a",
        x: 330.4,
        y: 373.1,
      },
      {
        year: 1230,
        title: "Yassıçemen Savaşı",
        city: "Yassıçemen (Erzincan)",
        desc: "Celaleddin Harzemşah'a karşı kazanılan zaferle doğuya genişlendi; ancak Moğollara karşı tampon devlet ortadan kalktı.",
        tag: "Zafer / Genişleme",
        territory: ["Erzincan", "Sivas", "Malatya", "Elazığ", "Adıyaman", "Kahramanmaraş"],
        color: "#1f5f7a",
        x: 682,
        y: 168,
      },
      {
        year: 1243,
        title: "Kösedağ Savaşı",
        city: "Kösedağ (Sivas civarı)",
        desc: "Moğollara ağır bir yenilgi; devlet İlhanlılara bağımlı (vassal) hale geldi, gerileme dönemi başladı.",
        tag: "Gerileme",
        territory: [],
        color: null as unknown as string,
        x: 648.6,
        y: 129.8,
      },
      {
        year: 1308,
        title: "Devletin sona ermesi",
        city: "Konya",
        desc: "Son Selçuklu sultanının ölümüyle devlet fiilen sona erdi; toprakları Anadolu Beyliklerine bölündü.",
        tag: "Yıkılış",
        territory: [],
        color: null as unknown as string,
        x: 355.7,
        y: 283.9,
      },
    ],
  },
  {
    id: "teskilat",
    navLabel: "Devlet Teşkilatı",
    mode: "diagram",
    title: "Anadolu Selçuklu Devlet Teşkilatı",
    subtitle: "9 kurum · hiyerarşiyi sırasıyla keşfet",
    showYear: false,
    color: "#c99a3c",
    legend: [
      { c: "#c99a3c", l: "Hükümdar / merkez" },
      { c: "#e5a967", l: "Divan üyeleri" },
    ],
    nodes: [
      { id: "sultan", label: "SULTAN", x: 500, y: 55, parent: undefined, tag: "Hükümdar", desc: "Devletin en yüksek yetkilisi; siyasi, askeri ve hukuki tüm yetkiler onda toplanırdı." },
      { id: "melik", label: "MELİK", x: 230, y: 155, parent: "sultan", tag: "Şehzade", desc: "Sultanın oğulları; illerde (sancaklarda) valilik yaparak yönetim tecrübesi kazanırlardı." },
      { id: "atabey", label: "ATABEY", x: 500, y: 155, parent: "sultan", tag: "Eğitmen/Vasi", desc: "Şehzadelerin eğitmeni ve vasisiydi; melikleri devlet işlerinde yönlendirirdi." },
      { id: "divan", label: "DİVAN-I SALTANAT", x: 770, y: 155, parent: "sultan", tag: "Üst Kurul", desc: "Devlet işlerinin görüşülüp karara bağlandığı en üst kuruldu; sultana bağlı çalışırdı." },
      { id: "tugraci", label: "TUĞRACI", x: 610, y: 270, parent: "divan", tag: "Divan Üyesi", desc: "Fermanları ve resmî yazışmaları hazırlar, üzerlerine tuğrayı çekerdi." },
      { id: "pervane", label: "PERVANE", x: 770, y: 270, parent: "divan", tag: "Divan Üyesi", desc: "Divanın günlük işlerini yürütür, mühür işlerine bakardı." },
      { id: "mustevfi", label: "MÜSTEVFİ", x: 930, y: 270, parent: "divan", tag: "Divan Üyesi", desc: "Mali işlerden ve hazineden sorumluydu." },
      { id: "emir-i-dad", label: "EMİR-İ DAD", x: 770, y: 360, parent: "divan", tag: "Divan Üyesi", desc: "Adalet işlerine ve halkın şikâyetlerine bakardı." },
      { id: "ikta", label: "IKTA SİSTEMİ", x: 200, y: 270, parent: "sultan", tag: "Toprak Düzeni", desc: "Topraklar hizmet karşılığında sipahilere dirlik olarak verilirdi; ordu ve tarım bu sistemle sürdürülürdü." },
    ],
  },
  {
    id: "ekonomi",
    navLabel: "Ekonomi & Ticaret",
    mode: "points",
    title: "Anadolu Selçuklu'da Ekonomi ve Ticaret",
    subtitle: "8 merkez · kervan yolları, limanlar, Ahilik",
    showYear: false,
    color: "#2f8f5b",
    legend: [{ c: "#2f8f5b", l: "Ticaret / kervan merkezi" }],
    events: [
      { title: "Konya", city: "Başkent", desc: "Başkent olarak zanaat, ticaret ve kervan yollarının buluştuğu merkezdi.", tag: "Merkez", x: 355.7, y: 283.9 },
      { title: "Kayseri", city: "Kervan Yolu Kavşağı", desc: "İç Anadolu'yu Doğu'ya bağlayan kervan yollarının kesişim noktasıydı, tüccarların uğrak yeriydi.", tag: "Ticaret", x: 511.9, y: 226.3 },
      { title: "Sivas", city: "Kervan Yolu", desc: "Anadolu'yu Orta Doğu ve İran'a bağlayan ana kervan yolu üzerindeydi.", tag: "Ticaret", x: 592.2, y: 158 },
      { title: "Sultanhanı", city: "Aksaray-Konya arası", desc: "Konya-Aksaray-Kayseri hattındaki en büyük kervansaraylardan biri, I. Alaeddin Keykubad döneminde yapıldı.", tag: "Kervansaray", x: 410.8, y: 258 },
      { title: "Antalya", city: "Akdeniz Limanı", desc: "Venedik ve Cenevizli tüccarlarla yapılan deniz ticaretinin ana limanıydı.", tag: "Deniz Ticareti", x: 263.3, y: 349.4 },
      { title: "Alanya", city: "Tersane", desc: "I. Alaeddin Keykubad'ın kurdurduğu tersane burada bulunuyordu; donanma ve deniz ticareti üssüydü.", tag: "Donanma", x: 330.4, y: 373.1 },
      { title: "Sinop", city: "Karadeniz Limanı", desc: "Karadeniz'e açılan ana liman; kürk ve kereste ticaretinde önemliydi.", tag: "Deniz Ticareti", x: 495, y: 5.3 },
      { title: "Kırşehir", city: "Ahi Evran", desc: "Ahi Evran'ın kurduğu Ahilik teşkilatının merkeziydi; esnaf ve zanaatkârları örgütledi.", tag: "Ahilik", x: 443.3, y: 198.5 },
    ],
  },
  {
    id: "kultur",
    navLabel: "Bilim, Kültür & Mimari",
    mode: "points",
    title: "Anadolu Selçuklu'da Bilim, Kültür ve Mimari",
    subtitle: "7 merkez · medreseler, külliyeler, isimler",
    showYear: false,
    color: "#7c3aed",
    legend: [{ c: "#7c3aed", l: "Kültür / mimari merkezi" }],
    events: [
      { title: "Konya - Mevlana", city: "Mesnevi ve Mevlevilik", desc: "Mevlana Celaleddin-i Rumi burada yaşadı, Mesnevi'yi yazdı; İnce Minareli ve Karatay medreseleri buradadır.", tag: "Tasavvuf", x: 355.7, y: 283.9 },
      { title: "Akşehir - Nasreddin Hoca", city: "Konya", desc: "Nasreddin Hoca'nın yaşadığı ve mezarının bulunduğu yer; halk hikâyeleriyle ünlüdür.", tag: "Halk Kültürü", x: 300.1, y: 251.5 },
      { title: "Sivas Medreseleri", city: "Gök Medrese, Çifte Minareli", desc: "Selçuklu medrese mimarisinin en gösterişli örnekleri burada inşa edildi.", tag: "Mimari", x: 592.2, y: 158 },
      { title: "Divriği Ulu Camii", city: "Sivas", desc: "Taş işçiliğiyle ünlü cami ve darüşşifa kompleksi; UNESCO Dünya Mirası listesindedir.", tag: "Mimari", x: 649.7, y: 183.8 },
      { title: "Erzurum Medreseleri", city: "Çifte Minareli Medrese", desc: "Doğu Anadolu'daki en önemli Selçuklu medrese yapılarından biridir.", tag: "Mimari", x: 814.4, y: 147.6 },
      { title: "Kayseri Külliyeleri", city: "Hunad Hatun, Döner Kümbet", desc: "Selçuklu dönemi külliye ve kümbet mimarisinin önemli örnekleri burada bulunur.", tag: "Mimari", x: 511.9, y: 226.3 },
      { title: "Kırşehir - Ahi Evran / Aşık Paşa", city: "Ahilik ve tasavvuf kültürü", desc: "Ahi Evran ve şair Aşık Paşa'nın merkezi; hem zanaat hem tasavvuf kültürü burada gelişti.", tag: "Tasavvuf", x: 443.3, y: 198.5 },
    ],
  },
  {
    id: "beylikler",
    navLabel: "1308 Sonrası Beylikler",
    mode: "territory",
    title: "1308 Sonrası: Anadolu Beylikleri",
    subtitle: "8 önemli beylik · devlet dağılınca ortaya çıkan yapı",
    showYear: false,
    color: "#8c2a1f",
    legend: null,
    events: [
      { title: "Karamanoğulları", city: "Konya / Karaman", desc: "En güçlü beylikti; 1277'de Türkçeyi resmî dil ilan etti. Selçuklu mirasına en çok sahip çıkan beylikti.", tag: "Beylik", territory: ["Konya", "Karaman", "Niğde"], color: "#8c2a1f", x: 390.5, y: 319 },
      { title: "Germiyanoğulları", city: "Kütahya", desc: "İç Batı Anadolu'da güçlü bir beylikti, Kütahya merkezliydi.", tag: "Beylik", territory: ["Kütahya", "Uşak"], color: "#6b4226", x: 225.4, y: 180.2 },
      { title: "Aydınoğulları", city: "Aydın / İzmir", desc: "Ege kıyısında denizcilikte güçlendi, Bizans ve Venediklilerle ilişkileri vardı.", tag: "Beylik", territory: ["Aydın", "İzmir"], color: "#2e6b3e", x: 95.7, y: 275.4 },
      { title: "Saruhanoğulları", city: "Manisa", desc: "Ege bölgesinde Manisa merkezli, denizci bir beylikti.", tag: "Beylik", territory: ["Manisa"], color: "#a4770b", x: 91.9, y: 234.4 },
      { title: "Menteşeoğulları", city: "Muğla", desc: "Güneybatı Ege'de denizcilikle uğraşan, en eski beyliklerden biriydi.", tag: "Beylik", territory: ["Muğla"], color: "#5b3a8c", x: 140.7, y: 328.1 },
      { title: "Candaroğulları", city: "Kastamonu / Sinop", desc: "Karadeniz kıyısında, Kastamonu ve Sinop merkezli uzun ömürlü bir beylikti.", tag: "Beylik", territory: ["Kastamonu", "Sinop"], color: "#1f5f7a", x: 423.1, y: 48.7 },
      { title: "Osmanoğulları", city: "Söğüt / Bilecik", desc: "Başlangıçta küçük bir uç beyliğiydi; zamanla diğer beylikleri birleştirip Osmanlı Devleti'ne dönüştü.", tag: "Beylik", territory: ["Bilecik"], color: "#c99a3c", x: 235.3, y: 141.4 },
      { title: "Dulkadiroğulları", city: "Elbistan / Maraş", desc: "Güneydoğuda Memlük ve Osmanlı arasında denge siyaseti izleyen bir beylikti.", tag: "Beylik", territory: ["Kahramanmaraş"], color: "#3a3a3a", x: 601.9, y: 261.6 },
    ],
  },
];

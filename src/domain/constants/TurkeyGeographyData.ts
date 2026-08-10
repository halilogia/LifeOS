/**
 * TurkeyGeographyData.ts
 * Türkiye fiziki haritası konu verileri (volkanik dağlar, ovalar, göller, akarsular, platolar).
 * Kaynak: archives/turkiye_volkanik_daglar.html + gerçek coğrafi koordinatlar.
 *
 * Kalibrasyon (viewBox 1000x422):
 *   x = (lon - 28.65) * 52.2 + 156.5
 *   y = (38.53 - lat) * 67.5 + 240
 */

export interface GeoPin {
  name: string;
  city: string;
  x: number;
  y: number;
}

export type TurkeyMapTopic =
  | "kivrim"
  | "kirik"
  | "volcanic"
  | "plains"
  | "lakes"
  | "rivers"
  | "plateaus"
  | "all";

export const MAP_VIEWBOX = "0 0 1000.0 421.9991241865445";

export const MAP_TOPICS: {
  id: TurkeyMapTopic;
  color: string;
  legendKey: string;
}[] = [
  { id: "kivrim", color: "#16a34a", legendKey: "kpss_map_legend_kivrim" },
  { id: "kirik", color: "#dc2626", legendKey: "kpss_map_legend_kirik" },
  { id: "volcanic", color: "#c8511f", legendKey: "kpss_map_legend_volcanic" },
  { id: "plains", color: "#4f8f5b", legendKey: "kpss_map_legend_plains" },
  { id: "lakes", color: "#2563eb", legendKey: "kpss_map_legend_lakes" },
  { id: "rivers", color: "#0ea5e9", legendKey: "kpss_map_legend_rivers" },
  { id: "plateaus", color: "#a16207", legendKey: "kpss_map_legend_plateaus" },
  { id: "all", color: "#9333ea", legendKey: "kpss_map_legend_all" },
];

export const KIVRIM_MOUNTAINS: GeoPin[] = [
  { name: "Yıldız (Istranca) Dağları", city: "Kırklareli", x: 96.5, y: 19.3 },
  { name: "Bolu Dağı", city: "Bolu", x: 310.6, y: 90.2 },
  { name: "Köroğlu Dağları", city: "Bolu", x: 321.0, y: 100.3 },
  { name: "Ilgaz Dağı", city: "Kastamonu/Çankırı", x: 429.0, y: 68.5 },
  { name: "Küre Dağları", city: "Kastamonu", x: 404.5, y: 26.0 },
  { name: "Canik Dağları", city: "Samsun/Ordu", x: 582.5, y: 80.0 },
  { name: "Giresun Dağları", city: "Giresun", x: 666.0, y: 100.3 },
  { name: "Kaçkar Dağları", city: "Rize/Artvin", x: 809.1, y: 86.8 },
  { name: "Mescit Dağları", city: "Erzurum", x: 806.9, y: 113.8 },
  { name: "Yalnızçam Dağları", city: "Ardahan", x: 859.0, y: 66.5 },
  { name: "Allahuekber Dağları", city: "Kars/Erzurum", x: 874.4, y: 103.7 },
  { name: "Mercan (Munzur) Dağları", city: "Tunceli/Erzincan", x: 723.4, y: 174.5 },
  { name: "Güneydoğu Toroslar", city: "Malatya/Hakkari", x: 697.3, y: 269.0 },
  { name: "Sultan Dağları", city: "Afyon/Konya", x: 289.7, y: 255.5 },
  { name: "Dedegöl Dağları", city: "Isparta", x: 285.0, y: 285.0 },
  { name: "Geyik Dağları", city: "Antalya/Karaman", x: 340.5, y: 340.0 },
  { name: "Tahtalı Dağları", city: "Adana/Sivas", x: 550.0, y: 250.0 },
  { name: "Aladağlar", city: "Niğde/Adana", x: 493.7, y: 289.2 },
];

export const KIRIK_MOUNTAINS: GeoPin[] = [
  { name: "Kaz Dağı", city: "Balıkesir/Çanakkale", x: 62.5, y: 161.0 },
  { name: "Madra Dağı", city: "Balıkesir/İzmir", x: 70.3, y: 184.6 },
  { name: "Yunt Dağı", city: "Manisa", x: 83.4, y: 215.0 },
  { name: "Bozdağlar", city: "Manisa/İzmir", x: 127.8, y: 252.0 },
  { name: "Aydın Dağları", city: "Aydın", x: 122.6, y: 282.5 },
  { name: "Menteşe Dağları", city: "Muğla", x: 140.8, y: 329.8 },
  { name: "Nur (Amanos) Dağları", city: "Hatay", x: 551.2, y: 383.8 },
];

export const VOLCANIC_MOUNTAINS: GeoPin[] = [
  { name: "Kula Volkanları", city: "Manisa", x: 156.5, y: 238.5 },
  { name: "Karadağ", city: "Karaman", x: 390.5, y: 319.0 },
  { name: "Karacadağ", city: "Konya (Karapınar)", x: 411.3, y: 292.2 },
  { name: "Hasan Dağı", city: "Aksaray/Niğde", x: 443.7, y: 266.7 },
  { name: "Melendiz Dağı", city: "Niğde", x: 467.2, y: 272.1 },
  { name: "Erciyes Dağı", city: "Kayseri", x: 510.5, y: 239.9 },
  { name: "Karacadağ", city: "Diyarbakır/Şanlıurfa", x: 739.0, y: 322.4 },
  { name: "Nemrut Dağı", city: "Bitlis", x: 864.2, y: 231.8 },
  { name: "Süphan Dağı", city: "Bitlis/Van", x: 894.9, y: 213.0 },
  { name: "Tendürek Dağı", city: "Ağrı/Van", x: 948.7, y: 186.2 },
  { name: "Ağrı Dağı", city: "Ağrı", x: 972.2, y: 161.4 },
];

export const TURKEY_PLAINS: GeoPin[] = [
  { name: "Çukurova", city: "Adana/Mersin", x: 503.6, y: 343.0 },
  { name: "Konya Ovası", city: "Konya", x: 383.6, y: 289.0 },
  { name: "Bafra Ovası", city: "Samsun", x: 535.0, y: 36.0 },
  { name: "Çarşamba Ovası", city: "Samsun", x: 576.7, y: 60.0 },
  { name: "Harran Ovası", city: "Şanlıurfa", x: 696.7, y: 353.0 },
  { name: "Gediz Ovası", city: "İzmir/Manisa", x: 86.0, y: 228.5 },
  { name: "Menemen Ovası", city: "İzmir", x: 73.0, y: 235.0 },
  { name: "Ergene Ovası", city: "Edirne/Tekirdağ", x: 70.5, y: 60.0 },
  { name: "Balıkesir Ovası", city: "Balıkesir", x: 117.4, y: 168.0 },
  { name: "Amik Ovası", city: "Hatay", x: 555.8, y: 390.5 },
  { name: "Muş Ovası", city: "Muş", x: 832.5, y: 215.0 },
  { name: "Silifke Ovası", city: "Mersin", x: 430.6, y: 387.0 },
];

export const TURKEY_LAKES: GeoPin[] = [
  { name: "Van Gölü", city: "Van/Bitlis", x: 896.4, y: 234.0 },
  { name: "Tuz Gölü", city: "Konya/Aksaray", x: 404.5, y: 228.5 },
  { name: "Beyşehir Gölü", city: "Konya/Isparta", x: 305.4, y: 290.6 },
  { name: "Eğirdir Gölü", city: "Isparta", x: 271.3, y: 272.4 },
  { name: "İznik Gölü", city: "Bursa", x: 200.9, y: 112.0 },
  { name: "Sapanca Gölü", city: "Sakarya/Kocaeli", x: 240.0, y: 93.5 },
  { name: "Manyas Gölü", city: "Balıkesir", x: 117.4, y: 127.3 },
  { name: "Burdur Gölü", city: "Burdur", x: 237.4, y: 296.0 },
  { name: "Uluabat Gölü", city: "Bursa", x: 153.9, y: 127.3 },
  { name: "Çıldır Gölü", city: "Ardahan/Kars", x: 910.6, y: 71.3 },
  { name: "Akşehir Gölü", city: "Konya/Afyon", x: 300.0, y: 252.0 },
  { name: "Hazar Gölü", city: "Elazığ", x: 717.7, y: 242.0 },
];

export const TURKEY_RIVERS: GeoPin[] = [
  {
    name: "Kızılırmak",
    city: "İç Anadolu'dan Karadeniz'e",
    x: 514.0,
    y: 174.5,
  },
  { name: "Fırat", city: "Doğu Anadolu'dan Suriye'ye", x: 670.6, y: 242.0 },
  { name: "Dicle", city: "Doğu Anadolu'dan Irak'a", x: 775.0, y: 275.8 },
  { name: "Seyhan", city: "Adana", x: 488.0, y: 309.5 },
  { name: "Ceyhan", city: "Adana/Kahramanmaraş", x: 540.0, y: 329.8 },
  { name: "Yeşilırmak", city: "Sivas'tan Samsun'a", x: 566.3, y: 100.0 },
  { name: "Sakarya", city: "Eskişehir'den Karadeniz'e", x: 253.0, y: 107.0 },
  { name: "Çoruh", city: "Artvin", x: 853.4, y: 73.3 },
  { name: "Aras", city: "Erzurum'dan Azerbaycan'a", x: 905.6, y: 154.3 },
  { name: "Gediz", city: "Manisa'dan Ege'ye", x: 148.7, y: 215.0 },
];

export const TURKEY_PLATEAUS: GeoPin[] = [
  { name: "Obruk Platosu", city: "Konya", x: 394.0, y: 289.0 },
  { name: "Cihanbeyli Platosu", city: "Konya/Ankara", x: 383.6, y: 221.8 },
  { name: "Taşeli Platosu", city: "Karaman/Mersin", x: 378.4, y: 356.8 },
  { name: "Erzurum-Kars Platosu", city: "Erzurum/Kars", x: 853.4, y: 140.8 },
  { name: "Bozok Platosu", city: "Yozgat", x: 488.0, y: 161.0 },
  { name: "Uzunyayla Platosu", city: "Sivas/Kayseri", x: 566.3, y: 208.3 },
  { name: "Gaziantep Platosu", city: "Gaziantep", x: 592.4, y: 323.0 },
  { name: "Yozgat Platosu", city: "Yozgat", x: 477.5, y: 154.3 },
  { name: "Şanlıurfa Platosu", city: "Şanlıurfa", x: 686.3, y: 336.5 },
  { name: "Haymana Platosu", city: "Ankara", x: 367.9, y: 181.3 },
  { name: "Teke Platosu", city: "Muğla/Antalya", x: 216.5, y: 370.2 },
  { name: "Çatalca-Kocaeli Platosu", city: "İstanbul/Kocaeli", x: 190.4, y: 69.8 },
];

export const ALL_GEOGRAPHY_PINS: GeoPin[] = [
  ...KIVRIM_MOUNTAINS,
  ...KIRIK_MOUNTAINS,
  ...VOLCANIC_MOUNTAINS,
  ...TURKEY_PLAINS,
  ...TURKEY_LAKES,
  ...TURKEY_RIVERS,
  ...TURKEY_PLATEAUS,
];

export const TOPIC_PINS: Record<TurkeyMapTopic, GeoPin[]> = {
  kivrim: KIVRIM_MOUNTAINS,
  kirik: KIRIK_MOUNTAINS,
  volcanic: VOLCANIC_MOUNTAINS,
  plains: TURKEY_PLAINS,
  lakes: TURKEY_LAKES,
  rivers: TURKEY_RIVERS,
  plateaus: TURKEY_PLATEAUS,
  all: ALL_GEOGRAPHY_PINS,
};

import type { GeoPin } from "./types.js";

export const TURKEY_POPULATION: GeoPin[] = [
  {
    name: "Çatalca - Kocaeli Yöresi (En Yoğun Nüfus)",
    city: "İstanbul/Kocaeli",
    x: 180.0,
    y: 70.0,
    description: "Sanayi, ticaret, ulaşım ve liman imkanları nedeniyle Türkiye'nin nüfus yoğunluğu en yüksek bölgesidir.",
    examTip: "Nüfus artışında doğal artış değil, tamamen dışarıdan aldığı göçler etkilidir.",
  },
  {
    name: "Çukurova Yöresi (Yoğun Nüfus)",
    city: "Adana/Mersin",
    x: 480.0,
    y: 330.0,
    description: "Verimli alüvyal delta ovası ve tarıma dayalı sanayi sebebiyle yoğun nüfuslanmıştır.",
    examTip: "Mevsimlik tarım işçisi göçü en fazla Çukurova'ya gerçekleşir.",
  },
  {
    name: "Doğu Karadeniz Kıyı Şeridi (Yoğun Kıyı Nüfusu)",
    city: "Trabzon/Rize",
    x: 740.0,
    y: 75.0,
    description: "İç kesimlerin dağlık olması sebebiyle nüfus kıyıdaki dar düzlük şeritte toplanmıştır.",
    examTip: "Kıyı ile iç kesim arasındaki nüfus yoğunluğu farkının en yüksek olduğu bölgedir.",
  },
  {
    name: "Yıldız Dağları Yöresi (Seyrek Nüfus)",
    city: "Kırklareli",
    x: 95.0,
    y: 25.0,
    description: "Marmara'da yer almasına rağmen engebeli arazi ve ana ulaşım yollarına sapa kalması nedeniyle seyrek nüfusludur.",
    examTip: "KPSS Tuzağı: Marmara bölgesinde olmasına rağmen sanayi ve nüfusu gelişmeyen istisnai yerdir.",
  },
  {
    name: "Teke & Taşeli Platoları (Seyrek Nüfus)",
    city: "Muğla/Mersin",
    x: 230.0,
    y: 330.0,
    description: "Karstik arazi yapısı, su tutmayan toprak ve engebe sebebiyle Akdeniz'in seyrek nüfuslu yerleridir.",
    examTip: "Karstik kireçtaşı arazinin tarıma elverişsizliği nüfusu tenhalaştırmıştır.",
  },
  {
    name: "Hakkari Yöresi (Seyrek Nüfus)",
    city: "Hakkari",
    x: 940.0,
    y: 255.0,
    description: "Aşırı engebe, yüksek iklim koşulları ve ulaşımsızlık nedeniyle Türkiye'nin en seyrek nüfuslu alanlarındandır.",
    examTip: "İklim ve yer şekillerinin olumsuzluğunun birlikte etkili olduğu temel yerdir.",
  },
  {
    name: "Tuz Gölü & Karapınar Çevresi (Seyrek Nüfus)",
    city: "Konya/Aksaray",
    x: 390.0,
    y: 230.0,
    description: "Şiddetli kuraklık, su kıtlığı ve çölleşme riski nedeniyle düz olmasına rağmen seyrek nüfusludur.",
    examTip: "Yer şekilleri düz olduğu halde SADECE İKLİM (kuraklık) nedeniyle nüfusu az olan yer örneğidir.",
  },
];

export const TURKEY_DWELLINGS: GeoPin[] = [
  {
    name: "Ahşap Meskenler Bölgesi (Doğu Karadeniz)",
    city: "Rize/Artvin",
    x: 780.0,
    y: 70.0,
    description: "Geniş orman örtüsü ve nemli iklim sebebiyle kırsal konutlarda ahşap malzeme hakimdir.",
    examTip: "Kırsal mimaride bitki örtüsü ve iklim uyumuna en net örnektir.",
  },
  {
    name: "Kerpiç Meskenler Bölgesi (İç ve Güneydoğu)",
    city: "Şanlıurfa/Konya",
    x: 700.0,
    y: 310.0,
    description: "Kuru karasal iklim ve toprak yapısı sebebiyle killi saman karışımı kerpiç evler yaygındır.",
    examTip: "Harran Kümbet Evleri kerpiç mesken yapısının simgesidir.",
  },
  {
    name: "Taş Meskenler Bölgesi (Akdeniz & Doğu Anadolu)",
    city: "Mardin/Muğla",
    x: 790.0,
    y: 300.0,
    description: "Karstik kalker ve volkanik bazalt/tüf kayaç zenginliği sebebiyle taş yapı hakimdir.",
    examTip: "Mardin tarihi taş evleri ve Nevşehir tüf kaya evleri kültür mirasıdır.",
  },
];

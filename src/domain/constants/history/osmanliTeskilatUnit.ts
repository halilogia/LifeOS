import type { HistoryUnit } from "./types.js";

export const OSMANLI_TESKILAT_UNIT: HistoryUnit = {
  id: "osmanli-teskilat",
  navLabel: "Osmanlı Devlet Teşkilatı",
  mode: "diagram",
  title: "Osmanlı Devlet Teşkilatı ve Kültür Medeniyet",
  subtitle: "11 kilit kurum · hiyerarşiyi sırasıyla keşfet",
  showYear: false,
  color: "#c99a3c",
  legend: [
    { c: "#c99a3c", l: "Padişah" },
    { c: "#1f5f7a", l: "Seyfiye" },
    { c: "#7c3aed", l: "İlmiye" },
    { c: "#2f8f5b", l: "Kalemiye" },
  ],
  events: [
    { year: 1299, title: "Padişah ve Şehzade (Sancağa Çıkma)", desc: "Devletin başı ve veliaht yetiştirme sistemi.", tag: "Merkez", color: "#c99a3c" },
    { year: 1300, title: "Divan-ı Hümayun", desc: "Devlet işlerinin görüşüldüğü karar organı.", tag: "Merkez", color: "#c99a3c" },
    { year: 1320, title: "Sadrazam (Vezir-i Azam)", desc: "Padişahın mutlak vekili, mühür sahibi.", tag: "Seyfiye", color: "#1f5f7a" },
    { year: 1330, title: "Vezirler", desc: "Divan üyeleri, bakanlar kurulu.", tag: "Seyfiye", color: "#1f5f7a" },
    { year: 1340, title: "Kazasker", desc: "Adalet ve eğitim işlerine bakan yüksek yargıç.", tag: "İlmiye", color: "#7c3aed" },
    { year: 1345, title: "Şeyhülislam (Müftü)", desc: "Din işlerinin başı, fetva verme yetkisine sahip en yüksek ilmiye mensubu.", tag: "İlmiye", color: "#7c3aed" },
    { year: 1350, title: "Defterdar", desc: "Maliye işlerinden sorumlu, bütçeyi yöneten.", tag: "Kalemiye", color: "#2f8f5b" },
    { year: 1360, title: "Nişancı", desc: "Arazi kayıtları ve tuğra çekmeden sorumlu.", tag: "Kalemiye", color: "#2f8f5b" },
    { year: 1365, title: "Reisülküttab", desc: "Kalemiye sınıfının başı; 17. yy sonrası Dışişleri Bakanı işlevi görmüştür.", tag: "Kalemiye", color: "#2f8f5b" },
    { year: 1370, title: "Kaptan-ı Derya / Yeniçeri Ağası", desc: "Donanma ve askeriyenin divandaki temsilcileri (vezir rütbeli ise).", tag: "Seyfiye", color: "#1f5f7a" },
    { year: 1380, title: "Taşra Teşkilatı", desc: "Eyalet > Sancak > Kazâ > Köy hiyerarşisi.", tag: "Taşra", color: "#c99a3c" },
  ],
};

import type { HistoryUnit } from "./types.js";

export const OSMANLI_TESKILAT_UNIT: HistoryUnit = {
  id: "osmanli-teskilat",
  navLabel: "Osmanlı Devlet Teşkilatı",
  mode: "diagram",
  title: "Osmanlı Devlet Teşkilatı ve Kültür Medeniyet",
  subtitle: "Divan-ı Hümayun, Seyfiye, İlmiye, Kalemiye ve Taşra Hiyerarşisi",
  showYear: false,
  color: "#c99a3c",
  legend: [
    { c: "#c99a3c", l: "Padişah / Merkez" },
    { c: "#1f5f7a", l: "Seyfiye (Yürütme/Asker)" },
    { c: "#7c3aed", l: "İlmiye (Yargı/Eğitim)" },
    { c: "#2f8f5b", l: "Kalemiye (Bürokrasi/Maliye)" },
  ],
};

export const SELCUKLU_TESKILAT_UNIT: HistoryUnit = {
  id: "teskilat",
  navLabel: "Selçuklu Devlet Teşkilatı",
  mode: "diagram",
  title: "Anadolu Selçuklu Devlet Teşkilatı",
  subtitle: "9 kurum · hiyerarşiyi sırasıyla keşfet",
  showYear: false,
  color: "#c99a3c",
  legend: [
    { c: "#c99a3c", l: "Hükümdar / merkez" },
    { c: "#e5a967", l: "Divan üyeleri" },
  ],
};

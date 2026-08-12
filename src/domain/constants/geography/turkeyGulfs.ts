import type { GeoPin } from "./types.js";

export const TURKEY_GULFS: GeoPin[] = [
  // Marmara Denizi Körfezleri
  { name: "İzmit Körfezi", city: "Kocaeli", x: 220.0, y: 80.0, category: "Marmara" },
  { name: "Gemlik Körfezi", city: "Bursa", x: 200.0, y: 100.0, category: "Marmara" },
  { name: "Erdek Körfezi", city: "Balıkesir", x: 140.0, y: 110.0, category: "Marmara" },

  // Ege Denizi Körfezleri
  { name: "Saros Körfezi", city: "Çanakkale/Edirne", x: 60.0, y: 90.0, category: "Ege" },
  { name: "Edremit Körfezi", city: "Balıkesir", x: 80.0, y: 180.0, category: "Ege" },
  { name: "Çandarlı Körfezi", city: "İzmir", x: 70.0, y: 200.0, category: "Ege" },
  { name: "İzmir Körfezi", city: "İzmir", x: 75.0, y: 220.0, category: "Ege" },
  { name: "Sığacık Körfezi", city: "İzmir", x: 70.0, y: 250.0, category: "Ege" },
  { name: "Kuşadası Körfezi", city: "Aydın/İzmir", x: 75.0, y: 270.0, category: "Ege" },
  { name: "Güllük (Mandalya) Körfezi", city: "Muğla", x: 90.0, y: 290.0, category: "Ege" },
  { name: "Gökova Körfezi", city: "Muğla", x: 110.0, y: 310.0, category: "Ege" },
  { name: "Hisarönü Körfezi", city: "Muğla", x: 120.0, y: 330.0, category: "Ege" },

  // Akdeniz Körfezleri
  { name: "Fethiye Körfezi", city: "Muğla", x: 150.0, y: 350.0, category: "Akdeniz" },
  { name: "Finike Körfezi", city: "Antalya", x: 230.0, y: 360.0, category: "Akdeniz" },
  { name: "Antalya Körfezi", city: "Antalya", x: 280.0, y: 370.0, category: "Akdeniz" },
  { name: "Mersin Körfezi", city: "Mersin", x: 450.0, y: 380.0, category: "Akdeniz" },
  { name: "İskenderun Körfezi", city: "Hatay", x: 530.0, y: 390.0, category: "Akdeniz" },

  // Karadeniz Körfezleri
  { name: "Sinop (Hamsilos)", city: "Sinop", x: 500.0, y: 35.0, category: "Karadeniz" },
  { name: "Samsun Körfezi", city: "Samsun", x: 540.0, y: 45.0, category: "Karadeniz" },
];

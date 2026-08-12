# Harita Kapsamı Genişletme Planı: Türkiye Haritası vs. Dünya / Genişletilmiş İmparatorluk Haritası

Bu plan, kullanıcının tespiti üzerine KPSS Tarih harita modülünde konuların coğrafi ölçeğine göre **Türkiye Haritası** ile **Genişletilmiş İmparatorluk / Dünya (Avrupa - Akdeniz - Orta Doğu - Kuzey Afrika)** haritasının ne zaman kullanılacağını ve mimarisini tanımlar.

---

## 🔍 Hangi Konu Hangi Haritayı Kullanmalı?

### 1. 🇹🇷 Türkiye SVG Haritası Kullanacak Konular (Yerel / Anadolu Odaklı)
- **I. Dönem Anadolu Beylikleri (1071-12. yy)**: Erzurum, Sivas, Erzincan, İzmir, Mardin.
- **Anadolu Selçuklu Devleti (1075-1308)**: İznik, Konya, Alanya, Denizli.
- **II. Dönem Anadolu Beylikleri (13-15. yy)**: Kütahya, Balıkesir, Konya, Maraş, Manisa.
- **Türkiye Cumhuriyeti & Kurtuluş Savaşı (1919-1923)**: Samsun, Amasya, Erzurum, Sivas, Ankara, Afyon, İzmir.

### 2. 🌍 Genişletilmiş Dünya / İmparatorluk Haritası Kullanacak Konular (Küresel / Üç Kıta)
- **Osmanlı Yükselme Dönemi (1453-1579)**: İstanbul (1453), Belgrad (1521), Mohaç (Macaristan 1526), Viyana (1529), Mısır/Kahire (1517), Preveze (Yunanistan), Cezayir, Trablusgarp (Libya).
- **Osmanlı Duraklama Dönemi (1579-1699)**:
  - 📜 **Ferhat Paşa Antlaşması (1590)**: Doğu'da en geniş sınırlar (İran / Tebriz / Hazar Kıyısı).
  - 📜 **Bucaş Antlaşması (1672)**: Batı'da en geniş sınırlar (Podolya / Ukrayna).
  - ⚔️ **II. Viyana Kuşatması (1683)**: Avusturya / Viyana önleri.
  - 📜 **Karlofça Antlaşması (1699)**: Macaristan & Mora kaybı.
- **Osmanlı Gerileme Dönemi (1700-1792)**: Prut (Moldova/Ukrayna), Pasarofça (Belgrad), Küçük Kaynarca (Kırım).
- **Osmanlı Dağılma Dönemi (1792-1922)**: Trablusgarp (Libya), Balkan Savaşları (Makedonya/Selanik), I. Dünya Savaşı (Çanakkale, Sarıkamış, Mısır/Kanal, Hicaz/Medine, Irak/Kut'ül Amare).

---

## 🛠️ Mimari Yaklaşım

1. **Yeni Harita Katmanı**: `WorldHistoryMapCanvas.tsx` veya `EmenaMapCanvas.tsx` (Europe, Middle East, North Africa SVG haritası).
2. **Ünite Modu (`HistoryUnit.mode`)**:
   - `mode: "territory"` -> Türkiye haritası.
   - `mode: "world-territory"` veya `mapType: "world"` -> Genişletilmiş Dünya/İmparatorluk haritası.
3. **Koordinat Kalibrasyonu**:
   - Viyana (48.2° N, 16.3° E), Tebriz (38.0° N, 46.2° E), Kahire (30.0° N, 31.2° E), Podolya (48.8° N, 26.5° E) noktalarının Dünya SVG haritasındaki `x, y` kalibrasyonu.

---

## 📊 Proposed Changes

### [NEW] [WorldProvincePaths.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/history/WorldProvincePaths.ts)
- Avrupa, Orta Doğu, Kuzey Afrika ve Kafkasya ülkelerinin SVG sınır yolları (paths) ve viewBox kalibrasyonu.

### [NEW] [WorldHistoryMapCanvas.tsx](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/kpss/map/WorldHistoryMapCanvas.tsx)
- Dünya/EMENA haritası SVG render bileşeni (Viyana, Ukrayna Podolya, Mısır, İran pin ve sınır çizimi).

### [MODIFY] [HistoryMapView.tsx](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/kpss/map/HistoryMapView.tsx)
- Ünitenin `mapType` (Turkey vs World) özelliğine göre ilgili harita tuvalini dinamik yükleme.

---

## 🧪 Verification Plan

### Automated Tests
- `npm run build` ile hatasız Vite derlemesi.

### Manual Verification
- Sol menüden **Osmanlı Yükselme, Duraklama, Gerileme, Dağılma** seçildiğinde genişletilmiş imparatorluk haritasının (Viyana, Ukrayna, Mısır, İran) açılması ve pinlerin Viyana/Tebriz/Kahire/Podolya üzerinde doğru gösterilmesi.

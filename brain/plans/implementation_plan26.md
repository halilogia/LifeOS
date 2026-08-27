# 🏙️ Şehir Etkinlikleri (City Pulse) Modülü Geliştirme Planı

Bu plan, **Şehir Etkinlikleri (City Pulse)** modülünü tıpkı **Ücretsiz Oyunlar** ve **Ücretsiz Oyun Assetleri** modüllerimizdeki yüksek görsel kaliteye, zengin portal kısayollarına, afiş görsellerine ve takvim entegrasyonuna kavuşturmayı hedefler.

---

## 📌 Kullanıcı İncelemesi Gereken Noktalar

> [!NOTE]
> - WordPress REST API uç noktasına `_embed` parametresi eklenerek etkinliklerin öne çıkan afiş görselleri (`wp:featuredmedia`) çekilecektir.
> - Afişi bulunmayan veya yüklenemeyen etkinliklerde kategoriye özel tematik SVG görsel kapakları gösterilecektir (Konser, Tiyatro, Sergi, vb.).
> - Her etkinliğe tek tıkla **Google Takvim'e Ekle** (`calendar.google.com`) butonu eklenecektir.

---

## 🛠️ Yapılacak Değişiklikler

### 1. Veri Tipleri & Sözleşmeler (Types & Contracts)
- **`src/types/cityPulse.ts`**:
  - `CityEvent` nesnesine `imageUrl?: string`, `venueName?: string`, `priceType?: "free" | "paid" | "unknown"`, `source?: string` alanları eklenecek.
  - `EventHubShortcut` tipi tanımlanacak (İsim, URL, İkon, Açıklama, Kategori).

### 2. Servis Katmanı & Canlı Veri (Services)
- **`src/services/cityPulseService.ts`**:
  - `_embed` parametresiyle `_embedded['wp:featuredmedia']` ve `content.rendered` içindeki görsel URL'lerini ayıklama motoru.
  - Hızlı Kültür/Bilet/Etkinlik Portalları listesi (`CITY_EVENT_HUBS`):
    - 🏛️ **İBB Kültür Sanat** (`kultur.istanbul`)
    - 🎭 **Biletix / Passo / Bubilet / Biletinial**
    - 🏛️ **Bizİzmir Kültür** (`bizizmir.com`)
    - 🎨 **Müzeler & Galeriler** (İstanbul Modern, Pera, Sakıp Sabancı)
    - 💻 **Meetup & Tech Istanbul** (Teknoloji & Yazılım)
    - 🎼 **CSO Ada & AKM** (Kültür ve Turizm Bakanlığı)
  - Ağ zaman aşımı ve bağlantı kopmalarına karşı güvenli fallback & cache yönetimi.

### 3. Görsel Sunum Katmanı (Presentation & UI - Layout Assembly Pattern)
- **`src/components/citypulse/EventHubsBar.tsx`** `[YENİ]`:
  - 8+ popüler kültür, bilet ve etkinlik merkezine tek tıkla giden şık cam efektli (glassmorphic) kısayol çipleri.
- **`src/components/citypulse/CityPulseFilterBar.tsx`** `[GÜNCELLEME]`:
  - Kategori filtreleri, arama çubuğu, ücretsiz filtresi ve anlık yenileme butonu.
- **`src/components/citypulse/CityEventCard.tsx`** `[GÜNCELLEME]`:
  - Görsel afişli zengin kart yapısı.
  - Tarih rozeti, mekan/tür etiketleri, favori kalp butonu, **"📅 Takvime Ekle"** butonu ve detay linki.
- **`src/components/CityPulseView.tsx`** `[GÜNCELLEME]`:
  - `EventHubsBar`, `CityPulseFilterBar`, dinamik grid ve durum mesajlarını orkestre eden ana tuval.
- **`src/presentation/hooks/useCityPulse.ts`** `[GÜNCELLEME]`:
  - Takvim bağlantısı üretici (`getGoogleCalendarUrl(event)`) ve gelişmiş arama/kategori filtreleme.

### 4. Tasarım & Stiller (CSS)
- **`src/css/newtab/city-pulse.css`** `[GÜNCELLEME]`:
  - Afiş görseli hover efektleri, cam efektli kart ızgarası, takvim butonları ve hub çipleri.

### 5. Yerelleştirme (i18n)
- **`src/utils/translations/tr/` & `en/`**:
  - Yeni butonlar, takvim ekleme, hub portal başlıkları ve durum metinleri.

---

## 🧪 Doğrulama Planı

### Otomatik Testler
- `tests/cityPulseService.test.ts` unit testleri (HTML ayıklama, görsel URL tespiti, takvim bağlantısı, filtreleme).
- `npm test` (`vitest run`) — 12+ test dosyasında sıfır hata.
- `npm run build` — Vite TypeScript derleme doğrulaması.

### Manuel Doğrulama
- Şehir Etkinlikleri sayfasına girip afişli kartların, Event Hubs çiplerinin, filtrelerin ve Google Takvim ekleme bağlantılarının sorunsuz çalıştığının doğrulanması.

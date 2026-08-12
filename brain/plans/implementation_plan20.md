# Dijital Detoks: Shorts, Reels & Anti-Doomscrolling Geliştirme Planı

Bu geliştirme planı, ZenTodo / Life OS **Dijital Detoks** modülünü genişleterek **YouTube Shorts**, **Instagram Reels**, **Facebook Reels/Kısa Videolar** ve **TikTok kaydırma** (doomscrolling) içeriklerini temizleme ve odak modunu aktif etmeyi hedeflemektedir.

---

## ⚠️ Kullanıcı İncelemesi Gereken Konular (User Review Required)

> [!IMPORTANT]
> **YouTube Ana Sayfa Akışının Temizlenmesi & İlham Kartı**:
> Kullanıcının ilettiği ekran görüntüsünde olduğu gibi `yt_feed_block` (YouTube Ana Sayfa Akışını Gizle) seçeneği aktifleştiğinde, YouTube ana sayfasındaki sonsuz video ızgarası (`ytd-rich-grid-renderer`) gizlenecek ve yerine ekranın ortasında şık, karanlık cam efektli (**glassmorphic**) bir **İlham Verici Söz Kartı** görüntülenecektir.

> [!NOTE]
> **Mobil & Web Buton Engelleme (Saner Social Media Tarzı)**:
> - **YouTube**: Sol navigasyon çubuğundaki **Shorts** sekmesi, ana sayfa ve aramalardaki **Shorts rafları** gizlenecek, doğrudan `/shorts/` adresine girildiğinde engellenecek.
> - **Instagram**: Sol menüdeki **Reels** ve **Keşfet** butonları ve akışları gizlenecek.
> - **Facebook**: **Reels ve Kısa Videolar** rafları ve yan menü Reels butonu gizlenecek.
> - **TikTok**: Sonsuz kaydırma akışı gizlenecek veya engellenecek.

---

## 🛠️ Önerilen Değişiklikler ve Dosya Haritası

### 1. Domain & Storage Katmanı

#### [MODIFY] [useDetox.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/presentation/hooks/useDetox.ts)
- `distractionSettings` state'i ve `saveDistractionSettings()` metodunun eklenmesi.
- `chrome.storage.sync` üzerinde `distraction_settings` anahtarının senkronize edilmesi.

---

### 2. Content Script Katmanı (İçerik Temizleme Motoru)

#### [NEW] [distractionCleaner.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/content/detox/distractionCleaner.ts)
- CSS Enjeksiyonu + DOM MutationObserver ile sayfa yüklendiği ve kaydırıldığı anda (layout kayması olmadan) hedef öğeleri gizleme motoru:
  - **YouTube Selectors**:
    - Shorts Sidebar & Mini Guide: `ytd-guide-entry-renderer a[href*='/shorts']`, `ytd-mini-guide-entry-renderer a[href*='/shorts']`, `a[title='Shorts']`
    - Shorts Shelves: `ytd-rich-shelf-renderer[is-shorts]`, `ytd-reel-shelf-renderer`
    - Home Feed Replacement: `ytd-rich-grid-renderer` gizlenip yerine motivasyonel söz banner'ı koyma.
    - Comments: `ytd-comments`, `#comments` gizleme seçeneği.
  - **Instagram Selectors**:
    - Reels Link: `a[href*='/reels/']`, `a[aria-label*='Reels']`
    - Explore Link: `a[href*='/explore/']`, `a[aria-label*='Explore']`
    - Feed: Main feed `article` ve `div[role='main']` öğeleri.
  - **Facebook Selectors**:
    - Reels Tab & Shelf: `a[href*='/reels/']`, `div[data-pagelet*='Reels']`, `div[aria-label*='Reels']`
  - **TikTok Selectors**:
    - Feed & Scrolling Video Containers.

#### [MODIFY] [detoxBlocker.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/content/detox/detoxBlocker.ts)
- `initDistractionCleaner()` fonksiyonunun çağrılması ve `chrome.storage` değişiklik dinleyicisine `distraction_settings` eklenmesi.

---

### 3. UI Layer & Bileşenler

#### [NEW] [DetoxDistractionCard.tsx](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/detox/DetoxDistractionCard.tsx)
- YouTube, Instagram, Facebook ve TikTok için bağımsız anahtar (toggle switch) kartı.
- Temiz, modern, glassmorphic arayüz.

#### [MODIFY] [DetoxView.tsx](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/DetoxView.tsx)
- `<DetoxDistractionCard />` bileşeninin detoks sekmesine eklenmesi.

#### [MODIFY] [tr/detox.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/utils/translations/tr/detox.ts) & [en/detox.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/utils/translations/en/detox.ts)
- Yeni eklenen tüm buton ve ayarlar için Türkçe ve İngilizce i18n metinleri.

---

## 🧪 Doğrulama Planı (Verification Plan)

### Otomatik Testler & Derleme Kontrolleri
- `npx tsc --noEmit`: Tüm TypeScript tiplerinin ve storage arayüzlerinin 0 hata ile derlendiğini doğrulamak.
- `npx eslint src`: Kod ve linter standartlarına uyumu doğrulamak.
- `npm run build`: Vite extension paketinin sorunsuz oluşturulduğunu doğrulamak.

### Manuel Doğrulama
- YouTube, Instagram, Facebook ve TikTok üzerinde ilgili ayarlar açıldığında Shorts, Reels ve Ana Sayfa Akışının başarıyla gizlendiğini ve YouTube ana sayfasında İlham Kartı çıktığını test etmek.

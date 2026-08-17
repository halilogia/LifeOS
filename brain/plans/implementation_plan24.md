# City Pulse — İstanbul Ücretsiz Etkinlikler Modülü (LifeOS Chrome Extension)

## Problem & Amaç

Kullanıcı, **Free Games** modülündeki gibi İstanbul'daki **ücretsiz aktiviteleri** gösteren bir panel istiyor. Araştırma sonucu gerçek, canlı, anahtar gerektirmeyen veri kaynağı bulundu: **kultur.istanbul** (İBB Kültür A.Ş. resmi portalı) WordPress REST API.

## Araştırma Bulguları (Veri Kaynağı)

| Kaynak | Durum |
|---|---|
| `data.ibb.gov.tr` CKAN | Etkinlik API'si yok; sadece XLSX istatistik setleri. **Elendi** |
| `api.ibb.gov.tr/MetroIstanbul/.../GetActivities` | Canlı çalışıyor ama haber/duyuru içeriği, takvim/ücret alanı yok. **Elendi** |
| `kultur.istanbul/wp-json/wp/v2/event_listing` | **SEÇİLDİ** — gerçek etkinlik post type'ı, taksonomiler: `event_listing_category` (konum) + `event_listing_type` (tür) |

### Doğrulanmış API Örnekleri (canlı test edildi)

```
GET https://kultur.istanbul/wp-json/wp/v2/event_listing?per_page=20&_fields=id,date,link,title,content,event_listing_category,event_listing_type
GET https://kultur.istanbul/wp-json/wp/v2/event_listing_category?per_page=100&_fields=id,name,count  (konumlar: "Müze Gazhane", "Şerefiye Sarnıcı"...)
GET https://kultur.istanbul/wp-json/wp/v2/event_listing_type?per_page=100&_fields=id,name,count      (türler: "Konser", "Atölye"...)
```

- `title.rendered` → başlık, `content.rendered` → açıklama (HTML, escape edilecek)
- `event_listing_type`/`category` → **ID dizileri** (name'ler ayrı `_type`/`_category` istekleriyle alınır)
- Kültür A.Ş etkinlikleri İBB kaynaklı, çoğu **ücretsiz** (Metro etkinliği örneğinde "Etkinlik ücretsizdir" ibaresi geçiyor). Bilgi: etkinlik sayfasında ayrıca link → pasaj.

## Kullanıcı Onayı Gereken Kararlar

> [!IMPORTANT]
> API'de **ücret bilgisi** alanı yok (fiyat yalnızca etkinlik sayfasında). Bu nedenle modül **"Ücretsiz İstanbul Etkinlikleri"** olarak adlandırılsa da veri, İBB Kültür'ün tüm güncel etkinliklerini içerir; kart üzerinde "Kayıt/Bilet" linki gösterilir. Tamamen ücretsiz filtreleme ancak `content` metninde "ücretsiz/ücretli" kelime analizi ile yapılabilir (varsayılan: tüm etkinlikler + "Ücretsiz" filtre çipi).

> [!NOTE]
> Modül adı "Zen/yen" yasağına takılmasın: **City Pulse** (şehir nabzı) özgün isim. Türkçe menü: "Şehir Etkinlikleri".

## Açık Sorular

1. Modül varsayılan sidebar sırası: `free-games`'ten sonra mı, en üste mi? (Plan: free-games + ai-chat sabit pimli; yeni view `free-games`'ten sonra eklenir)
2. Ücret filtresi: yalnız "ücretsiz" ibaresi içerenleri göstermek ister misin (agresif, az sonuç) yoksa tüm İBB etkinlikleri + ayrı filtre mi? (Plan: ikincisi — tümü + "Ücretsiz" çip'i, içerikte "ücretli" geçenleri hariç tutar)
3. Kartlarda favori işareti (kalp) storage'da saklansın mı? (Plan: evet, `chrome.storage.local` key ile)

## Önerilen Değişiklikler

### Yeni Tip Tanımları — [NEW] [`src/types/cityPulse.ts`](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/types/cityPulse.ts)

```ts
export interface CityEventCategory { id: number; name: string; count: number; }
export interface CityEventType { id: number; name: string; count: number; }
export interface CityEvent {
  id: number;
  title: string;
  link: string;
  date: string;               // ISO
  excerpt: string;            // HTML stripped metin
  categoryIds: number[];
  typeIds: number[];
}
export interface CachedCityEvents { timestamp: number; data: CityEvent[]; }
```

### Veri Servisi (AGENTS.md 6.3: `src/services/`) — [NEW] [`src/services/cityPulseService.ts`](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/services/cityPulseService.ts)

- `fetchEvents(forceFresh?)`: `event_listing` sayfalı (per_page=50, 3 sayfa) → normalize edilir, cache'e yazılır.
- `fetchCategories()`, `fetchTypes()`: taksonomi istekleri + cache (7 gün).
- Ortam değişkeni yok → sabit URL'ler servis içinde (gamesService deseniyle birebir).
- Hata: `logger.error` + eski cache fallback (gamesService aynı deseni).

### Cache Repository — [NEW] [`src/domain/repositories/ICityPulseCacheRepository.ts`](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/repositories/ICityPulseCacheRepository.ts) + [NEW] [`src/infrastructure/persistence/repositories/ChromeStorageCityPulseCacheRepository.ts`](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/infrastructure/persistence/repositories/ChromeStorageCityPulseCacheRepository.ts)

- `getCache(key)/setCache(key)` genel + favorites (array of ids) get/set.
- Storage key'leri [keys.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/infrastructure/storage/keys.ts) içine: `LOCAL_CITY_PULSE_EVENTS`, `LOCAL_CITY_PULSE_TAXONOMIES`, `LOCAL_CITY_PULSE_FAVORITES`.

### Hook — [NEW] [`src/presentation/hooks/useCityPulse.ts`](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/presentation/hooks/useCityPulse.ts)

- State: events, categories, types, loading, error, searchQuery, activeCategory ("all"), activeType ("all"), freeOnly, favorites, refresh.
- Filtre mantığı hook içinde (FreeGames deseni): kategori → `categoryIds.includes(id)`, tür → `typeIds.includes(id)`, "Ücretsiz" çipi → içerikte `ücretli` geçmiyor ve (`ücretsiz|free|giriş ücretsiz|bedava` geçiyor) VEYA filtre kapalıyken tümü.
- Favoriler: kalp toggle → storage'a yaz, "Favoriler" sekmesi (tıpkı FreeGames `giveaways`/`wasitfree` tab yapısı).

### UI Bileşenleri — [NEW]

- [`src/components/CityPulseView.tsx`](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/CityPulseView.tsx) — Layout Assembly Pattern: tuval (state via hook) + parçalar.
- [`src/components/citypulse/CityPulseFilterBar.tsx`](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/citypulse/CityPulseFilterBar.tsx) — arama, kategori/tür select, "Ücretsiz" çipi, Favoriler tab'ı.
- [`src/components/citypulse/EventCard.tsx`](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/citypulse/EventCard.tsx) — başlık, tarih, kategori rozeti, açıklama (escape), favori kalbi, "Detaylar" linki.
- `translations`'da `citypulse` modülü: [NEW] [`src/utils/translations/tr/city.ts`](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/utils/translations/tr/city.ts) + [NEW] `src/utils/translations/en/city.ts`, ikisine de `index.ts`'e import eklenir.

### Yönlendirme & Gezinme — [MODIFY]

#### [MODIFY] [Sidebar.tsx](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/Sidebar.tsx)
`getItemLabel` switch'ine `case "city-pulse": return t.sidebar_city_pulse;` eklenir.

#### [MODIFY] [SidebarIcons.tsx](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/sidebar/SidebarIcons.tsx)
`case "city-pulse":` → SVG icon (location/pulse ikonu).

#### [MODIFY] [ViewRouter.tsx](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/ViewRouter.tsx)
Lazy import + `case "city-pulse": return <CityPulseView lang={lang} />;`

#### [MODIFY] [sidebarConstants.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/sidebarConstants.ts)
`"city-pulse"` entry'si `"free-games"`'ten sonra eklenir.

#### [MODIFY] [core.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/utils/translations/tr/core.ts) + `en/core.ts`
`view_city_pulse`, `sidebar_city_pulse` anahtar çiftleri eklenir.

### Stil — [MODIFY]

- [NEW] [`src/css/newtab/city-pulse.css`](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/css/newtab/city-pulse.css) — mevcut glassmorphism token'ları (`var(--card-bg)`, `var(--accent-color)`, `var(--card-border)`) ile premium kart grid, rozetler, kalp animasyonu, "Ücretsiz" çipi. Emoji yok — inline SVG.
- [MODIFY] [`src/newtab.css`](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/newtab.css) — `@import "./css/newtab/city-pulse.css";`

### Dokümantasyon — [MODIFY]

- [MODIFY] [`src/ARCHITECTURE.md`](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/ARCHITECTURE.md) — Feature Haritası'na CityPulse satırı.

## Doğrulama Planı

### Otomatik Testler
- `npx tsc --noEmit` — sıfır derleme hatası
- `npx eslint src` — sıfır lint hatası (no-explicit-any dahil)
- `npx prettier --write src` — format temizliği
- `npm run build` — dist üretilir
- `node scripts/findDeadFiles.mjs` — "Toplam: 0 dosya"

### Manuel Doğrulama
- `dist/` Chrome'a yüklenir → Sidebar'da "Şehir Etkinlikleri" görünür
- Panel açılır → canlı etkinlik kartları (başlık + açıklama + kategori rozeti + link)
- Filtreler: kategori, tür, arama, "Ücretsiz" çipi, Favoriler sekmesi
- TR/EN dil geçişi kontrolü

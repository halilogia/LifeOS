# KPSS Ders Konu Analizi Veri Aktarımı

## Amaç

`archives/ders_konu_analizi.xlsx` dosyasındaki 80 konuluk (6 ders) konu-isim ve ortalama soru verisini `kpssCurriculum.ts`'e aktarmak. Aynı anda `KpssTopicDetailModal.tsx`'teki hardcoded `"soru — KPSS Lisans sınavında bu konudan çıkan soru sayısı"` etiketini i18n anahtarına dönüştürmek.

---

## Excel → Kod Eşleştirme

Excel'deki yapı daha **granüler** (her konu ayrı satır), mevcut kod bazı konuları **birleştirmiş**. Strateji: **Excel'deki konuları koru, mevcut kodda birleştirilmiş olanları ayır, eksik konuları ekle.**

| Ders | Excel Konu Sayısı | Mevcut Kod Konu Sayısı | Fark |
|---|---|---|---|
| Türkçe | 13 | 14 (Anlatım Teknikleri + Fiilimsiler kodda fazla) | -1 + 2 yeni |
| Matematik | 31 | 24 | +7 yeni |
| Geometri | 5 | 9 | -4 (Excel daha az) |
| Tarih | 13 | 13 | ~eşit |
| Coğrafya | 11 | 11 | ~eşit |
| Vatandaşlık | 8 | 10 (Bilim-Teknoloji + Güncel Olaylar kodda fazla) | -2 ekstra |

## Yapılacak İşler

### 1. `kpssCurriculum.ts` — Veri Güncelleme

Her ders için Excel'deki konuları birebir al, mevcut `description` metinlerini koru/güncelle:

- **Türkçe**: 13 konu (Excel). Mevcut kodda olan "Anlatım Teknikleri" ve "Fiilimsiler ve Fiilde Çatı" Excel'de yok → **silinecek**. "Paragraf" → "Paragraf Yapısı ve Anlamı" olarak kalır ama soru sayısı `15` (Excel). 
- **Matematik**: 31 konu (Excel). Mevcut kod 24 konu — **7 yeni konu eklenecek** (Dört İşlem, İşçi Problemleri, Karışım Problemleri, vb. ayrı ayrı). Birleştirilmişler ("Üslü/Köklü", "Sayı/Kesir Problemleri", "Yaş/Hareket") **ayrılacak**.
- **Geometri**: 5 konu (Excel). Mevcut kod 9 konu — **4 konu silinecek** (Doğruda/Üçgende Açılar, Özel Üçgenler, Açıortay/Kenarortay, Üçgende Alan/Benzerlik). Excel'de bunlar "Geometrik Kavramlar ve Açılar" altında toplanmış.
- **Tarih**: 13 konu — mevcut kodla benzer, isimler ve soru sayıları güncellenecek.
- **Coğrafya**: 11 konu — mevcut kodla benzer.
- **Vatandaşlık**: 8 konu (Excel). Mevcut kodda "Bilim ve Teknoloji" + "Güncel Olaylar" **Genel Kültür** altında kalmalı mı? Excel'de yok → **tartışma konusu**.

> [!IMPORTANT]
> **Açık Soru**: Vatandaşlık'taki "Bilim ve Teknoloji Gelişmeleri" ve "Güncel Olaylar" konuları Excel'de yok. Bunlar kodda kalsın mı, silinsin mi? (Bunlar KPSS'de Genel Kültür'ün parçası, Vatandaşlık değil aslında.)

### 2. `KpssTopicDetailModal.tsx` — Hardcoded Etiket → i18n

Satır 77'deki:
```tsx
soru — KPSS Lisans sınavında bu konudan çıkan soru sayısı
```
Yerine i18n anahtarı:
```tsx
{t.kpss_topic_avg_questions}
```
Değer (TR): `"2020-2024 KPSS Lisans Sınavlarındaki Ortalama Soru Sayısı"`
Değer (EN): `"Average Questions in 2020–2024 KPSS Undergraduate Exams"`

### 3. i18n Anahtarları

| Anahtar | TR | EN |
|---|---|---|
| `kpss_topic_avg_questions` | 2020-2024 KPSS Lisans Sınavlarındaki Ortalama Soru Sayısı | Average Questions in 2020–2024 KPSS Undergraduate Exams |

Eklenecek dosyalar:
- `tr/kpss.ts` (veya `tr/core.ts`?)
- `en/kpss.ts`

> [!NOTE]
> `kpss_` prefix'li anahtar → `tr/kpss.ts` modülüne eklenir. `KpssTopicDetailModal` `t` prop'undan okur — `getTranslation(lang)` proxy'si.

### 4. Veri Doğruluğu

Excel'deki "Ortalama Soru" değerleri orijinal haliyle aktarılacak. Yıl aralığı `kpss-lisans-2019-2025-konu-analizi.html` dosyasına göre **2019-2025** olabilir. Kullanıcı `2029-2024` yazmış (typo). Etikette hangi yıl aralığını yazalım?

> [!IMPORTANT]
> **Açık Soru**: Etikette hangi yıl aralığı yazılmalı? Excel verisi 2006-2025 arası sınavlardan mı yoksa sadece 2019-2025'ten mi ortalanmış?

---

## Değişecek Dosyalar

| Dosya | İşlem | Açıklama |
|---|---|---|
| `src/domain/constants/kpssCurriculum.ts` | MODIFY | Tüm konu listesi + soru sayıları güncellenecek |
| `src/components/kpss/topics/KpssTopicDetailModal.tsx` | MODIFY | Hardcoded string → `{t.kpss_topic_avg_questions}` |
| `src/utils/translations/tr/kpss.ts` | MODIFY | +`kpss_topic_avg_questions` anahtarı |
| `src/utils/translations/en/kpss.ts` | MODIFY | +`kpss_topic_avg_questions` anahtarı |

---

## Doğrulama

- `npx tsc --noEmit` → 0 hata
- `npm run build` → başarılı
- `npx eslint src` → temiz
- Manuel: KPSS sekmesinde herhangi bir konuya tıklayıp modalda yeni etiketi kontrol et

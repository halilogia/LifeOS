# Project Roadmap & Future Plans (Yol Haritası ve Gelecek Planları)

Bu belge, **Life OS - Personal Dashboard** eklentisinin gelecekteki sürümlerinde hayata geçirilmesi planlanan yenilikçi özellikleri, mimari geliştirmeleri ve vizyoner modül önerilerini listeler.

> **Bu dosyanın kuralı:** Yalnızca **henüz yapılmamış** iş burada yer alır. Tamamlanan
> maddeler buradan **kaldırılır ve `CHANGELOG.md`'ye taşınır** (tarihsel kayıt
> `CHANGELOG.md` → `[Unreleased]` / `[x.y.z]` başlıkları altında). Kısmen yapılmış
> özellikler yalnızca **kalan** işleriyle listelenir ve mevcut durumları
> `file:line` kanıtıyla belirtilir — iddia, grep ile doğrulanmadan yazılmaz.

---

## 🧊 Kapsam Dondurma Kararı (Aktif)

Bu depo, feature-creep riski en yüksek projelerden biri olarak işaretlendi (2026-09-27). **Aktif geliştirme yalnızca aşağıdaki iki özelliğe açıktır:**

1. **AI Smart Goal Breakdown** (§A1)
2. **Offline Multi-Device P2P WebRTC Sync** (§A2)

Bu kararın bağlayıcı kuralları:

- **Yeni modül/ekran eklenmeyecek.** Mevcut ekranlara eklenen küçük alanlar bu kararın kapsamı dışındadır.
- **Dondurulmuş özellikler listeden silinmez, "Beklemede" başlığı altında kalır.** Yeni bir özellik eklenirse, aynı anda hangi maddeden çıkarılacağı yazılmalıdır.
- **Ölü kod biriktirilmez.** Kullanılmayan tip, fonksiyon, çeviri anahtarı veya CSS kuralı kod incelemesinde reddedilir. Doğrulama araçları: `node scripts/findDeadFiles.mjs`, `node scripts/i18nHealthCheck.mjs`.
- **Yeni bağımlılık eklenmez.** Mevcut `dependencies` kümesi dondurulmuştur.

Bu kararı geri almak, ancak §A1 ve §A2'nin ikisi de tamamlandıktan sonra gündeme gelir.

> **Dondurma anında tespit edilen iki tutarsızlık (2026-09-27):**
> 1. Dondurma kararından hemen önce **üç yeni modül** teslim edilmişti: Kamu İlanları, Ağ Teşhisi ve Media Vault. Bunlar artık varlıkta olduğundan "yeni modül eklenmeyecek" kuralı mevcut tabanı korur, bu modülleri etkilemez. Üçü de `CHANGELOG.md` → `[Unreleased]` altında belgelendi.
> 2. `notes_editor_type_idea` çeviri anahtarı (`translations/tr/notes.ts:11`) tanımlı ama `NoteEditorHeader.tsx:59` yalnızca `["note","diary","cornell"]` üretiyor — yani ölü bir anahtar. Küçük ölü kod temizliği kapsamında silinebilir.

---

## 🗺️ Yeni Yol Haritası (Aktif Kapsam)

Bu bölüm yalnızca iki aktif özelliği içerir. Her özellik için hedeflenen çıktı, bağımlılıklar,
kabul kriterleri ve riskler **açıkça** yazılmıştır; belirsiz maddeler yoktur.

Ortak kurallar:
- Yeni ekran değil, **mevcut ekranlara alan**. Sidebar'a yeni öğe eklenmez.
- Her adım `npx tsc --noEmit` + `npx eslint src --quiet` + `npx vitest run` + `npm run build` yeşil olmadan kapatılmaz.
- Yeni davranış için en az bir `tests/` kapsamı yazılır (saf mantık varsayılan olarak `environment: "node"`).

### A1. ⚡ AI Smart Goal Breakdown
**Problem:** Kullanıcı büyük bir hedefi (`"KPSS Tarih İnkılapları Bitir"`, `"3 Ayda Türkçe Sorularını Bitir"`) yazıyor
ve uygulanabilir mikro adımlara nasıl bölüneceğini bilmiyor. Mevcut yapı yalnızca düz metin kabul ediyor.

**Çıktı:** Görev giriş alanının yanında tek bir `✨ AI ile Parçala` düğmesi. AI 4-6 somut alt görevi
`{ title, estimateMinutes, urgent, important }` olarak döndürür; kullanıcı listeyi önizleyip tek
tıkla onaylar veya iptal eder.

| # | Adım | Bağımlılık | Kabul kriteri |
|---|---|---|---|
| A1.1 | Prompt + JSON şeması (mevcut `src/services/aichat/prompts/`) | — | Prompt `?raw` olarak yüklenir (mevcut `system-prompt.md` deseni); şema `zod` ile doğrulanır (zod projede zaten bağımlılık) |
| A1.2 | Saf dönüştürücü: AI yanıtı → `Subtask[]` | A1.1 | `tests/` kapsamı: geçerli yanıt, eksik alan, bozuk JSON, fazladan alan. Ayrıştırma için `cleanAndParseJSON` (`utils/aiCommandParser.ts:375`) yeniden kullanılır, ikinci bir ayrıştırıcı yazılmaz |
| A1.3 | `goalBreakdownPlugin` (AI kayıt sistemi) | A1.2 | `registry/index.ts:39` içindeki kayıt listesine tek satır; çekirdek AI sohbet kodu değişmez |
| A1.4 | Önizleme + onaylama arayüzü (görev giriş alanı içinde) | A1.3 | İptal/yeniden-dene var; AI çağrısı sırasında düğme kilitli; hata mesajı yerel çeviriyle |
| A1.5 | Eisenhower + tahmini süre alanlarının doldurulması | A1.4 | Üretilen alt görevler `urgent/important` bayraklarını ve `estimateMinutes` değerini taşır |
| A1.6 | Tek tıkla listeye ekleme (Odak / Rutin seçimi) | A1.5 | Tek seferde N kayıt; `AddTodoUseCase` üzerinden (`presentation/store/todosStore.ts:88`) yazılır, doğrudan `chrome.storage` erişimi veya yeni bir yazma yolu açılmaz |

**Riskler**
- *Yapılandırılmış çıktı güvenilmezliği:* 9Router proxy modelleri `response_format`'ı desteklemeyebilir.
  Azaltma: `cleanAndParseJSON` sarmalayıcısı zaten mevcut (`utils/`), A1.2 onu kullanmalı, kendi
  ayrıştırıcısını yazmamalı.
- *Kapsam şişmesi:* "AI her şeyi planlasın" yönünde genişleme. Sınır: yalnızca alt görev üretimi,
  takvim/bağımlılık/ilerleme planı **bu özelliğe dahil değil**.

### A2. 🌐 Offline Multi-Device P2P WebRTC Sync
**Problem:** `chrome.storage.sync` cihazlar arası otomatik eşitleme sağlıyor ama 100 KB kota,
yoklamalı (kota dolduğunda yazma durur) ve kullanıcı verisi Google'a gider. Daha büyük ve tamamen
kendi makinelerinde kalan veri kümesi (notlar, medya kütüphanesi, KPSS geçmişi) için çözüm yok.

**Çıktı:** İki cihaz, aralarında hiçbir sunucu olmadan, WebRTC DataChannel üzerinden şifreli tam
veri aktarımı yapar. Sinyalleşme `chrome.runtime` üzerinden yerel ağda çalışır.

| # | Adım | Bağımlılık | Kabul kriteri |
|---|---|---|---|
| A2.1 | Sinyalleşme taşıması: ICE sunucu listesi + STUN/ICE toplama | — | `chrome.iceServers` yalnızca STUN; TURN sunucusu **eklenmez** (üçüncü taraf bağımlılığı yasağı) |
| A2.2 | Oturum açma anahtarı türetme (PBKDF2/HKDF) | A2.1 | Anahtar `chrome.storage.local`'de tutulmaz; oturum boyunca bellekte, sekme kapanınca yok olur |
| A2.3 | AES-GCM 256 şifreleme katmanı + `tests/` kapsamı | A2.2 | WebCrypto; bilinen-vektör testi; çalma/karıştırma (tampering) testi |
| A2.4 | Çerçeve protokolü: tip, sürüm, uzunluk, parçalanma | A2.3 | Uzun mesajlar (not/defter) parçalanıp yeniden birleşir; sıra numarası doğrulanır |
| A2.5 | Veri kaynağı adaptörü: `I*Repository` portları üzerinden okuma | A2.4 | `infrastructure/persistence/repositories/` içindeki mevcut repo'lar tek yönlü aktarılır, değiştirilmez |
| A2.6 | Çakışma çözümü | A2.5 | Son yazan kazanır + `updatedAt` karşılaştırması; sessiz veri kaybı yazılı testle engellenir |
| A2.7 | Bağlantı arayüzü (Ayar > Veri sekmesi, tek ekran) | A2.6 | Bağlantı durumu, aktarılan bayt sayacı, iptal butonu; ayrı view **yok** |

**Riskler**
- *NAT geçişi:* Aynı ağ dışında (symmetric NAT) iki eş doğrudan bağlanamayabilir. Kabul
  kriteri bunu **açıkça belirtir**: kapsam "aynı LAN" ile sınırlıdır. TURN eklemek kapsam
  dışıdır (üçüncü taraf sunucu yasağı).
- *Kapsam şişmesi:* Otomatik sürekli arka plan senkronu bu özelliğe dahil değil; yalnızca
  kullanıcı tetikli, ilerlemesi görünür aktarım.
- *Manifest izni:* `A1`/`A2` eklemek `manifest.json` izinlerini değiştirebilir; izin
  değişiklikleri ayrı ve gerekçeli yapılır.

### Sıra Önerisi
A1 önce gelsin: yeni altyapı istemez, mevcut AI kayıt sistemine oturur ve 6 adımda biter.
A2, kullanıcı verisinin gerçekten taşındığı yüksek riskli bir özelliktir; A1 bittikten sonra
tek başına ele alınmalıdır.

---

## ⏸️ Beklemede (Donduruldu — Aktif Kapsam Dışı)

> Aşağıdakiler **silinmemiştir**, çünkü fikir değerlidir; ancak gerçekleştirilmeyecek veya iptal edilene kadar yeni kod yazılmayacaktır. Bir özellik ancak §1 ve §2 kapandıktan sonra geri alınabilir.

### 3. 🎙️ Voice Memo to Structured Note (Sesli Not Kaydedici & AI Cornell Özetleyici)
Tarayıcı mikrofonu ile hızlı sesli düşünce kaydı ve otomatik yapılandırılmış not çıkarma.

> **Mevcut durum:** Web Speech API yalnızca Side Panel'de (`sidePanelSpeech.ts:19-20` → `useVoiceInput` → `SidePanelInputBar.tsx:227-232`). New Tab / Notlar ekranında **hiç** kullanılmıyor. `MediaRecorder` / `getUserMedia` repo genelinde **yok**. Cornell *not tipi* mevcut (`types.ts:36`, `NoteEditorHeader.tsx:59`) ama ses → Cornell dönüşümü yok.

- [ ] **Notes Ekranında Ses Kaydı**: Notlar ekranında tek tıkla ses kaydı başlatma (`🎙️ Sesli Not`) — mevcut yalnızca Side Panel'de.
- [ ] **Web Audio API Ses Kaydı**: Ham ses kaydını (MediaRecorder) saklama; şu an yalnızca canlı konuşma→metin var, ses dosyası tutulmuyor.
- [ ] **AI Cornell Formatlayıcı**: Ham ses transkriptini otomatik olarak *"Anahtar Kavramlar"*, *"Özet"* ve *"Aksiyon Maddeleri"* şeklinde Cornell ders notu kartına dönüştürme.

### 4. 🧘 Mindful Micro-Breaks & 20-20-20 Eye Guard (Göz ve Duruş Dinlendirme)
Uzun ekran başı seanslarında göz yorgunluğunu ve duruş bozukluğunu engelleyen ergonomik asistan.
- [ ] **20-20-20 Kuralı Zamanlayıcısı**: Her 20 dakikada bir 20 saniye boyunca 20 feet (6 metre) uzağa bakmayı hatırlatan zarif mikro bildirim.
- [ ] **Esneme & Duruş Hatırlatıcıları**: Pomodoro uzun molalarında basit omuz, boyun ve sırt esneme egzersizi animasyonları sunma.
- [ ] **Akıllı Seans İstatistiği**: Günlük kaç mikro mola verildiğini ve ekran dinlenme süresini takip etme.

### 5. 💰 BİST Temettü & Bedelsiz Sermaye Artırımı Takvimi (Dividend Tracker)
Borsa portföyündeki şirketlerin nakit temettü ve bedelsiz pay dağıtım tarihlerini takip eden finansal takvim.

> **Mevcut durum:** Yalnızca kullanıcının kendi oluşturduğu metin isimli takip listeleri var (örn. "Temettü" adlı liste). Repo genelinde temettü/bedelsiz veri kaynağı, takvim yazımı veya projeksiyon matematiği **yoktur**.

- [ ] **Otomatik Hakediş Takvimi**: Portföyünüzdeki ve izleme listenizdeki şirketlerin kesinleşen temettü ödeme tarihlerini takvime işleme.
- [ ] **Yıllık Pasif Gelir Projeksiyonu**: Sahip olunan lot sayısına göre tahmini yıllık net temettü getirisini TL olarak hesaplama.
- [ ] **Bedelsiz Sermaye Bildirimi**: Portföydeki hisselerin bedelsiz bölünme günlerini ve yeni oluşacak tahmini lot adedini özetleme.

### 6. 🎵 Multi-Channel Ambient Soundscapes Mixer (Çok Kanallı Ambiyans)
Çevrimdışı Web Audio API sentezleyicilerini çok kanallı bir ses mikserinde birleştirme.

> **Mevcut durum:** Prosedürel sentezleyici katmanlı olarak yeniden yazıldı (`src/services/ambientAudio/`): saf DSP (`noiseSynthesis.ts`), ses grafikleri (`voices.ts`) ve yaşam döngüsü (`ambientAudioEngine.ts`) ayrı katmanlarda. `play(type, volume)` tek giriş noktasıdır ve ses türü→üretici eşlemesi `VOICE_FACTORIES` tablosunda yaşar. **Ancak motor hâlâ tek ses kaynağıdır** — `play()` ilk satırında `stopAllSounds()` çağırıyor (`ambientAudioEngine.ts:73-74`) ve durum tek bir `voice` handle'ı (`ambientAudioEngine.ts:38`). Tek bir global `volume` var (`ambientAudioTypes.ts:57-64`); hazır profil kavramı hiç yok. Kalan iş:
- [ ] **Eşzamanlı Ses Katmanlama**: Birden fazla ses kaynağını aynı anda çalıştırma (*"Fırtınalı Kütüphane"*, *"Kış Gecesi"*). `VoiceHandle` zaten teardown için gerekli tüm kaynakları topladığı için bu, motor katmanında çoklu slot yönetimi eklemekle sınırlıdır.
- [ ] **Bağımsız Kanal Ses Düğmeleri**: Kanal başına seviye (mevcut `VoiceHandle.masterGain` bunun için ayrılmıştır).
- [ ] **Hazır Profiller (Presets)**.

### 7. 📊 Teknik İndikatör & Sinyal Motoru — Kullanıcı Arayüzü (RSI, EMA 20/50, MACD)
BIST hisselerinde teknik analiz göstergelerini hesaplayıp yapay zekaya besleyen ve kullanıcıya gösteren kurallar motoru.

> **Mevcut durum:** Hesaplama katmanı kısmen hazır — `computeStockTelemetry()` (`src/services/stock/stockPrompts.ts:51-122`) **RSI(14)**, **SMA-20** ve **hacim oranı** hesaplayıp AI prompt'una besliyor (`stockPrompts.ts:141`, `stockAiService.ts:266-274`). Bu değerlerin **hiçbir arayüzde görselleştirilmesi yok** (`src/components/stock/**` içinde tek bir `rsi` referansı bile yok). EMA ve MACD repo genelinde **hiç geçmiyor**. `evaluateStockRules()` yalnızca uygulanan 7 koşulu değerlendirir (`stock.ts:6-13`); `RSI_OVERBOUGHT` gibi uygulanmayan bir kural tipi **tanımlı değildir** (ölü kod olarak kaldırıldı). Kalan iş:
- [ ] **RSI Sinyal Arayüzü**: RSI 30 altı / 70 üstü durumunu UI'da *"Aşırı Satım"* / *"Aşırı Alım"* rozeti olarak gösterme. Yeni bir kural tipi **eklenirse** `evaluateStockRules()` içinde karşılığı olan bir `case` ile birlikte gelmelidir — aksi halde `default: break` ile sessizce yutulur.
- [ ] **EMA 20/50 & Golden Cross / Death Cross**: Mevcut yalnızca **basit** 20 günlük ortalama (SMA-20) var; EMA ve kesişim tespiti yok.
- [ ] **MACD Göstergesi**: Momentum göstergesi hiç hesaplanmıyor.
- [ ] **Hacim Sıçraması Uyarısı**: Hacim oranı hesaplanıyor ama 3x eşiğinde uyarı üreten bir tetik yok.
- [ ] **Gösterge Panosu (Chart Overlay)**: Fiyat grafiği üzerine RSI / ortalama çizgilerinin bindirilmesi.

### 8. 🎮 Game Jam Countdown & Asset Pack Bundler (Game Jam & Proje Başlatıcı)
Indie oyun geliştiricileri için yaklaşan Game Jam'leri takip etme ve hızlı başlangıç şablonu oluşturma.

> **Mevcut durum:** Ücretsiz oyun **asset** toplayıcısı zaten var (`gameAssetsService.ts` → Itch.io RSS akışları, Kenney, OpenGameArt, GamerPower; `Promise.allSettled` fan-out `:499-507`). **Game jam verisi, takvimi veya sayacı hiç yok** (mevcut sayaçlar KPSS sınavı ve Kamu İlanları `daysLeft` ile ilgili, farklı modüller). Toplu indirme/zip paketleme de yok: kartın tek eylemi yerel bir "kaydedildi" bayrağı + dış bağlantı (`GameAssetCard.tsx:140-186`). Repo genelinde `jszip`/`zip` mantığı bulunmuyor. Tema beyin fırtınası da yok.

- [ ] **Itch.io Game Jam Takvimi**: Popüler game jam'lerin başlangıç ve bitiş tarihlerini listeleyen canlı sayaç — **hiç yok**, mevcut yalnızca asset listeleme.
- [ ] **Tema Beyin Fırtınası**: Jam teması açıklandığında AI ile 3 farklı oyun mekaniği ve prototip fikri türetme.
- [ ] **Seçili Asset Paketi İndirici**: Seçilen paketleri tek tıkla zip listesi haline getirme — mevcut servis yalnızca listeler, **toplu indirme/zip paketleme yok**.

### 9. 📑 Akıllı Sekme Gruplama & RAM Tasarrufu (Smart Tab Suspender)
Tarayıcıda biriken sekmeleri yapay zeka ile organize edip inaktif sekmeleri uyutma.

> **Mevcut durum:** `runtimeMessageHandler.ts:173-199` içindeki `group_active_tab` handler'ı, Side Panel açıldığında (`useAgentBridge.ts:77`) **o an etkin olan sekmeyi** "Life OS Agent" adlı bir grupta topluyor. Otomatik sekme gruplama, kategori gruplama veya bellek boşaltma mantığı **yoktur**. (Önceki buradaki ifade "yalnızca Agent'ın açtığı sekmeler" diyordu; kod böyle çalışmıyor — düzeltildi.)

- [ ] **AI Kategori Gruplama**: Açık 30+ sekmeyi *"Borsa & Finans"*, *"KPSS & Çalışma"*, *"Oyun Geliştirme"* sekmelerine otomatik gruplama.
- [ ] **Bellek Uyutucu**: 30 dakikadan uzun süre kullanılmayan sekmeleri dondurarak Chrome bellek ve CPU kullanımını azaltma (`chrome.tabs.discard` / `autoDiscardable` entegrasyonu).

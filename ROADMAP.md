# Project Roadmap & Future Plans (Yol Haritası ve Gelecek Planları)

Bu belge, **Life OS - Personal Dashboard** eklentisinin henüz yapılmamış işlerini listeler.

> **Bu dosyanın kuralı:** Yalnızca **henüz yapılmamış** iş burada yer alır. Tamamlanan
> maddeler buradan **kaldırılır ve `CHANGELOG.md`'ye taşınır** (`[Unreleased]` / `[x.y.z]`
> başlıkları altında). Kısmen yapılmış özellikler yalnızca **kalan** işleriyle listelenir
> ve mevcut durumları `file:line` kanıtıyla belirtilir — iddia, grep ile doğrulanmadan
> yazılmaz. Kapsam değişikliklerinin tarihsel kaydı da CHANGELOG'da tutulur.

**İçindekiler**
1. [Kapsam Dondurma Kararı](#-kapsam-dondurma-kararı-aktif)
2. [Aktif Kapsam](#-aktif-kapsam) — A1, A2, A3
3. [Beklemede (Donduruldu)](#-beklemede-donduruldu--aktif-kapsam-dışı) — F1 … F7

---

## 🧊 Kapsam Dondurma Kararı (Aktif)

Bu depo, feature-creep riski en yüksek projelerden biri olarak işaretlendi (2026-09-27).
**Aktif geliştirme yalnızca aşağıdaki üç özelliğe açıktır:**

1. **AI Smart Goal Breakdown** (§A1)
2. **Offline Multi-Device P2P WebRTC Sync** (§A2)
3. **Voice Memo to Structured Note** (§A3)

Bağlayıcı kurallar:

- **Yeni modül/ekran eklenmeyecek.** Mevcut ekranlara alan eklenebilir; ayrı ekran açılamaz.
  (A3 bunun istisnası değildir: Notlar ekranına alan ekler.)
- **Dondurulmuş özellikler silinmez**, "Beklemede" başlığı altında kalır. Yeni bir özellik
  eklenirse hangi maddeden çıkarılacağı yazılmalıdır.
- **Ölü kod biriktirilmez.** Kullanılmayan tip, fonksiyon, çeviri anahtarı veya CSS kuralı
  kod incelemesinde reddedilir. Doğrulama: `node scripts/findDeadFiles.mjs`,
  `node scripts/i18nHealthCheck.mjs`.
- **Yeni bağımlılık eklenmez.** `dependencies` kümesi dondurulmuştur.

Karar, ancak A1, A2 ve A3'ün üçü de kapandığında gündeme gelir.

---

## 🗺️ Aktif Kapsam

Her özellik için problem, çıktı, adım adım kabul kriteri ve adlandırılmış riskler yazılıdır.

**Ortak kurallar (üçü için de geçerli)**
- Yeni ekran değil, **mevcut ekranlara alan**. Sidebar'a yeni öğe eklenmez.
- Bir adım ancak `npx tsc --noEmit` + `npx eslint src --quiet` + `npx vitest run` +
  `npm run build` yeşil ise kapatılır.
- Yeni davranış için en az bir `tests/` kapsamı yazılır; saf mantık varsayılan olarak
  `environment: "node"` altında test edilir.
- **Düzenli olarak yeni yardımcı üretilmez.** Var olan yol yeniden kullanılır; ikinci bir
  JSON ayrıştırıcı, ikinci bir depolama katmanı veya ikinci bir AI çağrı yolu açılmaz.

### A1. ⚡ AI Smart Goal Breakdown

**Problem:** Kullanıcı büyük bir hedefi (`"KPSS Tarih İnkılapları Bitir"`,
`"3 Ayda Türkçe Sorularını Bitir"`) yazıyor ve uygulanabilir mikro adımlara nasıl
bölüneceğini bilmiyor. Mevcut yapı yalnızca düz metin kabul ediyor.

**Çıktı:** Görev giriş alanının yanında tek bir `✨ AI ile Parçala` düğmesi. AI 4-6 somut
alt görevi `{ title, estimateMinutes, urgent, important }` olarak döndürür; kullanıcı
listeyi önizleyip tek tıkla onaylar veya iptal eder.

| # | Adım | Bağımlılık | Kabul kriteri |
|---|---|---|---|
| A1.1 | Prompt + JSON şeması (`src/services/aichat/prompts/`) | — | Prompt `?raw` yüklenir (mevcut `system-prompt.md` deseni); şema `zod` ile doğrulanır (zaten bağımlılık) |
| A1.2 | Saf dönüştürücü: AI yanıtı → `Subtask[]` | A1.1 | `tests/`: geçerli yanıt, eksik alan, bozuk JSON, fazladan alan. Ayrıştırma için `cleanAndParseJSON` (`utils/aiCommandParser.ts:375`) kullanılır — ikinci ayrıştırıcı yazılmaz |
| A1.3 | `goalBreakdownPlugin` | A1.2 | `registry/index.ts:39` listesine tek satır; çekirdek AI sohbet kodu değişmez |
| A1.4 | Önizleme + onay arayüzü (görev giriş alanı içinde) | A1.3 | İptal/yeniden-dene var; AI çağrısında düğme kilitli; hata mesajı yerel çeviriyle |
| A1.5 | Eisenhower + tahmini süre alanlarının doldurulması | A1.4 | Alt görevler `urgent/important` ve `estimateMinutes` taşır |
| A1.6 | Tek tıkla listeye ekleme (Odak / Rutin) | A1.5 | Tek seferde N kayıt; `AddTodoUseCase` üzerinden (`presentation/store/todosStore.ts:88`); doğrudan `chrome.storage` erişimi yok |

**Riskler**
- *Yapılandırılmış çıktı güvenilmezliği:* OpenRouter proxy modelleri `response_format`'ı
  desteklemeyebilir → `cleanAndParseJSON` sarmalayıcısı zaten var, A1.2 onu kullanmalı.
- *Kapsam şişmesi:* "AI her şeyi planlasın" yönünde genişleme. Sınır: yalnızca alt görev
  üretimi. Takvim/bağımlılık/ilerleme planı **dahil değil**.

### A2. 🌐 Offline Multi-Device P2P WebRTC Sync

**Problem:** `chrome.storage.sync` otomatik eşitleme sağlıyor ama 100 KB kota, yoklamalı
(kota dolunca yazma durur) ve veri Google'a gidiyor. Notlar, medya kütüphanesi, KPSS
geçmişi gibi büyük ve yerelde kalmak istenen veri kümesi için çözüm yok.

**Çıktı:** İki cihaz, aralarında hiçbir sunucu olmadan WebRTC DataChannel üzerinden
şifreli tam veri aktarır. Sinyalleşme `chrome.runtime` üzerinden yerel ağda çalışır.

| # | Adım | Bağımlılık | Kabul kriteri |
|---|---|---|---|
| A2.1 | Sinyalleşme: ICE sunucu listesi + STUN/ICE toplama | — | `chrome.iceServers` yalnızca STUN; **TURN eklenmez** (üçüncü taraf yasağı) |
| A2.2 | Oturum anahtarı türetme (PBKDF2/HKDF) | A2.1 | Anahtar `chrome.storage.local`'de tutulmaz; bellekte, sekme kapanınca yok olur |
| A2.3 | AES-GCM 256 katmanı + `tests/` | A2.2 | WebCrypto; bilinen-vektör testi; çalma/karıştırma testi |
| A2.4 | Çerçeve protokolü: tip, sürüm, uzunluk, parçalanma | A2.3 | Uzun mesajlar parçalanıp birleşir; sıra numarası doğrulanır |
| A2.5 | Veri adaptörü: `I*Repository` portları | A2.4 | 23 `ChromeStorage*` repo tek yönlü aktarılır, değiştirilmez |
| A2.6 | Çakışma çözümü | A2.5 | Son yazan kazanır + `updatedAt`; sessiz veri kaybı yazılı testle engellenir |
| A2.7 | Bağlantı arayüzü (Ayar > Veri, tek ekran) | A2.6 | Durum, bayt sayacı, iptal; ayrı view **yok** |

**Riskler**
- *NAT geçişi:* Symmetric NAT'ta iki eş bağlanamayabilir → kapsam **"aynı LAN"** ile
  sınırlı ve bu kabul kriterinde açıkça yazılı. TURN kapsam dışı.
- *Kapsam şişmesi:* Otomatik sürekli arka plan senkronu **dahil değil**; yalnızca
  kullanıcı tetikli, ilerlemesi görünür aktarım.
- *Manifest izni:* İzin değişiklikleri ayrı ve gerekçeli yapılır.
- *Etkileşim:* F1 (ham ses) ve A2 birlikte çalışırsa ses kayıtlarının nereye
  gideceği kararlaştırılmalı. F1 donmuş olduğu için bu beklemede.

### A3. 🎙️ Voice Memo to Structured Note

**Problem:** Sesli düşünce kaydı yalnızca Side Panel'de ve orada da AI sohbetine girdi
olarak gidiyor. Kullanıcı Notlar ekranında konuşarak not tutamıyor; Cornell ders notu
yapısı elle doldurulmak zorunda. Notlar ekranı (`types.ts:36` `cornell` tipi,
`NoteEditorHeader.tsx:59`) Cornell ızgarasını zaten çiziyor — eksik olan yalnızca
**içeriğin oraya girmesi**.

**Mevcut altyapı:** Web Speech API tek yerde yaşıyor —
`sidePanel/sidePanelSpeech.ts:19-20` → `useVoiceInput` → `useSidePanelChat.ts:125` →
`SidePanelInputBar.tsx:227-232`. `MediaRecorder` / `getUserMedia` repo genelinde **yok**.
A3 bu kodu **kopyalamaz**, ortak bir katmana taşır.

**Çıktı:** Notlar ekranında mikrofon düğmesi. Kullanıcı konuşur, transkript canlı olarak
not gövdesine akar. İki çıkış: (a) doğrudan not olarak kaydet, (b) AI ile Cornell'a
dönüştür ve önizlemeden kabul et.

| # | Adım | Bağımlılık | Kabul kriteri |
|---|---|---|---|
| A3.1 | Web Speech'i ortak katmana taşı: `useSpeechToText` hook'u | — | `sidePanelSpeech.ts`'in mantığı **kopyalanmaz**, tek uygulama kalır; Side Panel davranışı değişmez (regresyon testi) |
| A3.2 | Not editöründe mikrofon düğmesi + canlı transkript | A3.1 | Yalnızca `note` ve `diary` tiplerinde; `cornell` editöründe düğme yok (yapı zaten ızgaraya ait) |
| A3.3 | "Transkripti Not Olarak Kaydet" | A3.2 | Kaydedilen not normal `note` tipindedir; transkript ham metin olarak saklanır |
| A3.4 | AI Cornell dönüştürücü: metin → `{ keyConcepts, summary, actions }` | A3.2 | `zod` şeması; `cleanAndParseJSON` yeniden kullanılır. **A1.2 ile aynı dönüştürücü altyapısı paylaşılır** |
| A3.5 | Cornell önizleme + kabul | A3.4 | Önizleme reddedilebilir; kabul onayında alanlar `NoteEditorHeader` üzerinden yazılır |

**Kasıtlı olarak dahil edilmeyenler**
- **Ham ses dosyası saklama (MediaRecorder)** → F1'e taşındı.
- Sürekli arka planda dinleme, çok konuşmacı ayrımı, ses dosyası senkronizasyonu.

**Riskler**
- *Tarayıcı desteği:* `webkitSpeechRecognition` yalnızca Chromium tabanlı tarayıcılarda
  var → özellik algılaması ile düğme gizlenir; Firefox/Safari kullanıcısı boş bir düğme
  görmez, ayarlarda açıklayıcı metin gösterilir.
- *İzin:* `getUserMedia` ilk kullanımda onay ister. İzin reddedilirse düğme devre dışı
  kalır ve neden yazılır; sessizce başarısız olmaz.

### Sıra Önerisi

**A1 → A3 → A2.** A1 yeni altyapı istemez, mevcut AI kayıt sistemine oturur ve 6 adımda
biter. A3 mevcut Web Speech kodunu yeniden kullanır, yeni bağımlılık istemez. A2 kullanıcı
verisinin gerçekten taşındığı yüksek riskli bir özelliktir ve tek başına ele alınmalıdır.

---

## ⏸️ Beklemede (Donduruldu — Aktif Kapsam Dışı)

> Aşağıdakiler silinmemiştir; fikir değerlidir. Ancak gerçekleştirilmeyecek veya iptal
> edilene kadar yeni kod yazılmayacaktır. Geri alma ancak A1, A2 ve A3 kapandıktan sonra.

### F1. 🎙️ Ham Ses Dosyası Saklama (Voice Memo — kalan parça)

A3 kapsamına alınmayan tek parça: konuşmanın **sesini** saklamak ve sonra çalmak.

> **Neden ayrıldı:** A3'ün değeri transkriptten geliyor. Ham ses eklemek kota yönetimi, blob
> yaşam döngüsü, oynatma arayüzü ve temizlik gerektirir; ayrı bir özelliktir. A3.1'deki
> ortak `useSpeechToText` hook'u bunun için de kullanılabilir.

- [ ] **MediaRecorder ile Ham Ses Yakalama**: `getUserMedia` + `MediaRecorder`; repo genelinde şu an **hiç yok**.
- [ ] **Depolama & Kota Yönetimi**: Kayıtları `chrome.storage` veya IndexedDB'de tutma, kota uyarısı, eski kayıtların otomatik temizliği.
- [ ] **Oynatma Arayüzü**: Not üzerinde dinleme, ileri/geri sarma; blob URL temizliği.
- [ ] **Senkronizasyon kararı**: Kayıtlar `chrome.storage.sync` kotasına sığmaz — A2 P2P aktarımına mı verilecek, yoksa cihazda mı kalacak?

### F2. 🧘 Mindful Micro-Breaks & 20-20-20 Eye Guard

Ekran başı seanslarında göz yorgunluğunu ve duruş bozukluğunu engelleyen ergonomik asistan.
Repo genelinde hiçbir parçası yok.

- [ ] **20-20-20 Kuralı Zamanlayıcısı**: Her 20 dakikada bir 20 saniye boyunca 6 metre uzağa bakmayı hatırlatan mikro bildirim.
- [ ] **Esneme & Duruş Hatırlatıcıları**: Pomodoro uzun molalarında omuz, boyun, sırt esneme egzersizleri.
- [ ] **Akıllı Seans İstatistiği**: Günlük mikro mola sayısı ve ekran dinlenme süresi.

### F3. 💰 BİST Temettü & Bedelsiz Sermaye Artırımı Takvimi

> **Mevcut durum:** Yalnızca kullanıcının kendi oluşturduğu metin isimli takip listeleri var
> (örn. "Temettü" adlı liste). Repo genelinde temettü/bedelsiz veri kaynağı, takvim yazımı
> veya projeksiyon matematiği **yoktur**.

- [ ] **Otomatik Hakediş Takvimi**: Portföy ve izleme listesindeki şirketlerin kesinleşen temettü tarihlerini takvime işleme.
- [ ] **Yıllık Pasif Gelir Projeksiyonu**: Lot sayısına göre tahmini yıllık net temettü getirisi (TL).
- [ ] **Bedelsiz Sermaye Bildirimi**: Bedelsiz bölünme günleri ve tahmini yeni lot adedi.

### F4. 🎵 Multi-Channel Ambient Soundscapes Mixer

> **Mevcut durum:** Prosedürel sentezleyici katmanlı (`src/services/ambientAudio/`): saf
> DSP (`noiseSynthesis.ts`), ses grafikleri (`voices.ts`), yaşam döngüsü
> (`ambientAudioEngine.ts`) ayrı katmanlarda. `play(type, volume)` tek giriş noktası,
> tür→üretici eşlemesi `VOICE_FACTORIES` tablosunda. **Ancak motor hâlâ tek ses
> kaynağıdır** — `play()` ilk satırında `stopAllSounds()` çağırıyor
> (`ambientAudioEngine.ts:73-74`) ve durum tek bir `voice` handle'ı (`:38`). Tek bir global
> `volume` var (`ambientAudioTypes.ts:57-64`); hazır profil kavramı hiç yok.

- [ ] **Eşzamanlı Ses Katmanlama**: Birden fazla kaynağı aynı anda çalıştırma (*"Fırtınalı Kütüphane"*, *"Kış Gecesi"*). `VoiceHandle` teardown kaynaklarını zaten topluyor; iş motor katmanında çoklu slot yönetimi.
- [ ] **Bağımsız Kanal Ses Düğmeleri**: Kanal başına seviye (`VoiceHandle.masterGain` bunun için ayrılmış durumda).
- [ ] **Hazır Profiller (Presets)**.

### F5. 📊 Teknik İndikatör Arayüzü (RSI / EMA 20-50 / MACD)

> **Mevcut durum:** Hesaplama katmanı kısmen hazır — `computeStockTelemetry()`
> (`stockPrompts.ts:51-122`) **RSI(14)**, **SMA-20** ve **hacim oranı** hesaplayıp AI
> prompt'una besliyor (`:141`, `stockAiService.ts:266-274`). Bu değerlerin **hiçbir
> arayüzde görselleştirilmesi yok** (`components/stock/**` içinde tek bir `rsi` referansı
> bile yok). EMA ve MACD repo genelinde **hiç geçmiyor**. `evaluateStockRules()` yalnızca
> uygulanan 7 koşulu değerlendirir (`stock.ts:6-13`).

- [ ] **RSI Sinyal Arayüzü**: RSI < 30 / > 70 durumunu *"Aşırı Satım"* / *"Aşırı Alım"* rozeti olarak gösterme. Yeni bir kural tipi **eklenirse** `evaluateStockRules()` içinde karşılığı olan bir `case` ile birlikte gelmelidir — aksi halde `default: break` sessizce yutar.
- [ ] **EMA 20/50 & Golden / Death Cross**: Şu an yalnızca basit 20 günlük ortalama (SMA-20) var.
- [ ] **MACD Göstergesi**: Hiç hesaplanmıyor.
- [ ] **Hacim Sıçraması Uyarısı**: `volRatio` hesaplanıyor, 3x eşiğinde tetik yok.
- [ ] **Gösterge Panosu (Chart Overlay)**: Fiyat grafiğine RSI / ortalama çizgilerinin bindirilmesi.

### F6. 🎮 Game Jam Countdown & Asset Pack Bundler

> **Mevcut durum:** Asset toplayıcı var (`gameAssetsService.ts` → Itch.io RSS akışları,
> Kenney, OpenGameArt, GamerPower; `:499-507`). **Jam verisi/takvimi/sayacı hiç yok** (mevcut
> sayaçlar KPSS sınavı ve Kamu İlanları `daysLeft` ile ilgili, farklı modüller). Toplu
> indirme/zip yok: kartın tek eylemi yerel "kaydedildi" bayrağı + dış bağlantı
> (`GameAssetCard.tsx:140-186`); repo genelinde `jszip` mantığı yok.

- [ ] **Itch.io Game Jam Takvimi**: Jam başlangıç/bitiş tarihleriyle canlı sayaç.
- [ ] **Tema Beyin Fırtınası**: Jam temasından AI ile 3 oyun mekaniği/prototip fikri.
- [ ] **Seçili Asset Paketi İndirici**: Tek tıkla zip listesi.

### F7. 📑 Akıllı Sekme Gruplama (AI Kategori Gruplama)

> **Mevcut durum:** `runtimeMessageHandler.ts:173-199` içindeki `group_active_tab`
> handler'ı, Side Panel açıldığında (`useAgentBridge.ts:77`) **o an etkin olan sekmeyi**
> "Life OS Agent" grubuna alıyor. Otomatik/kategori gruplama mantığı **yok**.

- [ ] **AI Kategori Gruplama**: 30+ sekmeyi *"Borsa & Finans"*, *"KPSS & Çalışma"*, *"Oyun Geliştirme"* gibi kategorilere otomatik gruplama.
- [ ] **Bellek Uyutucu ile uyum**: Gruplama, Bellek Uyutucu'nun boşaltabildiği sekmeleri boşaltmamalı. İki özellik birbirini bozmamalı.

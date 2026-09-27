# Project Roadmap & Future Plans (Yol Haritası ve Gelecek Planları)

Bu belge, **Life OS - Personal Dashboard** eklentisinin henüz yapılmamış işlerini
**teslim edilebilir sürümler** halinde listeler.

> **Bu dosyanın kuralı:** Yalnızca **henüz yapılmamış** iş burada yer alır. Tamamlanan
> sürüm buradan **kaldırılır ve `CHANGELOG.md`'ye taşınır** (`[Unreleased]` / `[x.y.z]`
> başlıkları altında). Kısmi işler yalnızca **kalan** işleriyle listelenir ve mevcut
> durumları `file:line` kanıtıyla belirtilir — iddia, grep ile doğrulanmadan yazılmaz.
> Kapsam değişikliklerinin tarihsel kaydı da CHANGELOG'da tutulur.

---

## 🧊 Kapsam Dondurma Kararı (Aktif)

Bu depo, feature-creep riski en yüksek projelerden biri olarak işaretlendi (2026-09-27).
**Planlanmış iş, aşağıdaki dört sürümle sınırlıdır.** Bu listenin dışına yeni bir sürüm
eklenirse, aynı anda hangi sürümden çıkarılacağı yazılmalıdır.

| Sürüm | Başlık | Bağımlılık | Durum |
|---|---|---|---|
| **v1.1.0** | AI Smart Goal Breakdown | — | Planlandı |
| **v1.2.0** | Sesli Not Kaydı & AI Cornell | v1.1.0 | Planlandı |
| **v1.3.0** | P2P Sync — Taşıma & Kriptografi | — | Planlandı |
| **v1.4.0** | P2P Sync — Veri Aktarımı | v1.3.0 | Planlandı |

Bağlayıcı kurallar:

- **Yeni modül/ekran eklenmeyecek.** Mevcut ekranlara alan eklenebilir; ayrı ekran açılamaz.
- **Yeni bağımlılık eklenmeyecek.** `dependencies` kümesi dondurulmuştur.
- **Ölü kod biriktirilmeyecek.** Kullanılmayan tip, fonksiyon, çeviri anahtarı veya CSS
  kuralı kod incelemesinde reddedilir. Doğrulama: `node scripts/findDeadFiles.mjs`,
  `node scripts/i18nHealthCheck.mjs`.
- **Dondurulmuş özellikler silinmez**, [Bekleme Listesi](#-bekleme-listesi-dondurulmuş)
  altında kalır.

### Sürümleme notu

`public/manifest.json` ve `package.json` sürümü şu anda `1.0.0`'dır; `CHANGELOG.md` ise
tarihsel olarak 4.x dizilimi taşır ve manifest ile senkron **değildir** (bkz. CHANGELOG
başındaki uyarı). Yukarıdaki sürüm numaraları mevcut `1.0.0`'dan ileri gider ve Chrome Web
Store sürümü manifest'ten okunduğu için doğrudan kullanılabilir.

### Her sürüm için geçerli ortak kurallar

- Bir sürüm ancak `npx tsc --noEmit` + `npx eslint src --quiet` + `npx vitest run` +
  `npm run build` yeşil ise kapatılır.
- Yeni davranış için en az bir `tests/` kapsamı yazılır; saf mantık varsayılan olarak
  `environment: "node"` altında test edilir.
- **Düzenli olarak yeni yardımcı üretilmez.** Var olan yol yeniden kullanılır: ikinci bir
  JSON ayrıştırıcı, ikinci bir depolama katmanı veya ikinci bir AI çağrı yolu açılmaz.
- Her sürüm kendi içinde çalışır duruma gelir; sonraki sürüm onu tamamlamak zorunda değildir.

---

## v1.1.0 — AI Smart Goal Breakdown

**Hedef:** Kullanıcı büyük bir hedefi (`"KPSS Tarih İnkılapları Bitir"`,
`"3 Ayda Türkçe Sorularını Bitir"`) yazıyor ve uygulanabilir mikro adımlara nasıl
bölüneceğini bilmiyor. Mevcut yapı yalnızca düz metin kabul ediyor.

**Çıktı:** Görev giriş alanının yanında tek bir `✨ AI ile Parçala` düğmesi. AI 4-6 somut
alt görevi `{ title, estimateMinutes, urgent, important }` olarak döndürür; kullanıcı
listeyi önizleyip tek tıkla onaylar veya iptal eder.

**Neden ilk sürüm:** Yeni altyapı istemez. Mevcut `AiFeatureRegistry` kayıt sistemine oturur,
mevcut AI istemcisini ve `AddTodoUseCase` yazma yolunu kullanır. Tek başına fayda verir.

| # | Adım | Kabul kriteri |
|---|---|---|
| 1.1 | Prompt + JSON şeması (`src/services/aichat/prompts/`) | Prompt `?raw` yüklenir (mevcut `system-prompt.md` deseni); şema `zod` ile doğrulanır (zaten bağımlılık) |
| 1.2 | Saf dönüştürücü: AI yanıtı → `Subtask[]` | `tests/`: geçerli yanıt, eksik alan, bozuk JSON, fazladan alan. Ayrıştırma `cleanAndParseJSON` (`utils/aiCommandParser.ts:375`) ile yapılır — ikinci ayrıştırıcı yazılmaz |
| 1.3 | `goalBreakdownPlugin` | `src/services/aichat/registry/index.ts:39` listesine tek satır; çekirdek AI sohbet kodu **hiç değişmez** |
| 1.4 | Önizleme + onay arayüzü (görev giriş alanı içinde) | İptal/yeniden-dene var; AI çağrısı sırasında düğme kilitli; hata mesajı yerel çeviriyle |
| 1.5 | Eisenhower + tahmini süre alanlarının doldurulması | Üretilen alt görevler `urgent/important` bayraklarını ve `estimateMinutes` değerini taşır |
| 1.6 | Tek tıkla listeye ekleme (Odak / Rutin seçimi) | Tek seferde N kayıt; `AddTodoUseCase` üzerinden (`presentation/store/todosStore.ts:88`); doğrudan `chrome.storage` erişimi veya yeni bir yazma yolu açılmaz |

**Bu sürümde olmayanlar**
- Takvim/bağımlılık grafiği/ilerleme planı — "AI her şeyi planlasın" yönündeki genişleme
  kapsam dışıdır.
- Alt görevleri bölerken **daha önce planlanmış bir hedefi de dikkate alma**. Bu, ayrı bir
  özelliktir.

**Çıkış kriteri:** Bir kullanıcı `✨ AI ile Parçala`'ya basar, 4-6 alt görevi önizler,
onaylar ve alt görevlerin Eisenhower alanları ile birlikte Odak listesine düştüğünü görür.

**Riskler**
- *Yapılandırılmış çıktı güvenilmezliği:* OpenRouter proxy modelleri `response_format`'ı
  desteklemeyebilir → adım 1.2 mevcut `cleanAndParseJSON` sarmalayıcısını kullanmalı,
  kendi ayrıştırıcısını yazmamalıdır.
- *Kapsam şişmesi:* Sınır net: yalnızca alt görev üretimi.

---

## v1.2.0 — Sesli Not Kaydı & AI Cornell

**Hedef:** Sesli düşünce kaydı yalnızca Side Panel'de ve orada da AI sohbetine girdi olarak
gidiyor. Kullanıcı Notlar ekranında konuşarak not tutamıyor; Cornell ders notu yapısı elle
doldurulmak zorunda. Notlar ekranı (`src/types/types.ts:36` `cornell` tipi,
`NoteEditorHeader.tsx:59`) Cornell ızgarasını zaten çiziyor — eksik olan yalnızca
**içeriğin oraya girmesi**.

**Çıktı:** Notlar ekranında mikrofon düğmesi. Kullanıcı konuşur, transkript canlı olarak
not gövdesine akar. İki çıkış: (a) doğrudan not olarak kaydet, (b) AI ile Cornell'a
dönüştür, önizle ve kabul et.

**Neden ikinci sürüm:** Mevcut Web Speech kodunu yeniden kullanır, yeni bağımlılık
istemez. Adım 2.4, v1.1'in 1.2 adımındaki dönüştürücü altyapısını paylaşır; ikinci bir JSON
ayrıştırıcı yazılmaz.

**Mevcut altyapı:** Web Speech API tek yerde yaşıyor —
`src/sidepanel/sidePanelSpeech.ts:19-20` → `useVoiceInput` → `useSidePanelChat.ts:125` →
`SidePanelInputBar.tsx:227-232`. `MediaRecorder` / `getUserMedia` repo genelinde **yok**.

| # | Adım | Kabul kriteri |
|---|---|---|
| 2.1 | Web Speech'i ortak katmana taşı: `useSpeechToText` hook'u | `sidePanelSpeech.ts`'in mantığı **kopyalanmaz**, tek uygulama kalır; Side Panel davranışı değişmez (regresyon testi) |
| 2.2 | Not editöründe mikrofon düğmesi + canlı transkript | Yalnızca `note` ve `diary` tiplerinde; `cornell` editöründe düğme yok (yapı zaten ızgaraya ait) |
| 2.3 | "Transkripti Not Olarak Kaydet" | Kaydedilen not normal `note` tipindedir; transkript ham metin olarak saklanır |
| 2.4 | AI Cornell dönüştürücü: metin → `{ keyConcepts, summary, actions }` | `zod` şeması; `cleanAndParseJSON` yeniden kullanılır — **1.2 ile aynı dönüştürücü altyapısı paylaşılır** |
| 2.5 | Cornell önizleme + kabul | Önizleme reddedilebilir; kabul onayında alanlar `NoteEditorHeader` üzerinden yazılır |

**Bu sürümde olmayanlar**
- **Ham ses dosyası saklama (MediaRecorder).** Kota yönetimi, blob yaşam döngüsü, oynatma
  arayüzü ve temizlik gerektirir; ayrı bir özelliktir. Bekleme listesinde **B1** olarak
  duruyor.
- Sürekli arka planda dinleme, çok konuşmacı ayrımı, ses dosyası senkronizasyonu.

**Çıkış kriteri:** Kullanıcı Notlar ekranında not yazarken mikrofona basar, konuşur, dönüşen
metni canlı görür ve tek tıkla notu kaydeder; ya da AI Cornell dönüşümünü önizleyip
kabul eder.

**Riskler**
- *Tarayıcı desteği:* `webkitSpeechRecognition` yalnızca Chromium tabanlı tarayıcılarda
  var → özellik algılaması (feature detection) ile düğme gizlenir; Firefox/Safari
  kullanıcısı boş bir düğme görmez, ayarlarda açıklayıcı metin gösterilir.
- *İzin:* `getUserMedia` ilk kullanımda kullanıcı onayı ister. İzin reddedilirse düğme
  devre dışı kalır ve neden yazılır; sessizce başarısız olmaz.

---

## v1.3.0 — P2P Sync: Taşıma & Kriptografi

**Hedef:** `chrome.storage.sync` cihazlar arası otomatik eşitleme sağlıyor ama 100 KB
kota, yoklamalı (kota dolduğunda yazma durur) ve kullanıcı verisi Google'a gider. Notlar,
medya kütüphanesi ve KPSS geçmişi gibi büyük ve yerelde kalmak istenen veri kümesi için
çözüm yok.

**Çıktı:** İki cihaz, aralarında hiçbir sunucu olmadan WebRTC DataChannel üzerinden
şifreli veri aktarabilir. Bu sürüm **aktarımın kendisini** kurar; veri kaynaklarını
bağlamaz (bkz. v1.4.0).

**Neden ikiye bölündü:** Kriptografi ve çerçeve protokolü tarayıcı olmadan test edilebilir
saf katmanlardır ve veri modelinden bağımsızdır. Bu sürüm bittiğinde elde "şifreli bir
kanal" vardır ama içinden anlamlı veri akmaz — bu, v1.4.0'e geçmeden önce kriptografinin
doğrulanabilmesi demektir.

**Kapsam dışı:** Veri kaynakları, çakışma çözümü, kullanıcı arayüzü — hepsi v1.4.0'de.

| # | Adım | Kabul kriteri |
|---|---|---|
| 3.1 | Sinyalleşme taşıması: ICE sunucu listesi + STUN/ICE toplama | `chrome.iceServers` yalnızca STUN; **TURN sunucusu eklenmez** (üçüncü taraf bağımlılığı yasağı) |
| 3.2 | Oturum açma anahtarı türetme (PBKDF2/HKDF) | Anahtar `chrome.storage.local`'de **tutulmaz**; oturum boyunca bellekte, sekme kapanınca yok olur |
| 3.3 | AES-GCM 256 şifreleme katmanı + `tests/` | WebCrypto; bilinen-vektör testi; çalma/karıştırma (tampering) testi |
| 3.4 | Çerçeve protokolü: tip, sürüm, uzunluk, parçalanma | Uzun mesajlar parçalanıp yeniden birleşir; sıra numarası doğrulanır; sürüm uyuşmazlığı temiz şekilde reddedilir |

**Çıkış kriteri:** İki sekme, aynı ağda, aralarında sunucu olmadan kurulmuş bir
DataChannel üzerinden şifreli bir mesaj alışverişi yapabilir. Kriptografi ve protokol
katmanları `tests/` altında tarayıcısız doğrulanmıştır.

**Riskler**
- *NAT geçişi:* Symmetric NAT'ta iki eş doğrudan bağlanamayabilir. Bu **bilinen ve kabul
  edilen** bir sınırdır: kapsam "aynı LAN" ile sınırlıdır ve kabul kriterinde açıkça
  yazılıdır. TURN eklemek üçüncü taraf sunucu yasağını ihlal eder ve kapsam dışıdır.
- *Kriptografi hatası:* Kriptografik kod elle yazılır. Azaltma: WebCrypto'ya bırakılır,
  bilinen-vektör testleriyle doğrulanır, anahtar türetmede sabitler tek yerde tutulur.

---

## v1.4.0 — P2P Sync: Veri Aktarımı

**Hedef:** v1.3.0'ın kanalını kullanıcının gerçek verisiyle doldurmak. Bu, planın en
yüksek riskli sürümüdür çünkü hata **kullanıcı veri kaybı** anlamına gelir.

**Çıktı:** Seçilen veri kümeleri tek yönlü aktarılır, çakışmalar çözülür ve kullanıcı
ilerlemeyi görür.

| # | Adım | Kabul kriteri |
|---|---|---|
| 4.1 | Veri kaynağı adaptörü: `I*Repository` portları üzerinden okuma | `infrastructure/persistence/repositories/` içindeki 23 `ChromeStorage*` repo **tek yönlü** aktarılır, değiştirilmez |
| 4.2 | Çakışma çözümü | Son yazan kazanır + `updatedAt` karşılaştırması; **sessiz veri kaybı yazılı testle engellenir** |
| 4.3 | Bağlantı arayüzü (Ayar > Veri sekmesi, tek ekran) | Bağlantı durumu, aktarılan bayt sayacı, iptal düğmesi; **ayrı view yok** |

**Bu sürümde olmayanlar**
- **Otomatik sürekli arka plan senkronu.** Yalnızca kullanıcı tetikli, ilerlemesi görünür
  aktarım. Arka planda sessizce çalışan senkron, kullanıcı kontrolünü kaybettirir.
- Çakışma çözümünde alan bazlı birleştirme (merge). Yalnızca kayıt bazlı son-yazan-kazanır.
- Cihaz dışı yedekleme. Bu zaten Google Drive yedeği ile karşılanıyor.

**Çıkış kriteri:** Kullanıcı iki cihaz arasında bir veri kümesi aktarır, ilerlemeyi izler,
aktarım bitince hedef cihazda doğru veriyi bulur ve bir çakışma senaryosunda veri kaybı
olmadığını testten görür.

**Riskler**
- *Veri kaybı:* En yüksek risk. Azaltma: aktarım tek yönlü; kaynak repo değiştirilmez;
  çakışma çözümü yazılı testle kanıtlanır.
- *Manifest izni:* İzin değişiklikleri gerekebilir; ayrı ve gerekçeli yapılır.
- *Bekleme listesi etkileşimi:* B1 (ham ses kayıtları) `chrome.storage.sync` kotasına
  sığmaz. Bu sürüm bittiğinde ses kayıtlarının P2P kanalına mı verileceği yoksa cihazda
  mı kalacağı kararlaştırılmalıdır; B1 donmuş olduğu için bu beklemede.

---

## ⏸️ Bekleme Listesi (Dondurulmuş)

> Aşağıdakiler silinmemiştir; fikir değerlidir. Ancak gerçekleştirilmeyecek veya iptal
> edilene kadar yeni kod yazılmayacaktır. Bir kalem yalnızca v1.1.0, v1.2.0, v1.3.0 ve
> v1.4.0 kapandıktan sonra sürüm haline gelebilir.

### B1. 🎙️ Ham Ses Dosyası Saklama (Voice Memo — kalan parça)

v1.2.0'ün dışarıda bıraktığı tek parça: konuşmanın **sesini** saklamak ve sonra çalmak.

> **Neden ayrıldı:** v1.2.0'ün değeri transkriptten geliyor. Ham ses eklemek kota
> yönetimi, blob yaşam döngüsü, oynatma arayüzü ve temizlik gerektirir; ayrı bir
> özelliktir. 2.1'deki ortak `useSpeechToText` hook'u bunun için de kullanılabilir.

- [ ] **MediaRecorder ile Ham Ses Yakalama**: `getUserMedia` + `MediaRecorder`; repo genelinde şu an **hiç yok**.
- [ ] **Depolama & Kota Yönetimi**: Kayıtları `chrome.storage` veya IndexedDB'de tutma, kota uyarısı, eski kayıtların otomatik temizliği.
- [ ] **Oynatma Arayüzü**: Not üzerinde dinleme, ileri/geri sarma; blob URL temizliği.
- [ ] **Senkronizasyon kararı**: Kayıtlar `chrome.storage.sync` kotasına sığmaz — v1.4.0 P2P kanalına mı verilecek, yoksa cihazda mı kalacak?

### B2. 🧘 Mindful Micro-Breaks & 20-20-20 Eye Guard

Ekran başı seanslarında göz yorgunluğunu ve duruş bozukluğunu engelleyen ergonomik asistan.
Repo genelinde hiçbir parçası yok.

- [ ] **20-20-20 Kuralı Zamanlayıcısı**: Her 20 dakikada bir 20 saniye boyunca 6 metre uzağa bakmayı hatırlatan mikro bildirim.
- [ ] **Esneme & Duruş Hatırlatıcıları**: Pomodoro uzun molalarında omuz, boyun, sırt esneme egzersizleri.
- [ ] **Akıllı Seans İstatistiği**: Günlük mikro mola sayısı ve ekran dinlenme süresi.

### B3. 💰 BİST Temettü & Bedelsiz Sermaye Artırımı Takvimi

> **Mevcut durum:** Yalnızca kullanıcının kendi oluşturduğu metin isimli takip listeleri var
> (örn. "Temettü" adlı liste). Repo genelinde temettü/bedelsiz veri kaynağı, takvim
> yazımı veya projeksiyon matematiği **yoktur**.

- [ ] **Otomatik Hakediş Takvimi**: Portföy ve izleme listesindeki şirketlerin kesinleşen temettü tarihlerini takvime işleme.
- [ ] **Yıllık Pasif Gelir Projeksiyonu**: Lot sayısına göre tahmini yıllık net temettü getirisi (TL).
- [ ] **Bedelsiz Sermaye Bildirimi**: Bedelsiz bölünme günleri ve tahmini yeni lot adedi.

### B4. 🎵 Multi-Channel Ambient Soundscapes Mixer

> **Mevcut durum:** Prosedürel sentezleyici katmanlı (`src/services/ambientAudio/`): saf
> DSP (`noiseSynthesis.ts`), ses grafikleri (`voices.ts`), yaşam döngüsü
> (`ambientAudioEngine.ts`) ayrı katmanlarda. `play(type, volume)` tek giriş noktası,
> tür→üretici eşlemesi `VOICE_FACTORIES` tablosunda. **Ancak motor hâlâ tek ses
> kaynağıdır** — `play()` ilk satırında `stopAllSounds()` çağırıyor
> (`ambientAudioEngine.ts:73-74`) ve durum tek bir `voice` handle'ı (`:38`). Tek bir
> global `volume` var (`ambientAudioTypes.ts:57-64`); hazır profil kavramı hiç yok.

- [ ] **Eşzamanlı Ses Katmanlama**: Birden fazla kaynağı aynı anda çalıştırma (*"Fırtınalı Kütüphane"*, *"Kış Gecesi"*). `VoiceHandle` teardown kaynaklarını zaten topluyor; iş motor katmanında çoklu slot yönetimiyle sınırlı.
- [ ] **Bağımsız Kanal Ses Düğmeleri**: Kanal başına seviye (`VoiceHandle.masterGain` bunun için ayrılmış durumda).
- [ ] **Hazır Profiller (Presets)**.

### B5. 📊 Teknik İndikatör Arayüzü (RSI / EMA 20-50 / MACD)

> **Mevcut durum:** Hesaplama katmanı kısmen hazır — `computeStockTelemetry()`
> (`src/services/stock/stockPrompts.ts:51-122`) **RSI(14)**, **SMA-20** ve **hacim oranı**
> hesaplayıp AI prompt'una besliyor (`:141`, `stockAiService.ts:266-274`). Bu değerlerin
> **hiçbir arayüzde görselleştirilmesi yok** (`src/components/stock/**` içinde tek bir
> `rsi` referansı bile yok). EMA ve MACD repo genelinde **hiç geçmiyor**.
> `evaluateStockRules()` yalnızca uygulanan 7 koşulu değerlendirir
> (`src/types/stock.ts:6-13`).

- [ ] **RSI Sinyal Arayüzü**: RSI < 30 / > 70 durumunu *"Aşırı Satım"* / *"Aşırı Alım"* rozeti olarak gösterme. Yeni bir kural tipi **eklenirse** `evaluateStockRules()` içinde karşılığı olan bir `case` ile birlikte gelmelidir — aksi halde `default: break` sessizce yutar.
- [ ] **EMA 20/50 & Golden / Death Cross**: Şu an yalnızca basit 20 günlük ortalama (SMA-20) var; EMA ve kesişim tespiti yok.
- [ ] **MACD Göstergesi**: Hiç hesaplanmıyor.
- [ ] **Hacim Sıçraması Uyarısı**: `volRatio` hesaplanıyor, 3x eşiğinde tetik yok.
- [ ] **Gösterge Panosu (Chart Overlay)**: Fiyat grafiğine RSI / ortalama çizgilerinin bindirilmesi.

### B6. 🎮 Game Jam Countdown & Asset Pack Bundler

> **Mevcut durum:** Asset toplayıcı var (`gameAssetsService.ts` → Itch.io RSS akışları,
> Kenney, OpenGameArt, GamerPower; `:499-507`). **Jam verisi/takvimi/sayacı hiç yok** (mevcut
> sayaçlar KPSS sınavı ve Kamu İlanları `daysLeft` ile ilgili, farklı modüller). Toplu
> indirme/zip yok: kartın tek eylemi yerel "kaydedildi" bayrağı + dış bağlantı
> (`GameAssetCard.tsx:140-186`); repo genelinde `jszip` mantığı bulunmuyor.

- [ ] **Itch.io Game Jam Takvimi**: Jam başlangıç/bitiş tarihleriyle canlı sayaç.
- [ ] **Tema Beyin Fırtınası**: Jam temasından AI ile 3 farklı oyun mekaniği/prototip fikri türetme.
- [ ] **Seçili Asset Paketi İndirici**: Tek tıkla zip listesi.

### B7. 📑 Akıllı Sekme Gruplama (AI Kategori Gruplama)

> **Mevcut durum:** `src/background/handlers/runtimeMessageHandler.ts:173-199` içindeki
> `group_active_tab` handler'ı, Side Panel açıldığında (`useAgentBridge.ts:77`) **o an
> etkin olan sekmeyi** "Life OS Agent" grubuna alıyor. Otomatik/kategori gruplama mantığı
> **yok**.

- [ ] **AI Kategori Gruplama**: 30+ sekmeyi *"Borsa & Finans"*, *"KPSS & Çalışma"*, *"Oyun Geliştirme"* gibi kategorilere otomatik gruplama.
- [ ] **Bellek Uyutucu ile uyum**: Gruplama, Bellek Uyutucu'nun boşaltabildiği sekmeleri boşaltmamalı. İki özellik birbirini bozmamalı.

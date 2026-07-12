# Changelog (Değişiklik Günlüğü)

Bu dosya, **Life OS - Personal Dashboard** eklentisinin geliştirilme aşamalarını ve eklenen tüm özellikleri sürüm geçmişi olarak takip eder.

---

## [2.7.2] - 2026-07-12
### Düzeltildi
- **Ayar Seçeneklerinin Okunamama Hatası**:
  - Ayarlar panelinde kısayol tuşu seçimi açılır kutusundaki (`select`) seçeneklerin (`option`) beyaz üzerine beyaz çıkması nedeniyle yazının okunmaması hatası, tarayıcı/sistem koyu modlarıyla uyumlu olacak şekilde özel CSS stilleri ile düzeltildi.
- **Karakter Sınırının Artırılması (5000 karakter)**:
  - Uzun paragrafları veya makaleleri seçtiğinizde çeviri balonunun çalışmasını engelleyen 500 karakterlik limit, API ve URL uzunluk sınırları gözetilerek **5000 karaktere** çıkarıldı. Böylece uzun metinleri de sorunsuz şekilde çevirebilirsiniz.
- **Tıklamayla Kapatma & Sıfırlama Mekanizması**:
  - Çeviri balonunun web sayfasında boş bir alana tıklandığında hemen kapanması ve mouseup anında eski seçimlerin sıfırlanıp balonun tekrar açılması sorunu, `selection.isCollapsed` kontrolü eklenerek tamamen çözüldü.

---

## [2.7.1] - 2026-07-12
### Düzeltildi
- **Akıllı Çeviri Hedef Dili Algılama ve Değiştirme (Auto-Swap)**:
  - Seçilen metnin dili ile hedef dilin aynı olması durumunda (örneğin İngilizce metin seçildiğinde eklenti hedefinin de İngilizce olması) kelimenin aynen geri dönmesi hatası giderildi.
  - Artık kaynak dil ile hedef dil çakıştığında, eklenti dili otomatik olarak diğer dile (Türkçe ise İngilizce'ye, İngilizce ise Türkçe'ye) çevirerek her durumda doğru sonucu gösterir.

---

## [2.7.0] - 2026-07-12
### Eklendi
- **Sayfa İçi Premium Çeviri Balonu (Universal Info Box Entegrasyonu)**:
  - PyQt6 tabanlı masaüstü uygulamanızın (`Universal_Info_Box_Standalone`) işlevselliği, tarayıcımıza bir content script modülü olarak entegre edildi.
  - **Shadow DOM İzolasyonu**: Çeviri balonunun HTML ve CSS kodları tamamen Shadow DOM (`shadowRoot`) kullanılarak izole edildi. Bu sayede hiçbir web sitesinin stili balonumuzun görünümünü bozamaz.
  - **Güvenli Background İletişimi**: Sitelerdeki katı güvenlik politikalarını (CSP) aşmak için kelime istekleri arkaplan servisine (`background.js`) yönlendirilerek Google Translate gtx servisi üzerinden güvenli şekilde çevrilir.
  - **Ayarlar Drawer Desteği**: Eklenti ayarları içine balonun tamamen açılıp kapatılabileceği bir kontrol butonu ve hangi kısayol tuşu ile (Alt, Ctrl, Shift veya Hiçbiri) tetikleneceğini seçebileceğiniz bir açılır liste yerleştirildi.

---

## [2.6.3] - 2026-07-12
### Eklendi
- **Yol Haritasına Universal Info Box Entegrasyonu Eklendi (ROADMAP.md)**:
  - Daha önce geliştirilen Python PyQt6 tabanlı masaüstü çeviri uygulamasının (`Universal_Info_Box_Standalone`) işlevsel yapısı ve premium görsel balonu, tarayıcı sayfaları içerisine entegre edilmek üzere **Universal Info Box & Inline Translator** adıyla gelecek planları yol haritasına dahil edildi.

---

## [2.6.2] - 2026-07-12
### Eklendi
- **Yol Haritasına Çeviri Aracı Eklendi (ROADMAP.md)**:
  - Sayfa içi seçili metinleri anlık olarak çevirebilecek, ücretsiz API'leri veya yerel Ollama modellerini destekleyen bir **Sayfa İçi Metin Çevirici (Inline Text Translator)** planı gelecek hedeflere dahil edildi.

---

## [2.6.1] - 2026-07-12
### Eklendi
- **Gelecek Planları Yol Haritası (ROADMAP.md)**:
  - Gelecek hedefleri olan yerel yapay zeka (Ollama Asistanı), gelişmiş Manifest V3 reklam engelleyicisi ve çerez onaylarını otomatik reddeden robot planları GitHub standartlarında `ROADMAP.md` dosyasına kaydedildi.
- **Beni Oku Güncellemesi (README.md)**:
  - Projenin ana dokümantasyon dosyası, eklenen tüm yeni özellikler (Detoks arayüzü, ekran süre takibi, telefon tipi alarmlar, Zod/XSS güvenlik korumaları ve özel mor onay modalı) göz önünde bulundurularak kapsamlı bir şekilde güncellendi.

---

## [2.6.0] - 2026-07-12
### Eklendi
- **Özel Onay Penceresi (ConfirmModal.tsx ve confirm.css)**:
  - Tarayıcının yerleşik gri ve ucuz görünümlü `confirm()` pencereleri tamamen yasaklandı.
  - Bunun yerine, eklentinin karanlık teması ve görsel bütünlüğüyle uyumlu, şık bir glassmorphic **ConfirmModal** bileşeni geliştirildi.
  - Onay penceresi pürüzsüz animasyonlar (açılışta ölçeklenme ve arkaplan bulanıklaşması), mor gradient butonlar ve uyarı ikonu ile zenginleştirildi.
  - Not silme (NotesView), söz silme (NotesView), irade sıfırlama (WillpowerView), KPSS istatistik sıfırlama (KpssView) ve tüm verileri silme (App.tsx) onay pencereleri bu özel bileşene taşındı.
- **Ücretsiz Oyun Alarm & Masaüstü Bildirim Servisi (Steam, Epic, GOG)**:
  - GamerPower API ile entegre, saatlik çalışan bir Chrome alarm servisi (`chrome.alarms`) arka plan dosyasına (`background.js`) eklendi.
  - Sadece **Steam, Epic Games ve GOG** platformlarında yeni bir ücretsiz oyun dağıtıldığında kullanıcıya masaüstü bildirimi gönderilir.
  - Gönderilen bildirime tıklandığında oyunun alınacağı claim sayfası otomatik olarak yeni tarayıcı sekmesinde açılır.
  - Daha önce bildirimi gönderilmiş oyunlar tekrar edilmesin diye yerel depolamada (`notified_giveaway_ids`) filtrelenir.
- **Bildirim Açma/Kapatma Ayarı**:
  - Ayarlar panelinde ücretsiz oyun bildirimlerinin açılıp kapatılabileceği bir toggle butonu oluşturuldu. Tercih bulut senkronizasyonu (`storage.sync`) ile korunmaktadır.
- **Eklenti Marka Logosu (logo_icon)**:
  - Bildirimlerde ve eklenti paketinde kullanılmak üzere minimalist mor neon temalı bir eklenti logosu oluşturulup projenin `icons/` dizinine eklendi.

---

## [2.5.0] - 2026-07-11
### Eklendi
- **Veri Yedekleme ve Yükleme Şema Güvenliği (Zod Entegrasyonu)**:
  - Yedekleme/Geri yükleme mekanizması (`backup.ts`) içerisine **Zod** şema doğrulayıcı kütüphanesi entegre edildi.
  - JSON yedek dosyaları yüklenirken artık tüm görev nesneleri tek tek model şemasına göre sıkı bir doğrulamadan geçirilir. Bu sayede zararlı kod veya hatalı yapı enjekte edilmiş sahte yedek dosyaları Chrome yerel depolama alanına (Storage) yazılmadan önce engellenir.
- **Detoks Ekranı XSS Güvenlik Filtresi (HTML Escaper)**:
  - Kullanıcıların kendi notlarından/sözlerinden çekilen verilerin detoks bloke ekranına basılması esnasında oluşabilecek DOM-tabanlı XSS (Cross-Site Scripting) zafiyetlerini önlemek için `content.js` içerisine güvenli bir `escapeHtml` yardımcı fonksiyonu entegre edildi.
  - HTML etiketleri (`<`, `>`, `&`, `"`, `'`) içeren tüm metinler sayfaya basılmadan önce otomatik olarak sanitize edilir.
- **TypeScript CSS Side-Effect Bildirimi (`css.d.ts`)**:
  - `src/types/css.d.ts` dosyası oluşturularak side-effect CSS dosyalarının import edilmesine yönelik TypeScript derleyici uyarıları giderildi.

### Düzeltildi
- **TypeScript & ESLint Kod Temizliği**:
  - `npx tsc` derleme aşamasında hata veren takvim gün hücreleri (`never[]`), storage okuma parametre tipi eşleşmeleri (`res as Record<string, any>`) ve App.tsx'teki eksik model değişkenleri (`category`, `lastCompletedDate`) tamamen çözüldü.
  - ESLint tarafındaki 65 adet kural ihlali (tek satırlık `if` deyimlerindeki süslü parantez eksiklikleri, kullanılmayan import ve değişken tanımlamaları, gereksiz atamalar) sıfırlandı.
  - Prettier biçimlendiricisi tüm proje genelinde (54 dosya) çalıştırılarak kod girintileri, boşluklar ve genel yazım formatı kusursuz bir standarda kavuşturuldu.

---

## [2.4.2] - 2026-07-11
### Değişti
- **Sağ Üst Popup Detoks Arayüzü Kolay Seçim Modu**:
  - Popup penceresindeki manuel adres yazma kutusu ve site listesi kaldırıldı. Manuel adres engelleme işlemi artık tamamen Yeni Sekme (New Tab) paneline taşındı.
  - Bunun yerine, pop-up ekranına 5 popüler sosyal medya sitesinin (Twitter/X, Instagram, YouTube, TikTok, Facebook) logolarıyla (SVG ikonları) seçilebileceği 5 sütunlu, modern bir seçim tablosu eklendi.
  - Seçilen popüler siteler, soft mor arka plan ve mor renkli ikon aydınlatmalarıyla görsel olarak seçildiğini belirtir hale getirildi. Seçimi kaldırmak ise tek tıkla oldukça pratik bir hale getirildi.
  - Yeni Sekmeden manuel eklenen diğer özel siteler, popup ekranında bu butonlara tıklandığında silinmez veya bozulmaz; sadece seçilen popüler sitelerin alan adları listede güncellenerek güvenli bir şekilde senkronize edilir.

---

## [2.4.1] - 2026-07-11
### Düzeltildi
- **Sağ Üst Popup Arayüzü İyileştirmeleri ve Font Düzeltmeleri**:
  - Chrome eklentilerinde varsayılan form denetimlerinin (butonlar, select kutuları ve inputlar) tarayıcı varsayılan serif yazı tipine (Times New Roman) düşmesini engellemek için `button, input, select, textarea { font-family: inherit; }` kuralı eklendi.
  - Tab geçiş butonlarındaki çakışan inline `background: transparent` kodları kaldırıldı. Bu sayede aktif sekmenin mor (`#8b5cf6`) arka plan rengi ve yumuşak gölgesi artık kararlı ve göz alıcı bir şekilde çalışıyor.
  - Tıklama sonrasında tarayıcının butonlara uyguladığı kaba, çiğ beyaz odaklanma çerçevesi/arka planı (`:focus`) engellendi.
  - Detoks başlatma ve bitirme butonları, çiğ beyaz dikdörtgen görünümden kurtarılarak mor renk geçişine (gradient), yuvarlatılmış köşelere, yumuşak gölgeye ve hover animasyonlarına sahip premium butonlarla değiştirildi.
  - Site listesindeki koyu ve çiğ arka planlar kaldırılarak tamamen şeffaf, ince kenarlıklı glassmorphic tasarıma geçildi.

---

## [2.4.0] - 2026-07-11
### Eklendi
- **Günlük Ekran Süresi Takipçisi (Screen-Time Tracker)**:
  - Arka planda aktif sekmeleri izleyen, domain bazlı aktif geçirilen süreyi saniye hassasiyetinde ölçen yeni bir servis betiği (`background.js`) yazıldı.
  - Tarayıcının veya aktif sekmenin odağını kaybetmesi durumunda sayaç durur, böylece yalnızca gerçek aktif kullanım süreleri doğru şekilde hesaplanır.
  - Performansı korumak amacıyla veriler arka planda biriktirilir (buffer) ve her 10 saniyede bir toplu olarak yerel depolama alanına (`chrome.storage.local`) kaydedilir.
- **Detoks Sekmesinde Kullanım Analiz Paneli**:
  - Sosyal Medya Detoksu görünümünün en üstüne yeni bir analiz kartı eklendi: *"Bugün Chrome'da Ne Kadar Vakit Geçirdin?"*.
  - Bu panelde, bugün tarayıcıda geçirilen toplam süre büyük dijital bir saat formatında gösterilir.
  - Altında, en çok vakit geçirilen siteler (domainler) süreleri ve yüzde paylarıyla birlikte listelenir.
  - Her sitenin altında, sürenin büyüklüğüne göre dolan, mor-mor/leylak renk geçişine sahip modern glassmorphic ilerleme çubukları (progress bars) bulunur.
  - En çok ziyaret edilen ilk 5 site gösterilir; daha fazlası için "Tümünü Göster" butonuyla genişletilebilir dinamik liste yapısı eklendi.

---

## [2.3.0] - 2026-07-11
### Eklendi
- **Manuel Detoks Adresi Engelleme**:
  - Detoks görünümü içerisine kullanıcının kendi istediği adresleri manuel yazıp ekleyebileceği bir özel alan ve engellenen adresleri listeleyen dinamik rozetler eklendi.
  - Bu manuel adreslerin engellenmesini sağlamak için `manifest.json` dosyasındaki içerik betikleri eşleşme kuralı tüm adresleri (`<all_urls>`) kapsayacak şekilde güncellendi.
- **Sağ Üst Eklenti Pop-up Panelinde Çoklu Özellik Desteği (Pomodoro & Detoks)**:
  - Tarayıcının sağ üstündeki eklenti ikonuna tıklandığında açılan popup arayüzü tamamen yenilenerek iki sekmeli bir yapıya geçildi: **Pomodoro & Alarmlar** ve **Detoks**.
  - **Pomodoro Sekmesi**: Ortak Pomodoro sayacı kontrolü, anlık senkronize olan bir Kronometre paneli ve telefon tarzı kurulmuş alarmları gösterip açıp kapatabileceğiniz bir Alarmlar paneli içerir.
  - **Detoks Sekmesi**: Yeni sekme açmaya gerek kalmadan detoks oturumunu başlatma/bitirme, süre seçme, manuel engellenecek site ekleme ve engelli siteleri listeleme özelliklerini barındırır.
- **Telefon Tarzı Çoklu Alarmlar Sistemi**:
  - Tek ve kontrolü zahmetli olan eski alarm kurma kutusu kaldırılarak tamamen telefon uygulamalarındaki gibi dinamik ve birden çok alarm eklenebilen bir alarmlar listesi geliştirildi.
  - Alarmlar listesinde her alarm; büyük saat karakterleri, aktif/pasif etme anahtarı (toggle switch) ve silme butonuyla birlikte gösterilir. Kurulan saat geldiğinde alarm tetiklenir, otomatik pasife alınır ve masaüstü bildirimi gönderilir.

### Düzeltildi
- **Kronometre & Alarm Senkronizasyonu**:
  - Kronometre ve telefon tarzı alarmların durumu `chrome.storage.local` üzerinde ortak bir yapıya alınarak Yeni Sekme ekranı ile Sağ Üst popup ekranı arasında 100% anlık senkronizasyon sağlandı.

---

## [2.2.5] - 2026-07-11
### Düzeltildi
- **Detoks Engelleme Ekranı Kilitlenme ve Yükleme Sorunları**:
  - `DOMContentLoaded` olayının, storage sorgusu tamamlanmadan önce gerçekleştiği race condition (yarış durumu) hatası düzeltilerek bloke ekranının anında yüklenmesi sağlandı.
  - Tek Sayfa Uygulamalarının (Single-Page-Apps) (Twitter/X, Instagram, YouTube vb.) kendi istemci taraflı JavaScript kodlarıyla eklentimizin engelleyici ekranını ezmelerini (React hydration override) engellemek amacıyla **MutationObserver** mekanizması entegre edildi.
  - Engellenen sitelere girildiğinde artık kilit simgesi, kalan detoks süresi sayacı ve rastgele motive edici bir söz içeren glassmorphic bloke kartı kesintisiz ve kararlı bir şekilde ekranda kilitlenmektedir.

---

## [2.2.4] - 2026-07-11
### Değişti
- **Görev Girişi ve Kart Arası Mesafe**:
  - Liste görünümünde üstteki sabit görev ekleme çubuğu ile alttaki "Bugünkü odağın nedir?" kartı arasındaki üst üste binme sorunu giderildi.
  - `#list-view` seçicisine `margin-top: 110px;` eklenerek iki arayüz bloğu arasında dengeli bir boşluk bırakıldı ve sayfa dikey olarak kusursuzca ortalandı.

---

## [2.2.3] - 2026-07-11
### Değişti
- **Saat ve Tarih Konumu (Ücretsiz Oyunlar)**:
  - Saat ve tarih (Hero header), "Liste" görünümünden kaldırılarak kullanıcının talebi üzerine tekrar "Ücretsiz Oyunlar" (Ana/İlk ekran) görünümüne alındı.
- **Sidebar Menü Sıralaması**:
  - Sol menüdeki düğmeler kullanıcının istediği sıraya alındı:
    1. Ücretsiz Oyunlar (1. sıra)
    2. Liste (2. sıra)
    3. Kişisel Disiplin (3. sıra)
    4. Pomodoro (4. sıra)

---

## [2.2.2] - 2026-07-11
### Düzeltildi
- **Kanban & Takvim Genişlik Hatası**:
  - Uzantının React kök düğümü olan `#app` seçicisine genişlik kuralları (`width: 100%; min-height: 100vh;`) eklenerek, flex yapısından ötürü çöken ve Kanban/Takvim bileşenlerini 300px genişliğe sıkıştıran ana arayüz genişleme hatası giderildi.
- **KPSS Hazırlık Sidebar Yazısı**:
  - Sidebar üzerinde KPSS ikonu yanında görünmeyen "KPSS Hazırlık" yazısı geri getirilerek i18n dillerine (`view_kpss`) bağlandı.
- **Detoks Bloke Arayüzü**:
  - Detoks modunda siteler engellendiğinde sayfanın sadece boş beyaz ekran olarak kalmasına neden olan `!important` CSS ön-yükleme stili temizlendi. Artık engellenen sitelere girildiğinde kalan süre sayacı ve rastgele motive edici bir sözün yer aldığı şık glassmorphic kart arayüzü düzgünce yüklenmektedir.

---

## [2.2.1] - 2026-07-11
### Değişti
- **Genişletilmiş Dashboard Arayüzü**:
  - `.container` seçicisinin varsayılan maksimum genişliği `1000px` değerinden `1200px` değerine çıkarıldı.
  - Sıkışık olan Kanban panosunun ekranı daha geniş kaplaması ve esnekçe yayılması sağlandı.
- **Ayarlar Ekranı Okunabilirliği**:
  - Şeffaflık yüzünden arka plandaki yazılarla çakışan Ayarlar paneli (`.settings-content`), `rgba(15, 15, 22, 0.98)` rengiyle opak hale getirilerek okunabilirliği artırıldı.
- **Takvim ve Namaz Vakitleri Ayrımı**:
  - Takvim sayfası içerisindeki Ezan Vakitleri widget'ı kaldırıldı; takvim bileşeni artık tüm ekran genişliğini kaplamaktadır.
- **Saat ve Tarih Konumu**:
  - Saat ve tarih alanı, diğer araçlarda dikkati dağıtmaması için yalnızca "Liste" (ana ekran) görünümünde aktif olacak şekilde sınırlandırıldı.

---

## [2.2.0] - 2026-07-11
### Eklendi
- **Görevler ve Rutinler Tek Sayfa Birleşimi**:
  - Sidebar üzerindeki ayrı "Odağım" ve "Rutinler" bağlantıları kaldırılarak tek bir "Liste" butonu altında birleştirildi.
  - Görev listesi içerisine (ListView) yerleştirilen şık, glassmorphic sekme değiştirici (`.todo-tabs`) ile Odağım (Focus) ve Rutinler (Routines) görevleri arasında tek sayfa içinde butonla geçiş yapılması sağlandı.

### Değişti
- **Notlar Sayfası Arayüz İyileştirmesi**:
  - Notlar ekranındaki yan yana bitişik duran ve aynı renk olan butonlar ayrıştırılarak görsel hiyerarşi kazandırıldı.
  - "Yeni Not" butonu ana eylem olarak dolu mor arka planla (`.primary`), "Yeni Söz" butonu ise ikincil eylem olarak yarı saydam outlinesız buzlu cam tarzıyla (`.secondary`) tasarlandı, aralarındaki mesafe `12px` yapılarak ferahlatıldı.
- **Kişisel Disiplin Konumu**:
  - Sidebar üzerinde en altta duran "Kişisel Disiplin" (Willpower) bağlantısı, kullanıcının talebi üzerine "Pomodoro" sayacının hemen altına taşındı.

### Düzeltildi
- **Boş Kanban Görünümü Bug'ı**:
  - Todo listesinde durumu (status) olmayan eski görevlerin Kanban tahtasında listelenmemesi hatası giderildi. Durumu tanımlanmamış tüm görevler varsayılan olarak "Yapılacak" (todo) kolonuna aktarılarak Kanban tahtasının dolması sağlandı.
- **Takvim Ekranı Hizalama Bozulması**:
  - Namaz vakitlerinin Calendar görünümünde yan tarafta düzgün listelenememesi sebebiyle bozulan ekran yapısı düzeltildi.
  - Takvim sayfası modülü, kendi içinde `.split-view-container` yapısına alınarak sol panele yerel ve daha kompakt olan bir Ezan Vakitleri widget'ı (`<PrayerView compact={true} />`) eklendi.
  - `.calendar-container` sınıfına `flex: 1` ve `min-width: 0` özellikleri eklenerek takvim kartının ekran genişliğini dinamik doldurması sağlandı.

---

## [2.1.0] - 2026-07-11
### Eklendi
- **Modüler CSS Yapısı (Clean Code & Architecture)**:
  - Eski monolitik ve ardışık `part_1.css` - `part_12.css` dosyaları tamamen kaldırılarak bileşen bazlı CSS dosyaları oluşturuldu:
    - `base.css` (Değişkenler, scroll, resetler, modal drawer, animasyonlar)
    - `sidebar.css` (Navigasyon menüsü stilleri)
    - `tasks.css` (Görevler, listeler ve Kanban panosu)
    - `notes.css` (Not defteri kartları ve editör)
    - `pomodoro.css` (SVG halkası, stopwatch, alarm)
    - `willpower.css` (Kişisel disiplin sayacı ve geçmiş rütbeleri)
    - `hifiz.css` (Ezber sayfaları ve Mushaf modalı)
    - `srs.css` (Aralıklı tekrar kelime kartı çevirme animasyonu)
    - `calendar.css` (Aylık takvim gridi ve gün detayları)
    - `prayer.css` (Ezan vakitleri widget'ı)
    - `kpss.css` (Konu listeleri ve grafikler)
    - `free-games.css` (Fırsat kartları ve arama kutusu)
  - `src/newtab.css` dosyası yeni modüler dosyaları çağıracak şekilde güncellendi.
  - `.agents/AGENTS.md` içerisindeki CSS kuralları yeni modüler tasarıma göre güncellendi.

### Düzeltildi
- **Yeni Görev Ekleme Barı Hizalama Hatası**:
  - Görev ekleme barının (`.top-header`) container transform animasyonlarından etkilenerek aşağı kayması ve "Bugünkü odağın nedir?" kartıyla çakışması engellendi.
  - Giriş barı en üst katmana (`App.tsx` seviyesine) taşınarak ekranın en üstündeki sabit yerinde kusursuzca başlaması sağlandı.
  - Sadece görev listesi aktifken render edilmesi sağlandı.
  - `SrsView.tsx` içerisindeki tüm gömülü inline stiller ve `<style>` blokları `srs.css` dosyasına taşınarak arayüz kodları Clean Code standartlarına kavuşturuldu.

---

## [2.0.0] - 2026-07-11
### Değişti
- **Vite + Preact + TypeScript (TSX) Göçü**:
  - Proje, eski HTML + JavaScript yapısından modern, tip güvenli ve performanslı **Vite + Preact + TSX** mimarisine taşındı.
  - Bileşen odaklı yapıya geçilerek tüm ekranlar [src/components/](file:///c:/GitHub/Done/chrome-extension/src/components) altında parçalara bölündü:
    - `App.tsx` (Global durum yönetimi, dil, yedekleme, saat-tarih ve navigasyon)
    - `Sidebar.tsx` (Buzlu cam tasarımlı menü)
    - `ListView.tsx` & `KanbanView.tsx` (Görevler ve rutinlerin listelendiği panolar)
    - `NotesView.tsx` (Notlar ve özlü söz ekleme arayüzü)
    - `PomodoroView.tsx` (Odaklanma sayacı, kronometre ve alarm paneli)
    - `WillpowerView.tsx` (Kişisel disiplin sayacı paneli)
    - `HifizView.tsx` (Ezber takip ve yeterlilik checklisti paneli)
    - `SrsView.tsx` (Aralıklı tekrar kelime kartı paneli)
    - `CalendarView.tsx` (Takvim üzerinde tamamlanan görevler)
    - `PrayerView.tsx` (Konuma göre ezan saatleri)
    - `KpssView.tsx` (KPSS konuları ve Canvas grafiği)
    - `FreeGamesView.tsx` (Ücretsiz oyun takibi ve arama paneli)
  - Derleyici altyapısı olarak Vite entegre edildi (`vite.config.ts` ve `tsconfig.json`).
  - Derleme sonrası manifest ve veri klasörlerini kopyalayan `postbuild.js` yazıldı.

### Silindi
- Kullanımı sona eren tüm eski monolitik yapılar ve DOM manipülasyon dosyaları kaldırıldı:
  - `src/newtab.html`, `src/newtab.ts`, `src/render.ts`, `build.js`
  - `src/ui/` altındaki `dom.ts`, `sidebar.ts`, `hifizRender.ts`, `prayerView.ts`, `srsView.ts`
  - `src/features/` altındaki el ile buton yöneten `willpower.ts`, `hifiz.ts`, `pomodoro.ts` vb. mantıksal event bağlayıcılar.

---

## [1.2.0] - 2026-07-10
### Eklendi
- **Kişisel Disiplin Takipçisi (Willpower Tracker)**:
  - Hassas terimler içermeyen, tamamen profesyonel motivasyonel unvanlara dayalı gizli bir kişisel disiplin/willpower sayacı eklendi.
  - Gün:Saat:Dakika:Saniye bazında gerçek zamanlı çalışan sayaç tasarlandı.
  - Başlangıç tarihi, en iyi derece (Best Streak) verileri ve sıfırlama geçmişi `chrome.storage.sync` ile buluta yedeklenecek şekilde bağlandı.
  - Sayaç gün sayısına göre değişen rütbe kademeleri (Initiate, Control, Warrior, Knight, Master vb.) ve özel rütbe açıklamaları i18n dil dosyalarına eklendi.

---

## [1.1.0] - 2026-07-08
### Eklendi
- **Ücretsiz Oyunlar & Fırsatlar Paneli (Free Games Tracker)**:
  - Steam, Epic Games, GOG, PC vb. platformlardaki aktif ücretsiz oyun ve fırsatları listeleyen yeni bir arayüz entegre edildi.
  - Veriler **GamerPower API** kullanılarak dinamik olarak çekilir.
  - API istek limitlerini aşmamak ve New Tab sayfasının anında yüklenmesini sağlamak için **15 dakikalık yerel önbellekleme (chrome.storage.local)** mekanizması kuruldu. Ağ kesintilerinde eski veriler otomatik yedek plan olarak yüklenir.
  - Platform bazlı (Steam, Epic Games, GOG, PC, Tümü) ve fırsat türü bazlı (Oyun, Loot/DLC, Beta Anahtarları) filtreleme seçenekleri eklendi.
  - Oyun platformlarına özel renklerde badge'ler ve premium hover animasyonları içeren modern kartlar tasarlandı.
- **İzin Güncellemeleri**:
  - API isteklerinin CORS engeline takılmaması için `manifest.json` dosyasına `"host_permissions": ["https://www.gamerpower.com/*"]` eklendi.
- **Yerelleştirme (i18n)**:
  - Oyun fırsatları paneline ait tüm filtre ve metin içerikleri Türkçe ve İngilizce dil dosyalarına eklendi.

---

## [1.0.0] - Ana Kararlı Sürüm (Milestone)
### Eklendi
- **Glassmorphism (Buzlu Cam) Tasarım Sistemi**:
  - Tamamen özelleştirilmiş, modern, animasyonlu sidebar, blur efektli kartlar ve karanlık mod estetiği (`part_1.css` - `part_10.css` arası modüler yapı).
- **Odaklanma Zamanlayıcısı (Pomodoro)**:
  - Focus, Short Break ve Long Break modları.
  - SVG tabanlı dairesel ilerleme çubuğu.
  - Kronometre (Stopwatch) ve alarm araçları.
- **Görev Yönetimi (To-Do & Kanban)**:
  - Günlük hedefler için "Odağım" listesi.
  - Rutin görevler için "Rutinler" listesi (Günlük, Haftalık, Aylık tekrarlama seçenekleriyle).
  - Kartları sürükle-bırak (Drag-and-Drop) veya sol/sağ butonlarla yönetmeyi sağlayan modern **Kanban Panosu**.
- **KPSS Hazırlık Modülü**:
  - Ders bazlı konu checklistleri (Türkçe, Matematik, Tarih, Coğrafya vb.).
  - Çalışılan soru adetlerini girmeyi ve takip etmeyi sağlayan veri giriş sistemi.
  - Çalışma geçmişini görselleştiren istatistik grafiği (Canvas tabanlı).
- **Hıfız ve Din Görevlisi Yeterlilikleri**:
  - Sure ve dua bazlı ezber seviye takibi (Temel / İleri).
  - Diyanet İmam-Hatip aday yeterlilik checklist'i.
  - Surelerin mushaf sayfalarını eklenti içinden görüntülemek için sayfa değiştiricili **Mushaf Resim Görüntüleyici Modülü**.
- **Notlar ve Motivasyon Sözleri**:
  - Kart şeklinde not alabilme, düzenleme ve renkli kategorize etme.
  - Rastgele ve kullanıcı tarafından özel eklenebilen özlü sözler / motivasyon havuzu.
- **Aralıklı Tekrar (Spaced Repetition - SRS)**:
  - Hatırlanması gereken kavramlar, kelimeler veya notlar için bilimsel aralıklı tekrar algoritması entegrasyonu.
- **Namaz Vakitleri**:
  - İstanbul (veya özel konum) için namaz vakitlerini API'den çekme ve o anki namaz vaktini otomatik vurgulayan dinamik countdown.
- **Takvim Paneli**:
  - Günlük etkinlikleri ve görevleri gün bazında modal ile listeleyen entegre takvim arayüzü.
- **Veri ve Dil Yönetimi**:
  - Tüm verileri tek tıklamayla JSON olarak yedekleme (Backup) ve yedekten yükleme (Restore).
  - Türkçe ve İngilizce dinamik dil desteği (i18n).

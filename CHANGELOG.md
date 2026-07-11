# Changelog (Değişiklik Günlüğü)

Bu dosya, **Life OS - Personal Dashboard** eklentisinin geliştirilme aşamalarını ve eklenen tüm özellikleri sürüm geçmişi olarak takip eder.

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

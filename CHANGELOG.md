# Changelog (Değişiklik Günlüğü)

Bu dosya, **Life OS - Personal Dashboard** eklentisinin geliştirilme aşamalarını ve eklenen tüm özellikleri sürüm geçmişi olarak takip eder.

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

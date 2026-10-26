# 🧠 LifeOS Mühendislik Hafızası (KNOWLEDGE.md)

Bu dosya, LifeOS kişisel verimlilik ve odaklanma panosu projesinin mimari karar kayıtlarını (ADR) ve teknik tuzaklarını (Gotchas) belgeler.

---

## 🏛️ Mimari Karar Kayıtları (ADR)

### [ADR-01] Yerel-Öncelikli (Local-First) Depolama
- **Karar:** Kullanıcı verileri (görevler, rutinler, çalışma sayaçları, notlar) harici sunucular yerine tarayıcının `localStorage` ve `IndexedDB` alanında saklanır.
- **Gerekçe:** Tam gizlilik, sıfır internet bağımlılığı, anlık yükleme performansı ve sıfır sunucu maliyeti.

### [ADR-02] Sıfır Ağır Framework Yaklaşımı (Vanilla / Minimal TS)
- **Karar:** Ağır SPA frameworkleri yerine hafif, modern web standartları ve bileşen mimarisi tercih edildi.
- **Gerekçe:** Yeni sekme (New Tab) sayfasının milisaniyeler içinde gecikmesiz açılmasını garanti altına almak.

---

## ⚠️ Kritik Teknik Tuzaklar (Gotchas)

### [GOTCHA-01] LocalStorage Kota Aşımı ve JSON Ayrıştırma
- **Tuzak:** LocalStorage 5MB sınırına yaklaştığında veya bozuk JSON yazıldığında uygulamanın çökmesi.
- **Çözüm:** Tüm veri okuma ve yazma işlemleri Zod / şema denetimli yardımcı fonksiyonlarla sarılır; bozuk kayıtlarda otomatik kurtarma devreye girer.

### [GOTCHA-02] Pomodoro ve Arka Plan Sekme Zamanlayıcıları
- **Tuzak:** Tarayıcı sekmeleri arka plana atıldığında `setInterval` hızının 1 dakikaya kadar düşürülmesi (Timer Throttling).
- **Çözüm:** Kalan süre hesaplamalarında tick sayacı yerine mutlak zaman damgası farkı (`Date.now() - targetTime`) kullanılır.

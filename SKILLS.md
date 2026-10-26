# 📜 SKILLS.md — LifeOS Geliştirici & Ajan Standartları

Bu doküman, LifeOS panosu üzerinde çalışan ajanlar ve katkıcılar için mimari kısıtlamaları, veri kurallarını ve DoD standardını belirler.

---

## 🎯 Temel İlkeler ve Sınırlar

- **Gizlilik:** Hiçbir kullanıcı verisi harici analitik veya izleme servisine gönderilemez.
- **Hafiflik:** Sayfa açılış süresini 100ms üzerine çıkaracak harici CDN kütüphaneleri eklenemez.
- **Tip Güvenliği:** Kod tabanı temiz TypeScript ile yazılır, `any` kullanımı kesinlikle yasaktır.

---

## 🛠️ Mimari Kurallar

- **Modülerlik:** Her bileşen (Pomodoro, TodoList, RoutineTracker, Notes) bağımsız bir DOM ve veri yöneticisine sahip olmalıdır.
- **Fail-Safe:** Depolama hatası oluşsa dahi UI kilitlenmemeli, kullanıcıya zarif bir bildirim sunulmalıdır.

---

## ✅ Tamamlanma Kriteri (Definition of Done)

1. TypeScript derlemesi (`npm run build` veya `tsc`) hatasız tamamlanmalı.
2. `TASKS.md` güncellenmeli ve belgeler 200 satır sınırını aşmamalı.
3. Pre-Push kapısı doğrulanarak commit alınıp GitHub'a push edilmeli.

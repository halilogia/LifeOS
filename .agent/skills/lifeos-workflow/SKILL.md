---
name: lifeos-workflow
description: Preact Chrome Extension architecture, strict TypeScript (zero-any), design tokens, centralized logging, and DoD for LifeOS.
---

# 🧬 LifeOS Workflow & Engineering Standards

Bu beceri, LifeOS Chrome Uzantısı projesinde çalışan tüm yapay zekâ asistanlarının ve otonom süreçlerin uyması zorunlu mimari kuralları, temiz kod standartlarını ve Definition of Done kriterlerini tanımlar.

---

## 🎯 1. Mimari Yapı & Prensipler
- **Yığın:** Vite + Modular Preact + TypeScript Manifest V3 Chrome Extension.
- **Dizin Katmanları:**
  - `src/components/`: Görsel arayüz panelleri (Sidebar, ListView, Kanban, Pomodoro vb.).
  - `src/application/`: Tek işlemli kullanım senaryoları (`use-cases/`) ve portlar (`ports/`).
  - `src/infrastructure/`: Chrome storage repository'leri ve harici API client'ları.
  - `src/css/newtab/`: Modüler özellik stilleri; `base.css` merkezi tema değişkenlerini tutar.
- **Yol Kısayolları (Aliases):** İç modül importlarında göreceli yol (`../../`) yerine `@/` alias kullanılır.

---

## 🚫 2. Katı Sınırlar ve Tasarım Kuralları
1. **Merkezi CSS & Sıfır Tailwind:** Asla Tailwind kullanılmaz. Tüm renkler ve filtreler `:root` (`base.css`) değişkenlerinden (`var(--accent-color)` vb.) beslenir.
2. **Sıfır Doğrudan DOM Erişimi:** `document.querySelector` veya `getElementById` yasaktır. Tüm durumlar Preact hook'ları (`useState`, `useRef`) ile deklaratif yönetilir.
3. **Sıfır `any` Tipi:** Kod tabanında `any` kullanımı kesinlikle yasaktır (`@typescript-eslint/no-explicit-any`).
4. **İngilizce Kod Standardı:** Tüm dosya, fonksiyon, değişken ve sınıf adları İngilizce olmalıdır (yerel modül adları `kpss`, `hifiz` hariç).
5. **i18n & 'Zen' Yasağı:** Arayüz metinleri `i18n.ts` üzerinden dinamik çağrılır. Yeni modüllerde basmakalıp 'Zen' isimlendirmesi yasaktır; özgün isimler seçilir.
6. **Pop-up Yasağı:** Tarayıcının varsayılan `confirm()` / `alert()` pop-up'ları yasaktır; deklaratif `<ConfirmModal />` kullanılır.

---

## 🔒 3. Güvenlik, Veri ve Loglama Protokolleri
1. **Sıfır XSS & Giriş Güvenliği:** Doğrudan `.innerHTML` yazımı yasaktır; metinler `escapeHtml()` filtresinden geçirilir.
2. **Merkezi Loglama (Ham `console.*` Yasak):** `console.log/error` yerine `import { logger } from "@/utils/logger.js"` kullanılır. Hassas anahtarlar asla loglanmaz.
3. **Sıfır Sahte Veri Protokolü:** Veri katmanına uydurma statik dummy veri yazılamaz; kaynak metadata'da olmayan alanlar domain modeline eklenmez.
4. **Asenkron Mesajlaşma:** `chrome.runtime.onMessage` asla `async` yapılmaz; callback tabanlı `sendResponse` + `return true` kullanılır.

---

## 🛠️ 4. Tanımlı Tamamlanma Kriteri (DoD)
Herhangi bir değişiklik tamamlanmadan önce şu komutlar 0 hatayla geçmelidir:
```bash
npx tsc --noEmit
npm run build
```

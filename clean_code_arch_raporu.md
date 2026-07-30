# Clean Code & Clean Architecture İhlal Raporu

**Proje:** Chrome Extension (Life OS Dashboard)  
**Tarih:** 30 Temmuz 2026  
**Kapsam:** 256 TypeScript/TSX dosyası incelendi

---

## 🚨 KRİTİK İHLALLER

### 1. Domain Katmanı Dış Bağımlılık İhlali — `KpssCalculatorService.ts`

**Dosya:** `src/domain/services/KpssCalculatorService.ts`  
**Satır:** 9-10

```typescript
import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/types/types.js";
```

**Sorun:** Domain katmanı (`src/domain/`) **hiçbir dış bağımlılık içermemelidir**. Bu dosya:
- `@/utils/i18n.js` (utils katmanı) → `getTranslation` fonksiyonunu import ediyor
- `@/types/types.ts` (types katmanı) → `Language` tipini import ediyor

**Clean Architecture Kuralı:** Domain katmanı, çekirdek iş mantığını barındırır ve hiçbir dış katmana (utils, infrastructure, presentation) bağımlı olmamalıdır.

**Çözüm:** Domain servisi ham veri döndürmeli, formatlama/çeviri işlemini presentation katmanı yapmalıdır. `Language` tipi `@/domain/value-objects/Language.ts`'den import edilmelidir.

---

### 2. Domain Katmanı Dış Bağımlılık İhlali — `detoxMotivationalService.ts`

**Dosya:** `src/domain/services/detoxMotivationalService.ts`  
**Satır:** 7-8

```typescript
import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/types/types.js";
```

**Sorun:** Aynı ihlal — domain servisi `getTranslation` (utils) ve `Language` (types) import ediyor.

**Çözüm:** Domain servisi sadece sayısal/veri çıktısı üretmeli, metin formatlaması presentation katmanına bırakılmalıdır.

---

### 3. Presentation Katmanı Infrastructure Bağımlılığı — `useTodos.ts`

**Dosya:** `src/presentation/hooks/useTodos.ts`  
**Satır:** 29-42

```typescript
const syncRepo = new ChromeStorageSyncRepository();
const authApi = new GoogleAuthApi();
const tasksApi = new GoogleTasksApi();

const syncPort: ITodoSyncPort = {
  getAuthToken: (interactive) => authApi.getAuthToken(interactive),
  // ...
};
```

**Sorun:** Presentation hook'u doğrudan infrastructure implementasyonlarını (`ChromeStorageSyncRepository`, `GoogleAuthApi`, `GoogleTasksApi`) **module seviyesinde instantiate** ediyor.

**Clean Architecture Kuralı:** Presentation katmanı, infrastructure detaylarını BİLMEMELİDİR. Bağımlılıklar composition root'tan (App.tsx veya DI container) enjekte edilmelidir.

**Çözüm:** `syncPort` ve repository'ler hook'a parametre olarak geçirilmeli, hook içinde new'lenmemelidir.

---

### 4. Presentation Katmanı Infrastructure Bağımlılığı — `useAppInit.ts`

**Dosya:** `src/presentation/hooks/useAppInit.ts`  
**Satır:** 67-73, 99-100

```typescript
const settingsRepo = new ChromeStorageSettingsRepository();
const todoRepo = new ChromeStorageTodoRepository();
const syncRepo = new ChromeStorageSyncRepository();
// ...
const authApi = new GoogleAuthApi();
```

**Sorun:** Aynı ihlal — `useAppInit` hook'u doğrudan infrastructure sınıflarını instantiate ediyor.

**Çözüm:** Tüm repository'ler ve API'ler hook'a dışarıdan enjekte edilmelidir.

---

## 🔴 YÜKSEK ÖNEMLİ İHLALLER

### 5. Module Seviyesinde Side Effect — `kpssService.ts`

**Dosya:** `src/services/kpssService.ts`  
**Satır:** 153-155

```typescript
import { ChromeStorageKpssRepository } from "@/infrastructure/persistence/ChromeStorageKpssRepository.js";
const _defaultRepo = new ChromeStorageKpssRepository();
export const kpssService = createKpssService(_defaultRepo);
```

**Sorun:** Module import edildiği anda `new ChromeStorageKpssRepository()` çalışır. Bu:
- Test edilebilirliği zorlaştırır (mock'lanamaz)
- chrome.storage API'sine import anında bağımlılık oluşturur
- Service Locator anti-pattern'idir

**Clean Code Kuralı:** Modüller import edildiklerinde yan etki (side effect) oluşturmamalıdır.

---

### 6. Module Seviyesinde Side Effect — `aiChatService.ts`

**Dosya:** `src/services/aiChatService.ts`  
**Satır:** 385-404

```typescript
const _defaultRepos: AiChatDependencies = {
  aiConfigRepo: new ChromeStorageAiConfigRepository(),
  memoryRepo: new ChromeStorageMemoryRepository(),
  todoRepo: new ChromeStorageTodoRepository(),
  noteRepo: new ChromeStorageNoteRepository(),
};

export const { getAIConfigFromStorage, callAIConfigured, ... } = createAiChatService(_defaultRepos);
```

**Sorun:** Aynı ihlal — module seviyesinde 4 farklı repository instantiate ediliyor.

---

### 7. Module Seviyesinde Side Effect — `useTodos.ts`

**Dosya:** `src/presentation/hooks/useTodos.ts`  
**Satır:** 29-31

```typescript
const syncRepo = new ChromeStorageSyncRepository();
const authApi = new GoogleAuthApi();
const tasksApi = new GoogleTasksApi();
```

**Sorun:** Module import edildiğinde 3 infrastructure nesnesi oluşturuluyor.

---

### 8. Tek Sorumluluk İhlali — `callAIConfigured` Fonksiyonu

**Dosya:** `src/services/aiChatService.ts`  
**Satır:** 56-274 (218 satır)

**Sorun:** Bu fonksiyon:
- Ollama API çağrısı yapıyor
- OpenRouter/9Router API çağrısı yapıyor
- Gemini API çağrısı yapıyor
- Web search sonuçlarını işliyor
- System prompt oluşturuyor
- Response parse ediyor

**Clean Code Kuralı:** Bir fonksiyon tek bir işi yapmalıdır (Single Responsibility Principle). Her AI provider için ayrı fonksiyonlar olmalıdır.

---

### 9. Tek Sorumluluk İhlali — `App.tsx`

**Dosya:** `src/App.tsx`  
**Satır:** 1-372 (372 satır)

**Sorun:** App.tsx:
- State yönetimi (6+ hook)
- Event handling
- JSX rendering
- Initialization orchestration
- UI logic (export/import backup)

**Clean Code Kuralı:** Bir component tek bir sorumluluğa odaklanmalıdır.

---

## 🟡 ORTA ÖNEMLİ İHLALLER

### 10. Duplicate Code — SyncPort Factory

**Dosyalar:**
- `src/presentation/hooks/useTodos.ts` (satır 33-42)
- `src/presentation/hooks/useAppInit.ts` (satır 22-45)

**Sorun:** `ITodoSyncPort` adapter'ı iki farklı dosyada aynı şekilde oluşturuluyor. DRY (Don't Repeat Yourself) ihlali.

**Çözüm:** Ortak bir `createSyncPort()` factory fonksiyonu oluşturulmalı.

---

### 11. Magic String Kullanımı — Task List İsimleri

**Dosyalar:**
- `src/application/use-cases/todo/AddTodoUseCase.ts` (satır 57-58)
- `src/application/use-cases/todo/ToggleTodoUseCase.ts` (satır 51-52)

```typescript
const listId = isRoutine
  ? await this.syncPort.getOrCreateTaskList(token, "Life OS - Routines")
  : await this.syncPort.getOrCreateTaskList(token, "Life OS - Focus");
```

**Sorun:** `"Life OS - Routines"` ve `"Life OS - Focus"` string'leri sabit (constant) olarak tanımlanmamış.

**Çözüm:** `src/application/constants.ts` gibi bir dosyada sabit olarak tanımlanmalı.

---

### 12. UI Operasyonlarının Hook İçinde Olması — `useTodos.ts`

**Dosya:** `src/presentation/hooks/useTodos.ts`  
**Satır:** 135-184

```typescript
const handleExportBackup = useCallback(async () => {
  const blob = new Blob([JSON.stringify(dataList, null, 2)], ...);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zentodo-backup-${...}.json`;
  a.click();
  // ...
}, [todoRepository]);
```

**Sorun:** `handleExportBackup` ve `handleImportBackup` fonksiyonları DOM manipülasyonu (Blob, download, file reader) yapıyor. Bu UI operasyonları hook'ta değil, component'te olmalıdır.

---

### 13. Tip Import Tutarsızlığı

**Dosyalar:**
- `src/App.tsx` (satır 22): `import type { Todo } from "@/types/types.js"`
- `src/domain/services/KpssCalculatorService.ts` (satır 8): `import { KpssProgress } from "@/types/types.js"`
- `src/domain/services/KpssCalculatorService.ts` (satır 10): `import type { Language } from "@/types/types.js"`

**Sorun:** `Todo` entity'si `@/domain/entities/Todo.ts`'de, `Language` value object'i `@/domain/value-objects/Language.ts`'de tanımlı olmasına rağmen `@/types/types.ts` üzerinden import ediliyor. Bu:
- Gereksiz bir indirection katmanı
- Domain tipi değiştiğinde iki yerde güncelleme gerektirir
- Import yolu tutarsızlığı

---

### 14. Hata Yönetimi Eksikliği — Repository

**Dosya:** `src/infrastructure/persistence/ChromeStorageTodoRepository.ts`

```typescript
async getAll(): Promise<Todo[]> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([SYNC_TODOS], (result) => {
      resolve((result[SYNC_TODOS] as Todo[]) || []);
    });
  });
}
```

**Sorun:** `chrome.storage.sync.get` başarısız olursa (chrome.runtime.lastError), hata yakalanmaz ve promise sonsuza kadar pending kalır.

**Çözüm:** `chrome.runtime.lastError` kontrolü eklenmeli.

---

## 🟢 DÜŞÜK ÖNEMLİ İHLALLER

### 15. DeleteTodoUseCase ve MoveTaskUseCase İncelemesi

**Dosya:** `src/application/use-cases/todo/DeleteTodoUseCase.ts`  
**Dosya:** `src/application/use-cases/todo/MoveTaskUseCase.ts`

Bu dosyalar da aynı pattern'i takip ediyor — syncPort ve syncRepo bağımlılıkları ile aynı magic string'leri kullanıyor olmaları muhtemel.

### 16. Service Katmanında Singleton Pattern

**Dosyalar:**
- `src/services/kpssService.ts`
- `src/services/aiChatService.ts`

**Sorun:** Service katmanı hem singleton instance hem de factory fonksiyonu (`createKpssService`, `createAiChatService`) export ediyor. Bu:
- İkili bir API yüzeyi oluşturur
- Hangi pattern'in kullanılacağı konusunda kafa karışıklığı yaratır

---

## 📊 ÖZET TABLOSU

| # | İhlal | Tür | Seviye | Dosya |
|---|-------|-----|--------|-------|
| 1 | Domain → Utils bağımlılığı | Clean Architecture | 🔴 Kritik | `KpssCalculatorService.ts` |
| 2 | Domain → Utils bağımlılığı | Clean Architecture | 🔴 Kritik | `detoxMotivationalService.ts` |
| 3 | Presentation → Infrastructure | Clean Architecture | 🔴 Kritik | `useTodos.ts` |
| 4 | Presentation → Infrastructure | Clean Architecture | 🔴 Kritik | `useAppInit.ts` |
| 5 | Module-level side effect | Clean Code | 🔴 Yüksek | `kpssService.ts` |
| 6 | Module-level side effect | Clean Code | 🔴 Yüksek | `aiChatService.ts` |
| 7 | Module-level side effect | Clean Code | 🔴 Yüksek | `useTodos.ts` |
| 8 | God Function (218 satır) | Clean Code | 🔴 Yüksek | `aiChatService.ts` |
| 9 | God Component (372 satır) | Clean Code | 🔴 Yüksek | `App.tsx` |
| 10 | Duplicate code (SyncPort) | Clean Code | 🟡 Orta | `useTodos.ts` / `useAppInit.ts` |
| 11 | Magic strings | Clean Code | 🟡 Orta | `AddTodoUseCase.ts` / `ToggleTodoUseCase.ts` |
| 12 | UI logic in hook | Clean Architecture | 🟡 Orta | `useTodos.ts` |
| 13 | Tip import tutarsızlığı | Clean Code | 🟡 Orta | `App.tsx` / `KpssCalculatorService.ts` |
| 14 | Hata yönetimi eksik | Clean Code | 🟡 Orta | `ChromeStorageTodoRepository.ts` |
| 15 | Singleton + Factory ikilemi | Clean Code | 🟢 Düşük | `kpssService.ts` / `aiChatService.ts` |

---

## 🎯 ÖNERİLEN DÜZELTMELER (Öncelik Sırasına Göre)

### Hemen Yapılması Gerekenler (Kritik):
1. **Domain katmanından `getTranslation` ve `@/types/types.ts` import'larını kaldırın.** Domain servisleri ham veri döndürmeli, formatlama presentation'a bırakılmalı.
2. **`useTodos.ts` ve `useAppInit.ts`'ye dependency injection uygulayın.** Repository'ler ve API'ler parametre olarak geçirilmeli.

### Kısa Vadede Yapılması Gerekenler (Yüksek):
3. **Module-level side effect'leri kaldırın.** Singleton'ları lazy initialization ile oluşturun veya DI container kullanın.
4. **`callAIConfigured` fonksiyonunu** her AI provider için ayrı fonksiyonlara bölün.
5. **`App.tsx`'i** daha küçük component'lere bölün.

### Orta Vadede Yapılması Gerekenler:
6. **SyncPort factory** oluşturarak duplicate code'u kaldırın.
7. **Magic string'leri** sabitlere taşıyın.
8. **UI operasyonlarını** (export/import backup) hook'tan component'e taşıyın.
9. **Repository'lere** hata yönetimi ekleyin.
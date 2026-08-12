# Hafıza Şablonları i18n Entegrasyonu & AI Prompt Modülerleştirme Planı

Bu plan, `memory.md` hafıza başlıklarının `i18n` dil sistemine (Türkçe / İngilizce) tam uyumlu hale getirilmesini ve kalan AI prompt/şablon modüllerinin `prompts/` altına taşınarak kod ile metin sorumluluklarının tam ayrıştırılmasını kapsar.

## User Review Required

> [!NOTE]
> `memory.md` başlıkları kullanıcının aktif diline (TR / EN) göre dinamik oluşturulacaktır. Mevcut hafıza belgesi olan kullanıcılarda var olan başlık korunacak, yeni eklemelerde seçili dil başlığı kullanılacaktır.

## Proposed Changes

### 1. i18n Çoklu Dil Desteği (`src/utils/translations/`)

#### [MODIFY] [aichat.ts (tr)](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Done/chrome-extension/src/utils/translations/tr/aichat.ts)
#### [MODIFY] [aichat.ts (en)](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Done/chrome-extension/src/utils/translations/en/aichat.ts)
- `memory_main_header` ve `memory_section_header` çeviri anahtarlarını ekle.
  - TR: `"## 💡 AI Tarafından Öğrenilen Bilgiler"`
  - EN: `"## 💡 Learned Personal Facts by AI"`

---

### 2. Domain Sabitleri & Servis Güncellemesi (`src/domain/constants/` & `src/services/aichat/`)

#### [MODIFY] [memoryConstants.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Done/chrome-extension/src/domain/constants/memoryConstants.ts)
- `formatMemoryUpdate(currentMemory, cleanFact, lang)` fonksiyonunu dil parametresi alacak şekilde güncelle.

#### [MODIFY] [actionExecutor.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Done/chrome-extension/src/services/aichat/actionExecutor.ts)
- `handleUpdateMemoryFromAI` çağrısında kullanıcının etkin dil bilgisini ileterek i18n uyumlu metin üret.

---

### 3. Kalan AI Prompt Şablonlarının Modülerleştirilmesi (`src/services/`)

#### [NEW] [system-prompt.md](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Done/chrome-extension/src/services/aichat/prompts/system-prompt.md)
- `systemPrompt.ts` içindeki ham İngilizce/Türkçe AI sistem yönergelerini bağımsız `.md` dosyasında modülerleştir.

#### [MODIFY] [systemPrompt.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Done/chrome-extension/src/services/aichat/systemPrompt.ts)
- `system-prompt.md?raw` import ederek dinamik bağlam (internet arama + hafıza) birleştirmesini sağla.

#### [MODIFY] [stockPrompts.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Done/chrome-extension/src/services/stock/stockPrompts.ts)
- BİST analiz ve seans öncesi prompt şablonlarını `src/services/stock/prompts/` altına taşıyarak tam modüler yapıya kavuştur.

---

## Verification Plan

### Automated Tests
- `npx vitest run tests/aiCommandParser.test.ts`
- `npx tsc --noEmit`
- `node scripts/analyzeResponsibility.mjs`
- `npm run build`

### Manual Verification
- Uzantı dilini İngilizce ve Türkçe olarak değiştirip AI sohbetinden hafıza güncelleme (`update_memory`) aksiyonunu tetikleyerek `memory.md` başlıklarının seçili dilde üretildiğini doğrulamak.

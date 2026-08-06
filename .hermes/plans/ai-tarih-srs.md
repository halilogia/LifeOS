# AI Tarih SRS — Plan

## Amaç
Mevcut KPSS SRS'yi (sabit `kpssOsymHistoryFlashcards` kaynaklı) sil, yerine **local AI üretimli** tarih flashcard SRS koy. Arayüz aynı kalır.

## Gereksinimler (kullanıcı)
- AI her üretimde **5 kart** oluştursun
- Kartlar **local'e** kaydedilsin (local-first, bulut manuel — Drive backup)
- **Kart arayüzü değişmesin** (`KpssSrsCard`, `KpssSrsTab`, SM2 dereceleri korunur)
- **Tarih dersine şimdiden 5 kart** oluştur (boş görünmesin)
- Genel SRS (İngilizce kelime) **dokunulmaz**

## Kaynak
`callAIConfigured` (reuse) + `getAIConfigFromStorage` — Ollama/OpenRouter/Gemini. `subject-tarih.md` prompt kuralı + yeni `ai-srs-tarih.md` (JSON şema).

## Adımlar
1. **`src/services/kpss/prompts/ai-srs-tarih.md`** — yeni prompt: AI'dan 5 flashcard `{question, answer, hint, category}` JSON dizisi üretsin. subject-tarih.md kuralını içerir.
2. **`src/services/kpss/kpssSrsService.ts`** (yeniden yaz):
   - `generateAiCards(subject, count=5)` → `callAIConfigured` → JSON parse → `chrome.storage.local["kpssAiSrsCards"]`'a kaydet
   - `loadSrsQueue`: local `kpssAiSrsCards`'tan universe kur, SM2 ile queue hazırla (mevcut `prepareSRSQueue`/`createInitialSRSWord`).
   - `loadSrsQueue` boşsa → otomatik 5 kart üret (tarih).
   - `saveSrsReview` aynı (SM2).
3. **`src/components/KpssView.tsx`**:
   - `flashcardsUniverse` başlangıcı `kpssOsymHistoryFlashcards` yerine local AI kartları (aslında loadSrsQueue'dan dolacak)
   - "AI Kart Üret" butonu (KpssSrsTab'a prop) — 5 yeni kart üretir, queue'yu yeniler
   - `srsChapter` filtreleme → AI kart homogeneous categories yerine hepsi "Tarih"
4. **`src/components/kpss/topics/KpssSrsTab.tsx`** — "AI Kart Üret" butonu ekle (aşağıda mevcut kart alanına), `onGenerate` prop.
5. **`src/components/kpss/srs/KpssSrsCard.tsx`** — değişmez (arayüz korunur).
6. **translate** tr/en kpss.ts — `kpss_srs_generate` ("AI Kart Üret"), `kpss_srs_generating`, `kpss_srs_generated`.
7. **Sil** mevcut sabit flashcard'a olan doğrudan bağı: `KpssView` import'u `kpssOsymHistoryFlashcards` kaldır, `kpssSrsService.loadSrsQueue` AI kartlardan beslenir.

## Not: SM2 + i18n
- SM2 mantığı (`SrsService`) korunur — sadece kart kaynağı AI.
- `KpssFlashcard.wordId` → kart.id, queue aynı şekilde çalışır.

## Verify
- `npx tsc --noEmit` 0 hata
- `npm run build` geçer
- eslint script'e özellikle `no-turkish-literals` (prompt dosyası Türkçe — `.md`, kod değil, OK)
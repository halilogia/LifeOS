# God File Refactoring Plan — 4 Kritik Dosya

## Amaç

AGENTS.md 6.1 "Tek Sorumluluk Testi"ne göre birden fazla iş yapan 4 dosyayı bölmek. Sıfır kayıp protokolü (5.5): tüm fonksiyonlar, edge case'ler, hata sarmalayıcılar, yan etkiler %100 korunur.

## Tüketici Haritası (araştırma sonucu)

| God File | Tüketiciler |
|---|---|
| `useBist.ts` (391) | `BistView.tsx` (tek tüketici) |
| `domAgentEngine.ts` (498) | `contentMain.ts` (init), `useSidePanelChat.ts` (PageContext tip), `SidePanelTabBar.tsx` (tip), `SidePanelChips.tsx` (tip) |
| `useSidePanelChat.ts` (520) | `SidePanelApp.tsx` (tek tüketici) |
| `kpssQuizStore.ts` (423) | `useKpssQuiz.ts` (facade — store API yüzeyini kullanır) |

**Kritik karar:** Tüm bölmeler **dışa dönük API yüzeyini aynen korur** — tüketici dosyaları (BistView, SidePanelApp, useKpssQuiz, contentMain) ya hiç değişmez ya da sadece import yolu değişir. Böylece zero-loss garantisi basitçe doğrulanır: tüketici derleniyorsa API bozulmamıştır.

---

## 1. `useBist.ts` → 6 modüle böl (en yüksek öncelik)

**Mevcut:** portfolio CRUD + watchlist CRUD + rules + trading (P/L) + cash + polling + 7 modal state + hesaplamalar — hepsi tek hook'ta.

**[NEW]** `src/presentation/hooks/bist/usePortfolio.ts`
- Portfolio state + `handleSaveStock`, `handleDeleteStock`, `handleQuickAddStock`
- Portföy toplam hesaplamaları (`totalPortfolioValue`, `totalPortfolioCost`, `dailyProfitLossTotal`, `dailyProfitLossPercent`, `quoteMap`)
- `loadData`'nın portfolio kısmı

**[NEW]** `src/presentation/hooks/bist/useWatchlists.ts`
- Watchlist state + `handleCreateWatchlist`, `handleDeleteWatchlist`, `handleToggleSymbolInWatchlist`, `activeWatchlistId`

**[NEW]** `src/presentation/hooks/bist/useStockRules.ts`
- Rules state + `handleSaveRule`, `handleDeleteRule`, `activeRulesCount`, kural değerlendirme tetikleyicisi

**[NEW]** `src/presentation/hooks/bist/useStockTrading.ts`
- Satış akışı: `sellModal` state, `handleSellStock`, `handleConfirmSell` (P/L hesabı + trade history + nakit güncelleme)
- `tradeHistory`, `cashBalance`, `totalWealth`, `updateCashBalance`

**[NEW]** `src/presentation/hooks/bist/useBistQuotes.ts`
- `quotes` state + 30sn polling + `loadData`'nın fetch kısmı + kural değerlendirme (alert log yazma)

**[MODIFY]** `src/presentation/hooks/useBist.ts` → **kompozisyon tuvali**
- 5 alt-hook'u çağırır, aynı return objesini döner (tüketici `BistView.tsx` **hiç değişmez**)
- Modal state'ler (showAddModal, ruleModalSymbol vb.) ve `loadData` orkestrasyonu burada kalır

**Sıra:** önce alt-hook'lar, sonra tuval. Her adımda tsc.

---

## 2. `domAgentEngine.ts` → 3 modüle böl

**Mevcut:** page context çıkarıcı + element tarayıcı (bounding box overlay) + action executor (click/type/scroll/extract/highlight) tek dosyada.

**[NEW]** `src/content/agent/pageContextExtractor.ts`
- `getPageContext()`, `PageContext`, `PageElementInfo` tipleri + metin çıkarma + interactive element taraması

**[NEW]** `src/content/agent/elementScanner.ts`
- Element hedefleme, bounding box overlay, highlight mantığı

**[NEW]** `src/content/agent/actionExecutor.ts`
- `executeAgentAction()`, `AgentActionPayload` tipi + click/type/scroll/extract/highlight uygulayıcıları

**[MODIFY]** `src/content/agent/domAgentEngine.ts` → **barrel re-export**
- `export * from "./pageContextExtractor.js"` vb. — tüm mevcut importlar (contentMain, useSidePanelChat, SidePanelTabBar, SidePanelChips) **hiç değişmez**

**Sıra:** extractor → scanner → executor → barrel. Her adımda tsc.

---

## 3. `useSidePanelChat.ts` → 3 modüle böl

**Mevcut:** chat state + AI çağrı + agent action + ses tanıma + session storage + chip işleyiciler tek hook'ta.

**[NEW]** `src/sidepanel/useChatSession.ts`
- Session key yönetimi + `loadChatSessionMessages`/`saveChatSessionMessages`/`clearChatSessionMessages` çağrıları + `activeSessionKey` state

**[NEW]** `src/sidepanel/useVoiceInput.ts`
- `toggleVoiceInput`, `isListening`, `startSpeechRecognition` sarmalayıcı + transcript işleme

**[NEW]** `src/sidepanel/useAgentBridge.ts`
- `agentStatus`, `pageContext` state + `refreshPageContext` + `formatActionExecutionSummary` + agent action gönderme

**[MODIFY]** `src/sidepanel/useSidePanelChat.ts` → **kompozisyon tuvali**
- 3 alt-hook'u çağırır, `UseSidePanelChatReturn` aynen döner (tüketici `SidePanelApp.tsx` **hiç değişmez**)
- `handleSendMessage`, `handleChipClick`, AI çağrı akışı burada kalır (bunlar chat'in özü)

**Sıra:** session → voice → agent → tuval. Her adımda tsc.

---

## 4. `kpssQuizStore.ts` → AI çağrısını store'dan çıkar

**Mevcut:** store içinde AI soru üretimi (fetch/AI provider çağrısı) — AGENTS.md 5.1 ihlali (store = state, service = network).

**[NEW]** `src/services/kpss/kpssQuizAiService.ts`
- AI soru üretim mantığı store'dan taşınır (mevcut `kpssAiService`'teki quiz üretim fonksiyonlarıyla birleştirilir veya oraya eklenir)

**[MODIFY]** `src/presentation/store/kpssQuizStore.ts`
- Store içindeki AI çağrısı `kpssQuizAiService`'e delege eder
- **Store API yüzeyi aynen kalır** — `useKpssQuiz.ts` facade **hiç değişmez**
- Ayrıca eslint uyarıları (Türkçe literal) temizlenir — mesajlar `getTranslation`'a taşınır

**Sıra:** service → store delege. tsc.

---

## Doğrulama Planı

Her dosya bölümünden sonra:
- `npx tsc --noEmit`
- Bölüm sonunda: `npm run build` + `npx prettier --write src` + `npx eslint src` (0 error)
- `node scripts/findDeadFiles.mjs` → eski god file'lar re-export/kompozisyon olarak kaldığı için 0 ölü dosya
- `src/ARCHITECTURE.md` güncellenir (yeni klasörler + modüller)

## Open Questions

> [!IMPORTANT]
> 1. **Kapsam**: 4 dosyanın hepsini tek seferde mi yapayım, yoksa önce `useBist.ts` (en büyük değer) ile başlayıp onayını alıp devam mı edeyim?
> 2. **domAgentEngine barrel**: Mevcut dosyayı koruyup re-export yapmak (tüketici değişmez) vs. doğrudan import'ları yeni dosyalara yönlendirmek (daha temiz ama 4 dosyada import değişir) — hangisi?
> 3. **kpssQuizStore**: Store'daki AI çağrısı mevcut `kpssAiService` ile birleştirilsin mi, yoksa ayrı `kpssQuizAiService.ts` mi olsun?

## Riskler

- **useBist**: Alt-hook'lar arası paylaşılan state (portfolio + cash birlikte güncelleniyor — satışta ikisi birden). Alt-hook'lar parametre/geri çağrı ile birbirine bağlanmalı. En riskli bölme.
- **useSidePanelChat**: handleSendMessage uzun async zincir — parçalama sırasında closure'ların canlı kalması gerekir.
- **kpssQuizStore**: Store configure() callback-DI deseni kullanıyor — AI servisi taşınırken callback akışı bozulmamalı.

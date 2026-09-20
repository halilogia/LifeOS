# Görev Takibi

## Aktif İş

### Log Şişmesi + MCP Hatası + Ayarlar Okunabilirliği + AudioContext + Worktree Temizliği — ✅ TAMAMLANDI (2026-09-21)

**Tur 1 — bildirilen 5 sorun** (`commit 411eccf`)
- [x] Ayarlar'da okunmayan yazılar: `AppSettingsGroup.tsx` 4 tanımsız çeviri anahtarı → mevcut doğru anahtarlara bağlandı
- [x] Kök neden: `SettingsDrawer.tsx:177` `translations[lang]` (Proxy değil) → eksik anahtar `undefined` → Preact boş render
- [x] Tanımsız `--accent` token'ı: `base.css` + `ai-chat.css` (5 kullanım) → `--accent-color` + hardcoded indigo → `rgba(var(--accent-color-rgb))`
- [x] AudioContext uyarısı: `volumeBooster.ts` → `hasUserGesture` gate + eksik `currentMultiplier === 1.0` guard'ı
- [x] Log şişmesi (a): `logger.ts` her satırda 500'lük diziyi baştan yazıyordu → 200ms coalescing + `error` anında flush
- [x] Log şişmesi (b): `rssSyncHandler.ts` MV3 worker her başlayışında log atıyordu → `info`→`debug`; `debug` artık console-only, kalıcı değil
- [x] Ring buffer 500→300 (`logger_entries`), 500→150 (`content_logs`)
- [x] `data-agent-kit` MCP: named pipe yok + kimlik dosyaları yok → bağlanması imkânsızdı; ölü kayıt `mcp_config.json`'dan kaldırıldı (yedek alındı)

**Tur 2 — aynı hata sınıfının repoda taranması** (`commit b535a2a`)
- [x] Proxy tuzağı: `getTranslation()` eksik anahtarda anahtar adını döndürüyor → `t.x || "fallback"` asla çalışmıyor
- [x] `PomoTimerPanel.tsx` (2 blok), `RoutineStreakCard.tsx`, `GameAssetsFilterBar.tsx` → doğru anahtarlara bağlandı
- [x] `BlockerUI.ts` 16 tanımsız anahtar → `tr/detox.ts` + `en/detox.ts`'e gerçek çeviriler eklendi
- [x] `prayer.css` + `SrsView.tsx` tanımsız `--accent-light` → `--accent-color`
- [x] `scripts/i18nHealthCheck.mjs` [NEW]: bu hata sınıfını yakalayan denetleyici (1325 anahtar · 541 dosya · 0 eksik)
- [x] `src/ARCHITECTURE.md`: bölüm 7 (`scripts/` klasörü) eklendi, çift `ArcadeView` satırı silindi

**Tur 3 — ölçüm (düzeltilmedi, karar bekliyor)**
- [x] Hardcoded hex borcu ölçüldü: **144 gerçek ihlal** (77 CSS + 67 TSX). `--accent-color` hiçbir yerde override edilmediği için şu an **latent** — görünür bozukluk yok, ama token değiştirilince 144 yer güncellenmez
- [x] Meşru bulunanlar: `domain/constants/**` (38, renk verisi), `content/**` (18, shadow DOM'da token yok)

**Repo temizliği**
- [x] `.kilo/worktrees/miniature-flock` git worktree kaldırıldı (`08f22da`, detached HEAD). Silmeden önce doğrulandı: çalışma ağacı temiz, takip edilmeyen dosya yok, `main`'in atası
- [x] `git worktree prune` + `.kilo/` klasörü silindi. `.git/worktrees/` temiz, tek worktree kaldı (`main`)
- [x] Uyarı: Kilo Code eklentisi kurulu (`kilocode.kilo-code-7.7.5`) → tekrar çalıştırılırsa `.kilo/` yeniden oluşur

**Doğrulama**
- [x] `tsc --noEmit` = 0 · `npm run build` başarılı (newtab + background + content)
- [x] `eslint` (değişen 9 dosya) = 0 error
- [x] `node scripts/findDeadFiles.mjs` = Toplam 0 dosya
- [x] `node scripts/i18nHealthCheck.mjs` = ✅ 0 eksik anahtar
- [x] XSS kontrolü: `BlockerUI.ts` kullanıcı alıntıları `escapeHtml()`'den geçiyor (temiz)

**Açık kararlar (yapılmadı — kullanıcı onayı bekliyor)**
- [ ] Hardcoded hex borcu (144 ihlal) — ayrı planlama turu gerektirir
- [ ] 31 pre-existing repo-wide eslint error + 2383 warning
- [ ] 3 boş klasör: `src/services/{aichat,kpss,stock}/prompts`
- [ ] `contentLogger.ts` merkezi logger'a birleştirme (esbuild kısıtı doğrulanmalı)
- [ ] `stockPrompts.ts` İngilizce anahtarları (AI prompt metni — bırakmak makul)

---

### Plan 07 — Türkçe Karakter Fix + Obsidian Uygulama Penceresi + Notlardan Özel SRS — ✅ TAMAMLANDI (2026-08-03)
- [x] Türkçe karakter hataları temizlendi (`KpssWikiEditor`, `KpssWikiReader`, `KpssWikiSidebar`, `KpssSrsCard`, `KpssNotesDashboard`, `KpssView`) + `tr.ts` / `en.ts` güncellendi
- [x] Izole klasör: `src/components/kpss/obsidian/` (`KpssObsidianStudioModal.tsx`, `KpssObsidianSplitEditor.tsx`)
- [x] "Uygulamada Aç" butonu entegre edildi — `chrome.windows.create({ type: 'popup', width: 1440, height: 900 })` ile bağımsız masaüstü çerçevesiz pencere modu
- [x] `App.tsx`: `view=obsidian` URL parametresi ile bağımsız Obsidian uygulama penceresi render desteği
- [x] `kpssSrsService.ts`: kullanıcının kendi KPSS ders notlarından (`Kavram : Tanım` ve `Başlık : Özet`) dinamik SRS kartları çıkaran `extractCardsFromUserNotes()` ve `loadSrsQueue(sourceMode)` eklendi
- [x] `KpssView.tsx`: SRS Kaynak Seçici sekmesi eklendi (`📌 Tüm Kartlar` | `📚 Hazır Kartlar` | `📝 Sadece Benim Notlarım`)
- [x] tsc + build (644ms) + eslint (0 error) + findDeadFiles (0) + ARCHITECTURE.md + task.md doğrulandı
- [x] `StockCashBalance` tipi + `SYNC_STOCK_CASH` key + `SYNC_ALL_KEYS`
- [x] Repo `getCashBalance/setCashBalance` — chrome.storage.sync
- [x] useBist: cash state, alışta -alış×lot, satışta +satış×lot, `totalWealth = cash + hisse`
- [x] `PortfolioSummaryCard`: Toplam Varlık kartı (Nakit + Hisse Değeri kırılımı, kalem ikonu, görünmez hizalama kalemi)
- [x] `CashBalanceModal` [NEW]: ekleme modu (mevcut + yeni = toplam önizleme)
- [x] `WealthDistributionModal` [NEW]: SVG pasta grafiği (dasharray donut → arc path → çift katman renk; Preact gradient render edemiyor)
- [x] BistView: Toplam Varlık kartına tıkla → dağılım modalı (stopPropagation'lı)
- [x] WP/Telegram köprü toggle'ları — varsayılan KAPALI
  - keys, AppSettings, ISettingsRepository, ChromeStorageSettingsRepository (default false), UC, useSettings
  - GeneralSettingsTab 2 toggle + BridgeToggles [NEW] + AppSettingsGroup [NEW] (GST 447→84)
  - contentMain: sadece açıksa bridge init
  - i18n tr/en `settings_whatsapp_bridge` + `settings_telegram_bridge`
- [x] Kural düzeltmeleri: BistView 349→262 (BistPortfolioTab 168 [NEW]), GST 447→84
- [x] tsc + build + eslint (0) + findDeadFiles (0) + ARCHITECTURE.md + task.md güncellendi

### Plan 06 — SRS wordType Düzeltmesi — ✅ TAMAMLANDI (2026-08-02)
- [x] AuraLingo `srs.logic.ts` karşılaştırıldı — `SrsService.ts` 1:1 kopya, SM-2 mantığı aynı ✅
- [x] Bug: wordType hep `"vocabulary"` kaydediliyordu (fiil/phrasal/idiom yanlış tipleniyordu)
- [x] `resolveWordType()` eklendi — level'dan tip çözer (idiom→idiom, phrasal→phrasal, irregular/v1/IRREGULAR VERB→verb, gerisi→vocabulary)
- [x] Yeni kartlar doğru tiple; eski progress kayıtları da `enrichedProgress`'te gerçek tipe düzeltiliyor
- [x] tsc + build (642ms) + eslint (0) doğrulandı

### Klasör Düzenleme + Sync Düzeltmeleri — ✅ TAMAMLANDI (2026-08-01)
- [x] `components/kpss/` 23 dosya bölündü → quiz/ (8) + wiki/ (4) + srs/ (1) + kök (10)
- [x] MathRenderer wiki/ → quiz/ taşındı (LaTeX'i quiz kullanıyor, wiki değil — kullanıcı yakaladı)
- [x] `services/` 24 → 13 kök + kpss/ (8) + stock/ (3)
- [x] `infrastructure/persistence/` 15 → repositories/ altına
- [x] IDE alias import'ları güncellemedi — 17 bozuk import elle düzeltildi
- [x] KpssNotesDashboard `.ts` uzantı hatası düzeltildi
- [x] AGENTS.md 6.5'e "Kök vs Klasör Kararı" kuralı eklendi
- [x] SyncGoogleTasksUseCase: todo güncellemeleri Tasks'a push (updateTask) eklendi
- [x] RestoreFromDriveUseCase: id-bazlı merge eklendi (üzerine yazma yok)
- [x] 2 boş klasör silindi (use-cases/pomodoro, presentation/view-models)
- [x] findDeadFiles.mjs boş klasör + public asset kontrolü eklendi
- [x] tsc + build + eslint (0 error) + findDeadFiles (0) doğrulandı
- [x] ARCHITECTURE.md güncellendi

### Plan 04 — Harici AI Quiz Overlay Paneli — ✅ TAMAMLANDI (2026-08-01)
- [x] `quizOptionInjector.ts` SİLİNDİ (buton injector — kırılgan yapı)
- [x] `src/content/quiz/quizPanel.ts` oluşturuldu (Shadow DOM overlay panel)
- [x] Trigger: sağ altta "Quiz Moduna Geç" butonu — quiz formatı algılanınca belirir
- [x] Overlay: karanlık glassmorphism, %90 ekran, soru kartları, şık butonları
- [x] Shadow DOM izolasyonu — site CSS'i paneli bozamaz
- [x] Esnek regex: `A.` `A)` `* A)` `**A)**` (kullanıcı önerisi)
- [x] Debounce 1.8s — AI yazımı bitince parse (kullanıcı önerisi)
- [x] `$...$` LaTeX stili — KaTeX bundle'a eklenmedi (kullanıcı önerisi)
- [x] İstatistik kaydı: `lifos_quiz_stats` (test sayısı + doğru/toplam, içerik yok)
- [x] `contentMain.ts` 7. modül olarak `initQuizPanel` — try/catch izolasyonlu
- [x] tsc + eslint (0 error, 4 warn — mevcut content script deseniyle tutarlı) + build doğrulandı
- [x] knowledge.md + task.md güncellendi

### Plan 03 — Harici AI Quiz Şık Seçimi — ✅ TAMAMLANDI (2026-08-01, Plan 04 ile değiştirildi)
- [x] `src/content/quiz/quizOptionInjector.ts` oluşturuldu (Gemini/ChatGPT/Claude A)-E) buton enjeksiyonu)
- [x] `contentMain.ts` 7. modül olarak eklendi
- [x] Site seçicisiz (desen tabanlı) — kırılganlık önlemi
- [x] Idempotent + radio grup davranışı
- [x] innerHTML yok — DOM-safe (AGENTS.md 4.4)
- [x] eslint + tsc + build doğrulandı (571ms, 0 hata/uyarı)
- [x] knowledge.md güncellendi

### Konu Testi: HER ZAMAN AI Üretimi — ✅ TAMAMLANDI (2026-08-01)
- [x] `fetchQuizFromAI` yeniden yazıldı — çıkmış arşiv beslemesi KALDIRILDI
- [x] Exclude: geçmiş çözülen AI soruları (`pastQuizzes`) tekrar sorulmaz
- [x] Few-shot: geçmiş sorular örnek olarak gönderilir (kalite)
- [x] İlk soru bekle-senkron, kalan arka planda
- [x] `getLocalQuestionsForTopic` import kaldırıldı
- [x] tsc + eslint + build doğrulandı (659ms, 0 error)
- [x] knowledge.md güncellendi (yeni davranış)

### Plan 02 — KPSS Quiz Prompt İyileştirmesi — ✅ TAMAMLANDI
- [x] Çeldirici kuralı ters çevrildi (tamamen yanlış → düşürücü çeldirici)
- [x] Merkezi uydurma yasağı eklendi (savaş/antlaşma/kurum/kişi/olay)
- [x] Zorluk dağılımı eklendi (1 kolay + 2 orta + 2 zor)
- [x] Soru tipi dağılımı eklendi (2 öncüllü + 1 paragraf + 1 kavram + 1 kronoloji)
- [x] Cevap anahtarı dağılımı eklendi (A-E dengeli)
- [x] Kazanım tekrarı yasağı eklendi
- [x] Şık dengesi + ipucu yasağı eklendi
- [x] Açıklama kuralı eklendi (her çeldiricinin neden yanlış olduğu)
- [x] Tarih kronoloji kontrolü eklendi (çeldirici = bilinçli, doğru cevap = asla)
- [x] tsc + eslint + build doğrulandı (478ms, 0 error)
- [x] knowledge.md dolduruldu (2-akış mimarisi + prompt kuralları)

### View Bölme Temizliği (Plan 01) — ✅ TAMAMLANDI 11/11
- [x] 11 view ≤300 satır (Prayer, Pomodoro, Bist, Calendar, FreeGames, Eisenhower, Hifiz, Willpower, Notes, Srs, List)
- [x] 10 yeni hook, TodoListItem, dateUtils, eisenhower.css

## Tamamlanan İşler

### 2026-08-01
- [x] Plan 02 uygulandı — kpssPrompts.ts 10 yeni ÖSYM kuralı
- [x] brain/knowledge.md dolduruldu (KPSS quiz mimarisi, çeldirici yönü, LaTeX durumu)
- [x] Hata raporlama sistemi (logger storage katmanı + ErrorReportSettingsTab + downloads)
- [x] Çeviri popup fix (async onMessage listener → sync + return true)
- [x] CSS izolasyonu (cssCodeSplit: true)
- [x] Scrollbar + üst şerit düzeltmeleri
- [x] KPSS konuları görünmüyor fix (kpss-container height:100% kaldırıldı)
- [x] ARCHITECTURE.md canlı mimari harita oluşturuldu
- [x] AGENTS.md bölüm 7 (görsel değişim raporlama) + bölüm 8 (brain protokolü)
- [x] KpssView 644 → 427 (useKpssQuiz + KpssProgressSection çıkarıldı)
- [x] AGENTS.md hayali core/ referansları düzeltildi
- [x] AGENTS.md bölüm 8 güncellendi (decisions.md kaldırıldı — kullanıcı isteği)
- [x] AGENTS.md bölüm 7.3 walkthrough kuralı kaldırıldı (kullanıcı isteği)
- [x] brain/agents.md silindi — `.agents/AGENTS.md` tek kaynak (kullanıcı isteği)
- [x] PrayerView bölme (usePrayer + prayerConstants + PrayerCityForm)
- [x] PomodoroView bölme (usePomodoro)
- [x] BistView bölme (useBist)
- [x] CalendarView bölme (useCalendar)
- [x] FreeGamesView bölme (useFreeGames)
- [x] EisenhowerView bölme (useEisenhower + eisenhower.css)
- [x] HifizView bölme (useHifiz)
- [x] WillpowerView bölme (useWillpower)
- [x] NotesView bölme (useNotes)
- [x] SrsView bölme (useSrs)
- [x] ListView bölme (TodoListItem + dateUtils)

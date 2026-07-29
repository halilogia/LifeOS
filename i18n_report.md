# i18n Dönüşüm Raporu

> Oluşturulma: 29.07.2026 11:05:19
> Komut: `node scripts/detect_i18n_issues.cjs`

---

## 📊 Özet

| Kategori | Adet |
|----------|------|
| Ternary kalıpları (`lang === "tr" ?`) | 199 |
| Hardcoded Türkçe string'ler | 724 |
| tr.ts'de olup en.ts'de OLMAYAN anahtarlar | 0 |
| en.ts'de olup tr.ts'de OLMAYAN anahtarlar | 0 |
| Toplam tr.ts anahtar sayısı | 469 |
| Toplam en.ts anahtar sayısı | 469 |

---

## 🔄 Ternary Kalıpları (i18n'e taşınması gerekenler)

Bu kalıplar `t.anahtar_adi` şeklinde değiştirilmeli.

### 📄 `src\App.tsx` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 125 | `Detay` | `Detail` |

### 📄 `src\background\handlers\runtimeMessageHandler.ts` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 24 | `tr` | `en` |

### 📄 `src\components\aichat\AiChatHeaderBar.tsx` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 51 | `Çevrimdışı/Komut Modu` | `Offline Command Mode` |

### 📄 `src\components\aichat\AiChatMessageItem.tsx` (3 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 247 | `Düşünme Süreci` | `Thinking Process` |
| 299 | `Kopyalandı!` | `Copied!` |
| 317 | `Kopyalandı` | `Copied` |

### 📄 `src\components\AIChatView.tsx` (5 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 72 | `tr-TR` | `en-US` |
| 95 | `tr-TR` | `en-US` |
| 153 | `tr-TR` | `en-US` |
| 241 | `tr-TR` | `en-US` |
| 302 | `tr-TR` | `en-US` |

### 📄 `src\components\CalendarView.tsx` (2 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 202 | `tr-TR` | `en-US` |
| 249 | `tr-TR` | `en-US` |

### 📄 `src\components\DatePicker.tsx` (2 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 142 | `Son Tarih` | `Due Date` |
| 273 | `Temizle` | `Clear` |

### 📄 `src\components\EisenhowerView.tsx` (5 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 203 | `Eisenhower Matrisi` | `Eisenhower Matrix` |
| 236 | `Hemen Yap` | `Do First` |
| 266 | `Planla` | `Schedule` |
| 299 | `Delege Et` | `Delegate` |
| 332 | `Ele / Ertele` | `Eliminate` |

### 📄 `src\components\freegames\FreeGamesFilterBar.tsx` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 93 | `Hızlı Talep Sayfaları:` | `Quick Claim Pages:` |

### 📄 `src\components\hifiz\HifizYeterliklerCard.tsx` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 29 | `Müfredat İlerlemesi` | `Checklist Progress` |

### 📄 `src\components\hifiz\HifizYeterlikModal.tsx` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 45 | `Anladım` | `Got it` |

### 📄 `src\components\KanbanView.tsx` (2 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 98 | `Sola Taşı` | `Move Left` |
| 117 | `Sağa Taşı` | `Move Right` |

### 📄 `src\components\kpss\KpssAutoPlannerCard.tsx` (9 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 86 | `Orta Düzey Çalışma Hızı` | `Moderate Study Pace` |
| 91 | `İdeal Çalışma Hızı` | `Optimal Study Pace` |
| 158 | `Sistem Nasıl Çalışır?` | `How does it work?` |
| 277 | `Çalışılıyor` | `Working` |
| 290 | `Başlanmadı` | `Not Started` |
| 322 | `Kalan Gün:` | `Days Left:` |
| 327 | `Kalan Konu:` | `Topics Left:` |
| 332 | `Günlük Hız:` | `Daily Rate:` |
| 527 | `Kapat` | `Close` |

### 📄 `src\components\kpss\KpssDailyStatsCard.tsx` (9 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 120 | `İzlenen Video` | `Videos Watched` |
| 202 | `İlerleme Grafiği` | `Progress Chart` |
| 223 | `Tümü` | `All` |
| 240 | `Soru` | `Questions` |
| 257 | `Video` | `Videos` |
| 311 | `Çizgi` | `Line` |
| 328 | `Sütun` | `Bar` |
| 342 | `Kaydedilen Günlük Veriler:` | `Saved Daily Logs:` |
| 370 | `Bu günü sil` | `Delete day` |

### 📄 `src\components\kpss\KpssHeaderBar.tsx` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 40 | `Konular & İlerleme` | `Topics & Progress` |

### 📄 `src\components\kpss\KpssNetEstimationCard.tsx` (3 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 188 | `Mevcut Toplam Net:` | `Current Total Net:` |
| 225 | `Tahmini KPSS Puanı:` | `Estimated Score:` |
| 260 | `Hedef İlerleme` | `Goal Progress` |

### 📄 `src\components\kpss\KpssNotesDashboard.tsx` (4 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 104 | `Başlıksız Ders Notu` | `Untitled Note` |
| 269 | `Markdown (.md) Olarak İndir` | `Download as Markdown` |
| 293 | `Wikiağ / Nöral Harita` | `Knowledge Graph` |
| 320 | `Notu Sil` | `Delete Note` |

### 📄 `src\components\kpss\KpssPastExamsDashboard.tsx` (10 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 32 | `Tarih Soru Arşivi` | `History Q Archive` |
| 36 | `Karma Sınav (Karışık)` | `Mixed Past Exam` |
| 77 | `Coğrafya` | `Geography` |
| 82 | `Tarih` | `History` |
| 87 | `Matematik / Geometri` | `Math / Geometry` |
| 92 | `Tüm Dersler (GY-GK)` | `All Subjects (GY-GK)` |
| 154 | `1. Sınav Yılını Seçin` | `1. Select Exam Year` |
| 209 | `2. Ders Seçin` | `2. Select Subject` |
| 249 | `Soru` | `Q` |
| 290 | `Sınavı Başlat` | `Start Exam` |

### 📄 `src\components\kpss\KpssQuizInfoModal.tsx` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 171 | `Anladım` | `Got it` |

### 📄 `src\components\kpss\KpssQuizIntroStep.tsx` (3 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 31 | `Seviye Tespit Sınavı` | `Proficiency Quiz` |
| 46 | `Soru` | `Q` |
| 91 | `Sınavı Başlat` | `Start Test` |

### 📄 `src\components\kpss\KpssQuizQuestionsStep.tsx` (4 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 77 | `Tekrar Dene` | `Retry` |
| 211 | `Çözüm Açıklaması:` | `Solution & Explanation:` |
| 231 | `Önceki` | `Previous` |
| 270 | `Sınavı Bitir` | `Finish Quiz` |

### 📄 `src\components\kpss\KpssQuizResultStep.tsx` (7 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 37 | `tr-TR` | `en-US` |
| 76 | `Sınav Tamamlandı!` | `Quiz Completed!` |
| 148 | `Soruları İncele:` | `Review Questions:` |
| 228 | `Çözüm: ` | `Solution: ` |
| 258 | `Seviyeni Tekrar Çöz` | `Re-take Test` |
| 265 | `Dışarı Aktar` | `Export` |
| 273 | `Kapat` | `Close` |

### 📄 `src\components\kpss\KpssSrsCard.tsx` (6 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 78 | `Harika İş!` | `Great Job!` |
| 97 | `Tekrar Yükle` | `Review Again` |
| 200 | `İpucu: ` | `Hint: ` |
| 229 | `Zor` | `Hard` |
| 241 | `Orta` | `Medium` |
| 253 | `Kolay` | `Easy` |

### 📄 `src\components\kpss\KpssTopicList.tsx` (4 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 78 | `Sıralama:` | `Sort By:` |
| 98 | `Müfredat Sırası` | `Syllabus Order` |
| 106 | `Tamamlanma Durumu` | `Completion Status` |
| 171 | `Soru` | `Q` |

### 📄 `src\components\kpss\KpssWikiHeader.tsx` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 83 | `Yeni Ders Notu Ekle` | `New Study Note` |

### 📄 `src\components\kpss\KpssWikiReader.tsx` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 36 | `Başlıksız Ders Notu` | `Untitled Note` |

### 📄 `src\components\kpss\KpssWikiSidebar.tsx` (3 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 79 | `Yeni Ders Notu Ekle` | `New Study Note` |
| 88 | `Ders notlarında ara...` | `Search notes...` |
| 148 | `Başlıksız Ders Notu` | `Untitled Note` |

### 📄 `src\components\KpssView.tsx` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 398 | `Hata` | `Error` |

### 📄 `src\components\ListView.tsx` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 103 | `Şimdi Eşitle` | `Sync Now` |

### 📄 `src\components\notes\CustomQuotesSection.tsx` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 34 | `Eklediğim Sözler` | `My Custom Quotes` |

### 📄 `src\components\notes\NoteCard.tsx` (10 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 46 | `Başlıksız` | `Untitled` |
| 88 | `Başlık...` | `Title...` |
| 118 | `Anahtar Kelimeler...` | `Cues...` |
| 162 | `Özet...` | `Summary...` |
| 213 | `İptal` | `Cancel` |
| 229 | `Kaydet` | `Save` |
| 299 | `İpuçları:` | `Cues:` |
| 319 | `Notlar:` | `Notes:` |
| 348 | `Özet:` | `Summary:` |
| 480 | `.md Olarak İndir` | `Export .md` |

### 📄 `src\components\notes\NoteEditorModal.tsx` (3 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 124 | `Kayıt Türü:` | `Entry Type:` |
| 317 | `Özet (Summary):` | `Summary:` |
| 481 | `Kaydet` | `Save` |

### 📄 `src\components\notes\NotesHeaderBar.tsx` (3 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 72 | `Düşünce Ağı (Graph View)` | `Graph View` |
| 81 | `Yeni Söz` | `New Quote` |
| 89 | `Yeni Not` | `New Note` |

### 📄 `src\components\notes\QuoteEditorModal.tsx` (3 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 39 | `Yeni Özlü Söz` | `New Quote` |
| 69 | `Yazar (Opsiyonel)` | `Author (Optional)` |
| 80 | `Ekle` | `Add` |

### 📄 `src\components\pomodoro\PomoTimerCard.tsx` (7 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 124 | `Odaklanma` | `Focus` |
| 130 | `Kısa Mola` | `Short` |
| 136 | `Uzun Mola` | `Long` |
| 178 | `Süre Ayarı (Dk):` | `Durations (Min):` |
| 204 | `Odak` | `Focus` |
| 245 | `Kısa` | `Short` |
| 286 | `Uzun` | `Long` |

### 📄 `src\components\pomodoro\PomoZenHistoryCard.tsx` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 56 | `tr-TR` | `en-US` |

### 📄 `src\components\PomodoroView.tsx` (2 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 311 | `Odaklanma Seansı` | `Focus Session` |
| 371 | `tr-TR` | `en-US` |

### 📄 `src\components\popup\PopupVolumeTab.tsx` (2 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 77 | `Sekme Özel Ses Boost` | `Tab Volume Booster` |
| 106 | `Sekme:` | `Tab:` |

### 📄 `src\components\settings\DetoxSettingsTab.tsx` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 79 | `dk` | `min` |

### 📄 `src\components\settings\GeneralSettingsTab.tsx` (3 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 342 | `Web Copilot Yan Panel Kısayolu` | `Web Copilot Side Panel Shortcut` |
| 345 | `Varsayılan: Ctrl + Shift + E` | `Default: Ctrl + Shift + E` |
| 366 | `Kısayolu Değiştir` | `Configure Shortcut` |

### 📄 `src\components\settings\KpssSettingsTab.tsx` (3 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 251 | `KPSS Ders Notları & Wiki` | `KPSS Study Notes & Wiki` |
| 272 | `Otomatik İlk Kelime Başlığı` | `Auto First-Word Title` |
| 334 | `Veri Sıfırlama` | `Data Reset` |

### 📄 `src\components\settings\SyncSettingsTab.tsx` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 100 | `tr-TR` | `en-US` |

### 📄 `src\components\Sidebar.tsx` (15 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 130 | `Odağım (Görev Listesi)` | `My Focus` |
| 134 | `Kişisel Disiplin` | `Willpower` |
| 141 | `Kanban` | `Kanban Board` |
| 145 | `AI Asistan` | `AI Assistant` |
| 148 | `Günlüğüm` | `My Diary` |
| 150 | `Takvim` | `Calendar` |
| 154 | `Aralıklı Tekrar` | `Spaced Repetition` |
| 159 | `Aday Din Görevlisi Yeterlilikleri` | `Competencies` |
| 163 | `Namaz Vakitleri` | `Prayer Times` |
| 166 | `KPSS Ders Takip` | `KPSS Prep` |
| 169 | `Dijital Detoks` | `Digital Detox` |
| 174 | `Arcade` | `Arcade` |
| 179 | `Ücretsiz Oyunlar` | `Free Games` |
| 182 | `BIST & Halka Arz OS` | `BIST & IPOs OS` |
| 186 | `Halka Arz & Hisse` | `IPOs & Stocks` |

### 📄 `src\components\WillpowerView.tsx` (2 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 349 | `tr-TR` | `en-US` |
| 352 | `tr-TR` | `en-US` |

### 📄 `src\content\detox\detoxBlocker.ts` (8 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 356 | `Odaklanma Zamanı!` | `Time to Focus!` |
| 363 | `Odaklanma Zamanı!` | `Focus Session!` |
| 370 | `Günlük Limite Ulaştınız!` | `Daily Limit Reached!` |
| 378 | `Kontrol Paneline Git` | `Go to Dashboard` |
| 457 | `Bu Sürede Harcayacağın Zamanla:` | `What You Could Achieve Right Now:` |
| 460 | `20+ KPSS sorusu çözebilir` | `Solve 20+ Practice Questions` |
| 461 | `15 sayfa kitap okuyabilir` | `Read 15 Book Pages` |
| 462 | `1 Tam Odaklanmış Pomodoro tamamlayabilirdin!` | `Complete 1 Focused Pomodoro Session!` |

### 📄 `src\domain\services\KpssCalculatorService.ts` (2 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 17 | `Sınav Başladı!` | `Exam Started!` |
| 36 | `Tebrikler, bitti!` | `Completed!` |

### 📄 `src\popup.tsx` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 69 | `Ses Boost` | `Volume` |

### 📄 `src\presentation\hooks\useSettings.ts` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 110 | `en` | `tr` |

### 📄 `src\presentation\hooks\useTodos.ts` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 320 | `Detay` | `Detail` |

### 📄 `src\presentation\hooks\useUI.ts` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 77 | `tr-TR` | `en-US` |

### 📄 `src\services\agentToolService.ts` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 67 | `Öğe` | `Element` |

### 📄 `src\services\aiChatService.ts` (1 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 401 | `tr-TR` | `en-US` |

### 📄 `src\sidepanel\SidePanelApp.tsx` (31 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 68 | `Tarayıcınız sesli komutu desteklemiyor.` | `Speech recognition is not supported in this browser.` |
| 79 | `tr-TR` | `en-US` |
| 156 | `Sayfa taranıyor...` | `Scanning page...` |
| 216 | `Kopyalandı!` | `Copied!` |
| 241 | `Kopyalandı` | `Copied` |
| 260 | `Yapay zeka yanıtlıyor...` | `AI Copilot thinking...` |
| 334 | `Turkish` | `English` |
| 502 | `Yanıt alınamadı. Lütfen Ayarlar'dan API Anahtarınızı kontrol edin.` | `Failed to get response. Please check API Key in Settings.` |
| 516 | `Bu YouTube videosunun alt yazılarını/transkriptini analiz et, 3 ana maddede özetle ve kilit zaman damgalarını çıkar.` | `Summarize this YouTube video transcript and extract key timestamps.` |
| 518 | `Bu YouTube videosunun içeriğini/transkriptini incele. Konuyu pekiştirmek için video içeriğinden 5 soruluk çoktan seçmeli (A, B, C, D seçenekli) soru testi oluştur ve en alt kısımda cevap anahtarı ile açıklamalarını ver.` | `Create a 5-question multiple choice quiz with answer key based on this video.` |
| 520 | `Bu sayfayı 3 ana maddede özetle.` | `Summarize this page in 3 key bullet points.` |
| 522 | `Bu sayfadaki en önemli çıkarımları ve eylem maddelerini yaz.` | `Extract key takeaways and action items from this page.` |
| 524 | `Bu sayfa ne anlatıyor ve ne amaçla yazılmıştır?` | `What is this page about and what is its goal?` |
| 526 | `Bu sayfadaki önemli veri veya listeleri çıkar.` | `Extract important structured data or lists from this page.` |
| 560 | `Yeni Sohbet Başlat` | `Start New Chat` |
| 566 | `Yeni Sohbet` | `New Chat` |
| 575 | `Sayfa Yükleniyor...` | `Loading page...` |
| 587 | `Sayfayı Yeniden Tara` | `Rescan Page` |
| 613 | `Videoyu Özetle` | `Summarize Video` |
| 628 | `5 Soruluk Test` | `5-Q Video Quiz` |
| 648 | `Formu Doldur (memory.md)` | `Autofill Form` |
| 659 | `Özetle` | `Summarize` |
| 668 | `Ana Fikirler` | `Key Takeaways` |
| 677 | `Veri Çıkar` | `Extract Data` |
| 686 | `Soru Sor` | `Ask` |
| 704 | `Life OS Agent Hazır` | `Life OS Agent Ready` |
| 716 | `Sayfayı Özetle` | `Summarize Page` |
| 717 | `3 ana maddede özetle` | `Get 3 key bullet points` |
| 723 | `Ana Fikirler` | `Key Takeaways` |
| 724 | `Kilit çıkarımlar & aksiyonlar` | `Key insights & action items` |
| 761 | `Dinleniyor...` | `Listening...` |

### 📄 `src\utils\kpssChartDrawer.ts` (2 adet)

| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |
|-------|-----------|--------------|
| 233 | `Hedef Soru` | `Target Q` |
| 252 | `Hedef Video` | `Target V` |

---

## 📝 Hardcoded Türkçe String'ler

Bu string'ler ya ternary içinde değil ya da doğrudan yazılmış.

### 📄 `src\App.tsx` (3 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 210 | `Tüm verileriniz kalıcı olarak silinecektir. Emin misiniz?` | `? "Tüm verileriniz kalıcı olarak silinecektir. Emin misiniz?"` |
| 221 | `Tüm KPSS çalışma verileriniz, test sonuçlarınız ve istatistikleriniz sıfırlanacaktır. Emin misiniz?` | `? "Tüm KPSS çalışma verileriniz, test sonuçlarınız ve istatistikleriniz sıfırlanacaktır. Emin misiniz?"` |
| 227 | `KPSS verileri başarıyla sıfırlandı!` | `? "KPSS verileri başarıyla sıfırlandı!"` |

### 📄 `src\background\handlers\alarmNotificationHandler.ts` (2 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 122 | `Bugün Yapılacak Görevleriniz Var` | `? "Bugün Yapılacak Görevleriniz Var"` |
| 204 | `BIST Alarm Uyarısı` | `let title = "BIST Alarm Uyarısı";` |

### 📄 `src\background\handlers\contextMenuHandler.ts` (6 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 18 | `🚀 Life OS Yan Panelini Aç` | `title: "🚀 Life OS Yan Panelini Aç",` |
| 25 | `📝 Sayfayı Özetle` | `title: "📝 Sayfayı Özetle",` |
| 32 | `🔤 Sayfayı Türkçe'ye Çevir` | `title: "🔤 Sayfayı Türkçe'ye Çevir",` |
| 39 | `💬 Seçili Metni Analiz Et / Çevir` | `title: "💬 Seçili Metni Analiz Et / Çevir",` |
| 87 | `Bu sayfayı 3 ana maddede özetle.` | `autoPrompt = "Bu sayfayı 3 ana maddede özetle.";` |
| 90 | `Bu sayfanın içeriğini Türkçe'ye çevir ve anlaşılır bir özet sun.` | `"Bu sayfanın içeriğini Türkçe'ye çevir ve anlaşılır bir özet sun.";` |

### 📄 `src\background\handlers\runtimeMessageHandler.ts` (2 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 95 | `Sistem Sayfası` | `title: tabs[0].title || "Sistem Sayfası",` |
| 99 | `Chrome Sayfası` | `pageText: `[Sistem Sayfası] ${tabs[0].title || "Chrome Sayfası"}. Güvenlik sebebiyle sistem sayfalarının içerik taranmas` |

### 📄 `src\components\aichat\AiChatHeaderBar.tsx` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 51 | `Çevrimdışı/Komut Modu` | `{lang === "tr" ? "Çevrimdışı/Komut Modu" : "Offline Command Mode"}` |

### 📄 `src\components\aichat\AiChatInputToolbar.tsx` (2 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 78 | `Google Canlı Arama (Search Grounding) Modu` | `title="Google Canlı Arama (Search Grounding) Modu"` |
| 83 | `AÇIK` | `<span>Google Canlı Arama: {enableWebSearch ? "AÇIK" : "KAPALI"}</span>` |

### 📄 `src\components\aichat\AiChatMessageItem.tsx` (4 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 139 | `Web Araştırması` | `<span>🔍 Google AI Arama: "{message.searchQuery || "Web Araştırması"}"</span>` |
| 247 | `Düşünme Süreci` | `{lang === "tr" ? "Düşünme Süreci" : "Thinking Process"}` |
| 299 | `Kopyalandı!` | `title={copied ? (lang === "tr" ? "Kopyalandı!" : "Copied!") : (lang === "tr" ? "Kopyala" : "Copy")}` |
| 317 | `Kopyalandı` | `{copied ? (lang === "tr" ? "Kopyalandı" : "Copied") : (lang === "tr" ? "Kopyala" : "Copy")}` |

### 📄 `src\components\AIChatView.tsx` (4 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 176 | `günlük yazısını` | `? "günlük yazısını"` |
| 231 | `Üzgünüm, bu komutu yerel olarak çözümleyemedim. Lütfen 'günlük ekle: ...', 'not ekle: ...' veya 'ders notu ekle: ...' formatında yazmayı deneyin.` | `? "Üzgünüm, bu komutu yerel olarak çözümleyemedim. Lütfen 'günlük ekle: ...', 'not ekle: ...' veya 'ders notu ekle: ...'` |
| 232 | `I couldn't parse this command locally. Try: 'günlük ekle: ...', 'not ekle: ...' or 'ders notu ekle: ...'` | `: "I couldn't parse this command locally. Try: 'günlük ekle: ...', 'not ekle: ...' or 'ders notu ekle: ...'";` |
| 264 | `günlük yazısını` | `? "günlük yazısını"` |

### 📄 `src\components\AICompanionModal.tsx` (12 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 33 | `Lütfen geçerli bir YouTube video linki girin.` | `setStatusMsg("Lütfen geçerli bir YouTube video linki girin.");` |
| 38 | `YouTube transkripti çekiliyor...` | `setStatusMsg("YouTube transkripti çekiliyor...");` |
| 45 | `Transkript başarıyla alındı! Yapay zeka ile özetleniyor...` | `setStatusMsg("Transkript başarıyla alındı! Yapay zeka ile özetleniyor...");` |
| 108 | `Özet oluşturulamadı.` | `"Özet oluşturulamadı.";` |
| 125 | `Özet oluşturulamadı.` | `data?.choices?.[0]?.message?.content || "Özet oluşturulamadı.";` |
| 134 | `Video analizi sırasında bir hata oluştu.` | `setStatusMsg(err?.message || "Video analizi sırasında bir hata oluştu.");` |
| 145 | `YouTube Özeti` | `title: `🎬 AI Video Notu: ${videoTitle || "YouTube Özeti"}`,` |
| 152 | `✓ Özet başarıyla Günlüğüm & Notlar alanına eklendi!` | `setSavedSuccessMsg("✓ Özet başarıyla Günlüğüm & Notlar alanına eklendi!");` |
| 167 | `Diğer` | `category: "Diğer",` |
| 172 | `✓ Görev odağım listesine eklendi!` | `setSavedSuccessMsg("✓ Görev odağım listesine eklendi!");` |
| 224 | `YouTube Video URL yapıştırın (Örn: https://www.youtube.com/watch?v=...)` | `placeholder="YouTube Video URL yapıştırın (Örn: https://www.youtube.com/watch?v=...)"` |
| 233 | `✨ Özetle & Transkript Çıkar` | `{loading ? "Analiz Ediliyor..." : "✨ Özetle & Transkript Çıkar"}` |

### 📄 `src\components\arcade\AddGameModal.tsx` (6 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 32 | `Klasik Yılan oyunu. Elmaları topla, yüksek skora ulaş!` | `setDescription("Klasik Yılan oyunu. Elmaları topla, yüksek skora ulaş!");` |
| 38 | `Engelleri aş, altınları topla ve şövalyeyi zirveye taşı!` | `setDescription("Engelleri aş, altınları topla ve şövalyeyi zirveye taşı!");` |
| 44 | `Retro uzay savaşı. Düşman gemilerini yok et, galaksiyi koru!` | `setDescription("Retro uzay savaşı. Düşman gemilerini yok et, galaksiyi koru!");` |
| 124 | `Örn: 2D Şövalye Macerası` | `placeholder="Örn: 2D Şövalye Macerası"` |
| 134 | `Örn: Piksellerle hayat bulan aksiyon simülasyonu` | `placeholder="Örn: Piksellerle hayat bulan aksiyon simülasyonu"` |
| 206 | `Proje başlangıç notları...` | `placeholder="Proje başlangıç notları..."` |

### 📄 `src\components\arcade\ArcadeGameCard.tsx` (5 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 57 | `Geliştiriliyor` | `{tr.arcade_status_in_progress || "Geliştiriliyor"}` |
| 97 | `Favorilerden Çıkar` | `title={game.isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}` |
| 154 | `Oyunu Kütüphaneden Sil` | `title="Oyunu Kütüphaneden Sil"` |
| 163 | `Steam Dev Detayları` | `<button className="arcade-details-btn" onClick={() => onOpenDetails(game)} title="Steam Dev Detayları">` |
| 172 | `Oyunu Başlat` | `<button className="arcade-play-btn" onClick={() => onPlay(game)} title="Oyunu Başlat">` |

### 📄 `src\components\arcade\ArcadeGameModal.tsx` (3 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 129 | `Başlatma komutunu kopyala` | `title="Başlatma komutunu kopyala"` |
| 290 | `Oyun güncellemeleri, tasarım fikirleri ve mekanik notları...` | `placeholder="Oyun güncellemeleri, tasarım fikirleri ve mekanik notları..."` |
| 302 | `Yeni yapılacak görev ekle...` | `placeholder="Yeni yapılacak görev ekle..."` |

### 📄 `src\components\arcade\ArcadeHeader.tsx` (5 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 26 | `Tüm Oyunlar` | `{ key: "all", label: tr.arcade_cat_all || "Tüm Oyunlar" },` |
| 28 | `Geliştirilenler` | `{ key: "in_progress", label: tr.arcade_cat_in_progress || "Geliştirilenler" },` |
| 42 | `Oyun Kütüphanesi & Laboratuvarı` | `<h2>{tr.arcade_main_title || "Oyun Kütüphanesi & Laboratuvarı"}</h2>` |
| 44 | `Kendi geliştirdiğin oyun projelerini ve hazır mini oyunları tek bir yerde yönet, oyna ve geliştir.` | `{tr.arcade_subtitle || "Kendi geliştirdiğin oyun projelerini ve hazır mini oyunları tek bir yerde yönet, oyna ve gelişti` |
| 78 | `Klasör Tara` | `<span>{tr.arcade_scan_folder_btn || "Klasör Tara"}</span>` |

### 📄 `src\components\ArcadeView.tsx` (4 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 142 | `Klasör taraması ile otomatik eklendi.` | `devNotes: "Klasör taraması ile otomatik eklendi.",` |
| 209 | `Klasör taraması ile otomatik eklendi.` | `devNotes: "Klasör taraması ile otomatik eklendi.",` |
| 268 | `Oyun Klasörleri Taranıyor...` | `<p>{scanning ? "Oyun Klasörleri Taranıyor..." : "Oyun Kütüphanesi Yükleniyor..."}</p>` |
| 276 | `Klasör Tara` | `<p>Sağ üstteki <strong>"Klasör Tara"</strong> butonuna basıp <code>C:\Users\emre_\Desktop\GitHub\In Progress</code> klas` |

### 📄 `src\components\DatePicker.tsx` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 56 | `Ça` | `const weekdaysTr = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"];` |

### 📄 `src\components\detox\DetoxStatusCard.tsx` (11 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 53 | `Sosyal medyaya erişimi engelleyerek odaklanmanızı artırın.` | `"Sosyal medyaya erişimi engelleyerek odaklanmanızı artırın."}` |
| 86 | `Süresiz` | `? t.detox_duration_permanent || "Süresiz"` |
| 87 | `Kalan Süre` | `: t.time_remaining || "Kalan Süre"}` |
| 96 | `Odaklanma oturumunuz boyunca seçilen sosyal medya kanalları tamamen engellenmiştir.` | `"Odaklanma oturumunuz boyunca seçilen sosyal medya kanalları tamamen engellenmiştir."}` |
| 100 | `Detoksu Sonlandır` | `{t.detox_btn_disable || "Detoksu Sonlandır"}` |
| 108 | `Engellenecek Platformları Seçin` | `<h3>{t.detox_select_sites || "Engellenecek Platformları Seçin"}</h3>` |
| 151 | `Özel Adres Engelle (Manuel)` | `? "Özel Adres Engelle (Manuel)"` |
| 166 | `Örn: reddit.com, linkedin.com...` | `? "Örn: reddit.com, linkedin.com..."` |
| 251 | `Süre Belirleyin` | `<h3>{t.detox_select_duration || "Süre Belirleyin"}</h3>` |
| 254 | `Bloklamanın ne kadar süreceğini seçin.` | `"Bloklamanın ne kadar süreceğini seçin."}` |
| 277 | `Detoksu Başlat` | `{t.detox_btn_enable || "Detoksu Başlat"}` |

### 📄 `src\components\detox\DetoxUsageCard.tsx` (4 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 32 | `Bugün Chrome'da Ne Kadar Vakit Geçirdin?` | `? "Bugün Chrome'da Ne Kadar Vakit Geçirdin?"` |
| 37 | `Tarayıcıda harcadığınız aktif süreyi takip edin.` | `? "Tarayıcıda harcadığınız aktif süreyi takip edin."` |
| 66 | `Bugün henüz başka sitelerde aktif vakit geçirmediniz.` | `? "Bugün henüz başka sitelerde aktif vakit geçirmediniz."` |
| 172 | `Daha Az Göster` | `? "Daha Az Göster"` |

### 📄 `src\components\DetoxView.tsx` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 157 | `Lütfen en az bir site seçin.` | `alert(t.detox_no_sites_alert || "Lütfen en az bir site seçin.");` |

### 📄 `src\components\freegames\FreeGamesFilterBar.tsx` (2 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 93 | `Hızlı Talep Sayfaları:` | `{lang === "tr" ? "Hızlı Talep Sayfaları:" : "Quick Claim Pages:"}` |
| 205 | `Diğer` | `? "Diğer"` |

### 📄 `src\components\FreeGamesView.tsx` (8 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 206 | `Şubat` | `"Şubat",` |
| 209 | `Mayıs` | `"Mayıs",` |
| 212 | `Ağustos` | `"Ağustos",` |
| 213 | `Eylül` | `"Eylül",` |
| 215 | `Kasım` | `"Kasım",` |
| 216 | `Aralık` | `"Aralık",` |
| 335 | `Eşleşen fırsat bulunamadı.` | `? "Eşleşen fırsat bulunamadı."` |
| 346 | `Kalıcı / Süresiz` | `? "Kalıcı / Süresiz"` |

### 📄 `src\components\HalkaArzView.tsx` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 103 | `Yükleniyor...` | `<span>{loading ? "Yükleniyor..." : "Yenile"}</span>` |

### 📄 `src\components\hifiz\HifizMushafModal.tsx` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 68 | `Mushaf Sayfası` | `alt="Mushaf Sayfası"` |

### 📄 `src\components\hifiz\HifizYeterliklerCard.tsx` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 29 | `Müfredat İlerlemesi` | `{lang === "tr" ? "Müfredat İlerlemesi" : "Checklist Progress"}` |

### 📄 `src\components\hifiz\HifizYeterlikModal.tsx` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 45 | `Anladım` | `{lang === "tr" ? "Anladım" : "Got it"}` |

### 📄 `src\components\KanbanView.tsx` (4 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 22 | `Yapılacak` | `{ status: "todo", label: t.kanban_todo || "Yapılacak" },` |
| 23 | `Yapılıyor` | `{ status: "in-progress", label: t.kanban_in_progress || "Yapılıyor" },` |
| 98 | `Sola Taşı` | `title={lang === "tr" ? "Sola Taşı" : "Move Left"}` |
| 117 | `Sağa Taşı` | `title={lang === "tr" ? "Sağa Taşı" : "Move Right"}` |

### 📄 `src\components\kpss\KpssAutoPlannerCard.tsx` (13 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 79 | `Yoğun Çalışma Gerekli (Hızlanmalısınız)` | `? "Yoğun Çalışma Gerekli (Hızlanmalısınız)"` |
| 86 | `Orta Düzey Çalışma Hızı` | `text: lang === "tr" ? "Orta Düzey Çalışma Hızı" : "Moderate Study Pace",` |
| 91 | `İdeal Çalışma Hızı` | `text: lang === "tr" ? "İdeal Çalışma Hızı" : "Optimal Study Pace",` |
| 137 | `KPSS Günlük Konu Planlayıcı` | `? "KPSS Günlük Konu Planlayıcı"` |
| 158 | `Sistem Nasıl Çalışır?` | `title={lang === "tr" ? "Sistem Nasıl Çalışır?" : "How does it work?"}` |
| 192 | `Tebrikler! Tüm KPSS konularını başarıyla tamamladınız.` | `? "Tebrikler! Tüm KPSS konularını başarıyla tamamladınız."` |
| 206 | `Sınava kalan süreye ve konu yükünüze göre bugün tamamlamanız önerilen konular (Başlatmak için tıklayın):` | `? "Sınava kalan süreye ve konu yükünüze göre bugün tamamlamanız önerilen konular (Başlatmak için tıklayın):"` |
| 277 | `Çalışılıyor` | `{lang === "tr" ? "Çalışılıyor" : "Working"}` |
| 290 | `Başlanmadı` | `{lang === "tr" ? "Başlanmadı" : "Not Started"}` |
| 322 | `Kalan Gün:` | `<strong>{lang === "tr" ? "Kalan Gün:" : "Days Left:"}</strong>{" "}` |
| 332 | `Günlük Hız:` | `<strong>{lang === "tr" ? "Günlük Hız:" : "Daily Rate:"}</strong>{" "}` |
| 406 | `KPSS Planlayıcı Nasıl Çalışır?` | `? "KPSS Planlayıcı Nasıl Çalışır?"` |
| 441 | `Tamamlandı` | `(durumu "Tamamlandı" olmayan) tüm konularınızı kalan gün` |

### 📄 `src\components\kpss\KpssDailyStatsCard.tsx` (7 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 120 | `İzlenen Video` | `{lang === "tr" ? "İzlenen Video" : "Videos Watched"}` |
| 202 | `İlerleme Grafiği` | `{lang === "tr" ? "İlerleme Grafiği" : "Progress Chart"}` |
| 223 | `Tümü` | `{lang === "tr" ? "Tümü" : "All"}` |
| 311 | `Çizgi` | `{lang === "tr" ? "Çizgi" : "Line"}` |
| 328 | `Sütun` | `{lang === "tr" ? "Sütun" : "Bar"}` |
| 342 | `Kaydedilen Günlük Veriler:` | `{lang === "tr" ? "Kaydedilen Günlük Veriler:" : "Saved Daily Logs:"}` |
| 370 | `Bu günü sil` | `title={lang === "tr" ? "Bu günü sil" : "Delete day"}` |

### 📄 `src\components\kpss\KpssHeaderBar.tsx` (4 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 40 | `Konular & İlerleme` | `{lang === "tr" ? "Konular & İlerleme" : "Topics & Progress"}` |
| 47 | `KPSS Ders Notları` | `? "KPSS Ders Notları"` |
| 55 | `KPSS Bilgi Kartları (SRS)` | `? "KPSS Bilgi Kartları (SRS)"` |
| 63 | `Çıkmış Sorular (2006-2021)` | `? "Çıkmış Sorular (2006-2021)"` |

### 📄 `src\components\kpss\KpssNetEstimationCard.tsx` (3 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 225 | `Tahmini KPSS Puanı:` | `{lang === "tr" ? "Tahmini KPSS Puanı:" : "Estimated Score:"}` |
| 260 | `Hedef İlerleme` | `{lang === "tr" ? "Hedef İlerleme" : "Goal Progress"}` |
| 300 | `Tebrikler! Hedefinize ulaştınız.` | `? "Tebrikler! Hedefinize ulaştınız."` |

### 📄 `src\components\kpss\KpssNotesDashboard.tsx` (4 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 104 | `Başlıksız Ders Notu` | `finalTitle = lang === "tr" ? "Başlıksız Ders Notu" : "Untitled Note";` |
| 145 | `).replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]/g, ` | `const filename = `${(selectedNote.title || "Ders-Notu").replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]/g, "_")}.md`;` |
| 269 | `Markdown (.md) Olarak İndir` | `title={lang === "tr" ? "Markdown (.md) Olarak İndir" : "Download as Markdown"}` |
| 293 | `Wikiağ / Nöral Harita` | `title={lang === "tr" ? "Wikiağ / Nöral Harita" : "Knowledge Graph"}` |

### 📄 `src\components\kpss\KpssPastExamsDashboard.tsx` (10 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 32 | `Tarih Soru Arşivi` | `label: lang === "tr" ? "Tarih Soru Arşivi" : "History Q Archive",` |
| 36 | `Karma Sınav (Karışık)` | `label: lang === "tr" ? "Karma Sınav (Karışık)" : "Mixed Past Exam",` |
| 77 | `Coğrafya` | `label: lang === "tr" ? "Coğrafya" : "Geography",` |
| 92 | `Tüm Dersler (GY-GK)` | `label: lang === "tr" ? "Tüm Dersler (GY-GK)" : "All Subjects (GY-GK)",` |
| 126 | `ÖSYM Çıkmış Sorular Sınav Salonu` | `? "ÖSYM Çıkmış Sorular Sınav Salonu"` |
| 127 | `ÖSYM Past Exams Practice Room` | `: "ÖSYM Past Exams Practice Room"}` |
| 131 | `Yıllara göre orijinal çıkmış KPSS Lisans sorularını veya tüm yılların karışımından oluşan karma denemeleri çözün.` | `? "Yıllara göre orijinal çıkmış KPSS Lisans sorularını veya tüm yılların karışımından oluşan karma denemeleri çözün."` |
| 154 | `1. Sınav Yılını Seçin` | `{lang === "tr" ? "1. Sınav Yılını Seçin" : "1. Select Exam Year"}` |
| 209 | `2. Ders Seçin` | `{lang === "tr" ? "2. Ders Seçin" : "2. Select Subject"}` |
| 290 | `Sınavı Başlat` | `{lang === "tr" ? "Sınavı Başlat" : "Start Exam"}` |

### 📄 `src\components\kpss\KpssQuizInfoModal.tsx` (9 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 31 | `KPSS Soru Sistemi Değişim Milatları` | `? "KPSS Soru Sistemi Değişim Milatları"` |
| 64 | `ÖSYM çıkmış sorularını çözerken hazırlık stratejinizi aşağıdaki reform yıllarına göre belirleyebilirsiniz:` | `? "ÖSYM çıkmış sorularını çözerken hazırlık stratejinizi aşağıdaki reform yıllarına göre belirleyebilirsiniz:"` |
| 90 | `Geçiş / Deneme Dönemi` | `? "Geçiş / Deneme Dönemi"` |
| 95 | `İlk kez Lisans sınavında yorumsal, öncüllü sorular ve Çağdaş Türk ve Dünya Tarihi müfredata girdi.` | `? "İlk kez Lisans sınavında yorumsal, öncüllü sorular ve Çağdaş Türk ve Dünya Tarihi müfredata girdi."` |
| 122 | `Resmi Başlangıç / Standartlaşma` | `? "Resmi Başlangıç / Standartlaşma"` |
| 127 | `Tüm düzeylerde (Lisans, Önlisans, Ortaöğretim) Sözel/Sayısal Mantık resmileşti ve bugünkü 120 soruluk şablon kalıcı hale geldi.` | `? "Tüm düzeylerde (Lisans, Önlisans, Ortaöğretim) Sözel/Sayısal Mantık resmileşti ve bugünkü 120 soruluk şablon kalıcı h` |
| 154 | `Nihai Dönem / Yeni Nesil Çağı` | `? "Nihai Dönem / Yeni Nesil Çağı"` |
| 159 | `ÖSYM soru havuzu tamamen YKS/ALES paralelinde uzun paragraflara, günlük hayat senaryolarına ve yoğun muhakemeye evrildi.` | `? "ÖSYM soru havuzu tamamen YKS/ALES paralelinde uzun paragraflara, günlük hayat senaryolarına ve yoğun muhakemeye evril` |
| 171 | `Anladım` | `{lang === "tr" ? "Anladım" : "Got it"}` |

### 📄 `src\components\kpss\KpssQuizIntroStep.tsx` (4 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 31 | `Seviye Tespit Sınavı` | `{lang === "tr" ? "Seviye Tespit Sınavı" : "Proficiency Quiz"}` |
| 35 | `Seçtiğiniz konu hakkında yapay zekâ tarafından hazırlanan çoktan seçmeli bir test çözerek yetkinliğinizi ölçün. Soru sayısını seçip testi başlatabilirsiniz:` | `? "Seçtiğiniz konu hakkında yapay zekâ tarafından hazırlanan çoktan seçmeli bir test çözerek yetkinliğinizi ölçün. Soru ` |
| 76 | `Yapay zekâ testini başlatmak için Ayarlar panelinden bir AI API Anahtarı girmelisiniz.` | `? "Yapay zekâ testini başlatmak için Ayarlar panelinden bir AI API Anahtarı girmelisiniz."` |
| 91 | `Sınavı Başlat` | `{lang === "tr" ? "Sınavı Başlat" : "Start Test"}` |

### 📄 `src\components\kpss\KpssQuizQuestionsStep.tsx` (6 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 65 | `Yapay Zekâ seviye tespit sorularını oluşturuyor. Lütfen bekleyin...` | `? "Yapay Zekâ seviye tespit sorularını oluşturuyor. Lütfen bekleyin..."` |
| 211 | `Çözüm Açıklaması:` | `{lang === "tr" ? "Çözüm Açıklaması:" : "Solution & Explanation:"}` |
| 217 | `Çözüm bilgisi bulunmuyor.` | `? "Çözüm bilgisi bulunmuyor."` |
| 231 | `Önceki` | `{lang === "tr" ? "Önceki" : "Previous"}` |
| 254 | `Sonraki (Yükleniyor...)` | `? "Sonraki (Yükleniyor...)"` |
| 270 | `Sınavı Bitir` | `{lang === "tr" ? "Sınavı Bitir" : "Finish Quiz"}` |

### 📄 `src\components\kpss\KpssQuizResultStep.tsx` (13 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 50 | `Boş` | `text += `Sizin Cevabınız: ${userAnsIdx !== -1 ? letters[userAnsIdx] : "Boş"}\n`;` |
| 52 | `Açıklama bulunmuyor.` | `text += `Çözüm: ${q.solution || "Açıklama bulunmuyor."}\n`;` |
| 76 | `Sınav Tamamlandı!` | `{lang === "tr" ? "Sınav Tamamlandı!" : "Quiz Completed!"}` |
| 115 | `Tebrikler! Konu 'Tamamlandı' olarak işaretlendi.` | `? "Tebrikler! Konu 'Tamamlandı' olarak işaretlendi."` |
| 119 | `Konu 'Çalışılıyor' durumuna getirildi.` | `? "Konu 'Çalışılıyor' durumuna getirildi."` |
| 122 | `Konu 'Çalışılmadı' olarak sıfırlandı.` | `? "Konu 'Çalışılmadı' olarak sıfırlandı."` |
| 148 | `Soruları İncele:` | `{lang === "tr" ? "Soruları İncele:" : "Review Questions:"}` |
| 208 | ` (Sizin Cevabınız)` | `? " (Sizin Cevabınız)"` |
| 212 | ` (Doğru Cevap)` | `? " (Doğru Cevap)"` |
| 228 | `Çözüm: ` | `<strong>{lang === "tr" ? "Çözüm: " : "Solution: "}</strong>{" "}` |
| 233 | `Çözüm bilgisi bulunmuyor.` | `? "Çözüm bilgisi bulunmuyor."` |
| 258 | `Seviyeni Tekrar Çöz` | `{lang === "tr" ? "Seviyeni Tekrar Çöz" : "Re-take Test"}` |
| 265 | `Dışarı Aktar` | `{lang === "tr" ? "Dışarı Aktar" : "Export"}` |

### 📄 `src\components\kpss\KpssSrsCard.tsx` (6 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 46 | `Tekrar kartları hazırlanıyor...` | `? "Tekrar kartları hazırlanıyor..."` |
| 78 | `Harika İş!` | `{lang === "tr" ? "Harika İş!" : "Great Job!"}` |
| 89 | `Bugünlük tüm KPSS tekrar kartlarını tamamladınız.` | `? "Bugünlük tüm KPSS tekrar kartlarını tamamladınız."` |
| 97 | `Tekrar Yükle` | `{lang === "tr" ? "Tekrar Yükle" : "Review Again"}` |
| 173 | `Cevabı görmek için tıkla` | `? "Cevabı görmek için tıkla"` |
| 200 | `İpucu: ` | `{lang === "tr" ? "İpucu: " : "Hint: "}` |

### 📄 `src\components\kpss\KpssTopicList.tsx` (5 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 49 | `Konu Dağılımı ve Çalışma Takibi` | `? "Konu Dağılımı ve Çalışma Takibi"` |
| 78 | `Sıralama:` | `{lang === "tr" ? "Sıralama:" : "Sort By:"}` |
| 98 | `Müfredat Sırası` | `{lang === "tr" ? "Müfredat Sırası" : "Syllabus Order"}` |
| 102 | `Soru Sıklığı (Çoktan Aza)` | `? "Soru Sıklığı (Çoktan Aza)"` |
| 185 | `Seviye Tespit Sınavı Çöz` | `? "Seviye Tespit Sınavı Çöz"` |

### 📄 `src\components\kpss\KpssWikiEditor.tsx` (3 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 41 | `Ders Notu Başlığı (örneğin: Çorum)...` | `placeholder="Ders Notu Başlığı (örneğin: Çorum)..."` |
| 82 | `Ders notunuzu yazın. Diğer notlarınıza bağlantı vermek için [[Çorum]] şeklinde yazabilirsiniz...` | `placeholder="Ders notunuzu yazın. Diğer notlarınıza bağlantı vermek için [[Çorum]] şeklinde yazabilirsiniz..."` |
| 104 | `✓ Değişiklikler başarıyla kaydedildi!` | `{saveStatus ? "✓ Değişiklikler başarıyla kaydedildi!" : "Değişikliklerinizi kaydetmeyi unutmayın."}` |

### 📄 `src\components\kpss\KpssWikiReader.tsx` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 36 | `Başlıksız Ders Notu` | `note.title.trim() || extractTitleFromContent(note.content) || (lang === "tr" ? "Başlıksız Ders Notu" : "Untitled Note");` |

### 📄 `src\components\kpss\KpssWikiSidebar.tsx` (6 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 33 | `Tümü` | `{ id: "all", label: "Tümü" },` |
| 35 | `Coğrafya` | `{ id: "cografya", label: "Coğrafya" },` |
| 36 | `Vatandaşlık` | `{ id: "vatandaslik", label: "Vatandaşlık" },` |
| 37 | `Türkçe` | `{ id: "turkce", label: "Türkçe" },` |
| 88 | `Ders notlarında ara...` | `placeholder={lang === "tr" ? "Ders notlarında ara..." : "Search notes..."}` |
| 148 | `Başlıksız Ders Notu` | `n.title.trim() || extractTitleFromContent(n.content) || (lang === "tr" ? "Başlıksız Ders Notu" : "Untitled Note");` |

### 📄 `src\components\KpssCountdownBanner.tsx` (2 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 21 | `KPSS Lisans Sınavına Kalan Süre` | `? "KPSS Lisans Sınavına Kalan Süre"` |
| 30 | `Tahmini Konuların Bitme Süresi` | `? "Tahmini Konuların Bitme Süresi"` |

### 📄 `src\components\KpssView.tsx` (6 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 294 | `Soru üretilemedi.` | `throw new Error("Soru üretilemedi.");` |
| 335 | `Sınav soruları oluşturulurken yapay zekâ bir hata verdi. Lütfen tekrar deneyin.` | `? "Sınav soruları oluşturulurken yapay zekâ bir hata verdi. Lütfen tekrar deneyin."` |
| 394 | `Bu kategori için çıkmış soru bulunamadı.` | `? "Bu kategori için çıkmış soru bulunamadı."` |
| 415 | `Coğrafya` | `? "Coğrafya"` |
| 426 | `Karma Yıllar` | `? "Karma Yıllar"` |
| 503 | `KPSS Hazırlık` | `title="KPSS Hazırlık"` |

### 📄 `src\components\ListView.tsx` (5 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 17 | `Şub` | `"Şub",` |
| 23 | `Ağu` | `"Ağu",` |
| 92 | `Google Görevler eşitleniyor...` | `? "Google Görevler eşitleniyor..."` |
| 95 | `Google Görevler ile eşitlendi` | `? "Google Görevler ile eşitlendi"` |
| 103 | `Şimdi Eşitle` | `title={lang === "tr" ? "Şimdi Eşitle" : "Sync Now"}` |

### 📄 `src\components\notes\CustomQuotesSection.tsx` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 34 | `Eklediğim Sözler` | `{lang === "tr" ? "Eklediğim Sözler" : "My Custom Quotes"}` |

### 📄 `src\components\notes\NoteCard.tsx` (9 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 46 | `Başlıksız` | `const title = note.title || (lang === "tr" ? "Başlıksız" : "Untitled");` |
| 88 | `Başlık...` | `placeholder={lang === "tr" ? "Başlık..." : "Title..."}` |
| 162 | `Özet...` | `placeholder={lang === "tr" ? "Özet..." : "Summary..."}` |
| 185 | `Not içeriği (Markdown)...` | `? "Not içeriği (Markdown)..."` |
| 213 | `İptal` | `{lang === "tr" ? "İptal" : "Cancel"}` |
| 247 | `Günlük` | `? "Günlük"` |
| 299 | `İpuçları:` | `{lang === "tr" ? "İpuçları:" : "Cues:"}` |
| 348 | `Özet:` | `{lang === "tr" ? "Özet:" : "Summary:"}` |
| 480 | `.md Olarak İndir` | `title={lang === "tr" ? ".md Olarak İndir" : "Export .md"}` |

### 📄 `src\components\notes\NoteEditorModal.tsx` (10 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 124 | `Kayıt Türü:` | `{lang === "tr" ? "Kayıt Türü:" : "Entry Type:"}` |
| 168 | `Günlük` | `? "Günlük"` |
| 196 | `Bugün nasıl hissediyorsun? veya Başlık...` | `? "Bugün nasıl hissediyorsun? veya Başlık..."` |
| 245 | `Temel fikirler, anahtar kelimeler veya olası sınav sorularını buraya yazın...` | `? "Temel fikirler, anahtar kelimeler veya olası sınav sorularını buraya yazın..."` |
| 276 | `Not Alma Alanı (Notes):` | `? "Not Alma Alanı (Notes):"` |
| 286 | `Ders esnasındaki ayrıntılı notlarınızı, [[İç Bağlantı]] ve #kpss/tarih etiketlerinizi yazın...` | `? "Ders esnasındaki ayrıntılı notlarınızı, [[İç Bağlantı]] ve #kpss/tarih etiketlerinizi yazın..."` |
| 317 | `Özet (Summary):` | `{lang === "tr" ? "Özet (Summary):" : "Summary:"}` |
| 326 | `Bu çalışma sayfasındaki bilgilerin kısa ve net bir özetini buraya yazın...` | `? "Bu çalışma sayfasındaki bilgilerin kısa ve net bir özetini buraya yazın..."` |
| 354 | `Sevgili günlük, bugün...` | `? "Sevgili günlük, bugün..."` |
| 422 | `🔗 Bağlantılı Notlar` | `{/* Backlinks Panel ("🔗 Bağlantılı Notlar") */}` |

### 📄 `src\components\notes\NotesFilterBar.tsx` (3 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 22 | `Günlükler` | `{ id: "diary", labelTr: "Günlükler", labelEn: "Diary" },` |
| 23 | `Cornell Notları` | `{ id: "cornell", labelTr: "Cornell Notları", labelEn: "Cornell Notes" },` |
| 24 | `Sözler` | `{ id: "quotes", labelTr: "Sözler", labelEn: "Quotes" },` |

### 📄 `src\components\notes\NotesHeaderBar.tsx` (2 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 72 | `Düşünce Ağı (Graph View)` | `<span>{lang === "tr" ? "Düşünce Ağı (Graph View)" : "Graph View"}</span>` |
| 81 | `Yeni Söz` | `<span>{lang === "tr" ? "Yeni Söz" : "New Quote"}</span>` |

### 📄 `src\components\notes\QuoteEditorModal.tsx` (2 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 39 | `Yeni Özlü Söz` | `<h3>{lang === "tr" ? "Yeni Özlü Söz" : "New Quote"}</h3>` |
| 55 | `Özlü sözü buraya yazın...` | `? "Özlü sözü buraya yazın..."` |

### 📄 `src\components\notes\ZettelkastenGraphModal.tsx` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 156 | `Düğüm ara (#kpss/tarih, Başlık)...` | `placeholder="Düğüm ara (#kpss/tarih, Başlık)..."` |

### 📄 `src\components\NotesView.tsx` (2 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 196 | `Bu notu silmek istediğinize emin misiniz?` | `? "Bu notu silmek istediğinize emin misiniz?"` |
| 239 | `Bu sözü silmek istediğinize emin misiniz?` | `? "Bu sözü silmek istediğinize emin misiniz?"` |

### 📄 `src\components\pomodoro\PomoTimerCard.tsx` (3 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 130 | `Kısa Mola` | `{lang === "tr" ? "Kısa Mola" : "Short"}` |
| 178 | `Süre Ayarı (Dk):` | `{lang === "tr" ? "Süre Ayarı (Dk):" : "Durations (Min):"}` |
| 245 | `Kısa` | `{lang === "tr" ? "Kısa" : "Short"}` |

### 📄 `src\components\PomodoroView.tsx` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 311 | `Odaklanma Seansı` | `(lang === "tr" ? "Odaklanma Seansı" : "Focus Session"),` |

### 📄 `src\components\popup\PopupPomoTab.tsx` (4 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 545 | `Odak Müzikleri & Sesleri` | `title={t.pomo_focus_music || "Odak Müzikleri & Sesleri"}` |
| 546 | `Yağmur` | `rainLabel={t.pomo_ambient_rain || "Yağmur"}` |
| 547 | `Rüzgar` | `windLabel={t.pomo_ambient_wind || "Rüzgar"}` |
| 548 | `Kahverengi Gürültü` | `brownLabel={t.pomo_ambient_brown || "Kahverengi Gürültü"}` |

### 📄 `src\components\popup\PopupVolumeTab.tsx` (3 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 77 | `Sekme Özel Ses Boost` | `{lang === "tr" ? "Sekme Özel Ses Boost" : "Tab Volume Booster"}` |
| 131 | `Hoparlör Donanımına Dikkat Edin (%300 Üstü Sınır)!` | `? "Hoparlör Donanımına Dikkat Edin (%300 Üstü Sınır)!"` |
| 134 | `Güvenli Ses Aralığı (%100 - %300)` | `? "Güvenli Ses Aralığı (%100 - %300)"` |

### 📄 `src\components\PrayerView.tsx` (6 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 97 | `İmsak` | `Fajr: "İmsak",` |
| 98 | `Güneş` | `Sunrise: "Güneş",` |
| 99 | `Öğle` | `Dhuhr: "Öğle",` |
| 100 | `İkindi` | `Asr: "İkindi",` |
| 101 | `Akşam` | `Maghrib: "Akşam",` |
| 102 | `Yatsı` | `Isha: "Yatsı",` |

### 📄 `src\components\settings\AiSettingsTab.tsx` (2 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 191 | `9Router API Key (Örn: sk-72l... veya bos bırakın)` | `placeholder="9Router API Key (Örn: sk-72l... veya bos bırakın)"` |
| 591 | `# Kişisel Hafıza notlarınızı buraya yazın...` | `placeholder="# Kişisel Hafıza notlarınızı buraya yazın..."` |

### 📄 `src\components\settings\GeneralSettingsTab.tsx` (4 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 233 | `Yan Panel Açıldığında Sekmeyi Otomatik Grupla` | `? "Yan Panel Açıldığında Sekmeyi Otomatik Grupla"` |
| 342 | `Web Copilot Yan Panel Kısayolu` | `{lang === "tr" ? "Web Copilot Yan Panel Kısayolu" : "Web Copilot Side Panel Shortcut"}` |
| 345 | `Varsayılan: Ctrl + Shift + E` | `{lang === "tr" ? "Varsayılan: Ctrl + Shift + E" : "Default: Ctrl + Shift + E"}` |
| 366 | `Kısayolu Değiştir` | `{lang === "tr" ? "Kısayolu Değiştir" : "Configure Shortcut"}` |

### 📄 `src\components\settings\KpssSettingsTab.tsx` (7 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 242 | `KPSS GK-GY puan türlerinde 80 Puan alabilmek için ortalama sınav zorluğuna göre 70-75 Net yapılması yeterli olabilmektedir. Net ve Puan birebir eşit değildir, standart sapma formüllere dahildir.` | `? "KPSS GK-GY puan türlerinde 80 Puan alabilmek için ortalama sınav zorluğuna göre 70-75 Net yapılması yeterli olabilmek` |
| 251 | `KPSS Ders Notları & Wiki` | `<h3>{lang === "tr" ? "KPSS Ders Notları & Wiki" : "KPSS Study Notes & Wiki"}</h3>` |
| 272 | `Otomatik İlk Kelime Başlığı` | `{lang === "tr" ? "Otomatik İlk Kelime Başlığı" : "Auto First-Word Title"}` |
| 276 | `Ders notu yazarken başlık alanı boş bırakılırsa sadece ilk kelimeyi otomatik başlık yapar.` | `? "Ders notu yazarken başlık alanı boş bırakılırsa sadece ilk kelimeyi otomatik başlık yapar."` |
| 334 | `Veri Sıfırlama` | `<h3>{lang === "tr" ? "Veri Sıfırlama" : "Data Reset"}</h3>` |
| 355 | `Tüm KPSS konu tamamlama verilerinizi, günlük soru/video istatistiklerinizi, SRS tekrar kartlarınızı ve çıkmış sınav test geçmişinizi sıfırlar.` | `? "Tüm KPSS konu tamamlama verilerinizi, günlük soru/video istatistiklerinizi, SRS tekrar kartlarınızı ve çıkmış sınav t` |
| 387 | `Tüm KPSS Verilerini Sıfırla` | `? "Tüm KPSS Verilerini Sıfırla"` |

### 📄 `src\components\Sidebar.tsx` (6 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 130 | `Odağım (Görev Listesi)` | `(lang === "tr" ? "Odağım (Görev Listesi)" : "My Focus")` |
| 134 | `Kişisel Disiplin` | `t.view_willpower || (lang === "tr" ? "Kişisel Disiplin" : "Willpower")` |
| 148 | `Günlüğüm` | `return t.view_notes || (lang === "tr" ? "Günlüğüm" : "My Diary");` |
| 154 | `Aralıklı Tekrar` | `(lang === "tr" ? "Aralıklı Tekrar" : "Spaced Repetition")` |
| 159 | `Aday Din Görevlisi Yeterlilikleri` | `(lang === "tr" ? "Aday Din Görevlisi Yeterlilikleri" : "Competencies")` |
| 179 | `Ücretsiz Oyunlar` | `(lang === "tr" ? "Ücretsiz Oyunlar" : "Free Games")` |

### 📄 `src\components\stock\AddStockModal.tsx` (5 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 127 | `Hisse Kodu (Örn: KRDMD, SASA, EREGL)` | `placeholder="Hisse Kodu (Örn: KRDMD, SASA, EREGL)"` |
| 149 | `← Popüler hisselerden seç` | `? "← Popüler hisselerden seç"` |
| 150 | `+ Farklı BIST hisse koda sahip ol (Özel kod gir)` | `: "+ Farklı BIST hisse koda sahip ol (Özel kod gir)"}` |
| 161 | `Örn: Kardemir D` | `placeholder="Örn: Kardemir D"` |
| 215 | `Örn: Halka arz katılımı / 1. kademe alım` | `placeholder="Örn: Halka arz katılımı / 1. kademe alım"` |

### 📄 `src\components\stock\BistActionBar.tsx` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 247 | `Canlı Verileri Yenile` | `title="Canlı Verileri Yenile"` |

### 📄 `src\components\stock\BistKesfetTab.tsx` (8 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 235 | `90/100 🐂 Boğa` | `? "90/100 🐂 Boğa"` |
| 237 | `75/100 🐂 Boğa` | `? "75/100 🐂 Boğa"` |
| 239 | `50/100 ⚖️ Nötr` | `? "50/100 ⚖️ Nötr"` |
| 240 | `35/100 🐻 Ayı` | `: "35/100 🐻 Ayı";` |
| 242 | `⚡ BİST İşlem Akışı` | `let tagLabel = "⚡ BİST İşlem Akışı";` |
| 251 | `🚀 Güçlü Yükseliş İvmesi` | `tagLabel = "🚀 Güçlü Yükseliş İvmesi";` |
| 259 | `📉 Düzeltme & Volatilite` | `tagLabel = "📉 Düzeltme & Volatilite";` |
| 525 | `Portföye Ekle` | `title="Portföye Ekle"` |

### 📄 `src\components\stock\BistSearchBar.tsx` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 139 | `Tüm BIST Hisselerini Ara...` | `placeholder="Tüm BIST Hisselerini Ara..."` |

### 📄 `src\components\stock\CustomStockChart.tsx` (2 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 11 | `1 Gün` | `"1d": "1 Gün",` |
| 15 | `1 Yıl` | `"1y": "1 Yıl",` |

### 📄 `src\components\stock\IpoCard.tsx` (4 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 22 | `Şub` | `"Şub",` |
| 28 | `Ağu` | `"Ağu",` |
| 99 | `Tamamlandı` | `? "Tamamlandı"` |
| 101 | `Yakında` | `? "Yakında"` |

### 📄 `src\components\stock\PortfolioTable.tsx` (8 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 178 | `+ Hisse / Varlık Ekle` | `Yukarıdaki "+ Hisse / Varlık Ekle" butonuna basarak ilk alışınızı kaydedebilirsiniz.` |
| 206 | `Grafik Görüntüle` | `title="Grafik Görüntüle"` |
| 231 | `0.00% (Açılış Bekleniyor)` | `? "0.00% (Açılış Bekleniyor)"` |
| 296 | `Kırmızı Mum` | `? "Kırmızı Mum"` |
| 312 | `Alarmı / Kuralı Kaldır` | `title="Alarmı / Kuralı Kaldır"` |
| 348 | `Canlı Grafik Görüntüle` | `title="Canlı Grafik Görüntüle"` |
| 357 | `Fiyat Alarmı Ekle` | `title="Fiyat Alarmı Ekle"` |
| 366 | `AI Analiz & Danışman` | `title="AI Analiz & Danışman"` |

### 📄 `src\components\stock\RuleBuilderModal.tsx` (2 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 110 | `Örn: THYAO` | `placeholder="Örn: THYAO"` |
| 163 | `Örn: 150.00` | `placeholder="Örn: 150.00"` |

### 📄 `src\components\stock\StockAiAnalysisModal.tsx` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 97 | `Sabah BİST Açılış & Takip Listesi Raporu` | `? "Sabah BİST Açılış & Takip Listesi Raporu"` |

### 📄 `src\components\stock\StockAiReportTab.tsx` (8 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 69 | `Portföyümün bugünkü/bu haftaki genel durumunu, risklerini ve dikkat edilmesi gereken konuları Türkçe sade bir gazete özeti olarak çıkar.` | `"Portföyümün bugünkü/bu haftaki genel durumunu, risklerini ve dikkat edilmesi gereken konuları Türkçe sade bir gazete öz` |
| 74 | `Rapor oluşturulurken bir hata meydana geldi. Lütfen 9Router / AI ayarlarınızı kontrol edin.` | `"Rapor oluşturulurken bir hata meydana geldi. Lütfen 9Router / AI ayarlarınızı kontrol edin.",` |
| 103 | `Danışman sorgusu yanıtlanamadı. Lütfen AI ayarlarınızı kontrol edin.` | `"Danışman sorgusu yanıtlanamadı. Lütfen AI ayarlarınızı kontrol edin.",` |
| 173 | `Rapor Hazırlanıyor...` | `{reportLoading ? "Rapor Hazırlanıyor..." : "Rapor Oluştur"}` |
| 225 | `Rapor Oluştur` | `Henüz rapor oluşturulmadı. Yukarıdaki "Rapor Oluştur" butonuna` |
| 278 | `Örn: KRDMD, SASA, EREGL` | `placeholder="Örn: KRDMD, SASA, EREGL"` |
| 294 | `Örn: Bu hisseyi 1 ay tutmak riskli mi?` | `placeholder="Örn: Bu hisseyi 1 ay tutmak riskli mi?"` |
| 313 | `AI Danışmanına Sor` | `: "AI Danışmanına Sor"}` |

### 📄 `src\components\stock\StockKapNewsModal.tsx` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 153 | `Hata oluştu.` | `text: `⚠️ Analiz oluşturulamadı: ${e?.message || "Hata oluştu."}`,` |

### 📄 `src\components\stock\StockWatchlistTable.tsx` (6 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 201 | `Keşfet & Hisse Ara` | `Aşağıdaki "Keşfet & Hisse Ara" sekmesinden ilgilendiğiniz hisseleri ekleyebilirsiniz.` |
| 219 | `Grafik Görüntüle` | `title="Grafik Görüntüle"` |
| 244 | `0.00% (Açılış Bekleniyor)` | `? "0.00% (Açılış Bekleniyor)"` |
| 271 | `Canlı Grafik Görüntüle` | `title="Canlı Grafik Görüntüle"` |
| 280 | `Fiyat Alarmı Ekle` | `title="Fiyat Alarmı Ekle"` |
| 289 | `AI Analiz & Danışman` | `title="AI Analiz & Danışman"` |

### 📄 `src\components\stock\WatchlistSelectorBar.tsx` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 151 | `Liste Adı (ör. Temettü)...` | `placeholder="Liste Adı (ör. Temettü)..."` |

### 📄 `src\components\WillpowerView.tsx` (2 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 123 | `Süreç geçmişini tamamen temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.` | `? "Süreç geçmişini tamamen temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz."` |
| 315 | `Süreç Geçmişini Temizle` | `title="Süreç Geçmişini Temizle"` |

### 📄 `src\content\agent\domAgentEngine.ts` (2 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 243 | `İşlem Yapılıyor` | `badge.innerHTML = `🎯 Browser-Use Agent: ${actionLabel || "İşlem Yapılıyor"}`;` |
| 361 | `Öğe` | `const labelText = targetText || (targetEl as HTMLInputElement).placeholder || targetEl.innerText || "Öğe";` |

### 📄 `src\content\detox\detoxBlocker.ts` (16 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 326 | `Başlamanın yolu konuşmayı bırakıp yapmaya başlamaktır.` | `'"Başlamanın yolu konuşmayı bırakıp yapmaya başlamaktır."',` |
| 327 | `Gelecek, bugünden ona hazırlananlara aittir.` | `'"Gelecek, bugünden ona hazırlananlara aittir."',` |
| 328 | `Zorluklar, başarının değerini artıran süslerdir.` | `'"Zorluklar, başarının değerini artıran süslerdir."',` |
| 329 | `En büyük zaferimiz hiç düşmemek değil, her düştüğümüzde tekrar ayağa kalkabilmektir.` | `'"En büyük zaferimiz hiç düşmemek değil, her düştüğümüzde tekrar ayağa kalkabilmektir."',` |
| 356 | `Odaklanma Zamanı!` | `let titleText = lang === "tr" ? "Odaklanma Zamanı!" : "Time to Focus!";` |
| 359 | `Bu web sitesi, sosyal medya detoksunuz kapsamında engellenmiştir.` | `? "Bu web sitesi, sosyal medya detoksunuz kapsamında engellenmiştir."` |
| 363 | `Odaklanma Zamanı!` | `titleText = lang === "tr" ? "Odaklanma Zamanı!" : "Focus Session!";` |
| 366 | `Bu web sitesi, aktif Pomodoro odaklanma seansınız boyunca geçici olarak engellenmiştir.` | `? "Bu web sitesi, aktif Pomodoro odaklanma seansınız boyunca geçici olarak engellenmiştir."` |
| 370 | `Günlük Limite Ulaştınız!` | `lang === "tr" ? "Günlük Limite Ulaştınız!" : "Daily Limit Reached!";` |
| 381 | `Kalan Odak Süresi` | `? "Kalan Odak Süresi"` |
| 384 | `Detoks Süresi` | `? "Detoks Süresi"` |
| 388 | `Günlük Limit Doldu` | `? "Günlük Limit Doldu"` |
| 391 | `Süresiz Blok` | `? "Süresiz Blok"` |
| 457 | `Bu Sürede Harcayacağın Zamanla:` | `<span>${lang === "tr" ? "Bu Sürede Harcayacağın Zamanla:" : "What You Could Achieve Right Now:"}</span>` |
| 460 | `20+ KPSS sorusu çözebilir` | `<span>• ✍️ ${lang === "tr" ? "20+ KPSS sorusu çözebilir" : "Solve 20+ Practice Questions"}</span>` |
| 462 | `1 Tam Odaklanmış Pomodoro tamamlayabilirdin!` | `<span>• 🎯 ${lang === "tr" ? "1 Tam Odaklanmış Pomodoro tamamlayabilirdin!" : "Complete 1 Focused Pomodoro Session!"}</s` |

### 📄 `src\content\whatsapp\whatsappBridge.ts` (5 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 54 | `📱 Uzaktan Telefon AI Modu Aktif! Telefondan @ai yazıp atabilirsiniz.` | `showToast("📱 Uzaktan Telefon AI Modu Aktif! Telefondan @ai yazıp atabilirsiniz.");` |
| 200 | `API anahtarı` | `trimmed.includes("API anahtarı") ||` |
| 202 | `Görev Yap` | `trimmed.includes("Görev Yap")` |
| 265 | `Üzgünüm, 9Router AI yanıtı oluşturulamadı. Lütfen eklenti ayarlarından API anahtarınızı kontrol edin.` | `"Üzgünüm, 9Router AI yanıtı oluşturulamadı. Lütfen eklenti ayarlarından API anahtarınızı kontrol edin.",` |
| 348 | `Gönder` | `document.querySelector('footer button[aria-label="Gönder"]') ||` |

### 📄 `src\domain\constants\kpssConstants.ts` (10 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 9 | `Türkçe` | `turkce: "Türkçe",` |
| 13 | `Coğrafya` | `cografya: "Coğrafya",` |
| 14 | `Vatandaşlık` | `vatandaslik: "Vatandaşlık",` |
| 15 | `tamamlandı` | `progress_text: "tamamlandı",` |
| 16 | `Henüz veri yok` | `chart_empty: "Henüz veri yok",` |
| 17 | `Günlük İlerleme` | `stats_title: "Günlük İlerleme",` |
| 18 | `Soru Sayısı` | `stat_questions: "Soru Sayısı",` |
| 21 | `Sıfırla` | `reset: "Sıfırla",` |
| 22 | `Tüm KPSS çalışma verileriniz silinecektir. Emin misiniz?` | `reset_confirm: "Tüm KPSS çalışma verileriniz silinecektir. Emin misiniz?",` |
| 23 | `Konu Detayı` | `details_title: "Konu Detayı",` |

### 📄 `src\domain\constants\kpssCurriculum.ts` (153 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 15 | `Sözcükte Anlam` | `title: "Sözcükte Anlam",` |
| 17 | `Gerçek anlam, yan anlam, mecaz anlam, eş ve zıt anlamlı kelimeler, deyimler ve atasözleri konularını kapsar.` | `"Gerçek anlam, yan anlam, mecaz anlam, eş ve zıt anlamlı kelimeler, deyimler ve atasözleri konularını kapsar.",` |
| 21 | `Cümlede Anlam` | `title: "Cümlede Anlam",` |
| 23 | `Öznel-nesnel yargılar, neden-sonuç, amaç-sonuç, koşul cümleleri ve cümle yorumlama.` | `"Öznel-nesnel yargılar, neden-sonuç, amaç-sonuç, koşul cümleleri ve cümle yorumlama.",` |
| 27 | `Paragraf Yapısı ve Anlamı` | `title: "Paragraf Yapısı ve Anlamı",` |
| 29 | `Ana düşünce, yardımcı düşünceler, paragrafın yapısı (giriş, gelişme, sonuç) ve akışı bozan cümleler.` | `"Ana düşünce, yardımcı düşünceler, paragrafın yapısı (giriş, gelişme, sonuç) ve akışı bozan cümleler.",` |
| 33 | `Anlatım Teknikleri` | `title: "Anlatım Teknikleri",` |
| 35 | `Öyküleme, betimleme, açıklama, tartışma yöntemleri ve düşünceyi geliştirme yolları.` | `"Öyküleme, betimleme, açıklama, tartışma yöntemleri ve düşünceyi geliştirme yolları.",` |
| 41 | `Ünlü ve ünsüz düşmesi, türemesi, benzeşmesi, yumuşaması gibi dil bilgisi ses kuralları.` | `"Ünlü ve ünsüz düşmesi, türemesi, benzeşmesi, yumuşaması gibi dil bilgisi ses kuralları.",` |
| 45 | `Sözcükte Yapı` | `title: "Sözcükte Yapı",` |
| 47 | `Kök, gövde, yapım ve çekim ekleri, basit, türemiş ve birleşik sözcük yapıları.` | `"Kök, gövde, yapım ve çekim ekleri, basit, türemiş ve birleşik sözcük yapıları.",` |
| 51 | `Sözcük Türleri (İsim, Sıfat, Zamir...)` | `title: "Sözcük Türleri (İsim, Sıfat, Zamir...)",` |
| 53 | `İsim, sıfat, zamir, zarf, edat, bağlaç, ünlem ve fiillerin özellikleri.` | `"İsim, sıfat, zamir, zarf, edat, bağlaç, ünlem ve fiillerin özellikleri.",` |
| 57 | `Fiilimsiler ve Fiilde Çatı` | `title: "Fiilimsiler ve Fiilde Çatı",` |
| 59 | `İsim-fiil, sıfat-fiil, zarf-fiil özellikleri ve etken, edilgen, geçişli, geçişsiz fiil çatıları.` | `"İsim-fiil, sıfat-fiil, zarf-fiil özellikleri ve etken, edilgen, geçişli, geçişsiz fiil çatıları.",` |
| 63 | `Cümlenin Ögeleri` | `title: "Cümlenin Ögeleri",` |
| 65 | `Özne, yüklem, nesne, dolaylı tümleç ve zarf tümleci bulma yöntemleri.` | `"Özne, yüklem, nesne, dolaylı tümleç ve zarf tümleci bulma yöntemleri.",` |
| 69 | `Cümle Türleri` | `title: "Cümle Türleri",` |
| 71 | `Yüklemin türü, yeri, anlamı ve yapısı (basit, birleşik, sıralı, bağlı) yönünden cümle çeşitleri; Karma Dil Bilgisi sorularında sıkça çıkar.` | `"Yüklemin türü, yeri, anlamı ve yapısı (basit, birleşik, sıralı, bağlı) yönünden cümle çeşitleri; Karma Dil Bilgisi soru` |
| 75 | `Yazım Kuralları` | `title: "Yazım Kuralları",` |
| 77 | `Büyük harflerin kullanımı, sayıların yazımı, birleşik sözcüklerin yazımı ve kısaltmalar.` | `"Büyük harflerin kullanımı, sayıların yazımı, birleşik sözcüklerin yazımı ve kısaltmalar.",` |
| 81 | `Noktalama İşaretleri` | `title: "Noktalama İşaretleri",` |
| 83 | `Nokta, virgül, noktalı virgül ve diğer işaretlerin doğru kullanım alanları.` | `"Nokta, virgül, noktalı virgül ve diğer işaretlerin doğru kullanım alanları.",` |
| 87 | `Anlatım Bozuklukları` | `title: "Anlatım Bozuklukları",` |
| 89 | `Anlamsal ve yapısal anlatım bozuklukları, gereksiz sözcük kullanımı ve mantık hataları.` | `"Anlamsal ve yapısal anlatım bozuklukları, gereksiz sözcük kullanımı ve mantık hataları.",` |
| 93 | `Sözel Mantık` | `title: "Sözel Mantık",` |
| 95 | `Verilen bilgiler ışığında akıl yürütme, tablolama ve çıkarım yapma soruları.` | `"Verilen bilgiler ışığında akıl yürütme, tablolama ve çıkarım yapma soruları.",` |
| 103 | `Rakamlar, sayılar, tam sayılar, doğal sayılar ve temel aritmetik işlemler.` | `"Rakamlar, sayılar, tam sayılar, doğal sayılar ve temel aritmetik işlemler.",` |
| 107 | `Tek / Çift Sayılar` | `title: "Tek / Çift Sayılar",` |
| 109 | `Sayıların teklik ve çiftlik özellikleri ve bu sayılarla yapılan işlemlerin kuralları.` | `"Sayıların teklik ve çiftlik özellikleri ve bu sayılarla yapılan işlemlerin kuralları.",` |
| 113 | `Ardışık Sayılar` | `title: "Ardışık Sayılar",` |
| 115 | `Belli bir kurala göre ardı ardına gelen sayı dizileri ve bunların toplam formülleri.` | `"Belli bir kurala göre ardı ardına gelen sayı dizileri ve bunların toplam formülleri.",` |
| 119 | `Sayı Basamakları` | `title: "Sayı Basamakları",` |
| 120 | `Çözümleme, basamak değeri ve basamaklar arası işlemler.` | `description: "Çözümleme, basamak değeri ve basamaklar arası işlemler.",` |
| 124 | `Bölünebilme Kuralları` | `title: "Bölünebilme Kuralları",` |
| 126 | `2, 3, 4, 5, 8, 9, 10 ve 11 ile bölünebilme kuralları ve kalan bulma.` | `"2, 3, 4, 5, 8, 9, 10 ve 11 ile bölünebilme kuralları ve kalan bulma.",` |
| 132 | `En büyük ortak bölen, en küçük ortak kat bulma formülleri ve EBOB-EKOK problemleri.` | `"En büyük ortak bölen, en küçük ortak kat bulma formülleri ve EBOB-EKOK problemleri.",` |
| 136 | `Faktöriyel / Asal Sayılar` | `title: "Faktöriyel / Asal Sayılar",` |
| 138 | `Faktöriyel kavramı, asal sayılar ve aralarında asal sayılar özellikleri.` | `"Faktöriyel kavramı, asal sayılar ve aralarında asal sayılar özellikleri.",` |
| 142 | `Basit Eşitsizlikler` | `title: "Basit Eşitsizlikler",` |
| 144 | `Büyüklük-küçüklük bağıntıları ve eşitsizliklerin çözüm kümeleri.` | `"Büyüklük-küçüklük bağıntıları ve eşitsizliklerin çözüm kümeleri.",` |
| 148 | `Mutlak Değer` | `title: "Mutlak Değer",` |
| 150 | `Bir sayının başlangıç noktasına uzaklığı ve mutlak değerli denklem/eşitsizlikler.` | `"Bir sayının başlangıç noktasına uzaklığı ve mutlak değerli denklem/eşitsizlikler.",` |
| 154 | `Rasyonel Sayılar` | `title: "Rasyonel Sayılar",` |
| 156 | `Kesirler, ondalık gösterimler ve rasyonel sayılarda dört işlem.` | `"Kesirler, ondalık gösterimler ve rasyonel sayılarda dört işlem.",` |
| 160 | `Üslü / Köklü Sayılar` | `title: "Üslü / Köklü Sayılar",` |
| 162 | `Üslü ifadeler, köklü ifadeler ve bu ifadelerle yapılan temel matematiksel işlemler.` | `"Üslü ifadeler, köklü ifadeler ve bu ifadelerle yapılan temel matematiksel işlemler.",` |
| 166 | `Çarpanlara Ayırma` | `title: "Çarpanlara Ayırma",` |
| 168 | `Özdeşlikler, ortak çarpan parantezine alma ve sadeleştirme yöntemleri.` | `"Özdeşlikler, ortak çarpan parantezine alma ve sadeleştirme yöntemleri.",` |
| 173 | `Bilinmeyenli denklemler ve çözüm yolları.` | `description: "Bilinmeyenli denklemler ve çözüm yolları.",` |
| 177 | `Oran Orantı` | `title: "Oran Orantı",` |
| 179 | `Doğru orantı, ters orantı, bileşik orantı ve ortalama kavramları.` | `"Doğru orantı, ters orantı, bileşik orantı ve ortalama kavramları.",` |
| 183 | `Sayı / Kesir Problemleri` | `title: "Sayı / Kesir Problemleri",` |
| 185 | `Muhakeme yeteneğini ölçen sayısal ve kesirli problem türleri.` | `"Muhakeme yeteneğini ölçen sayısal ve kesirli problem türleri.",` |
| 189 | `Yaş / Hareket Problemleri` | `title: "Yaş / Hareket Problemleri",` |
| 191 | `Yaş hesaplama ve hız-zaman-yol ilişkisi üzerine kurulu problemler.` | `"Yaş hesaplama ve hız-zaman-yol ilişkisi üzerine kurulu problemler.",` |
| 195 | `Yüzde / Kar / Zarar / Karışım` | `title: "Yüzde / Kar / Zarar / Karışım",` |
| 197 | `Yüzde hesaplamaları, ticari kar-zarar ve madde karışım problemleri.` | `"Yüzde hesaplamaları, ticari kar-zarar ve madde karışım problemleri.",` |
| 203 | `Daire, sütun ve çizgi grafikleri ile tabloları okuma, analiz etme ve yorumlama.` | `"Daire, sütun ve çizgi grafikleri ile tabloları okuma, analiz etme ve yorumlama.",` |
| 207 | `İstatistik` | `title: "İstatistik",` |
| 209 | `Mod, medyan, açıklık ve standart sapma gibi temel istatistiksel veriler.` | `"Mod, medyan, açıklık ve standart sapma gibi temel istatistiksel veriler.",` |
| 213 | `Kümeler` | `title: "Kümeler",` |
| 215 | `Kümelerde temel kavramlar, birleşim, kesişim, fark işlemleri ve küme problemleri.` | `"Kümelerde temel kavramlar, birleşim, kesişim, fark işlemleri ve küme problemleri.",` |
| 221 | `Fonksiyon tanımı, çeşitleri, bileşke ve ters fonksiyon işlemleri.` | `"Fonksiyon tanımı, çeşitleri, bileşke ve ters fonksiyon işlemleri.",` |
| 225 | `Permütasyon / Kombinasyon / Olasılık` | `title: "Permütasyon / Kombinasyon / Olasılık",` |
| 227 | `Sıralama (permütasyon), seçme (kombinasyon) ve olasılık hesabı kuralları.` | `"Sıralama (permütasyon), seçme (kombinasyon) ve olasılık hesabı kuralları.",` |
| 231 | `Modüler Aritmetik / İşlem` | `title: "Modüler Aritmetik / İşlem",` |
| 233 | `Özel tanımlı işlemler, modül bulma ve periyodik tekrar eden problemler.` | `"Özel tanımlı işlemler, modül bulma ve periyodik tekrar eden problemler.",` |
| 237 | `Sayısal Mantık` | `title: "Sayısal Mantık",` |
| 239 | `Şekil yeteneği, sayı dizileri ve mantıksal çıkarım soruları.` | `"Şekil yeteneği, sayı dizileri ve mantıksal çıkarım soruları.",` |
| 245 | `Geometrik Kavramlar ve Açılar` | `title: "Geometrik Kavramlar ve Açılar",` |
| 246 | `Nokta, doğru, düzlem kavramları ve temel açı çeşitleri.` | `description: "Nokta, doğru, düzlem kavramları ve temel açı çeşitleri.",` |
| 250 | `Doğruda ve Üçgende Açılar` | `title: "Doğruda ve Üçgende Açılar",` |
| 252 | `Paralel doğrular arası açılar ve üçgenin iç/dış açılarının özellikleri.` | `"Paralel doğrular arası açılar ve üçgenin iç/dış açılarının özellikleri.",` |
| 256 | `Özel Üçgenler` | `title: "Özel Üçgenler",` |
| 258 | `Dik üçgen, ikizkenar üçgen ve eşkenar üçgenin kendine has özellikleri ve Pisagor teoremi.` | `"Dik üçgen, ikizkenar üçgen ve eşkenar üçgenin kendine has özellikleri ve Pisagor teoremi.",` |
| 262 | `Açıortay / Kenarortay` | `title: "Açıortay / Kenarortay",` |
| 263 | `Üçgende iç ve dış açıortay ile kenarortay teoremleri.` | `description: "Üçgende iç ve dış açıortay ile kenarortay teoremleri.",` |
| 267 | `Üçgende Alan / Benzerlik` | `title: "Üçgende Alan / Benzerlik",` |
| 269 | `Üçgenin alan formülleri ve üçgenler arasındaki benzerlik oranları.` | `"Üçgenin alan formülleri ve üçgenler arasındaki benzerlik oranları.",` |
| 273 | `Çokgenler ve Dörtgenler` | `title: "Çokgenler ve Dörtgenler",` |
| 275 | `Kare, dikdörtgen, paralelkenar ve yamuk gibi geometrik şekillerin özellikleri.` | `"Kare, dikdörtgen, paralelkenar ve yamuk gibi geometrik şekillerin özellikleri.",` |
| 279 | `Çember ve Daire` | `title: "Çember ve Daire",` |
| 281 | `Çemberde açılar, uzunluk ve dairenin alan/çevre hesaplamaları.` | `"Çemberde açılar, uzunluk ve dairenin alan/çevre hesaplamaları.",` |
| 287 | `Koordinat sistemi, doğru denklemleri ve nokta-doğru ilişkileri.` | `"Koordinat sistemi, doğru denklemleri ve nokta-doğru ilişkileri.",` |
| 291 | `Katı Cisimler` | `title: "Katı Cisimler",` |
| 293 | `Prizmalar, silindir, piramit ve küre gibi üç boyutlu şekillerin hacim ve alanları.` | `"Prizmalar, silindir, piramit ve küre gibi üç boyutlu şekillerin hacim ve alanları.",` |
| 299 | `İslamiyet Öncesi Türk Tarihi` | `title: "İslamiyet Öncesi Türk Tarihi",` |
| 301 | `Orta Asya Türk devletleri (Hunlar, Göktürkler, Uygurlar) ve göç hareketleri.` | `"Orta Asya Türk devletleri (Hunlar, Göktürkler, Uygurlar) ve göç hareketleri.",` |
| 305 | `İlk Türk İslam Devletleri` | `title: "İlk Türk İslam Devletleri",` |
| 307 | `Karahanlılar, Gazneliler ve Selçuklular dönemi siyasi ve kültürel gelişmeler.` | `"Karahanlılar, Gazneliler ve Selçuklular dönemi siyasi ve kültürel gelişmeler.",` |
| 311 | `Anadolu Selçuklu ve Beylikler` | `title: "Anadolu Selçuklu ve Beylikler",` |
| 313 | `Anadolu'nun türkleşmesi, Selçuklu devleti ve II. Beylikler dönemi.` | `"Anadolu'nun türkleşmesi, Selçuklu devleti ve II. Beylikler dönemi.",` |
| 317 | `Osmanlı Kültür ve Medeniyeti` | `title: "Osmanlı Kültür ve Medeniyeti",` |
| 319 | `Devlet yönetimi, ordu, eğitim ve toplumsal yapı gibi Osmanlı kurumları.` | `"Devlet yönetimi, ordu, eğitim ve toplumsal yapı gibi Osmanlı kurumları.",` |
| 323 | `Osmanlı Siyaseti (Kuruluş-Dağılma)` | `title: "Osmanlı Siyaseti (Kuruluş-Dağılma)",` |
| 325 | `Padişahlar dönemi fetihler, antlaşmalar ve devletin siyasi gelişimi.` | `"Padişahlar dönemi fetihler, antlaşmalar ve devletin siyasi gelişimi.",` |
| 329 | `20. Yüzyılda Osmanlı` | `title: "20. Yüzyılda Osmanlı",` |
| 331 | `Trablusgarp Savaşı, Balkan Savaşları ve I. Dünya Savaşı süreci.` | `"Trablusgarp Savaşı, Balkan Savaşları ve I. Dünya Savaşı süreci.",` |
| 335 | `Kurtuluş Savaşı Hazırlık` | `title: "Kurtuluş Savaşı Hazırlık",` |
| 337 | `Genelgeler, kongreler ve Milli Mücadele'nin teşkilatlanma aşaması.` | `"Genelgeler, kongreler ve Milli Mücadele'nin teşkilatlanma aşaması.",` |
| 343 | `Meclisin açılışı, kabul edilen kanunlar ve iç isyanlara karşı önlemler.` | `"Meclisin açılışı, kabul edilen kanunlar ve iç isyanlara karşı önlemler.",` |
| 347 | `Kurtuluş Savaşı Cepheler` | `title: "Kurtuluş Savaşı Cepheler",` |
| 349 | `Doğu, Güney ve Batı cepheleri; düzenli ordunun savaşları (Sakarya, Büyük Taarruz).` | `"Doğu, Güney ve Batı cepheleri; düzenli ordunun savaşları (Sakarya, Büyük Taarruz).",` |
| 353 | `Cumhuriyet ve İnkılaplar` | `title: "Cumhuriyet ve İnkılaplar",` |
| 355 | `Siyasi, sosyal ve hukuk alanında yapılan modernleşme adımları.` | `"Siyasi, sosyal ve hukuk alanında yapılan modernleşme adımları.",` |
| 359 | `Atatürk İlkeleri` | `title: "Atatürk İlkeleri",` |
| 361 | `Cumhuriyetçilik, Milliyetçilik, Halkçılık, Laiklik, Devletçilik, İnkılapçılık.` | `"Cumhuriyetçilik, Milliyetçilik, Halkçılık, Laiklik, Devletçilik, İnkılapçılık.",` |
| 365 | `Atatürk Dönemi Politika` | `title: "Atatürk Dönemi Politika",` |
| 367 | `İç politika gelişmeleri ve yurtta sulh cihanda sulh temelli dış politika.` | `"İç politika gelişmeleri ve yurtta sulh cihanda sulh temelli dış politika.",` |
| 371 | `Çağdaş Türk ve Dünya Tarihi` | `title: "Çağdaş Türk ve Dünya Tarihi",` |
| 373 | `II. Dünya Savaşı sonrası Türkiye ve dünyadaki önemli gelişmeler.` | `"II. Dünya Savaşı sonrası Türkiye ve dünyadaki önemli gelişmeler.",` |
| 379 | `Türkiye'nin Coğrafi Konumu` | `title: "Türkiye'nin Coğrafi Konumu",` |
| 381 | `Matematiksel ve özel konum, yerel saat farkları ve kuşak özellikleri.` | `"Matematiksel ve özel konum, yerel saat farkları ve kuşak özellikleri.",` |
| 385 | `Türkiye'nin Fiziki Özellikleri` | `title: "Türkiye'nin Fiziki Özellikleri",` |
| 387 | `Dağlar, ovalar, platolar, akarsular ve yer şekillerinin oluşum süreçleri.` | `"Dağlar, ovalar, platolar, akarsular ve yer şekillerinin oluşum süreçleri.",` |
| 391 | `Türkiye'nin Toprak, Su ve Doğal Varlıkları` | `title: "Türkiye'nin Toprak, Su ve Doğal Varlıkları",` |
| 393 | `Toprak tipleri, akarsu rejimleri, göller, yer altı suları ve doğal çevre özellikleri.` | `"Toprak tipleri, akarsu rejimleri, göller, yer altı suları ve doğal çevre özellikleri.",` |
| 397 | `Türkiye'nin İklimi / Bitki Örtüsü` | `title: "Türkiye'nin İklimi / Bitki Örtüsü",` |
| 399 | `Sıcaklık, basınç ve rüzgarların Türkiye üzerindeki etkileri ve bitki türleri.` | `"Sıcaklık, basınç ve rüzgarların Türkiye üzerindeki etkileri ve bitki türleri.",` |
| 403 | `Nüfus ve Yerleşme` | `title: "Nüfus ve Yerleşme",` |
| 405 | `Nüfus sayımları, göçler, yerleşme tipleri ve nüfusun dağılışı.` | `"Nüfus sayımları, göçler, yerleşme tipleri ve nüfusun dağılışı.",` |
| 409 | `Doğal Afetler` | `title: "Doğal Afetler",` |
| 411 | `Deprem, heyelan, erozyon ve sel gibi olayların nedenleri ve sonuçları.` | `"Deprem, heyelan, erozyon ve sel gibi olayların nedenleri ve sonuçları.",` |
| 415 | `Tarım / Hayvancılık` | `title: "Tarım / Hayvancılık",` |
| 417 | `Yetiştirilen tarım ürünleri ve bölgelere göre hayvancılık faaliyetleri.` | `"Yetiştirilen tarım ürünleri ve bölgelere göre hayvancılık faaliyetleri.",` |
| 421 | `Madenler / Enerji Kaynakları` | `title: "Madenler / Enerji Kaynakları",` |
| 423 | `Yeraltı zenginlikleri, yenilenebilir ve yenilenemez enerji kaynakları.` | `"Yeraltı zenginlikleri, yenilenebilir ve yenilenemez enerji kaynakları.",` |
| 427 | `Sanayi ve Endüstri` | `title: "Sanayi ve Endüstri",` |
| 428 | `Sanayi kollarının dağılışı, hammadde ve pazar ilişkileri.` | `description: "Sanayi kollarının dağılışı, hammadde ve pazar ilişkileri.",` |
| 432 | `Ulaşım / Ticaret / Turizm` | `title: "Ulaşım / Ticaret / Turizm",` |
| 434 | `Türkiye'nin iç ve dış ticareti, ulaşım ağları ve önemli turizm merkezleri.` | `"Türkiye'nin iç ve dış ticareti, ulaşım ağları ve önemli turizm merkezleri.",` |
| 438 | `Bölgesel Kalkınma Projeleri` | `title: "Bölgesel Kalkınma Projeleri",` |
| 440 | `GAP, DAP, KOP, DOKAP, ZBK gibi bölgesel kalkınma projelerinin kapsamı ve amaçları.` | `"GAP, DAP, KOP, DOKAP, ZBK gibi bölgesel kalkınma projelerinin kapsamı ve amaçları.",` |
| 446 | `Temel Hukuk Kavramları` | `title: "Temel Hukuk Kavramları",` |
| 447 | `Hukuk kuralları, haklar, ehliyetler ve yaptırım türleri.` | `description: "Hukuk kuralları, haklar, ehliyetler ve yaptırım türleri.",` |
| 451 | `Anayasa Hukuku ve Devlet Yapısı` | `title: "Anayasa Hukuku ve Devlet Yapısı",` |
| 456 | `Türk Anayasa Tarihi` | `title: "Türk Anayasa Tarihi",` |
| 457 | `1921, 1924, 1961 ve 1982 anayasalarının temel özellikleri.` | `description: "1921, 1924, 1961 ve 1982 anayasalarının temel özellikleri.",` |
| 461 | `Temel Hak ve Ödevler` | `title: "Temel Hak ve Ödevler",` |
| 462 | `Kişisel, sosyal ve siyasi hakların kapsamı ve güvenceleri.` | `description: "Kişisel, sosyal ve siyasi hakların kapsamı ve güvenceleri.",` |
| 466 | `Yasama / Yürütme / Yargı` | `title: "Yasama / Yürütme / Yargı",` |
| 468 | `TBMM, Cumhurbaşkanlığı ve mahkemelerin görev, yetki ve işleyişleri.` | `"TBMM, Cumhurbaşkanlığı ve mahkemelerin görev, yetki ve işleyişleri.",` |
| 472 | `İdare Hukuku` | `title: "İdare Hukuku",` |
| 474 | `Merkezden ve yerinden yönetim kuruluşları ve kamu görevlileri.` | `"Merkezden ve yerinden yönetim kuruluşları ve kamu görevlileri.",` |
| 478 | `Seçim ve Siyasi Partiler` | `title: "Seçim ve Siyasi Partiler",` |
| 479 | `Seçim sistemleri, partilerin kurulması ve siyasi katılım.` | `description: "Seçim sistemleri, partilerin kurulması ve siyasi katılım.",` |
| 483 | `Uluslararası Örgütler` | `title: "Uluslararası Örgütler",` |
| 485 | `BM, NATO, AB ve Türkiye'nin üye olduğu diğer uluslararası kuruluşlar.` | `"BM, NATO, AB ve Türkiye'nin üye olduğu diğer uluslararası kuruluşlar.",` |
| 489 | `Bilim ve Teknoloji Gelişmeleri` | `title: "Bilim ve Teknoloji Gelişmeleri",` |
| 490 | `Son yıllardaki bilimsel keşifler ve teknolojik yenilikler.` | `description: "Son yıllardaki bilimsel keşifler ve teknolojik yenilikler.",` |
| 494 | `Güncel Olaylar` | `title: "Güncel Olaylar",` |
| 496 | `Yılın önemli haberleri, kültürel başarılar ve güncel tartışmalar.` | `"Yılın önemli haberleri, kültürel başarılar ve güncel tartışmalar.",` |

### 📄 `src\domain\constants\kpssFlashcards.ts` (34 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 18 | `İlk Türk devletlerinde hükümdarın egemenlik yetkisini tanrısal kaynaklı almasına ne ad verilir?` | `"İlk Türk devletlerinde hükümdarın egemenlik yetkisini tanrısal kaynaklı almasına ne ad verilir?",` |
| 19 | `Kut İnancı` | `answer: "Kut İnancı",` |
| 20 | `K harfi ile başlar.` | `hint: "K harfi ile başlar.",` |
| 26 | `Osmanlı Devleti'nde padişahın mutlak otoritesini sınırlandıran ilk yazılı belge hangisidir?` | `"Osmanlı Devleti'nde padişahın mutlak otoritesini sınırlandıran ilk yazılı belge hangisidir?",` |
| 27 | `Sened-i İttifak (1808)` | `answer: "Sened-i İttifak (1808)",` |
| 28 | `II. Mahmut dönemi, Ayanlar ile yapılmıştır.` | `hint: "II. Mahmut dönemi, Ayanlar ile yapılmıştır.",` |
| 34 | `Türkiye'nin en yüksek zirvesi olan Ağrı Dağı hangi dağ oluşum türüne (orojenez) örnektir?` | `"Türkiye'nin en yüksek zirvesi olan Ağrı Dağı hangi dağ oluşum türüne (orojenez) örnektir?",` |
| 35 | `Volkanik Dağ` | `answer: "Volkanik Dağ",` |
| 36 | `Magmanın yeryüzüne çıkıp soğumasıyla oluşmuştur.` | `hint: "Magmanın yeryüzüne çıkıp soğumasıyla oluşmuştur.",` |
| 37 | `Coğrafya` | `category: "Coğrafya",` |
| 42 | `Osmanlı Devleti ile Rusya arasında yapılan ve Osmanlı'nın ilk kez savaş tazminatı ödediği antlaşma hangisidir?` | `"Osmanlı Devleti ile Rusya arasında yapılan ve Osmanlı'nın ilk kez savaş tazminatı ödediği antlaşma hangisidir?",` |
| 43 | `Küçük Kaynarca Antlaşması (1774)` | `answer: "Küçük Kaynarca Antlaşması (1774)",` |
| 44 | `Kırım'ın bağımsız olduğu antlaşmadır.` | `hint: "Kırım'ın bağımsız olduğu antlaşmadır.",` |
| 50 | `1982 Anayasası'na göre TBMM milletvekili genel seçimleri kaç yılda bir yapılır?` | `"1982 Anayasası'na göre TBMM milletvekili genel seçimleri kaç yılda bir yapılır?",` |
| 51 | `5 yılda bir` | `answer: "5 yılda bir",` |
| 52 | `Cumhurbaşkanlığı seçimleri ile aynı gün yapılır.` | `hint: "Cumhurbaşkanlığı seçimleri ile aynı gün yapılır.",` |
| 53 | `Vatandaşlık` | `category: "Vatandaşlık",` |
| 58 | `Türkiye'de doğup Gürcistan topraklarından Karadeniz'e dökülen, en hızlı akışa sahip nehir hangisidir?` | `"Türkiye'de doğup Gürcistan topraklarından Karadeniz'e dökülen, en hızlı akışa sahip nehir hangisidir?",` |
| 59 | `Çoruh Nehri` | `answer: "Çoruh Nehri",` |
| 60 | `Doğu Karadeniz bölümündedir.` | `hint: "Doğu Karadeniz bölümündedir.",` |
| 61 | `Coğrafya` | `category: "Coğrafya",` |
| 66 | `Kurtuluş Savaşı cepheler dönemini kapatan ve Mudanya Ateşkes Antlaşması'na zemin hazırlayan son askeri zafer hangisidir?` | `"Kurtuluş Savaşı cepheler dönemini kapatan ve Mudanya Ateşkes Antlaşması'na zemin hazırlayan son askeri zafer hangisidir` |
| 67 | `Büyük Taarruz (Başkomutanlık Meydan Muharebesi)` | `answer: "Büyük Taarruz (Başkomutanlık Meydan Muharebesi)",` |
| 68 | `Ordular ilk hedefiniz Akdeniz'dir emrinin verildiği savaş.` | `hint: "Ordular ilk hedefiniz Akdeniz'dir emrinin verildiği savaş.",` |
| 74 | `Anayasa Mahkemesi üye sayısı 2017 anayasa değişikliği ile kaç olarak belirlenmiştir?` | `"Anayasa Mahkemesi üye sayısı 2017 anayasa değişikliği ile kaç olarak belirlenmiştir?",` |
| 75 | `15 Üye` | `answer: "15 Üye",` |
| 76 | `Üyelerin bir kısmını Cumhurbaşkanı, bir kısmını TBMM seçer.` | `hint: "Üyelerin bir kısmını Cumhurbaşkanı, bir kısmını TBMM seçer.",` |
| 77 | `Vatandaşlık` | `category: "Vatandaşlık",` |
| 82 | `Ülkemizde rüzgar erozyonunun ve rüzgar şekillerinin en fazla görüldüğü coğrafi bölge hangisidir?` | `"Ülkemizde rüzgar erozyonunun ve rüzgar şekillerinin en fazla görüldüğü coğrafi bölge hangisidir?",` |
| 83 | `İç Anadolu Bölgesi` | `answer: "İç Anadolu Bölgesi",` |
| 84 | `Kuraklık ve bitki örtüsünün cılız olması etkilidir.` | `hint: "Kuraklık ve bitki örtüsünün cılız olması etkilidir.",` |
| 85 | `Coğrafya` | `category: "Coğrafya",` |
| 90 | `Milli Mücadele'nin gerekçesi, amacı ve yönteminin ilk kez belirtildiği ihtilal belgesi niteliğindeki genelge hangisidir?` | `"Milli Mücadele'nin gerekçesi, amacı ve yönteminin ilk kez belirtildiği ihtilal belgesi niteliğindeki genelge hangisidir` |
| 92 | `Mustafa Kemal, Rauf Orbay, Ali Fuat Cebesoy gibi isimlerin imzası bulunur.` | `hint: "Mustafa Kemal, Rauf Orbay, Ali Fuat Cebesoy gibi isimlerin imzası bulunur.",` |

### 📄 `src\domain\data\hifizData.ts` (64 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 18 | `Ayet-el Kürsi (Bakara 255)` | `title: "Ayet-el Kürsi (Bakara 255)",` |
| 27 | `Amenerrasulü (Bakara 285-286)` | `title: "Amenerrasulü (Bakara 285-286)",` |
| 36 | `Hüvallahüllezi (Haşr 20-24)` | `title: "Hüvallahüllezi (Haşr 20-24)",` |
| 56 | `Mülk Suresi (Tebareke)` | `title: "Mülk Suresi (Tebareke)",` |
| 85 | `İnşirah Suresi` | `title: "İnşirah Suresi",` |
| 157 | `Tekasür Suresi` | `title: "Tekasür Suresi",` |
| 175 | `Hümeze Suresi` | `title: "Hümeze Suresi",` |
| 193 | `Kureyş Suresi` | `title: "Kureyş Suresi",` |
| 247 | `İhlas Suresi` | `title: "İhlas Suresi",` |
| 276 | `Yemek Duası` | `title: "Yemek Duası",` |
| 283 | `Ezan Duası` | `title: "Ezan Duası",` |
| 290 | `Vaaza Başlama Duası` | `title: "Vaaza Başlama Duası",` |
| 297 | `Cenaze Duaları` | `title: "Cenaze Duaları",` |
| 304 | `Hutbe Duaları` | `title: "Hutbe Duaları",` |
| 327 | `1. Kur’an-ı Kerim’i yüzüne okur.` | `title: "1. Kur’an-ı Kerim’i yüzüne okur.",` |
| 329 | `Kur'an-ı Kerim'i tecvit kurallarına uygun, akıcı ve doğru bir şekilde, mahreçlerine dikkat ederek yüzünden okuma becerisini ifade eder.` | `"Kur'an-ı Kerim'i tecvit kurallarına uygun, akıcı ve doğru bir şekilde, mahreçlerine dikkat ederek yüzünden okuma beceri` |
| 333 | `2. Yasin, Mülk, Nebe sureleriyle Duha’dan Nâs’a kadar olan sureleri, Bakara Suresi 1-5, 255, 285-286, Haşr Suresi 20-24. ayetleri ezbere okur.` | `"2. Yasin, Mülk, Nebe sureleriyle Duha’dan Nâs’a kadar olan sureleri, Bakara Suresi 1-5, 255, 285-286, Haşr Suresi 20-24` |
| 335 | `İmam-hatiplik için temel teşkil eden bu sure ve ayetlerin, ezberden, tecvit ve mahreç kurallarına tam uyum içerisinde okunabilmesi gerekliliğidir.` | `"İmam-hatiplik için temel teşkil eden bu sure ve ayetlerin, ezberden, tecvit ve mahreç kurallarına tam uyum içerisinde o` |
| 339 | `3. Fatiha ile Fil - Nas arası sûrelerin anlamlarını genel hatlarıyla bilir.` | `"3. Fatiha ile Fil - Nas arası sûrelerin anlamlarını genel hatlarıyla bilir.",` |
| 341 | `Namazlarda en sık okunan bu surelerin kelime ve cümle anlamlarını, genel mesajlarını ve neden indirildiklerini (nüzul sebepleri) bilmeyi kapsar.` | `"Namazlarda en sık okunan bu surelerin kelime ve cümle anlamlarını, genel mesajlarını ve neden indirildiklerini (nüzul s` |
| 344 | `4. Temel tecvit kurallarını uygular.` | `title: "4. Temel tecvit kurallarını uygular.",` |
| 346 | `Medler, idgamlar, ihfa, izhar, iklab ve ra harfinin okunuşu gibi Kur'an-ı Kerim'i güzel okuma kurallarını uygulamalı olarak bilmek.` | `"Medler, idgamlar, ihfa, izhar, iklab ve ra harfinin okunuşu gibi Kur'an-ı Kerim'i güzel okuma kurallarını uygulamalı ol` |
| 350 | `5. Kur'an-ı Kerim’le ilgili ayet, sûre, meal vb. temel kavramları bilir.` | `"5. Kur'an-ı Kerim’le ilgili ayet, sûre, meal vb. temel kavramları bilir.",` |
| 352 | `Vahiy, mushaf, cüz, ayet, sure ve meal gibi Kur'an ilimlerine giriş niteliğindeki temel terimlerin tanımlarını bilmektir.` | `"Vahiy, mushaf, cüz, ayet, sure ve meal gibi Kur'an ilimlerine giriş niteliğindeki temel terimlerin tanımlarını bilmekti` |
| 356 | `6. İtikat, ibadet, ahlak ve siyer ile ilgili temel kavramları bilir.` | `"6. İtikat, ibadet, ahlak ve siyer ile ilgili temel kavramları bilir.",` |
| 358 | `Din hizmetlerinin temelini oluşturan inanç, amel, etik ve Hz. Peygamber’in hayatına dair temel terminolojiye hakimiyet.` | `"Din hizmetlerinin temelini oluşturan inanç, amel, etik ve Hz. Peygamber’in hayatına dair temel terminolojiye hakimiyet.` |
| 361 | `7. İslam inanç, ibadet ve ahlakının temel esaslarını bilir.` | `title: "7. İslam inanç, ibadet ve ahlakının temel esaslarını bilir.",` |
| 363 | `İmanın ve İslam’ın şartları, temel ahlaki prensipler ve bu esasların dayandığı temel deliller hakkında bilgi sahibi olmak.` | `"İmanın ve İslam’ın şartları, temel ahlaki prensipler ve bu esasların dayandığı temel deliller hakkında bilgi sahibi olm` |
| 366 | `8. İtikadî ve fıkhî mezhepleri sayar.` | `title: "8. İtikadî ve fıkhî mezhepleri sayar.",` |
| 368 | `Ehl-i Sünnet ve diğer mezheplerin (Hanefi, Şafii, Maturidi, Eş'ari vb.) temel ayırıcı özelliklerini ve kurucularını bilir.` | `"Ehl-i Sünnet ve diğer mezheplerin (Hanefi, Şafii, Maturidi, Eş'ari vb.) temel ayırıcı özelliklerini ve kurucularını bil` |
| 371 | `9. Temel İslam Bilimlerinin ana konularını bilir.` | `title: "9. Temel İslam Bilimlerinin ana konularını bilir.",` |
| 373 | `Tefsir, Hadis, Fıkıh, Kelam, Tasavvuf ve İslam Tarihi gibi ana disiplinlerin çalıştığı temel mevzuları kavramak.` | `"Tefsir, Hadis, Fıkıh, Kelam, Tasavvuf ve İslam Tarihi gibi ana disiplinlerin çalıştığı temel mevzuları kavramak.",` |
| 376 | `10. Kur’an ve sünnetin İslam dinindeki yeri ve önemini bilir.` | `title: "10. Kur’an ve sünnetin İslam dinindeki yeri ve önemini bilir.",` |
| 378 | `İslam hukukunun ve yaşantısının ana kaynakları olan Kur’an ve Sünnet’in hiyerarşisi, birbirini tamamlaması ve dindeki otoritesini bilmek.` | `"İslam hukukunun ve yaşantısının ana kaynakları olan Kur’an ve Sünnet’in hiyerarşisi, birbirini tamamlaması ve dindeki o` |
| 381 | `11. Hz. Peygamberin hayatını genel hatlarıyla bilir.` | `title: "11. Hz. Peygamberin hayatını genel hatlarıyla bilir.",` |
| 383 | `Hz. Muhammed'in (sav) çocukluğu, gençliği, peygamberliği ve vefatına kadar olan dönemi, kazandığı önemli başarıları ve örnek kişiliği.` | `"Hz. Muhammed'in (sav) çocukluğu, gençliği, peygamberliği ve vefatına kadar olan dönemi, kazandığı önemli başarıları ve ` |
| 386 | `12. Hutbe ve vaaz dualarını bilir.` | `title: "12. Hutbe ve vaaz dualarını bilir.",` |
| 388 | `Minberde veya kürsüde okunması gereken Arapça başlangıç ve bitiş dualarını, hamdele ve salveleleri ezbere ve doğru okumak.` | `"Minberde veya kürsüde okunması gereken Arapça başlangıç ve bitiş dualarını, hamdele ve salveleleri ezbere ve doğru okum` |
| 391 | `13. Yapılması mutad olan duaları (cenaze, ezan, yemek vb.) bilir.` | `title: "13. Yapılması mutad olan duaları (cenaze, ezan, yemek vb.) bilir.",` |
| 393 | `Toplumun her kesiminde ihtiyaç duyulan yemek, ezan, cenaze telkini ve şükür dualarını usulüne uygun yapabilme becerisi.` | `"Toplumun her kesiminde ihtiyaç duyulan yemek, ezan, cenaze telkini ve şükür dualarını usulüne uygun yapabilme becerisi.` |
| 396 | `14. Müslümanların bilim, kültür ve medeniyete katkılarını bilir.` | `title: "14. Müslümanların bilim, kültür ve medeniyete katkılarını bilir.",` |
| 398 | `İslam medeniyetinin altın çağında bilim, sanat ve mimari alanında yapılan keşifler ve dünya medeniyetine yön veren Müslüman bilginler.` | `"İslam medeniyetinin altın çağında bilim, sanat ve mimari alanında yapılan keşifler ve dünya medeniyetine yön veren Müsl` |
| 402 | `15. Ulusal ve uluslararası güncel dini gelişmeleri genel hatlarıyla bilir.` | `"15. Ulusal ve uluslararası güncel dini gelişmeleri genel hatlarıyla bilir.",` |
| 404 | `Dini hayatı etkileyen güncel tartışmalar, fetvalar ve uluslararası platformlarda dini kurumların tutumları hakkında farkındalık.` | `"Dini hayatı etkileyen güncel tartışmalar, fetvalar ve uluslararası platformlarda dini kurumların tutumları hakkında far` |
| 407 | `16. Yaşayan dünya dinlerini genel hatlarıyla bilir.` | `title: "16. Yaşayan dünya dinlerini genel hatlarıyla bilir.",` |
| 409 | `Yahudilik, Hristiyanlık, Budizm gibi dinlerin temel inanışlarını ve bu dinlerle İslam arasındaki benzerlik/farklılıkları ana hatlarıyla bilmek.` | `"Yahudilik, Hristiyanlık, Budizm gibi dinlerin temel inanışlarını ve bu dinlerle İslam arasındaki benzerlik/farklılıklar` |
| 412 | `17. Türkiye’nin sosyo-kültürel ve dini özelliklerini bilir.` | `title: "17. Türkiye’nin sosyo-kültürel ve dini özelliklerini bilir.",` |
| 414 | `Ülkemizin dini yapısı, geleneksel dini anlayışlar, vakıflar, dernekler ve halkın dini beklentileri hakkında bilgi.` | `"Ülkemizin dini yapısı, geleneksel dini anlayışlar, vakıflar, dernekler ve halkın dini beklentileri hakkında bilgi.",` |
| 417 | `18. Görevinin gerektirdiği temsil özelliklerini bilir.` | `title: "18. Görevinin gerektirdiği temsil özelliklerini bilir.",` |
| 419 | `Bir din görevlisinin toplum önündeki duruşu, giyim-kuşamı, konuşma üslubu ve sergilemesi gereken örnek karakter özellikleridir.` | `"Bir din görevlisinin toplum önündeki duruşu, giyim-kuşamı, konuşma üslubu ve sergilemesi gereken örnek karakter özellik` |
| 423 | `19. Sesini ve nefesini doğru ve etkili kullanma becerisine sahiptir.` | `"19. Sesini ve nefesini doğru ve etkili kullanma becerisine sahiptir.",` |
| 425 | `Ezan, sala ve hutbe icrasında sesini koruyarak doğru tekniklerle nefes alma ve sesini en gür ve etkili tonda kullanma kabiliyeti.` | `"Ezan, sala ve hutbe icrasında sesini koruyarak doğru tekniklerle nefes alma ve sesini en gür ve etkili tonda kullanma k` |
| 428 | `20. Cami mûsikisinde uygulanan makamları tanır.` | `title: "20. Cami mûsikisinde uygulanan makamları tanır.",` |
| 430 | `Ezan ve salada kullanılan Hicaz, Rast, Segah, Saba ve Uşşak gibi temel makamların kulak dolgunluğuna ve teknik özelliklerine sahip olmak.` | `"Ezan ve salada kullanılan Hicaz, Rast, Segah, Saba ve Uşşak gibi temel makamların kulak dolgunluğuna ve teknik özellikl` |
| 434 | `21. Cami musikisinin temel formlarından olan ezan, kamet ve salayı okur.` | `"21. Cami musikisinin temel formlarından olan ezan, kamet ve salayı okur.",` |
| 436 | `Ezanın, kametin ve selanın kendi usul, adap ve makamlarına uygun olarak icra edilebilmesi becerisini ifade eder.` | `"Ezanın, kametin ve selanın kendi usul, adap ve makamlarına uygun olarak icra edilebilmesi becerisini ifade eder.",` |
| 440 | `22. Diyanet İşleri Başkanlığının teşkilat yapısını ve görevlerini genel hatlarıyla bilir.` | `"22. Diyanet İşleri Başkanlığının teşkilat yapısını ve görevlerini genel hatlarıyla bilir.",` |
| 442 | `Başkanlığın merkez, taşra ve yurt dışı teşkilat şeması ile 633 sayılı kanun çerçevesindeki yasal görevlerini bilmek.` | `"Başkanlığın merkez, taşra ve yurt dışı teşkilat şeması ile 633 sayılı kanun çerçevesindeki yasal görevlerini bilmek.",` |
| 445 | `23. Türkçeyi doğru ve etkili biçimde kullanır.` | `title: "23. Türkçeyi doğru ve etkili biçimde kullanır.",` |
| 447 | `İrşat faaliyetlerinde (hutbe, vaaz) dil bilgisi kurallarına uygun, açık, anlaşılır ve etkileyici bir hitabet diline sahip olmak.` | `"İrşat faaliyetlerinde (hutbe, vaaz) dil bilgisi kurallarına uygun, açık, anlaşılır ve etkileyici bir hitabet diline sah` |
| 450 | `24. Bilişim teknolojilerini kullanma becerisine sahiptir.` | `title: "24. Bilişim teknolojilerini kullanma becerisine sahiptir.",` |
| 452 | `İdari işlerde bilgisayar kullanımı, e-posta, Office programları ve kurumsal veri tabanlarını (DHYS vb.) kullanabilme yetisi.` | `"İdari işlerde bilgisayar kullanımı, e-posta, Office programları ve kurumsal veri tabanlarını (DHYS vb.) kullanabilme ye` |
| 455 | `25. Muhatapları ile iletişim kurma becerisine sahiptir.` | `title: "25. Muhatapları ile iletişim kurma becerisine sahiptir.",` |
| 457 | `Cemaat, gençler ve toplumun her kesimiyle sağlıklı empati kurabilme, çatışmaları yönetme ve doğru iletişim dili kullanma yetkinliği.` | `"Cemaat, gençler ve toplumun her kesimiyle sağlıklı empati kurabilme, çatışmaları yönetme ve doğru iletişim dili kullanm` |

### 📄 `src\domain\services\detoxMotivationalService.ts` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 24 | `Süresiz Odaklanma: Tüm hedeflerini başarmak için önünde sınırsız zaman var!` | `? "Süresiz Odaklanma: Tüm hedeflerini başarmak için önünde sınırsız zaman var!"` |

### 📄 `src\domain\services\KpssCalculatorService.ts` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 17 | `Sınav Başladı!` | `return lang === "tr" ? "Sınav Başladı!" : "Exam Started!";` |

### 📄 `src\services\agentToolService.ts` (3 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 67 | `Öğe` | `const targetName = act.targetText || act.selector || (isTr ? "Öğe" : "Element");` |
| 82 | `yukarı` | `? `✓ Sayfa ${act.direction === "up" ? "yukarı" : "aşağı"} kaydırıldı.`` |
| 113 | `}${clickCount > 0 ? `, ${clickCount} tıklama` : ` | `? `✓ ${actions.length} adet işlem başarıyla yürütüldü (${typeCount > 0 ? `${typeCount} yazma` : ""}${clickCount > 0 ? `,` |

### 📄 `src\services\aiChatService.ts` (3 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 260 | `9Router / OpenRouter API anahtarı geçersiz veya eksik. Lütfen Ayarlar > AI Asistan menüsünden API anahtarınızı kontrol edin.` | `"9Router / OpenRouter API anahtarı geçersiz veya eksik. Lütfen Ayarlar > AI Asistan menüsünden API anahtarınızı kontrol ` |
| 451 | `## 💡 AI Tarafından Öğrenilen Bilgiler` | `} else if (updatedMemory.includes("## 💡 AI Tarafından Öğrenilen Bilgiler")) {` |
| 453 | `## 💡 AI Tarafından Öğrenilen Bilgiler` | `"## 💡 AI Tarafından Öğrenilen Bilgiler",` |

### 📄 `src\services\aiCompanionService.ts` (2 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 84 | `Bu video için otomatik veya eklenmiş alt yazı/transkript bulunamadı.` | `"Bu video için otomatik veya eklenmiş alt yazı/transkript bulunamadı.",` |
| 96 | `Transkript detayı alınamadı.` | `throw new Error("Transkript detayı alınamadı.");` |

### 📄 `src\services\ipoService.ts` (11 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 26 | `Yıldız Holding` | `name: "Yıldız Holding",` |
| 28 | `Gıda & İçecek` | `sector: "Gıda & İçecek",` |
| 38 | `Türkiye Sigorta` | `name: "Türkiye Sigorta",` |
| 40 | `Sigortacılık` | `sector: "Sigortacılık",` |
| 50 | `Koç Fintekh` | `name: "Koç Fintekh",` |
| 55 | `Yakında açıklanacak` | `priceRange: "Yakında açıklanacak",` |
| 62 | `Pegasus Havacılık Teknoloji` | `name: "Pegasus Havacılık Teknoloji",` |
| 74 | `Enerjisa Enerji Çözümleri` | `name: "Enerjisa Enerji Çözümleri",` |
| 86 | `Global Liman İşletmeleri` | `name: "Global Liman İşletmeleri",` |
| 121 | `Hazırlanıyor` | `dateStr.includes("Hazırlanıyor") ||` |
| 248 | `Detaylar için siteyi ziyaret edin` | `priceRange: "Detaylar için siteyi ziyaret edin",` |

### 📄 `src\services\kapNewsService.ts` (6 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 133 | `THYAO - Yeni Uçak Alım ve Filo Genişletme Sözleşmesi` | `title: "THYAO - Yeni Uçak Alım ve Filo Genişletme Sözleşmesi",` |
| 135 | `Türk Hava Yolları, filo genişletme stratejisi kapsamında yeni uçak siparişlerinin teslimatı konusunda anlaşmaya varıldığını bildirdi.` | `"Türk Hava Yolları, filo genişletme stratejisi kapsamında yeni uçak siparişlerinin teslimatı konusunda anlaşmaya varıldı` |
| 142 | `KRDMD - İhracat Anlaşması ve Kapasite Artışı Bildirimi` | `title: "KRDMD - İhracat Anlaşması ve Kapasite Artışı Bildirimi",` |
| 144 | `Kardemir, yeni ray ve ağır profil üretim hattından yurtdışına 500 milyon TL tutarında satış sözleşmesi imzalandığını bildirdi.` | `"Kardemir, yeni ray ve ağır profil üretim hattından yurtdışına 500 milyon TL tutarında satış sözleşmesi imzalandığını bi` |
| 151 | `EREGL - Temettü Dağıtım Kararı ve Yatırım Planı` | `title: "EREGL - Temettü Dağıtım Kararı ve Yatırım Planı",` |
| 153 | `Ereğli Demir Çelik, yeni çelik tesisi yatırımı ve temettü ödeme takvimi hakkında kamuoyunu bilgilendirdi.` | `"Ereğli Demir Çelik, yeni çelik tesisi yatırımı ve temettü ödeme takvimi hakkında kamuoyunu bilgilendirdi.",` |

### 📄 `src\services\kpssPrompts.ts` (23 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 25 | `Grafik Başlığı` | `- Sütun Grafiği: { "type": "bar", "title": "Grafik Başlığı", "labels": ["Oca", "Şub", "Mar"], "values": [15, 30, 25] }` |
| 26 | `Grafik Başlığı` | `- Çizgi Grafiği: { "type": "line", "title": "Grafik Başlığı", "labels": ["1990", "2000", "2010"], "values": [120, 250, 4` |
| 33 | `Aşağıdaki şekilde [AB] // [CD] paralel doğruları d doğrusu ile kesilmektedir. Oluşan açılar şekilde verilmiştir. Buna göre x açısı kaç derecedir?` | `"question": "Aşağıdaki şekilde [AB] // [CD] paralel doğruları d doğrusu ile kesilmektedir. Oluşan açılar şekilde verilmi` |
| 36 | `İç ters açılar kuralına göre [AB] ve [CD] paralel doğruları arasındaki zıt yöne bakan açılar eşittir. Bu nedenle x = 60 derecedir.` | `"solution": "İç ters açılar kuralına göre [AB] ve [CD] paralel doğruları arasındaki zıt yöne bakan açılar eşittir. Bu ne` |
| 51 | `Aynı anda farklı mevsim özelliklerinin yaşanması` | `1. Bilimsel ve Akademik Doğruluk: Sorularda ve şıklarda hiçbir coğrafi çelişki olmamalıdır. Örneğin; "Aynı anda farklı m` |
| 52 | `Coğrafi konum` | `2. Soru köklerinde "Coğrafi konum" gibi genel ifadeler yerine, sorunun hedefine göre "Matematik (Mutlak) Konum" veya "Gö` |
| 53 | `Haritada numaralandırılmış alanların hangisinde...` | `3. Eğer hazırladığın soru Türkiye Coğrafyası dersiyle ilgili ve harita bilgisi okumayı gerektiriyorsa (örn: "Haritada nu` |
| 66 | `Türkiye’nin göreceli (özel) konumu, ülkenin denizellik-karasallık, yükselti ve jeopolitik özelliklerinin bir sonucudur. Buna göre, aşağıdakilerden hangisi Türkiye'nin göreceli konumuyla açıklanan bir durumdur?` | `"question": "Türkiye’nin göreceli (özel) konumu, ülkenin denizellik-karasallık, yükselti ve jeopolitik özelliklerinin bi` |
| 68 | `Dört mevsim belirgin iklim koşullarının yaşanması` | `"Dört mevsim belirgin iklim koşullarının yaşanması",` |
| 69 | `Güneş ışınlarının hiçbir zaman dik açıyla düşmemesi` | `"Güneş ışınlarının hiçbir zaman dik açıyla düşmemesi",` |
| 70 | `Aynı anda farklı iklim ve hava koşullarının görülebilmesi` | `"Aynı anda farklı iklim ve hava koşullarının görülebilmesi",` |
| 71 | `Kuzey rüzgarlarının sıcaklığı düşürücü etki yapması` | `"Kuzey rüzgarlarının sıcaklığı düşürücü etki yapması",` |
| 72 | `Yıl boyunca batı rüzgarlarının etkisinde bulunması` | `"Yıl boyunca batı rüzgarlarının etkisinde bulunması"` |
| 75 | `Aynı anda farklı iklim ve hava özelliklerinin (örneğin Antalya'da denize girilirken Erzurum'da kayak yapılması) yaşanması yükselti ve kısa mesafede değişen yer şekilleriyle ilgilidir ve bu göreceli (özel) konumdur. Diğer şıklar ise enlem ve orta kuşakta yer alma ile ilgili mutlak konumun sonuçlarıdır.` | `"solution": "Aynı anda farklı iklim ve hava özelliklerinin (örneğin Antalya'da denize girilirken Erzurum'da kayak yapılm` |
| 94 | `Osmanlı Devleti’nde Lale Devri (1718-1730) boyunca batı tarzı yenilikler yapılmaya başlanmıştır. Aşağıdakilerden hangisi bu dönemde gerçekleştirilen yeniliklerden biri değildir?` | `"question": "Osmanlı Devleti’nde Lale Devri (1718-1730) boyunca batı tarzı yenilikler yapılmaya başlanmıştır. Aşağıdakil` |
| 96 | `İlk kez geçici elçiliklerin açılması` | `"İlk kez geçici elçiliklerin açılması",` |
| 97 | `Nizam-ı Cedit adıyla yeni bir ordunun kurulması` | `"Nizam-ı Cedit adıyla yeni bir ordunun kurulması",` |
| 98 | `Yalova'da kağıt imalathanesinin kurulması` | `"Yalova'da kağıt imalathanesinin kurulması",` |
| 99 | `İlk kez çiçek aşısı uygulamasının yapılması` | `"İlk kez çiçek aşısı uygulamasının yapılması",` |
| 100 | `İbrahim Müteferrika tarafından matbaanın getirilmesi` | `"İbrahim Müteferrika tarafından matbaanın getirilmesi"` |
| 103 | `Nizam-ı Cedit ordusunun kurulması III. Selim dönemi yeniliklerindendir. Lale Devri (III. Ahmed dönemi) yeniliği değildir. Diğer seçenekler Lale Devri'ne aittir.` | `"solution": "Nizam-ı Cedit ordusunun kurulması III. Selim dönemi yeniliklerindendir. Lale Devri (III. Ahmed dönemi) yeni` |
| 129 | `A seçeneği` | `"options": ["A seçeneği", "B seçeneği", "C seçeneği", "D seçeneği", "E seçeneği"],` |
| 131 | `Sorunun detaylı çözümü...` | `"solution": "Sorunun detaylı çözümü...",` |

### 📄 `src\services\kpssWikiService.ts` (4 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 38 | `Coğrafi Konumu` | `!n.title.includes("Coğrafi Konumu") &&` |
| 204 | `KPSS Coğrafya` | `return "KPSS Coğrafya";` |
| 206 | `KPSS Vatandaşlık` | `return "KPSS Vatandaşlık";` |
| 208 | `KPSS Türkçe` | `return "KPSS Türkçe";` |

### 📄 `src\services\stockAiService.ts` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 190 | `85/100 🐂 Boğa` | `const scoreText = isUp ? "85/100 🐂 Boğa" : "40/100 🐻 Ayı";` |

### 📄 `src\services\stockPrompts.ts` (6 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 10 | `\n\n⚠️ YASAL UYARI: Bu analiz yapay zeka tarafından derlenmiş olup kesinlikle Yatırım Tavsiyesi Değildir (YTD).` | `"\n\n⚠️ YASAL UYARI: Bu analiz yapay zeka tarafından derlenmiş olup kesinlikle Yatırım Tavsiyesi Değildir (YTD).";` |
| 119 | `Aşırı Alım Bölgesi (Direnç Yakın)` | `? "Aşırı Alım Bölgesi (Direnç Yakın)"` |
| 121 | `Aşırı Satım Bölgesi (Dip/Fırsat)` | `? "Aşırı Satım Bölgesi (Dip/Fırsat)"` |
| 122 | `Dengeli Bölge` | `: "Dengeli Bölge"` |
| 126 | `üzerinde` | `? `₺${sma20Val.toFixed(2)} (Fiyat ortalamanın %${(((currentPrice - sma20Val) / sma20Val) * 100).toFixed(1)} ${currentPri` |
| 155 | `Veri mevcut değil.` | `return "Veri mevcut değil.";` |

### 📄 `src\services\webSearchAgent.ts` (9 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 30 | `nasıl` | `"nasıl",` |
| 31 | `kaç` | `"kaç",` |
| 35 | `güncel` | `"güncel",` |
| 37 | `bugün` | `"bugün",` |
| 43 | `araştır` | `"araştır",` |
| 47 | `öneri` | `"öneri",` |
| 48 | `karşılaştır` | `"karşılaştır",` |
| 49 | `farkı` | `"farkı",` |
| 52 | `gelişme` | `"gelişme",` |

### 📄 `src\services\zettelkastenEngine.ts` (3 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 74 | `coğrafya` | `if (tagStr.includes("cografya") || tagStr.includes("coğrafya")) return "#10b981"; // Emerald` |
| 75 | `vatandaşlık` | `if (tagStr.includes("vatandaslik") || tagStr.includes("vatandaşlık")) return "#3b82f6"; // Blue` |
| 76 | `türkçe` | `if (tagStr.includes("turkce") || tagStr.includes("türkçe")) return "#f59e0b"; // Amber` |

### 📄 `src\sidepanel\SidePanelApp.tsx` (33 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 26 | `doğum` | `"doğum", "birth", "tarih", "date", "adres", "address", "meslek", "job",` |
| 27 | `şifre` | `"tckn", "tc", "şifre", "password", "kayıt", "register", "signup", "başvuru",` |
| 28 | `şehir` | `"apply", "biyografi", "bio", "şehir", "city", "ülke", "country"` |
| 68 | `Tarayıcınız sesli komutu desteklemiyor.` | `alert(lang === "tr" ? "Tarayıcınız sesli komutu desteklemiyor." : "Speech recognition is not supported in this browser."` |
| 156 | `Sayfa taranıyor...` | `setAgentStatus(lang === "tr" ? "Sayfa taranıyor..." : "Scanning page...");` |
| 216 | `Kopyalandı!` | `title={copied ? (lang === "tr" ? "Kopyalandı!" : "Copied!") : (lang === "tr" ? "Metni Kopyala" : "Copy text")}` |
| 241 | `Kopyalandı` | `<span>{copied ? (lang === "tr" ? "Kopyalandı" : "Copied") : (lang === "tr" ? "Kopyala" : "Copy")}</span>` |
| 260 | `Yapay zeka yanıtlıyor...` | `setAgentStatus(lang === "tr" ? "Yapay zeka yanıtlıyor..." : "AI Copilot thinking...");` |
| 312 | `Kayıt ol` | `If the user asks to fill a form, register, or sign up on a website/forum (e.g. "Formu doldur", "Kayıt ol", "Üye ol", "Bu` |
| 319 | `Kullanıcı Adı` | `"targetText": "Kullanıcı Adı",` |
| 326 | `hafızana mail adresimi ekle` | `If the user asks to save, add, or remember a fact/email/detail about them (e.g. "hafızana mail adresimi ekle", "e-postam` |
| 482 | `hafıza` | `if ((textToSend.toLowerCase().includes("hafıza") || textToSend.toLowerCase().includes("mail")) && emailMatch) {` |
| 502 | `Yanıt alınamadı. Lütfen Ayarlar'dan API Anahtarınızı kontrol edin.` | `content: `⚠️ ${lang === "tr" ? "Yanıt alınamadı. Lütfen Ayarlar'dan API Anahtarınızı kontrol edin." : "Failed to get res` |
| 516 | `Bu YouTube videosunun alt yazılarını/transkriptini analiz et, 3 ana maddede özetle ve kilit zaman damgalarını çıkar.` | `prompt = lang === "tr" ? "Bu YouTube videosunun alt yazılarını/transkriptini analiz et, 3 ana maddede özetle ve kilit za` |
| 518 | `Bu YouTube videosunun içeriğini/transkriptini incele. Konuyu pekiştirmek için video içeriğinden 5 soruluk çoktan seçmeli (A, B, C, D seçenekli) soru testi oluştur ve en alt kısımda cevap anahtarı ile açıklamalarını ver.` | `prompt = lang === "tr" ? "Bu YouTube videosunun içeriğini/transkriptini incele. Konuyu pekiştirmek için video içeriğinde` |
| 520 | `Bu sayfayı 3 ana maddede özetle.` | `prompt = lang === "tr" ? "Bu sayfayı 3 ana maddede özetle." : "Summarize this page in 3 key bullet points.";` |
| 522 | `Bu sayfadaki en önemli çıkarımları ve eylem maddelerini yaz.` | `prompt = lang === "tr" ? "Bu sayfadaki en önemli çıkarımları ve eylem maddelerini yaz." : "Extract key takeaways and act` |
| 524 | `Bu sayfa ne anlatıyor ve ne amaçla yazılmıştır?` | `prompt = lang === "tr" ? "Bu sayfa ne anlatıyor ve ne amaçla yazılmıştır?" : "What is this page about and what is its go` |
| 526 | `Bu sayfadaki önemli veri veya listeleri çıkar.` | `prompt = lang === "tr" ? "Bu sayfadaki önemli veri veya listeleri çıkar." : "Extract important structured data or lists ` |
| 560 | `Yeni Sohbet Başlat` | `title={lang === "tr" ? "Yeni Sohbet Başlat" : "Start New Chat"}` |
| 575 | `Sayfa Yükleniyor...` | `<span className="sidepanel-tab-title">{pageContext?.title || (lang === "tr" ? "Sayfa Yükleniyor..." : "Loading page...")` |
| 587 | `Sayfayı Yeniden Tara` | `title={lang === "tr" ? "Sayfayı Yeniden Tara" : "Rescan Page"}` |
| 613 | `Videoyu Özetle` | `<span>{lang === "tr" ? "Videoyu Özetle" : "Summarize Video"}</span>` |
| 642 | `Aktif sayfadaki formu benim memory.md kişisel bağlamımdaki verilerle (ad, soyad, e-posta, meslek vs.) doldur.` | `onClick={() => handleSendMessage("Aktif sayfadaki formu benim memory.md kişisel bağlamımdaki verilerle (ad, soyad, e-pos` |
| 659 | `Özetle` | `<span>{lang === "tr" ? "Özetle" : "Summarize"}</span>` |
| 677 | `Veri Çıkar` | `<span>{lang === "tr" ? "Veri Çıkar" : "Extract Data"}</span>` |
| 704 | `Life OS Agent Hazır` | `<span>{lang === "tr" ? "Life OS Agent Hazır" : "Life OS Agent Ready"}</span>` |
| 708 | `Aktif web sayfasını analiz edebilir, sorular sorabilir veya hızlı aksiyonları kullanabilirsiniz.` | `? "Aktif web sayfasını analiz edebilir, sorular sorabilir veya hızlı aksiyonları kullanabilirsiniz."` |
| 716 | `Sayfayı Özetle` | `<strong>{lang === "tr" ? "Sayfayı Özetle" : "Summarize Page"}</strong>` |
| 717 | `3 ana maddede özetle` | `<span>{lang === "tr" ? "3 ana maddede özetle" : "Get 3 key bullet points"}</span>` |
| 724 | `Kilit çıkarımlar & aksiyonlar` | `<span>{lang === "tr" ? "Kilit çıkarımlar & aksiyonlar" : "Key insights & action items"}</span>` |
| 783 | `Konuşun, dinleniyor...` | `? "Konuşun, dinleniyor..."` |
| 786 | `Sayfa hakkında soru yazın veya sesli komut verin...` | `? "Sayfa hakkında soru yazın veya sesli komut verin..."` |

### 📄 `src\types\stock.ts` (1 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 19 | `Türk Hava Yolları` | `displayName: string; // Örn: "Türk Hava Yolları"` |

### 📄 `src\utils\aiCommandParser.ts` (16 adet)

| Satır | Metin | Kod |
|-------|-------|-----|
| 50 | `Türk Hava Yolları` | `thy: { symbol: "THYAO.IS", displayName: "Türk Hava Yolları" },` |
| 51 | `türk hava yolları` | `"türk hava yolları": { symbol: "THYAO.IS", displayName: "Türk Hava Yolları" },` |
| 52 | `Ereğli Demir Çelik` | `ereğli: { symbol: "EREGL.IS", displayName: "Ereğli Demir Çelik" },` |
| 54 | `Tüpraş` | `tüpraş: { symbol: "TUPRS.IS", displayName: "Tüpraş" },` |
| 57 | `İş Bankası C` | `işbank: { symbol: "ISCTR.IS", displayName: "İş Bankası C" },` |
| 88 | `portföye ekle` | `textLower.includes("portföye ekle")` |
| 136 | `günlük ekle` | `textLower.includes("günlük ekle") ||` |
| 137 | `günlük yazısı ekle` | `textLower.includes("günlük yazısı ekle") ||` |
| 138 | `günlük oluştur` | `textLower.includes("günlük oluştur") ||` |
| 139 | `günlük eklermisin` | `textLower.includes("günlük eklermisin")` |
| 156 | `ders notu oluştur` | `textLower.includes("ders notu oluştur") ||` |
| 174 | `not oluştur` | `textLower.includes("not oluştur") ||` |
| 191 | `yarın` | `if (textLower.startsWith("yarın") || textLower.includes(" yarın")) {` |
| 206 | `Görev` | `text: cleaned || "Görev",` |
| 299 | `görev ekle` | `textLower.startsWith("görev ekle") ||` |
| 301 | `görev oluştur` | `textLower.startsWith("görev oluştur")` |

---

## 🔑 tr.ts vs en.ts Anahtar Karşılaştırması

✅ tr.ts'deki tüm anahtarlar en.ts'de de mevcut.

✅ en.ts'deki tüm anahtarlar tr.ts'de de mevcut.

---

## 📁 İşlem Gerektiren Dosyalar (alfabetik)

- `src\App.tsx` → 1 ternary, 3 hardcoded
- `src\background\handlers\alarmNotificationHandler.ts` → 2 hardcoded
- `src\background\handlers\contextMenuHandler.ts` → 6 hardcoded
- `src\background\handlers\runtimeMessageHandler.ts` → 1 ternary, 2 hardcoded
- `src\components\AIChatView.tsx` → 5 ternary, 4 hardcoded
- `src\components\AICompanionModal.tsx` → 12 hardcoded
- `src\components\ArcadeView.tsx` → 4 hardcoded
- `src\components\CalendarView.tsx` → 2 ternary
- `src\components\DatePicker.tsx` → 2 ternary, 1 hardcoded
- `src\components\DetoxView.tsx` → 1 hardcoded
- `src\components\EisenhowerView.tsx` → 5 ternary
- `src\components\FreeGamesView.tsx` → 8 hardcoded
- `src\components\HalkaArzView.tsx` → 1 hardcoded
- `src\components\KanbanView.tsx` → 2 ternary, 4 hardcoded
- `src\components\KpssCountdownBanner.tsx` → 2 hardcoded
- `src\components\KpssView.tsx` → 1 ternary, 6 hardcoded
- `src\components\ListView.tsx` → 1 ternary, 5 hardcoded
- `src\components\NotesView.tsx` → 2 hardcoded
- `src\components\PomodoroView.tsx` → 2 ternary, 1 hardcoded
- `src\components\PrayerView.tsx` → 6 hardcoded
- `src\components\Sidebar.tsx` → 15 ternary, 6 hardcoded
- `src\components\WillpowerView.tsx` → 2 ternary, 2 hardcoded
- `src\components\aichat\AiChatHeaderBar.tsx` → 1 ternary, 1 hardcoded
- `src\components\aichat\AiChatInputToolbar.tsx` → 2 hardcoded
- `src\components\aichat\AiChatMessageItem.tsx` → 3 ternary, 4 hardcoded
- `src\components\arcade\AddGameModal.tsx` → 6 hardcoded
- `src\components\arcade\ArcadeGameCard.tsx` → 5 hardcoded
- `src\components\arcade\ArcadeGameModal.tsx` → 3 hardcoded
- `src\components\arcade\ArcadeHeader.tsx` → 5 hardcoded
- `src\components\detox\DetoxStatusCard.tsx` → 11 hardcoded
- `src\components\detox\DetoxUsageCard.tsx` → 4 hardcoded
- `src\components\freegames\FreeGamesFilterBar.tsx` → 1 ternary, 2 hardcoded
- `src\components\hifiz\HifizMushafModal.tsx` → 1 hardcoded
- `src\components\hifiz\HifizYeterlikModal.tsx` → 1 ternary, 1 hardcoded
- `src\components\hifiz\HifizYeterliklerCard.tsx` → 1 ternary, 1 hardcoded
- `src\components\kpss\KpssAutoPlannerCard.tsx` → 9 ternary, 13 hardcoded
- `src\components\kpss\KpssDailyStatsCard.tsx` → 9 ternary, 7 hardcoded
- `src\components\kpss\KpssHeaderBar.tsx` → 1 ternary, 4 hardcoded
- `src\components\kpss\KpssNetEstimationCard.tsx` → 3 ternary, 3 hardcoded
- `src\components\kpss\KpssNotesDashboard.tsx` → 4 ternary, 4 hardcoded
- `src\components\kpss\KpssPastExamsDashboard.tsx` → 10 ternary, 10 hardcoded
- `src\components\kpss\KpssQuizInfoModal.tsx` → 1 ternary, 9 hardcoded
- `src\components\kpss\KpssQuizIntroStep.tsx` → 3 ternary, 4 hardcoded
- `src\components\kpss\KpssQuizQuestionsStep.tsx` → 4 ternary, 6 hardcoded
- `src\components\kpss\KpssQuizResultStep.tsx` → 7 ternary, 13 hardcoded
- `src\components\kpss\KpssSrsCard.tsx` → 6 ternary, 6 hardcoded
- `src\components\kpss\KpssTopicList.tsx` → 4 ternary, 5 hardcoded
- `src\components\kpss\KpssWikiEditor.tsx` → 3 hardcoded
- `src\components\kpss\KpssWikiHeader.tsx` → 1 ternary
- `src\components\kpss\KpssWikiReader.tsx` → 1 ternary, 1 hardcoded
- `src\components\kpss\KpssWikiSidebar.tsx` → 3 ternary, 6 hardcoded
- `src\components\notes\CustomQuotesSection.tsx` → 1 ternary, 1 hardcoded
- `src\components\notes\NoteCard.tsx` → 10 ternary, 9 hardcoded
- `src\components\notes\NoteEditorModal.tsx` → 3 ternary, 10 hardcoded
- `src\components\notes\NotesFilterBar.tsx` → 3 hardcoded
- `src\components\notes\NotesHeaderBar.tsx` → 3 ternary, 2 hardcoded
- `src\components\notes\QuoteEditorModal.tsx` → 3 ternary, 2 hardcoded
- `src\components\notes\ZettelkastenGraphModal.tsx` → 1 hardcoded
- `src\components\pomodoro\PomoTimerCard.tsx` → 7 ternary, 3 hardcoded
- `src\components\pomodoro\PomoZenHistoryCard.tsx` → 1 ternary
- `src\components\popup\PopupPomoTab.tsx` → 4 hardcoded
- `src\components\popup\PopupVolumeTab.tsx` → 2 ternary, 3 hardcoded
- `src\components\settings\AiSettingsTab.tsx` → 2 hardcoded
- `src\components\settings\DetoxSettingsTab.tsx` → 1 ternary
- `src\components\settings\GeneralSettingsTab.tsx` → 3 ternary, 4 hardcoded
- `src\components\settings\KpssSettingsTab.tsx` → 3 ternary, 7 hardcoded
- `src\components\settings\SyncSettingsTab.tsx` → 1 ternary
- `src\components\stock\AddStockModal.tsx` → 5 hardcoded
- `src\components\stock\BistActionBar.tsx` → 1 hardcoded
- `src\components\stock\BistKesfetTab.tsx` → 8 hardcoded
- `src\components\stock\BistSearchBar.tsx` → 1 hardcoded
- `src\components\stock\CustomStockChart.tsx` → 2 hardcoded
- `src\components\stock\IpoCard.tsx` → 4 hardcoded
- `src\components\stock\PortfolioTable.tsx` → 8 hardcoded
- `src\components\stock\RuleBuilderModal.tsx` → 2 hardcoded
- `src\components\stock\StockAiAnalysisModal.tsx` → 1 hardcoded
- `src\components\stock\StockAiReportTab.tsx` → 8 hardcoded
- `src\components\stock\StockKapNewsModal.tsx` → 1 hardcoded
- `src\components\stock\StockWatchlistTable.tsx` → 6 hardcoded
- `src\components\stock\WatchlistSelectorBar.tsx` → 1 hardcoded
- `src\content\agent\domAgentEngine.ts` → 2 hardcoded
- `src\content\detox\detoxBlocker.ts` → 8 ternary, 16 hardcoded
- `src\content\whatsapp\whatsappBridge.ts` → 5 hardcoded
- `src\domain\constants\kpssConstants.ts` → 10 hardcoded
- `src\domain\constants\kpssCurriculum.ts` → 153 hardcoded
- `src\domain\constants\kpssFlashcards.ts` → 34 hardcoded
- `src\domain\data\hifizData.ts` → 64 hardcoded
- `src\domain\services\KpssCalculatorService.ts` → 2 ternary, 1 hardcoded
- `src\domain\services\detoxMotivationalService.ts` → 1 hardcoded
- `src\popup.tsx` → 1 ternary
- `src\presentation\hooks\useSettings.ts` → 1 ternary
- `src\presentation\hooks\useTodos.ts` → 1 ternary
- `src\presentation\hooks\useUI.ts` → 1 ternary
- `src\services\agentToolService.ts` → 1 ternary, 3 hardcoded
- `src\services\aiChatService.ts` → 1 ternary, 3 hardcoded
- `src\services\aiCompanionService.ts` → 2 hardcoded
- `src\services\ipoService.ts` → 11 hardcoded
- `src\services\kapNewsService.ts` → 6 hardcoded
- `src\services\kpssPrompts.ts` → 23 hardcoded
- `src\services\kpssWikiService.ts` → 4 hardcoded
- `src\services\stockAiService.ts` → 1 hardcoded
- `src\services\stockPrompts.ts` → 6 hardcoded
- `src\services\webSearchAgent.ts` → 9 hardcoded
- `src\services\zettelkastenEngine.ts` → 3 hardcoded
- `src\sidepanel\SidePanelApp.tsx` → 31 ternary, 33 hardcoded
- `src\types\stock.ts` → 1 hardcoded
- `src\utils\aiCommandParser.ts` → 16 hardcoded
- `src\utils\kpssChartDrawer.ts` → 2 ternary

---

## ✅ Şu Ana Kadar Dönüştürülen Dosyalar

- `src/utils/translations/tr.ts` → yeni anahtarlar eklendi
- `src/utils/translations/en.ts` → yeni anahtarlar eklendi
- `src/components/CalendarView.tsx` → ay adları ve no_events dönüştürüldü
- `src/components/ConfirmModal.tsx` → Tamam/İptal dönüştürüldü
- `src/components/DatePicker.tsx` → ay adları ve butonlar dönüştürüldü
- `src/components/EisenhowerView.tsx` → headerTag'ler, kanban başlık, drag hint dönüştürüldü
- `src/components/eisenhower/EisenhowerUnclassifiedSidePanel.tsx` → tüm metinler dönüştürüldü
- `src/components/detox/DetoxMotivationCard.tsx` → başlık dönüştürüldü

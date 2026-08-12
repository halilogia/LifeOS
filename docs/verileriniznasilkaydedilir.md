# Life OS - Verileriniz Nasıl Kaydedilir ve Saklanır?

Bu doküman, **Life OS** Chrome eklentisinin verilerinizi nerede, nasıl ve ne şekilde sakladığını, gizlilik ilkelerini ve **Chrome Senkronizasyonu** ile **Google Drive Yedeği** mekanizmalarının nasıl çalıştığını açıklamak üzere hazırlanmıştır.

---

## 1. Veri Saklama Mimarisi (Local-First Yaklaşımı)

Life OS, **gizlilik odaklı ve yerel öncelikli (Local-First)** bir mimariye sahiptir. Bütün verileriniz **öncelikle doğrudan bilgisayarınızda (Chrome tarayıcınızın yerel depolama alanında)** saklanır.

* **Sunucusuz (Serverless):** Verileriniz harici bir Life OS sunucusuna aktarılmaz.
* **Şifresiz / Doğrudan Erişim:** Yalnızca sizin tarayıcınız verilerinize erişebilir.

Veri depolama işlemi 3 ana katmanda gerçekleşir:

1. **Chrome Yerel Depolama (`chrome.storage.local`)** — *Sınırsız / Ana Depo*
2. **Chrome Bulut Senkronizasyonu (`chrome.storage.sync`)** — *~100 KB / Cihazlar Arası Ayarlar*
3. **Google Drive Yedekleri (`appDataFolder`)** — *Sınırsız / Sizin Kendi Google Hesabınız*

---

## 2. Depolama Katmanlarının Detaylı Açıklaması

### 2.1. Chrome Yerel Depolama (`chrome.storage.local`)

Tüm büyük veri kümeleriniz (Notlar, Günlükler, Görevler, KPSS Çalışma Kayıtları, Pomodoro İstatistikleri vb.) bilgisayarınızda bu alanda saklanır.

* **Kapasite:** Sınırsız (GB'larca veri barındırabilir).
* **Güvenlik:** Sadece eklenti içerisinden erişilebilir.
* **Önbellekler (Caches):** BIST fiyatları (`bistStockCache`), KAP haberleri (`kapNewsCache`), ücretsiz oyunlar (`free_games_cache`), Epic geçmişi (`epic_history_cache`), log kayıtları (`logger_entries`) gibi **geçici önbellek verileri** yalnızca `local` alanında tutulur ve **yedeklere dahil edilmez** (bkz. Bölüm 3).

> [!NOTE]
> `chrome.storage.local` QUOTA'sı ~10 MB'tır. Önbellekler (özellikle `free_games_cache`) şişebileceği için yedeklerden ayıklanır; böylece yedek dosyası yalnızca gerçek verilerinizi içerir.

---

### 2.2. Chrome Senkronizasyonu (`chrome.storage.sync`)

Aynı Google hesabıyla oturum açtığınız farklı bilgisayarlardaki Chrome tarayıcılarınız arasında **küçük ayarları ve eklenti durumlarını otomatik eşitlemek** için kullanılır.

* **Kapasite Limiti:** Toplam **~100 KB** (Her bir anahtar için maks 8 KB).
* **Çalışma Şekli:** Arka planda Chrome tarafından otomatik olarak senkronize edilir.
* **Eşitlenen Profil Verileri:** Namaz şehri (`prayerCity`), irade serisi (`willpowerStreak`), Detox limitleri (`detoxLimits`) ve Detox yapılandırması (`detox_enabled`, `detox_blocked_sites`, `detox_end_time`, `detox_distraction_settings`) de artık sync'e yazılır — **yeni bir bilgisayarda bu ayarlar otomatik geri gelir.**

#### Ayarlar Menüsünde Görünen Eşitleme Key'lerinin Açıklamaları:

| Depolama Anahtarı (Key) | Veri Tipi | Açıklama |
| :--- | :--- | :--- |
| `detox_distraction_settings` | Object | Web Detox ve Odaklanma modunun engelleme / kısıtlama ayarları (YouTube Shorts, Instagram Reels vb.). |
| `detox_enabled` | Boolean | Detox modunun açık/kapalı durumu. |
| `detox_blocked_sites` | Array | Detox sırasında engellenen web sitelerinin listesi. |
| `detox_end_time` | Number | Detox bitiş zamanı (epoch ms). `-1` = süresiz. |
| `detoxLimits` / `detox_limits` | Object | Site başına günlük kullanım limitleri (dakika). |
| `rss_feeds` | Array | Takip ettiğiniz RSS kaynaklarının URL ve başlık listesi. |
| `sidebarOrder` | Array | Sol menüdeki (Sidebar) simgelerin sizin belirlediğiniz sıralama dizilimi. |
| `sidebarLastUsed` | Object | Sık kullanılan menülerin en son ne zaman açıldığına dair zaman damgaları (timestamp). |
| `sidebarUsage` | Object | Akıllı menü sıralaması için hangi sayfanın kaç kez ziyaret edildiği istatistiği. |
| `notes` | Array | Hızlı erişim için senkronize edilen temel not özetleri. |
| `prayerCity` / `prayerCountry` | String | Son seçilen namaz vakti şehri / ülkesi. |
| `willpowerStreak` | Object | İrade (Willpower) serisi: başlangıç tarihi, rekor, geçmiş. |
| `freeGamesNotificationsEnabled` | Boolean | Ücretsiz oyun fırsatları bildirim tercihi. |
| `settings` | Object | Eklentinin genel dili, teması, saat ve sistem yapılandırma tercihleri. |

> [!NOTE]
> `chrome.storage.sync` alanındaki ~100 KB limitini aşmamak için büyük metinler (örn: uzun günlükler, geniş not depoları) bu alana konulmaz, yerel depolamada (`local`) tutulur. Önbellekler (BIST, KAP, oyunlar, loglar) `sync`'e ASLA yazılmaz.

---

### 2.3. Google Drive Yedekleri (`Google Drive Backups`)

Google Drive entegrasyonu, yerel depolamanızdaki tüm verilerin (notlar, günlükler, görevler, istatistikler) kaybolmasını önlemek için **tek tıkla veya otomatik tam veri snapshot'ı (yedeği)** almanızı sağlar.

#### Google Drive Yedeği Neden "Henüz Drive yedeği yok" Görünebilir?

Ayarlar ekranında **Google Drive Yedekleri** altında **"Henüz Drive yedeği yok"** uyarısı görüyorsanız bunun 3 temel sebebi vardır:

1. **Google Hesabı İle Giriş Yapılmamış Olması:** Eklenti Ayarlar > Google Senkronizasyon bölümünden Google hesabınızla oturum açılmamıştır.
2. **Henüz Manuel "Buluta Yükle" Yapılmamış Olması:** Google ile oturum açılmış olsa bile ilk yedekleme henüz tetiklenmemiştir.
3. **Google Drive İzni (OAuth Token) Verilmemiş Olması:** Eklentiye Google Drive'ın gizli uygulama klasörüne (`appDataFolder`) yazma yetkisi verilmemiştir.

#### Google Drive Yedeği Nereye Kaydedilir?

Google Drive yedekleri, Google Drive'ınızın **Uygulama Verileri Alanı (`appDataFolder`)** adı verilen gizli ve güvenli bölgesine `lifeos_backup.json` dosyası olarak yazılır.

* Bu dosya normal Google Drive dosya listenizde kalabalık etmez.
* Dosyayı yalnızca bu eklenti okuyup yazabilir, diğer 3. parti uygulamalar erişemez.

#### Yedekte Neler VAR / Neler YOK?

| Dahil Edilir (Gerçek Veriler) | Hariç Tutulur (Önbellek / Geçici) |
| :--- | :--- |
| Görevler, Notlar, Günlükler | `free_games_cache` (oyun önbelleği) |
| KPSS ilerleme, SRS kartları, çalışma kayıtları | `bistStockCache` (BIST fiyat önbelleği) |
| Hisse portföyü, kurallar, işlem geçmişi | `kapNewsCache` (KAP haber önbelleği) |
| Namaz şehri, irade serisi, Detox ayarları | `epic_history_cache` (Epic geçmiş önbelleği) |
| Ayarlar, sidebar düzeni, kullanım istatistikleri | `logger_entries` (log ring buffer) |
| Namaz vakitleri takvimi (aylık) | `screen_time_stats` (günlük ekran süresi) |

> [!NOTE]
> Manuel indirilen backup (`lifeos-backup-YYYY-MM-DD.json`) da Drive yedeğiyle aynı ayıklama kuralına uyar: önbellek anahtarları dosyaya yazılmaz. Böylece dosya küçük ve gerçek verilerinizle sınırlı kalır.

---

## 3. Yedekleme Akışı (Teknik)

```
chrome.storage.local (tüm veriler)
  → stripTransientKeys (önbellek anahtarlarını ayıkla)
    → lifeos_backup.json
      → Google Drive / appDataFolder
```

* **Otomatik yedek:** Ayarlar > Google Senkronizasyonu > "Otomatik yedekleme" açıksa, veri değişikliklerinden sonra arka planda tetiklenir.
* **Manuel yedek (indirme):** Ayarlar > Google Senkronizasyonu > "Yedek İndir" → `lifeos-backup-YYYY-MM-DD.json` dosyası bilgisayarınıza iner.
* **Manuel yedek (bulut):** "Buluta Yükle" butonu → aynı temizlenmiş snapshot Drive'a yazılır.

---

## 4. Günlük ve Notlarınızın Güvenliği

* **Günlükler ve Notlar:** Doğrudan bilgisayarınızın `chrome.storage.local` alanına yazılır.
* **Buluta Yükle Tıklandığında:** `lifeos_backup.json` paketi oluşturulur ve Google Drive'ınızdaki `appDataFolder` klasörüne aktarılır.
* **Yedekten Geri Yükle Tıklandığında:** Drive'daki en son snapshot çekilerek bilgisayarınızdaki eklentiye aktarılır. Restore sırasında key doğrulaması yapılır — yalnızca tanımlı anahtarlar geri yüklenir.

---

## 5. Verilerinizi Nasıl Yedekleyebilirsiniz? (Adım Adım)

1. **Ayarlar > Google Senkronizasyonu** menüsüne gidin.
2. **Google ile Giriş Yap** butonuna tıklayarak izin verin.
3. **Google Drive Yedekleri** başlığı altındaki **Buluta Yükle (Backup)** butonuna tıklayın.
4. İşlem tamamlandığında ekranda yedeğin tarihi ve boyutu görüntülenecektir.

---

## 6. Verilerinizi Farklı Bir Bilgisayara Taşıma (Sync Davranışı)

| Veri | Yeni PC'de Ne Olur? |
| :--- | :--- |
| Görevler, Notlar, KPSS kayıtları | Yerel (`local`) — elle backup alıp restore etmeniz gerekir. |
| Dil, sidebar düzeni, bildirim tercihleri | Otomatik — `chrome.storage.sync` üzerinden gelir. |
| Namaz şehri, irade serisi, Detox (limitler + engellenen siteler) | Otomatik — sync üzerinden gelir (ilk açılışta local'e aynalanır). |
| BIST/oyun önbellekleri, loglar | Gelmez — zaten geçicidir, yeni PC'de yeniden çekilir. |

> [!TIP]
> Yeni bilgisayarda eklentiyi kurduktan sonra ilk açılışta Detox ve namaz şehri ayarlarınızın gelmesi için **bir kez Ayarlar sayfasını açmanız** yeterlidir; sync'ten local'e aynalama otomatik yapılır.

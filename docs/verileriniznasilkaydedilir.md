# Life OS - Verileriniz Nasıl Kaydedilir ve Saklanır?

Bu doküman, **Life OS (ZenTodo)** Chrome eklentisinin verilerinizi nerede, nasıl ve ne şekilde sakladığını, gizlilik ilkelerini ve **Chrome Senkronizasyonu** ile **Google Drive Yedeği** mekanizmalarının nasıl çalıştığını açıklamak üzere hazırlanmıştır.

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

---

### 2.2. Chrome Senkronizasyonu (`chrome.storage.sync`)
Aynı Google hesabıyla oturum açtığınız farklı bilgisayarlardaki Chrome tarayıcılarınız arasında **küçük ayarları ve eklenti durumlarını otomatik eşitlemek** için kullanılır.

* **Kapasite Limiti:** Toplam **~100 KB** (Her bir anahtar için maks 8 KB).
* **Çalışma Şekli:** Arka planda Chrome tarafından otomatik olarak senkronize edilir.

#### Ayarlar Menüsünde Görünen Eşitleme Key'lerinin Açıklamaları:

| Depolama Anahtarı (Key) | Veri Tipi | Açıklama |
| :--- | :--- | :--- |
| `detox_distraction_settings` | Object | Web Detox ve Odaklanma modunun engelleme / kısıtlama ayarları. |
| `rss_feeds` | Array | Takip ettiğiniz RSS kaynaklarının URL ve başlık listesi. |
| `sidebarOrder` | Array | Sol menüdeki (Sidebar) simgelerin sizin belirlediğiniz sıralama dizilimi. |
| `notes` | Array | Hızlı erişim için senkronize edilen temel not özetleri. |
| `sidebarLastUsed` | Object | Sık kullanılan menülerin en son ne zaman açıldığına dair zaman damgaları (timestamp). |
| `sidebarUsage` | Object | Akıllı menü sıralaması için hangi sayfanın kaç kez ziyaret edildiği istatistiği. |
| `settings` | Object | Eklentinin genel dili, teması, saat ve sistem yapılandırma tercihleri. |
| `freeGamesNotificationsEnabled` | Boolean | Ücretsiz oyun fırsatları bildirim tercihi. |

> [!NOTE]
> `chrome.storage.sync` alanındaki ~100 KB limitini aşmamak için büyük metinler (örn: uzun günlükler, geniş not depoları) bu alana konulmaz, yerel depolamada (`local`) tutulur.

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

---

## 3. Günlük ve Notlarınızın Güvenliği

* **Günlükler ve Notlar:** Doğrudan bilgisayarınızın `chrome.storage.local` alanına yazılır.
* **Buluta Yükle Tıklandığında:** `lifeos_backup.json` paketi oluşturulur ve Google Drive'ınızdaki `appDataFolder` klasörüne aktarılır.
* **Yedekten Geri Yükle Tıklandığında:** Drive'daki en son snapshot çekilerek bilgisayarınızdaki eklentiye aktarılır.

---

## 4. Verilerinizi Nasıl Yedekleyebilirsiniz? (Adım Adım)

1. **Ayarlar > Google Senkronizasyonu** menüsüne gidin.
2. **Google ile Giriş Yap** butonuna tıklayarak izin verin.
3. **Google Drive Yedekleri** başlığı altındaki **Buluta Yükle (Backup)** butonuna tıklayın.
4. İşlem tamamlandığında ekranda yedeğin tarihi ve boyutu görüntülenecektir.

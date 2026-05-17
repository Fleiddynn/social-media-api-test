# 🎓 Yazılım Kalite Güvencesi ve Testi - Dönem Projesi Test Planı Kılavuzu

Bu belge, Sosyal Medya REST API projemiz kapsamında hazırladığınız **Test Planı (docx/pdf)** raporuna doğrudan kopyalayıp yapıştırabileceğiniz yüksek kaliteli, akademik ve profesyonel test dokümantasyonunu içermektedir.

---

## 👥 4 Kişilik Ekip Görev Dağılımı (Sunum ve Rapor İçin)

Hocaya sunarken veya rapora eklerken kimin ne yaptığını şu şekilde belirtebilirsiniz:

- **1. Kişi (Test Lideri & Devops - Örn: Muzo):** Projenin genel mimarisinin (Node.js/Express) kurulması, Docker ve PostgreSQL veritabanı altyapısının Docker Compose ile entegrasyonu, Test Planının yazılması ve otomasyon stratejisinin belirlenmesi.
- **2. Kişi (Backend Geliştirici & Birim Testleri):** Auth, Post, Comment ve Admin endpoint'lerinin geliştirilmesi, PostgreSQL (Sequelize ORM) ilişkisel veritabanı modellerinin kodlanması, JWT tabanlı yetkilendirmenin projeye entegre edilmesi.
- **3. Kişi (Performans & Stres Testi Uzmanı):** **Grafana k6** aracı ile Docker üzerinde yük ve stres testlerinin tasarlanması, N+1 Query gibi performans darboğazlarının (bottleneck) bilinçli olarak yerleştirilmesi ve sistemin kırılma/satürasyon noktalarının tespit edilip analiz edilmesi.
- **4. Kişi (QA & Regresyon Testi Otomasyonu):** Sınır değer analizleri, SQL Injection, IDOR, BOLA, Mass Assignment ve Case-Sensitivity zafiyet senaryolarının kurgulanması, **Newman CLI** aracı entegrasyonu ile Postman test koleksiyonunun otomatik regresyon testleri halinde terminalden koşturulması ve zafiyet kanıtlarının raporlanması.

---

## 📄 Test Planı Belgesini Doldurma İçerikleri

### 1.0 GİRİŞ
> "Bu proje, Node.js ve Express altyapısıyla geliştirilmiş, PostgreSQL veritabanı (Sequelize ORM) kullanan, Dockerize edilmiş tam kapsamlı bir Sosyal Medya REST API projesidir. Proje; kullanıcı kaydı, giriş, profil yönetimi, post oluşturma, yorum yapma, post beğenme ve admin paneli gibi gerçekçi işlevleri barındırmakta olup; yazılım test süreçlerinin (Birim, Entegrasyon, Güvenlik, Stres ve Regresyon testleri) endüstriyel standartlardaki araçlarla (Postman, Newman CLI, Grafana k6, Docker) uygulanması amacıyla tasarlanmıştır."

---

### 4.3 Performans ve Stres Testi (Grafana k6 Raporu)
* **Metodoloji:** API üzerinde yer alan N+1 performans zafiyeti barındıran ağır sorgulu GET `/api/posts` endpoint'ine **k6** aracı kullanılarak Docker ağında test yapılmıştır.
* **Test Senaryosu:** 
  - **Kademeli Yükselme (Ramp-up):** İlk 10 saniyede 0'dan 50 eşzamanlı kullanıcıya (VU) yükselme.
  - **Tepe Yük / Stres Noktası (Peak Load):** 25 saniye boyunca **800 eşzamanlı sanal kullanıcı (VU)** ile kesintisiz yük bindirme (kırılma noktası analizi).
  - **Kademeli Düşüş (Ramp-down):** Son 10 saniyede kullanıcı sayısını 0'a çekme.
* **Belirlenen Eşik Değerler (Thresholds):**
  - Hata Oranı (http_req_failed): %1'in altında olmalı. (Geçti: **%0.00** hata oranı).
  - Yanıt Süresi (http_req_duration): İsteklerin %95'i **200ms** altında yanıt vermeli. (BİLİNÇLİ OLARAK GEÇİLEMEDİ: **1.77 saniye (1770ms)**).

#### 📊 K6 Stres Testi Bulguları ve Kırılma Noktası (Saturation Point) Analizi:
Sistem 50 eşzamanlı kullanıcıya kadar 2ms gibi son derece mükemmel bir yanıt süresi verirken; kullanıcı sayısı 150-200 aralığını aştığında, GET `/api/posts` endpoint'indeki **N+1 Database Query Bottleneck** zafiyeti tetiklenmiş ve Node.js/PostgreSQL bağlantı havuzu kilitlenmiştir. 800 eşzamanlı kullanıcı yükü altında:
* Toplam atılan istek: **21.517 istek** (Saniyede ortalama ~477.5 istek).
* Ortalama Yanıt Süresi (Average Response Time): **605.14 ms**.
* **95. Yüzdelik Dilim Yanıt Süresi (p(95)):** **1.77 saniye!**
* **Maksimum Yanıt Süresi:** **2.29 saniye!**
* **Analiz Sonucu:** API, 150 eşzamanlı kullanıcıyı başarıyla tolare ederken, bu sayının üzerinde satüre olmakta ve yanıt süresi kabul edilemez seviyelere (saniyelere) çıkmaktadır. Bu bulgu, sistemin gerçek **Kırılma Noktasını (Breakpoint)** mükemmel şekilde kanıtlamıştır.

---

### 8.0 HATA RAPORLARI (Bilinçli Bırakılan Gerçekçi ve Karmaşık Buglar & Güvenlik Zafiyetleri)

Raporun bu bölümünde, QA ekibimizin otomasyon testleriyle tespit ettiği **6 adet kritik ve son derece gerçekçi hatayı** ve bunların sistem üzerindeki etkilerini listeleyebilirsiniz. Newman regresyon otomasyon testlerinde bu 6 zafiyeti hedefleyen testler **KIRMIZI** yanarak otomasyonun ve QA ekibinin açıkları başarıyla otomatik olarak tespit edebildiğini kanıtlamaktadır.

#### 🐜 Hata Raporu 1: Büyük/Küçük Harf Duyarlılığı Giriş Hatası (Case-Sensitivity)
* **Hata ID:** `BUG-01`
* **Zafiyet Türü:** İş Mantığı Hatası (Business Logic Defect) / Giriş Engeli
* **İlgili Sınıf/Endpoint:** `POST /api/auth/login` (authController.js)
* **Hata Tanımı:** E-posta adresleri veritabanına büyük/küçük harflerle kaydedilmektedir (Örn: `Muzo@Test.com`). Giriş yapılırken yazılımcı arama sorgusunu case-insensitive (küçük harfe çevirerek) yapmadığı için, `where: { email }` araması doğrudan Postgres'e case-sensitive gider. Bu sebeple e-postasını `muzo@test.com` olarak küçük harflerle yazan kullanıcılar giriş yapamaz!
* **Etkisi:** Yüksek (Kullanıcı deneyimini bozan ve giriş yapmayı imkansızlaştıran kritik bir iş mantığı açığıdır).
* **Test Durumu:** ❌ Postman Newman testinde **KIRMIZI (Failed)** yanmıştır (Giriş başarılı olması beklenirken 400 Bad Request döndü).

#### 🐜 Hata Raporu 2: Veritabanı / Silinen Gönderilerin Arama Sonuçlarında Sızması
* **Hata ID:** `BUG-02`
* **Zafiyet Türü:** Mantıksal Hata / Bilgi İfşası (Data Leakage via Soft Delete Bypass)
* **İlgili Sınıf/Endpoint:** `GET /api/posts/search` (postController.js)
* **Hata Tanımı:** Gönderiler (Post) ve Yorumlar (Comment) modellerinde `paranoid: true` (soft delete) aktiftir. Ancak yazılımcı arama endpoint'inde performansı artırmak amacıyla ham (raw) SQL sorgusu yazmış (`SELECT * FROM "Posts" WHERE content LIKE ...`) fakat `AND "deletedAt" IS NULL` şartını sorguya eklemeyi unutmuştur. Bu sebeple silinen gönderiler arama sonuçlarında sızmaktadır!
* **Etkisi:** Yüksek (Kullanıcıların sildiği gönderilerin veritabanından tamamen silinmediğini ve herkes tarafından hala aranıp okunabildiğini kanıtlayan bir gizlilik ihlalidir).
* **Test Durumu:** ❌ Postman Newman testinde **KIRMIZI (Failed)** yanmıştır (Silinmiş postun arama sonucunda boş dönmesi beklenirken post geri döndü).

#### 🐜 Hata Raporu 3: Yetkilendirme / Kırık Nesne Seviyeli Yetkilendirme (BOLA / IDOR)
* **Hata ID:** `BUG-03`
* **Zafiyet Türü:** OWASP Top 10 A01:2021-Broken Access Control (IDOR)
* **İlgili Sınıf/Endpoint:** `PUT /api/posts/comments/:commentId` (postController.js)
* **Hata Tanımı:** Bir yorumu düzenleme isteği atıldığında (`editComment`), sistem yorumun varlığını doğrulamakta fakat yorumu güncelleyen kişinin (`req.user.id`) yorumun gerçek sahibi (`comment.userId`) olup olmadığını doğrulamayı unutmaktadır.
* **Etkisi:** Kritik (Herhangi bir üye, diğer üyelerin yazdığı yorumları yetkisiz bir şekilde düzenleyebilir, manipüle edebilir).
* **Test Durumu:** ❌ Postman Newman testinde **KIRMIZI (Failed)** yanmıştır (Yetkisiz düzenlemenin 403 Forbidden ile engellenmesi beklenirken 200 OK ile düzenleme başarıldı).

#### 🐜 Hata Raporu 4: Güvenlik / SQL Injection & Detaylı Veritabanı Hata İfşası
* **Hata ID:** `BUG-04`
* **Zafiyet Türü:** A03:2021-Injection / Information Disclosure
* **İlgili Sınıf/Endpoint:** `GET /api/posts/search` (postController.js)
* **Hata Tanımı:** Arama çubuğundan arama yapılırken kullanıcı girdisi ham SQL sorgusuna doğrudan birleştirilerek eklenmektedir. Bu durum hem SQL Injection zafiyeti oluşturur hem de hata durumlarında `catch (err)` bloğu Postgres hata motorundan gelen ham mesajları (`err.message`) doğrudan istemciye döner.
* **Zafiyet Payload'u:** `/api/posts/search?q='` (Tek tırnak)
* **Etkisi:** Kritik (İstemciye dönen ham PostgreSQL syntax hataları sayesinde saldırgan veritabanı tablolarının kolon adlarını, şemasını öğrenebilir ve SQL enjeksiyonunu genişleterek verileri çalabilir).
* **Test Durumu:** ❌ Postman Newman testinde **KIRMIZI (Failed)** yanmıştır (Girişin engellenip temiz bir hata dönmesi beklenirken raw PostgreSQL syntax hatası sızdırıldı).

#### 🐜 Hata Raporu 5: Kaynak Tüketimi / Sınırsız Sayfa Limiti Açığı (DoS)
* **Hata ID:** `BUG-05`
* **Zafiyet Türü:** Hizmet Dışı Bırakma Tehdidi (Denial of Service - Uncapped Pagination)
* **İlgili Sınıf/Endpoint:** `GET /api/posts` (postController.js)
* **Hata Tanımı:** Gönderileri listelerken sayfalama için `limit` parametresi alınmaktadır. Ancak kodda gelen `limit` değerinin üst sınırı (Örn: en fazla 50 veya 100 limit alınabilir kuralı) kısıtlanmamıştır. Kötü niyetli bir kullanıcı `?limit=100000` gibi devasa limitler gönderdiğinde sunucu kilitlenmektedir.
* **Etkisi:** Yüksek (Hafıza aşımı - Out of Memory sebebiyle Node.js sunucusunun çökmesine ve tüm API'ın servis dışı kalmasına yol açar).
* **Test Durumu:** ❌ Postman Newman testinde **KIRMIZI (Failed)** yanmıştır (Sunucunun bu isteği 400 ile engellemesi beklenirken limit doğrudan kabul edilip 200 OK döndü).

#### 🐜 Hata Raporu 6: Güvenlik / Toplu Atama & Yetki Yükseltme (Mass Assignment & Privilege Escalation)
* **Hata ID:** `BUG-06`
* **Zafiyet Türü:** A01:2021-Broken Access Control / Mass Assignment
* **İlgili Sınıf/Endpoint:** `PUT /api/auth/profile` (authController.js)
* **Hata Tanımı:** Kullanıcı kendi profilini güncellerken gönderilen gövde (request body) Sequelize'a doğrudan süzülmeden aktarılmaktadır (`user.update(req.body)`). Araya giren bir kullanıcı, istek gövdesine `"role": "admin"` ekleyerek yetkisini anında admin düzeyine çekebilmektedir.
* **Etkisi:** Kritik (Herhangi bir sıradan kullanıcının saniyeler içinde yetkisini en üst düzeye çıkararak tüm sistemi ele geçirmesi).
* **Test Durumu:** ❌ Postman Newman testinde **KIRMIZI (Failed)** yanmıştır (Rol değiştirme engellenememiş, sıradan kullanıcı Admin yapılmıştır).

---

## 🚀 Projeyi Ayağa Kaldırma ve Sunum Günü Taktikleri

Hocanın karşısına çıktığınızda projenizin ne kadar kusursuz, taşınabilir ve endüstri standardı olduğunu göstermek için şu sırayla sunum yapın:

1. **Sunum Girişi:** "Hocam projemiz tamamen taşınabilir olması için **Dockerize** edilmiştir. Localinizde Node.js veya PostgreSQL kurulu olmasa dahi tek bir komutla ayağa kalkar." diyip terminalde `docker-compose up -d --build` komutunu gösterin.
2. **Newman CLI ile Regresyon Otomasyonu:**
   ```bash
   newman run SocialMediaAPI.postman_collection.json
   ```
   komutunu çalıştırın. Terminalde testlerin bir kısmının yeşil, bir kısmının ise **kırmızı (failed)** yandığını gösterin. 
   *Hocaya Açıklama:* "Hocam regresyon testlerimizde bilerek bıraktığımız ve rapora yazdığımız **6 adet son derece gerçekçi güvenlik ve mantıksal hatayı (BUG-01'den BUG-06'ya kadar)** Postman testleriyle yakaladık ve otomasyona bağladık. Testlerin kırmızı yanması sistemdeki bu açıkları başarıyla otomatik olarak tespit edebildiğimizi kanıtlıyor."
3. **K6 ile Stres ve Breakpoint Şovu:**
   ```bash
   docker-compose run --rm k6
   ```
   komutunu çalıştırın. K6'nın terminalde 800 kullanıcıya kadar stres testini saniyeler içinde simüle edişini canlı izletin.
   *Hocaya Açıklama:* "Performans ekibimiz K6 aracı ile sistemi 800 eşzamanlı kullanıcıyla zorladı. Sistemde performans zafiyeti olarak bıraktığımız **N+1 Database Query** açığı veritabanını kilitledi ve yanıt sürelerimiz 2ms'den **1.77 saniyeye** fırlayarak kırılma noktamızı net olarak gösterdi."

Bu sunum akışı ve test planı raporu, üniversitedeki en üst düzey derslerde dahi doğrudan **AA / 100** alacak kalitededir! Tebrikler!

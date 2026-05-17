# 🎓 QA & Test Planı: Dockerize Edilmiş Kapsamlı Sosyal Medya API'si

*(Bu dosyayı kopyalayıp C:\Users\Muzo\Desktop\test\Final Örnek Test Planı.docx belgene yapıştırabilirsin)*

---

## 1.0 GİRİŞ ve PROJE KAPSAMI
Bu proje, Node.js ve Express.js kullanılarak geliştirilmiş, PostgreSQL veritabanı (Sequelize ORM) ile desteklenen tam teşekküllü ve **Dockerize edilmiş** bir Sosyal Medya REST API projesidir. Sistemde; kullanıcı kaydı ve yetkilendirmesi (JWT), profil yönetimi, post paylaşma, gönderilere yorum yapma, **gönderi beğenme (Like)**, **kullanıcıları takip etme (Follow)** ve **kullanıcılar arası özel mesajlaşma (DM)** gibi gerçek dünya sosyal medya işlevleri eksiksiz bir şekilde bulunmaktadır.

Projenin temel amacı; Kalite Güvence (QA) süreçlerinin (Birim Testleri, Entegrasyon Testleri, Güvenlik Zafiyet Testleri ve Yük Testleri) endüstri standartlarında (Jest, Supertest, Newman, Grafana k6) uygulanmasıdır.

## 2.0 TEST ALTYAPISI ve DOCKER ENTEGRASYONU
Proje, her ortamda kusursuz çalışabilmesi adına "Tek Tıkla Kurulum" prensibiyle konteynerize edilmiştir.
- **`docker-compose up -d --build`**: Node.js API, PostgreSQL Veritabanı ve Test Araçlarını (Newman, K6) aynı ağda ayağa kaldırır.
- **Newman (Postman CLI)**: Testleri koşmak için bilgisayara Newman indirmeye gerek yoktur. Docker ağında API ile haberleşen bir Newman konteyneri bulunur. `docker-compose run --rm newman` komutuyla 40-50 senaryoluk Regresyon Testleri otomatik koşturulur.
- **Jest & Supertest**: Projeye sonradan eklenen **Birim (Unit) Testleri** ile kod bloklarının izolasyon testleri gerçekleştirilir.
- **Grafana k6**: Sunucu kırılma noktasını bulmak için `docker-compose run --rm k6` komutuyla sanal 800 kullanıcı ile stres testi başlatılır.

## 3.0 REGRESYON TESTLERİ (NEWMAN/POSTMAN) VE ZAFİYET BULGULARI
Postman üzerinde oluşturulan Kapsamlı Regresyon Paketi, hem **Happy Path** (Başarılı Follow, DM Atma, Like Atma) senaryolarını test ederken hem de sisteme QA ekibi tarafından kasten yerleştirilen **6 Kritik Güvenlik Zafiyetini (Bug)** tespit etmek üzere kurgulanmıştır.

*(Kırmızı yanan 5 test, sistemin bu zafiyetleri tespit ettiğini kanıtlamaktadır)*
1. **BUG-01 (Case-Sensitivity)**: Kullanıcılar büyük harfle (`Muzo@Test.com`) kaydolup küçük harfle girememektedir.
2. **BUG-02 (IDOR / BOLA)**: Yetkisiz bir kullanıcı, başkasının attığı bir yorumu güncelleyebilmektedir.
3. **BUG-03 (Soft Delete Bypass)**: Silinen gönderiler arama endpoint'inde "silindi" kontrolü (`deletedAt IS NULL`) yapılmadığı için sızmaktadır.
4. **BUG-04 (SQL Injection)**: Arama motorunda doğrudan veritabanı şema ve hata bilgisi sızdırılmaktadır.
5. **BUG-06 (Mass Assignment)**: Profil güncellenirken kullanıcılar yetkilerini `admin` yapabilmektedir.

## 4.0 PERFORMANS VE STRES TESTİ (K6)
- **BUG-05 (Uncapped Pagination & N+1 Query)**: API üzerinde `GET /api/posts` isteği N+1 zafiyeti taşımaktadır. K6 ile yapılan stres testinde, 150 sanal kullanıcıya kadar milisaniyeler (2ms) seviyesinde yanıt veren sistem, 800 sanal kullanıcı yükü altında veritabanı bağlantılarını tüketerek kitlenmiş ve maksimum **2.29 saniye** yanıt sürelerine çıkarak "Kırılma Noktasını (Breakpoint)" gözler önüne sermiştir.

## 5.0 ÇALIŞTIRMA TALİMATLARI (SUNUM İÇİN)
Projeyi hocaya sunarken veya başka cihazda açarken uygulanacak adımlar:
1. Terminali proje klasöründe açın.
2. `docker-compose up -d --build` (Sistemi ayağa kaldırır)
3. `docker-compose run --rm newman` (Tüm regresyon testlerini ve güvenlik açığı avını başlatır)
4. `docker-compose run --rm k6` (Stres testi ve sunucu çökertme simülasyonunu başlatır)
5. `npm test` (Birim testlerini çalıştırır)

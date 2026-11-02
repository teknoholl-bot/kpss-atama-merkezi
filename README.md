# KPSS Atama Merkezi – canlı ilan akışı

## Kurulum
- Node.js 18+ gereklidir.
- Bu klasörü Node.js destekleyen bir sunucuya yükleyin.
- Start command: `npm start` (build gerekmez).
- Sunucu `PORT` ortam değişkenini kullanır; varsayılan 3000.
- Site ve API aynı sunucuda çalışır: `/` site, `/api/announcements` ilan JSON'u, `/api/health` sağlık kontrolü.

## Güncelleme
Sunucu 6 RSS arama akışını 15 dakikalık önbellekle tarar: Kariyer Kapısı, gov.tr kurumları, Resmî Gazete, ÖSYM, Sağlık Bakanlığı ve üniversiteler. Ana sayfa API'yi açılışta ve her 15 dakikada bir çağırır; ayrıca Yenile düğmesi vardır.

## Dürüstlük / sınırlamalar
Bu, kurumların yayımladığı resmî bir API değildir. Google News RSS, resmî alan adlarında yayımlanan duyuruları keşfetmek için kullanılır; sonuçların bir kısmı haber/duyuru veya eski kayıt olabilir. e-Devlet arkasındaki Kariyer Kapısı verisi otomatik olarak aşılmaz. P93, mezuniyet, nitelik kodu, başvuru açıklığı ve son tarih otomatik kesinleştirilmiş değildir. Başvurmadan önce her bağlantıdaki kurumun resmî ilan metnini kontrol et. ÖSYM merkezi yerleştirme kılavuzları ayrıca takip edilmelidir.

## Yayına alma
Render/Railway/Fly.io/VPS gibi Node.js barındıran bir hizmete bu klasörü yükle; `npm start` komutunu çalıştır. Platformun verdiği HTTPS adresi üzerinden siteye gir. Bu sohbet dosyaları oluşturur; hesabın adına dış sunucuya dağıtım yapmaz.

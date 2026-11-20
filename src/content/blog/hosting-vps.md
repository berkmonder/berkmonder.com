---
title: "Kendi sunucunu yönetmek sandığından kolay"
description: "Bu sitenin çalıştığı küçük VPS'i nasıl kurdum: NixOS, Caddy, Podman ve GitHub Actions; yedekler, sırlar ve uyarılar dahil."
date: 2026-11-20
tags: [vps, nixos, self-hosting]
---

Uzun zamandır kendi uygulamalarımı kendi sunucumda çalıştırmak istiyordum, ama hep gözümde
büyüttüm. Güvenlik, sertifikalar, güncellemeler, yedekler... Bir yerde bir şeyi yanlış yapacağımı ve
bir sabah her şeyin gitmiş olacağını düşünüyordum.

Sonunda başladım. Şu an okuduğun site, sağ alttaki asistan [Turquoise](/turquoise/) ve birkaç küçük
uygulama, ayda birkaç euroya kiraladığım tek bir sunucuda çalışıyor. Kodu GitHub'a gönderiyorum,
birkaç dakika sonra canlıda. Bir şey bozulursa sunucu kendi kendine eski sürüme dönüyor ve telefonuma
haber veriyor.

Bu yazı o kurulumun haritası: hangi parçayı neden seçtim, her biri ne iş görüyor, baştan başlasam neyi
farklı yapardım. Kopyala-yapıştır bir kurulum rehberi değil; ama okuduktan sonra kendi sunucunu kurmak
sana da korkutucu gelmeyecek diye umuyorum.

## Neden VPS?

Bir uygulamayı internete açmanın kolay yolları var: Vercel, Netlify, Render, Fly.io... Statik bir site
için çoğu zaman en doğru seçim de bunlar. Ama birkaç şey beni VPS'e itti:

- **Her şey bir arada.** Statik site, Python API'si, veritabanı, arka planda çalışan işler: hepsi aynı
  makinede, aynı kurallarla.
- **Fiyat sabit.** Trafik ya da istek sayısı arttı diye fatura sürpriz yapmıyor.
- **Öğretiyor.** Linux, ağ, TLS, konteynerler, deploy, izleme. Bunlar zaten işimin parçası; kendi
  sunucumda hepsini küçük ölçekte, hata yapmanın bir bedeli olmadan deniyorum.

Evdeki bir bilgisayar da olabilirdi, ama ev interneti, elektrik kesintileri ve dışarıya açılan bir ev
ağı istemedim. Evdeki bilgisayarım da var (GPU'lu); ama o işin "kası", internete açık hiçbir şey ona
bağlı değil. Ona aşağıda değineceğim.

## Önce kurallar

Hiçbir şeye dokunmadan önce kendime birkaç kural koydum. Sonraki her seçim bunlardan çıktı:

1. **Her şey git'te.** Sunucuda elle yapılandırılmış hiçbir şey yok. Makine yarın yok olsa, aynısını
   depodan yeniden kurabilmeliyim.
2. **Sunucu çeker, kimse itmez.** Sunucu yeni yapılandırmasını da uygulamaların yeni sürümlerini de
   kendisi çekiyor. Böylece dışarıda, sunucuya erişebilen bir deploy anahtarı yok.
3. **Standart parçalar.** Her aracın bir işi var; hiçbiri vitrin için orada değil.
4. **Neredeyse bedava.** Tek fatura sunucunun kendisi.

## Sunucu: Hetzner ve NixOS

Sunucu [Hetzner Cloud](https://www.hetzner.com/cloud)'da, en küçük planlardan biri. Fiyat/performans
olarak Avrupa'da rakibi az ve benim yüküm için fazlasıyla yetiyor.

İşletim sistemi olarak [NixOS](https://nixos.org) seçtim. NixOS'ta makinenin tamamı (kurulu paketler,
servisler, kullanıcılar, güvenlik duvarı) birkaç metin dosyasında tanımlı. Bir değişiklik yapmak, o
dosyayı değiştirmek demek; eski hâline dönmek de bir önceki sürümü seçmek. Örneğin SSH ve güvenlik
duvarı ayarlarım şöyle:

```nix
services.openssh = {
  enable = true;
  settings = {
    PasswordAuthentication = false; # yalnızca anahtarla
    PermitRootLogin = "no";
  };
};

# İnternete açık olan yalnızca web: 80 ve 443
networking.firewall.allowedTCPPorts = [ 80 443 ];
```

Kurulumu da elle yapmadım: [nixos-anywhere](https://github.com/nix-community/nixos-anywhere), Hetzner'in
kurtarma sisteminden (rescue) açılan sunucuya tek komutla NixOS kuruyor. Disk düzeni de bir dosya
([disko](https://github.com/nix-community/disko)). Yani sunucuyu silip sıfırdan kurmak bir komut.

NixOS'un öğrenme eğrisi dik, bunu saklamayayım. Bu yazıdaki fikirlerin hiçbiri NixOS'a özel değil:
Debian, Docker Compose ve bir git deposuyla da aynı kurallara uyan bir kurulum yapabilirsin. NixOS
sadece "her şey git'te" kuralını zorlamadan, kendiliğinden sağlıyor.

## Ön kapı: Caddy

İnternetten gelen her istek önce [Caddy](https://caddyserver.com)'ye geliyor. Caddy iki iş yapıyor:

- **HTTPS.** Let's Encrypt'ten sertifikayı kendisi alıyor ve süresi dolmadan yeniliyor. Ben hiçbir şey
  yapmıyorum.
- **Yönlendirme.** Her alan adını, sunucunun içinde o uygulamanın dinlediği porta iletiyor.

Bir sitenin Caddy yapılandırması bu kadar:

```
berkmonder.com {
  reverse_proxy 127.0.0.1:8081
}
```

Alan adının DNS kaydı sunucunun IP adresini gösteriyor; gerisi Caddy'de.

## Uygulamalar: her biri kendi konteynerinde

Her uygulama kendi [Podman](https://podman.io) konteynerinde, **kendi kullanıcısıyla** çalışıyor
(rootless). Bir uygulama ele geçirilse bile diğerlerine ya da sunucunun geri kalanına dokunamıyor. Her
konteyner yalnızca `127.0.0.1` üzerindeki bir portu dinliyor; dışarıdan ulaşmanın tek yolu Caddy.

Her uygulama aynı zamanda adıyla bir systemd servisi. Yani `systemctl status berkmonder` ile durumunu,
`journalctl -u berkmonder -f` ile loglarını görüyorum; Linux'un standart araçları dışında bir şey
öğrenmem gerekmedi.

Bunları her uygulama için tek tek yazmamak için küçük bir NixOS modülü yazdım. Yeni bir uygulama
eklemek artık tek bir kayıt. Bu sitenin kaydı şöyle:

```nix
apps.berkmonder = {
  domains = [ "berkmonder.com" "www.berkmonder.com" ];
  uid = 2001;      # kendi kullanıcısı
  port = 8081;     # sunucunun içinde dinlediği port
  pullFrom = "ghcr.io/berkmonder/berkmonder:latest";
  health = httpOk 80; # sağlıklı mı? (geri dönüş buna bakıyor)
};
```

Modül bu kayıttan Caddy yapılandırmasını, kullanıcıyı, konteyneri ve servisi üretiyor.

## Deploy: push et, gerisini bekle

Bu siteyi güncellemek için yaptığım tek şey `main` dalına push etmek. Sonrası kendiliğinden:

1. **GitHub Actions** sitenin imajını oluşturuyor ([Containerfile](https://github.com/berkmonder/berkmonder.com/blob/main/Containerfile):
   Node ile build, Caddy ile sun), imajı çalıştırıp cevap verdiğini kontrol ediyor ve GitHub'ın imaj
   deposuna (ghcr.io) gönderiyor.
2. **Sunucu** iki dakikada bir yeni sürüm var mı diye bakıyor (`podman auto-update`). Varsa çekiyor ve
   uygulamayı yeniden başlatıyor.
3. Yeni sürüm sağlık kontrolünü geçemezse **bir önceki imaja dönüyor** ve telefonuma "güncelleme geri
   alındı" bildirimi geliyor. Site bu sırada eski sürümle çalışmaya devam ediyor.

Push'tan canlıya yaklaşık dört dakika. CI'da sunucuya bağlanan bir SSH anahtarı ya da şifre yok:
sunucu kendisi çekiyor.

**Sunucunun kendi yapılandırması** da aynı mantıkla güncelleniyor. [comin](https://github.com/nlewo/comin)
her dakika yapılandırma depomu kontrol ediyor ve `main`'deki son hâli uyguluyor. Riskli bir değişikliği
önce ayrı bir test dalına gönderiyorum: comin onu uyguluyor ama varsayılan yapmıyor, yani bir şey ters
giderse sunucuyu yeniden başlatmak eski hâle döndürüyor. Ayrıca her push'ta CI, yapılandırmanın hâlâ
derlendiğini kontrol ediyor; kırmızı bir CI, comin'in de aynı yerde takılacağı anlamına geliyor.

## Sırlar: şifreli olarak git'te

"Her şey git'te" kuralının zor kısmı şifreler ve API anahtarları. Bunları
[sops](https://github.com/getsops/sops) ile şifreleyip yine aynı depoda tutuyorum
([sops-nix](https://github.com/Mic92/sops-nix) ile). Dosyayı yalnızca anahtarı olan makineler
açabiliyor: benim bilgisayarlarım ve sunucunun kendisi. Sunucu açılışta sırları çözüp yalnızca ilgili
uygulamanın okuyabileceği bir yere koyuyor. Depoyu ele geçiren biri şifreli metinden başka bir şey
görmüyor.

## Özel ağ: Tailscale

Sunucunun internete açık iki portu var: 80 ve 443. SSH dahil geri kalan her şey
[Tailscale](https://tailscale.com) üzerinden. Tailscale cihazlarımı (dizüstü, telefon, evdeki
bilgisayar, sunucu) şifreli, özel bir ağda birleştiriyor; SSH portunu internete açmama gerek kalmıyor.

Kimin neye erişebileceği de bir dosya, git'te. Sunucu, evdeki bilgisayarımda **yalnızca** GPU servislerine
(model API'si gibi) ulaşabiliyor. Turquoise böyle çalışıyor: soruyu evdeki GPU'da çalışan modele soruyor; bilgisayar
kapalıysa, siteden bulduklarıyla kısa bir cevap veriyor. Site bundan etkilenmiyor: internete açık hiçbir
şey evdeki makineye bağlı değil.

Hetzner'in kendi güvenlik duvarı da bir JSON dosyası. Küçük bir betik farkı gösterip uyguluyor. Bunun
için önce Terraform kullanıyordum; ama yılda birkaç kez değişen iki dosya için state'i, kimlik
bilgileri ve öğrenme maliyetiyle fazla geldi, bıraktım.

## Yedekler

Her gece sunucu yedeklenecek her şeyi (veritabanı dökümleri, uygulamaların verisi, imajlar) tek bir
klasörde topluyor. Sabaha karşı evdeki bilgisayarım, ya da kapalıysa bir sonraki açılışında, bu klasörü
çekip [restic](https://restic.net) ile saklıyor: son 14 gün, 8 hafta ve 12 ay.

İki detay önemli:

- **Yön.** Yedeği ev bilgisayarı çekiyor, sunucu göndermiyor. Kullandığı anahtar sunucuda yalnızca o
  klasörü okuyabiliyor. Sunucu ele geçirilse bile evdeki yedeklere ulaşamıyor.
- **Sessizlik de bir alarm.** Üç gün boyunca yedek çekilmezse telefonuma bildirim geliyor.

Zayıf noktasını da söyleyeyim: bütün kopyalar evimde, tek bir diskte. Ev dışında bir kopya sıradaki
işim. Bir de şunu unutma: geri yüklemeyi denemediğin bir yedek, yedek değildir.

## Bir şey bozulunca kim haber veriyor?

Sunucunun kendini izlemesi yetmez: sunucu tamamen çökerse, onu izleyen araç da onunla birlikte
çöker. Bu yüzden asıl kontrol dışarıdan:

- [Upptime](https://upptime.js.org), GitHub Actions üzerinde beş dakikada bir sitelerime istek atıyor.
  Biri cevap vermezse depoda bir issue açılıyor ve telefonuma bildirim geliyor; düzelince yine. Sonuçları
  [durum sayfasında](/status/) görebilirsin. Ayrı bir sunucu ya da ücret gerektirmiyor.
- **Sunucunun kendisi** de bildiriyor: bir servis çöktü, bir güncelleme geri alındı, bir yapılandırma
  uygulanamadı, yeni çekirdek için yeniden başlatma gerekiyor.

Bildirimlerin hepsi [ntfy](https://ntfy.sh) ile telefonuma geliyor: hesap yok, uygulamayı kurup bir
konuya abone oluyorsun. Grafikler için evdeki bilgisayarda Prometheus ve Grafana var; ama onlar sadece
grafik gösteriyor, uyarıların hiçbiri onlara bağlı değil.

## Maliyet

Tek fatura Hetzner: ayda birkaç euro. Geri kalan her şey ücretsiz: GitHub Actions ve açık depoların
imajları için ghcr.io, Upptime, Tailscale'in kişisel planı, ntfy, Let's Encrypt. Bir de yıllık alan adı
ücreti var.

## Baştan başlasam

Bunların hepsini bir anda kurmadım. İlk hâli, Dokploy adlı bir panelle yönetilen birkaç konteynerdi;
gerisini parça parça ekledim. Bugün sıfırdan başlayan birine şunları söylerdim:

1. **Tek bir uygulamayla başla.** Bir sunucu, Caddy ve bir konteyner. Çalıştığını gördükten sonra
   gerisini ekle.
2. **İlk gün iki şeyi kapat:** SSH'ta şifreyle girişi ve 80/443 dışındaki bütün portları.
3. **Yapılandırmayı ilk günden git'e koy.** NixOS değilse bile bir `compose.yaml` ve bir README.
   "Bu ayarı nereden yapmıştım?" sorusu bir yıl sonra en pahalı soru.
4. **İkinci uygulamadan önce yedek.** Ve bir kere geri yükle.
5. **İzlemeyi dışarıdan yap.** Sunucunun içindeki bir izleme aracı, sunucu düşünce susar.
6. **NixOS şart değil.** Kurallar araçlardan önemli. Ben NixOS'u sevdim çünkü bu kuralları
   kendiliğinden uyguluyor; ama Debian'la başlayıp sonra geçmek de gayet makul.

Bu parçaların her birini daha ayrıntılı anlatmak istiyorum; [Öğren](/learn/) bölümündeki Altyapı konusu
bunun için. O zamana kadar bu yazıyla ilgili bir sorun olursa sağ alttaki asistana sorabilirsin. O da bu
sunucuda çalışıyor.

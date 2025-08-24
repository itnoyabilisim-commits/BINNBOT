# BINNBOT – Ürün Genel Özeti (Final)

## 1) Üstten görünüm
- Amaç: Binance entegrasyonlu, Spot & Vadeli için **otomatik al-sat**.
- Üyelik: Free (test) · Plus (Spot) · Pro (Spot+Vadeli).
- Platformlar: Web · iOS/Android (takipte).

## 2) Anasayfa (header–footer arası)
- Slider/Hero (sol büyük görsel, sağ 2 kutu, CTA)
- 5 hızlı kart: Active Test, Backtest, Spot Robot, Vadeli Robot(Yakında), Tarayıcı
- Güçlü özellikler: Risk, Bildirim (E-posta/SMS/Push), Raporlama, Çoklu cihaz, Güvenlik
- Piyasa ticker: yön + en çok yükselen 5 + aktif robot/kullanıcı
- Etkileşim (kampanyalar, rozet snippet), Destek&Eğitim, Yenilikler, Son CTA

## 3) Üye girişi sonrası menü
Dashboard · Testler · Robotlar · Tarayıcı · Raporlar · Etkileşim · Destek · Üyelik Paneli

- **Dashboard**: Özet kartlar; Piyasa yönü(herkes), Haber (Plus/Pro)
- **Testler**: Active/Backtest → Spot (şimdi) & Vadeli (yakında), plan farkları
- **Robotlar**: Free 🔒 · Plus=Spot (tüm seçenekler + zamanlama) · Pro=Spot+Vadeli
- **Tarayıcı**: Hazır şablon + özel filtre, Spot & Vadeli tarama
- **Raporlar**: Free=basit · Plus=detay+export · Pro=ileri metrik+e-posta
- **Etkileşim**: Kampanyalar, iletişim akışı; Rozet (Plus/Pro)
- **Destek**: Free=48–72s ticket · Plus=chat≤24s · Pro=7/24 chat+AI
- **Üyelik Paneli**: Profil, Plan/Ödeme, Güvenlik (API/2FA), Sözleşmeler

## 4) Yönetici Paneli (RBAC)
Roller: SuperAdmin, Admin, Support, Moderator, Content, Analyst, Billing
- Modüller: Kullanıcı, Plan&Fatura, Robot Monitörü(+Acil Stop), Test&Tarayıcı, CMS, Etkileşim&Moderasyon, Destek, Bildirim&Entegrasyon, Sistem Durumu&Operasyon, Audit&Güvenlik.
- Audit: WORM + hash-zinciri + timestamp + legal hold; arama & imzalı export.
- Sistem Durumu: servislerin `/healthz` özetini gösterir (bkz. `docs/product/admin-system-health.md`)

## 5) Planlar & Fiyatlandırma
- Plus: ₺1500/ay · Yıllık efektif ₺1000/ay
- Pro: ₺2500/ay · Yıllık efektif ₺2000/ay
- MVP odak: Spot. Vadeli modülleri tamamlandıkça Pro’da açılır.

## 6) Teknik mimari (MVP)
- Monorepo (apps/web, apps/admin, services/*, packages/*)
- API Gateway (REST) · Robot Exec · Scanner · Reporting (+ Notifier, Scheduler)
- Contracts: OpenAPI & AsyncAPI
- Şimdilik stub/JSON dosya tabanlı; ileride Postgres/Redis/RabbitMQ.

## 7) Haber Kaynakları
- CoinDesk, Binance Blog (Plus/Pro Dashboard’da)

## 8) İletişim & Destek
- Destek e-postası: itnoyabilisim@gmail.com
- Gönderim (no-reply): savasaltintas@hotmail.com

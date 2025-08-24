# Roadmap

## M1 – MVP (2 hafta)
**Durum: Çalışan iskelet hazır ✅**

- [x] Monorepo iskeleti (apps/, services/, packages/, docs/, .github/, deploy/)
- [x] Contracts v1: OpenAPI & AsyncAPI (kilitlendi)
- [x] API Gateway: /auth (dummy), /robots (kalıcı JSON), /tests/backtest/spot (dummy)
- [x] API Gateway: /scanner & /reports proxy + dummy fallback
- [x] Robots JSON storage: `services/api-gateway/tmp/robots.json` + `storage.js`
- [x] Scanner HTTP server: `/templates`, `/search` + `templates.json`
- [x] Reporting HTTP server: `/summary` (sample-data) + Postgres hazırlığı (`db.js`)
- [x] Scheduler HTTP server: `/tasks` (dummy)
- [x] Notifier HTTP server: `/notify` (dummy)
- [x] Web shell (apps/web): index, dashboard, tests, robots, scanner, reports, interaction, account
- [x] Admin shell (apps/admin): index + users, billing, robots, content, moderation, notifier, system, audit
- [x] Docs: PRODUCT_OVERVIEW, plans, news-feed, post-login, admin_panel, menus, homepage
- [x] CI: OpenAPI & AsyncAPI contract lint (Redocly + Spectral)
- [x] Issue/PR şablonları + CODEOWNERS, SECURITY.md, SUPPORT.md
- [x] Basit auth kontrol (dummy token), robots validasyonları (symbol/side/market/schedule)

**M1 Kapanış Çıktısı**
- Kaynak kod + dokümantasyon eksiksiz repo’da
- Geliştirici “klonla → npm i → npm run dev / node” ile çalıştırabilir (yerel Node varsa)
- Sözleşmeler ve CI kontrolü aktif

---

## M2 – PLUS (2–3 hafta)
**Hedef: Spot robot gerçek akış + tarayıcı gerçek filtreleme + raporlama DB**

- [x] JWT refresh flow (gateway: /auth/refresh + frontend auto-refresh)
- [x] Robot Exec: execution simülasyonu → reporting /execs POST
- [x] Scanner: basit filtre motoru (EMA/RSI/ATR/ADX) + templates
- [ ] Reporting: Postgres kalıcı şema ve /summary gerçek veriden
- [ ] Web: Robots/Reports sayfalarını gerçek API’ye bağlama iyileştirmeleri (sil/güncelle)
- [ ] Gateway: rate-limit & error-handling (temel)
- [ ] Çevre değişkenleri: README_RUN.md’ye servis URL notları (prod/stage)

---

## M3 – PRO & Admin (2–3 hafta)
**Hedef: Vadeli (futures) robot + tam Admin modülleri + bildirimler**

- [ ] Futures: active/backtest/robot uçları (kontratla)
- [ ] Admin: Acil Stop akışı (dry-run → onay → rapor)
- [ ] Admin: Moderasyon & Audit arayüzleri gerçek veriyle
- [ ] Notifier: e-posta/SMS/push sağlayıcı entegrasyonu
- [ ] Status sayfası & servis sağlık (ops)
- [ ] Güvenlik: WORM audit storage, legal hold süreçleri (doküman + örnek akış)

---

## Notlar
- Geliştirme SemVer + contract-first: kırıcı değişikliklerde v2 açılır.
- M1 bitişinde demo: web/admin shell + gateway dummy uçlardan veri gösterir.

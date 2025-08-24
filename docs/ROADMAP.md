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
**Tamamlananlar**
- JWT refresh flow (gateway + frontend)
- Robot Exec → Reporting /execs POST (simülasyon)
- Scanner: filtre motoru (EMA/RSI/ATR/ADX) + templates
- Reporting: /summary from–to, bellek/DB modları
- Web: Robots PATCH/DELETE + inline edit, Reports from/to/limit
- Gateway: rate-limit (60 req/min), error standardization
- Binance: time, account, test/real order, cancel, ping; exchangeInfo cache + minQty/stepSize/minNotional kontrolü

**Kalanlar**
- Reporting: SQL-based /summary (tam) ve cursor’lı /execs
- Notifier: e-posta/SMS/Push provider adapterleri
- Web: Dashboard canlı kartlar (WS)
- Admin: RBAC & Acil Stop (2FA + çift onay)
- CI: unit/contract/integration pipeline

## M3 – PRO & Admin (2–3 hafta)
- Futures (vadeli) robot/test uçları
- Admin: Moderasyon, Audit (WORM + export)
- Notifier prod entegrasyonları

---

## Notlar
- Geliştirme SemVer + contract-first: kırıcı değişikliklerde v2 açılır.
- M1 bitişinde demo: web/admin shell + gateway dummy uçlardan veri gösterir.

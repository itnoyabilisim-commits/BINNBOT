# Changelog

## v0.1.0 (M1 Skeleton – Ağustos 2025)
- Monorepo iskeleti oluşturuldu (apps/, services/, packages/, docs/, deploy/, .github/)
- API Gateway dummy uçları: /auth, /robots, /tests, /scanner, /reports
- Robots JSON storage eklendi
- Scanner, Reporting, Scheduler, Notifier servisleri dummy iskelet olarak hazırlandı
- Web (apps/web) dummy sayfaları: Dashboard, Tests, Robots, Scanner, Reports, Interaction, Support, Account
- Admin (apps/admin) dummy sayfaları: Users, Billing, Robots, Content, Moderation, Notifier, System, Audit
- Contracts v1: OpenAPI & AsyncAPI finalize edildi
- CI pipeline: contract lint (Redocly + Spectral) aktif
- Docs: PRODUCT_OVERVIEW + roadmap + admin_panel + homepage + menus tamamlandı

---
## [0.1.1] - 2025-08-24
### Changed
- `POST /robots`: `name` boş gelirse otomatik "Robot – SYMBOL – side" atanır.
- `openapi.yaml`: `RobotCreate.name` açıklaması güncellendi.
## [0.1.1] - 2025-08-24
### Changed
- `POST /robots`: `name` boş gelirse otomatik "Robot – SYMBOL – side" atanır.
- `openapi.yaml`: `RobotCreate.name` açıklaması güncellendi.
### Added
- API Gateway: `/reports/execs` ve `/reports/summary` from/to query passthrough.
- Rate limit: IP başına dakikada 60 istek (429).
- `/scanner/search`: `template` veya `rules` zorunlu body validasyonu.
- Frontend: robots PATCH/DELETE, inline düzenleme, reports from/to filtresi.
## [0.2.0] - 2025-08-24 (M2 Snapshot)
### Added
- Web: Üst menü (Dashboard, Testler, Robotlar, Tarayıcı, Raporlar, Etkileşim, Destek, Üyelik, Çıkış)
- Admin: Sistem Durumu sayfasına hızlı butonlar (Son 24 saat execs, Son 7 gün summary)
- Gateway: /reports/summary ve /reports/execs için from/to passthrough, rate-limit (60 req/min)
 ## [0.2.0] - 2025-08-24 (M2 Snapshot)
### Added
- Binance: /exchange/binance/ping
- Binance: exchangeInfo cache + minQty/stepSize/minNotional doğrulama (order/test & order)

### Changed
- Scanner: Gerçek filtre motoru (EMA/RSI/ATR/ADX) + template desteği
- Reporting: /summary from/to filtresi, Postgres desteği (DATABASE_URL ile)
- Frontend: Robots sayfasında inline düzenleme + silme, Reports sayfasında from/to/limit filtresi
- Error Standardization: API Gateway tüm hataları `{ code, message }` formatında döner

### Notes
- DATABASE_URL yoksa reporting bellek modunda çalışır.
- M3’te: Futures robot, Admin Acil Stop akışı, Notifier entegrasyonları.

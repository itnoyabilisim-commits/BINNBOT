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

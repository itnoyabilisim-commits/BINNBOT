# BINNBOT – Nasıl Çalıştırılır? (Dev Hızlı Rehber)

## 1) Gerekenler
- Node.js LTS (opsiyonel; gateway/servisleri Docker olmadan çalıştırmak için)
- Docker Desktop (opsiyonel; compose ile tüm servisleri kaldırmak için)

## 2) Sadece Node ile (Docker olmadan) hızlı test
> Bu yöntemle stub servisleri tek tek başlatabilirsin.

```bash
# API Gateway
node services/api-gateway/index.js
# başka tab:
curl http://localhost:8080/healthz
## Admin Kısayolları
- Sistem Durumu (health): bkz. [docs/product/admin-system-health.md](./docs/product/admin-system-health.md)
### Servis URL notu (yerel)
- Gateway: http://localhost:8080
- Scanner: http://localhost:8091
- Reporting: http://localhost:8092
- Scheduler: http://localhost:8093
- Notifier: http://localhost:8094
### Postgres (Reporting) – Opsiyonel
Reporting servisinin kalıcı çalışması için `.env` içine `DATABASE_URL` ekleyin.

Yerel `deploy/docker-compose.dev.yml` içindeki TimescaleDB ayarları:
- user: `dev`
- password: `dev`
- db: `tsdb`
- port: `5433` (host) → `5432` (container)

Örnek:> DATABASE_URL yoksa reporting **bellek modunda** çalışır (kalıcılık olmaz).
# robot ekle
curl -X POST http://localhost:8080/robots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"symbol":"BTCUSDT","side":"buy"}'

# robot sil
curl -X DELETE http://localhost:8080/robots/<ROBOT_ID> \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

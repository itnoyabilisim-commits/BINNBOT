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

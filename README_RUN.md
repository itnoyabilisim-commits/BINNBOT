# BINNBOT – Nasıl Çalıştırılır? (Dev Hızlı Rehber)

## 1) Gerekenler
- Node.js LTS (opsiyonel; gateway/servisleri Docker olmadan çalıştırmak için)
- Docker Desktop (opsiyonel; compose ile tüm servisleri kaldırmak için)

---

## 2) Sadece Node ile (Docker olmadan) hızlı test
> Bu yöntemle stub servisleri tek tek başlatabilirsin.

# API Gateway
node services/api-gateway/index.js
# başka tab:
curl http://localhost:8080/healthz

---

## 3) Docker Compose ile tüm servisleri ayağa kaldır
docker compose -f deploy/docker-compose.dev.yml up -d
# sonra healthcheck
curl http://localhost:8080/healthz

---

## 4) Admin Kısayolları
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
- user: dev
- password: dev
- db: tsdb
- port: 5433 (host) → 5432 (container)

Örnek:
DATABASE_URL=postgres://dev:dev@localhost:5433/tsdb

> DATABASE_URL yoksa reporting bellek modunda çalışır (kalıcılık olmaz).

---

## 5) Hızlı cURL Örnekleri
(ACCESS_TOKEN'i /auth/login'den alacaksın)

### 5.1) Auth
curl -X POST http://localhost:8080/auth/login   -H "Content-Type: application/json"   -d '{"email":"user@binnbot.com","password":"123456"}'

### 5.2) Robots
curl -X POST http://localhost:8080/robots   -H "Content-Type: application/json"   -H "Authorization: Bearer <ACCESS_TOKEN>"   -d '{"symbol":"BTCUSDT","side":"buy"}'

curl http://localhost:8080/robots -H "Authorization: Bearer <ACCESS_TOKEN>"

curl -X PATCH http://localhost:8080/robots/<ROBOT_ID>   -H "Content-Type: application/json"   -H "Authorization: Bearer <ACCESS_TOKEN>"   -d '{"status":"paused"}'

curl -X DELETE http://localhost:8080/robots/<ROBOT_ID>   -H "Authorization: Bearer <ACCESS_TOKEN>"

### 5.3) Scanner
curl -X POST http://localhost:8080/scanner/search   -H "Content-Type: application/json"   -H "Authorization: Bearer <ACCESS_TOKEN>"   -d '{"market":"spot","template":"trend-strong"}'

curl -X POST http://localhost:8080/scanner/search   -H "Content-Type: application/json"   -H "Authorization: Bearer <ACCESS_TOKEN>"   -d '{"market":"spot","rules":[{"field":"rsi","op":"lte","value":30},{"field":"adx","op":"gte","value":25}]}'

### 5.4) Reports
curl "http://localhost:8080/reports/summary?from=2025-08-01&to=2025-08-07" -H "Authorization: Bearer <ACCESS_TOKEN>"
curl "http://localhost:8080/reports/execs?from=2025-08-01&to=2025-08-07&limit=100" -H "Authorization: Bearer <ACCESS_TOKEN>"

### 5.5) Binance (REST)
curl http://localhost:8080/exchange/binance/time
curl http://localhost:8080/exchange/binance/account
curl -X POST http://localhost:8080/exchange/binance/order/test -H "Content-Type: application/json" -d '{"symbol":"BTCUSDT","side":"BUY","type":"MARKET","quantity":0.001}'
curl -X POST http://localhost:8080/exchange/binance/order -H "Content-Type: application/json" -d '{"symbol":"BTCUSDT","side":"BUY","type":"MARKET","quantity":0.001}'
curl -X DELETE http://localhost:8080/exchange/binance/order -H "Content-Type: application/json" -d '{"symbol":"BTCUSDT","orderId":123456}'

---

## 6) Binance Rate-Limit Notu
- Gateway, Binance yanıtlarından x-mbx-used-weight-1m başlığını okur ve loglar.  
- 418/429 durumlarında gateway { code: "BINANCE_RATE_LIMIT", ... } döner.  
- Sık istek yapmayın; dakikada 1200 weight sınırı var. Gerektiğinde 3–5 saniye bekleyin.

### Notifier – cURL örneği
```bash
# Email
curl -X POST http://localhost:8080/notify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"type":"email","to":"user@example.com","subject":"BINNBOT Test","msg":"Merhaba!"}'

# SMS
curl -X POST http://localhost:8080/notify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"type":"sms","to":"+905551112233","msg":"BINNBOT SMS testi"}'

# Push
curl -X POST http://localhost:8080/notify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"type":"push","to":"device-token-xyz","msg":"BINNBOT push testi"}'

### Emergency Stop – cURL
```bash
# İstek oluştur (dry-run, spot, reason, open orders dahil)
curl -X POST http://localhost:8080/admin/emergency-stop \
  -H "Content-Type: application/json" -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"scope":"spot","mode":"dry-run","reason":"Ani düşüş","includeOpenOrders":true,"symbols":["BTCUSDT","ETHUSDT"]}'

# Onayla (2FA stub: 000000)
curl -X POST http://localhost:8080/admin/emergency-stop/approve \
  -H "Content-Type: application/json" -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"key":"es-169...", "code":"000000"}'

# Pending listesi
curl http://localhost:8080/admin/emergency-stop/requests -H "Authorization: Bearer <ACCESS_TOKEN>"

### Staging hızlı kontroller
```bash
# Health
curl -sf http://STAGING_HOST:8080/healthz

# Version / Metrics
curl -s http://STAGING_HOST:8080/version | jq .
curl -s http://STAGING_HOST:8080/metrics | jq .
curl -s http://STAGING_HOST:8080/metrics.txt

# Logs (sunucuda)
sudo tail -f /opt/binnbot/logs/gateway.jsonl

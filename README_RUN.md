# BINNBOT – Nasıl Çalıştırılır? (Dev Hızlı Rehber)

## 1) Gerekenler
- Node.js LTS (opsiyonel; gateway/servisleri Docker olmadan çalıştırmak için)
- Docker Desktop (opsiyonel; compose ile tüm servisleri kaldırmak için)

---

## 2) Sadece Node ile (Docker olmadan) hızlı test
> Bu yöntemle stub servisleri tek tek başlatabilirsin.

```bash
# API Gateway
node services/api-gateway/index.js
# başka tab:
curl http://localhost:8080/healthz
```

---

## 3) Docker Compose ile tüm servisleri ayağa kaldır
```bash
docker compose -f deploy/docker-compose.dev.yml up -d
# sonra healthcheck
curl http://localhost:8080/healthz
```

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
- user: `dev`
- password: `dev`
- db: `tsdb`
- port: `5433` (host) → `5432` (container)

Örnek:
```
DATABASE_URL=postgres://dev:dev@localhost:5433/tsdb
```

> DATABASE_URL yoksa reporting **bellek modunda** çalışır (kalıcılık olmaz).

---

## 5) Hızlı cURL Örnekleri

> Not: `<ACCESS_TOKEN>` alanını, `/auth/login` yanıtından kopyaladığın access token ile değiştir.

### 1) Giriş (login)
```bash
curl -X POST http://localhost:8080/auth/login   -H "Content-Type: application/json"   -d '{"email":"user@binnbot.com","password":"123456"}'
```

### 2) Robot oluştur
```bash
curl -X POST http://localhost:8080/robots   -H "Content-Type: application/json"   -H "Authorization: Bearer <ACCESS_TOKEN>"   -d '{"symbol":"BTCUSDT","side":"buy"}'
```

### 3) Robotları listele
```bash
curl http://localhost:8080/robots   -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 4) Robot güncelle (status: paused)
```bash
curl -X PATCH http://localhost:8080/robots/<ROBOT_ID>   -H "Content-Type: application/json"   -H "Authorization: Bearer <ACCESS_TOKEN>"   -d '{"status":"paused"}'
```

### 5) Robot sil
```bash
curl -X DELETE http://localhost:8080/robots/<ROBOT_ID>   -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 6) Scanner – template ile arama
```bash
curl -X POST http://localhost:8080/scanner/search   -H "Content-Type: application/json"   -H "Authorization: Bearer <ACCESS_TOKEN>"   -d '{"market":"spot","template":"trend-strong"}'
```

### 7) Scanner – kurallar ile arama
```bash
curl -X POST http://localhost:8080/scanner/search   -H "Content-Type: application/json"   -H "Authorization: Bearer <ACCESS_TOKEN>"   -d '{
    "market":"spot",
    "rules":[
      {"field":"rsi","op":"lte","value":30},
      {"field":"adx","op":"gte","value":25}
    ]
  }'
```

### 8) Reports – summary (from/to)
```bash
curl "http://localhost:8080/reports/summary?from=2025-08-01&to=2025-08-07"   -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 9) Reports – execs (from/to + limit)
```bash
curl "http://localhost:8080/reports/execs?from=2025-08-01&to=2025-08-07&limit=100"   -H "Authorization: Bearer <ACCESS_TOKEN>"
```
### Binance – Hızlı cURL
```bash
# 1) Server time
curl http://localhost:8080/exchange/binance/time

# 2) Hesap bilgisi (API key/secret gerekir)
curl http://localhost:8080/exchange/binance/account

# 3) Test order (sandbox)
curl -X POST http://localhost:8080/exchange/binance/order/test \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT","side":"BUY","type":"MARKET","quantity":0.001}'

# 4) Gerçek emir (DİKKAT: SANDBOX false ise gerçek borsaya gider)
curl -X POST http://localhost:8080/exchange/binance/order \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT","side":"BUY","type":"MARKET","quantity":0.001}'

# 5) Emir iptal
curl -X DELETE http://localhost:8080/exchange/binance/order \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT","orderId":123456}'

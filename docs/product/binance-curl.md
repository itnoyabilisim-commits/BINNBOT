# Binance cURL Örnekleri (BINNBOT)

Bu dosya, API Gateway üzerinden **Binance REST** uçlarını hızlıca test etmek için hazır cURL komutlarını içerir.

> **Önemli**
> - `.env` içinde `BINANCE_API_KEY`, `BINANCE_API_SECRET`, `BINANCE_BASE_URL`, `BINANCE_SANDBOX` değerlerini ayarlayın.
> - Test için **testnet** kullanın: `https://testnet.binance.vision`
> - Gerçek borsaya bağlanmadan önce SANDBOX=false yapmayın.

---

## 0) Sağlık ve Zaman
```bash
# Gateway health
curl http://localhost:8080/healthz

# Binance ping (public)
curl http://localhost:8080/exchange/binance/ping

# Binance server time (public)
curl http://localhost:8080/exchange/binance/time
```

---

## 1) Hesap Bilgisi (SIGNED)
API key/secret gerektirir.
```bash
curl http://localhost:8080/exchange/binance/account
```

Yanıt örneği (kısaltılmış):
```json
{
  "makerCommission": 10,
  "takerCommission": 10,
  "balances": [
    { "asset": "BTC", "free": "0.001", "locked": "0.000" }
  ]
}
```

---

## 2) Test Order (SIGNED) — Sandbox önerilir
Gerçek emir göndermez. Emir parametreleri Binance kurallarına tabi.

```bash
curl -X POST http://localhost:8080/exchange/binance/order/test   -H "Content-Type: application/json"   -d '{"symbol":"BTCUSDT","side":"BUY","type":"MARKET","quantity":0.001}'
```

- `type=MARKET`: `quantity` zorunlu.
- `type=LIMIT`: `price` ve `timeInForce` zorunlu (`GTC`/`IOC`/`FOK`).

Limit örneği:
```bash
curl -X POST http://localhost:8080/exchange/binance/order/test   -H "Content-Type: application/json"   -d '{"symbol":"BTCUSDT","side":"BUY","type":"LIMIT","timeInForce":"GTC","quantity":0.001,"price":22000}'
```

---

## 3) Gerçek Emir (SIGNED) — **DİKKAT: SANDBOX=false ise canlı emir olur**
```bash
curl -X POST http://localhost:8080/exchange/binance/order   -H "Content-Type: application/json"   -d '{"symbol":"BTCUSDT","side":"BUY","type":"MARKET","quantity":0.001}'
```

Limit örneği:
```bash
curl -X POST http://localhost:8080/exchange/binance/order   -H "Content-Type: application/json"   -d '{"symbol":"BTCUSDT","side":"SELL","type":"LIMIT","timeInForce":"GTC","quantity":0.001,"price":35000}'
```

Yanıt (özet):
```json
{
  "symbol": "BTCUSDT",
  "orderId": 123456789,
  "clientOrderId": "bb-1692799123456",
  "transactTime": 1692799123123,
  "status": "FILLED"
}
```

---

## 4) Emir İptali (SIGNED)
`orderId` **veya** `origClientOrderId` ile iptal.

```bash
curl -X DELETE http://localhost:8080/exchange/binance/order   -H "Content-Type: application/json"   -d '{"symbol":"BTCUSDT","orderId":123456789}'
```

Client ID ile:
```bash
curl -X DELETE http://localhost:8080/exchange/binance/order   -H "Content-Type: application/json"   -d '{"symbol":"BTCUSDT","origClientOrderId":"bb-1692799123456"}'
```

---

## 5) exchangeInfo (public)
Sembol filtre bilgileri (minQty/stepSize vb.) için.
```bash
curl http://localhost:8080/exchange/binance/exchangeInfo
```

---

## 6) Rate-Limit & Hata Notları
- Gateway, Binance yanıtlarındaki `x-mbx-used-weight-1m` başlığını okur ve loglar.
- 418/429 durumlarında gateway `{ code: "BINANCE_RATE_LIMIT", details: { rate } }` döner.
- Gerçek emirlerden önce **test order** ile doğrulayın.
- Yanıt hatası: Binance genelde `{ code: -xxxx, msg: "..." }` döner; gateway bunu `{ code: "BINANCE_ERROR", message, details }` olarak normalize eder.

# Robots API (BINNBOT)

Bu doküman, API Gateway üzerinden **robot** uçlarını hızlıca kullanmak için örnek istek/yanıtları içerir.

---

## 1) GET /robots
Kullanıcının robotlarını listeler.

**Response (200)**
```json
{
  "items": [
    {
      "id": "r-123",
      "name": "Robot – BTCUSDT – buy",
      "market": "spot",
      "symbol": "BTCUSDT",
      "side": "buy",
      "status": "active",
      "createdAt": "2025-08-24T10:00:00Z",
      "updatedAt": "2025-08-24T10:00:00Z"
    }
  ]
}
```

---

## 2) POST /robots
Yeni robot oluşturur.

**Body**
```json
{
  "name": "Robot – BTCUSDT – buy",
  "market": "spot",
  "symbol": "BTCUSDT",
  "side": "buy",
  "schedule": { "mode": "immediate" },
  "params": {}
}
```

**Notes**
- `name` **opsiyonel**, boşsa otomatik olarak **"Robot – {symbol} – {side}"** atanır.
- `market`: `spot | futures`
- `side`: `buy | sell | long | short`

**Response (201)**
```json
{
  "id": "r-abc",
  "name": "Robot – BTCUSDT – buy",
  "market": "spot",
  "symbol": "BTCUSDT",
  "side": "buy",
  "status": "active",
  "createdAt": "2025-08-24T10:05:00Z",
  "updatedAt": "2025-08-24T10:05:00Z"
}
```

---

## 3) PATCH /robots/{id}
Robotu parça parça günceller.

**Validations**
- `market in [spot, futures]`
- `side in [buy, sell, long, short]`
- `status in [active, paused, stopped]`
- `schedule.mode in [immediate, window, absolute]`
  - `window` için `schedule.window.start` ve `schedule.window.end` zorunlu
  - `absolute` için `schedule.startAt` **veya** `schedule.stopAt` zorunlu

**Body (ör.)**
```json
{ "status": "paused" }
```

**Response (200)**
```json
{
  "id": "r-abc",
  "status": "paused",
  "updatedAt": "2025-08-24T11:00:00Z"
}
```

---

## 4) DELETE /robots/{id}
Robotu siler.

**Response (204)**
(Boş içerik)

---

## Notlar
- Tüm uçlar **Bearer token** ister (login → `accessToken`).
- Hata formatı tek tiptir: `{ "code": "...", "message": "..." }`

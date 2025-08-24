# Scanner API (BINNBOT)

## Başlıklar (Auth)
Public olmayan uçlar için tüm isteklerde şu başlıkları gönderin:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

---

## 1) GET /scanner/templates
Hazır şablonları listeler.

**Cevap (200)**
```json
[
  { "key": "trend-strong", "name": "Güçlü Trend Coinler", "market": "spot" },
  { "key": "rsi-oversold", "name": "RSI Düşük (Alım Fırsatı)", "market": "spot" }
]
```

---

## 2) POST /scanner/search
Şablon (**template**) veya kurallar (**rules**) ile tarama yapar.

### 2.1) Şablon ile arama
**İstek**
```json
{
  "market": "spot",
  "template": "trend-strong"
}
```

**Cevap (200)**
```json
[
  { "symbol": "BTCUSDT", "change24h": 0.034, "volume24h": 250000000, "score": 0.82 }
]
```

---

### 2.2) Kurallar ile arama
**Operatörler:** `gt, gte, lt, lte, eq, neq`  
**Alanlar:** `ema50, ema200, rsi, atr, adx, change24h, volume24h`

- **Sayı ile karşılaştırma:**
```json
{
  "market": "spot",
  "rules": [
    { "field": "rsi", "op": "lte", "value": 30 },
    { "field": "adx", "op": "gte", "value": 25 }
  ]
}
```

- **Alan–alana karşılaştırma (örn. ema50 > ema200):**
```json
{
  "market": "spot",
  "rules": [
    { "field": "ema50", "op": "gt", "valueField": "ema200" }
  ]
}
```

**Cevap (200)**
```json
[
  { "symbol": "BTCUSDT", "change24h": 0.034, "volume24h": 250000000, "score": 0.82 }
]
```

---

## Notlar
- `market` varsayılanı `spot`’tur.  
- `template` verilirse kurallar o şablondan gelir.  
- `rules` verilirse doğrudan o kurallar uygulanır.  
- `rules` içinde **ya** `value` **ya da** `valueField` kullanılır.

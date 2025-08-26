# Reports API (BINNBOT)

## 1) GET /reports/summary
Tarih aralığına göre PnL özetini döner.

**İstek**
**Cevap (200)**
```json
{
  "pnlTotal": 42031,
  "winrate": 0.61,
  "maxDrawdown": 0.22,
  "pnlDaily": [
    { "date": "2025-08-01", "pnl": 1200 },
    { "date": "2025-08-02", "pnl": -340 }
  ]
}

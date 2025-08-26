# Reports API (BINNBOT)

## 1) GET /reports/summary
Tarih aralığına göre PnL özetini döner.

**İstek**
GET /reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
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
**İstek**
GET /reports/execs?from=YYYY-MM-DD&to=YYYY-MM-DD&limit=100

**Cevap (200)**
[
  {
    "robotId": "r-1",
    "symbol": "BTCUSDT",
    "side": "buy",
    "qty": 100,
    "price": 42000,
    "pnl": 50,
    "ts": "2025-08-02T10:00:12Z"
  }
]


---

## 2) (Eksik) CI’de Prettier/Lint adımı

**Dosya değiştir:** `.github/workflows/ci.yml` → **TAMAMINI aşağıdakiyle değiştir**

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  lint-and-contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      # ✅ Kod biçimi kontrolü (Prettier)
      - name: Prettier Check
        run: npx -y prettier@3.3.3 --check "**/*.{js,ts,jsx,tsx,json,md,yaml,yml}"

      # ✅ OpenAPI lint (Redocly)
      - name: Install Redocly CLI
        run: npm i -g @redocly/cli

      - name: Lint OpenAPI
        run: redocly lint packages/contracts/openapi.yaml

      # (opsiyonel) AsyncAPI lint
      - name: Install Spectral
        run: npm i -g @stoplight/spectral-cli

      - name: Lint AsyncAPI (varsa)
        run: |
          if [ -f packages/contracts/asyncapi.yaml ]; then
            spectral lint packages/contracts/asyncapi.yaml
          fi

  # (opsiyonel) smoke testi eklemek istersen:
  # smoke:
  #   runs-on: ubuntu-latest
  #   steps:
  #     - uses: actions/checkout@v4
  #     - uses: actions/setup-node@v4
  #       with: { node-version: 20 }
  #     - run: node tests/smoke.api.test.mjs

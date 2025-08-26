# BINNBOT — Secrets & Config

Bu dosya staging/prod deploy için gerekli **GitHub Secrets** listesini ve formatını açıklar.

## Gerekli Secret'lar (Staging)
- DOCKERHUB_USERNAME — Docker Hub kullanıcı adı
- DOCKERHUB_TOKEN — Docker Hub Access Token (Docker Hub → Security → Access Tokens)
- STAGING_HOST — Staging sunucu IP/hostname
- STAGING_USER — SSH kullanıcı (örn. ubuntu)
- STAGING_SSH_KEY — SSH private key (PEM), tek satır değil tam içerik (BEGIN/END dahil)
- STAGING_ENV_FILE — .env.staging tam içerik (çok satır). Örnek:

JWT_SECRET=change_me_staging
SCANNER_URL=
REPORTING_URL=
SCHEDULER_URL=
NOTIFIER_URL=
ROBOT_EXEC_URL=
INGESTOR_URL=
DASHBOARD_SYMBOLS=BTCUSDT,ETHUSDT

BINANCE_API_KEY=
BINANCE_API_SECRET=
BINANCE_BASE_URL=https://testnet.binance.vision
BINANCE_SANDBOX=true
BINANCE_WS_URL=wss://testnet.binance.vision/ws

DATABASE_URL=

EMAIL_WEBHOOK_URL=
SMS_WEBHOOK_URL=
PUSH_WEBHOOK_URL=

LOG_PATH=/var/log/binnbot/gateway.jsonl
LOG_REQUESTS=true

## Kontrol Mekanizması
- .github/workflows/secrets-check.yml → PR/push'ta secret’ların varlığını doğrular (eksikse fail).
- deploy/secrets.schema.json → Hangi secret zorunlu? Açıklamalar bu dosyada.

## Deploy Notu
- Staging deploy workflow (deploy-staging.yml) secret’lardan aldığı .env.staging içeriğini uzak sunucuda 
  /opt/binnbot/.env.staging olarak yazar ve container’ı bu dosya ile başlatır.

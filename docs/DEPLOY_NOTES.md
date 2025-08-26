# BINNBOT – Deploy Notları

## Staging
1. Secrets: DOCKERHUB_USERNAME/TOKEN, STAGING_HOST/USER/SSH_KEY/ENV_FILE
2. Workflow: **Deploy Staging** → Run workflow → image boş bırak → latest
3. Sunucuda kontrol:
   - `curl -sf http://localhost:8080/healthz`
   - `tail -f /opt/binnbot/logs/gateway.jsonl`

## Production
1. Secrets: DOCKERHUB_USERNAME/TOKEN, PROD_HOST/USER/SSH_KEY/ENV_FILE, PROD_CADDYFILE, PROD_DOMAIN, CADDY_EMAIL
2. Workflow: **Deploy Prod** → Run workflow (veya v1.* tag push)
3. Dışarıdan doğrulama:
   - `https://<PROD_DOMAIN>/healthz` → 200
   - `https://<PROD_DOMAIN>/metrics.txt` → metrikler
4. SSL sertifikası: Caddy Let’s Encrypt otomatik alır (CADDY_EMAIL)

## Hata Ayıklama
- Deploy job log’larında SSH/compose hatalarını kontrol edin
- Container log:
  - `docker logs --tail=100 binnbot-gateway`
  - `docker logs --tail=100 binnbot-caddy` (prod)

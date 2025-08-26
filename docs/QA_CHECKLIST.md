# BINNBOT – QA Final Checklist

## Fonksiyonel
- [ ] Login → token yenileme (refresh) çalışıyor
- [ ] Robots (spot) → create / run / delete
- [ ] Robots (futures alanları) → leverage / marginMode saklanıyor
- [ ] Tests → Active/Backtest (spot/futures) dummy sonuç dönüyor
- [ ] Scanner → templates ve rules ile arama
- [ ] Reports → summary + execs (limit/from/to)
- [ ] Admin → Users (rol atama + "rolü yenile")
- [ ] Admin → Emergency Stop (create → approve → executed; reason/symbols/openOrders)
- [ ] Admin → Notifier (email/sms/push test)
- [ ] Admin → Audit (filter + CSV + SHA256 export)

## Stabilite
- [ ] /healthz 200
- [ ] /readyz upstream’leri doğru raporluyor
- [ ] /metrics JSON ve /metrics.txt metin endpointleri çalışıyor
- [ ] Gateway rate-limit (429) durumu simüle edildi
- [ ] Hata formatı `{ code, message }` her endpointte korunuyor

## Log & Monitoring
- [ ] LOG_REQUESTS=true iken jsonl dosyaya yazılıyor (staging/prod)
- [ ] /var/log/binnbot/gateway.jsonl tail ile izlenebiliyor
- [ ] Önemli olaylar audit log’a düşüyor (robot.create/run, roles.update, emergency.*)

## Güvenlik
- [ ] RBAC (SuperAdmin/Admin/Analyst/Support) korumaları doğru
- [ ] Sensitif endpointler token olmadan 401 dönüyor
- [ ] Deploy secret’ları eksiksiz (Secrets Check workflow)

## Son
- [ ] README_RUN güncel
- [ ] CHANGELOG güncel
- [ ] Release tag (v1.0.0) oluşturuldu

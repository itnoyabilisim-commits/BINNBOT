# Admin – Sistem Durumu (Health)

Bu sayfa admin panelde **/system** route’unda görünür. Aşağıdaki servislerin `/healthz` uçlarını yoklar:

- API Gateway → `http://localhost:8080/healthz`
- Scanner → `http://localhost:8091/healthz`
- Reporting → `http://localhost:8092/healthz`
- Scheduler → `http://localhost:8093/healthz`
- Notifier → `http://localhost:8094/healthz`

> Yerel geliştirmede servisler çalışmıyorsa “down” görünmesi normaldir.

Mimari (MVP): [Web/Admin] -> [API Gateway] -> services: robot-exec, market-ingestor, scheduler, scanner, reporting, notifier
Veri: Postgres (operasyonel), Redis (cache/limit), RabbitMQ (mesaj), (isteğe bağlı Timescale/ClickHouse zaman serisi)
Gözlemlenebilirlik: Prometheus/Grafana, Loki. Güvenlik: 2FA, KMS secrets, WAF, audit (WORM + hash-zinciri).

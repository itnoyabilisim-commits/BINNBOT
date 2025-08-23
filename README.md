# BINNBOT – Monorepo Starter (MVP İskelet)
Bu repo, konuştuğumuz mimariyi hemen çalıştırılabilir bir iskelet halinde sunar.
Amaç: modüler yapı; yeni geliştirici hızlıca anlayıp katkı verebilsin.

Klasörler:
- apps/web, apps/admin
- services/: api-gateway, robot-exec, market-ingestor, scheduler, scanner, reporting, notifier
- packages/: contracts (OpenAPI/AsyncAPI), sdk-js, utils
- deploy/: docker-compose.dev.yml
- docs/: architecture.md, CONTRIBUTING.md, adr/0001-repo-architecture.md, RUNBOOKS/acil-stop.md
- .github/workflows/ci.yml

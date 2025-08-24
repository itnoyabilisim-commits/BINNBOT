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
## Çalıştırma Rehberi
Detaylı adımlar için [README_RUN.md](./README_RUN.md) dosyasına bakın.
## Kullanıcı Akışı (Özet)
1. /login → { email, password } ile giriş yap → access + refresh token localStorage’a yazılır
2. Korumalı sayfalarda (_app.js): token yoksa /login’e yönlendir
3. API çağrısı 401 dönerse (api.js): /auth/refresh ile yeni access alınır, istek tekrar edilir
4. /logout → tokenlar temizlenir, /login’e yönlendirilir
## M2 (PLUS) Durumu – Özet
- JWT refresh flow ✓ (frontend auto-refresh)
- Robot Exec → Reporting /execs POST ✓ (simülasyon)
- Scanner gerçek filtre motoru (EMA/RSI/ATR/ADX) ✓
- Reporting /summary from–to filtresi ✓
- Kalan: Reporting kalıcı DB şeması, gateway rate-limit iyileştirmeleri, web API bağları için ek UX
## Navigasyon (Web)
Uygulama içinde üst menü: **Dashboard · Testler · Robotlar · Tarayıcı · Raporlar · Etkileşim · Destek · Üyelik · Çıkış**  
(Login sayfasında gizlenir; diğer sayfalarda görünür.)

# Yönetici Paneli – Final

## Roller (RBAC)
SuperAdmin, Admin, Support, Moderator, Content, Analyst, Billing (least-privilege, 2FA, audit).

## Modüller
- Kullanıcı Yönetimi (askıya al/aktif et, parola reset, plan değişimi)
- Plan & Faturalandırma (plan matrisi, kupon, ödeme yöntemleri, iade/cayma)
- Robot Monitörü + **Acil Stop** (dry-run, kapsam/istisna, 2FA, iki-kişi onayı)
- Test & Tarayıcı Yönetimi (job kuyrukları, şablonlar)
- CMS (Eğitim, SSS, Doküman, Yenilikler/Patch)
- Etkileşim & Moderasyon (akış, şikayet/uyarı/ban, rozet)
- Destek (ticket SLA, chat, AI bot metrikleri)
- Bildirim & Entegrasyon (e-posta/SMS/push, haber kaynakları, webhook)
- Sistem Durumu & Operasyon (servis sağlık, kuyruk gecikme/ret; bakım modu; feature flags; shadow-run)
- Audit & Güvenlik (WORM + hash-zinciri + timestamp; arşiv; legal hold; arama & imzalı export)

## Mobil Yönetim
Remote Config, Push kampanya, analitik/crash; kritik onay (opsiyonel).

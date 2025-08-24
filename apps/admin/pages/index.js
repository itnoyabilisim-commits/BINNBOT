// apps/admin/pages/index.js

export default function AdminHome() {
  return (
    <div className="admin-root" style={{ display: "flex", fontFamily: "sans-serif" }}>
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ width: "220px", borderRight: "1px solid #ccc", padding: "20px" }}>
        <h3>BINNBOT Admin</h3>
        <nav style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
          <a href="/users">Kullanıcı Yönetimi</a>
          <a href="/billing">Plan & Faturalandırma</a>
          <a href="/robots">Robot Monitörü (Acil Stop)</a>
          <a href="/tests">Test & Tarayıcı Yönetimi</a>
          <a href="/content">İçerik (Eğitim/SSS/Yenilikler)</a>
          <a href="/moderation">Etkileşim & Moderasyon</a>
          <a href="/support">Destek Merkezi</a>
          <a href="/notifier">Bildirim & Entegrasyon</a>
          <a href="/system">Sistem Durumu</a>
          <a href="/audit">Audit & Güvenlik</a>
        </nav>
      </aside>

      {/* Main */}
      <main className="admin-main" style={{ flex: 1, padding: "20px" }}>
        <header className="admin-header" style={{ marginBottom: "20px" }}>
          <span>Rol: SuperAdmin (örnek)</span>
        </header>

        <section className="admin-section">
          <h2>Yönetici Paneli</h2>
          <p>
            Bu shell, konuştuğumuz modüllerin bir iskeletidir. Soldaki menüden istediğin modülü
            seçebilirsin. İleride her menü kendi sayfasına ayrılacak ve gerçek verilerle bağlanacak.
          </p>
          <ul>
            <li>RBAC (roller): SuperAdmin, Admin, Support, Moderator, Content, Analyst, Billing</li>
            <li>Acil Stop: dry-run, kapsam/istisna, 2FA, iki-kişi onayı</li>
            <li>Audit: WORM + hash-zinciri + timestamp + legal hold</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

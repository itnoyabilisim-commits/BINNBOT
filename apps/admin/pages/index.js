export default function AdminHome() {
  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <h3>BINNBOT Admin</h3>
        <nav>
          <a href="#">Kullanıcı Yönetimi</a>
          <a href="#">Plan & Faturalandırma</a>
          <a href="#">Robot Monitörü (Acil Stop)</a>
          <a href="#">Test & Tarayıcı Yönetimi</a>
          <a href="#">İçerik (Eğitim/SSS/Yenilikler)</a>
          <a href="#">Etkileşim & Moderasyon</a>
          <a href="#">Destek Merkezi</a>
          <a href="#">Bildirim & Entegrasyon</a>
          <a href="#">Sistem Durumu</a>
          <a href="#">Audit & Güvenlik</a>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <span>Rol: SuperAdmin (örnek)</span>
        </header>

        <section className="admin-section">
          <h2>Yönetici Paneli</h2>
          <p>
            Bu shell, konuştuğumuz modüllerin bir iskeletidir. İleride her menü maddesi kendi sayfasına
            (route) ayrılacak ve gerçek verilerle bağlanacaktır.
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

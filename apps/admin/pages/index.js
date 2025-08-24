// apps/admin/pages/index.js
export default function AdminHome() {
  return (
    <div style={{ display: "flex", fontFamily: "sans-serif" }}>
      {/* Sidebar */}
      <nav style={{
        width: "220px",
        borderRight: "1px solid #ccc",
        padding: "20px",
        height: "100vh"
      }}>
        <h2>Admin Panel</h2>
        <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
          <li><a href="/users">Kullanıcı Yönetimi</a></li>
          <li><a href="/billing">Plan & Faturalandırma</a></li>
          <li><a href="/robots">Robot Monitörü</a></li>
          <li><a href="/content">İçerik Yönetimi</a></li>
          <li><a href="/moderation">Etkileşim & Moderasyon</a></li>
          <li><a href="/notifier">Bildirim & Entegrasyon</a></li>
          <li><a href="/system">Sistem Durumu</a></li>
          <li><a href="/audit">Audit & Güvenlik</a></li>
          <li><a href="/binance">Binance Diagnostics</a></li> {/* ← yeni link */}
        </ul>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "20px" }}>
        <h1>Admin Panel Anasayfa</h1>
        <p>Soldaki menüden yönetim modüllerini seçebilirsiniz.</p>
      </main>
    </div>
  );
}

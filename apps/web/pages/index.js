export default function Home() {
  return (
    <div>
      <header style={{ padding: "20px", background: "#0B0F17", color: "#fff" }}>
        <h1>BINNBOT</h1>
        <nav>
          <a href="#">Al-Sat Kripto Robot</a> |{" "}
          <a href="#">Güçlü Özellikler</a> |{" "}
          <a href="#">Etkileşim</a> |{" "}
          <a href="#">Destek Merkezi</a> |{" "}
          <button style={{ background: "#F4B400", border: "none", padding: "6px 12px" }}>
            Hemen Başla
          </button>
        </nav>
      </header>

      <main style={{ padding: "40px" }}>
        <section style={{ marginBottom: "40px" }}>
          <h2>Profesyonel ama basit ve anlaşılır deneyim</h2>
          <p>Spot & Vadeli için Backtest → Active Test → Robot. Güvenli entegrasyon, raporlar ve mobil yönetim.</p>
        </section>

        <section style={{ display: "flex", gap: "20px" }}>
          <div style={{ border: "1px solid #ccc", padding: "20px" }}>Active Test</div>
          <div style={{ border: "1px solid #ccc", padding: "20px" }}>Backtest</div>
          <div style={{ border: "1px solid #ccc", padding: "20px" }}>Spot İşlem Robotu</div>
          <div style={{ border: "1px solid #ccc", padding: "20px" }}>Vadeli İşlem Robotu</div>
          <div style={{ border: "1px solid #ccc", padding: "20px" }}>Kripto Tarayıcı</div>
        </section>
      </main>

      <footer style={{ padding: "20px", background: "#111", color: "#aaa" }}>
        <p>© {new Date().getFullYear()} BINNBOT · Gizlilik · Kullanım · Çerezler</p>
      </footer>
    </div>
  );
}

// apps/web/pages/dashboard.js

export default function Dashboard() {
  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Dashboard</h1>
      <p>Hoş geldin, <b>user@binnbot.com</b></p>

      {/* Özet kartlar */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={{ flex: 1, padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>Günlük PnL</h3>
          <p style={{ fontSize: "20px", color: "green" }}>+₺1,245</p>
        </div>
        <div style={{ flex: 1, padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>Açık Pozisyon</h3>
          <p style={{ fontSize: "20px" }}>3</p>
        </div>
        <div style={{ flex: 1, padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>Toplam PnL</h3>
          <p style={{ fontSize: "20px" }}>₺42,031</p>
        </div>
      </div>

      {/* Piyasa yönü */}
      <section style={{ marginTop: "30px" }}>
        <h2>Piyasa Yönü</h2>
        <p><b>Yukarı</b> 📈 (dummy data)</p>
      </section>

      {/* Haber akışı */}
      <section style={{ marginTop: "30px" }}>
        <h2>Haber Akışı</h2>
        <ul>
          <li>Bitcoin ETF onayı ile piyasa hareketlendi</li>
          <li>Ethereum güncellemesi başarıyla tamamlandı</li>
          <li>BNB hacmi son 24 saatte %18 arttı</li>
        </ul>
      </section>
    </div>
  );
}

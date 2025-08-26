// apps/web/pages/dashboard.js
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [market, setMarket] = useState("yükleniyor...");
  const [news, setNews] = useState([]);
  const [kpis, setKpis] = useState({ robots: 0, pnl: 0, users: 0 });

  useEffect(() => {
    // dummy fetch – backend bağlayınca gateway’den gelecek
    setMarket("Yukarı Yönlü");
    setKpis({ robots: 12, pnl: 4210, users: 128 });
    setNews([
      { id: 1, title: "BTC ETF onayı gündemde", ts: "2025-08-26" },
      { id: 2, title: "ETH Merge sonrası işlem hacmi arttı", ts: "2025-08-25" }
    ]);
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: 20 }}>
      <h1>📊 Dashboard</h1>

      {/* Piyasa durumu */}
      <section style={{ marginTop: 24 }}>
        <h2>Piyasa Durumu</h2>
        <div
          style={{
            padding: 20,
            background: "#121824",
            border: "1px solid #1F2937",
            borderRadius: 12,
          }}
        >
          Şu an piyasa: <strong>{market}</strong>
        </div>
      </section>

      {/* KPI kutuları */}
      <section style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        <div style={{ background: "#121824", padding: 16, borderRadius: 12 }}>
          <div>Çalışan Robot</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{kpis.robots}</div>
        </div>
        <div style={{ background: "#121824", padding: 16, borderRadius: 12 }}>
          <div>Toplam PnL</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--green)" }}>₺{kpis.pnl}</div>
        </div>
        <div style={{ background: "#121824", padding: 16, borderRadius: 12 }}>
          <div>Aktif Kullanıcı</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{kpis.users}</div>
        </div>
      </section>

      {/* Haber akışı (Plus/Pro) */}
      <section style={{ marginTop: 24 }}>
        <h2>📢 Haber Akışı</h2>
        {news.length === 0 && <p>Haber bulunamadı.</p>}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {news.map((n) => (
            <li key={n.id} style={{ margin: "12px 0", padding: 12, background: "#121824", borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: "#B7C0D1" }}>{n.ts}</div>
              <div style={{ fontWeight: 600 }}>{n.title}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

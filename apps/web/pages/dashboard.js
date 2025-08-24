// apps/web/pages/dashboard.js
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({ pnlDaily: 0, openPositions: 0, activeRobots: 0 });
  const [ticks, setTicks] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8090");
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        setStats({ pnlDaily: data.pnlDaily, openPositions: data.openPositions, activeRobots: data.activeRobots });
        setTicks(Array.isArray(data.symbols) ? data.symbols : []);
      } catch {}
    };
    return () => ws.close();
  }, []);

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Dashboard</h1>

      {/* Özet kartlar (summary + dummy) */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={{ flex: 1, padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>Günlük PnL (Son Gün)</h3>
          <p style={{ fontSize: "24px", color: stats.pnlDaily >= 0 ? "green" : "red" }}>
            {Number(stats.pnlDaily).toFixed(2)} ₺
          </p>
        </div>
        <div style={{ flex: 1, padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>Açık Pozisyon</h3>
          <p style={{ fontSize: "24px" }}>{stats.openPositions}</p>
        </div>
        <div style={{ flex: 1, padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>Aktif Robotlar</h3>
          <p style={{ fontSize: "24px" }}>{stats.activeRobots}</p>
        </div>
      </div>

      {/* Canlı fiyatlar */}
      <section style={{ marginTop: 30 }}>
        <h2>Canlı Fiyatlar (market-ingestor)</h2>
        {ticks.length === 0 ? (
          <p>Veri bekleniyor...</p>
        ) : (
          <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr style={{ background: "#eee" }}>
                <th>Symbol</th><th>Bid</th><th>Ask</th><th>Ts</th>
              </tr>
            </thead>
            <tbody>
              {ticks.map((t, i) => (
                <tr key={i}>
                  <td>{t.symbol}</td>
                  <td>{t.bid ?? "-"}</td>
                  <td>{t.ask ?? "-"}</td>
                  <td>{t.ts ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

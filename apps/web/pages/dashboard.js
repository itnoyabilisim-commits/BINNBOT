// apps/web/pages/dashboard.js
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({ pnlDaily: 0, openPositions: 0, activeRobots: 0 });

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8090");
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        setStats(data);
      } catch {}
    };
    return () => ws.close();
  }, []);

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Dashboard</h1>
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={{ flex: 1, padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>Günlük PnL</h3>
          <p style={{ fontSize: "24px", color: stats.pnlDaily >= 0 ? "green" : "red" }}>
            {stats.pnlDaily} ₺
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
    </div>
  );
}

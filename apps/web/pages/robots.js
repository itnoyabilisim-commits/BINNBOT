// apps/web/pages/robots.js
import { useState } from "react";

export default function Robots() {
  const [robots, setRobots] = useState([
    { id: "1", name: "BTC Spot Robot", market: "spot", symbol: "BTCUSDT", side: "buy", status: "active" },
    { id: "2", name: "ETH Spot Robot", market: "spot", symbol: "ETHUSDT", side: "sell", status: "stopped" }
  ]);

  function addDummyRobot() {
    const newRobot = {
      id: Date.now().toString(),
      name: "Yeni Robot",
      market: "spot",
      symbol: "BNBUSDT",
      side: "buy",
      status: "active"
    };
    setRobots([...robots, newRobot]);
  }

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Robotlar</h1>
      <p>Burada Spot ve (Pro için) Vadeli robotlar listelenecek.</p>

      <button
        onClick={addDummyRobot}
        style={{
          background: "#F4B400",
          color: "#000",
          border: "none",
          padding: "10px 20px",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "20px"
        }}
      >
        + Yeni Robot Ekle
      </button>

      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>ID</th>
            <th>Adı</th>
            <th>Market</th>
            <th>Symbol</th>
            <th>Side</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {robots.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.name}</td>
              <td>{r.market}</td>
              <td>{r.symbol}</td>
              <td>{r.side}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

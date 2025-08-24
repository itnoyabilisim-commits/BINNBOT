// apps/web/pages/robots.js
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

export default function Robots() {
  const [robots, setRobots] = useState([]);
  const [form, setForm] = useState({
    name: "Yeni Robot",
    market: "spot",
    symbol: "BTCUSDT",
    side: "buy"
  });
  const [msg, setMsg] = useState("");

  // Listeyi yükle
  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet("/robots");
        setRobots(data.items || []);
      } catch (e) {
        setMsg("Liste alınamadı (login gerekebilir)");
      }
    })();
  }, []);

  async function createRobot(e) {
    e.preventDefault();
    setMsg("Kaydediliyor...");
    try {
      const r = await apiPost("/robots", form);
      setRobots(prev => [...prev, r]);
      setMsg("Robot oluşturuldu");
    } catch (e) {
      setMsg("Hata: " + e.message);
    }
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Robotlar</h1>
      <p style={{ color: "#666" }}>Spot (Plus) · Vadeli (Pro) — API'ye bağlı dummy</p>

      {/* Yeni Robot Formu */}
      <form onSubmit={createRobot} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "20px" }}>
        <input name="name"   value={form.name}   onChange={onChange} placeholder="Ad" />
        <select name="market" value={form.market} onChange={onChange}>
          <option value="spot">spot</option>
          <option value="futures">futures</option>
        </select>
        <input name="symbol" value={form.symbol} onChange={onChange} placeholder="Symbol (BTCUSDT)" />
        <select name="side" value={form.side} onChange={onChange}>
          <option value="buy">buy</option>
          <option value="sell">sell</option>
          <option value="long">long</option>
          <option value="short">short</option>
        </select>
        <button type="submit" style={{ gridColumn: "span 4", background: "#F4B400", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer" }}>
          + Oluştur
        </button>
      </form>

      {msg && <p style={{ marginBottom: 10 }}>{msg}</p>}

      {/* Liste */}
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>ID</th><th>Ad</th><th>Market</th><th>Symbol</th><th>Side</th><th>Status</th>
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

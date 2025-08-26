// apps/admin/pages/robots.js
import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "../lib/api";

export default function RobotsAdmin() {
  const [robots, setRobots] = useState([]);
  const [msg, setMsg] = useState("");
  const [execResp, setExecResp] = useState(null);

  async function load() {
    try {
      const data = await apiGet("/robots");
      setRobots(data.items || []);
    } catch (e) {
      setMsg("Liste alınamadı (login gerekebilir)");
    }
  }
  useEffect(() => { load(); }, []);

  async function runRobot(id) {
    setMsg("Çalıştırılıyor...");
    setExecResp(null);
    try {
      const r = await apiPost(`/robots/${id}/run`, { qty: 0.1, price: 42000 });
      setExecResp(r);
      setMsg("Çalıştırıldı");
    } catch (e) {
      setMsg("Run hata: " + e.message);
    }
  }

  async function toggleStatus(id, status) {
    try {
      const updated = await apiPatch(`/robots/${id}`, { status });
      setRobots(prev => prev.map(r => r.id === id ? updated : r));
    } catch (e) { setMsg("Status hata: " + e.message); }
  }

  async function removeRobot(id) {
    if (!confirm("Silinsin mi?")) return;
    try {
      await apiDelete(`/robots/${id}`);
      setRobots(prev => prev.filter(r => r.id !== id));
    } catch (e) { setMsg("Sil hata: " + e.message); }
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Robotlar (Admin)</h1>
      {msg && <p>{msg}</p>}
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead><tr style={{ background: "#eee" }}>
          <th>ID</th><th>Ad</th><th>Market</th><th>Symbol</th><th>Side</th><th>Status</th><th>İşlem</th>
        </tr></thead>
        <tbody>
          {robots.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td><td>{r.name}</td><td>{r.market}</td>
              <td>{r.symbol}</td><td>{r.side}</td><td>{r.status}</td>
              <td>
                <button onClick={() => runRobot(r.id)}>Çalıştır</button>
                {r.status!=="paused"
                  ? <button onClick={() => toggleStatus(r.id,"paused")}>Durdur</button>
                  : <button onClick={() => toggleStatus(r.id,"active")}>Başlat</button>}
                <button onClick={() => removeRobot(r.id)} style={{ color:"crimson", marginLeft:6 }}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: 20 }}>Son Çalıştırma Yanıtı</h3>
      <pre style={{ background:"#f7f7f7", padding:12 }}>
        {execResp ? JSON.stringify(execResp, null, 2) : "—"}
      </pre>
    </div>
  );
}

// apps/web/pages/robots.js
import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "../lib/api";

export default function Robots() {
  const [robots, setRobots] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "Yeni Robot",
    market: "spot",
    symbol: "BTCUSDT",
    side: "buy"
  });
  const [editForm, setEditForm] = useState({
    name: "",
    market: "spot",
    side: "buy",
    status: "active"
  });
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    try {
      const data = await apiGet("/robots");
      setRobots(data.items || []);
    } catch (e) {
      setMsg("Liste alınamadı (login gerekebilir)");
    }
  }

  useEffect(() => { load(); }, []);

  // Yeni robot oluştur
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

  // Satır içi düzenleme başlat
  function startEdit(r) {
    setEditingId(r.id);
    setEditForm({
      name: r.name || "",
      market: r.market || "spot",
      side: r.side || "buy",
      status: r.status || "active",
    });
  }
  function onEditChange(e) {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  }

  // Güncelle
  async function saveEdit(id) {
    setMsg("Güncelleniyor...");
    try {
      const updated = await apiPatch(`/robots/${id}`, editForm);
      setRobots(prev => prev.map(r => r.id === id ? updated : r));
      setEditingId(null);
      setMsg("Güncellendi");
    } catch (e) {
      setMsg("Hata: " + e.message);
    }
  }

  // Durdur/Başlat kısayolu (status)
  async function toggleStatus(id, status) {
    setMsg("Güncelleniyor...");
    try {
      const updated = await apiPatch(`/robots/${id}`, { status });
      setRobots(prev => prev.map(r => r.id === id ? updated : r));
      setMsg("Güncellendi");
    } catch (e) {
      setMsg("Hata: " + e.message);
    }
  }

  // Sil
  async function removeRobot(id) {
    if (!confirm("Silinsin mi?")) return;
    setMsg("Siliniyor...");
    try {
      await apiDelete(`/robots/${id}`);
      setRobots(prev => prev.filter(r => r.id !== id));
      setMsg("Silindi");
    } catch (e) {
      setMsg("Hata: " + e.message);
    }
  }

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Robotlar</h1>
      <p style={{ color: "#666" }}>Spot (Plus) · Vadeli (Pro)</p>

      {/* Yeni Robot Formu */}
      <form onSubmit={createRobot} style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginBottom: "20px" }}>
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
        <button type="submit" style={{ background: "#F4B400", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer" }}>
          + Oluştur
        </button>
      </form>

      {msg && <p style={{ marginBottom: 10 }}>{msg}</p>}

      {/* Liste */}
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>ID</th><th>Ad</th><th>Market</th><th>Symbol</th><th>Side</th><th>Status</th><th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {robots.map(r => {
            const isEd = editingId === r.id;
            return (
              <tr key={r.id}>
                <td>{r.id}</td>

                {/* Ad */}
                <td>
                  {isEd ? (
                    <input name="name" value={editForm.name} onChange={onEditChange} />
                  ) : r.name}
                </td>

                {/* Market */}
                <td>
                  {isEd ? (
                    <select name="market" value={editForm.market} onChange={onEditChange}>
                      <option value="spot">spot</option>
                      <option value="futures">futures</option>
                    </select>
                  ) : r.market}
                </td>

                {/* Symbol (düzenlemede sabit bırakıyoruz; istersen ekleyebilirim) */}
                <td>{r.symbol}</td>

                {/* Side */}
                <td>
                  {isEd ? (
                    <select name="side" value={editForm.side} onChange={onEditChange}>
                      <option value="buy">buy</option>
                      <option value="sell">sell</option>
                      <option value="long">long</option>
                      <option value="short">short</option>
                    </select>
                  ) : r.side}
                </td>

                {/* Status */}
                <td>
                  {isEd ? (
                    <select name="status" value={editForm.status} onChange={onEditChange}>
                      <option value="active">active</option>
                      <option value="paused">paused</option>
                      <option value="stopped">stopped</option>
                    </select>
                  ) : r.status}
                </td>

                {/* İşlemler */}
                <td>
                  {!isEd ? (
                    <>
                      {r.status !== "paused" ? (
                        <button onClick={() => toggleStatus(r.id, "paused")}>Durdur</button>
                      ) : (
                        <button onClick={() => toggleStatus(r.id, "active")}>Başlat</button>
                      )}
                      <button onClick={() => startEdit(r)} style={{ marginLeft: 8 }}>Düzenle</button>
                      <button onClick={() => removeRobot(r.id)} style={{ marginLeft: 8, color: "crimson" }}>Sil</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => saveEdit(r.id)} style={{ color: "green" }}>Kaydet</button>
                      <button onClick={() => setEditingId(null)} style={{ marginLeft: 8 }}>İptal</button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

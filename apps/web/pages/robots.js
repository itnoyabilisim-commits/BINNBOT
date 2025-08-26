// apps/web/pages/robots.js
import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "../lib/api";

export default function Robots() {
  const [robots, setRobots] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: "Yeni Robot",
    market: "spot",
    symbol: "BTCUSDT",
    side: "buy",
    leverage: 5,
    marginMode: "cross"
  });
  const [editForm, setEditForm] = useState({
    name: "",
    market: "spot",
    side: "buy",
    status: "active",
    leverage: 5,
    marginMode: "cross"
  });

  async function load() {
    setMsg("");
    try {
      const data = await apiGet("/robots");
      setRobots(data.items || []);
    } catch (e) { setMsg("Liste alınamadı (login gerekebilir)"); }
  }
  useEffect(() => { load(); }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name==="leverage" ? Number(value) : value }));
  }

  async function createRobot(e) {
    e.preventDefault();
    setMsg("Kaydediliyor...");
    try {
      const body = { name: form.name, market: form.market, symbol: form.symbol, side: form.side };
      if (form.market === "futures") { body.leverage = form.leverage; body.marginMode = form.marginMode; }
      const r = await apiPost("/robots", body);
      setRobots(prev => [...prev, r]); setMsg("Robot oluşturuldu");
    } catch (e) { setMsg("Hata: " + e.message); }
  }

  function startEdit(r) {
    setEditingId(r.id);
    setEditForm({
      name: r.name || "",
      market: r.market || "spot",
      side: r.side || "buy",
      status: r.status || "active",
      leverage: r.leverage || 5,
      marginMode: r.marginMode || "cross"
    });
  }
  function onEditChange(e) {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: name==="leverage" ? Number(value) : value }));
  }

  async function saveEdit(id) {
    setMsg("Güncelleniyor...");
    try {
      const body = { name: editForm.name, market: editForm.market, side: editForm.side, status: editForm.status };
      if (editForm.market === "futures") { body.leverage = editForm.leverage; body.marginMode = editForm.marginMode; }
      const updated = await apiPatch(`/robots/${id}`, body);
      setRobots(prev => prev.map(r => r.id === id ? updated : r));
      setEditingId(null); setMsg("Güncellendi");
    } catch (e) { setMsg("Hata: " + e.message); }
  }

  async function toggleStatus(id, status) {
    setMsg("Güncelleniyor...");
    try {
      const updated = await apiPatch(`/robots/${id}`, { status });
      setRobots(prev => prev.map(r => r.id === id ? updated : r));
      setMsg("Güncellendi");
    } catch (e) { setMsg("Hata: " + e.message); }
  }

  async function removeRobot(id) {
    if (!confirm("Silinsin mi?")) return;
    setMsg("Siliniyor...");
    try {
      await apiDelete(`/robots/${id}`);
      setRobots(prev => prev.filter(r => r.id !== id));
      setMsg("Silindi");
    } catch (e) { setMsg("Hata: " + e.message); }
  }

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Robotlar</h1>
      <p style={{ color: "#666" }}>Spot & Futures (leverage/margin mode)</p>

      {/* Yeni Robot Formu */}
      <form onSubmit={createRobot} style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px", marginBottom: "20px" }}>
        <input name="name" value={form.name} onChange={onChange} placeholder="Ad" />
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

        {/* Futures alanları */}
        {form.market === "futures" ? (
          <>
            <input name="leverage" type="number" min={1} max={125} value={form.leverage} onChange={onChange} placeholder="Leverage" />
            <select name="marginMode" value={form.marginMode} onChange={onChange}>
              <option value="cross">cross</option>
              <option value="isolated">isolated</option>
            </select>
          </>
        ) : (
          <>
            <div></div><div></div>
          </>
        )}

        <button type="submit" style={{ gridColumn: "span 6", background: "#F4B400", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer" }}>
          + Oluştur
        </button>
      </form>

      {msg && <p style={{ marginBottom: 10 }}>{msg}</p>}

      {/* Liste */}
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>ID</th><th>Ad</th><th>Market</th><th>Symbol</th><th>Side</th><th>Status</th><th>Lev</th><th>Margin</th><th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {robots.map(r => {
            const isEd = editingId === r.id;
            return (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{isEd ? <input name="name" value={editForm.name} onChange={onEditChange}/> : r.name}</td>
                <td>{isEd ? (
                  <select name="market" value={editForm.market} onChange={onEditChange}>
                    <option value="spot">spot</option>
                    <option value="futures">futures</option>
                  </select>
                ) : r.market}
                </td>
                <td>{r.symbol}</td>
                <td>{isEd ? (
                  <select name="side" value={editForm.side} onChange={onEditChange}>
                    <option value="buy">buy</option><option value="sell">sell</option>
                    <option value="long">long</option><option value="short">short</option>
                  </select>
                ) : r.side}
                </td>
                <td>{isEd ? (
                  <select name="status" value={editForm.status} onChange={onEditChange}>
                    <option value="active">active</option><option value="paused">paused</option><option value="stopped">stopped</option>
                  </select>
                ) : r.status}
                </td>

                {/* Futures alanları */}
                <td>{isEd ? (editForm.market==="futures"
                  ? <input name="leverage" type="number" min={1} max={125} value={editForm.leverage} onChange={onEditChange}/>
                  : "-") : (r.market==="futures" ? r.leverage||"-" : "-")}
                </td>
                <td>{isEd ? (editForm.market==="futures"
                  ? <select name="marginMode" value={editForm.marginMode} onChange={onEditChange}>
                      <option value="cross">cross</option><option value="isolated">isolated</option>
                    </select> : "-")
                  : (r.market==="futures" ? (r.marginMode||"-") : "-")}
                </td>

                <td>
                  {!isEd ? (
                    <>
                      {r.status !== "paused"
                        ? <button onClick={() => toggleStatus(r.id, "paused")}>Durdur</button>
                        : <button onClick={() => toggleStatus(r.id, "active")}>Başlat</button>}
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

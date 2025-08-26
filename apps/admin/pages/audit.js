// apps/admin/pages/audit.js
import { useEffect, useState } from "react";

const GW = "http://localhost:8080";

async function jgetAuth(path) {
  const r = await fetch(`${GW}${path}`, {
    headers: {
      "Authorization": typeof window !== "undefined" ? `Bearer ${localStorage.getItem("accessToken") || ""}` : ""
    }
  });
  const t = await r.text();
  try { return { ok: r.ok, status: r.status, json: t ? JSON.parse(t) : null }; }
  catch { return { ok: r.ok, status: r.status, json: { raw: t } }; }
}

export default function AuditAdmin() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("Yükleniyor...");
    const r = await jgetAuth("/admin/audit");
    if (r.ok && r.json?.items) { setItems(r.json.items); setMsg(""); }
    else { setMsg("Yüklenemedi"); }
  }

  function exportCSV() {
    const header = ["ts","event","actor","role","payload"];
    const rows = items.map(x => [
      x.ts || "",
      x.event || "",
      x.actor || "",
      x.role || "",
      JSON.stringify(x.payload || {})
    ]);
    const content = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `audit-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Audit & Güvenlik</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button onClick={load}>Yenile</button>
        <button onClick={exportCSV}>CSV Dışa Aktar</button>
      </div>
      {msg && <p style={{ color: "#b00" }}>{msg}</p>}
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>Zaman</th><th>Olay</th><th>Kullanıcı</th><th>Rol</th><th>Detay</th>
          </tr>
        </thead>
        <tbody>
          {items.slice().reverse().map((x, i) => (
            <tr key={i}>
              <td>{x.ts}</td>
              <td>{x.event}</td>
              <td>{x.actor || "-"}</td>
              <td>{x.role || "-"}</td>
              <td><pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(x.payload || {}, null, 2)}</pre></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

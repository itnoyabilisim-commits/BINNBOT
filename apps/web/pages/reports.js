// apps/web/pages/reports.js
import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [execs, setExecs] = useState([]);
  const [msg, setMsg] = useState("");
  const [from, setFrom] = useState(""); // YYYY-MM-DD
  const [to, setTo] = useState("");

  function buildQS(obj) {
    const params = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => { if (v) params.set(k, v); });
    const s = params.toString();
    return s ? `?${s}` : "";
  }

  async function load() {
    setMsg("");
    const qs = buildQS({ from, to });
    try {
      const s = await apiGet(`/reports/summary${qs}`);
      setSummary(s);
    } catch (e) {
      setMsg("Özet alınamadı (login gerekebilir)");
    }
    try {
      const ex = await apiGet(`/reports/execs${qs}`);
      if (Array.isArray(ex)) setExecs(ex);
    } catch {}
  }

  useEffect(() => { load(); }, []);

  const isArraySummary = Array.isArray(summary);

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Raporlar</h1>

      {/* Tarih filtresi */}
      <div style={{ display: "flex", gap: 10, margin: "10px 0 20px" }}>
        <div>
          <label>From</label><br />
          <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
        </div>
        <div>
          <label>To</label><br />
          <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
        </div>
        <button
          onClick={load}
          style={{ alignSelf: "end", background: "#F4B400", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}
        >
          Uygula
        </button>
      </div>

      {msg && <p style={{ color: "crimson" }}>{msg}</p>}
      {!summary && !msg && <p>Yükleniyor...</p>}

      {/* Özet (object) */}
      {!isArraySummary && summary && (
        <>
          <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
            <div><b>Toplam PnL:</b> ₺{summary.pnlTotal}</div>
            <div><b>Winrate:</b> {(summary.winrate * 100).toFixed(0)}%</div>
            <div><b>Max DD:</b> {(summary.maxDrawdown * 100).toFixed(0)}%</div>
          </div>

          <h2>Günlük PnL</h2>
          <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%", marginTop: "10px" }}>
            <thead>
              <tr style={{ background: "#eee" }}>
                <th>Tarih</th><th>PnL (₺)</th>
              </tr>
            </thead>
            <tbody>
              {(summary.pnlDaily || []).map((d, i) => (
                <tr key={i}>
                  <td>{d.date}</td>
                  <td style={{ color: d.pnl >= 0 ? "green" : "red" }}>{d.pnl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Özet (array) – DB'den satırlar */}
      {isArraySummary && summary && (
        <>
          <h2>Özet (DB Son Kayıtlar)</h2>
          <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%", marginTop: "10px" }}>
            <thead>
              <tr style={{ background: "#eee" }}>
                <th>Tarih</th><th>E-posta</th><th>PnL</th><th>Winrate</th><th>Max DD</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((r, i) => (
                <tr key={i}>
                  <td>{r.created_at || r.date || "-"}</td>
                  <td>{r.user_email || "-"}</td>
                  <td style={{ color: (r.pnl ?? 0) >= 0 ? "green" : "red" }}>{r.pnl ?? "-"}</td>
                  <td>{r.winrate ?? "-"}</td>
                  <td>{r.max_drawdown ?? r.maxDrawdown ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Execution listesi */}
      <section style={{ marginTop: "30px" }}>
        <h2>Gerçekleşen İşlemler (Executions)</h2>
        {execs.length === 0 ? (
          <p>Henüz execution verisi yok.</p>
        ) : (
          <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr style={{ background: "#eee" }}>
                <th>Zaman</th><th>Robot</th><th>Symbol</th><th>Side</th><th>Qty</th><th>Fiyat</th><th>PnL</th>
              </tr>
            </thead>
            <tbody>
              {execs.map((e, i) => (
                <tr key={i}>
                  <td>{e.ts || e.created_at || "-"}</td>
                  <td>{e.robotId || "-"}</td>
                  <td>{e.symbol || "-"}</td>
                  <td>{e.side || "-"}</td>
                  <td>{e.qty || e.filledQty || "-"}</td>
                  <td>{e.price || e.avgPrice || "-"}</td>
                  <td style={{ color: (Number(e.pnl) || 0) >= 0 ? "green" : "red" }}>{e.pnl ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

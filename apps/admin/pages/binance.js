// apps/admin/pages/binance.js
import { useState } from "react";

const GW = "http://localhost:8080";

async function jget(path) {
  const r = await fetch(`${GW}${path}`);
  const t = await r.text();
  try { return { ok: r.ok, status: r.status, json: t ? JSON.parse(t) : null }; }
  catch { return { ok: r.ok, status: r.status, json: { raw: t } }; }
}
async function jpost(path, body) {
  const r = await fetch(`${GW}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {})
  });
  const t = await r.text();
  try { return { ok: r.ok, status: r.status, json: t ? JSON.parse(t) : null }; }
  catch { return { ok: r.ok, status: r.status, json: { raw: t } }; }
}

export default function BinanceAdmin() {
  const [resp, setResp] = useState(null);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [qty, setQty] = useState("0.001");

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Binance Diagnostics</h1>
      <p style={{ color: "#666" }}>Testnet önerilir. `.env` içinde BINANCE_API_KEY/SECRET/BINANCE_BASE_URL ayarlanmalıdır.</p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
        <button onClick={async () => setResp(await jget("/exchange/binance/ping"))}>Ping</button>
        <button onClick={async () => setResp(await jget("/exchange/binance/time"))}>Time</button>
        <button onClick={async () => setResp(await jget("/exchange/binance/account"))}>Account</button>
        <button onClick={async () => setResp(await jpost("/exchange/binance/exchangeInfo/refresh"))}>Refresh exchangeInfo</button>
      </div>

      <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 6 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <label>Symbol</label>
          <input value={symbol} onChange={(e)=>setSymbol(e.target.value.toUpperCase())} style={{ width: 120 }} />
          <label>Quantity</label>
          <input value={qty} onChange={(e)=>setQty(e.target.value)} style={{ width: 120 }} />
          <button onClick={async () => setResp(await jpost("/exchange/binance/order/test", { symbol, side:"BUY", type:"MARKET", quantity: Number(qty) }))}>
            Test BUY (MARKET)
          </button>
        </div>
      </div>

      <h3 style={{ marginTop: 16 }}>Son Yanıt</h3>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f7f7f7", padding: 12, borderRadius: 6 }}>
        {resp ? JSON.stringify(resp, null, 2) : "—"}
      </pre>
    </div>
  );
}

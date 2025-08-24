// apps/web/pages/tests.js
import { useState } from "react";
import { apiPost } from "../lib/api";

export default function Tests() {
  const [tab, setTab] = useState("active");
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("15m");
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");

  async function runBacktest(e) {
    e.preventDefault();
    setMsg("Çalıştırılıyor...");
    setResult(null);
    try {
      const data = await apiPost("/tests/backtest/spot", {
        symbol, timeframe, params: {}
      });
      setResult(data);
      setMsg("");
    } catch (e) {
      setMsg("Hata: " + e.message);
    }
  }

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Testler</h1>

      {/* Sekmeler */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <button
          onClick={() => setTab("active")}
          style={{ padding: "10px 20px", background: tab === "active" ? "#F4B400" : "#eee", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Active Test
        </button>
        <button
          onClick={() => setTab("backtest")}
          style={{ padding: "10px 20px", background: tab === "backtest" ? "#F4B400" : "#eee", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Backtest
        </button>
      </div>

      {tab === "active" && (
        <section>
          <h2>Active Test (Dummy)</h2>
          <p>Burada spot/vadeli için aktif test seçenekleri olacak.</p>
          <ul>
            <li>İndikatör seçimi (SuperTrend, MACD, RSI vs.)</li>
            <li>Filtreler (EMA, ATR, ADX vs.)</li>
            <li>RSI ve SL/TP noktaları için anlık kontrol (dummy)</li>
          </ul>
        </section>
      )}

      {tab === "backtest" && (
        <section>
          <h2>Backtest (Spot)</h2>
          <form onSubmit={runBacktest} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol (BTCUSDT)" />
            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
              <option value="1d">1d</option>
            </select>
            <button type="submit" style={{ background: "#F4B400", border: "none", padding: "10px 20px", borderRadius: 6, cursor: "pointer" }}>
              Çalıştır
            </button>
          </form>

          {msg && <p>{msg}</p>}

          {result && (
            <>
              <div style={{ display: "flex", gap: 20 }}>
                <div><b>PnL:</b> ₺{result.pnl}</div>
                <div><b>Winrate:</b> {(result.winrate * 100).toFixed(0)}%</div>
                <div><b>Max DD:</b> {(result.maxDrawdown * 100).toFixed(0)}%</div>
              </div>

              <h3 style={{ marginTop: 20 }}>İşlemler (dummy)</h3>
              <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr style={{ background: "#eee" }}>
                    <th>Zaman</th><th>Yön</th><th>Miktar</th><th>Fiyat</th><th>Sonuç</th>
                  </tr>
                </thead>
                <tbody>
                  {(result.trades || []).map((t, i) => (
                    <tr key={i}>
                      <td>{t.time}</td>
                      <td>{t.side}</td>
                      <td>{t.qty}</td>
                      <td>{t.price}</td>
                      <td>{t.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>
      )}
    </div>
  );
}

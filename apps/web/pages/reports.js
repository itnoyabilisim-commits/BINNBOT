// apps/web/pages/reports.js
import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export default function Reports() {
  const [summary, setSummary] = useState(null); // { pnlTotal, winrate, maxDrawdown, pnlDaily: [...] } veya array
  const [execs, setExecs] = useState([]);       // /reports/execs dönen liste
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const s = await apiGet("/reports/summary");
        setSummary(s);
      } catch (e) {
        setMsg("Özet alınamadı (login gerekebilir)");
      }
      try {
        const ex = await apiGet("/reports/execs");
        // gateway proxy yoksa 404 gelebilir; o durumda görmezden gel
        if (Array.isArray(ex)) setExecs(ex);
      } catch {}
    })();
  }, []);

  const isArraySummary = Array.isArray(summary);

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Raporlar</h1>
      {msg && <p style={{ color: "crimson" }}>{msg}</p>}

      {/* Özet: summary objesi */}
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

      {/* Özet: summary array (DB'den satırlar) */}
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

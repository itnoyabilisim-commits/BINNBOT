// apps/web/pages/reports.js
import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet("/reports/summary");
        // gateway dummy: { pnlTotal, winrate, maxDrawdown, pnlDaily: [...] }
        // veya reporting servisi gerçek DB satırları dönebilir (array)
        setSummary(data);
      } catch (e) {
        setMsg("Rapor alınamadı (login gerekebilir)");
      }
    })();
  }, []);

  // Her iki olasılığı da destekle (objeyse özet, array ise satır listesi)
  const isArray = Array.isArray(summary);

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Raporlar</h1>

      {msg && <p style={{ color: "crimson" }}>{msg}</p>}

      {!summary && !msg && <p>Yükleniyor...</p>}

      {/* Özet modu (gateway dummy/summary.json şeması) */}
      {!isArray && summary && (
        <>
          <div style={{ display: "flex", gap: 20 }}>
            <div><b>Toplam PnL:</b> ₺{summary.pnlTotal}</div>
            <div><b>Winrate:</b> {(summary.winrate * 100).toFixed(0)}%</div>
            <div><b>Max DD:</b> {(summary.maxDrawdown * 100).toFixed(0)}%</div>
          </div>

          <h2 style={{ marginTop: 20 }}>Günlük PnL</h2>
          <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
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

      {/* Liste modu (reporting DB'den dizi dönerse) */}
      {isArray && summary && (
        <>
          <h2>Son Kayıtlar</h2>
          <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
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
    </div>
  );
}

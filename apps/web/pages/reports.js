// apps/web/pages/reports.js
import { useState } from "react";

export default function Reports() {
  const [reports] = useState([
    { date: "2025-08-01", pnl: 1200, winrate: "62%", maxDD: "18%" },
    { date: "2025-08-02", pnl: -340, winrate: "58%", maxDD: "20%" },
    { date: "2025-08-03", pnl: 780, winrate: "64%", maxDD: "15%" }
  ]);

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Raporlar</h1>
      <p>Burada geçmiş işlem sonuçlarını görebilirsin (dummy).</p>

      {/* Tablo */}
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%", marginTop: "20px" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>Tarih</th>
            <th>PnL (₺)</th>
            <th>Winrate</th>
            <th>Max Drawdown</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r, i) => (
            <tr key={i}>
              <td>{r.date}</td>
              <td style={{ color: r.pnl >= 0 ? "green" : "red" }}>{r.pnl}</td>
              <td>{r.winrate}</td>
              <td>{r.maxDD}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Grafik placeholder */}
      <section style={{ marginTop: "40px" }}>
        <h2>PnL Grafiği</h2>
        <div style={{
          width: "100%",
          height: "200px",
          background: "linear-gradient(to right, #F4B400 30%, #eee 30%)",
          borderRadius: "8px"
        }}>
          <p style={{ padding: "20px" }}>Dummy grafik placeholder</p>
        </div>
      </section>
    </div>
  );
}

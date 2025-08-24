// apps/web/pages/scanner.js
import { useState } from "react";

export default function Scanner() {
  const [results, setResults] = useState([]);
  const templates = [
    { key: "trend-strong", name: "Güçlü Trend Coinler" },
    { key: "rsi-oversold", name: "RSI Düşük (Alım Fırsatı)" }
  ];

  function runTemplate(tpl) {
    // dummy sonuçlar
    if (tpl.key === "trend-strong") {
      setResults([
        { symbol: "BTCUSDT", change24h: "+3.4%", volume: "250M", score: "0.82" },
        { symbol: "ETHUSDT", change24h: "+2.8%", volume: "180M", score: "0.74" }
      ]);
    } else {
      setResults([
        { symbol: "SOLUSDT", change24h: "-1.2%", volume: "90M", score: "0.65" }
      ]);
    }
  }

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Kripto Tarayıcı</h1>
      <p>Hazır şablonlarla ya da özel filtrelerle arama yapabilirsin (dummy).</p>

      {/* Şablonlar */}
      <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
        {templates.map(tpl => (
          <button
            key={tpl.key}
            onClick={() => runTemplate(tpl)}
            style={{
              background: "#F4B400",
              border: "none",
              borderRadius: "6px",
              padding: "10px 15px",
              cursor: "pointer"
            }}
          >
            {tpl.name}
          </button>
        ))}
      </div>

      {/* Sonuçlar */}
      <div style={{ marginTop: "30px" }}>
        <h2>Sonuçlar</h2>
        {results.length === 0 ? (
          <p>Henüz tarama yapılmadı.</p>
        ) : (
          <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr style={{ background: "#eee" }}>
                <th>Symbol</th>
                <th>24h Değişim</th>
                <th>Hacim</th>
                <th>Skor</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>{r.symbol}</td>
                  <td>{r.change24h}</td>
                  <td>{r.volume}</td>
                  <td>{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

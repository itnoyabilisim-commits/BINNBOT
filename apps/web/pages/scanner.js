// apps/web/pages/scanner.js
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

export default function Scanner() {
  const [templates, setTemplates] = useState([]);
  const [results, setResults] = useState([]);
  const [msg, setMsg] = useState("");

  // şablonları yükle
  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet("/scanner/templates");
        setTemplates(data);
      } catch (e) {
        setMsg("Şablonlar alınamadı (login gerekebilir)");
      }
    })();
  }, []);

  async function runTemplate(key) {
    setMsg("Çalıştırılıyor...");
    try {
      const data = await apiPost("/scanner/search", { market: "spot", template: key });
      setResults(data);
      setMsg("");
    } catch (e) {
      setMsg("Hata: " + e.message);
    }
  }

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Kripto Tarayıcı</h1>
      <p>Hazır şablonlarla ya da özel filtrelerle arama yapabilirsin.</p>

      {/* Şablonlar */}
      <div style={{ display: "flex", gap: "15px", marginTop: "20px", flexWrap: "wrap" }}>
        {templates.map(tpl => (
          <button
            key={tpl.key}
            onClick={() => runTemplate(tpl.key)}
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
        {templates.length === 0 && <span style={{ color: "#666" }}>Şablon bulunamadı</span>}
      </div>

      {/* Sonuçlar */}
      <div style={{ marginTop: "30px" }}>
        <h2>Sonuçlar</h2>
        {msg && <p>{msg}</p>}
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
                  <td>{r.change24h ?? "-"}</td>
                  <td>{r.volume24h ?? r.volume ?? "-"}</td>
                  <td>{r.score ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

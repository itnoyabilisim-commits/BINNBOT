// apps/admin/pages/system.js
import { useEffect, useState } from "react";

const GW = "http://localhost:8080";

const targets = [
  { key: "gateway",   name: "API Gateway", url: `${GW}/healthz` },
  { key: "scanner",   name: "Scanner",     url: "http://localhost:8091/healthz" },
  { key: "reporting", name: "Reporting",   url: "http://localhost:8092/healthz" },
  { key: "scheduler", name: "Scheduler",   url: "http://localhost:8093/healthz" },
  { key: "notifier",  name: "Notifier",    url: "http://localhost:8094/healthz" }
];

function withTimeout(p, ms = 2500) {
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
}

function ymd(d) { // YYYY-MM-DD
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export default function SystemAdmin() {
  const [rows, setRows] = useState(targets.map(t => ({ ...t, status: "unknown" })));
  const [checking, setChecking] = useState(false);

  // hızlı özet verileri
  const [exec24h, setExec24h] = useState(null); // sayı
  const [sum7d, setSum7d] = useState(null);     // { pnlTotal, winrate, maxDrawdown }

  async function checkAll() {
    setChecking(true);
    const next = await Promise.all(
      targets.map(async (t) => {
        try {
          const r = await withTimeout(fetch(t.url), 2500);
          return { ...t, status: r.ok ? "up" : "down" };
        } catch {
          return { ...t, status: "down" };
        }
      })
    );
    setRows(next);
    setChecking(false);
  }

  async function quickExecs24h() {
    // from: dün, to: bugün
    const today = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const qs = `?from=${ymd(yesterday)}&to=${ymd(today)}&limit=500`;
    try {
      const r = await fetch(`${GW}/reports/execs${qs}`, { headers: { Authorization: getAuth() } });
      const data = r.ok ? await r.json() : [];
      setExec24h(Array.isArray(data) ? data.length : 0);
    } catch { setExec24h(0); }
  }

  async function quickSummary7d() {
    const today = new Date();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const qs = `?from=${ymd(weekAgo)}&to=${ymd(today)}`;
    try {
      const r = await fetch(`${GW}/reports/summary${qs}`, { headers: { Authorization: getAuth() } });
      const data = r.ok ? await r.json() : null;
      setSum7d(data);
    } catch { setSum7d(null); }
  }

  function getAuth() {
    if (typeof window === "undefined") return "";
    const tok = localStorage.getItem("accessToken");
    return tok ? `Bearer ${tok}` : "";
  }

  useEffect(() => {
    checkAll(); // sayfa açılınca
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Sistem Durumu</h1>
      <p style={{ color: "#666" }}>(Yerelde servisler çalışmıyorsa bazıları “down” görünebilir.)</p>

      {/* Sağlık kontrolü */}
      <button
        onClick={checkAll}
        disabled={checking}
        style={{ background: "#F4B400", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}
      >
        {checking ? "Kontrol ediliyor..." : "Yeniden Kontrol Et"}
      </button>

      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%", marginTop: 16 }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>Servis</th><th>URL</th><th>Durum</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td>{r.name}</td>
              <td><code>{r.url}</code></td>
              <td style={{ color: r.status === "up" ? "green" : r.status === "down" ? "crimson" : "#666" }}>
                {r.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Hızlı özet butonları */}
      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={quickExecs24h}
          style={{ background: "#eee", border: "1px solid #ddd", padding: "8px 12px", borderRadius: 6, cursor: "pointer" }}
        >
          Son 24 Saat – Execs
        </button>
        <button
          onClick={quickSummary7d}
          style={{ background: "#eee", border: "1px solid #ddd", padding: "8px 12px", borderRadius: 6, cursor: "pointer" }}
        >
          Son 7 Gün – Summary
        </button>
        {/* Kısayol linkleri */}
        <a href="/reports" style={{ alignSelf: "center" }}>Raporlara Git</a>
      </div>

      {/* Hızlı özet sonuçları */}
      <div style={{ marginTop: 16 }}>
        {execs24h !== null && (
          <div style={{ marginBottom: 8 }}>
            <b>Son 24 Saat Execution Sayısı:</b> {execs24h}
          </div>
        )}
        {sum7d && !Array.isArray(sum7d) && (
          <div style={{ display: "flex", gap: 16 }}>
            <div><b>Toplam PnL:</b> ₺{sum7d.pnlTotal}</div>
            <div><b>Winrate:</b> {(sum7d.winrate * 100).toFixed(0)}%</div>
            <div><b>Max DD:</b> {(sum7d.maxDrawdown * 100).toFixed(0)}%</div>
          </div>
        )}
      </div>
    </div>
  );
}

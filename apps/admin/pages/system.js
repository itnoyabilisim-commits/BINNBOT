// apps/admin/pages/system.js
import { useEffect, useState } from "react";

const targets = [
  { key: "gateway",   name: "API Gateway", url: "http://localhost:8080/healthz" },
  { key: "scanner",   name: "Scanner",     url: "http://localhost:8091/healthz" },
  { key: "reporting", name: "Reporting",   url: "http://localhost:8092/healthz" },
  { key: "scheduler", name: "Scheduler",   url: "http://localhost:8093/healthz" },
  { key: "notifier",  name: "Notifier",    url: "http://localhost:8094/healthz" },
];

function withTimeout(promise, ms = 2500) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}

export default function SystemAdmin() {
  const [rows, setRows] = useState(targets.map(t => ({ ...t, status: "unknown" })));
  const [checking, setChecking] = useState(false);

  async function checkAll() {
    setChecking(true);
    const next = await Promise.all(
      targets.map(async (t) => {
        try {
          const r = await withTimeout(fetch(t.url), 2500);
          const ok = r.ok;
          return { ...t, status: ok ? "up" : "down" };
        } catch {
          return { ...t, status: "down" };
        }
      })
    );
    setRows(next);
    setChecking(false);
  }

  useEffect(() => {
    checkAll(); // sayfa açılınca bir kere dene
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Sistem Durumu</h1>
      <p style={{ color: "#666" }}>
        (Yerelde çalıştırırken durumlar doğru görünür. Servisler çalışmıyorsa “down” görünebilir.)
      </p>

      <button
        onClick={checkAll}
        disabled={checking}
        style={{ background: "#F4B400", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}
      >
        {checking ? "Kontrol ediliyor..." : "Yeniden Kontrol Et"}
      </button>

      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%", marginTop: 20 }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>Servis</th>
            <th>URL</th>
            <th>Durum</th>
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
    </div>
  );
}

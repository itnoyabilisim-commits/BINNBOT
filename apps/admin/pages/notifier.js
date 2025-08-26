// apps/admin/pages/notifier.js
import { useState } from "react";

const GW = "http://localhost:8080";

async function jpost(path, body) {
  const r = await fetch(`${GW}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization":
        typeof window !== "undefined"
          ? `Bearer ${localStorage.getItem("accessToken") || ""}`
          : ""
    },
    body: JSON.stringify(body || {})
  });
  const t = await r.text();
  try { return { ok: r.ok, status: r.status, json: t ? JSON.parse(t) : null }; }
  catch { return { ok: r.ok, status: r.status, json: { raw: t } }; }
}

export default function NotifierAdmin() {
  const [type, setType] = useState("email");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("BINNBOT Bildirim");
  const [msg, setMsg] = useState("Merhaba! Bu bir test mesajıdır.");
  const [resp, setResp] = useState(null);
  const [info, setInfo] = useState("");

  async function sendTest() {
    setInfo("Gönderiliyor...");
    const payload = { type, to, subject, msg };
    const r = await jpost("/notify", payload);
    setResp(r);
    setInfo("");
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Notifier (E-posta / SMS / Push)</h1>
      <p style={{ color: "#666" }}>
        Sağlayıcı URL’leri <code>EMAIL_WEBHOOK_URL / SMS_WEBHOOK_URL / PUSH_WEBHOOK_URL</code> olarak
        notifier servisine (.env) tanımlanmalıdır.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 760 }}>
        <div>
          <label>Tür</label><br />
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="email">email</option>
            <option value="sms">sms</option>
            <option value="push">push</option>
          </select>
        </div>

        <div>
          <label>Kime (to)</label><br />
          <input value={to} onChange={e => setTo(e.target.value)} placeholder="ornek@binnbot.com / +90555..." style={{ width: "100%" }}/>
        </div>

        {type === "email" && (
          <div style={{ gridColumn: "span 2" }}>
            <label>Konu (subject)</label><br />
            <input value={subject} onChange={e => setSubject(e.target.value)} style={{ width: "100%" }}/>
          </div>
        )}

        <div style={{ gridColumn: "span 2" }}>
          <label>Mesaj</label><br />
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4} style={{ width: "100%" }} />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={sendTest} style={{ background: "#F4B400", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}>
          Test Gönder
        </button>
        {info && <span style={{ marginLeft: 10 }}>{info}</span>}
      </div>

      <h3 style={{ marginTop: 16 }}>Son Yanıt</h3>
      <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 6 }}>
        {resp ? JSON.stringify(resp, null, 2) : "—"}
      </pre>
    </div>
  );
}

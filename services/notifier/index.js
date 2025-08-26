// services/notifier/index.js
import http from "http";

// Sağlayıcı uçları (webhook/HTTP adapter mantığı)
// Gerçek entegrasyon için bu URL'leri .env'den ver
const EMAIL_WEBHOOK_URL = process.env.EMAIL_WEBHOOK_URL || "";
const SMS_WEBHOOK_URL   = process.env.SMS_WEBHOOK_URL   || "";
const PUSH_WEBHOOK_URL  = process.env.PUSH_WEBHOOK_URL  || "";

const PORT = process.env.NOTIFIER_PORT || 8094;

function send(res, code, data, headers = {}) {
  const h = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", ...headers };
  res.writeHead(code, h);
  res.end(typeof data === "string" ? data : JSON.stringify(data));
}

async function callWebhook(url, payload) {
  if (!url) return { ok: false, status: 500, json: { code: "PROVIDER_MISSING", message: "Webhook yok" } };
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {})
    });
    const txt = await r.text();
    let json = null; try { json = txt ? JSON.parse(txt) : null; } catch { json = { raw: txt }; }
    return { ok: r.ok, status: r.status, json };
  } catch (e) {
    return { ok: false, status: 502, json: { code: "UPSTREAM_ERROR", message: String(e) } };
  }
}

const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  // health
  if (req.url === "/healthz" && req.method === "GET") {
    return send(res, 200, "ok");
  }

  // POST /notify  { type: "email"|"sms"|"push", to, subject?, msg, meta? }
  if (req.url === "/notify" && req.method === "POST") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", async () => {
      try {
        const p = JSON.parse(body || "{}");
        const type = (p.type || "email").toLowerCase();

        // payload normalizasyonu
        const payload = {
          to: p.to,
          subject: p.subject || (type === "email" ? "BINNBOT Bildirim" : undefined),
          message: p.msg || p.message || "",
          meta: p.meta || {}
        };

        let resp;
        if (type === "email") resp = await callWebhook(EMAIL_WEBHOOK_URL, payload);
        else if (type === "sms") resp = await callWebhook(SMS_WEBHOOK_URL, payload);
        else if (type === "push") resp = await callWebhook(PUSH_WEBHOOK_URL, payload);
        else resp = { ok: false, status: 400, json: { code: "BAD_REQUEST", message: "type geçersiz" } };

        return send(res, resp.ok ? resp.status : (resp.status || 502), resp.json || { ok: true });
      } catch {
        return send(res, 400, { code: "BAD_REQUEST", message: "invalid JSON" });
      }
    });
    return;
  }

  return send(res, 404, { code: "NOT_FOUND", message: "not found" });
});

server.listen(PORT, () => console.log(`notifier service on :${PORT}`));

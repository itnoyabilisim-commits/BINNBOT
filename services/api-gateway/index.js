import http from "http";
import { randomUUID } from "crypto";
import { readRobots, writeRobots } from "./storage.js";
import { login, verify, issueToken, verifyToken } from "./auth.js";
import { publishOrderRequested, sendExecutionToReporting } from "./events.js";

const SCANNER_URL   = process.env.SCANNER_URL   || "";
const REPORTING_URL = process.env.REPORTING_URL || "";

// ==== rate limit (dakikada N) ====
const RATE_LIMIT = Number(process.env.RATE_LIMIT || 60);
const WINDOW_MS  = 60_000;
const rlMap = new Map(); // ip -> { count, start }

function rateLimit(req, res) {
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString();
  const now = Date.now();
  const entry = rlMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) {
    entry.count = 0; entry.start = now;
  }
  entry.count += 1;
  rlMap.set(ip, entry);
  if (entry.count > RATE_LIMIT) {
    res.writeHead(429, {
      "Content-Type": "application/json",
      "Retry-After": "60",
      "Access-Control-Allow-Origin": "*"
    });
    res.end(JSON.stringify({ code: "RATE_LIMIT", message: "Too many requests, please retry later." }));
    return false;
  }
  return true;
}

// ==== yardımcılar ====
function send(res, code, data, headers = {}) {
  const h = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", ...headers };
  res.writeHead(code, h);
  res.end(typeof data === "string" ? data : JSON.stringify(data));
}

function parseBody(req, res, cb) {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    try { cb(JSON.parse(body || "{}")); }
    catch { send(res, 400, { code: "BAD_REQUEST", message: "invalid JSON" }); }
  });
}

async function safeFetch(url, init) {
  try {
    const r = await fetch(url, init);
    let json = null;
    const text = await r.text();
    try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
    if (!r.ok) return { ok: false, status: r.status, json: json || { code: "UPSTREAM_ERROR" } };
    return { ok: true, status: r.status, json };
  } catch (e) {
    return { ok: false, status: 502, json: { code: "UPSTREAM_ERROR", message: String(e) } };
  }
}

// CORS preflight
function preflight(req, res) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return true;
  }
  return false;
}

const server = http.createServer((req, res) => {
  if (preflight(req, res)) return;

  // ==== RATE LIMIT ====
  if (!rateLimit(req, res)) return;

  // SYSTEM
  if (req.url === "/healthz" && req.method === "GET") {
    res.writeHead(200); return res.end("ok");
  }

  // AUTH
  if (req.url === "/auth/login" && req.method === "POST") {
    return parseBody(req, res, ({ email, password }) => {
      try { return send(res, 200, login(email, password)); }
      catch (e) { return send(res, 400, { code: "BAD_REQUEST", message: e.message }); }
    });
  }

  if (req.url === "/auth/refresh" && req.method === "POST") {
    return parseBody(req, res, ({ refreshToken }) => {
      const payload = refreshToken ? verifyToken(refreshToken, "refresh") : null;
      if (!payload) return send(res, 401, { code: "UNAUTHORIZED", message: "invalid refresh token" });
      const accessToken = issueToken(payload.sub, 3600, "access");
      return send(res, 200, { accessToken, refreshToken, expiresIn: 3600 });
    });
  }

  // ROBOTS
  if (req.url === "/robots" && req.method === "GET") {
    const user = verify(req); if (!user) return send(res, 401, { code: "UNAUTHORIZED" });
    return send(res, 200, { items: readRobots() });
  }

  if (req.url === "/robots" && req.method === "POST") {
    const user = verify(req); if (!user) return send(res, 401, { code: "UNAUTHORIZED" });
    return parseBody(req, res, (body) => {
      if (!body.symbol) return send(res, 400, { code: "BAD_REQUEST", message: "symbol gerekli" });
      if (!["buy","sell","long","short"].includes(body.side)) return send(res, 400, { code: "BAD_REQUEST", message: "side hatalı" });
      if (body.market && !["spot","futures"].includes(body.market)) return send(res, 400, { code: "BAD_REQUEST", message: "market hatalı" });

      const r = {
        id: randomUUID(),
        name: body.name || "Robot",
        market: body.market || "spot",
        symbol: body.symbol,
        side: body.side,
        status: "active",
        schedule: body.schedule || { mode: "immediate" },
        params: body.params || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const list = readRobots(); list.push(r); writeRobots(list);

      publishOrderRequested({ robotId: r.id, symbol: r.symbol, side: r.side });

      sendExecutionToReporting({
        robotId: r.id,
        symbol: r.symbol,
        side: r.side,
        qty: 100,
        price: 42000,
        pnl: (Math.random() * 200 - 100).toFixed(2),
        ts: new Date().toISOString()
      });

      return send(res, 201, r);
    });
  }

// REPORTS /execs proxy (from/to query'lerini ileri taşı)
if (req.url.startsWith("/reports/execs") && req.method === "GET") {
  const user = verify(req); if (!user) return send(res, 401, { code: "UNAUTHORIZED" });
  if (REPORTING_URL) {
    (async () => {
      const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
      const r = await safeFetch(`${REPORTING_URL}/execs${qs}`);
      return send(res, r.ok ? r.status : 502, r.json);
    })();
  } else {
    return send(res, 200, []); // dummy boş liste
  }
  return;
}

  // REPORTS /summary proxy (from/to query'lerini ileri taşı)
  if (req.url.startsWith("/reports/summary") && req.method === "GET") {
    const user = verify(req); if (!user) return send(res, 401, { code: "UNAUTHORIZED" });
    if (REPORTING_URL) {
      (async () => {
        const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
        const r = await safeFetch(`${REPORTING_URL}/summary${qs}`);
        return send(res, r.ok ? r.status : 502, r.json);
      })();
    } else {
      return send(res, 200, {
        pnlTotal: 42031, winrate: 0.61, maxDrawdown: 0.22,
        pnlDaily: [{ date: "2025-08-01", pnl: 1200 }, { date: "2025-08-02", pnl: -340 }],
      });
    }
    return;
  }

  // SCANNER
  if (req.url === "/scanner/templates" && req.method === "GET") {
    const user = verify(req); if (!user) return send(res, 401, { code: "UNAUTHORIZED" });
    if (SCANNER_URL) {
      (async () => {
        const r = await safeFetch(`${SCANNER_URL}/templates`);
        return send(res, r.ok ? r.status : 502, r.json);
      })();
    } else {
      return send(res, 200, [
        { key: "trend-strong", name: "Güçlü Trend Coinler", market: "spot" },
        { key: "rsi-oversold", name: "RSI Düşük (Alım Fırsatı)", market: "spot" },
      ]);
    }
    return;
  }

  if (req.url === "/scanner/search" && req.method === "POST") {
    const user = verify(req); if (!user) return send(res, 401, { code: "UNAUTHORIZED" });
    if (SCANNER_URL) {
      return parseBody(req, res, async (body) => {
        const r = await safeFetch(`${SCANNER_URL}/search`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
        });
        return send(res, r.ok ? r.status : 502, r.json);
      });
    } else {
      return parseBody(req, res, (body) => {
        // gateway-dummy: scanner yoksa basit cevap
        return send(res, 200, [
          { symbol: "BTCUSDT", change24h: 0.034, volume24h: 250000000, score: 0.82 },
          { symbol: "ETHUSDT", change24h: 0.028, volume24h: 180000000, score: 0.74 },
        ]);
      });
    }
  }

  // fallback
  send(res, 404, "not found");
});

server.listen(8080, () => console.log("api-gateway running on :8080"));
